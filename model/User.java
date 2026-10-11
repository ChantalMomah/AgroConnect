// User.java
package com.agroconnect.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    private String state;

    private String businessName;

    private String phoneNumber;

    private String bankName;

    private String accountNumber;

    private String accountName;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private Boolean active = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum UserRole {
        FARMER, BUYER, INPUT_SELLER, ADMIN
    }
}
