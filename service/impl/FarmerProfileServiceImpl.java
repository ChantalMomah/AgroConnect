// FarmerProfileServiceImpl.java
package com.agroconnect.service.impl;

import com.agroconnect.dto.FarmerProfileRequest;
import com.agroconnect.model.FarmerProfile;
import com.agroconnect.service.FarmerProfileService;
import com.agroconnect.model.User;
import com.agroconnect.repository.FarmerProfileRepository;
import com.agroconnect.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class FarmerProfileServiceImpl implements FarmerProfileService {

    private final FarmerProfileRepository farmerProfileRepository;
    private final UserRepository userRepository;

    public FarmerProfileServiceImpl(FarmerProfileRepository farmerProfileRepository, UserRepository userRepository) {
        this.farmerProfileRepository = farmerProfileRepository;
        this.userRepository = userRepository;
    }

    @Override
    public FarmerProfile createOrUpdateProfile(Long userId, FarmerProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FarmerProfile profile = farmerProfileRepository.findByUserId(userId)
                .orElse(new FarmerProfile());

        profile.setUser(user);
        profile.setFarmSize(request.getFarmSize());
        profile.setPrimaryCrops(request.getPrimaryCrops());

        return farmerProfileRepository.save(profile);
    }

    @Override
    public FarmerProfile getProfile(Long userId) {
        return farmerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }
}
