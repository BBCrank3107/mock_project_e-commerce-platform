package com.ecommerce.modules.order.repository;
import com.ecommerce.modules.order.entity.CartItem;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.domain.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.*;
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCartIdOrderByProductIdAsc(Long cartId); void deleteByCartId(Long cartId);
}
