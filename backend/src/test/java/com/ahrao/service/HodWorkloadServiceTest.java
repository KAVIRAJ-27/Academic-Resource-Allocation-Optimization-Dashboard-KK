package com.ahrao.service;

import com.ahrao.dto.hod.HodDepartmentAssignmentItemDto;
import com.ahrao.dto.hod.HodDepartmentWorkloadOverviewDto;
import com.ahrao.dto.hod.HodFacultyWorkloadDetailDto;
import com.ahrao.entity.academic.*;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.FacultySubjectAssignmentRepository;
import com.ahrao.repository.academic.FacultyWorkloadRepository;
import com.ahrao.service.hod.HodDepartmentResolver;
import com.ahrao.service.hod.HodWorkloadServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HodWorkloadServiceTest {

    @Mock
    private HodDepartmentResolver hodDepartmentResolver;
    @Mock
    private FacultyRepository facultyRepository;
    @Mock
    private FacultySubjectAssignmentRepository facultySubjectAssignmentRepository;
    @Mock
    private FacultyWorkloadRepository facultyWorkloadRepository;

    @InjectMocks
    private HodWorkloadServiceImpl hodWorkloadService;

    private Department departmentA;
    private Department departmentB;
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
        departmentB.setName("Electrical Engineering");
        departmentB.setCode("EEE");

        userA = new User();
        userA.setId(201L);
        userA.setFirstName("Ada");
        userA.setLastName("Lovelace");

        facultyA = new Faculty();
        facultyA.setId(55L);
        facultyA.setUser(userA);
        facultyA.setDepartment(departmentA);
        facultyA.setEmployeeId("FAC-CSE-001");
        facultyA.setDesignation("Associate Professor");

        userB = new User();
        userB.setId(301L);
        userB.setFirstName("Nikola");
        userB.setLastName("Tesla");

        facultyB = new Faculty();
        facultyB.setId(99L);
        facultyB.setUser(userB);
        facultyB.setDepartment(departmentB); // Dept B!
        facultyB.setEmployeeId("FAC-EEE-001");
    }

    @Test
    @DisplayName("HOD can retrieve department workload overview")
    void testGetWorkloadOverview_Success() {
        Long hodUserId = 101L;
        when(hodDepartmentResolver.resolveHodDepartment(hodUserId)).thenReturn(departmentA);
        when(facultyRepository.findByDepartmentId(10L)).thenReturn(List.of(facultyA));
        when(facultySubjectAssignmentRepository.countByFacultyIdAndStatus(55L, "ACTIVE")).thenReturn(2L);

        FacultyWorkload fw = new FacultyWorkload();
        fw.setTotalHours(new BigDecimal("18.0"));
        fw.setTeachingHours(new BigDecimal("12.0"));
        fw.setLabHours(new BigDecimal("6.0"));
        fw.setWorkloadStatus("OVERLOAD");
        when(facultyWorkloadRepository.findFirstByFacultyIdOrderByCalculatedAtDesc(55L)).thenReturn(Optional.of(fw));

        HodDepartmentWorkloadOverviewDto overview = hodWorkloadService.getWorkloadOverview(hodUserId);

        assertNotNull(overview);
        assertEquals(1, overview.getTotalFaculty());
        assertEquals(1, overview.getFacultyWithWorkloadCount());
        assertEquals(1, overview.getOverloadCount());
        assertEquals(0, overview.getBalancedCount());
        assertEquals(new BigDecimal("18.0"), overview.getTotalDepartmentHours());
        assertEquals(new BigDecimal("18.0"), overview.getAverageWeeklyHours());
    }

    @Test
    @DisplayName("HOD can retrieve detailed faculty workload for own department")
    void testGetFacultyWorkloadDetail_Success() {
        Long hodUserId = 101L;
        when(hodDepartmentResolver.resolveHodDepartment(hodUserId)).thenReturn(departmentA);
        when(facultyRepository.findById(55L)).thenReturn(Optional.of(facultyA));

        AcademicYear ay = new AcademicYear();
        ay.setName("2026-2027");
        Semester sem = new Semester();
        sem.setName("Semester 1");

        FacultyWorkload fw = new FacultyWorkload();
        fw.setId(1L);
        fw.setTotalHours(new BigDecimal("16.0"));
        fw.setTeachingHours(new BigDecimal("12.0"));
        fw.setLabHours(new BigDecimal("4.0"));
        fw.setOtherHours(BigDecimal.ZERO);
        fw.setWorkloadStatus("BALANCED");
        fw.setCalculatedAt(Instant.now());
        fw.setAcademicYear(ay);
        fw.setSemester(sem);

        when(facultyWorkloadRepository.findFirstByFacultyIdOrderByCalculatedAtDesc(55L)).thenReturn(Optional.of(fw));
        when(facultyWorkloadRepository.findByFacultyId(55L)).thenReturn(List.of(fw));
        when(facultySubjectAssignmentRepository.findActiveByFacultyIdWithDetails(55L)).thenReturn(Collections.emptyList());

        HodFacultyWorkloadDetailDto detail = hodWorkloadService.getFacultyWorkloadDetail(hodUserId, 55L);

        assertNotNull(detail);
        assertEquals(55L, detail.getFacultyId());
        assertEquals("Ada Lovelace", detail.getFacultyName());
        assertEquals(new BigDecimal("16.0"), detail.getTotalHours());
        assertEquals("BALANCED", detail.getWorkloadStatus());
        assertEquals("2026-2027", detail.getAcademicYear());
        assertEquals(1, detail.getHistory().size());
    }

    @Test
    @DisplayName("Viewing workload of faculty from another department throws ForbiddenException")
    void testGetFacultyWorkloadDetail_CrossDepartmentThrowsForbidden() {
        Long hodUserId = 101L;
        when(hodDepartmentResolver.resolveHodDepartment(hodUserId)).thenReturn(departmentA);
        when(facultyRepository.findById(99L)).thenReturn(Optional.of(facultyB)); // Foreign!

        assertThrows(ForbiddenException.class, () ->
                hodWorkloadService.getFacultyWorkloadDetail(hodUserId, 99L));
    }

    @Test
    @DisplayName("HOD can retrieve department active assignments")
    void testGetDepartmentAssignments_Success() {
        Long hodUserId = 101L;
        when(hodDepartmentResolver.resolveHodDepartment(hodUserId)).thenReturn(departmentA);

        FacultySubjectAssignment fsa = new FacultySubjectAssignment();
        fsa.setId(10L);
        fsa.setFaculty(facultyA);
        Subject s = new Subject();
        s.setId(100L);
        s.setCode("CS101");
        s.setName("Data Structures");
        s.setCredits(4);
        fsa.setSubject(s);
        fsa.setHoursPerWeek(4);
        fsa.setStatus("ACTIVE");

        when(facultySubjectAssignmentRepository.findActiveByDepartmentIdWithDetails(10L)).thenReturn(List.of(fsa));

        List<HodDepartmentAssignmentItemDto> list = hodWorkloadService.getDepartmentAssignments(hodUserId);

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("CS101", list.get(0).getSubjectCode());
        assertEquals("Ada Lovelace", list.get(0).getFacultyName());
    }
}
