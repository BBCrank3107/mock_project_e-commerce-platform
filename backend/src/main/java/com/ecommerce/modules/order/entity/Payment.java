package com.ecommerce.modules.order.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity @Table(name = "payments")
@Getter @Setter @NoArgsConstructor
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long orderId;
    private String paymentMethod;
    private String paymentStatus;
    private String transactionCode;
    private BigDecimal amount;
    private Instant paidAt;
}
