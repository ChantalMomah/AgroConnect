package com.agroconnect.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {

    private String fullName;

    private String phoneNumber;

    private String state;

    private String businessName;

    private String bio;

    private String bankName;

    private String accountNumber;

    private String accountName;

}