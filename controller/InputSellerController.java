package com.agroconnect.controller;

import com.agroconnect.dto.InputSellerRequest;
import com.agroconnect.model.InputSellerProfile;
import com.agroconnect.service.InputSellerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/input-sellers")
public class InputSellerController {
    private final InputSellerService inputSellerService;
    public InputSellerController(InputSellerService s) { this.inputSellerService = s; }

    @PostMapping("/profile/{userId}")
    public ResponseEntity<InputSellerProfile> createOrUpdateProfile(@PathVariable Long userId, @RequestBody InputSellerRequest request) {
        return ResponseEntity.ok(inputSellerService.createOrUpdateProfile(userId, request));
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<InputSellerProfile> getProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(inputSellerService.getProfile(userId));
    }
}
