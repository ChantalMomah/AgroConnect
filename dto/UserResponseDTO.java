// UserResponseDTO.java
package com.agroconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponseDTO {
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private String state;
    private String businessName;
    private String phoneNumber;
    private String bio;
}
