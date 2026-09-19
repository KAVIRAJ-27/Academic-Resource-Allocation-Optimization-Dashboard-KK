package com.ahrao.service;

import com.ahrao.dto.dashboard.AdminDashboardOverviewResponse;
import com.ahrao.dto.dashboard.UserDistributionDto;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.*;
import com.ahrao.entity.user.User;
import com.ahrao.repository.academic.DepartmentRepository;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.approval.ApprovalRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
import com.ahrao.repository.hostel.HostelRepository;
import com.ahrao.repository.hostel.HostelRoomRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.request.HostelComplaintRepository;
import com.ahrao.repository.request.HostelRequestRepository;
import com.ahrao.repository.request.MaintenanceRequestRepository;
import com.ahrao.repository.resource.ResourceRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.impl.AdminDashboardServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminDashboardServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private ResourceRepository resourceRepository;
    @Mock private HostelRepository hostelRepository;
    @Mock private HostelRoomRepository hostelRoomRepository;
    @Mock private HostelBedRepository hostelBedRepository;
    @Mock private AcademicResourceRequestRepository academicResourceRequestRepository;
    @Mock private HostelRequestRepository hostelRequestRepository;
    @Mock private ResourceAllocationRepository resourceAllocationRepository;
    @Mock private HostelAllocationRepository hostelAllocationRepository;
    @Mock private ApprovalRepository approvalRepository;
    @Mock private HostelComplaintRepository hostelComplaintRepository;
    @Mock private MaintenanceRequestRepository maintenanceRequestRepository;
    @Mock private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AdminDashboardServiceImpl adminDashboardService;

    @Test
    @DisplayName("Empty database returns zero values and zero percentages without exception")
    void testEmptyDatabaseOverview() {
        when(userRepository.count()).thenReturn(0L);
        when(userRepository.countUsersByRoleName()).thenReturn(Collections.emptyList());
        when(departmentRepository.count()).thenReturn(0L);
        when(departmentRepository.countByStatus("ACTIVE")).thenReturn(0L);
        when(resourceRepository.count()).thenReturn(0L);
        when(hostelRepository.count()).thenReturn(0L);
        when(hostelRoomRepository.count()).thenReturn(0L);
        when(hostelBedRepository.count()).thenReturn(0L);
        when(auditLogRepository.findRecentAuditLogs(any(PageRequest.class))).thenReturn(Collections.emptyList());

        AdminDashboardOverviewResponse overview = adminDashboardService.getDashboardOverview();

        assertNotNull(overview);
        assertEquals(0, overview.getTotalUsers());
        assertEquals(0, overview.getTotalDepartments());
        assertEquals(0, overview.getActiveDepartments());
        assertEquals(0, overview.getTotalAcademicResources());
        assertEquals(0, overview.getTotalHostelResources());
        assertEquals(0, overview.getTotalHostels());
        assertEquals(0, overview.getTotalRooms());
        assertEquals(0, overview.getTotalBeds());
        assertEquals(0, overview.getPendingRequests());
        assertEquals(0, overview.getActiveAllocations());
        assertEquals(0, overview.getPendingApprovals());
        assertEquals(0, overview.getOpenIssues());
        assertEquals(0.0, overview.getAcademicResourceOverview().getUtilizationRate());
        assertEquals(0.0, overview.getHostelResourceOverview().getOccupancyRate());
        assertTrue(overview.getRecentActivities().isEmpty());
    }

    @Test
    @DisplayName("Overview returns aggregated counts matching database records")
    void testPopulatedDatabaseOverview() {
        // Users
        when(userRepository.count()).thenReturn(150L);
        when(userRepository.countUsersByRoleName()).thenReturn(List.of(
                new Object[]{"ROLE_ADMIN", 2L},
                new Object[]{"ROLE_PRINCIPAL", 1L},
                new Object[]{"ROLE_HOD", 5L},
                new Object[]{"ROLE_FACULTY", 30L},
                new Object[]{"ROLE_STUDENT", 110L},
                new Object[]{"ROLE_WARDEN", 2L}
        ));

        // Departments
        when(departmentRepository.count()).thenReturn(6L);
        when(departmentRepository.countByStatus("ACTIVE")).thenReturn(5L);

        // Academic Resources
        when(resourceRepository.count()).thenReturn(40L);
        when(resourceRepository.countByStatus(ResourceStatus.AVAILABLE)).thenReturn(25L);
        when(resourceRepository.countByStatus(ResourceStatus.ALLOCATED)).thenReturn(10L);
        when(resourceRepository.countByStatus(ResourceStatus.MAINTENANCE)).thenReturn(3L);
        when(resourceRepository.countByStatus(ResourceStatus.INACTIVE)).thenReturn(2L);

        // Hostel Resources
        when(hostelRepository.count()).thenReturn(4L);
        when(hostelRoomRepository.count()).thenReturn(100L);
        when(hostelBedRepository.count()).thenReturn(200L);
        when(hostelBedRepository.countByStatus(HostelBedStatus.AVAILABLE)).thenReturn(50L);
        when(hostelBedRepository.countByStatus(HostelBedStatus.OCCUPIED)).thenReturn(120L);
        when(hostelBedRepository.countByStatus(HostelBedStatus.RESERVED)).thenReturn(10L);
        when(hostelBedRepository.countByStatus(HostelBedStatus.MAINTENANCE)).thenReturn(10L);
        when(hostelBedRepository.countByStatus(HostelBedStatus.INACTIVE)).thenReturn(10L);

        // Requests
        when(academicResourceRequestRepository.countByStatus(RequestStatus.PENDING)).thenReturn(4L);
        when(hostelRequestRepository.countByStatus(RequestStatus.PENDING)).thenReturn(3L);

        // Allocations
        when(resourceAllocationRepository.countByStatus(AllocationStatus.ACTIVE)).thenReturn(8L);
        when(hostelAllocationRepository.countByStatus(AllocationStatus.ACTIVE)).thenReturn(120L);

        // Approvals
        when(approvalRepository.countByStatus(ApprovalStatus.PENDING)).thenReturn(5L);

        // Open Issues
        when(hostelComplaintRepository.countByStatusIn(any())).thenReturn(2L);
        when(maintenanceRequestRepository.countByStatusIn(any())).thenReturn(3L);

        // Audit Logs
        AuditLog sampleLog = new AuditLog();
        sampleLog.setId(101L);
        sampleLog.setAction("CREATE_USER");
        sampleLog.setEntityType("USER");
        sampleLog.setEntityId(42L);
        sampleLog.setCreatedAt(Instant.now());
        User adminUser = new User();
        adminUser.setUsername("admin_sys");
        sampleLog.setUser(adminUser);
        when(auditLogRepository.findRecentAuditLogs(any(PageRequest.class))).thenReturn(List.of(sampleLog));

        AdminDashboardOverviewResponse overview = adminDashboardService.getDashboardOverview();

        assertNotNull(overview);
        assertEquals(150, overview.getTotalUsers());
        assertEquals(6, overview.getTotalDepartments());
        assertEquals(5, overview.getActiveDepartments());
        assertEquals(40, overview.getTotalAcademicResources());
        assertEquals(4, overview.getTotalHostels());
        assertEquals(100, overview.getTotalRooms());
        assertEquals(200, overview.getTotalBeds());

        // Operational
        assertEquals(7, overview.getPendingRequests()); // 4 acad + 3 hostel
        assertEquals(128, overview.getActiveAllocations()); // 8 acad + 120 hostel
        assertEquals(5, overview.getPendingApprovals());
        assertEquals(5, overview.getOpenIssues()); // 2 complaints + 3 maintenance

        // Academic Utilization: 10 / (25 + 10) = 10 / 35 = 28.6%
        assertEquals(28.6, overview.getAcademicResourceOverview().getUtilizationRate());

        // Hostel Occupancy: usable = 50 + 120 + 10 = 180; occupied = 120; 120 / 180 = 66.7%
        assertEquals(180, overview.getHostelResourceOverview().getUsableBeds());
        assertEquals(66.7, overview.getHostelResourceOverview().getOccupancyRate());

        // Recent Activities
        assertEquals(1, overview.getRecentActivities().size());
        assertEquals("admin_sys", overview.getRecentActivities().get(0).getUsername());
        assertEquals("CREATE_USER", overview.getRecentActivities().get(0).getAction());
    }

    @Test
    @DisplayName("User distribution correctly maps all institutional roles")
    void testUserDistributionByRole() {
        when(userRepository.count()).thenReturn(60L);
        when(userRepository.countUsersByRoleName()).thenReturn(List.of(
                new Object[]{"ROLE_ADMIN", 2L},
                new Object[]{"ROLE_PRINCIPAL", 1L},
                new Object[]{"ROLE_HOD", 4L},
                new Object[]{"ROLE_FACULTY", 15L},
                new Object[]{"ROLE_STUDENT", 35L},
                new Object[]{"ROLE_WARDEN", 3L}
        ));

        UserDistributionDto dist = adminDashboardService.getUserDistribution();

        assertNotNull(dist);
        assertEquals(60, dist.getTotalUsers());
        assertEquals(2, dist.getAdminCount());
        assertEquals(1, dist.getPrincipalCount());
        assertEquals(4, dist.getHodCount());
        assertEquals(15, dist.getFacultyCount());
        assertEquals(35, dist.getStudentCount());
        assertEquals(3, dist.getWardenCount());
    }
}
