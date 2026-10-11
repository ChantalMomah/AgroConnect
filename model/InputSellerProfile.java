// InputSellerProfile.java
package com.agroconnect.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "input_sellers")
public class InputSellerProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;

    private String businessDescription;
    private String specialization;
    private String operatingStates;
}
