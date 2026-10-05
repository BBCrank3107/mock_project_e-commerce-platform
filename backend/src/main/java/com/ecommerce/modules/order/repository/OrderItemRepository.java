package com.ecommerce.modules.order.repository;
import com.ecommerce.modules.order.entity.OrderItem;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.domain.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.*;
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderIdOrderByProductIdAsc(Long orderId);
}
