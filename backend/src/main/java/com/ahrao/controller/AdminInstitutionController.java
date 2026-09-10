package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.academic.InstitutionResponse;
import com.ahrao.dto.academic.UpdateInstitutionRequest;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.academic.InstitutionManagementService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/institution")
@PreAuthorize("hasRole('ADMIN')")
public class AdminInstitutionController {

    private final InstitutionManagementService institutionManagementService;

    public AdminInstitutionController(InstitutionManagementService institutionManagementService) {
        this.institutionManagementService = institutionManagementService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<InstitutionResponse>> getInstitution() {
        InstitutionResponse response = institutionManagementService.getInstitution();
        return ResponseEntity.ok(ApiResponse.success("Institution details retrieved successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InstitutionResponse>> updateInstitution(
            @PathVariable Long id,
            @Valid @RequestBody UpdateInstitutionRequest request,
            HttpServletRequest httpRequest) {

        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        InstitutionResponse updated = institutionManagementService.updateInstitution(
                id, request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Institution details updated successfully", updated));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
