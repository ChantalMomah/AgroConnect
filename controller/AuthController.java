package com.agroconnect.controller;

import com.agroconnect.dto.AuthResponse;
import com.agroconnect.dto.LoginRequestDTO;
import com.agroconnect.dto.RegisterRequestDTO;
import com.agroconnect.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequestDTO request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequestDTO request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
