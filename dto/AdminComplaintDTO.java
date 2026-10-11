package com.agroconnect.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdminComplaintDTO {

    private Long id;
    private String userName;
    private String type;
    private String message;
    private LocalDateTime createdAt;
    private String status;

    public AdminComplaintDTO(
            Long id,
            String userName,
            String type,
            String message,
            LocalDateTime createdAt,
            String status) {

        this.id = id;
        this.userName = userName;
        this.type = type;
        this.message = message;
        this.createdAt = createdAt;
        this.status = status;
    }
}