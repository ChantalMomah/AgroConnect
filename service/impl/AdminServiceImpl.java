package com.agroconnect.service.impl;

import com.agroconnect.dto.AdminDashboardDTO;
import com.agroconnect.dto.ChangePasswordRequest;
import com.agroconnect.dto.UpdateUserRequest;
import com.agroconnect.model.Complaint;
import com.agroconnect.dto.AdminComplaintDTO;
import com.agroconnect.model.Order;
import com.agroconnect.model.Product;
import com.agroconnect.model.User;
import com.agroconnect.repository.ComplaintRepository;
import com.agroconnect.repository.OrderRepository;
import com.agroconnect.repository.ProductRepository;
import com.agroconnect.repository.UserRepository;
import com.agroconnect.service.AdminService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ComplaintRepository complaintRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminServiceImpl(
            UserRepository userRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository,
            ComplaintRepository complaintRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.complaintRepository = complaintRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public AdminDashboardDTO getDashboardStats() {

        AdminDashboardDTO stats = new AdminDashboardDTO();

        stats.setTotalUsers(
                userRepository.count()
        );

        stats.setTotalFarmers(
                userRepository.countByRole(User.UserRole.FARMER)
        );

        stats.setTotalComplaints(
                complaintRepository.count()
        );

        stats.setTotalBuyers(
                userRepository.countByRole(User.UserRole.BUYER)
        );

        stats.setTotalInputSellers(
                userRepository.countByRole(User.UserRole.INPUT_SELLER)
        );

        stats.setTotalProducts(
                productRepository.count()
        );

        stats.setTotalOrders(
                orderRepository.count()
        );

        stats.setRecentUsers(
                userRepository.findTop5ByOrderByCreatedAtDesc()
        );

        return stats;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAllNonAdminUsers();
    }

    @Override
public List<Product> getAllProducts() {
    return productRepository.findAll();
}

@Override
public List<Order> getAllOrders() {
    return orderRepository.findAll();
}

@Override
@Transactional(readOnly = true)
public List<AdminComplaintDTO> getAllComplaints() {

    return complaintRepository
            .findAllByOrderByCreatedAtDesc()
            .stream()
            .map(complaint -> new AdminComplaintDTO(
                    complaint.getId(),
                    complaint.getUser().getFullName(),
                    complaint.getType().name(),
                    complaint.getMessage(),
                    complaint.getCreatedAt(),
                    complaint.getStatus().name()
            ))
            .toList();
}

@Override
@Transactional
public void updateComplaintStatus(
        Long id,
        Complaint.ComplaintStatus status) {

    Complaint complaint = complaintRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Complaint not found"));

    if (status == null) {
        throw new RuntimeException(
                "Complaint status is required."
        );
    }

    complaint.setStatus(status);

    complaintRepository.save(complaint);
}

    @Override
    public List<User> searchUsers(String query) {

        if (query == null || query.trim().isEmpty()) {
            return userRepository.findAllNonAdminUsers();
        }

        return userRepository.searchUsers(query.trim());
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (user.getRole() == User.UserRole.ADMIN) {
            throw new RuntimeException(
                    "The admin account cannot be deleted."
            );
        }

        List<Product> products =
                productRepository.findBySellerId(id);

        if (!products.isEmpty()) {
            throw new RuntimeException(
                    "This user cannot be deleted because they have products listed on AgroConnect."
            );
        }

        userRepository.delete(user);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        long orderCount =
                orderRepository.findByProductId(id).size();

        if (orderCount > 0) {
            throw new RuntimeException(
                    "This product cannot be deleted because it has existing orders."
            );
        }

        productRepository.delete(product);
    }

    @Override
    @Transactional
    public void deleteOrder(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        if (order.getStatus() == Order.OrderStatus.PAID ||
            order.getStatus() == Order.OrderStatus.SHIPPED ||
            order.getStatus() == Order.OrderStatus.DELIVERED) {

            throw new RuntimeException(
                    "Paid or completed orders cannot be deleted."
            );
        }

        orderRepository.delete(order);
    }

    @Override
@Transactional
public void deleteComplaint(Long id) {

    Complaint complaint = complaintRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Complaint not found"));

    complaintRepository.delete(complaint);
}

    @Override
    public User getAdminProfile(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (user.getRole() != User.UserRole.ADMIN) {
            throw new RuntimeException(
                    "This account is not an admin account."
            );
        }

        return user;
    }

    @Override
    public User updateAdminProfile(
            Long id,
            UpdateUserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (user.getRole() != User.UserRole.ADMIN) {
            throw new RuntimeException(
                    "This account is not an admin account."
            );
        }

        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setState(request.getState());
        user.setBio(request.getBio());

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void changeAdminPassword(
            Long id,
            ChangePasswordRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (user.getRole() != User.UserRole.ADMIN) {
            throw new RuntimeException(
                    "This account is not an admin account."
            );
        }

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

        if (!request.getNewPassword().equals(
                request.getConfirmPassword())) {

            throw new RuntimeException(
                    "New passwords do not match."
            );
        }

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {

            throw new RuntimeException(
                    "Current password is incorrect."
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        userRepository.save(user);
    }
}