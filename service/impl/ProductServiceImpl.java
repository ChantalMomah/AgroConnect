package com.agroconnect.service.impl;

import com.agroconnect.dto.ProductDTO;
import com.agroconnect.service.ProductService;
import com.agroconnect.model.Product;
import com.agroconnect.model.User;
import com.agroconnect.repository.ProductRepository;
import com.agroconnect.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.UUID;

@Service
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ProductServiceImpl(ProductRepository productRepository, UserRepository userRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

   @Override
public Product createProduct(
        Long sellerId,
        ProductDTO request,
        MultipartFile image
) {
        User seller = userRepository.findById(sellerId)
        .orElseThrow(() -> new RuntimeException("Seller not found"));

    Product product = new Product();

    mapRequestToProduct(product, request, seller);

    // Save uploaded image
    if (image != null && !image.isEmpty()) {

        try {

            Path uploadFolder =
                    Paths.get("uploads/products");

            Files.createDirectories(uploadFolder);

            String filename =
                    UUID.randomUUID() +
                    "_" +
                    image.getOriginalFilename();

            Path filePath =
                    uploadFolder.resolve(filename);

            image.transferTo(filePath);

            product.setImageUrl(
                    "/uploads/products/" + filename
            );

        }

        catch (IOException e) {

            throw new RuntimeException(
                    "Failed to upload image."
            );

        }

    }

    return productRepository.save(product);

}

    @Override
    public Product updateProduct(Long id, ProductDTO request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        mapRequestToProduct(product, request, product.getSeller());
        return productRepository.save(product);
    }

    @Override
    public void deleteProduct(Long id) { productRepository.deleteById(id); }

    @Override
    public List<Product> getAllProducts() { return productRepository.findAll(); }

    @Override
    public List<Product> getProductsByState(String state) { return productRepository.findByState(state); }

    @Override
    public Product getProductById(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    private void mapRequestToProduct(
        Product product,
        ProductDTO request,
        User seller
) {

    product.setName(request.getName());

    product.setDescription(request.getDescription());

    product.setPricePerUnit(request.getPricePerUnit());

    product.setUnit(request.getUnit());

    product.setCategory(
        Product.ProductCategory.valueOf(
            request.getCategory().toUpperCase()
        )
    );

    product.setState(request.getState());

    product.setStockQuantity(request.getStockQuantity());

    product.setSeller(seller);

    product.setDeliveryStates(request.getDeliveryStates());
}
}
