// InputSellerServiceImpl.java
package com.agroconnect.service.impl;

import com.agroconnect.dto.InputSellerRequest;
import com.agroconnect.model.InputSellerProfile;
import com.agroconnect.service.InputSellerService;
import com.agroconnect.model.User;
import com.agroconnect.repository.InputSellerRepository;
import com.agroconnect.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class InputSellerServiceImpl implements InputSellerService {

    private final InputSellerRepository inputSellerRepository;
    private final UserRepository userRepository;

    public InputSellerServiceImpl(InputSellerRepository inputSellerRepository, UserRepository userRepository) {
        this.inputSellerRepository = inputSellerRepository;
        this.userRepository = userRepository;
    }

    @Override
    public InputSellerProfile createOrUpdateProfile(Long userId, InputSellerRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        InputSellerProfile profile = inputSellerRepository.findByUserId(userId)
                .orElse(new InputSellerProfile());

        profile.setUser(user);
        profile.setBusinessDescription(request.getBusinessDescription());
        profile.setSpecialization(request.getSpecialization());
        profile.setOperatingStates(request.getOperatingStates());

        return inputSellerRepository.save(profile);
    }

    @Override
    public InputSellerProfile getProfile(Long userId) {
        return inputSellerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }
}
