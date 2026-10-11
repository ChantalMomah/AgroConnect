package com.agroconnect.service.impl;

import com.agroconnect.dto.AuthResponse;
import com.agroconnect.dto.LoginRequestDTO;
import com.agroconnect.dto.RegisterRequestDTO;
import com.agroconnect.model.User;
import com.agroconnect.repository.UserRepository;
import com.agroconnect.security.JwtUtil;
import com.agroconnect.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public AuthResponse register(RegisterRequestDTO request) {

        System.out.println("Phone: " + request.getPhoneNumber());
System.out.println("State: " + request.getState());
System.out.println("Business: " + request.getBusinessName());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        // Business name is required for sellers
if (
    ("FARMER".equalsIgnoreCase(request.getRole()) ||
     "INPUT_SELLER".equalsIgnoreCase(request.getRole()))
    &&
    (request.getBusinessName() == null ||
     request.getBusinessName().isBlank())
) {
    throw new RuntimeException(
        "Business name is required for farmers and input sellers."
    );
}

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.UserRole.valueOf(request.getRole().toUpperCase()));
        user.setState(request.getState());
        user.setBusinessName(request.getBusinessName());
        user.setPhoneNumber(request.getPhoneNumber());
        
        user.setBio(request.getBio());

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user);
    }

    @Override
    public AuthResponse login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user);
    }
}
