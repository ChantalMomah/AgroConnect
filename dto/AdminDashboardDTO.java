package com.agroconnect.dto;

import com.agroconnect.model.User;
import lombok.Data;

import java.util.List;

@Data
public class AdminDashboardDTO {

    private long totalUsers;

    private long totalFarmers;

    private long totalBuyers;

    private long totalInputSellers;

    private long totalProducts;

    private long totalOrders;

    private long totalComplaints;
    
    private List<User> recentUsers;
}