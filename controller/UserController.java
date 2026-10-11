package com.agroconnect.controller;

import com.agroconnect.dto.UpdateUserRequest;
import com.agroconnect.dto.UserSearchDTO;
import com.agroconnect.model.User;
import com.agroconnect.service.UserService;
import com.agroconnect.dto.ChangePasswordRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;


    public UserController(UserService userService) {
        this.userService = userService;
    }


    // ==========================================
    // SEARCH USERS
    // ==========================================

    @GetMapping("/search")
    public ResponseEntity<List<UserSearchDTO>> searchUsers(
            @RequestParam String query) {

        List<UserSearchDTO> results =
                userService
                    .searchUsers(query)
                    .stream()
                    .map(user ->
                        new UserSearchDTO(
                            user.getId(),
                            user.getFullName(),
                            user.getRole().name(),
                            user.getState(),
                            user.getBusinessName()
                        )
                    )
                    .toList();

        return ResponseEntity.ok(results);
    }


    // ==========================================
    // GET USER BY ID
    // ==========================================

    @GetMapping("/{id}")
    public User getUserById(
            @PathVariable Long id) {

        return userService.getUserById(id);
    }


    // ==========================================
    // GET ALL USERS
    // ==========================================

    @GetMapping
    public List<User> getAllUsers() {

        return userService.getAllUsers();
    }


    // ==========================================
    // UPDATE USER
    // ==========================================

    @PutMapping("/{id}")
    public User updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request) {

        return userService.updateUser(
                id,
                request
        );
    }


    // ==========================================
    // DELETE USER
    // ==========================================

    @DeleteMapping("/{id}")
    public void deleteUser(
            @PathVariable Long id) {

        userService.deleteUser(id);
    }

    // ==========================================
// CHANGE PASSWORD
// ==========================================

@PutMapping("/{id}/password")
public ResponseEntity<String> changePassword(
        @PathVariable Long id,
        @RequestBody ChangePasswordRequest request) {

    userService.changePassword(id, request);

    return ResponseEntity.ok(
        "Password changed successfully."
    );
}

}