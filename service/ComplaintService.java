package com.agroconnect.service;

import com.agroconnect.dto.ComplaintDTO;
import com.agroconnect.model.Complaint;

import java.util.List;

public interface ComplaintService {

    Complaint createComplaint(
            Long userId,
            ComplaintDTO request
    );

    List<Complaint> getUserComplaints(
            Long userId
    );

    List<Complaint> getAllComplaints();

    Complaint updateComplaintStatus(
            Long id,
            String status
    );

    void deleteComplaint(
            Long id
    );
}