// RegisterRequestDTO.java
package com.agroconnect.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequestDTO {

    @NotBlank
    private String fullName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String role; // FARMER, BUYER, INPUT_SELLER

    private String state;

    private String businessName;

    private String phoneNumber;

    private String bio;
}