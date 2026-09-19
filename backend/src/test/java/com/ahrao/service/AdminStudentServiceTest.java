package com.ahrao.service;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.student.CreateStudentRequest;
import com.ahrao.dto.student.StudentReferenceDataResponse;
import com.ahrao.dto.student.StudentSummaryResponse;
import com.ahrao.dto.student.UpdateStudentRequest;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Program;
import com.ahrao.entity.academic.Section;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.repository.academic.DepartmentRepository;
import com.ahrao.repository.academic.ProgramRepository;
import com.ahrao.repository.academic.SectionRepository;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.user.RoleRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.academic.impl.AdminStudentServiceImpl;
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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import org.mockito.ArgumentMatchers;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminStudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private ProgramRepository programRepository;

    @Mock
    private SectionRepository sectionRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminStudentServiceImpl adminStudentService;

    private Department department;
    private Program program;
    private Section section;
    private User user;
    private Student student;
    private Role studentRole;

    @BeforeEach
    void setUp() {
        department = new Department();
        department.setId(1L);
        department.setName("Computer Science");
        department.setCode("CSE");

        program = new Program();
        program.setId(2L);
        program.setName("B.Tech Computer Science");
        program.setCode("BTECH_CSE");
        program.setDepartment(department);

        section = new Section();
        section.setId(3L);
        section.setName("Section A");
        section.setProgram(program);

        studentRole = new Role();
        studentRole.setName("STUDENT");

        user = new User();
        user.setId(10L);
        user.setUsername("student_alex");
        user.setEmail("alex@ahrao.edu");
        user.setFirstName("Alex");
        user.setLastName("Brooks");
        user.setStatus(UserStatus.ACTIVE);
        user.setRoles(new HashSet<>(Collections.singletonList(studentRole)));

        student = new Student();
        student.setId(100L);
        student.setUser(user);
        student.setDepartment(department);
        student.setProgram(program);
        student.setSection(section);
        student.setRegisterNumber("23CS001");
        student.setRollNumber("CSE-01");
        student.setAdmissionYear(2023);
        student.setCurrentSemester(3);
        student.setStatus("ACTIVE");
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("Should return paginated student list with correct metadata")
    void testGetStudents_Pagination() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Student> mockPage = new PageImpl<>(Collections.singletonList(student), pageable, 1);

        when(studentRepository.findAll(ArgumentMatchers.<Specification<Student>>any(), eq(pageable))).thenReturn(mockPage);

        PagedResponse<StudentSummaryResponse> response = adminStudentService.getStudents(
                "23CS001", 1L, 2L, 3L, "ACTIVE", pageable);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals("23CS001", response.getContent().get(0).getRegisterNumber());
        assertEquals("CSE", response.getContent().get(0).getDepartmentCode());
        assertEquals("Alex Brooks", response.getContent().get(0).getStudentName());
        assertEquals(0, response.getPage());
        assertEquals(10, response.getSize());
        assertEquals(1, response.getTotalElements());
    }

    @Test
    @DisplayName("Should create student by simultaneously provisioning a new user account")
    void testCreateStudent_WithNewUser_Success() {
        CreateStudentRequest request = new CreateStudentRequest();
        request.setRegisterNumber("23CS002");
        request.setDepartmentId(1L);
        request.setProgramId(2L);
        request.setAdmissionYear(2023);
        request.setCurrentSemester(1);
        request.setUsername("student_new");
        request.setEmail("newstudent@ahrao.edu");
        request.setPassword("SecurePass123!");
        request.setFirstName("Jane");
        request.setLastName("Doe");

        when(studentRepository.existsByRegisterNumber("23CS002")).thenReturn(false);
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));
        when(programRepository.findById(2L)).thenReturn(Optional.of(program));
        when(userRepository.existsByUsername("student_new")).thenReturn(false);
        when(userRepository.existsByEmail("newstudent@ahrao.edu")).thenReturn(false);
        when(roleRepository.findByName("STUDENT")).thenReturn(Optional.of(studentRole));
        when(passwordEncoder.encode("SecurePass123!")).thenReturn("$2a$10$hashed");
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(20L);
            return u;
        });
        when(studentRepository.save(any(Student.class))).thenAnswer(i -> {
            Student s = i.getArgument(0);
            s.setId(200L);
            return s;
        });

        StudentSummaryResponse response = adminStudentService.createStudent(
                request, "admin", "127.0.0.1", "JUnit");

        assertNotNull(response);
        assertEquals("23CS002", response.getRegisterNumber());
        assertEquals("Jane Doe", response.getStudentName());
        verify(passwordEncoder).encode("SecurePass123!");
        verify(auditLogRepository, times(2)).save(any()); // USER_CREATED and STUDENT_CREATED
    }

    @Test
    @DisplayName("Should create student by linking an existing student user")
    void testCreateStudent_WithExistingUser_Success() {
        CreateStudentRequest request = new CreateStudentRequest();
        request.setRegisterNumber("23CS003");
        request.setDepartmentId(1L);
        request.setProgramId(2L);
        request.setAdmissionYear(2023);
        request.setCurrentSemester(1);
        request.setUserId(10L);

        when(studentRepository.existsByRegisterNumber("23CS003")).thenReturn(false);
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));
        when(programRepository.findById(2L)).thenReturn(Optional.of(program));
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(studentRepository.existsByUserId(10L)).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenAnswer(i -> i.getArgument(0));

        StudentSummaryResponse response = adminStudentService.createStudent(
                request, "admin", "127.0.0.1", "JUnit");

        assertNotNull(response);
        assertEquals("23CS003", response.getRegisterNumber());
        verify(auditLogRepository).save(any());
    }

    @Test
    @DisplayName("Should throw 409 Conflict when register number already exists")
    void testCreateStudent_DuplicateRegisterNumber_ThrowsConflict() {
        CreateStudentRequest request = new CreateStudentRequest();
        request.setRegisterNumber("23CS001");

        when(studentRepository.existsByRegisterNumber("23CS001")).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () ->
                adminStudentService.createStudent(request, "admin", "127.0.0.1", "JUnit")
        );

        assertTrue(ex.getMessage().contains("already exists"));
        verify(studentRepository, never()).save(any(Student.class));
    }

    @Test
    @DisplayName("Should throw 409 Conflict when user account is already linked to another student")
    void testCreateStudent_UserAlreadyLinked_ThrowsConflict() {
        CreateStudentRequest request = new CreateStudentRequest();
        request.setRegisterNumber("23CS004");
        request.setDepartmentId(1L);
        request.setProgramId(2L);
        request.setUserId(10L);

        when(studentRepository.existsByRegisterNumber("23CS004")).thenReturn(false);
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));
        when(programRepository.findById(2L)).thenReturn(Optional.of(program));
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(studentRepository.existsByUserId(10L)).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () ->
                adminStudentService.createStudent(request, "admin", "127.0.0.1", "JUnit")
        );

        assertTrue(ex.getMessage().contains("already linked to another student"));
        verify(studentRepository, never()).save(any(Student.class));
    }

    @Test
    @DisplayName("Should throw 400 Bad Request when program does not belong to selected department")
    void testCreateStudent_ProgramDepartmentMismatch_ThrowsBadRequest() {
        Department otherDept = new Department();
        otherDept.setId(99L);
        otherDept.setName("Mechanical Engineering");

        Program mismatchProgram = new Program();
        mismatchProgram.setId(2L);
        mismatchProgram.setDepartment(otherDept);

        CreateStudentRequest request = new CreateStudentRequest();
        request.setRegisterNumber("23CS005");
        request.setDepartmentId(1L);
        request.setProgramId(2L);

        when(studentRepository.existsByRegisterNumber("23CS005")).thenReturn(false);
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));
        when(programRepository.findById(2L)).thenReturn(Optional.of(mismatchProgram));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                adminStudentService.createStudent(request, "admin", "127.0.0.1", "JUnit")
        );

        assertTrue(ex.getMessage().contains("does not belong to Department"));
        verify(studentRepository, never()).save(any(Student.class));
    }

    @Test
    @DisplayName("Should update student record successfully")
    void testUpdateStudent_Success() {
        when(studentRepository.findById(100L)).thenReturn(Optional.of(student));
        when(studentRepository.existsByRegisterNumberAndIdNot("23CS001-MOD", 100L)).thenReturn(false);
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));
        when(programRepository.findById(2L)).thenReturn(Optional.of(program));
        when(studentRepository.save(any(Student.class))).thenAnswer(i -> i.getArgument(0));

        UpdateStudentRequest request = new UpdateStudentRequest();
        request.setRegisterNumber("23CS001-MOD");
        request.setDepartmentId(1L);
        request.setProgramId(2L);
        request.setAdmissionYear(2023);
        request.setCurrentSemester(4);
        request.setStatus("ACTIVE");
        request.setEmail("alex.updated@ahrao.edu");
        request.setFirstName("Alexandre");

        when(userRepository.existsByEmail("alex.updated@ahrao.edu")).thenReturn(false);

        StudentSummaryResponse response = adminStudentService.updateStudent(
                100L, request, "admin", "127.0.0.1", "JUnit");

        assertNotNull(response);
        assertEquals("23CS001-MOD", response.getRegisterNumber());
        assertEquals(4, response.getCurrentSemester());
        verify(auditLogRepository).save(any());
    }

    @Test
    @DisplayName("Should toggle student status and record audit log")
    void testUpdateStudentStatus_Success() {
        when(studentRepository.findById(100L)).thenReturn(Optional.of(student));
        when(studentRepository.save(any(Student.class))).thenAnswer(i -> i.getArgument(0));

        StudentSummaryResponse response = adminStudentService.updateStudentStatus(
                100L, "INACTIVE", "admin", "127.0.0.1", "JUnit");

        assertNotNull(response);
        assertEquals("INACTIVE", response.getStatus());
        verify(auditLogRepository).save(any());
    }

    @Test
    @DisplayName("Should return complete reference data for dropdowns")
    void testGetReferenceData() {
        when(departmentRepository.findAll()).thenReturn(Collections.singletonList(department));
        when(programRepository.findAll()).thenReturn(Collections.singletonList(program));
        when(sectionRepository.findAll()).thenReturn(Collections.singletonList(section));
        when(userRepository.findUnassignedStudentUsers()).thenReturn(Collections.singletonList(user));

        StudentReferenceDataResponse response = adminStudentService.getReferenceData();

        assertNotNull(response);
        assertEquals(1, response.getDepartments().size());
        assertEquals(1, response.getPrograms().size());
        assertEquals(1, response.getSections().size());
        assertEquals(1, response.getUnassignedUsers().size());
    }
}
