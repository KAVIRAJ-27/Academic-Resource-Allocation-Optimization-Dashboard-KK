package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/principal")
@PreAuthorize("hasAnyRole('PRINCIPAL', 'ADMIN')")
public class PrincipalController {

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPrincipalOverview() {
        return ResponseEntity.ok(ApiResponse.success("Principal overview telemetry retrieved",
                Map.of("role", "PRINCIPAL", "scope", "INSTITUTION", "status", "AUTHORIZED")));
    }
}
