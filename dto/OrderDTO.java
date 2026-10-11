package com.agroconnect.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderDTO {

    @NotNull
    private Long productId;

    @NotNull
    private Integer quantity;

    private String deliveryMethod;

    private String deliveryAddress;
}