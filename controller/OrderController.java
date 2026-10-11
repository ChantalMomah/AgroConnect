package com.agroconnect.controller;

import com.agroconnect.dto.OrderDTO;
import com.agroconnect.model.Order;
import com.agroconnect.service.OrderService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // ==========================================
    // CREATE ORDER
    // ==========================================

    @PostMapping("/create/{buyerId}")
    public ResponseEntity<Order> createOrder(
            @PathVariable Long buyerId,
            @RequestBody OrderDTO request) {

        return ResponseEntity.ok(
                orderService.createOrder(buyerId, request)
        );
    }

    // ==========================================
    // BUYER ORDERS
    // ==========================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                orderService.getOrdersByUser(userId)
        );
    }

    // ==========================================
    // ALL SELLER ORDERS
    // ==========================================

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Order>> getSellerOrders(
            @PathVariable Long sellerId) {

        return ResponseEntity.ok(
                orderService.getSellerOrders(sellerId)
        );
    }

    // ==========================================
    // ORDER REQUESTS
    // ==========================================

    @GetMapping("/seller/{sellerId}/requests")
    public ResponseEntity<List<Order>> getSellerOrderRequests(
            @PathVariable Long sellerId) {

        return ResponseEntity.ok(
                orderService.getPendingOrdersBySeller(sellerId)
        );
    }

    // ==========================================
    // ONGOING ORDERS
    // ==========================================

    @GetMapping("/seller/{sellerId}/ongoing")
    public ResponseEntity<List<Order>> getSellerOngoingOrders(
            @PathVariable Long sellerId) {

        return ResponseEntity.ok(
                orderService.getOngoingOrdersBySeller(sellerId)
        );
    }

    // ==========================================
    // COMPLETED ORDERS
    // ==========================================

    @GetMapping("/seller/{sellerId}/completed")
    public ResponseEntity<List<Order>> getSellerCompletedOrders(
            @PathVariable Long sellerId) {

        return ResponseEntity.ok(
                orderService.getCompletedOrdersBySeller(sellerId)
        );
    }

    // ==========================================
    // UPDATE ORDER STATUS
    // ==========================================

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(
                orderService.updateOrderStatus(id, status)
        );
    }

    // ==========================================
    // COMPLETED ORDER COUNT
    // ==========================================

    @GetMapping("/seller/{userId}/completed-count")
    public ResponseEntity<Integer> getCompletedOrdersBySeller(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                orderService.getCompletedOrdersCount(userId)
        );
    }

    // ==========================================
    // DELETE ORDER
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(
            @PathVariable Long id) {

        orderService.deleteOrder(id);

        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // UPDATE DELIVERY INFORMATION
    // ==========================================

    @PutMapping("/{id}/delivery")
    public ResponseEntity<?> updateDeliveryInformation(
            @PathVariable Long id,
            @RequestParam String deliveryMethod,
            @RequestParam(required = false) String deliveryAddress) {

        try {

            orderService.updateDeliveryInformation(
                    id,
                    deliveryMethod,
                    deliveryAddress
            );

            return ResponseEntity.ok(
                    "Delivery information updated successfully"
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}