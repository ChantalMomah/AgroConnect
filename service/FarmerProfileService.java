package com.agroconnect.service;

import com.agroconnect.dto.FarmerProfileRequest;
import com.agroconnect.model.FarmerProfile;

public interface FarmerProfileService {
    FarmerProfile createOrUpdateProfile(Long userId, FarmerProfileRequest request);
    FarmerProfile getProfile(Long userId);
}
