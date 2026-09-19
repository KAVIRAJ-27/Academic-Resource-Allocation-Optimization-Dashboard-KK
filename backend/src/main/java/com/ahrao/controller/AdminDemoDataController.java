package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.demo.VsbDemoStatusDto;
import com.ahrao.dto.demo.VsbImportSummaryDto;
import com.ahrao.service.demo.VsbDemoDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/demo-data/vsb")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDemoDataController {

    private final VsbDemoDataService vsbDemoDataService;

    public AdminDemoDataController(VsbDemoDataService vsbDemoDataService) {
        this.vsbDemoDataService = vsbDemoDataService;
    }

    @PostMapping("/import")
    public ResponseEntity<ApiResponse<VsbImportSummaryDto>> importVsbData(
            @RequestBody(required = false) Map<String, String> payload) {
        String dirPath = (payload != null) ? payload.get("dataDirectoryPath") : null;
        VsbImportSummaryDto summary = vsbDemoDataService.importVsbDemoData(dirPath);
        return ResponseEntity.ok(ApiResponse.success("VSB demo data import completed", summary));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<VsbDemoStatusDto>> getStatus() {
        VsbDemoStatusDto status = vsbDemoDataService.getVsbDemoStatus();
        return ResponseEntity.ok(ApiResponse.success("VSB demo data status retrieved", status));
    }

    @DeleteMapping("/cleanup")
    public ResponseEntity<ApiResponse<VsbImportSummaryDto>> cleanup() {
        VsbImportSummaryDto summary = vsbDemoDataService.cleanupVsbDemoData();
        return ResponseEntity.ok(ApiResponse.success("VSB demo data cleanup completed", summary));
    }
}
