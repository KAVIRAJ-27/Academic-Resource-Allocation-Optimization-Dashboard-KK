package com.ahrao.service.approval;

import com.ahrao.entity.academic.Department;
import com.ahrao.entity.approval.Approval;
import com.ahrao.entity.enums.ApprovalLevel;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.request.HostelRequest;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.request.HostelRequestRepository;
import com.ahrao.service.hod.HodDepartmentResolver;
import com.ahrao.service.principal.PrincipalInstitutionResolver;
import com.ahrao.service.warden.WardenScopeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApprovalRoutingServiceTest {

    @Mock
    private AcademicResourceRequestRepository academicRequestRepository;

    @Mock
    private HostelRequestRepository hostelRequestRepository;

    @Mock
    private HodDepartmentResolver hodDepartmentResolver;

    @Mock
    private WardenScopeService wardenScopeService;

    @Mock
    private PrincipalInstitutionResolver principalInstitutionResolver;

    @InjectMocks
    private ApprovalRoutingServiceImpl routingService;

    private User facultyUser;
    private User hodUser;
    private User principalUser;
    private User wardenUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        facultyUser = new User();
        facultyUser.setId(1L);
        facultyUser.setUsername("faculty1");
        facultyUser.setRoles(Set.of(new Role("ROLE_FACULTY", "Faculty")));

        hodUser = new User();
        hodUser.setId(2L);
        hodUser.setUsername("hod1");
        hodUser.setRoles(Set.of(new Role("ROLE_HOD", "HOD")));

        principalUser = new User();
        principalUser.setId(3L);
        principalUser.setUsername("principal1");
        principalUser.setRoles(Set.of(new Role("ROLE_PRINCIPAL", "Principal")));

        wardenUser = new User();
        wardenUser.setId(4L);
        wardenUser.setUsername("warden1");
        wardenUser.setRoles(Set.of(new Role("ROLE_WARDEN", "Warden")));

        adminUser = new User();
        adminUser.setId(5L);
        adminUser.setUsername("admin1");
        adminUser.setRoles(Set.of(new Role("ROLE_ADMIN", "Admin")));
    }

    @Test
    @DisplayName("Determine Level: Faculty academic request routes to HOD")
    void testDetermineApprovalLevel_FacultyRequest_ReturnsHOD() {
        ApprovalLevel level = routingService.determineApprovalLevel("AcademicResourceRequest", 101L, facultyUser);
        assertEquals(ApprovalLevel.HOD, level);
    }

    @Test
    @DisplayName("Determine Level: HOD academic request routes to PRINCIPAL")
    void testDetermineApprovalLevel_HODRequest_ReturnsPrincipal() {
        ApprovalLevel level = routingService.determineApprovalLevel("AcademicResourceRequest", 102L, hodUser);
        assertEquals(ApprovalLevel.PRINCIPAL, level);
    }

    @Test
    @DisplayName("Determine Level: Hostel request routes to WARDEN")
    void testDetermineApprovalLevel_HostelRequest_ReturnsWarden() {
        ApprovalLevel level = routingService.determineApprovalLevel("HostelRequest", 201L, facultyUser);
        assertEquals(ApprovalLevel.WARDEN, level);
    }

    @Test
    @DisplayName("Self Approval: Requesters cannot approve their own requests")
    void testValidateSelfApproval_SameUser_ThrowsForbiddenException() {
        Approval approval = new Approval();
        approval.setId(10L);
        approval.setRequestedBy(hodUser);

        ForbiddenException exception = assertThrows(ForbiddenException.class, () ->
                routingService.validateSelfApproval(approval, hodUser));

        assertTrue(exception.getMessage().contains("Self-approval is strictly prohibited"));
    }

    @Test
    @DisplayName("Approver Scope: HOD from another department is rejected")
    void testValidateApproverScope_HODDepartmentMismatch_ThrowsForbiddenException() {
        Approval approval = new Approval();
        approval.setId(11L);
        approval.setEntityType("AcademicResourceRequest");
        approval.setEntityId(201L);
        approval.setRequestedBy(facultyUser);
        approval.setApprovalLevel(ApprovalLevel.HOD);

        Department deptA = new Department();
        deptA.setId(10L);
        deptA.setName("Computer Science");

        Department deptB = new Department();
        deptB.setId(20L);
        deptB.setName("Electrical Engineering");

        AcademicResourceRequest request = new AcademicResourceRequest();
        request.setId(201L);
        request.setDepartment(deptA);

        when(academicRequestRepository.findById(201L)).thenReturn(Optional.of(request));
        when(hodDepartmentResolver.resolveHodDepartment(hodUser.getId())).thenReturn(deptB);

        ForbiddenException ex = assertThrows(ForbiddenException.class, () ->
                routingService.validateApproverScope(approval, hodUser));

        assertTrue(ex.getMessage().contains("only approve requests belonging to your department"));
    }

    @Test
    @DisplayName("Approver Scope: Warden outside assigned hostel is rejected")
    void testValidateApproverScope_WardenHostelMismatch_ThrowsForbiddenException() {
        Approval approval = new Approval();
        approval.setId(12L);
        approval.setEntityType("HostelRequest");
        approval.setEntityId(301L);
        approval.setRequestedBy(facultyUser);
        approval.setApprovalLevel(ApprovalLevel.WARDEN);

        Hostel hostel = new Hostel();
        hostel.setId(99L);
        hostel.setName("Himalaya Hostel");

        HostelRequest hostelRequest = new HostelRequest();
        hostelRequest.setId(301L);
        hostelRequest.setHostel(hostel);

        when(hostelRequestRepository.findById(301L)).thenReturn(Optional.of(hostelRequest));
        when(wardenScopeService.getAuthorizedHostelIds()).thenReturn(Set.of(1L, 2L)); // Authorized only for 1 and 2

        ForbiddenException ex = assertThrows(ForbiddenException.class, () ->
                routingService.validateApproverScope(approval, wardenUser));

        assertTrue(ex.getMessage().contains("not authorized to review requests for hostel"));
    }

    @Test
    @DisplayName("Approver Scope: Admin has universal approval authority")
    void testValidateApproverScope_Admin_Allowed() {
        Approval approval = new Approval();
        approval.setId(13L);
        approval.setEntityType("AcademicResourceRequest");
        approval.setEntityId(401L);
        approval.setRequestedBy(facultyUser);

        assertDoesNotThrow(() -> routingService.validateApproverScope(approval, adminUser));
    }
}
