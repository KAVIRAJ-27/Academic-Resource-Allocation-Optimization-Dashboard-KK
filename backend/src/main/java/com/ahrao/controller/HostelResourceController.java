package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.service.HostelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * REST controller for Domain 2: Hostel Resource Management.
 */
@RestController
@RequestMapping("/api/hostel")
public class HostelResourceController {

    private final HostelService hostelService;

    public HostelResourceController(HostelService hostelService) {
        this.hostelService = hostelService;
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOverview() {
        return ResponseEntity.ok(ApiResponse.success("Hostel domain overview retrieved", hostelService.getHostelDomainOverview()));
    }
}
