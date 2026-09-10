package com.ahrao.service;

import com.ahrao.dto.staff.*;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.DepartmentHOD;
import com.ahrao.entity.academic.Faculty;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.academic.PrincipalAssignment;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.hostel.Warden;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ConflictException;
import com.ahrao.repository.academic.DepartmentHODRepository;
import com.ahrao.repository.academic.DepartmentRepository;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.InstitutionRepository;
import com.ahrao.repository.academic.PrincipalAssignmentRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.hostel.HostelRepository;
import com.ahrao.repository.hostel.WardenRepository;
import com.ahrao.repository.user.RoleRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.staff.impl.FacultyManagementServiceImpl;
import com.ahrao.service.staff.impl.HodManagementServiceImpl;
import com.ahrao.service.staff.impl.PrincipalManagementServiceImpl;
import com.ahrao.service.staff.impl.WardenManagementServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminStaffManagementServiceTest {

    @Mock
    private FacultyRepository facultyRepository;
    @Mock
    private DepartmentHODRepository departmentHODRepository;
    @Mock
    private PrincipalAssignmentRepository principalAssignmentRepository;
    @Mock
    private WardenRepository wardenRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private DepartmentRepository departmentRepository;
    @Mock
    private InstitutionRepository institutionRepository;
    @Mock
    private HostelRepository hostelRepository;
    @Mock
    private AuditLogRepository auditLogRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    private FacultyManagementServiceImpl facultyService;
    private HodManagementServiceImpl hodService;
    private PrincipalManagementServiceImpl principalService;
    private WardenManagementServiceImpl wardenService;

    @BeforeEach
    void setUp() {
        facultyService = new FacultyManagementServiceImpl(
                facultyRepository, userRepository, roleRepository,
                departmentRepository, auditLogRepository, passwordEncoder);

        hodService = new HodManagementServiceImpl(
                departmentHODRepository, departmentRepository, facultyRepository,
                userRepository, roleRepository, auditLogRepository);

        principalService = new PrincipalManagementServiceImpl(
                principalAssignmentRepository, institutionRepository, facultyRepository,
                userRepository, roleRepository, auditLogRepository);

        wardenService = new WardenManagementServiceImpl(
                wardenRepository, hostelRepository, userRepository,
                roleRepository, auditLogRepository, passwordEncoder);
    }

    // =========================================================================
    // FACULTY MANAGEMENT TESTS
    // =========================================================================

    @Test
    @DisplayName("Should create faculty member successfully with new user account")
    void testCreateFaculty_Success() {
        CreateFacultyRequest request = new CreateFacultyRequest();
        request.setEmployeeId("FAC-001");
        request.setDepartmentId(1L);
        request.setDesignation("Assistant Professor");
        request.setQualification("M.Tech");
        request.setFirstName("Alan");
        request.setLastName("Turing");
        request.setEmail("alan.turing@ahrao.edu");
        request.setPhone("9876543210");
        request.setUsername("alan.turing");
        request.setPassword("SecurePass123!");

        when(facultyRepository.existsByEmployeeId("FAC-001")).thenReturn(false);
        when(userRepository.existsByEmail("alan.turing@ahrao.edu")).thenReturn(false);
        when(userRepository.existsByUsername("alan.turing")).thenReturn(false);

        Department dept = new Department();
        dept.setId(1L);
        dept.setName("Computer Science");
        dept.setCode("CSE");
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(dept));

        Role facultyRole = new Role();
        facultyRole.setId(4L);
        facultyRole.setName("FACULTY");
        when(roleRepository.findByName("FACULTY")).thenReturn(Optional.of(facultyRole));

        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");

        User savedUser = new User();
        savedUser.setId(10L);
        savedUser.setUsername("alan.turing");
        savedUser.setEmail("alan.turing@ahrao.edu");
        savedUser.setFirstName("Alan");
        savedUser.setLastName("Turing");
        savedUser.setStatus(UserStatus.ACTIVE);
        savedUser.setRoles(Collections.singleton(facultyRole));

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        Faculty savedFaculty = new Faculty();
        savedFaculty.setId(100L);
        savedFaculty.setUser(savedUser);
        savedFaculty.setEmployeeId("FAC-001");
        savedFaculty.setDepartment(dept);
        savedFaculty.setDesignation("Assistant Professor");
        savedFaculty.setStatus("ACTIVE");

        when(facultyRepository.save(any(Faculty.class))).thenReturn(savedFaculty);

        FacultySummaryResponse response = facultyService.createFaculty(
                request, "admin_user", "127.0.0.1", "JUnit");

        assertNotNull(response);
        assertEquals("FAC-001", response.getEmployeeId());
        assertEquals("Alan", response.getFirstName());
        assertEquals("Turing", response.getLastName());
        verify(facultyRepository, times(1)).save(any(Faculty.class));
        verify(auditLogRepository, atLeastOnce()).save(any());
    }

    @Test
    @DisplayName("Should throw ConflictException when employeeId already exists")
    void testCreateFaculty_DuplicateEmployeeId() {
        CreateFacultyRequest request = new CreateFacultyRequest();
        request.setEmployeeId("FAC-001");

        when(facultyRepository.existsByEmployeeId("FAC-001")).thenReturn(true);

        assertThrows(ConflictException.class, () ->
                facultyService.createFaculty(request, "admin_user", "127.0.0.1", "JUnit"));
        verify(facultyRepository, never()).save(any(Faculty.class));
    }

    @Test
    @DisplayName("Should update faculty status successfully")
    void testUpdateFacultyStatus_Success() {
        User user = new User();
        user.setId(10L);
        user.setStatus(UserStatus.ACTIVE);

        Department dept = new Department();
        dept.setId(1L);
        dept.setName("Computer Science");
        dept.setCode("CSE");

        Faculty faculty = new Faculty();
        faculty.setId(100L);
        faculty.setUser(user);
        faculty.setDepartment(dept);
        faculty.setEmployeeId("FAC-001");
        faculty.setStatus("ACTIVE");

        when(facultyRepository.findById(100L)).thenReturn(Optional.of(faculty));
        when(facultyRepository.save(any(Faculty.class))).thenReturn(faculty);

        FacultySummaryResponse response = facultyService.updateFacultyStatus(
                100L, "INACTIVE", "admin_user", "127.0.0.1", "JUnit");

        assertNotNull(response);
        assertEquals("INACTIVE", faculty.getStatus());
        verify(auditLogRepository, times(1)).save(any());
    }

    // =========================================================================
    // HOD MANAGEMENT TESTS
    // =========================================================================

    @Test
    @DisplayName("Should assign HOD successfully and attach HOD role")
    void testAssignHod_Success() {
        CreateHodAssignmentRequest request = new CreateHodAssignmentRequest();
        request.setDepartmentId(1L);
        request.setFacultyId(100L);
        request.setStartDate(LocalDate.now());

        when(departmentHODRepository.existsByDepartmentIdAndStatus(1L, "ACTIVE"))
                .thenReturn(false);

        Department dept = new Department();
        dept.setId(1L);
        dept.setName("Mechanical Engineering");
        dept.setCode("MECH");
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(dept));

        User user = new User();
        user.setId(20L);
        user.setFirstName("Ada");
        user.setLastName("Lovelace");
        user.setEmail("ada.lovelace@ahrao.edu");
        user.setRoles(new HashSet<>());

        Faculty faculty = new Faculty();
        faculty.setId(100L);
        faculty.setEmployeeId("FAC-002");
        faculty.setUser(user);
        faculty.setDepartment(dept);
        when(facultyRepository.findById(100L)).thenReturn(Optional.of(faculty));

        Role hodRole = new Role();
        hodRole.setId(3L);
        hodRole.setName("HOD");
        when(roleRepository.findByName("HOD")).thenReturn(Optional.of(hodRole));

        DepartmentHOD savedHod = new DepartmentHOD();
        savedHod.setId(500L);
        savedHod.setDepartment(dept);
        savedHod.setFaculty(faculty);
        savedHod.setStatus("ACTIVE");
        savedHod.setStartDate(request.getStartDate());
        when(departmentHODRepository.save(any(DepartmentHOD.class))).thenReturn(savedHod);

        HodSummaryResponse response = hodService.assignHod(
                request, "admin_user", "127.0.0.1", "JUnit");

        assertNotNull(response);
        assertEquals(dept.getId(), response.getDepartmentId());
        assertEquals("Ada Lovelace", response.getFacultyName());
        assertTrue(user.getRoles().contains(hodRole));
        verify(departmentHODRepository, times(1)).save(any(DepartmentHOD.class));
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should prevent assigning duplicate active HOD to department")
    void testAssignHod_DuplicateActiveConflict() {
        CreateHodAssignmentRequest request = new CreateHodAssignmentRequest();
        request.setDepartmentId(1L);
        request.setFacultyId(100L);

        Department dept = new Department();
        dept.setId(1L);
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(dept));

        Faculty faculty = new Faculty();
        faculty.setId(100L);
        when(facultyRepository.findById(100L)).thenReturn(Optional.of(faculty));

        when(departmentHODRepository.existsByDepartmentIdAndStatus(1L, "ACTIVE"))
                .thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () ->
                hodService.assignHod(request, "admin_user", "127.0.0.1", "JUnit"));

        assertTrue(ex.getMessage().contains("already has an active HOD"));
        verify(departmentHODRepository, never()).save(any());
    }

    // =========================================================================
    // PRINCIPAL MANAGEMENT TESTS
    // =========================================================================

    @Test
    @DisplayName("Should assign Principal successfully and attach PRINCIPAL role")
    void testAssignPrincipal_Success() {
        AssignPrincipalRequest request = new AssignPrincipalRequest();
        request.setInstitutionId(1L);
        request.setFacultyId(100L);
        request.setStartDate(LocalDate.now());

        when(principalAssignmentRepository.existsByInstitutionIdAndStatus(1L, "ACTIVE"))
                .thenReturn(false);

        Institution institution = new Institution();
        institution.setId(1L);
        institution.setName("National Institute of Technology");
        when(institutionRepository.findById(1L)).thenReturn(Optional.of(institution));

        User user = new User();
        user.setId(30L);
        user.setFirstName("Grace");
        user.setLastName("Hopper");
        user.setEmail("grace.hopper@ahrao.edu");
        user.setRoles(new HashSet<>());

        Faculty faculty = new Faculty();
        faculty.setId(100L);
        faculty.setEmployeeId("FAC-003");
        faculty.setUser(user);
        when(facultyRepository.findById(100L)).thenReturn(Optional.of(faculty));

        Role principalRole = new Role();
        principalRole.setId(2L);
        principalRole.setName("PRINCIPAL");
        when(roleRepository.findByName("PRINCIPAL")).thenReturn(Optional.of(principalRole));

        PrincipalAssignment savedPrincipal = new PrincipalAssignment();
        savedPrincipal.setId(1L);
        savedPrincipal.setInstitution(institution);
        savedPrincipal.setFaculty(faculty);
        savedPrincipal.setStatus("ACTIVE");
        savedPrincipal.setStartDate(request.getStartDate());
        when(principalAssignmentRepository.save(any(PrincipalAssignment.class))).thenReturn(savedPrincipal);

        PrincipalResponse response = principalService.assignPrincipal(
                request, "admin_user", "127.0.0.1", "JUnit");

        assertNotNull(response);
        assertEquals(1L, response.getInstitutionId());
        assertEquals("Grace Hopper", response.getFacultyName());
        assertTrue(user.getRoles().contains(principalRole));
        verify(principalAssignmentRepository, times(1)).save(any());
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should prevent assigning duplicate active Principal to institution")
    void testAssignPrincipal_DuplicateActiveConflict() {
        AssignPrincipalRequest request = new AssignPrincipalRequest();
        request.setInstitutionId(1L);
        request.setFacultyId(100L);

        Institution institution = new Institution();
        institution.setId(1L);
        when(institutionRepository.findById(1L)).thenReturn(Optional.of(institution));

        Faculty faculty = new Faculty();
        faculty.setId(100L);
        when(facultyRepository.findById(100L)).thenReturn(Optional.of(faculty));

        when(principalAssignmentRepository.existsByInstitutionIdAndStatus(1L, "ACTIVE"))
                .thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () ->
                principalService.assignPrincipal(request, "admin_user", "127.0.0.1", "JUnit"));

        assertTrue(ex.getMessage().contains("active Principal is already assigned"));
        verify(principalAssignmentRepository, never()).save(any());
    }

    // =========================================================================
    // WARDEN MANAGEMENT TESTS
    // =========================================================================

    @Test
    @DisplayName("Should create Warden successfully with hostel assignments and WARDEN role")
    void testCreateWarden_Success() {
        CreateWardenRequest request = new CreateWardenRequest();
        request.setEmployeeId("WRD-001");
        request.setContactNumber("9876543210");
        request.setFirstName("John");
        request.setLastName("Warden");
        request.setEmail("john.warden@ahrao.edu");
        request.setUsername("john.warden");
        request.setPassword("SecurePass123!");
        request.setHostelIds(List.of(1L, 2L));

        when(wardenRepository.existsByEmployeeId("WRD-001")).thenReturn(false);
        when(userRepository.existsByEmail("john.warden@ahrao.edu")).thenReturn(false);
        when(userRepository.existsByUsername("john.warden")).thenReturn(false);

        Hostel h1 = new Hostel();
        h1.setId(1L);
        h1.setName("Boys Hostel A");

        Hostel h2 = new Hostel();
        h2.setId(2L);
        h2.setName("Boys Hostel B");

        when(hostelRepository.findAllById(any())).thenReturn(List.of(h1, h2));

        Role wardenRole = new Role();
        wardenRole.setId(6L);
        wardenRole.setName("WARDEN");
        when(roleRepository.findByName("WARDEN")).thenReturn(Optional.of(wardenRole));

        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");

        User savedUser = new User();
        savedUser.setId(40L);
        savedUser.setUsername("john.warden");
        savedUser.setEmail("john.warden@ahrao.edu");
        savedUser.setFirstName("John");
        savedUser.setLastName("Warden");
        savedUser.setStatus(UserStatus.ACTIVE);
        savedUser.setRoles(Collections.singleton(wardenRole));

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        Warden savedWarden = new Warden();
        savedWarden.setId(10L);
        savedWarden.setUser(savedUser);
        savedWarden.setEmployeeId("WRD-001");
        savedWarden.setStatus("ACTIVE");
        savedWarden.setAssignedHostels(Set.of(h1, h2));

        when(wardenRepository.save(any(Warden.class))).thenReturn(savedWarden);

        WardenSummaryResponse response = wardenService.createWarden(
                request, "admin_user", "127.0.0.1", "JUnit");

        assertNotNull(response);
        assertEquals("WRD-001", response.getEmployeeId());
        assertEquals(2, response.getAssignedHostels().size());
        verify(wardenRepository, times(1)).save(any(Warden.class));
        verify(auditLogRepository, atLeastOnce()).save(any());
    }

    @Test
    @DisplayName("Should assign hostels to existing warden")
    void testAssignHostels_Success() {
        Warden warden = new Warden();
        warden.setId(10L);
        warden.setEmployeeId("WRD-001");
        warden.setStatus("ACTIVE");
        warden.setAssignedHostels(new HashSet<>());

        User user = new User();
        user.setId(40L);
        user.setFirstName("John");
        user.setLastName("Warden");
        warden.setUser(user);

        when(wardenRepository.findById(10L)).thenReturn(Optional.of(warden));

        Hostel h1 = new Hostel();
        h1.setId(1L);
        h1.setName("Boys Hostel A");

        when(hostelRepository.findAllById(any())).thenReturn(List.of(h1));
        when(wardenRepository.save(any(Warden.class))).thenReturn(warden);

        WardenHostelAssignmentRequest request = new WardenHostelAssignmentRequest();
        request.setHostelIds(List.of(1L));

        WardenSummaryResponse response = wardenService.assignHostels(
                10L, request, "admin_user", "127.0.0.1", "JUnit");

        assertNotNull(response);
        assertEquals(1, warden.getAssignedHostels().size());
        verify(auditLogRepository, times(1)).save(any());
    }
}
