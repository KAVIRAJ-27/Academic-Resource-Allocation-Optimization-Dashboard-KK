package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/hod")
@PreAuthorize("hasAnyRole('HOD', 'ADMIN')")
public class HODController {

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHODOverview() {
        return ResponseEntity.ok(ApiResponse.success("HOD overview telemetry retrieved",
                Map.of("role", "HOD", "scope", "DEPARTMENT", "status", "AUTHORIZED")));
    }
}
