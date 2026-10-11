package com.agroconnect.repository;

import com.agroconnect.model.Complaint;
import com.agroconnect.model.Complaint.ComplaintStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository
        extends JpaRepository<Complaint, Long> {

    List<Complaint> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Complaint> findAllByOrderByCreatedAtDesc();

    List<Complaint> findByStatusOrderByCreatedAtDesc(
            ComplaintStatus status
    );
}