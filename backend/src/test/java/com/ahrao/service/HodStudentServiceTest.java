package com.ahrao.service;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hod.HodStudentDetailDto;
import com.ahrao.dto.hod.HodStudentReferenceDataDto;
import com.ahrao.dto.hod.HodStudentSummaryDto;
import com.ahrao.dto.hod.HodUpdateStatusRequest;
import com.ahrao.dto.hod.HodUpdateStudentRequest;
import com.ahrao.entity.academic.*;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.repository.academic.ProgramRepository;
import com.ahrao.repository.academic.SectionRepository;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.hod.HodDepartmentResolver;
import com.ahrao.service.hod.HodStudentServiceImpl;
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

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HodStudentServiceTest {

    @Mock
    private HodDepartmentResolver hodDepartmentResolver;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private ProgramRepository programRepository;
    @Mock
    private SectionRepository sectionRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AcademicResourceRequestRepository academicResourceRequestRepository;
    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private HodStudentServiceImpl hodStudentService;

    private Department departmentA;
    private Department departmentB;
    private Faculty hodFaculty;
    private Program programA;
    private Program programB;
    private Section sectionA;
    private Student studentA;
    private Student studentB;
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
        departmentB.setName("Civil Engineering");
        departmentB.setCode("CIVIL");

        User hodUser = new User();
        hodUser.setId(101L);
        hodUser.setFirstName("Alan");
        hodUser.setLastName("Turing");

        hodFaculty = new Faculty();
        hodFaculty.setId(1L);
        hodFaculty.setUser(hodUser);
        hodFaculty.setDepartment(departmentA);

        programA = new Program();
        programA.setId(100L);
        programA.setCode("BTECH-CSE");
        programA.setName("B.Tech CSE");
        programA.setDepartment(departmentA);

        programB = new Program();
        programB.setId(200L);
        programB.setCode("BTECH-CIVIL");
        programB.setName("B.Tech Civil");
        programB.setDepartment(departmentB);

        sectionA = new Section();
        sectionA.setId(500L);
        sectionA.setName("Section A");
        sectionA.setProgram(programA);

        userA = new User();
        userA.setId(1001L);
        userA.setFirstName("Grace");
        userA.setLastName("Hopper");
        userA.setEmail("grace@univ.edu");

        studentA = new Student();
        studentA.setId(77L);
        studentA.setUser(userA);
        studentA.setDepartment(departmentA);
        studentA.setProgram(programA);
        studentA.setSection(sectionA);
        studentA.setRegisterNumber("REG-CSE-0077");
        studentA.setRollNumber("21CS01");
        studentA.setCurrentSemester(4);
        studentA.setAdmissionYear(2021);
        studentA.setStatus("ACTIVE");

        userB = new User();
        userB.setId(1002L);
        userB.setFirstName("John");
        userB.setLastName("Smeaton");

        studentB = new Student();
        studentB.setId(88L);
        studentB.setUser(userB);
        studentB.setDepartment(departmentB); // Dept B!
        studentB.setProgram(programB);
        studentB.setRegisterNumber("REG-CIV-0088");
        studentB.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("HOD can retrieve paged students belonging to own department")
    void testGetStudents_Success() {
        Long hodUserId = 101L;
        when(hodDepartmentResolver.resolveHodDepartment(hodUserId)).thenReturn(departmentA);

        Page<Student> page = new PageImpl<>(List.of(studentA), PageRequest.of(0, 20), 1);
        when(studentRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        PagedResponse<HodStudentSummaryDto> response =
                hodStudentService.getStudents(hodUserId, "Grace", null, null, null, "ACTIVE", PageRequest.of(0, 20));

        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        assertEquals("Grace Hopper", response.getContent().get(0).getFullName());
        assertEquals("REG-CSE-0077", response.getContent().get(0).getRegisterNumber());
        assertEquals("BTECH-CSE", response.getContent().get(0).getProgramCode());
    }

    @Test
    @DisplayName("Filtering with program from another department is rejected with ForbiddenException")
    void testGetStudents_ForeignProgramThrowsForbidden() {
        Long hodUserId = 101L;
        when(hodDepartmentResolver.resolveHodDepartment(hodUserId)).thenReturn(departmentA);
        when(programRepository.findById(200L)).thenReturn(Optional.of(programB)); // Dept B program!

        assertThrows(ForbiddenException.class, () ->
                hodStudentService.getStudents(hodUserId, null, 200L, null, null, null, PageRequest.of(0, 20)));
    }

    @Test
    @DisplayName("HOD can view detailed student in own department")
    void testGetStudentById_Success() {
        Long hodUserId = 101L;
        when(hodDepartmentResolver.resolveHodDepartment(hodUserId)).thenReturn(departmentA);
        when(studentRepository.findById(77L)).thenReturn(Optional.of(studentA));
        when(academicResourceRequestRepository.findByRequesterUserId(1001L)).thenReturn(Collections.emptyList());

        HodStudentDetailDto detail = hodStudentService.getStudentById(hodUserId, 77L);

        assertNotNull(detail);
        assertEquals(77L, detail.getId());
        assertEquals("Grace Hopper", detail.getFullName());
        assertEquals("REG-CSE-0077", detail.getRegisterNumber());
        assertEquals("Section A", detail.getSectionName());
    }

    @Test
    @DisplayName("Cross-department student access is rejected with ForbiddenException")
    void testGetStudentById_CrossDepartmentThrowsForbidden() {
        Long hodUserId = 101L;
        when(hodDepartmentResolver.resolveHodDepartment(hodUserId)).thenReturn(departmentA);
        when(studentRepository.findById(88L)).thenReturn(Optional.of(studentB)); // Dept B!

        assertThrows(ForbiddenException.class, () -> hodStudentService.getStudentById(hodUserId, 88L));
    }

    @Test
    @DisplayName("HOD can update student status and generate audit log")
    void testUpdateStudentStatus_Success() {
        Long hodUserId = 101L;
        when(hodDepartmentResolver.resolveHodDepartment(hodUserId)).thenReturn(departmentA);
        when(hodDepartmentResolver.resolveHodFaculty(hodUserId)).thenReturn(hodFaculty);
        when(studentRepository.findById(77L)).thenReturn(Optional.of(studentA));

        HodUpdateStatusRequest req = new HodUpdateStatusRequest("SUSPENDED");
        HodStudentSummaryDto summary = hodStudentService.updateStudentStatus(hodUserId, 77L, req);

        assertNotNull(summary);
        assertEquals("SUSPENDED", studentA.getStatus());
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    @DisplayName("HOD cannot update status of student in another department")
    void testUpdateStudentStatus_CrossDepartmentThrowsForbidden() {
        Long hodUserId = 101L;
        when(hodDepartmentResolver.resolveHodDepartment(hodUserId)).thenReturn(departmentA);
        when(hodDepartmentResolver.resolveHodFaculty(hodUserId)).thenReturn(hodFaculty);
        when(studentRepository.findById(88L)).thenReturn(Optional.of(studentB));

        HodUpdateStatusRequest req = new HodUpdateStatusRequest("INACTIVE");
        assertThrows(ForbiddenException.class, () -> hodStudentService.updateStudentStatus(hodUserId, 88L, req));
        verify(auditLogRepository, never()).save(any());
    }

    @Test
    @DisplayName("HOD can retrieve department student reference data")
    void testGetReferenceData_Success() {
        Long hodUserId = 101L;
        when(hodDepartmentResolver.resolveHodDepartment(hodUserId)).thenReturn(departmentA);
        when(programRepository.findByDepartmentId(10L)).thenReturn(List.of(programA));
        when(sectionRepository.findByProgramDepartmentId(10L)).thenReturn(List.of(sectionA));

        HodStudentReferenceDataDto refData = hodStudentService.getReferenceData(hodUserId);

        assertNotNull(refData);
        assertEquals(1, refData.getPrograms().size());
        assertEquals("BTECH-CSE", refData.getPrograms().get(0).getCode());
        assertEquals(1, refData.getSections().size());
        assertEquals("Section A", refData.getSections().get(0).getName());
    }
}
