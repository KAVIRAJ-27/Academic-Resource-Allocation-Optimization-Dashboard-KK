package com.ahrao.service;

import com.ahrao.dto.hod.resource.HodApprovalActionRequest;
import com.ahrao.dto.hod.resource.HodResourceRequestDetailDto;
import com.ahrao.dto.hod.resource.HodResourceRequestOverviewKpiDto;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Faculty;
import com.ahrao.entity.approval.Approval;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.ApprovalLevel;
import com.ahrao.entity.enums.ApprovalStatus;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.enums.ResourceStatus;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.approval.ApprovalRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.resource.ResourceRepository;
import com.ahrao.service.hod.HodDepartmentResolver;
import com.ahrao.service.hod.HodResourceRequestServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HodResourceRequestServiceTest {

    @Mock
    private HodDepartmentResolver departmentResolver;

    @Mock
    private AcademicResourceRequestRepository requestRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private ApprovalRepository approvalRepository;

    @Mock
    private ResourceAllocationRepository allocationRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private HodResourceRequestServiceImpl service;

    private static final Long HOD_USER_ID = 101L;

    private Department deptA;
    private Department deptB;
    private User hodUser;
    private Faculty hodFaculty;
    private User requesterUser;

    @BeforeEach
    void setUp() {
        deptA = new Department();
        deptA.setId(10L);
        deptA.setName("Computer Science");

        deptB = new Department();
        deptB.setId(20L);
        deptB.setName("Mechanical Engineering");

        hodUser = new User();
        hodUser.setId(HOD_USER_ID);
        hodUser.setEmail("hod_cs@univ.edu");
        hodUser.setFirstName("Alan");
        hodUser.setLastName("Turing");

        hodFaculty = new Faculty();
        hodFaculty.setId(1L);
        hodFaculty.setUser(hodUser);
        hodFaculty.setDepartment(deptA);

        requesterUser = new User();
        requesterUser.setId(201L);
        requesterUser.setEmail("faculty_cs@univ.edu");
        requesterUser.setFirstName("Ada");
        requesterUser.setLastName("Lovelace");
    }

    @Test
    @DisplayName("HOD can view request details for own department")
    void testGetRequestDetails_OwnDepartment_Success() {
        when(departmentResolver.resolveHodDepartment(HOD_USER_ID)).thenReturn(deptA);

        AcademicResourceRequest request = new AcademicResourceRequest();
        request.setId(50L);
        request.setDepartment(deptA);
        request.setRequester(requesterUser);
        request.setPurpose("AI Lab Session");
        request.setRequestedDate(LocalDate.now().plusDays(2));
        request.setStartTime(LocalTime.of(10, 0));
        request.setEndTime(LocalTime.of(12, 0));
        request.setStatus(RequestStatus.PENDING);

        when(requestRepository.findById(50L)).thenReturn(Optional.of(request));
        when(approvalRepository.findByEntityTypeAndEntityId(eq("AcademicResourceRequest"), eq(50L)))
                .thenReturn(Collections.emptyList());
        when(allocationRepository.findFirstByRequestId(50L)).thenReturn(Optional.empty());

        HodResourceRequestDetailDto detail = service.getRequestDetails(HOD_USER_ID, 50L);

        assertNotNull(detail);
        assertEquals(50L, detail.getId());
        assertEquals("AI Lab Session", detail.getPurpose());
        assertEquals("Computer Science", detail.getDepartmentName());
    }

    @Test
    @DisplayName("HOD cannot view request details belonging to another department (403 Forbidden)")
    void testGetRequestDetails_ForeignDepartment_Forbidden() {
        when(departmentResolver.resolveHodDepartment(HOD_USER_ID)).thenReturn(deptA);

        AcademicResourceRequest request = new AcademicResourceRequest();
        request.setId(99L);
        request.setDepartment(deptB); // Belongs to Mech Eng

        when(requestRepository.findById(99L)).thenReturn(Optional.of(request));

        assertThrows(ForbiddenException.class, () -> service.getRequestDetails(HOD_USER_ID, 99L));
    }

    @Test
    @DisplayName("HOD can approve PENDING request: updates status, saves Approval, and logs audit")
    void testApproveRequest_Success() {
        when(departmentResolver.resolveHodDepartment(HOD_USER_ID)).thenReturn(deptA);
        when(departmentResolver.resolveHodFaculty(HOD_USER_ID)).thenReturn(hodFaculty);

        AcademicResourceRequest request = new AcademicResourceRequest();
        request.setId(60L);
        request.setDepartment(deptA);
        request.setRequester(requesterUser);
        request.setStatus(RequestStatus.PENDING);

        when(requestRepository.findById(60L)).thenReturn(Optional.of(request));
        when(approvalRepository.findByEntityTypeAndEntityId(any(), any())).thenReturn(Collections.emptyList());

        HodApprovalActionRequest actionReq = new HodApprovalActionRequest("Approved for semester lab work");
        HodResourceRequestDetailDto result = service.approveRequest(HOD_USER_ID, 60L, actionReq);

        assertNotNull(result);
        assertEquals(RequestStatus.APPROVED, request.getStatus());
        verify(requestRepository, times(1)).save(request);

        ArgumentCaptor<Approval> approvalCaptor = ArgumentCaptor.forClass(Approval.class);
        verify(approvalRepository, times(1)).save(approvalCaptor.capture());
        Approval savedApproval = approvalCaptor.getValue();
        assertEquals("AcademicResourceRequest", savedApproval.getEntityType());
        assertEquals(60L, savedApproval.getEntityId());
        assertEquals(ApprovalLevel.HOD, savedApproval.getApprovalLevel());
        assertEquals(ApprovalStatus.APPROVED, savedApproval.getStatus());
        assertEquals("Approved for semester lab work", savedApproval.getComments());

        ArgumentCaptor<AuditLog> auditCaptor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository, times(1)).save(auditCaptor.capture());
        assertEquals("HOD_RESOURCE_REQUEST_APPROVED", auditCaptor.getValue().getAction());
    }

    @Test
    @DisplayName("HOD cannot approve request that is not in PENDING status (409 Conflict)")
    void testApproveRequest_NotPending_Conflict() {
        when(departmentResolver.resolveHodDepartment(HOD_USER_ID)).thenReturn(deptA);
        when(departmentResolver.resolveHodFaculty(HOD_USER_ID)).thenReturn(hodFaculty);

        AcademicResourceRequest request = new AcademicResourceRequest();
        request.setId(70L);
        request.setDepartment(deptA);
        request.setStatus(RequestStatus.APPROVED); // Already approved

        when(requestRepository.findById(70L)).thenReturn(Optional.of(request));

        assertThrows(ConflictException.class, () ->
                service.approveRequest(HOD_USER_ID, 70L, new HodApprovalActionRequest("duplicate approve")));
    }

    @Test
    @DisplayName("HOD cannot approve foreign department request (403 Forbidden)")
    void testApproveRequest_ForeignDepartment_Forbidden() {
        when(departmentResolver.resolveHodDepartment(HOD_USER_ID)).thenReturn(deptA);
        when(departmentResolver.resolveHodFaculty(HOD_USER_ID)).thenReturn(hodFaculty);

        AcademicResourceRequest request = new AcademicResourceRequest();
        request.setId(80L);
        request.setDepartment(deptB); // Mech Eng

        when(requestRepository.findById(80L)).thenReturn(Optional.of(request));

        assertThrows(ForbiddenException.class, () ->
                service.approveRequest(HOD_USER_ID, 80L, new HodApprovalActionRequest("approve foreign")));
    }

    @Test
    @DisplayName("HOD can reject PENDING request with reason: updates status, saves Approval, and logs audit")
    void testRejectRequest_Success() {
        when(departmentResolver.resolveHodDepartment(HOD_USER_ID)).thenReturn(deptA);
        when(departmentResolver.resolveHodFaculty(HOD_USER_ID)).thenReturn(hodFaculty);

        AcademicResourceRequest request = new AcademicResourceRequest();
        request.setId(90L);
        request.setDepartment(deptA);
        request.setRequester(requesterUser);
        request.setStatus(RequestStatus.PENDING);

        when(requestRepository.findById(90L)).thenReturn(Optional.of(request));
        when(approvalRepository.findByEntityTypeAndEntityId(any(), any())).thenReturn(Collections.emptyList());

        HodApprovalActionRequest actionReq = new HodApprovalActionRequest("Resource under scheduled calibration");
        HodResourceRequestDetailDto result = service.rejectRequest(HOD_USER_ID, 90L, actionReq);

        assertNotNull(result);
        assertEquals(RequestStatus.REJECTED, request.getStatus());
        verify(requestRepository, times(1)).save(request);

        ArgumentCaptor<Approval> approvalCaptor = ArgumentCaptor.forClass(Approval.class);
        verify(approvalRepository, times(1)).save(approvalCaptor.capture());
        assertEquals(ApprovalStatus.REJECTED, approvalCaptor.getValue().getStatus());
        assertEquals("Resource under scheduled calibration", approvalCaptor.getValue().getComments());

        ArgumentCaptor<AuditLog> auditCaptor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository, times(1)).save(auditCaptor.capture());
        assertEquals("HOD_RESOURCE_REQUEST_REJECTED", auditCaptor.getValue().getAction());
    }

    @Test
    @DisplayName("HOD cannot reject request without reason (400 Bad Request)")
    void testRejectRequest_MissingReason_BadRequest() {
        when(departmentResolver.resolveHodDepartment(HOD_USER_ID)).thenReturn(deptA);
        when(departmentResolver.resolveHodFaculty(HOD_USER_ID)).thenReturn(hodFaculty);

        AcademicResourceRequest request = new AcademicResourceRequest();
        request.setId(91L);
        request.setDepartment(deptA);
        request.setStatus(RequestStatus.PENDING);

        when(requestRepository.findById(91L)).thenReturn(Optional.of(request));

        assertThrows(BadRequestException.class, () ->
                service.rejectRequest(HOD_USER_ID, 91L, new HodApprovalActionRequest("   ")));
    }

    @Test
    @DisplayName("HOD request summary returns genuine database metrics")
    void testGetRequestSummary_Success() {
        when(departmentResolver.resolveHodDepartment(HOD_USER_ID)).thenReturn(deptA);

        when(requestRepository.countByDepartmentIdAndStatus(10L, RequestStatus.PENDING)).thenReturn(4L);
        when(requestRepository.countByDepartmentIdAndStatus(10L, RequestStatus.APPROVED)).thenReturn(12L);
        when(requestRepository.countByDepartmentIdAndStatus(10L, RequestStatus.REJECTED)).thenReturn(2L);
        when(requestRepository.countByDepartmentIdAndStatus(10L, RequestStatus.CANCELLED)).thenReturn(1L);
        when(requestRepository.countByDepartmentId(10L)).thenReturn(19L);

        when(resourceRepository.countByDepartmentId(10L)).thenReturn(8L);
        when(resourceRepository.countByDepartmentIdAndStatus(10L, ResourceStatus.AVAILABLE)).thenReturn(5L);
        when(resourceRepository.countByDepartmentIdAndStatus(10L, ResourceStatus.ALLOCATED)).thenReturn(2L);
        when(resourceRepository.countByDepartmentIdAndStatus(10L, ResourceStatus.MAINTENANCE)).thenReturn(1L);
        when(resourceRepository.countByDepartmentIdAndStatus(10L, ResourceStatus.INACTIVE)).thenReturn(0L);

        HodResourceRequestOverviewKpiDto summary = service.getRequestSummary(HOD_USER_ID);

        assertNotNull(summary);
        assertEquals(4L, summary.getPendingCount());
        assertEquals(12L, summary.getApprovedCount());
        assertEquals(2L, summary.getRejectedCount());
        assertEquals(19L, summary.getTotalRequestsCount());
        assertEquals(8L, summary.getTotalResources());
        assertEquals(5L, summary.getAvailableResources());
        assertEquals(2L, summary.getAllocatedResources());
    }
}
