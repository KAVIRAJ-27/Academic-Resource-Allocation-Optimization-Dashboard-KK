package com.ahrao.service;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.*;
import com.ahrao.entity.enums.ComplaintStatus;
import com.ahrao.entity.enums.MaintenanceStatus;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.hostel.HostelFacility;
import com.ahrao.entity.hostel.Warden;
import com.ahrao.entity.request.HostelComplaint;
import com.ahrao.entity.request.MaintenanceRequest;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
import com.ahrao.repository.hostel.HostelFacilityRepository;
import com.ahrao.repository.hostel.HostelRepository;
import com.ahrao.repository.request.HostelComplaintRepository;
import com.ahrao.repository.request.MaintenanceRequestRepository;
import com.ahrao.repository.resource.ResourceRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.warden.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import org.mockito.ArgumentMatchers;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WardenOperationsServiceTest {

    @Mock
    private HostelFacilityRepository hostelFacilityRepository;
    @Mock
    private HostelComplaintRepository hostelComplaintRepository;
    @Mock
    private MaintenanceRequestRepository maintenanceRequestRepository;
    @Mock
    private HostelBedRepository hostelBedRepository;
    @Mock
    private HostelAllocationRepository hostelAllocationRepository;
    @Mock
    private WardenScopeService wardenScopeService;
    @Mock
    private AuditLogRepository auditLogRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private HostelRepository hostelRepository;
    @Mock
    private ResourceRepository resourceRepository;

    private WardenResourceService wardenResourceService;
    private WardenComplaintService wardenComplaintService;
    private WardenMaintenanceService wardenMaintenanceService;
    private WardenOverviewService wardenOverviewService;

    private Hostel testHostel;
    private Warden testWarden;
    private User wardenUser;

    @BeforeEach
    void setUp() {
        wardenResourceService = new WardenResourceServiceImpl(hostelFacilityRepository, wardenScopeService, auditLogRepository);
        wardenComplaintService = new WardenComplaintServiceImpl(hostelComplaintRepository, wardenScopeService, auditLogRepository);
        wardenMaintenanceService = new WardenMaintenanceServiceImpl(maintenanceRequestRepository, wardenScopeService, auditLogRepository, userRepository, hostelRepository, resourceRepository);
        wardenOverviewService = new WardenOverviewServiceImpl(wardenScopeService, hostelBedRepository, hostelAllocationRepository, hostelFacilityRepository, hostelComplaintRepository, maintenanceRequestRepository);

        testHostel = new Hostel();
        testHostel.setId(10L);
        testHostel.setName("Emerald Hostel");
        testHostel.setCode("EMR-01");

        wardenUser = new User();
        wardenUser.setId(1L);
        wardenUser.setFirstName("John");
        wardenUser.setLastName("Warden");
        wardenUser.setEmail("warden@university.edu");

        testWarden = new Warden();
        testWarden.setId(100L);
        testWarden.setUser(wardenUser);
        testWarden.setAssignedHostels(Set.of(testHostel));
    }

    // ==========================================
    // HOSTEL FACILITIES / RESOURCES TESTS
    // ==========================================

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("Should retrieve paged hostel facilities within authorized warden scope")
    void testGetFacilities_Success() {
        when(wardenScopeService.getAuthorizedHostelIds()).thenReturn(Set.of(10L));

        HostelFacility facility = new HostelFacility();
        facility.setId(101L);
        facility.setName("Water Purifier RO");
        facility.setHostel(testHostel);
        facility.setStatus("ACTIVE");
        facility.setQuantity(2);

        when(hostelFacilityRepository.findAll(ArgumentMatchers.<Specification<HostelFacility>>any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(facility)));

        PagedResponse<WardenFacilitySummaryDto> response = wardenResourceService.getFacilities(
                10L, "ACTIVE", "Water", 0, 15, "name", "asc");

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals("Water Purifier RO", response.getContent().get(0).getName());
        assertEquals("Emerald Hostel", response.getContent().get(0).getHostelName());
    }

    @Test
    @DisplayName("Should update facility status and description with audit logging")
    void testUpdateFacility_Success() {
        HostelFacility facility = new HostelFacility();
        facility.setId(101L);
        facility.setName("Study Hall Wi-Fi Router");
        facility.setHostel(testHostel);
        facility.setStatus("ACTIVE");
        facility.setDescription("Old 2.4GHz Router");

        when(wardenScopeService.validateFacilityAccess(101L)).thenReturn(facility);
        when(wardenScopeService.resolveWarden()).thenReturn(testWarden);
        when(hostelFacilityRepository.save(any(HostelFacility.class))).thenAnswer(i -> i.getArgument(0));

        UpdateFacilityRequest req = new UpdateFacilityRequest();
        req.setStatus("MAINTENANCE");
        req.setDescription("Upgraded to Wi-Fi 6 AP");

        WardenFacilityDetailDto result = wardenResourceService.updateFacility(101L, req, "127.0.0.1", "JUnit");

        assertNotNull(result);
        assertEquals("MAINTENANCE", result.getStatus());
        assertEquals("Upgraded to Wi-Fi 6 AP", result.getDescription());
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should throw BadRequestException when updating facility with invalid status")
    void testUpdateFacility_InvalidStatus_ThrowsBadRequest() {
        HostelFacility facility = new HostelFacility();
        facility.setId(101L);
        facility.setHostel(testHostel);

        when(wardenScopeService.validateFacilityAccess(101L)).thenReturn(facility);
        when(wardenScopeService.resolveWarden()).thenReturn(testWarden);

        UpdateFacilityRequest req = new UpdateFacilityRequest();
        req.setStatus("INVALID_STATUS");

        assertThrows(BadRequestException.class, () ->
                wardenResourceService.updateFacility(101L, req, "127.0.0.1", "JUnit"));
    }

    // ==========================================
    // HOSTEL COMPLAINTS TESTS
    // ==========================================

    @Test
    @DisplayName("Should transition complaint from OPEN to IN_PROGRESS and assign to warden")
    void testUpdateComplaintStatus_OpenToInProgress_Success() {
        HostelComplaint complaint = new HostelComplaint();
        complaint.setId(201L);
        complaint.setHostel(testHostel);
        complaint.setStatus(ComplaintStatus.OPEN);
        complaint.setTitle("Leaking shower valve");

        when(wardenScopeService.validateComplaintAccess(201L)).thenReturn(complaint);
        when(wardenScopeService.resolveWarden()).thenReturn(testWarden);
        when(hostelComplaintRepository.save(any(HostelComplaint.class))).thenAnswer(i -> i.getArgument(0));

        UpdateComplaintStatusRequest req = new UpdateComplaintStatusRequest();
        req.setStatus(ComplaintStatus.IN_PROGRESS);
        req.setRemarks("Investigating with plumber");

        WardenComplaintDetailDto result = wardenComplaintService.updateComplaintStatus(201L, req, "127.0.0.1", "JUnit");

        assertNotNull(result);
        assertEquals(ComplaintStatus.IN_PROGRESS, result.getStatus());
        assertEquals(wardenUser.getId(), complaint.getAssignedTo().getId());
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should transition complaint from IN_PROGRESS to RESOLVED and set resolvedAt timestamp")
    void testUpdateComplaintStatus_InProgressToResolved_Success() {
        HostelComplaint complaint = new HostelComplaint();
        complaint.setId(201L);
        complaint.setHostel(testHostel);
        complaint.setStatus(ComplaintStatus.IN_PROGRESS);

        when(wardenScopeService.validateComplaintAccess(201L)).thenReturn(complaint);
        when(wardenScopeService.resolveWarden()).thenReturn(testWarden);
        when(hostelComplaintRepository.save(any(HostelComplaint.class))).thenAnswer(i -> i.getArgument(0));

        UpdateComplaintStatusRequest req = new UpdateComplaintStatusRequest();
        req.setStatus(ComplaintStatus.RESOLVED);
        req.setRemarks("Valve replaced and tested");

        WardenComplaintDetailDto result = wardenComplaintService.updateComplaintStatus(201L, req, "127.0.0.1", "JUnit");

        assertNotNull(result);
        assertEquals(ComplaintStatus.RESOLVED, result.getStatus());
        assertNotNull(complaint.getResolvedAt());
    }

    @Test
    @DisplayName("Should throw ConflictException when attempting invalid complaint transition from CLOSED to IN_PROGRESS")
    void testUpdateComplaintStatus_ClosedToInProgress_ThrowsConflict() {
        HostelComplaint complaint = new HostelComplaint();
        complaint.setId(201L);
        complaint.setHostel(testHostel);
        complaint.setStatus(ComplaintStatus.CLOSED);

        when(wardenScopeService.validateComplaintAccess(201L)).thenReturn(complaint);
        when(wardenScopeService.resolveWarden()).thenReturn(testWarden);

        UpdateComplaintStatusRequest req = new UpdateComplaintStatusRequest();
        req.setStatus(ComplaintStatus.IN_PROGRESS);

        assertThrows(ConflictException.class, () ->
                wardenComplaintService.updateComplaintStatus(201L, req, "127.0.0.1", "JUnit"));
    }

    // ==========================================
    // MAINTENANCE REQUESTS TESTS
    // ==========================================

    @Test
    @DisplayName("Should transition maintenance from OPEN to ASSIGNED when assigned to technician")
    void testAssignMaintenance_Success() {
        MaintenanceRequest maintenance = new MaintenanceRequest();
        maintenance.setId(301L);
        maintenance.setHostel(testHostel);
        maintenance.setStatus(MaintenanceStatus.OPEN);

        User tech = new User();
        tech.setId(88L);
        tech.setFirstName("Bob");
        tech.setLastName("Electrician");

        when(wardenScopeService.validateMaintenanceAccess(301L)).thenReturn(maintenance);
        when(wardenScopeService.resolveWarden()).thenReturn(testWarden);
        when(userRepository.findById(88L)).thenReturn(Optional.of(tech));
        when(maintenanceRequestRepository.save(any(MaintenanceRequest.class))).thenAnswer(i -> i.getArgument(0));

        AssignMaintenanceRequest req = new AssignMaintenanceRequest();
        req.setAssignedToId(88L);

        WardenMaintenanceDetailDto result = wardenMaintenanceService.assignMaintenance(301L, req, "127.0.0.1", "JUnit");

        assertNotNull(result);
        assertEquals(MaintenanceStatus.ASSIGNED, result.getStatus());
        assertEquals(88L, maintenance.getAssignedTo().getId());
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should transition maintenance from IN_PROGRESS to COMPLETED and set completedAt")
    void testUpdateMaintenanceStatus_InProgressToCompleted_Success() {
        MaintenanceRequest maintenance = new MaintenanceRequest();
        maintenance.setId(301L);
        maintenance.setHostel(testHostel);
        maintenance.setStatus(MaintenanceStatus.IN_PROGRESS);

        when(wardenScopeService.validateMaintenanceAccess(301L)).thenReturn(maintenance);
        when(wardenScopeService.resolveWarden()).thenReturn(testWarden);
        when(maintenanceRequestRepository.save(any(MaintenanceRequest.class))).thenAnswer(i -> i.getArgument(0));

        UpdateMaintenanceStatusRequest req = new UpdateMaintenanceStatusRequest();
        req.setStatus(MaintenanceStatus.COMPLETED);

        WardenMaintenanceDetailDto result = wardenMaintenanceService.updateMaintenanceStatus(301L, req, "127.0.0.1", "JUnit");

        assertNotNull(result);
        assertEquals(MaintenanceStatus.COMPLETED, result.getStatus());
        assertNotNull(maintenance.getCompletedAt());
    }

    @Test
    @DisplayName("Should throw ConflictException when attempting invalid maintenance transition from COMPLETED to IN_PROGRESS")
    void testUpdateMaintenanceStatus_CompletedToInProgress_ThrowsConflict() {
        MaintenanceRequest maintenance = new MaintenanceRequest();
        maintenance.setId(301L);
        maintenance.setHostel(testHostel);
        maintenance.setStatus(MaintenanceStatus.COMPLETED);

        when(wardenScopeService.validateMaintenanceAccess(301L)).thenReturn(maintenance);
        when(wardenScopeService.resolveWarden()).thenReturn(testWarden);

        UpdateMaintenanceStatusRequest req = new UpdateMaintenanceStatusRequest();
        req.setStatus(MaintenanceStatus.IN_PROGRESS);

        assertThrows(ConflictException.class, () ->
                wardenMaintenanceService.updateMaintenanceStatus(301L, req, "127.0.0.1", "JUnit"));
    }

    @Test
    @DisplayName("Should create maintenance request within authorized hostel scope")
    void testCreateMaintenanceRequest_Success() {
        when(wardenScopeService.validateHostelAccess(10L)).thenReturn(10L);
        when(wardenScopeService.resolveWarden()).thenReturn(testWarden);
        when(hostelRepository.findById(10L)).thenReturn(Optional.of(testHostel));
        when(maintenanceRequestRepository.save(any(MaintenanceRequest.class))).thenAnswer(i -> {
            MaintenanceRequest m = i.getArgument(0);
            return m;
        });

        CreateWardenMaintenanceRequest req = new CreateWardenMaintenanceRequest();
        req.setHostelId(10L);
        req.setTitle("Geyser tripping main breaker");
        req.setDescription("B-Block 2nd floor bathroom geyser short-circuit");
        req.setPriority(PriorityLevel.HIGH);

        WardenMaintenanceDetailDto result = wardenMaintenanceService.createMaintenanceRequest(req, "127.0.0.1", "JUnit");

        assertNotNull(result);
        assertEquals("Geyser tripping main breaker", result.getTitle());
        assertEquals(MaintenanceStatus.OPEN, result.getStatus());
        assertEquals(PriorityLevel.HIGH, result.getPriority());
        verify(auditLogRepository, times(1)).save(any());
    }

    // ==========================================
    // OVERVIEW METRICS TEST
    // ==========================================

    @Test
    @DisplayName("Should aggregate real hostel telemetry across warden's authorized hostels")
    void testGetWardenOverview_AggregatesCounts() {
        when(wardenScopeService.getAuthorizedHostelIds()).thenReturn(Set.of(10L));

        when(hostelBedRepository.countByRoomFloorBlockHostelIdIn(Set.of(10L))).thenReturn(120L);
        when(hostelBedRepository.countByRoomFloorBlockHostelIdInAndStatus(Set.of(10L), com.ahrao.entity.enums.HostelBedStatus.OCCUPIED)).thenReturn(80L);
        when(hostelBedRepository.countByRoomFloorBlockHostelIdInAndStatus(Set.of(10L), com.ahrao.entity.enums.HostelBedStatus.AVAILABLE)).thenReturn(40L);
        when(hostelAllocationRepository.countByHostelBedRoomFloorBlockHostelIdInAndStatus(Set.of(10L), com.ahrao.entity.enums.AllocationStatus.ACTIVE)).thenReturn(80L);
        when(hostelFacilityRepository.countByHostelIdIn(Set.of(10L))).thenReturn(15L);
        when(hostelFacilityRepository.countByHostelIdInAndStatus(Set.of(10L), "ACTIVE")).thenReturn(12L);
        when(hostelComplaintRepository.countByHostelIdInAndStatusIn(eq(Set.of(10L)), any())).thenReturn(4L);
        when(maintenanceRequestRepository.countByHostelIdInAndStatusIn(eq(Set.of(10L)), any())).thenReturn(2L);

        WardenOverviewDto overview = wardenOverviewService.getWardenOverview(10L);

        assertNotNull(overview);
        assertEquals(120L, overview.getTotalBeds());
        assertEquals(80L, overview.getOccupiedBeds());
        assertEquals(40L, overview.getAvailableBeds());
        assertEquals(80L, overview.getResidentStudents());
        assertEquals(15L, overview.getTotalFacilities());
        assertEquals(12L, overview.getActiveFacilities());
        assertEquals(4L, overview.getOpenComplaints());
        assertEquals(2L, overview.getOpenMaintenance());
    }
}
