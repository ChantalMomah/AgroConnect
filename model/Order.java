package com.agroconnect.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    @JsonIgnoreProperties({
        "hibernateLazyInitializer",
        "handler",
        "password"
    })
    private User buyer;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({
        "hibernateLazyInitializer",
        "handler"
    })
    private Product product;


    private Integer quantity;


    private BigDecimal totalPrice;


    @Enumerated(EnumType.STRING)
    private OrderStatus status;


    // ==========================================
    // DELIVERY INFORMATION
    // ==========================================

    @Enumerated(EnumType.STRING)
    private DeliveryMethod deliveryMethod;


    @Column(columnDefinition = "TEXT")
    private String deliveryAddress;


    @CreationTimestamp
    private LocalDateTime createdAt;


    public enum OrderStatus {
        PENDING,
        ACCEPTED,
        PAID,
        SHIPPED,
        DELIVERED,
        CANCELLED
    }


    public enum DeliveryMethod {
        DELIVERY,
        PICKUP
    }
}