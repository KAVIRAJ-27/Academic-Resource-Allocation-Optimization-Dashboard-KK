package com.ahrao.service.analytics;

import com.ahrao.dto.analytics.*;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.user.User;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportExportServiceImpl implements ReportExportService {

    private static final Logger log = LoggerFactory.getLogger(ReportExportServiceImpl.class);

    private final AnalyticsService analyticsService;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public ReportExportServiceImpl(
            AnalyticsService analyticsService,
            AuditLogRepository auditLogRepository,
            UserRepository userRepository) {
        this.analyticsService = analyticsService;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public byte[] exportReportToCsv(String reportType, AnalyticsFilterParams params) {
        log.info("Generating CSV report export for type: {}", reportType);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8));

        int rowsGenerated = 0;
        String normalizedType = reportType != null ? reportType.toUpperCase() : "ACADEMIC_RESOURCES";

        switch (normalizedType) {
            case "ACADEMIC_RESOURCES":
                rowsGenerated = writeAcademicResourcesCsv(writer, params);
                break;
            case "ACADEMIC_ALLOCATIONS":
                rowsGenerated = writeAcademicAllocationsCsv(writer, params);
                break;
            case "DEPARTMENT_SUMMARY":
                rowsGenerated = writeDepartmentSummaryCsv(writer, params);
                break;
            case "FACULTY_WORKLOAD":
                rowsGenerated = writeFacultyWorkloadCsv(writer, params);
                break;
            case "HOSTEL_OCCUPANCY":
                rowsGenerated = writeHostelOccupancyCsv(writer, params);
                break;
            case "HOSTEL_COMPLAINTS":
                rowsGenerated = writeHostelComplaintsCsv(writer, params);
                break;
            case "MAINTENANCE_REQUESTS":
                rowsGenerated = writeMaintenanceRequestsCsv(writer, params);
                break;
            default:
                rowsGenerated = writeAcademicResourcesCsv(writer, params);
                break;
        }

        writer.flush();

        // Record Audit Log for report generation
        recordAuditLog(normalizedType, rowsGenerated);

        return baos.toByteArray();
    }

    @Override
    public String getReportFilename(String reportType) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String prefix = reportType != null ? reportType.toLowerCase().replace('_', '-') : "report";
        return prefix + "_" + timestamp + ".csv";
    }

    private int writeAcademicResourcesCsv(PrintWriter writer, AnalyticsFilterParams params) {
        writer.println("Resource ID,Resource Name,Resource Code,Category,Resource Type,Department,Capacity,Active Allocations,Utilization %");
        AcademicUtilizationAnalyticsDto dto = analyticsService.getAcademicUtilization(params);
        List<RankedResourceDto> resources = dto.getTopUtilizedResources();
        for (RankedResourceDto r : resources) {
            writer.printf("%d,%s,%s,%s,%s,%s,%d,%d,%.2f%%%n",
                    r.getResourceId(),
                    escapeCsv(r.getResourceName()),
                    escapeCsv(r.getResourceCode()),
                    escapeCsv(r.getCategoryName()),
                    escapeCsv(r.getResourceType()),
                    escapeCsv(r.getDepartmentName()),
                    r.getCapacity(),
                    r.getTotalAllocations(),
                    r.getUtilizationPercentage()
            );
        }
        return resources.size();
    }

    private int writeAcademicAllocationsCsv(PrintWriter writer, AnalyticsFilterParams params) {
        writer.println("Category,Total Allocations");
        AllocationAnalyticsDto dto = analyticsService.getAllocationAnalytics(params);
        int count = 0;
        if (dto.getCategoryDistribution() != null) {
            for (var entry : dto.getCategoryDistribution().entrySet()) {
                writer.printf("%s,%d%n", escapeCsv(entry.getKey()), entry.getValue());
                count++;
            }
        }
        return count;
    }

    private int writeDepartmentSummaryCsv(PrintWriter writer, AnalyticsFilterParams params) {
        writer.println("Department ID,Department Name,Code,Students,Faculty,Subjects,Resources,Active Allocations,Utilization %,Avg Workload Hours");
        DepartmentAnalyticsDto dto = analyticsService.getDepartmentAnalytics(params);
        List<DepartmentAnalyticsDto.DepartmentMetricsDto> list = dto.getDepartments();
        for (DepartmentAnalyticsDto.DepartmentMetricsDto d : list) {
            writer.printf("%d,%s,%s,%d,%d,%d,%d,%d,%.2f%%,%.2f%n",
                    d.getDepartmentId(),
                    escapeCsv(d.getDepartmentName()),
                    escapeCsv(d.getDepartmentCode()),
                    d.getStudentCount(),
                    d.getFacultyCount(),
                    d.getSubjectCount(),
                    d.getResourceCount(),
                    d.getAllocationCount(),
                    d.getResourceUtilizationPercentage(),
                    d.getAverageFacultyWorkload()
            );
        }
        return list.size();
    }

    private int writeFacultyWorkloadCsv(PrintWriter writer, AnalyticsFilterParams params) {
        writer.println("Faculty ID,Faculty Name,Employee ID,Department,Total Hours,Teaching Hours,Lab Hours,Workload Status");
        FacultyWorkloadAnalyticsDto dto = analyticsService.getFacultyWorkloadAnalytics(params);
        List<FacultyWorkloadAnalyticsDto.FacultyWorkloadSummaryItemDto> list = dto.getFacultyWorkloads();
        for (FacultyWorkloadAnalyticsDto.FacultyWorkloadSummaryItemDto f : list) {
            writer.printf("%d,%s,%s,%s,%.2f,%.2f,%.2f,%s%n",
                    f.getFacultyId(),
                    escapeCsv(f.getFacultyName()),
                    escapeCsv(f.getEmployeeId()),
                    escapeCsv(f.getDepartmentName()),
                    f.getTotalHours(),
                    f.getTeachingHours(),
                    f.getLabHours(),
                    escapeCsv(f.getWorkloadStatus())
            );
        }
        return list.size();
    }

    private int writeHostelOccupancyCsv(PrintWriter writer, AnalyticsFilterParams params) {
        writer.println("Hostel ID,Hostel Name,Type,Total Rooms,Total Beds,Occupied Beds,Available Beds,Occupancy %");
        HostelOccupancyAnalyticsDto dto = analyticsService.getHostelOccupancyAnalytics(params);
        List<HostelOccupancyAnalyticsDto.HostelOccupancyItemDto> list = dto.getHostelOccupancies();
        for (HostelOccupancyAnalyticsDto.HostelOccupancyItemDto h : list) {
            writer.printf("%d,%s,%s,%d,%d,%d,%d,%.2f%%%n",
                    h.getHostelId(),
                    escapeCsv(h.getHostelName()),
                    escapeCsv(h.getHostelType()),
                    h.getTotalRooms(),
                    h.getTotalBeds(),
                    h.getOccupiedBeds(),
                    h.getAvailableBeds(),
                    h.getOccupancyPercentage()
            );
        }
        return list.size();
    }

    private int writeHostelComplaintsCsv(PrintWriter writer, AnalyticsFilterParams params) {
        writer.println("Status,Count");
        HostelComplaintAnalyticsDto dto = analyticsService.getHostelComplaintAnalytics(params);
        int count = 0;
        if (dto.getComplaintsByStatus() != null) {
            for (var entry : dto.getComplaintsByStatus().entrySet()) {
                writer.printf("%s,%d%n", escapeCsv(entry.getKey()), entry.getValue());
                count++;
            }
        }
        return count;
    }

    private int writeMaintenanceRequestsCsv(PrintWriter writer, AnalyticsFilterParams params) {
        writer.println("Status,Count");
        MaintenanceAnalyticsDto dto = analyticsService.getMaintenanceAnalytics(params);
        int count = 0;
        if (dto.getMaintenanceByStatus() != null) {
            for (var entry : dto.getMaintenanceByStatus().entrySet()) {
                writer.printf("%s,%d%n", escapeCsv(entry.getKey()), entry.getValue());
                count++;
            }
        }
        return count;
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private void recordAuditLog(String reportType, int rowCount) {
        try {
            Long userId = SecurityUtils.getCurrentUserId().orElse(null);
            User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

            AuditLog logEntry = new AuditLog();
            logEntry.setUser(user);
            logEntry.setAction("REPORT_EXPORT");
            logEntry.setEntityType("ANALYTICS_REPORT");
            logEntry.setNewValue(String.format("ReportType: %s, Rows: %d, ExportedAt: %s",
                    reportType, rowCount, Instant.now()));
            auditLogRepository.save(logEntry);
        } catch (Exception e) {
            log.warn("Failed to record audit log for report export: {}", e.getMessage());
        }
    }
}
