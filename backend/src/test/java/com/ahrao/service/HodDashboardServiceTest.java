package com.ahrao.service;

import com.ahrao.dto.hod.dashboard.HodDashboardResponse;
import com.ahrao.entity.academic.*;
import com.ahrao.entity.allocation.ResourceAllocation;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.enums.ResourceStatus;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.resource.Resource;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.repository.academic.*;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.resource.ResourceRepository;
import com.ahrao.service.hod.HodDashboardServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HodDashboardServiceTest {

    @Mock
    private FacultyRepository facultyRepository;
    @Mock
    private DepartmentHODRepository departmentHODRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private ProgramRepository programRepository;
    @Mock
    private SubjectRepository subjectRepository;
    @Mock
    private SectionRepository sectionRepository;
    @Mock
    private AcademicResourceRequestRepository academicResourceRequestRepository;
    @Mock
    private ResourceAllocationRepository resourceAllocationRepository;
    @Mock
    private ResourceRepository resourceRepository;
    @Mock
    private FacultyWorkloadRepository facultyWorkloadRepository;
    @Mock
    private FacultySubjectAssignmentRepository facultySubjectAssignmentRepository;
    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private HodDashboardServiceImpl hodDashboardService;

    private User hodUser;
    private Faculty hodFaculty;
    private Department department;
    private Institution institution;
    private DepartmentHOD departmentHOD;

    @BeforeEach
    void setUp() {
        institution = new Institution();
        institution.setId(1L);
        institution.setName("Global Institute of Technology");

        department = new Department();
        department.setId(10L);
        department.setName("Computer Science & Engineering");
        department.setCode("CSE");
        department.setStatus("ACTIVE");
        department.setInstitution(institution);

        hodUser = new User();
        hodUser.setId(101L);
        hodUser.setFirstName("Alan");
        hodUser.setLastName("Turing");
        hodUser.setEmail("alan.turing@univ.edu");

        hodFaculty = new Faculty();
        hodFaculty.setId(201L);
        hodFaculty.setUser(hodUser);
        hodFaculty.setDepartment(department);
        hodFaculty.setEmployeeId("EMP-CSE-001");
        hodFaculty.setDesignation("Professor & Head");
        hodFaculty.setJoiningDate(LocalDate.of(2020, 1, 15));

        departmentHOD = new DepartmentHOD();
        departmentHOD.setId(1L);
        departmentHOD.setDepartment(department);
        departmentHOD.setFaculty(hodFaculty);
        departmentHOD.setStartDate(LocalDate.of(2022, 6, 1));
        departmentHOD.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("Successfully generates HOD dashboard with active DepartmentHOD record")
    void testGetHodDashboard_SuccessWithDepartmentHod() {
        Long userId = 101L;

        when(facultyRepository.findByUserId(userId)).thenReturn(Optional.of(hodFaculty));
        when(departmentHODRepository.findFirstByFacultyUserIdAndStatus(userId, "ACTIVE"))
                .thenReturn(Optional.of(departmentHOD));

        // Mock counts
        when(studentRepository.countByDepartmentId(10L)).thenReturn(180L);
        when(facultyRepository.countByDepartmentId(10L)).thenReturn(15L);
        when(programRepository.countByDepartmentId(10L)).thenReturn(3L);
        when(subjectRepository.countByProgramDepartmentId(10L)).thenReturn(24L);
        when(sectionRepository.countByProgramDepartmentIdAndStatus(10L, "ACTIVE")).thenReturn(8L);
        when(academicResourceRequestRepository.countByDepartmentIdAndStatus(10L, RequestStatus.PENDING)).thenReturn(4L);
        when(resourceAllocationRepository.countByDepartmentIdAndStatus(10L, AllocationStatus.ACTIVE)).thenReturn(6L);
        when(resourceRepository.countByDepartmentId(10L)).thenReturn(12L);

        // Student program distribution
        List<Object[]> progRows = new ArrayList<>();
        progRows.add(new Object[]{1L, "BTECH-CSE", "B.Tech Computer Science", "UNDERGRADUATE", 120L});
        progRows.add(new Object[]{2L, "MTECH-CSE", "M.Tech Computer Science", "POSTGRADUATE", 60L});
        when(studentRepository.countStudentsGroupedByProgramInDepartment(10L)).thenReturn(progRows);

        // Faculty workload overview
        Faculty f1 = new Faculty();
        f1.setId(202L);
        User u1 = new User();
        u1.setFirstName("Ada");
        u1.setLastName("Lovelace");
        f1.setUser(u1);
        f1.setEmployeeId("EMP-CSE-002");
        f1.setDesignation("Assistant Professor");

        when(facultyRepository.findByDepartmentId(10L)).thenReturn(List.of(f1));

        FacultyWorkload fw1 = new FacultyWorkload();
        fw1.setTotalHours(new BigDecimal("16.0"));
        fw1.setTeachingHours(new BigDecimal("12.0"));
        fw1.setLabHours(new BigDecimal("4.0"));
        fw1.setWorkloadStatus("BALANCED");
        when(facultyWorkloadRepository.findFirstByFacultyIdOrderByCalculatedAtDesc(202L)).thenReturn(Optional.of(fw1));
        when(facultySubjectAssignmentRepository.countByFacultyIdAndStatus(202L, "ACTIVE")).thenReturn(3L);

        // Pending Requests
        AcademicResourceRequest req1 = new AcademicResourceRequest();
        req1.setId(301L);
        req1.setPurpose("AI Lab Session");
        req1.setRequestedDate(LocalDate.now().plusDays(1));
        req1.setStartTime(LocalTime.of(9, 0));
        req1.setEndTime(LocalTime.of(11, 0));
        req1.setPriority(PriorityLevel.HIGH);
        req1.setStatus(RequestStatus.PENDING);
        req1.setCreatedAt(Instant.now());
        Resource res1 = new Resource();
        res1.setName("Lab 3 - Data Science");
        res1.setCode("LAB-301");
        req1.setRequestedResource(res1);
        req1.setRequester(u1);
        when(academicResourceRequestRepository.findTop5ByDepartmentIdAndStatusOrderByCreatedAtDesc(10L, RequestStatus.PENDING))
                .thenReturn(List.of(req1));

        // Active Allocations
        ResourceAllocation alloc1 = new ResourceAllocation();
        alloc1.setId(401L);
        alloc1.setPurpose("Semester End Practical Examination");
        alloc1.setStartDatetime(Instant.now());
        alloc1.setEndDatetime(Instant.now().plusSeconds(7200));
        alloc1.setQuantity(1);
        alloc1.setStatus(AllocationStatus.ACTIVE);
        alloc1.setResource(res1);
        alloc1.setAllocatedToUser(u1);
        when(resourceAllocationRepository.findTop5ByDepartmentIdAndStatusOrderByCreatedAtDesc(10L, AllocationStatus.ACTIVE))
                .thenReturn(List.of(alloc1));

        // Resource Utilization
        when(resourceRepository.countByDepartmentIdAndStatus(10L, ResourceStatus.AVAILABLE)).thenReturn(7L);
        when(resourceRepository.countByDepartmentIdAndStatus(10L, ResourceStatus.ALLOCATED)).thenReturn(3L);
        when(resourceRepository.countByDepartmentIdAndStatus(10L, ResourceStatus.MAINTENANCE)).thenReturn(1L);
        when(resourceRepository.countByDepartmentIdAndStatus(10L, ResourceStatus.INACTIVE)).thenReturn(1L);

        // Recent Audit Logs
        AuditLog log1 = new AuditLog();
        log1.setId(501L);
        log1.setAction("ALLOCATION_CREATED");
        log1.setEntityType("ResourceAllocation");
        log1.setEntityId(401L);
        log1.setUser(hodUser);
        log1.setCreatedAt(Instant.now());
        when(auditLogRepository.findRecentDepartmentAuditLogs(eq(10L), any(Pageable.class)))
                .thenReturn(List.of(log1));

        HodDashboardResponse response = hodDashboardService.getHodDashboard(userId);

        assertNotNull(response);
        assertEquals("CSE", response.getDepartment().getCode());
        assertEquals("Alan Turing", response.getDepartment().getHodName());
        assertEquals(180L, response.getSummary().getTotalStudents());
        assertEquals(15L, response.getSummary().getTotalFaculty());
        assertEquals(3L, response.getSummary().getTotalPrograms());
        assertEquals(24L, response.getSummary().getTotalSubjects());
        assertEquals(8L, response.getSummary().getActiveSections());
        assertEquals(4L, response.getSummary().getPendingResourceRequests());
        assertEquals(6L, response.getSummary().getActiveResourceAllocations());
        assertEquals(12L, response.getSummary().getTotalDepartmentResources());

        // Verify distributions
        assertEquals(2, response.getStudentDistribution().size());
        assertEquals(66.7, response.getStudentDistribution().get(0).getPercentage());
        assertEquals(33.3, response.getStudentDistribution().get(1).getPercentage());

        // Verify workloads
        assertEquals(1, response.getFacultyWorkloads().size());
        assertEquals("Ada Lovelace", response.getFacultyWorkloads().get(0).getFacultyName());
        assertEquals("BALANCED", response.getFacultyWorkloads().get(0).getWorkloadStatus());

        // Verify pending requests
        assertEquals(1, response.getPendingRequests().size());
        assertEquals("AI Lab Session", response.getPendingRequests().get(0).getPurpose());

        // Verify allocations
        assertEquals(1, response.getActiveAllocations().size());
        assertEquals("Lab 3 - Data Science", response.getActiveAllocations().get(0).getResourceName());

        // Verify utilization
        assertEquals(12L, response.getResourceUtilization().getTotalResources());
        assertEquals(7L, response.getResourceUtilization().getAvailableCount());
        assertEquals(3L, response.getResourceUtilization().getAllocatedCount());
        assertEquals(25.0, response.getResourceUtilization().getUtilizationRate());

        // Verify activity
        assertEquals(1, response.getRecentActivities().size());
        assertEquals("Alan Turing", response.getRecentActivities().get(0).getPerformedBy());
    }

    @Test
    @DisplayName("Fallback to faculty department when no DepartmentHOD assignment is present")
    void testGetHodDashboard_FallbackToFacultyDepartment() {
        Long userId = 101L;

        when(facultyRepository.findByUserId(userId)).thenReturn(Optional.of(hodFaculty));
        when(departmentHODRepository.findFirstByFacultyUserIdAndStatus(userId, "ACTIVE"))
                .thenReturn(Optional.empty());

        when(studentRepository.countStudentsGroupedByProgramInDepartment(10L)).thenReturn(Collections.emptyList());
        when(facultyRepository.findByDepartmentId(10L)).thenReturn(Collections.emptyList());
        when(academicResourceRequestRepository.findTop5ByDepartmentIdAndStatusOrderByCreatedAtDesc(10L, RequestStatus.PENDING))
                .thenReturn(Collections.emptyList());
        when(resourceAllocationRepository.findTop5ByDepartmentIdAndStatusOrderByCreatedAtDesc(10L, AllocationStatus.ACTIVE))
                .thenReturn(Collections.emptyList());
        when(auditLogRepository.findRecentDepartmentAuditLogs(eq(10L), any(Pageable.class)))
                .thenReturn(Collections.emptyList());

        HodDashboardResponse response = hodDashboardService.getHodDashboard(userId);

        assertNotNull(response);
        assertEquals("Computer Science & Engineering", response.getDepartment().getName());
        assertEquals("CSE", response.getDepartment().getCode());
        assertEquals(LocalDate.of(2020, 1, 15), response.getDepartment().getHodSince());
    }

    @Test
    @DisplayName("Throws ForbiddenException when authenticated user is not registered as faculty")
    void testGetHodDashboard_NotFacultyThrowsForbidden() {
        Long userId = 999L;
        when(facultyRepository.findByUserId(userId)).thenReturn(Optional.empty());

        assertThrows(ForbiddenException.class, () -> hodDashboardService.getHodDashboard(userId));
    }

    @Test
    @DisplayName("Throws ForbiddenException when faculty has no department assigned")
    void testGetHodDashboard_NoDepartmentThrowsForbidden() {
        Long userId = 101L;
        Faculty orphanFaculty = new Faculty();
        orphanFaculty.setId(901L);
        orphanFaculty.setDepartment(null);

        when(facultyRepository.findByUserId(userId)).thenReturn(Optional.of(orphanFaculty));
        when(departmentHODRepository.findFirstByFacultyUserIdAndStatus(userId, "ACTIVE")).thenReturn(Optional.empty());

        assertThrows(ForbiddenException.class, () -> hodDashboardService.getHodDashboard(userId));
    }

    @Test
    @DisplayName("Gracefully handles empty lists without null pointer exceptions")
    void testGetHodDashboard_EmptyStatesHandledSafely() {
        Long userId = 101L;

        when(facultyRepository.findByUserId(userId)).thenReturn(Optional.of(hodFaculty));
        when(departmentHODRepository.findFirstByFacultyUserIdAndStatus(userId, "ACTIVE"))
                .thenReturn(Optional.of(departmentHOD));

        when(studentRepository.countStudentsGroupedByProgramInDepartment(10L)).thenReturn(Collections.emptyList());
        when(facultyRepository.findByDepartmentId(10L)).thenReturn(Collections.emptyList());
        when(academicResourceRequestRepository.findTop5ByDepartmentIdAndStatusOrderByCreatedAtDesc(10L, RequestStatus.PENDING))
                .thenReturn(Collections.emptyList());
        when(resourceAllocationRepository.findTop5ByDepartmentIdAndStatusOrderByCreatedAtDesc(10L, AllocationStatus.ACTIVE))
                .thenReturn(Collections.emptyList());
        when(auditLogRepository.findRecentDepartmentAuditLogs(eq(10L), any(Pageable.class)))
                .thenReturn(Collections.emptyList());

        HodDashboardResponse response = hodDashboardService.getHodDashboard(userId);

        assertNotNull(response);
        assertTrue(response.getStudentDistribution().isEmpty());
        assertTrue(response.getFacultyWorkloads().isEmpty());
        assertTrue(response.getPendingRequests().isEmpty());
        assertTrue(response.getActiveAllocations().isEmpty());
        assertTrue(response.getRecentActivities().isEmpty());
        assertEquals(0.0, response.getResourceUtilization().getUtilizationRate());
    }
}
