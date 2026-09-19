package com.ahrao.service;

import com.ahrao.dto.principal.dashboard.PrincipalDashboardResponse;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.ApprovalLevel;
import com.ahrao.entity.enums.ApprovalStatus;
import com.ahrao.entity.enums.HostelBedStatus;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.user.User;
import com.ahrao.repository.academic.*;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.approval.ApprovalRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
import com.ahrao.repository.hostel.HostelRepository;
import com.ahrao.repository.hostel.HostelRoomRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.resource.ResourceRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.principal.PrincipalDashboardServiceImpl;
import com.ahrao.service.principal.PrincipalInstitutionResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PrincipalDashboardServiceTest {

    @Mock
    private PrincipalInstitutionResolver institutionResolver;
    @Mock
    private UserRepository userRepository;
    @Mock
    private DepartmentRepository departmentRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private FacultyRepository facultyRepository;
    @Mock
    private ProgramRepository programRepository;
    @Mock
    private SubjectRepository subjectRepository;
    @Mock
    private SectionRepository sectionRepository;
    @Mock
    private ResourceRepository resourceRepository;
    @Mock
    private AcademicResourceRequestRepository academicResourceRequestRepository;
    @Mock
    private ResourceAllocationRepository resourceAllocationRepository;
    @Mock
    private HostelRepository hostelRepository;
    @Mock
    private HostelRoomRepository hostelRoomRepository;
    @Mock
    private HostelBedRepository hostelBedRepository;
    @Mock
    private FacultyWorkloadRepository facultyWorkloadRepository;
    @Mock
    private ApprovalRepository approvalRepository;
    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private PrincipalDashboardServiceImpl principalDashboardService;

    private Institution institution;
    private User principalUser;

    @BeforeEach
    void setUp() {
        institution = new Institution();
        institution.setId(1L);
        institution.setName("National Institute of Technology");
        institution.setCode("NIT");
        institution.setEmail("principal@nit.edu");
        institution.setPhone("+91-1234567890");

        principalUser = new User();
        principalUser.setId(10L);
        principalUser.setUsername("principal_nit");
        principalUser.setFirstName("Robert");
        principalUser.setLastName("Oppenheimer");
        principalUser.setEmail("principal@nit.edu");
    }

    @Test
    @DisplayName("Successfully get Principal dashboard with real aggregated metrics")
    void testGetDashboardSuccess() {
        when(institutionResolver.resolvePrincipalInstitution(10L)).thenReturn(institution);
        when(userRepository.findById(10L)).thenReturn(Optional.of(principalUser));

        when(departmentRepository.countByInstitutionId(1L)).thenReturn(4L);
        when(programRepository.countByDepartmentInstitutionId(1L)).thenReturn(8L);
        when(studentRepository.countByDepartmentInstitutionId(1L)).thenReturn(850L);
        when(facultyRepository.countByDepartmentInstitutionId(1L)).thenReturn(65L);
        when(subjectRepository.countByProgramDepartmentInstitutionId(1L)).thenReturn(120L);
        when(sectionRepository.countByProgramDepartmentInstitutionId(1L)).thenReturn(24L);
        when(resourceRepository.countByInstitutionId(1L)).thenReturn(30L);
        when(academicResourceRequestRepository.countByDepartmentInstitutionIdAndStatus(1L, RequestStatus.PENDING)).thenReturn(5L);
        when(resourceAllocationRepository.countByDepartmentInstitutionIdAndStatus(1L, AllocationStatus.ACTIVE)).thenReturn(12L);
        when(hostelRepository.countByInstitutionId(1L)).thenReturn(2L);
        when(hostelRoomRepository.countByFloorBlockHostelInstitutionId(1L)).thenReturn(100L);
        when(hostelBedRepository.countByRoomFloorBlockHostelInstitutionId(1L)).thenReturn(200L);
        when(hostelBedRepository.countByRoomFloorBlockHostelInstitutionIdAndStatus(1L, HostelBedStatus.OCCUPIED)).thenReturn(150L);
        when(hostelBedRepository.countByRoomFloorBlockHostelInstitutionIdAndStatus(1L, HostelBedStatus.AVAILABLE)).thenReturn(50L);
        when(approvalRepository.countByApprovalLevelAndStatus(ApprovalLevel.PRINCIPAL, ApprovalStatus.PENDING)).thenReturn(3L);

        Department dept = new Department();
        dept.setId(101L);
        dept.setName("Computer Science");
        dept.setCode("CSE");
        dept.setStatus("ACTIVE");
        when(departmentRepository.findByInstitutionId(1L)).thenReturn(Collections.singletonList(dept));
        when(studentRepository.countByDepartmentId(101L)).thenReturn(300L);
        when(facultyRepository.countByDepartmentId(101L)).thenReturn(20L);
        when(programRepository.countByDepartmentId(101L)).thenReturn(3L);
        when(subjectRepository.countByProgramDepartmentId(101L)).thenReturn(40L);
        when(academicResourceRequestRepository.countByDepartmentIdAndStatus(101L, RequestStatus.PENDING)).thenReturn(2L);
        when(resourceAllocationRepository.countByDepartmentIdAndStatus(101L, AllocationStatus.ACTIVE)).thenReturn(5L);

        PrincipalDashboardResponse response = principalDashboardService.getDashboard(10L);

        assertNotNull(response);
        assertEquals("NIT", response.getInstitution().getCode());
        assertEquals("Robert Oppenheimer", response.getInstitution().getPrincipalName());
        assertEquals(4L, response.getKpiSummary().getTotalDepartments());
        assertEquals(850L, response.getKpiSummary().getTotalStudents());
        assertEquals(65L, response.getKpiSummary().getTotalFaculty());
        assertEquals(30L, response.getKpiSummary().getAcademicResources());
        assertEquals(5L, response.getKpiSummary().getPendingResourceRequests());
        assertEquals(12L, response.getKpiSummary().getActiveAllocations());
        assertEquals(2L, response.getKpiSummary().getTotalHostels());
        assertEquals(200L, response.getKpiSummary().getTotalHostelBeds());
        assertEquals(150L, response.getKpiSummary().getOccupiedHostelBeds());
        assertEquals(75.0, response.getHostel().getOccupancyRate()); // (150 / 200) * 100 = 75.0%

        assertEquals(1, response.getDepartments().size());
        assertEquals("CSE", response.getDepartments().get(0).getDepartmentCode());
        assertEquals(300L, response.getDepartments().get(0).getStudentCount());

        verify(institutionResolver, times(1)).resolvePrincipalInstitution(10L);
    }

    @Test
    @DisplayName("Throws AccessDeniedException when no authorized institution can be resolved")
    void testGetDashboardInstitutionNotFoundThrowsAccessDeniedException() {
        when(institutionResolver.resolvePrincipalInstitution(999L)).thenReturn(null);

        assertThrows(AccessDeniedException.class, () -> principalDashboardService.getDashboard(999L));
        verify(departmentRepository, never()).countByInstitutionId(anyLong());
    }

    @Test
    @DisplayName("Gracefully handles empty institution with zero metrics without errors")
    void testGetDashboardEmptyInstitution() {
        when(institutionResolver.resolvePrincipalInstitution(10L)).thenReturn(institution);
        when(userRepository.findById(10L)).thenReturn(Optional.of(principalUser));
        when(departmentRepository.findByInstitutionId(1L)).thenReturn(new ArrayList<>());

        PrincipalDashboardResponse response = principalDashboardService.getDashboard(10L);

        assertNotNull(response);
        assertEquals(0L, response.getKpiSummary().getTotalDepartments());
        assertEquals(0L, response.getKpiSummary().getTotalStudents());
        assertEquals(0L, response.getKpiSummary().getTotalFaculty());
        assertNull(response.getHostel().getOccupancyRate());
        assertTrue(response.getDepartments().isEmpty());
    }
}
