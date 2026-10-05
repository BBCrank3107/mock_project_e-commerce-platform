package com.ecommerce.modules.order.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity @Table(name = "shipping_info")
@Getter @Setter @NoArgsConstructor
public class ShippingInfo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long orderId;
    private String recipientName;
    private String phoneNumber;
    private String shippingAddress;
    private String city;
    private String trackingCode;
    private String shippingStatus;
    private Instant estimatedDelivery;
}
