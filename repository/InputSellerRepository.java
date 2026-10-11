package com.agroconnect.repository;

import com.agroconnect.model.InputSellerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InputSellerRepository extends JpaRepository<InputSellerProfile, Long> {
    Optional<InputSellerProfile> findByUserId(Long userId);
}