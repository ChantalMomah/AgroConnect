package com.agroconnect.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "farmer_profiles")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class FarmerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    private String farmSize;
    private String primaryCrops;
}