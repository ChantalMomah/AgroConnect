// Product.java
package com.agroconnect.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Data
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(length = 2000)
    private String description;

    private BigDecimal pricePerUnit;

    private String unit;

    @Enumerated(EnumType.STRING)
    private ProductCategory category;

    private String state;

    @ElementCollection
@CollectionTable(
    name = "product_delivery_states",
    joinColumns = @JoinColumn(name = "product_id")
)
@Column(name = "delivery_state")
private List<String> deliveryStates;

    private String imageUrl;

    private Integer stockQuantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User seller;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum ProductCategory {
    VEGETABLES,
    FRUITS,
    GRAINS,
    ROOT_CROPS,
    LEGUMES,
    SEAFOOD,
    RED_MEAT,
    POULTRY,
    DAIRY,
    EGGS,
    SPICES,
    PROCESSED,
    SEEDS,
    FERTILIZER,
    ANIMAL_FEED,
    FARM_TOOLS
}
}
