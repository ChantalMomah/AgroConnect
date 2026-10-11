package com.agroconnect.service;

import com.agroconnect.dto.OrderDTO;
import com.agroconnect.model.Order;

import java.util.List;

public interface OrderService {

    // Create a new order request
    Order createOrder(Long buyerId, OrderDTO request);

    // Get orders placed by a buyer
    List<Order> getOrdersByUser(Long userId);

    // Get all orders for a seller
    List<Order> getSellerOrders(Long sellerId);

    // Get seller's pending order requests
    List<Order> getPendingOrdersBySeller(Long sellerId);

    // Get seller's ongoing orders
    List<Order> getOngoingOrdersBySeller(Long sellerId);

    // Get seller's completed orders
    List<Order> getCompletedOrdersBySeller(Long sellerId);

    // Seller accepts, rejects, ships, or delivers an order
    Order updateOrderStatus(Long id, String status);

    // Number of completed orders for a seller
    int getCompletedOrdersCount(Long sellerId);

    void deleteOrder(Long id);
    void updateDeliveryInformation(Long id, String deliveryMethod, String deliveryAddress);
}