package com.agroconnect.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductDTO {

    @NotNull
    private String name;

    private String description;

    @NotNull
    private BigDecimal pricePerUnit;

    @NotNull
    private String unit;

    @NotNull
    private String category;

    @NotNull
    private String state;

    private String imageUrl;

    @NotNull
    private Integer stockQuantity;

    private List<String> deliveryStates;
}