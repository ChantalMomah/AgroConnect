package com.agroconnect.service.impl;

import com.agroconnect.dto.ComplaintDTO;
import com.agroconnect.model.Complaint;
import com.agroconnect.model.User;
import com.agroconnect.repository.ComplaintRepository;
import com.agroconnect.repository.UserRepository;
import com.agroconnect.service.ComplaintService;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ComplaintServiceImpl
        implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;


    public ComplaintServiceImpl(
            ComplaintRepository complaintRepository,
            UserRepository userRepository) {

        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
    }


    // ==========================================
    // CREATE COMPLAINT
    // ==========================================

    @Override
    public Complaint createComplaint(
            Long userId,
            ComplaintDTO request) {

        User user = userRepository
                .findById(userId)
                .orElseThrow(
                    () -> new RuntimeException(
                        "User not found"
                    )
                );


        if (request.getType() == null ||
            request.getType().isBlank()) {

            throw new RuntimeException(
                "Please select a complaint type."
            );
        }


        if (request.getMessage() == null ||
            request.getMessage().isBlank()) {

            throw new RuntimeException(
                "Please enter your message."
            );
        }


        Complaint.ComplaintType type;

        try {

            type = Complaint.ComplaintType.valueOf(
                request.getType()
                    .trim()
                    .toUpperCase()
            );

        } catch (IllegalArgumentException e) {

            throw new RuntimeException(
                "Invalid complaint type."
            );
        }


        Complaint complaint = new Complaint();

        complaint.setUser(user);

        complaint.setType(type);

        complaint.setMessage(
            request.getMessage().trim()
        );

        complaint.setStatus(
            Complaint.ComplaintStatus.PENDING
        );


        return complaintRepository.save(complaint);
    }


    // ==========================================
    // GET USER COMPLAINTS
    // ==========================================

    @Override
    public List<Complaint> getUserComplaints(
            Long userId) {

        return complaintRepository
                .findByUserIdOrderByCreatedAtDesc(
                    userId
                );
    }


    // ==========================================
    // GET ALL COMPLAINTS
    // ==========================================

    @Override
    public List<Complaint> getAllComplaints() {

        return complaintRepository
                .findAllByOrderByCreatedAtDesc();
    }


    // ==========================================
    // UPDATE STATUS
    // ==========================================

    @Override
public Complaint updateComplaintStatus(
        Long id,
        String status) {

    Complaint complaint =
            complaintRepository
                    .findById(id)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Complaint not found"
                            )
                    );

    Complaint.ComplaintStatus newStatus;

    try {

        newStatus =
                Complaint.ComplaintStatus.valueOf(
                        status.trim().toUpperCase()
                );

    } catch (IllegalArgumentException e) {

        throw new RuntimeException(
                "Invalid complaint status."
        );
    }

    Complaint.ComplaintStatus currentStatus =
            complaint.getStatus();

    // PENDING → REVIEWED
    if (currentStatus ==
            Complaint.ComplaintStatus.PENDING &&
        newStatus ==
            Complaint.ComplaintStatus.REVIEWED) {

        complaint.setStatus(
                Complaint.ComplaintStatus.REVIEWED
        );

        return complaintRepository.save(complaint);
    }

    // REVIEWED → RESOLVED
    if (currentStatus ==
            Complaint.ComplaintStatus.REVIEWED &&
        newStatus ==
            Complaint.ComplaintStatus.RESOLVED) {

        complaint.setStatus(
                Complaint.ComplaintStatus.RESOLVED
        );

        return complaintRepository.save(complaint);
    }

    throw new RuntimeException(
            "Invalid complaint status transition from "
                    + currentStatus
                    + " to "
                    + newStatus
    );
}

    // ==========================================
// DELETE COMPLAINT
// ==========================================

@Override
public void deleteComplaint(Long id) {

    Complaint complaint = complaintRepository
            .findById(id)
            .orElseThrow(
                () -> new RuntimeException(
                    "Complaint not found"
                )
            );

    complaintRepository.delete(complaint);
}
}