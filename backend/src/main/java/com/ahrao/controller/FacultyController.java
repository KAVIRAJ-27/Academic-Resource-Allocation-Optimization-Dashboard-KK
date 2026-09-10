package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/faculty")
@PreAuthorize("hasAnyRole('FACULTY', 'HOD', 'ADMIN')")
public class FacultyController {

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFacultyOverview() {
        return ResponseEntity.ok(ApiResponse.success("Faculty overview telemetry retrieved",
                Map.of("role", "FACULTY", "scope", "TEACHING_LOAD", "status", "AUTHORIZED")));
    }
}
