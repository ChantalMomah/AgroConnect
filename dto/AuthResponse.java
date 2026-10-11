package com.agroconnect.dto;

import com.agroconnect.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {

    private String token;

    private User user;

}