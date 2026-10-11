package com.agroconnect.service.impl;

import com.agroconnect.model.User;
import com.agroconnect.service.UserService;
import com.agroconnect.repository.UserRepository;
import com.agroconnect.dto.UpdateUserRequest;
import com.agroconnect.dto.ChangePasswordRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }


    // ==========================================
    // GET USER BY ID
    // ==========================================

    @Override
    public User getUserById(Long id) {

        return userRepository
                .findById(id)
                .orElseThrow(
                    () -> new RuntimeException("User not found")
                );
    }


    // ==========================================
    // GET ALL USERS
    // ==========================================

    @Override
    public List<User> getAllUsers() {

        return userRepository.findAll();
    }


    // ==========================================
    // UPDATE USER
    // ==========================================

    @Override
    public User updateUser(
            Long id,
            UpdateUserRequest request) {

        User user =
                userRepository
                    .findById(id)
                    .orElseThrow(
                        () -> new RuntimeException("User not found")
                    );

        user.setFullName(request.getFullName());

        user.setBusinessName(
                request.getBusinessName()
        );

        user.setPhoneNumber(
                request.getPhoneNumber()
        );

        user.setState(
                request.getState()
        );

        user.setBio(
                request.getBio()
        );

        user.setBankName(
                request.getBankName()
        );

        user.setAccountNumber(
                request.getAccountNumber()
        );

        user.setAccountName(
                request.getAccountName()
        );

        return userRepository.save(user);
    }


    // ==========================================
    // DELETE USER
    // ==========================================

    @Override
    public void deleteUser(Long id) {

        userRepository.deleteById(id);
    }


    // ==========================================
    // SEARCH USERS
    // ==========================================

    @Override
    public List<User> searchUsers(String query) {

        if (
            query == null ||
            query.trim().isEmpty()
        ) {

            return List.of();
        }

        return userRepository.searchUsers(
                query.trim()
        );
    }

    // ==========================================
// CHANGE PASSWORD
// ==========================================

@Override
public void changePassword(
        Long id,
        ChangePasswordRequest request) {

    User user = userRepository
            .findById(id)
            .orElseThrow(
                () -> new RuntimeException("User not found")
            );

    // Check that all password fields were provided
    if (request.getCurrentPassword() == null ||
        request.getCurrentPassword().isBlank()) {

        throw new RuntimeException(
            "Current password is required."
        );
    }

    if (request.getNewPassword() == null ||
        request.getNewPassword().isBlank()) {

        throw new RuntimeException(
            "New password is required."
        );
    }

    if (request.getConfirmPassword() == null ||
        request.getConfirmPassword().isBlank()) {

        throw new RuntimeException(
            "Please confirm your new password."
        );
    }

    // Check that the new passwords match
    if (!request.getNewPassword().equals(
            request.getConfirmPassword())) {

        throw new RuntimeException(
            "New passwords do not match."
        );
    }

    // Check current password
    if (!passwordEncoder.matches(
            request.getCurrentPassword(),
            user.getPassword())) {

        throw new RuntimeException(
            "Current password is incorrect."
        );
    }

    // Encrypt and save the new password
    user.setPassword(
        passwordEncoder.encode(
            request.getNewPassword()
        )
    );

    userRepository.save(user);
}

}