package com.ecommerce.modules.promotion_inventory.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity @Table(name = "inventory")
@Getter @Setter @NoArgsConstructor
public class Inventory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long productId;
    private Integer stockQuantity;
    private Integer lowStockThreshold;
    private Instant updatedAt;
}
