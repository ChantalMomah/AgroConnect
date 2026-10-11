package com.agroconnect.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // ==========================================
    // USER WHO SUBMITTED THE COMPLAINT
    // ==========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;


    // ==========================================
    // TYPE
    // ==========================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintType type;


    // ==========================================
    // MESSAGE
    // ==========================================

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;


    // ==========================================
    // STATUS
    // ==========================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintStatus status = ComplaintStatus.PENDING;


    // ==========================================
    // DATE
    // ==========================================

    @CreationTimestamp
    private LocalDateTime createdAt;


    // ==========================================
    // COMPLAINT TYPE
    // ==========================================

    public enum ComplaintType {

        COMPLAINT,
        SUGGESTION
    }


    // ==========================================
    // COMPLAINT STATUS
    // ==========================================

    public enum ComplaintStatus {

        PENDING,
        REVIEWED,
        RESOLVED
    }
}