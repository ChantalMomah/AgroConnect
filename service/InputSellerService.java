package com.agroconnect.service;

import com.agroconnect.dto.InputSellerRequest;
import com.agroconnect.model.InputSellerProfile;

public interface InputSellerService {
    InputSellerProfile createOrUpdateProfile(Long userId, InputSellerRequest request);
    InputSellerProfile getProfile(Long userId);
}
