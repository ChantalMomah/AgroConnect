package com.agroconnect.service;

import com.agroconnect.dto.AdminDashboardDTO;
import com.agroconnect.model.Complaint;
import com.agroconnect.dto.AdminComplaintDTO;
import com.agroconnect.model.Order;
import com.agroconnect.model.Product;
import com.agroconnect.model.User;
import com.agroconnect.dto.ChangePasswordRequest;
import com.agroconnect.dto.UpdateUserRequest;

import java.util.List;

public interface AdminService {

    AdminDashboardDTO getDashboardStats();

    List<User> getAllUsers();

    List<Product> getAllProducts();

    List<Order> getAllOrders();

    List<AdminComplaintDTO> getAllComplaints();

    void updateComplaintStatus(
        Long id,
        Complaint.ComplaintStatus status
);

    List<User> searchUsers(String query);

    void deleteUser(Long id);

    void deleteProduct(Long id);

    void deleteOrder(Long id);

    void deleteComplaint(Long id);

    User getAdminProfile(Long id);

User updateAdminProfile(
        Long id,
        UpdateUserRequest request
);

void changeAdminPassword(
        Long id,
        ChangePasswordRequest request
);
}