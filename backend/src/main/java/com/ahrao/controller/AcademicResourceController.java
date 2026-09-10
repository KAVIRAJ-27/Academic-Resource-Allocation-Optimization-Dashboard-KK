package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.service.AcademicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * REST controller for Domain 1: Academic Resource Management.
 */
@RestController
@RequestMapping("/api/academic")
public class AcademicResourceController {

    private final AcademicService academicService;

    public AcademicResourceController(AcademicService academicService) {
        this.academicService = academicService;
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOverview() {
        return ResponseEntity.ok(ApiResponse.success("Academic domain overview retrieved", academicService.getAcademicDomainOverview()));
    }
}
