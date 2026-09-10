package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.analytics.*;
import com.ahrao.service.analytics.AnalyticsService;
import com.ahrao.service.analytics.ReportExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'WARDEN', 'FACULTY', 'STUDENT')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final ReportExportService reportExportService;

    public AnalyticsController(AnalyticsService analyticsService, ReportExportService reportExportService) {
        this.analyticsService = analyticsService;
        this.reportExportService = reportExportService;
    }

    // =========================================================================
    // 1. OVERVIEW
    // =========================================================================

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<AnalyticsOverviewDto>> getOverview(AnalyticsFilterParams params) {
        AnalyticsOverviewDto dto = analyticsService.getOverview(params);
        return ResponseEntity.ok(ApiResponse.success("Analytics overview retrieved successfully", dto));
    }

    // =========================================================================
    // 2. ACADEMIC ANALYTICS
    // =========================================================================

    @GetMapping("/academic/overview")
    public ResponseEntity<ApiResponse<AcademicUtilizationAnalyticsDto>> getAcademicOverview(AnalyticsFilterParams params) {
        AcademicUtilizationAnalyticsDto dto = analyticsService.getAcademicUtilization(params);
        return ResponseEntity.ok(ApiResponse.success("Academic overview analytics retrieved successfully", dto));
    }

    @GetMapping("/academic/resources")
    public ResponseEntity<ApiResponse<AcademicUtilizationAnalyticsDto>> getAcademicResources(AnalyticsFilterParams params) {
        AcademicUtilizationAnalyticsDto dto = analyticsService.getAcademicUtilization(params);
        return ResponseEntity.ok(ApiResponse.success("Academic resource utilization retrieved successfully", dto));
    }

    @GetMapping("/academic/classrooms")
    public ResponseEntity<ApiResponse<ClassroomAnalyticsDto>> getClassroomAnalytics(AnalyticsFilterParams params) {
        ClassroomAnalyticsDto dto = analyticsService.getClassroomAnalytics(params);
        return ResponseEntity.ok(ApiResponse.success("Classroom analytics retrieved successfully", dto));
    }

    @GetMapping("/academic/labs")
    public ResponseEntity<ApiResponse<LaboratoryAnalyticsDto>> getLaboratoryAnalytics(AnalyticsFilterParams params) {
        LaboratoryAnalyticsDto dto = analyticsService.getLaboratoryAnalytics(params);
        return ResponseEntity.ok(ApiResponse.success("Laboratory analytics retrieved successfully", dto));
    }

    @GetMapping("/academic/equipment")
    public ResponseEntity<ApiResponse<EquipmentAnalyticsDto>> getEquipmentAnalytics(AnalyticsFilterParams params) {
        EquipmentAnalyticsDto dto = analyticsService.getEquipmentAnalytics(params);
        return ResponseEntity.ok(ApiResponse.success("Equipment analytics retrieved successfully", dto));
    }

    @GetMapping("/academic/allocations")
    public ResponseEntity<ApiResponse<AllocationAnalyticsDto>> getAllocationAnalytics(AnalyticsFilterParams params) {
        AllocationAnalyticsDto dto = analyticsService.getAllocationAnalytics(params);
        return ResponseEntity.ok(ApiResponse.success("Allocation analytics retrieved successfully", dto));
    }

    @GetMapping("/academic/requests")
    public ResponseEntity<ApiResponse<RequestAnalyticsDto>> getRequestAnalytics(AnalyticsFilterParams params) {
        RequestAnalyticsDto dto = analyticsService.getRequestAnalytics(params);
        return ResponseEntity.ok(ApiResponse.success("Request analytics retrieved successfully", dto));
    }

    @GetMapping("/academic/conflicts")
    public ResponseEntity<ApiResponse<ConflictAnalyticsDto>> getConflictAnalytics(AnalyticsFilterParams params) {
        ConflictAnalyticsDto dto = analyticsService.getConflictAnalytics(params);
        return ResponseEntity.ok(ApiResponse.success("Conflict analytics retrieved successfully", dto));
    }

    @GetMapping("/academic/workload")
    public ResponseEntity<ApiResponse<FacultyWorkloadAnalyticsDto>> getFacultyWorkloadAnalytics(AnalyticsFilterParams params) {
        FacultyWorkloadAnalyticsDto dto = analyticsService.getFacultyWorkloadAnalytics(params);
        return ResponseEntity.ok(ApiResponse.success("Faculty workload analytics retrieved successfully", dto));
    }

    @GetMapping("/academic/departments")
    public ResponseEntity<ApiResponse<DepartmentAnalyticsDto>> getDepartmentAnalytics(AnalyticsFilterParams params) {
        DepartmentAnalyticsDto dto = analyticsService.getDepartmentAnalytics(params);
        return ResponseEntity.ok(ApiResponse.success("Department analytics retrieved successfully", dto));
    }

    // =========================================================================
    // 3. HOSTEL ANALYTICS
    // =========================================================================

    @GetMapping("/hostel/overview")
    public ResponseEntity<ApiResponse<HostelOccupancyAnalyticsDto>> getHostelOverview(AnalyticsFilterParams params) {
        HostelOccupancyAnalyticsDto dto = analyticsService.getHostelOccupancyAnalytics(params);
        return ResponseEntity.ok(ApiResponse.success("Hostel overview analytics retrieved successfully", dto));
    }

    @GetMapping("/hostel/occupancy")
    public ResponseEntity<ApiResponse<HostelOccupancyAnalyticsDto>> getHostelOccupancy(AnalyticsFilterParams params) {
        HostelOccupancyAnalyticsDto dto = analyticsService.getHostelOccupancyAnalytics(params);
        return ResponseEntity.ok(ApiResponse.success("Hostel occupancy analytics retrieved successfully", dto));
    }

    @GetMapping("/hostel/rooms")
    public ResponseEntity<ApiResponse<RoomUtilizationDto>> getRoomUtilization(AnalyticsFilterParams params) {
        RoomUtilizationDto dto = analyticsService.getRoomUtilization(params);
        return ResponseEntity.ok(ApiResponse.success("Hostel room utilization retrieved successfully", dto));
    }

    @GetMapping("/hostel/requests")
    public ResponseEntity<ApiResponse<HostelRequestAnalyticsDto>> getHostelRequests(AnalyticsFilterParams params) {
        HostelRequestAnalyticsDto dto = analyticsService.getHostelRequestAnalytics(params);
        return ResponseEntity.ok(ApiResponse.success("Hostel request analytics retrieved successfully", dto));
    }

    @GetMapping("/hostel/complaints")
    public ResponseEntity<ApiResponse<HostelComplaintAnalyticsDto>> getHostelComplaints(AnalyticsFilterParams params) {
        HostelComplaintAnalyticsDto dto = analyticsService.getHostelComplaintAnalytics(params);
        return ResponseEntity.ok(ApiResponse.success("Hostel complaint analytics retrieved successfully", dto));
    }

    @GetMapping("/hostel/maintenance")
    public ResponseEntity<ApiResponse<MaintenanceAnalyticsDto>> getMaintenanceAnalytics(AnalyticsFilterParams params) {
        MaintenanceAnalyticsDto dto = analyticsService.getMaintenanceAnalytics(params);
        return ResponseEntity.ok(ApiResponse.success("Maintenance analytics retrieved successfully", dto));
    }

    // =========================================================================
    // 4. REPORTS & EXPORT
    // =========================================================================

    @GetMapping("/reports/export")
    public ResponseEntity<byte[]> exportReport(
            @RequestParam(name = "reportType", defaultValue = "ACADEMIC_RESOURCES") String reportType,
            AnalyticsFilterParams params) {
        byte[] csvData = reportExportService.exportReportToCsv(reportType, params);
        String filename = reportExportService.getReportFilename(reportType);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvData);
    }
}
