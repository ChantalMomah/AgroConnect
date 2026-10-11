package com.agroconnect.controller;

import com.agroconnect.dto.AdminComplaintDTO;
import com.agroconnect.dto.AdminDashboardDTO;
import com.agroconnect.dto.ChangePasswordRequest;
import com.agroconnect.dto.UpdateUserRequest;
import com.agroconnect.model.Order;
import com.agroconnect.model.Product;
import com.agroconnect.model.User;
import com.agroconnect.model.Complaint;
import com.agroconnect.dto.AdminComplaintDTO;
import com.agroconnect.service.AdminService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ==========================================
    // DASHBOARD
    // ==========================================

    @GetMapping("/dashboard")
    public AdminDashboardDTO getDashboardStats() {
        return adminService.getDashboardStats();
    }


    // ==========================================
    // ADMIN PROFILE
    // ==========================================

    @GetMapping("/profile/{id}")
    public ResponseEntity<User> getAdminProfile(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                adminService.getAdminProfile(id)
        );
    }


    @PutMapping("/profile/{id}")
    public ResponseEntity<User> updateAdminProfile(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request) {

        return ResponseEntity.ok(
                adminService.updateAdminProfile(
                        id,
                        request
                )
        );
    }


    @PutMapping("/profile/{id}/password")
    public ResponseEntity<String> changeAdminPassword(
            @PathVariable Long id,
            @RequestBody ChangePasswordRequest request) {

        adminService.changeAdminPassword(
                id,
                request
        );

        return ResponseEntity.ok(
                "Password changed successfully."
        );
    }


    // ==========================================
    // USERS
    // ==========================================

    @GetMapping("/users")
    public List<User> getUsers() {
        return adminService.getAllUsers();
    }


    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id) {

        adminService.deleteUser(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/search")
public ResponseEntity<List<User>> searchUsers(
        @RequestParam String query) {

    return ResponseEntity.ok(
            adminService.searchUsers(query)
    );
}

    // ==========================================
    // PRODUCTS
    // ==========================================

    @GetMapping("/products")
    public List<Product> getProducts() {
        return adminService.getAllProducts();
    }


    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id) {

        adminService.deleteProduct(id);

        return ResponseEntity.noContent().build();
    }


    // ==========================================
    // ORDERS
    // ==========================================

    @GetMapping("/orders")
    public List<Order> getOrders() {
        return adminService.getAllOrders();
    }


    @DeleteMapping("/orders/{id}")
    public ResponseEntity<Void> deleteOrder(
            @PathVariable Long id) {

        adminService.deleteOrder(id);

        return ResponseEntity.noContent().build();
    }

    // ==========================================
// COMPLAINTS & SUGGESTIONS
// ==========================================

@GetMapping("/complaints")
public List<AdminComplaintDTO> getComplaints() {
    return adminService.getAllComplaints();
}

@PutMapping("/complaints/{id}/status")
public ResponseEntity<String> updateComplaintStatus(
        @PathVariable Long id,
        @RequestParam Complaint.ComplaintStatus status) {

    adminService.updateComplaintStatus(id, status);

    return ResponseEntity.ok(
            "Complaint status updated successfully."
    );
}

@DeleteMapping("/complaints/{id}")
public ResponseEntity<Void> deleteComplaint(
        @PathVariable Long id) {

    adminService.deleteComplaint(id);

    return ResponseEntity.noContent().build();
}

}