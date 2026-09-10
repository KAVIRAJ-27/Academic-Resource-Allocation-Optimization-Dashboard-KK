package com.ahrao.service.approval;

import com.ahrao.dto.academic.allocation.AcademicAllocationDetailDto;
import com.ahrao.dto.academic.allocation.CreateAcademicAllocationRequest;
import com.ahrao.dto.approval.*;
import com.ahrao.dto.conflict.ConflictCheckRequestDto;
import com.ahrao.dto.conflict.ConflictItemDto;
import com.ahrao.dto.conflict.ConflictResultDto;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.approval.Approval;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.ApprovalLevel;
import com.ahrao.entity.enums.ApprovalStatus;
import com.ahrao.entity.enums.ConflictCode;
import com.ahrao.entity.enums.ConflictSeverity;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.resource.Resource;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.repository.approval.ApprovalRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
import com.ahrao.repository.notification.NotificationRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.request.HostelRequestRepository;
import com.ahrao.repository.resource.ResourceRepository;
import com.ahrao.service.academic.allocation.AcademicAllocationService;
import com.ahrao.service.conflict.ConflictDetectionService;
import com.ahrao.service.hostel.HostelResourceAllocationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApprovalServiceTest {

    @Mock
    private ApprovalRepository approvalRepository;

    @Mock
    private ApprovalRoutingService approvalRoutingService;

    @Mock
    private AllocationTrackingService allocationTrackingService;

    @Mock
    private AcademicResourceRequestRepository academicRequestRepository;

    @Mock
    private HostelRequestRepository hostelRequestRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private HostelBedRepository hostelBedRepository;

    @Mock
    private ConflictDetectionService conflictDetectionService;

    @Mock
    private AcademicAllocationService academicAllocationService;

    @Mock
    private HostelResourceAllocationService hostelResourceAllocationService;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private ApprovalServiceImpl approvalService;

    private User requester;
    private User approver;
    private AcademicResourceRequest academicRequest;
    private Resource resource;
    private Approval pendingApproval;

    @BeforeEach
    void setUp() {
        requester = new User();
        requester.setId(10L);
        requester.setUsername("requester1");
        requester.setEmail("req@ahrao.edu");
        requester.setRoles(Set.of(new Role("ROLE_FACULTY", "Faculty")));

        approver = new User();
        approver.setId(20L);
        approver.setUsername("approver1");
        approver.setEmail("app@ahrao.edu");
        approver.setRoles(Set.of(new Role("ROLE_HOD", "HOD")));

        Department dept = new Department();
        dept.setId(1L);
        dept.setName("Computer Science");

        resource = new Resource();
        resource.setId(101L);
        resource.setName("CSE Lab 1");
        resource.setCode("CSE-LAB-1");
        resource.setCapacity(50);
        resource.setLocation("CS Block, 1st Floor");

        academicRequest = new AcademicResourceRequest();
        academicRequest.setId(500L);
        academicRequest.setRequester(requester);
        academicRequest.setDepartment(dept);
        academicRequest.setRequestedResource(resource);
        academicRequest.setPurpose("Database Practicals");
        academicRequest.setRequestedDate(LocalDate.now().plusDays(2));
        academicRequest.setStartTime(LocalTime.of(10, 0));
        academicRequest.setEndTime(LocalTime.of(12, 0));
        academicRequest.setQuantity(40);
        academicRequest.setStatus(RequestStatus.PENDING);

        pendingApproval = new Approval();
        pendingApproval.setId(1000L);
        pendingApproval.setEntityType("AcademicResourceRequest");
        pendingApproval.setEntityId(500L);
        pendingApproval.setRequestedBy(requester);
        pendingApproval.setApprovalLevel(ApprovalLevel.HOD);
        pendingApproval.setStatus(ApprovalStatus.PENDING);
        pendingApproval.setComments("Review needed");
    }

    @Test
    @DisplayName("Create Approval: Valid request creates PENDING approval successfully")
    void testCreateApproval_Success() {
        CreateApprovalRequestDto dto = new CreateApprovalRequestDto(
                "ACADEMIC_RESOURCE", 500L, 101L, null, "Please approve urgently");

        when(academicRequestRepository.findById(500L)).thenReturn(Optional.of(academicRequest));
        when(approvalRepository.findByEntityTypeAndEntityId("AcademicResourceRequest", 500L))
                .thenReturn(Collections.emptyList());
        when(approvalRoutingService.determineApprovalLevel(eq("AcademicResourceRequest"), eq(500L), any(User.class)))
                .thenReturn(ApprovalLevel.HOD);
        when(approvalRepository.save(any(Approval.class))).thenAnswer(invocation -> {
            Approval a = invocation.getArgument(0);
            a.setId(1000L);
            return a;
        });

        ApprovalSummaryDto result = approvalService.createApproval(dto, requester);

        assertNotNull(result);
        assertEquals(1000L, result.getId());
        assertEquals(ApprovalStatus.PENDING, result.getStatus());
        verify(approvalRepository, times(1)).save(any(Approval.class));
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    @DisplayName("Create Approval: Duplicate pending approval is blocked with 409 Conflict")
    void testCreateApproval_DuplicatePending_ThrowsConflictException() {
        CreateApprovalRequestDto dto = new CreateApprovalRequestDto(
                "ACADEMIC_RESOURCE", 500L, null, null, null);

        when(academicRequestRepository.findById(500L)).thenReturn(Optional.of(academicRequest));
        when(approvalRepository.findByEntityTypeAndEntityId("AcademicResourceRequest", 500L))
                .thenReturn(List.of(pendingApproval));

        assertThrows(ConflictException.class, () -> approvalService.createApproval(dto, requester));
        verify(approvalRepository, never()).save(any(Approval.class));
    }

    @Test
    @DisplayName("Approve Academic: Phase 30 passes -> Phase 28 allocates -> status updated to APPROVED")
    void testApprove_AcademicRequest_SuccessWithAllocation() {
        ApprovalActionRequestDto actionReq = new ApprovalActionRequestDto("Approved for lab session");

        when(approvalRepository.findById(1000L)).thenReturn(Optional.of(pendingApproval));
        when(academicRequestRepository.findById(500L)).thenReturn(Optional.of(academicRequest));
        when(resourceRepository.findById(101L)).thenReturn(Optional.of(resource));

        // Conflict check returns valid
        ConflictResultDto conflictResult = ConflictResultDto.valid();
        when(conflictDetectionService.detectAcademicConflicts(any(ConflictCheckRequestDto.class), eq(approver)))
                .thenReturn(conflictResult);

        // Phase 28 allocates
        AcademicAllocationDetailDto allocDetail = new AcademicAllocationDetailDto();
        allocDetail.setId(888L);
        when(academicAllocationService.allocateResource(any(CreateAcademicAllocationRequest.class), eq(approver)))
                .thenReturn(allocDetail);

        when(approvalRepository.save(any(Approval.class))).thenReturn(pendingApproval);

        ApprovalDetailDto result = approvalService.approve(1000L, actionReq, approver, "127.0.0.1", "JUnit");

        assertNotNull(result);
        assertEquals(ApprovalStatus.APPROVED, pendingApproval.getStatus());
        assertEquals(approver, pendingApproval.getApprovedBy());
        assertEquals(RequestStatus.APPROVED, academicRequest.getStatus());

        verify(academicAllocationService, times(1)).allocateResource(any(CreateAcademicAllocationRequest.class), eq(approver));
        verify(auditLogRepository, atLeast(1)).save(any(AuditLog.class));
    }

    @Test
    @DisplayName("Approve Academic: Phase 30 Conflict detected -> blocks allocation with 409 Conflict")
    void testApprove_StaleConflictDetected_ThrowsConflictException() {
        ApprovalActionRequestDto actionReq = new ApprovalActionRequestDto("Approved");

        when(approvalRepository.findById(1000L)).thenReturn(Optional.of(pendingApproval));
        when(academicRequestRepository.findById(500L)).thenReturn(Optional.of(academicRequest));
        when(resourceRepository.findById(101L)).thenReturn(Optional.of(resource));

        // Conflict detection returns conflict (e.g. resource was booked in the interim)
        ConflictResultDto conflictResult = new ConflictResultDto();
        conflictResult.setCanAllocate(false);
        conflictResult.addConflict(new ConflictItemDto(
                ConflictCode.RESOURCE_DOUBLE_BOOKED,
                com.ahrao.entity.enums.ConflictDomain.ACADEMIC,
                ConflictSeverity.ERROR,
                "Resource",
                101L,
                "Resource is occupied"
        ));

        when(conflictDetectionService.detectAcademicConflicts(any(ConflictCheckRequestDto.class), eq(approver)))
                .thenReturn(conflictResult);

        ConflictException ex = assertThrows(ConflictException.class, () ->
                approvalService.approve(1000L, actionReq, approver, "127.0.0.1", "JUnit"));

        assertTrue(ex.getMessage().contains("no longer available"));
        verify(academicAllocationService, never()).allocateResource(any(), any());
        assertEquals(ApprovalStatus.PENDING, pendingApproval.getStatus());
    }

    @Test
    @DisplayName("Reject: Valid comments update status to REJECTED")
    void testReject_SuccessWithMandatoryComments() {
        ApprovalActionRequestDto actionReq = new ApprovalActionRequestDto("Department capacity limit reached");

        when(approvalRepository.findById(1000L)).thenReturn(Optional.of(pendingApproval));
        when(academicRequestRepository.findById(500L)).thenReturn(Optional.of(academicRequest));
        when(approvalRepository.save(any(Approval.class))).thenReturn(pendingApproval);

        ApprovalDetailDto result = approvalService.reject(1000L, actionReq, approver, "127.0.0.1", "JUnit");

        assertNotNull(result);
        assertEquals(ApprovalStatus.REJECTED, pendingApproval.getStatus());
        assertEquals(approver, pendingApproval.getApprovedBy());
        assertEquals(RequestStatus.REJECTED, academicRequest.getStatus());
        verify(academicAllocationService, never()).allocateResource(any(), any());
    }

    @Test
    @DisplayName("Reject: Missing comments throws 400 BadRequestException")
    void testReject_MissingComments_ThrowsBadRequestException() {
        ApprovalActionRequestDto actionReq = new ApprovalActionRequestDto("   ");

        when(approvalRepository.findById(1000L)).thenReturn(Optional.of(pendingApproval));

        assertThrows(BadRequestException.class, () ->
                approvalService.reject(1000L, actionReq, approver, "127.0.0.1", "JUnit"));
    }

    @Test
    @DisplayName("State Transition: Already approved/rejected request cannot be re-approved")
    void testApprove_AlreadyProcessed_ThrowsConflictException() {
        pendingApproval.setStatus(ApprovalStatus.APPROVED);
        when(approvalRepository.findById(1000L)).thenReturn(Optional.of(pendingApproval));

        assertThrows(ConflictException.class, () ->
                approvalService.approve(1000L, new ApprovalActionRequestDto("Again"), approver, "127.0.0.1", "JUnit"));
    }
}
