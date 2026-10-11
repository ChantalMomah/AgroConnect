package com.agroconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserSearchDTO {

    private Long id;

    private String fullName;

    private String role;

    private String state;

    private String businessName;

}