package com.agroconnect.controller;

import com.agroconnect.dto.FarmerProfileRequest;
import com.agroconnect.model.FarmerProfile;
import com.agroconnect.service.FarmerProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmers")
public class FarmerProfileController {
    private final FarmerProfileService farmerProfileService;
    public FarmerProfileController(FarmerProfileService s) { this.farmerProfileService = s; }

    @PostMapping("/profile/{userId}")
    public ResponseEntity<FarmerProfile> createOrUpdateProfile(@PathVariable Long userId, @RequestBody FarmerProfileRequest request) {
        return ResponseEntity.ok(farmerProfileService.createOrUpdateProfile(userId, request));
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<FarmerProfile> getProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(farmerProfileService.getProfile(userId));
    }
}
