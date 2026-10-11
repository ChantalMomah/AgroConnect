package com.agroconnect.service.impl;

import com.agroconnect.dto.OrderDTO;
import com.agroconnect.model.Order;
import com.agroconnect.model.Product;
import com.agroconnect.model.User;
import com.agroconnect.repository.OrderRepository;
import com.agroconnect.repository.ProductRepository;
import com.agroconnect.repository.UserRepository;
import com.agroconnect.service.OrderService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderServiceImpl(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {

        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }


    // ==========================================
    // CREATE ORDER
    // ==========================================

    @Override
@Transactional
public Order createOrder(Long buyerId, OrderDTO request) {
    User buyer = userRepository.findById(buyerId)
            .orElseThrow(() -> new RuntimeException("Buyer not found"));

    Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new RuntimeException("Product not found"));

    if (request.getQuantity() == null || request.getQuantity() <= 0) {
        throw new RuntimeException("Quantity must be greater than zero");
    }

    int availableStock = product.getStockQuantity();

    if (request.getQuantity() > availableStock) {
        throw new RuntimeException(
                "Only " + availableStock + " unit(s) are currently available"
        );
    }

    Order order = new Order();

    order.setBuyer(buyer);
    order.setProduct(product);
    order.setQuantity(request.getQuantity());

    order.setTotalPrice(
            product.getPricePerUnit().multiply(
                    BigDecimal.valueOf(request.getQuantity())
            )
    );

    order.setStatus(Order.OrderStatus.PENDING);

    // DELIVERY INFORMATION
    if (request.getDeliveryMethod() != null) {
        try {
            Order.DeliveryMethod deliveryMethod =
                    Order.DeliveryMethod.valueOf(
                            request.getDeliveryMethod().toUpperCase()
                    );

            order.setDeliveryMethod(deliveryMethod);

            if (deliveryMethod == Order.DeliveryMethod.DELIVERY) {
                if (request.getDeliveryAddress() == null ||
                    request.getDeliveryAddress().trim().isEmpty()) {

                    throw new RuntimeException(
                            "Delivery address is required for delivery orders"
                    );
                }

                order.setDeliveryAddress(
                        request.getDeliveryAddress().trim()
                );
            } else {
                order.setDeliveryAddress(null);
            }

        } catch (IllegalArgumentException e) {
            throw new RuntimeException(
                    "Invalid delivery method: " + request.getDeliveryMethod()
            );
        }
    }

    return orderRepository.save(order);
}


    // ==========================================
    // BUYER ORDERS
    // ==========================================

    @Override
    public List<Order> getOrdersByUser(Long userId) {

        return orderRepository.findByBuyerId(userId);
    }


    // ==========================================
    // ALL SELLER ORDERS
    // ==========================================

    @Override
    public List<Order> getSellerOrders(Long sellerId) {

        return orderRepository.findByProductSellerId(
                sellerId
        );
    }


    // ==========================================
    // ORDER REQUESTS
    // ==========================================

    @Override
    public List<Order> getPendingOrdersBySeller(
            Long sellerId) {

        return orderRepository.findPendingOrdersBySellerId(
                sellerId
        );
    }


    // ==========================================
    // ONGOING ORDERS
    // ==========================================

    @Override
    public List<Order> getOngoingOrdersBySeller(
            Long sellerId) {

        return orderRepository.findOngoingOrdersBySellerId(
                sellerId
        );
    }


    // ==========================================
    // COMPLETED ORDERS
    // ==========================================

    @Override
    public List<Order> getCompletedOrdersBySeller(
            Long sellerId) {

        return orderRepository.findCompletedOrdersBySellerId(
                sellerId
        );
    }


    // ==========================================
    // UPDATE ORDER STATUS
    // ==========================================

    @Override
    @Transactional
    public Order updateOrderStatus(
            Long id,
            String status) {

        Order order =
                orderRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"
                                )
                        );


        Order.OrderStatus newStatus;

        try {

            newStatus =
                    Order.OrderStatus.valueOf(
                            status.toUpperCase()
                    );

        } catch (IllegalArgumentException e) {

            throw new RuntimeException(
                    "Invalid order status: " + status
            );
        }


        Order.OrderStatus currentStatus =
                order.getStatus();

        Product product =
                order.getProduct();


        // ==========================================
        // SELLER ACCEPTS ORDER
        // ==========================================

        if (newStatus ==
                Order.OrderStatus.ACCEPTED) {


            if (currentStatus !=
                    Order.OrderStatus.PENDING) {

                throw new RuntimeException(
                        "Only pending orders can be accepted"
                );
            }


            /*
             * The quantity is checked again at the exact
             * moment the seller accepts the order.
             *
             * This is important because another accepted
             * order may have reduced the available stock
             * after this buyer originally placed the request.
             */

            int availableStock =
                    product.getStockQuantity();


            if (order.getQuantity() >
                    availableStock) {

                throw new RuntimeException(
                        "Cannot accept this order. Only "
                        + availableStock
                        + " unit(s) are currently available."
                );
            }


            /*
             * RESERVE STOCK
             *
             * The seller has accepted the order, so the
             * requested quantity is removed from the
             * product's available stock.
             *
             * Example:
             *
             * Stock = 10
             * Order quantity = 5
             *
             * After acceptance:
             * Stock = 5
             */

            product.setStockQuantity(
                    availableStock -
                    order.getQuantity()
            );

            productRepository.save(product);


            order.setStatus(
                    Order.OrderStatus.ACCEPTED
            );


            return orderRepository.save(order);
        }


        // ==========================================
        // SELLER CANCELS / DENIES ORDER
        // ==========================================

        if (newStatus ==
                Order.OrderStatus.CANCELLED) {


            // ======================================
            // PENDING → CANCELLED
            // ======================================

            if (currentStatus ==
                    Order.OrderStatus.PENDING) {

                /*
                 * Nothing was reserved because the seller
                 * had not accepted the order.
                 *
                 * Therefore stock does not change.
                 */

                order.setStatus(
                        Order.OrderStatus.CANCELLED
                );

                return orderRepository.save(order);
            }


            // ======================================
            // ACCEPTED → CANCELLED
            // ======================================

            if (currentStatus ==
                    Order.OrderStatus.ACCEPTED) {


                /*
                 * Seller can only retract an accepted
                 * order after 24 hours.
                 */

                if (order.getCreatedAt()
                        .plusHours(24)
                        .isAfter(
                                java.time.LocalDateTime.now()
                        )) {

                    throw new RuntimeException(
                            "You can only cancel an accepted order after 24 hours."
                    );
                }


                /*
                 * RETURN RESERVED STOCK
                 *
                 * The quantity was removed from available
                 * stock when the seller accepted the order.
                 *
                 * Example:
                 *
                 * Before acceptance:
                 * Stock = 10
                 *
                 * Order quantity = 5
                 *
                 * After acceptance:
                 * Stock = 5
                 *
                 * Seller retracts:
                 * Stock = 10
                 */

                int restoredStock =
                        product.getStockQuantity()
                        + order.getQuantity();


                product.setStockQuantity(
                        restoredStock
                );

                productRepository.save(product);


                order.setStatus(
                        Order.OrderStatus.CANCELLED
                );


                return orderRepository.save(order);
            }


            throw new RuntimeException(
                    "This order cannot be cancelled."
            );
        }


        // ==========================================
        // BUYER PAYMENT CONFIRMED
        // ==========================================

        if (newStatus ==
                Order.OrderStatus.PAID) {


            if (currentStatus !=
                    Order.OrderStatus.ACCEPTED) {

                throw new RuntimeException(
                        "Only accepted orders can be marked as paid"
                );
            }


            /*
             * Stock was already reserved when the seller
             * accepted the order.
             *
             * Therefore DO NOT change stock here.
             */

            order.setStatus(
                    Order.OrderStatus.PAID
            );


            return orderRepository.save(order);
        }


        // ==========================================
        // SELLER MARKS ORDER SHIPPED
        // ==========================================

        if (newStatus ==
                Order.OrderStatus.SHIPPED) {


            if (currentStatus !=
                    Order.OrderStatus.PAID) {

                throw new RuntimeException(
                        "Only paid orders can be shipped"
                );
            }


            /*
             * Stock was already deducted when the order
             * was accepted.
             *
             * Therefore DO NOT change stock here.
             */

            order.setStatus(
                    Order.OrderStatus.SHIPPED
            );


            return orderRepository.save(order);
        }


        // ==========================================
        // SELLER MARKS ORDER DELIVERED
        // ==========================================

        if (newStatus ==
                Order.OrderStatus.DELIVERED) {


            if (currentStatus !=
                    Order.OrderStatus.SHIPPED) {

                throw new RuntimeException(
                        "Only shipped orders can be delivered"
                );
            }


            /*
             * The stock was already removed when the
             * seller accepted the order.
             *
             * Therefore DO NOT subtract stock again.
             */

            order.setStatus(
                    Order.OrderStatus.DELIVERED
            );


            return orderRepository.save(order);
        }


        // ==========================================
        // INVALID TRANSITION
        // ==========================================

        throw new RuntimeException(
                "Invalid order status transition from "
                        + currentStatus
                        + " to "
                        + newStatus
        );
    }


    // ==========================================
    // DELETE ORDER
    // ==========================================

    @Override
    @Transactional
    public void deleteOrder(Long id) {

        Order order =
                orderRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"
                                )
                        );


        Order.OrderStatus status =
                order.getStatus();


        // ==========================================
        // PAID / SHIPPED / DELIVERED
        // ==========================================

        if (status ==
                Order.OrderStatus.PAID ||
            status ==
                Order.OrderStatus.SHIPPED ||
            status ==
                Order.OrderStatus.DELIVERED) {

            throw new RuntimeException(
                    "Paid or completed orders cannot be deleted."
            );
        }


        // ==========================================
        // ACCEPTED ORDER
        // ==========================================

        if (status ==
                Order.OrderStatus.ACCEPTED) {


            /*
             * ACCEPTED orders have reserved stock.
             *
             * If the order is deleted, that reserved
             * quantity must become available again.
             */

            Product product =
                    order.getProduct();


            int restoredStock =
                    product.getStockQuantity()
                    + order.getQuantity();


            product.setStockQuantity(
                    restoredStock
            );


            productRepository.save(product);
        }


        /*
         * PENDING orders have no reserved stock,
         * so nothing needs to be returned.
         */

        orderRepository.delete(order);
    }


    // ==========================================
    // COMPLETED ORDER COUNT
    // ==========================================

    @Override
    public int getCompletedOrdersCount(
            Long sellerId) {

        return orderRepository
                .findCompletedOrdersBySellerId(
                        sellerId
                )
                .size();
    }
    @Override
@Transactional
public void updateDeliveryInformation(
        Long id,
        String deliveryMethod,
        String deliveryAddress) {

    Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found"));

    Order.DeliveryMethod method;

    try {
        method = Order.DeliveryMethod.valueOf(
                deliveryMethod.toUpperCase()
        );
    } catch (IllegalArgumentException e) {
        throw new RuntimeException(
                "Invalid delivery method: " + deliveryMethod
        );
    }

    if (method == Order.DeliveryMethod.DELIVERY) {

        if (deliveryAddress == null ||
            deliveryAddress.trim().isEmpty()) {

            throw new RuntimeException(
                    "Delivery address is required for delivery orders"
            );
        }

        order.setDeliveryMethod(method);
        order.setDeliveryAddress(deliveryAddress.trim());

    } else {

        order.setDeliveryMethod(method);
        order.setDeliveryAddress(null);
    }

    orderRepository.save(order);
}
}