package com.ahrao.service.analytics;

import com.ahrao.dto.analytics.AcademicUtilizationAnalyticsDto;
import com.ahrao.dto.analytics.AnalyticsFilterParams;
import com.ahrao.dto.analytics.RankedResourceDto;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.user.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportExportServiceTest {

    @Mock
    private AnalyticsService analyticsService;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReportExportServiceImpl reportExportService;

    @Test
    @DisplayName("exportReportToCsv: Generates valid CSV and saves audit log")
    void testExportAcademicResourcesCsv() {
        AcademicUtilizationAnalyticsDto dto = new AcademicUtilizationAnalyticsDto();
        RankedResourceDto r = new RankedResourceDto();
        r.setResourceId(101L);
        r.setResourceName("Physics Lab, Advanced");
        r.setResourceCode("PHY-ADV-01");
        r.setCategoryName("Laboratory");
        r.setResourceType("LABORATORY");
        r.setDepartmentName("Physics");
        r.setCapacity(40);
        r.setTotalAllocations(12L);
        r.setUtilizationPercentage(80.0);
        dto.setTopUtilizedResources(List.of(r));

        when(analyticsService.getAcademicUtilization(any())).thenReturn(dto);

        byte[] csvBytes = reportExportService.exportReportToCsv("ACADEMIC_RESOURCES", new AnalyticsFilterParams());

        assertNotNull(csvBytes);
        assertTrue(csvBytes.length > 0);

        String csv = new String(csvBytes, StandardCharsets.UTF_8);
        assertTrue(csv.contains("Resource ID,Resource Name,Resource Code"));
        // Check escaping of comma in resource name
        assertTrue(csv.contains("\"Physics Lab, Advanced\""));
        assertTrue(csv.contains("PHY-ADV-01"));

        // Verify audit log saved
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("getReportFilename: Formats proper filename with timestamp")
    void testGetReportFilename() {
        String filename = reportExportService.getReportFilename("HOSTEL_OCCUPANCY");
        assertNotNull(filename);
        assertTrue(filename.startsWith("hostel-occupancy_"));
        assertTrue(filename.endsWith(".csv"));
    }
}
