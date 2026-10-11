package com.agroconnect.repository;

import com.agroconnect.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // Orders placed by a buyer
    List<Order> findByBuyerId(Long buyerId);

    // Orders for a specific product
    List<Order> findByProductId(Long productId);

    // All orders belonging to a seller
    List<Order> findByProductSellerId(Long sellerId);

    // Order requests waiting for seller action
    @Query("""
    SELECT o
    FROM Order o
    JOIN FETCH o.buyer
    JOIN FETCH o.product
    WHERE o.product.seller.id = :sellerId
    AND o.status IN (
        com.agroconnect.model.Order.OrderStatus.PENDING,
        com.agroconnect.model.Order.OrderStatus.ACCEPTED
    )
    ORDER BY o.createdAt DESC
""")
List<Order> findPendingOrdersBySellerId(
    @Param("sellerId") Long sellerId
);

    // Ongoing orders:
    // An order only becomes ongoing after payment.
    @Query("""
    SELECT o
    FROM Order o
    JOIN FETCH o.buyer
    JOIN FETCH o.product
    WHERE o.product.seller.id = :sellerId
    AND o.status IN (
    com.agroconnect.model.Order.OrderStatus.ACCEPTED,
    com.agroconnect.model.Order.OrderStatus.PAID,
    com.agroconnect.model.Order.OrderStatus.SHIPPED
)
    ORDER BY o.createdAt DESC
""")
    List<Order> findOngoingOrdersBySellerId(
        @Param("sellerId") Long sellerId
    );

    // Completed orders
   @Query("""
    SELECT o
    FROM Order o
    JOIN FETCH o.buyer
    JOIN FETCH o.product
    WHERE o.product.seller.id = :sellerId
    AND o.status = com.agroconnect.model.Order.OrderStatus.DELIVERED
    ORDER BY o.createdAt DESC
""")
    List<Order> findCompletedOrdersBySellerId(
        @Param("sellerId") Long sellerId
    );

    //Calculates how many units of a product are currently reserved.
     
    @Query("""
        SELECT COALESCE(SUM(o.quantity), 0)
        FROM Order o
        WHERE o.product.id = :productId
        AND o.status IN (
            com.agroconnect.model.Order.OrderStatus.ACCEPTED,
            com.agroconnect.model.Order.OrderStatus.PAID,
            com.agroconnect.model.Order.OrderStatus.SHIPPED
        )
    """)
    Integer getReservedQuantityForProduct(
        @Param("productId") Long productId
    );

    // Existing completed-order count functionality
    @Query("""
        SELECT o
        FROM Order o
        WHERE o.product.seller.id = :userId
        AND o.status = com.agroconnect.model.Order.OrderStatus.DELIVERED
    """)
    List<Order> findCompletedOrdersBySellerIdForCount(
        @Param("userId") Long userId
    );

    @Modifying
@Transactional
@Query("DELETE FROM Order o WHERE o.product.id = :productId")
void deleteByProductId(@Param("productId") Long productId);

    long count();
}