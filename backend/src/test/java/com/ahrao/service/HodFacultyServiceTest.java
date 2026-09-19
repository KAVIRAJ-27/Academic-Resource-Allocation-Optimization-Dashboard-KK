package com.ahrao.service;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hod.HodFacultyDetailDto;
import com.ahrao.dto.hod.HodFacultySummaryDto;
import com.ahrao.dto.hod.HodUpdateStatusRequest;
import com.ahrao.entity.academic.*;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.FacultySubjectAssignmentRepository;
import com.ahrao.repository.academic.FacultyWorkloadRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.hod.HodDepartmentResolver;
import com.ahrao.service.hod.HodFacultyServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import org.mockito.ArgumentMatchers;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HodFacultyServiceTest {

    @Mock
    private HodDepartmentResolver hodDepartmentResolver;
    @Mock
    private FacultyRepository facultyRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private FacultySubjectAssignmentRepository facultySubjectAssignmentRepository;
    @Mock
    private FacultyWorkloadRepository facultyWorkloadRepository;
    @Mock
    private AcademicResourceRequestRepository academicResourceRequestRepository;
    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private HodFacultyServiceImpl hodFacultyService;

    private Department departmentA;
    private Department departmentB;
    private Faculty hodFaculty;
    private Faculty facultyA;
    private Faculty facultyB;
    private User userA;
    private User userB;

    @BeforeEach
    void setUp() {
        departmentA = new Department();
        departmentA.setId(10L);
        departmentA.setName("Computer Science");
        departmentA.setCode("CSE");

        departmentB = new Department();
        departmentB.setId(20L);
        departmentB.setName("Mechanical Engineering");
        departmentB.setCode("MECH");

        User hodUser = new User();
        hodUser.setId(101L);
        hodUser.setFirstName("Alan");
        hodUser.setLastName("Turing");

        hodFaculty = new Faculty();
        hodFaculty.setId(1L);
        hodFaculty.setUser(hodUser);
        hodFaculty.setDepartment(departmentA);

        userA = new User();
        userA.setId(201L);
        userA.setFirstName("Ada");
        userA.setLastName("Lovelace");
        userA.setEmail("ada@univ.edu");

        facultyA = new Faculty();
        facultyA.setId(55L);
        facultyA.setUser(userA);
        facultyA.setDepartment(departmentA);
        facultyA.setEmployeeId("FAC-CSE-001");
        facultyA.setStatus("ACTIVE");
        facultyA.setJoiningDate(LocalDate.of(2021, 1, 10));

        userB = new User();
        userB.setId(301L);
        userB.setFirstName("James");
        userB.setLastName("Watt");

        facultyB = new Faculty();
        facultyB.setId(99L);
        facultyB.setUser(userB);
        facultyB.setDepartment(departmentB); // Foreign department!
        facultyB.setEmployeeId("FAC-MECH-001");
        facultyB.setStatus("ACTIVE");
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("HOD can retrieve paged faculty belonging to own department")
    void testGetFaculty_Success() {
        Long hodUserId = 101L;
        when(hodDepartmentResolver.resolveHodDepartment(hodUserId)).thenReturn(departmentA);

        Page<Faculty> page = new PageImpl<>(List.of(facultyA), PageRequest.of(0, 20), 1);
        when(facultyRepository.findAll(ArgumentMatchers.<Specification<Faculty>>any(), any(Pageable.class))).thenReturn(page);
        when(facultySubjectAssignmentRepository.countByFacultyIdAndStatus(55L, "ACTIVE")).thenReturn(3L);

        FacultyWorkload fw = new FacultyWorkload();
        fw.setTotalHours(new BigDecimal("16.0"));
        fw.setWorkloadStatus("BALANCED");
        when(facultyWorkloadRepository.findFirstByFacultyIdOrderByCalculatedAtDesc(55L)).thenReturn(Optional.of(fw));

        PagedResponse<HodFacultySummaryDto> response =
                hodFacultyService.getFaculty(hodUserId, "Ada", "ACTIVE", PageRequest.of(0, 20));

        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        assertEquals("Ada Lovelace", response.getContent().get(0).getFullName());
        assertEquals("FAC-CSE-001", response.getContent().get(0).getEmployeeId());
        assertEquals(3, response.getContent().get(0).getAssignedSubjectsCount());
        assertEquals("BALANCED", response.getContent().get(0).getWorkloadStatus());
    }

    @Test
    @DisplayName("HOD can retrieve detailed profile of faculty in own department")
    void testGetFacultyById_Success() {
        Long hodUserId = 101L;
        when(hodDepartmentResolver.resolveHodDepartment(hodUserId)).thenReturn(departmentA);
        when(facultyRepository.findById(55L)).thenReturn(Optional.of(facultyA));
        when(facultyWorkloadRepository.findFirstByFacultyIdOrderByCalculatedAtDesc(55L)).thenReturn(Optional.empty());
        when(facultySubjectAssignmentRepository.findActiveByFacultyIdWithDetails(55L)).thenReturn(Collections.emptyList());
        when(academicResourceRequestRepository.findByRequesterUserId(201L)).thenReturn(Collections.emptyList());

        HodFacultyDetailDto detail = hodFacultyService.getFacultyById(hodUserId, 55L);

        assertNotNull(detail);
        assertEquals(55L, detail.getId());
        assertEquals("Ada Lovelace", detail.getFullName());
        assertEquals("CSE", detail.getDepartmentCode());
        assertEquals("PENDING_CALCULATION", detail.getWorkloadStatus());
    }

    @Test
    @DisplayName("Cross-department faculty access is rejected with ForbiddenException")
    void testGetFacultyById_CrossDepartmentThrowsForbidden() {
        Long hodUserId = 101L;
        when(hodDepartmentResolver.resolveHodDepartment(hodUserId)).thenReturn(departmentA);
        when(facultyRepository.findById(99L)).thenReturn(Optional.of(facultyB)); // Dept B!

        assertThrows(ForbiddenException.class, () -> hodFacultyService.getFacultyById(hodUserId, 99L));
    }

    @Test
    @DisplayName("HOD can update faculty status and create audit log")
    void testUpdateFacultyStatus_Success() {
        Long hodUserId = 101L;
        when(hodDepartmentResolver.resolveHodDepartment(hodUserId)).thenReturn(departmentA);
        when(hodDepartmentResolver.resolveHodFaculty(hodUserId)).thenReturn(hodFaculty);
        when(facultyRepository.findById(55L)).thenReturn(Optional.of(facultyA));

        HodUpdateStatusRequest req = new HodUpdateStatusRequest("INACTIVE");
        HodFacultySummaryDto summary = hodFacultyService.updateFacultyStatus(hodUserId, 55L, req);

        assertNotNull(summary);
        assertEquals("INACTIVE", facultyA.getStatus());
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    @DisplayName("HOD cannot update status of faculty belonging to another department")
    void testUpdateFacultyStatus_CrossDepartmentThrowsForbidden() {
        Long hodUserId = 101L;
        when(hodDepartmentResolver.resolveHodDepartment(hodUserId)).thenReturn(departmentA);
        when(hodDepartmentResolver.resolveHodFaculty(hodUserId)).thenReturn(hodFaculty);
        when(facultyRepository.findById(99L)).thenReturn(Optional.of(facultyB));

        HodUpdateStatusRequest req = new HodUpdateStatusRequest("INACTIVE");
        assertThrows(ForbiddenException.class, () -> hodFacultyService.updateFacultyStatus(hodUserId, 99L, req));
        verify(auditLogRepository, never()).save(any());
    }
}
