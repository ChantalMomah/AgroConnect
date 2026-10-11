package com.agroconnect.controller;

import com.agroconnect.dto.ProductDTO;
import com.agroconnect.model.Product;
import com.agroconnect.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;
    public ProductController(ProductService productService) { this.productService = productService; }

    @PostMapping(
        value = "/create/{sellerId}",
        consumes = "multipart/form-data"
)
public ResponseEntity<Product> createProduct(

        @PathVariable Long sellerId,

        @RequestPart("product")
        ProductDTO product,

        @RequestPart(value = "image", required = false)
        MultipartFile image

) {

    return ResponseEntity.ok(

            productService.createProduct(
                    sellerId,
                    product,
                    image
            )

    );

}

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() { 
        return ResponseEntity.ok(productService.getAllProducts()); 
    }

    @GetMapping("/{id}")
public ResponseEntity<Product> getProductById(
        @PathVariable Long id
) {

    return ResponseEntity.ok(
        productService.getProductById(id)
    );

}

    @GetMapping("/state/{state}")
    public ResponseEntity<List<Product>> getProductsByState(@PathVariable String state) {
        return ResponseEntity.ok(productService.getProductsByState(state));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody ProductDTO request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
