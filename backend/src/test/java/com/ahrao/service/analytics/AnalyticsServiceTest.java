package com.ahrao.service.analytics;

import com.ahrao.dto.analytics.*;
import com.ahrao.repository.analytics.AnalyticsQueryRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.service.hod.HodDepartmentResolver;
import com.ahrao.service.warden.WardenScopeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private AnalyticsQueryRepository queryRepo;

    @Mock
    private HodDepartmentResolver hodDepartmentResolver;

    @Mock
    private WardenScopeService wardenScopeService;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AnalyticsServiceImpl analyticsService;

    private AnalyticsFilterParams filterParams;

    @BeforeEach
    void setUp() {
        filterParams = new AnalyticsFilterParams();
    }

    @Test
    @DisplayName("getOverview: Calculates correct resource utilization and bed occupancy")
    void testGetOverview_NormalData() {
        when(queryRepo.getResourceCountsByStatus(any())).thenReturn(Map.of(
                "AVAILABLE", 30L,
                "MAINTENANCE", 5L,
                "INACTIVE", 5L
        ));
        when(queryRepo.getAllocationCountsByStatus(any(), any())).thenReturn(Map.of(
                "ACTIVE", 10L
        ));
        when(queryRepo.getAcademicRequestCountsByStatus(any(), any())).thenReturn(Map.of(
                "APPROVED", 20L,
                "PENDING", 5L
        ));
        when(queryRepo.countTotalHostels(any())).thenReturn(2L);
        when(queryRepo.countTotalHostelRooms(any())).thenReturn(50L);
        when(queryRepo.countTotalHostelBeds(any())).thenReturn(100L);
        when(queryRepo.getHostelBedCountsByStatus(any())).thenReturn(Map.of(
                "OCCUPIED", 75L,
                "AVAILABLE", 25L
        ));
        when(queryRepo.getHostelRequestCountsByStatus(any(), any())).thenReturn(Map.of(
                "PENDING", 4L
        ));
        when(queryRepo.getHostelComplaintCountsByStatus(any(), any())).thenReturn(Map.of(
                "OPEN", 3L,
                "IN_PROGRESS", 2L
        ));
        when(queryRepo.getMaintenanceCountsByStatus(any(), any(), any())).thenReturn(Map.of(
                "OPEN", 2L
        ));
        when(queryRepo.getFacultyWorkloadAnalytics(any())).thenReturn(new FacultyWorkloadAnalyticsDto());

        AnalyticsOverviewDto overview = analyticsService.getOverview(filterParams);

        assertNotNull(overview);
        assertEquals(40L, overview.getTotalResources());
        assertEquals(30L, overview.getAvailableResources());
        assertEquals(100L, overview.getTotalBeds());
        assertEquals(75L, overview.getOccupiedBeds());
        assertEquals(75.0, overview.getHostelOccupancyPercentage());
        assertEquals(4L, overview.getPendingHostelRequests());
        assertEquals(5L, overview.getOpenComplaints());
    }

    @Test
    @DisplayName("getOverview: Returns 0% utilization and occupancy when denominators are zero (Safe division)")
    void testGetOverview_ZeroDenominators() {
        when(queryRepo.getResourceCountsByStatus(any())).thenReturn(Collections.emptyMap());
        when(queryRepo.getAllocationCountsByStatus(any(), any())).thenReturn(Collections.emptyMap());
        when(queryRepo.getAcademicRequestCountsByStatus(any(), any())).thenReturn(Collections.emptyMap());
        when(queryRepo.countTotalHostels(any())).thenReturn(0L);
        when(queryRepo.countTotalHostelRooms(any())).thenReturn(0L);
        when(queryRepo.countTotalHostelBeds(any())).thenReturn(0L);
        when(queryRepo.getHostelBedCountsByStatus(any())).thenReturn(Collections.emptyMap());
        when(queryRepo.getHostelRequestCountsByStatus(any(), any())).thenReturn(Collections.emptyMap());
        when(queryRepo.getHostelComplaintCountsByStatus(any(), any())).thenReturn(Collections.emptyMap());
        when(queryRepo.getMaintenanceCountsByStatus(any(), any(), any())).thenReturn(Collections.emptyMap());
        when(queryRepo.getFacultyWorkloadAnalytics(any())).thenReturn(new FacultyWorkloadAnalyticsDto());

        AnalyticsOverviewDto overview = analyticsService.getOverview(filterParams);

        assertNotNull(overview);
        assertEquals(0.0, overview.getOverallResourceUtilization());
        assertEquals(0.0, overview.getHostelOccupancyPercentage());
        assertEquals(0.0, overview.getRequestApprovalRate());
    }

    @Test
    @DisplayName("getAcademicUtilization: Computes category distribution and returns ranked list")
    void testGetAcademicUtilization() {
        when(queryRepo.getResourceCountsByStatus(any())).thenReturn(Map.of(
                "AVAILABLE", 10L,
                "MAINTENANCE", 2L
        ));
        when(queryRepo.getResourceCountsByCategory(any())).thenReturn(Map.of(
                "Lecture Hall", 6L,
                "Computer Lab", 6L
        ));
        RankedResourceDto ranked = new RankedResourceDto();
        ranked.setResourceId(1L);
        ranked.setResourceName("LH-101");
        ranked.setTotalAllocations(15L);
        ranked.setUtilizationPercentage(85.0);
        when(queryRepo.getTopAndBottomUtilizedResources(any(), any(), eq(5), eq(true)))
                .thenReturn(List.of(ranked));

        AcademicUtilizationAnalyticsDto dto = analyticsService.getAcademicUtilization(filterParams);

        assertNotNull(dto);
        assertEquals(12L, dto.getTotalResources());
        assertFalse(dto.getResourcesByCategory().isEmpty());
        assertEquals(1, dto.getTopUtilizedResources().size());
        assertEquals("LH-101", dto.getTopUtilizedResources().get(0).getResourceName());
    }

    @Test
    @DisplayName("getClassroomAnalytics: Computes classroom availability and capacity metrics")
    void testGetClassroomAnalytics() {
        when(queryRepo.countTotalResourcesByType("CLASSROOM", null)).thenReturn(20L);
        when(queryRepo.countResourcesByTypeAndStatus("CLASSROOM", "AVAILABLE", null)).thenReturn(15L);
        when(queryRepo.countResourcesByTypeAndStatus("CLASSROOM", "MAINTENANCE", null)).thenReturn(1L);
        when(queryRepo.calculateAverageClassroomCapacityUtilization(null)).thenReturn(78.5);

        ClassroomAnalyticsDto dto = analyticsService.getClassroomAnalytics(filterParams);

        assertNotNull(dto);
        assertEquals(20L, dto.getTotalClassrooms());
        assertEquals(15L, dto.getAvailableClassrooms());
        assertEquals(4L, dto.getAllocatedClassrooms());
        assertEquals(78.5, dto.getAverageCapacityUtilization());
    }

    @Test
    @DisplayName("getHostelOccupancyAnalytics: Correctly evaluates occupied vs available beds")
    void testGetHostelOccupancyAnalytics() {
        when(queryRepo.countTotalHostels(any())).thenReturn(3L);
        when(queryRepo.countTotalHostelBlocks(any())).thenReturn(6L);
        when(queryRepo.countTotalHostelRooms(any())).thenReturn(120L);
        when(queryRepo.countTotalHostelBeds(any())).thenReturn(240L);
        when(queryRepo.getHostelBedCountsByStatus(any())).thenReturn(Map.of(
                "OCCUPIED", 180L,
                "AVAILABLE", 60L
        ));

        HostelOccupancyAnalyticsDto dto = analyticsService.getHostelOccupancyAnalytics(filterParams);

        assertNotNull(dto);
        assertEquals(3L, dto.getTotalHostels());
        assertEquals(240L, dto.getTotalBeds());
        assertEquals(180L, dto.getOccupiedBeds());
        assertEquals(60L, dto.getAvailableBeds());
        assertEquals(75.0, dto.getOccupancyPercentage());
        assertEquals(25.0, dto.getAvailabilityPercentage());
    }
}
