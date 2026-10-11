package com.agroconnect.repository;

import com.agroconnect.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(Product.ProductCategory category);
    List<Product> findByState(String state);
    List<Product> findBySellerId(Long sellerId);
    List<Product> findByCategoryAndState(Product.ProductCategory category, String state);
    long count();
}