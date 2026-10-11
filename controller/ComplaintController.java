package com.agroconnect.controller;

import com.agroconnect.dto.ComplaintDTO;
import com.agroconnect.model.Complaint;
import com.agroconnect.service.ComplaintService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {

    private final ComplaintService complaintService;


    public ComplaintController(
            ComplaintService complaintService) {

        this.complaintService = complaintService;
    }


    // ==========================================
    // CREATE COMPLAINT / SUGGESTION
    // ==========================================

    @PostMapping("/user/{userId}")
    public ResponseEntity<Complaint> createComplaint(
            @PathVariable Long userId,
            @RequestBody ComplaintDTO request) {

        return ResponseEntity.ok(
            complaintService.createComplaint(
                userId,
                request
            )
        );
    }


    // ==========================================
    // GET USER COMPLAINTS
    // ==========================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Complaint>> getUserComplaints(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
            complaintService.getUserComplaints(
                userId
            )
        );
    }


    // ==========================================
    // GET ALL COMPLAINTS
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Complaint>> getAllComplaints() {

        return ResponseEntity.ok(
            complaintService.getAllComplaints()
        );
    }


    // ==========================================
    // UPDATE COMPLAINT STATUS
    // ==========================================

    @PutMapping("/{id}/status")
    public ResponseEntity<Complaint> updateComplaintStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(
            complaintService.updateComplaintStatus(
                id,
                status
            )
        );
    }

    // ==========================================
// DELETE COMPLAINT
// ==========================================

@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteComplaint(
        @PathVariable Long id) {

    complaintService.deleteComplaint(id);

    return ResponseEntity.noContent().build();
}
}