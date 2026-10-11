package com.agroconnect.service;

import com.agroconnect.model.User;
import com.agroconnect.dto.UpdateUserRequest;
import com.agroconnect.dto.ChangePasswordRequest;

import java.util.List;

public interface UserService {

    User getUserById(Long id);

    List<User> getAllUsers();

    User updateUser(Long id, UpdateUserRequest request);

    void deleteUser(Long id);

    List<User> searchUsers(String query);

    void changePassword(Long id, ChangePasswordRequest request);
}