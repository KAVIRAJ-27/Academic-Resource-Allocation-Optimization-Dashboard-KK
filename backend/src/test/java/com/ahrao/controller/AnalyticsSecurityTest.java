package com.ahrao.controller;

import com.ahrao.dto.analytics.AnalyticsFilterParams;
import com.ahrao.dto.analytics.AnalyticsOverviewDto;
import com.ahrao.service.analytics.AnalyticsService;
import com.ahrao.service.analytics.ReportExportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsSecurityTest {

    @Mock
    private AnalyticsService analyticsService;

    @Mock
    private ReportExportService reportExportService;

    private AnalyticsController analyticsController;

    @BeforeEach
    void setUp() {
        analyticsController = new AnalyticsController(analyticsService, reportExportService);
    }

    @Test
    @DisplayName("Security: AnalyticsController enforces role-based access at class level")
    void testClassPreAuthorize_RequiresRoles() {
        PreAuthorize annotation = AnalyticsController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(annotation, "AnalyticsController must have @PreAuthorize at class level");
        assertTrue(annotation.value().contains("ADMIN"));
        assertTrue(annotation.value().contains("PRINCIPAL"));
        assertTrue(annotation.value().contains("HOD"));
        assertTrue(annotation.value().contains("WARDEN"));
        assertTrue(annotation.value().contains("FACULTY"));
        assertTrue(annotation.value().contains("STUDENT"));
    }

    @Test
    @DisplayName("Controller: getOverview delegates to service correctly")
    void testGetOverviewDelegation() {
        when(analyticsService.getOverview(any())).thenReturn(new AnalyticsOverviewDto());
        var res = analyticsController.getOverview(new AnalyticsFilterParams());
        assertNotNull(res);
        assertEquals(200, res.getStatusCode().value());
        verify(analyticsService, times(1)).getOverview(any());
    }

    @Test
    @DisplayName("Controller: exportReport delegates to ReportExportService with correct headers")
    void testExportReportDelegation() {
        when(reportExportService.exportReportToCsv(eq("ACADEMIC_RESOURCES"), any())).thenReturn("test,csv".getBytes());
        when(reportExportService.getReportFilename(eq("ACADEMIC_RESOURCES"))).thenReturn("academic-resources.csv");

        ResponseEntity<byte[]> response = analyticsController.exportReport("ACADEMIC_RESOURCES", new AnalyticsFilterParams());

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getHeaders().getContentType().toString().contains("text/csv"));
        assertTrue(response.getHeaders().getFirst("Content-Disposition").contains("academic-resources.csv"));
        assertArrayEquals("test,csv".getBytes(), response.getBody());
    }
}
