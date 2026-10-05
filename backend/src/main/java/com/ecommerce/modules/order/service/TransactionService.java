package com.ecommerce.modules.order.service;

import com.ecommerce.common.dto.PageResponse;
import com.ecommerce.modules.auth_user.entity.User;
import com.ecommerce.modules.auth_user.repository.UserRepository;
import com.ecommerce.modules.catalog.entity.Product;
import com.ecommerce.modules.catalog.repository.ProductRepository;
import com.ecommerce.modules.order.dto.TransactionDtos.*;
import com.ecommerce.modules.order.entity.*;
import com.ecommerce.modules.order.repository.*;
import com.ecommerce.modules.promotion_inventory.entity.Inventory;
import com.ecommerce.modules.promotion_inventory.repository.InventoryRepository;
import com.ecommerce.modules.promotion_inventory.service.PromotionService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Service @RequiredArgsConstructor @Transactional
public class TransactionService {
    private final UserRepository users;
    private final ProductRepository products;
    private final CartRepository carts;
    private final CartItemRepository cartItems;
    private final OrderRepository orders;
    private final OrderItemRepository orderItems;
    private final PaymentRepository payments;
    private final ShippingInfoRepository shipping;
    private final InventoryRepository inventory;
    private final PromotionService promotions;
    private final EntityManager entityManager;

    private TransactionException bad(String message) { return new TransactionException(HttpStatus.BAD_REQUEST, message); }
    private TransactionException missing(String message) { return new TransactionException(HttpStatus.NOT_FOUND, message); }

    private User currentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal()))
            throw new TransactionException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập");
        return users.findByUsername(auth.getName()).filter(u -> Boolean.TRUE.equals(u.getIsActive()))
            .orElseThrow(() -> new TransactionException(HttpStatus.UNAUTHORIZED, "Tài khoản không hợp lệ"));
    }

    // Serialize cart mutations and checkout for each user, including first cart creation.
    private Cart lockedCart() {
        var user = currentUser();
        entityManager.lock(user, LockModeType.PESSIMISTIC_WRITE);
        return carts.findByUserId(user.getId()).orElseGet(() -> {
            var cart = new Cart();
            cart.setUserId(user.getId());
            cart.setCreatedAt(Instant.now());
            cart.setUpdatedAt(Instant.now());
            return carts.saveAndFlush(cart);
        });
    }

    private Product activeProduct(Long id) {
        return products.findById(id).filter(p -> Boolean.TRUE.equals(p.getIsActive()))
            .orElseThrow(() -> bad("Sản phẩm không còn được bán"));
    }

    private BigDecimal price(Product p) {
        return p.getDiscountPrice() != null && p.getDiscountPrice().compareTo(p.getPrice()) < 0
            ? p.getDiscountPrice() : p.getPrice();
    }

    private int stock(Long productId) {
        return inventory.findByProductId(productId).map(Inventory::getStockQuantity).orElse(0);
    }

    private void checkQuantity(int quantity, Long productId) {
        if (quantity < 1 || quantity > 999) throw bad("Số lượng phải từ 1 đến 999");
        if (quantity > stock(productId)) throw bad("Số lượng vượt quá tồn kho");
    }

    private CartView cartView(Cart cart) {
        var lines = cartItems.findByCartIdOrderByProductIdAsc(cart.getId()).stream().map(item -> {
            var p = products.findById(item.getProductId()).orElseThrow(() -> missing("Không tìm thấy sản phẩm"));
            var unit = price(p);
            return new CartLine(item.getId(), p.getId(), p.getName(), p.getThumbnailUrl(), item.getQuantity(),
                unit, unit.multiply(BigDecimal.valueOf(item.getQuantity())), Boolean.TRUE.equals(p.getIsActive()) ? stock(p.getId()) : 0);
        }).toList();
        return new CartView(cart.getId(), lines, lines.stream().map(CartLine::totalPrice).reduce(BigDecimal.ZERO, BigDecimal::add),
            lines.stream().mapToInt(CartLine::quantity).sum());
    }

    public CartView getCart() { return cartView(lockedCart()); }

    public CartView addItem(AddItem request) {
        var cart = lockedCart();
        var product = activeProduct(request.productId());
        var item = cartItems.findByCartIdOrderByProductIdAsc(cart.getId()).stream()
            .filter(i -> i.getProductId().equals(product.getId())).findFirst().orElseGet(() -> {
                var i = new CartItem(); i.setCartId(cart.getId()); i.setProductId(product.getId()); i.setQuantity(0); return i;
            });
        int quantity = item.getQuantity() + request.quantity();
        checkQuantity(quantity, product.getId());
        item.setQuantity(quantity); item.setPrice(price(product));
        cartItems.saveAndFlush(item); cart.setUpdatedAt(Instant.now());
        return cartView(cart);
    }

    private CartItem ownedItem(Cart cart, Long id) {
        return cartItems.findById(id).filter(i -> i.getCartId().equals(cart.getId()))
            .orElseThrow(() -> missing("Không tìm thấy sản phẩm trong giỏ hàng"));
    }

    public CartView updateItem(Long id, Quantity request) {
        var cart = lockedCart(); var item = ownedItem(cart, id);
        var product = activeProduct(item.getProductId());
        checkQuantity(request.quantity(), product.getId());
        item.setQuantity(request.quantity()); item.setPrice(price(product));
        cartItems.saveAndFlush(item); cart.setUpdatedAt(Instant.now());
        return cartView(cart);
    }

    public CartView deleteItem(Long id) {
        var cart = lockedCart();
        cartItems.delete(ownedItem(cart, id)); cartItems.flush(); cart.setUpdatedAt(Instant.now());
        return cartView(cart);
    }

    public CouponView applyCoupon(String code) {
        var cart = getCart();
        if (cart.items().isEmpty()) throw bad("Giỏ hàng đang trống");
        return promotions.apply(code, cart.subtotal());
    }

    @Transactional(readOnly = true)
    public InventoryView getInventory(Long id) {
        currentUser();
        if (!products.existsById(id)) throw missing("Không tìm thấy sản phẩm");
        return new InventoryView(id, stock(id));
    }

    public OrderView checkout(Checkout request) {
        var cart = lockedCart();
        var items = cartItems.findByCartIdOrderByProductIdAsc(cart.getId());
        if (items.isEmpty()) throw bad("Giỏ hàng đang trống");
        var order = new com.ecommerce.modules.order.entity.Order();
        order.setUserId(cart.getUserId());
        order.setOrderCode("ORD-" + UUID.randomUUID().toString().replace("-", "").toUpperCase(Locale.ROOT));
        order.setStatus("PENDING"); order.setNotes(request.notes());
        order.setCreatedAt(Instant.now()); order.setUpdatedAt(Instant.now());
        var lines = new ArrayList<OrderItem>();
        var subtotal = BigDecimal.ZERO;
        // Stable product order avoids deadlocks between concurrent checkouts/cancellations.
        for (var item : items) {
            var inv = inventory.findLockedByProductId(item.getProductId()).orElseThrow(() -> bad("Sản phẩm đã hết hàng"));
            var product = activeProduct(item.getProductId());
            if (item.getQuantity() > inv.getStockQuantity()) throw bad("Không đủ tồn kho cho " + product.getName());
            inv.setStockQuantity(inv.getStockQuantity() - item.getQuantity()); inv.setUpdatedAt(Instant.now());
            var line = new OrderItem(); line.setProductId(product.getId()); line.setQuantity(item.getQuantity());
            line.setUnitPrice(price(product)); line.setTotalPrice(line.getUnitPrice().multiply(BigDecimal.valueOf(line.getQuantity())));
            lines.add(line); subtotal = subtotal.add(line.getTotalPrice());
        }
        var coupon = request.couponCode() == null || request.couponCode().isBlank() ? null : promotions.apply(request.couponCode(), subtotal);
        order.setPromotionId(coupon == null ? null : coupon.promotionId()); order.setTotalAmount(subtotal);
        order.setDiscountAmount(coupon == null ? BigDecimal.ZERO : coupon.discountAmount());
        order.setFinalAmount(subtotal.subtract(order.getDiscountAmount()));
        orders.saveAndFlush(order);
        for (var line : lines) { line.setOrderId(order.getId()); orderItems.save(line); }
        var payment = new Payment(); payment.setOrderId(order.getId()); payment.setAmount(order.getFinalAmount());
        payment.setPaymentMethod(request.paymentMethod()); payment.setPaymentStatus("PENDING"); payments.save(payment);
        var info = new ShippingInfo(); info.setOrderId(order.getId()); info.setRecipientName(request.recipientName().trim());
        info.setPhoneNumber(request.phone().trim()); info.setShippingAddress(request.address().trim()); info.setCity(request.city().trim());
        info.setShippingStatus("PREPARING"); shipping.save(info);
        cartItems.deleteByCartId(cart.getId()); cart.setUpdatedAt(Instant.now());
        return orderView(order);
    }

    private Pageable pageable(int page, int size) {
        if (page < 0 || size < 1 || size > 100) throw bad("Phân trang không hợp lệ (size: 1-100)");
        return PageRequest.of(page, size, Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")));
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderView> myOrders(int page, int size) {
        return PageResponse.from(orders.findByUserId(currentUser().getId(), pageable(page, size)).map(this::orderView));
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderView> adminOrders(String status, int page, int size) {
        var paging = pageable(page, size);
        if (status != null && !status.isBlank() && !Set.of("PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED").contains(status))
            throw bad("Trạng thái không hợp lệ");
        return PageResponse.from((status == null || status.isBlank() ? orders.findAll(paging) : orders.findByStatus(status, paging)).map(this::orderView));
    }

    @Transactional(readOnly = true)
    public OrderView detail(Long id, boolean admin) {
        var user = currentUser();
        var order = orders.findById(id).orElseThrow(() -> missing("Không tìm thấy đơn hàng"));
        if (!admin && !order.getUserId().equals(user.getId())) throw missing("Không tìm thấy đơn hàng");
        return orderView(order);
    }

    public OrderView cancel(Long id) {
        var user = currentUser();
        var order = orders.findLockedById(id).orElseThrow(() -> missing("Không tìm thấy đơn hàng"));
        if (!order.getUserId().equals(user.getId())) throw missing("Không tìm thấy đơn hàng");
        return transition(order, "CANCELLED");
    }

    public OrderView changeStatus(Long id, String status) {
        var order = orders.findLockedById(id).orElseThrow(() -> missing("Không tìm thấy đơn hàng"));
        return transition(order, status);
    }

    private OrderView transition(com.ecommerce.modules.order.entity.Order order, String next) {
        var current = order.getStatus();
        if (current.equals(next)) return orderView(order);
        var allowed = switch (current) {
            case "PENDING" -> Set.of("CONFIRMED", "CANCELLED");
            case "CONFIRMED" -> Set.of("SHIPPING", "CANCELLED");
            case "SHIPPING" -> Set.of("COMPLETED");
            default -> Set.<String>of();
        };
        if (!allowed.contains(next)) throw bad("Không thể chuyển trạng thái từ " + current + " sang " + next);
        var payment = payments.findByOrderId(order.getId()).orElseThrow(() -> missing("Thiếu thông tin thanh toán"));
        var info = shipping.findByOrderId(order.getId()).orElseThrow(() -> missing("Thiếu thông tin giao hàng"));
        if ("CANCELLED".equals(next)) {
            for (var line : orderItems.findByOrderIdOrderByProductIdAsc(order.getId())) {
                var inv = inventory.findLockedByProductId(line.getProductId()).orElseThrow(() -> bad("Thiếu bản ghi tồn kho"));
                inv.setStockQuantity(Math.addExact(inv.getStockQuantity(), line.getQuantity())); inv.setUpdatedAt(Instant.now());
            }
            payment.setPaymentStatus("FAILED"); info.setShippingStatus("RETURNED");
        } else if ("SHIPPING".equals(next)) info.setShippingStatus("IN_TRANSIT");
        else if ("COMPLETED".equals(next)) {
            info.setShippingStatus("DELIVERED"); payment.setPaymentStatus("COMPLETED"); payment.setPaidAt(Instant.now());
        }
        order.setStatus(next); order.setUpdatedAt(Instant.now());
        return orderView(order);
    }

    private OrderView orderView(com.ecommerce.modules.order.entity.Order order) {
        var lines = orderItems.findByOrderIdOrderByProductIdAsc(order.getId()).stream().map(i -> {
            var p = products.findById(i.getProductId()).orElseThrow(() -> missing("Thiếu sản phẩm của đơn hàng"));
            return new OrderLine(p.getId(), p.getName(), p.getThumbnailUrl(), i.getQuantity(), i.getUnitPrice(), i.getTotalPrice());
        }).toList();
        var info = shipping.findByOrderId(order.getId()).map(s -> new ShippingView(s.getRecipientName(), s.getPhoneNumber(), s.getShippingAddress(), s.getCity(), s.getShippingStatus())).orElse(null);
        var payment = payments.findByOrderId(order.getId()).map(p -> new PaymentView(p.getPaymentMethod(), p.getPaymentStatus(), p.getAmount())).orElse(null);
        var name = users.findById(order.getUserId()).map(User::getFullName).orElse("");
        return new OrderView(order.getId(), order.getOrderCode(), order.getUserId(), name, order.getTotalAmount(), order.getDiscountAmount(),
            order.getFinalAmount(), order.getStatus(), order.getNotes(), order.getCreatedAt(), lines, info, payment);
    }
}
