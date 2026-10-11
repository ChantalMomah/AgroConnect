package com.agroconnect.service;

import com.agroconnect.dto.AuthResponse;
import com.agroconnect.dto.LoginRequestDTO;
import com.agroconnect.dto.RegisterRequestDTO;

public interface AuthService {
    AuthResponse register(RegisterRequestDTO request);
    AuthResponse login(LoginRequestDTO request);
}
