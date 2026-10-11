package com.agroconnect.service;

import com.agroconnect.dto.ProductDTO;
import com.agroconnect.model.Product;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface ProductService {
    Product createProduct(
        Long sellerId,
        ProductDTO request,
        MultipartFile image
);
    Product updateProduct(Long id, ProductDTO request);
    void deleteProduct(Long id);
    List<Product> getAllProducts();
    List<Product> getProductsByState(String state);
    Product getProductById(Long id);
}
