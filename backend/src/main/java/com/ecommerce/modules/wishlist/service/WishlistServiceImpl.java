package com.ecommerce.modules.wishlist.service;

import com.ecommerce.modules.auth_user.entity.User;
import com.ecommerce.modules.auth_user.repository.UserRepository;
import com.ecommerce.modules.catalog.dto.ProductDTO;
import com.ecommerce.modules.catalog.entity.Product;
import com.ecommerce.modules.catalog.repository.ProductRepository;
import com.ecommerce.modules.wishlist.dto.WishlistItemDTO;
import com.ecommerce.modules.wishlist.dto.WishlistToggleResponse;
import com.ecommerce.modules.wishlist.entity.Wishlist;
import com.ecommerce.modules.wishlist.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new RuntimeException("Vui lòng đăng nhập để sử dụng danh sách yêu thích");
        }
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistItemDTO> getMyWishlist() {
        User user = getCurrentUser();
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(w -> WishlistItemDTO.builder()
                        .id(w.getId())
                        .product(ProductDTO.from(w.getProduct()))
                        .createdAt(w.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getMyWishlistProductIds() {
        User user = getCurrentUser();
        return wishlistRepository.findProductIdsByUserId(user.getId());
    }

    @Override
    @Transactional
    public WishlistToggleResponse toggleWishlist(Long productId) {
        User user = getCurrentUser();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại: " + productId));

        Optional<Wishlist> existing = wishlistRepository.findByUserIdAndProductId(user.getId(), productId);
        if (existing.isPresent()) {
            wishlistRepository.delete(existing.get());
            return new WishlistToggleResponse(productId, false, "Đã xóa sản phẩm khỏi danh sách yêu thích");
        } else {
            Wishlist item = Wishlist.builder()
                    .user(user)
                    .product(product)
                    .build();
            wishlistRepository.save(item);
            return new WishlistToggleResponse(productId, true, "Đã thêm sản phẩm vào danh sách yêu thích");
        }
    }

    @Override
    @Transactional
    public void addToWishlist(Long productId) {
        User user = getCurrentUser();
        if (wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            return;
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại: " + productId));
        Wishlist item = Wishlist.builder()
                .user(user)
                .product(product)
                .build();
        wishlistRepository.save(item);
    }

    @Override
    @Transactional
    public void removeFromWishlist(Long productId) {
        User user = getCurrentUser();
        wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isInWishlist(Long productId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return false;
        }
        return userRepository.findByUsername(auth.getName())
                .map(user -> wishlistRepository.existsByUserIdAndProductId(user.getId(), productId))
                .orElse(false);
    }
}
