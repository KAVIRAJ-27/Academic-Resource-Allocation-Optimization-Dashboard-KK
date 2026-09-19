package com.ahrao.service;

import com.ahrao.dto.academic.*;
import com.ahrao.entity.academic.*;
import com.ahrao.entity.enums.DegreeType;
import com.ahrao.entity.enums.SubjectType;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.repository.academic.*;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.academic.impl.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminAcademicManagementServiceTest {

    @Mock
    private InstitutionRepository institutionRepository;
    @Mock
    private DepartmentRepository departmentRepository;
    @Mock
    private AcademicYearRepository academicYearRepository;
    @Mock
    private SemesterRepository semesterRepository;
    @Mock
    private ProgramRepository programRepository;
    @Mock
    private SubjectRepository subjectRepository;
    @Mock
    private SectionRepository sectionRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private FacultyRepository facultyRepository;
    @Mock
    private DepartmentHODRepository departmentHODRepository;
    @Mock
    private AuditLogRepository auditLogRepository;
    @Mock
    private UserRepository userRepository;

    private DepartmentManagementServiceImpl departmentService;
    private AcademicYearManagementServiceImpl academicYearService;
    private SemesterManagementServiceImpl semesterService;
    private ProgramManagementServiceImpl programService;
    private SubjectManagementServiceImpl subjectService;
    private SectionManagementServiceImpl sectionService;

    private Institution sampleInstitution;

    @BeforeEach
    void setUp() {
        departmentService = new DepartmentManagementServiceImpl(
                departmentRepository, institutionRepository, programRepository, facultyRepository,
                studentRepository, subjectRepository, departmentHODRepository, auditLogRepository, userRepository);
        academicYearService = new AcademicYearManagementServiceImpl(
                academicYearRepository, institutionRepository, semesterRepository, sectionRepository,
                subjectRepository, auditLogRepository, userRepository);
        semesterService = new SemesterManagementServiceImpl(
                semesterRepository, academicYearRepository, subjectRepository, sectionRepository,
                auditLogRepository, userRepository);
        programService = new ProgramManagementServiceImpl(
                programRepository, departmentRepository, subjectRepository, sectionRepository,
                studentRepository, auditLogRepository, userRepository);
        subjectService = new SubjectManagementServiceImpl(
                subjectRepository, programRepository, semesterRepository, auditLogRepository, userRepository);
        sectionService = new SectionManagementServiceImpl(
                sectionRepository, programRepository, academicYearRepository, semesterRepository,
                studentRepository, auditLogRepository, userRepository);

        sampleInstitution = new Institution();
        sampleInstitution.setId(1L);
        sampleInstitution.setName("AHRAO Tech");
        sampleInstitution.setCode("AHRAO-TECH");
    }

    // =========================================================================
    // 1. DEPARTMENT TESTS
    // =========================================================================

    @Test
    @DisplayName("Create department successfully")
    void testCreateDepartment_Success() {
        CreateDepartmentRequest req = new CreateDepartmentRequest();
        req.setInstitutionId(1L);
        req.setName("Computer Science & Engineering");
        req.setCode("CSE");
        req.setDescription("Computing and Systems");

        when(institutionRepository.findById(1L)).thenReturn(Optional.of(sampleInstitution));
        when(departmentRepository.existsByInstitutionIdAndCode(1L, "CSE")).thenReturn(false);
        when(departmentRepository.existsByInstitutionIdAndName(1L, "Computer Science & Engineering")).thenReturn(false);

        Department saved = new Department();
        saved.setId(10L);
        saved.setInstitution(sampleInstitution);
        saved.setName("Computer Science & Engineering");
        saved.setCode("CSE");
        saved.setStatus("ACTIVE");

        when(departmentRepository.save(any(Department.class))).thenReturn(saved);

        DepartmentSummaryResponse res = departmentService.createDepartment(req, "admin", "127.0.0.1", "TestAgent");

        assertNotNull(res);
        assertEquals("CSE", res.getCode());
        assertEquals("Computer Science & Engineering", res.getName());
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Create department with duplicate code throws ConflictException")
    void testCreateDepartment_DuplicateCode_ThrowsConflict() {
        CreateDepartmentRequest req = new CreateDepartmentRequest();
        req.setInstitutionId(1L);
        req.setName("Computer Science & Engineering");
        req.setCode("CSE");

        when(institutionRepository.findById(1L)).thenReturn(Optional.of(sampleInstitution));
        when(departmentRepository.existsByInstitutionIdAndCode(1L, "CSE")).thenReturn(true);

        assertThrows(ConflictException.class, () ->
                departmentService.createDepartment(req, "admin", "127.0.0.1", "TestAgent"));
    }

    @Test
    @DisplayName("Deactivating department with active programs throws ConflictException")
    void testDeactivateDepartment_ActivePrograms_ThrowsConflict() {
        Department dept = new Department();
        dept.setId(10L);
        dept.setName("Computer Science");
        dept.setStatus("ACTIVE");

        when(departmentRepository.findById(10L)).thenReturn(Optional.of(dept));
        when(programRepository.countByDepartmentIdAndStatus(10L, "ACTIVE")).thenReturn(2L);

        assertThrows(ConflictException.class, () ->
                departmentService.updateDepartmentStatus(10L, "INACTIVE", "admin", "127.0.0.1", "TestAgent"));
    }

    // =========================================================================
    // 2. ACADEMIC YEAR TESTS
    // =========================================================================

    @Test
    @DisplayName("Create academic year with startDate >= endDate throws BadRequestException")
    void testCreateAcademicYear_InvalidDates_ThrowsBadRequest() {
        CreateAcademicYearRequest req = new CreateAcademicYearRequest();
        req.setName("2026-2027");
        req.setStartDate(LocalDate.of(2027, 5, 1));
        req.setEndDate(LocalDate.of(2026, 5, 1)); // before start date!

        assertThrows(BadRequestException.class, () ->
                academicYearService.createAcademicYear(req, "admin", "127.0.0.1", "TestAgent"));
    }

    @Test
    @DisplayName("Activate academic year enforces single active year by deactivating others")
    void testActivateAcademicYear_EnforcesSingleActiveYear() {
        AcademicYear target = new AcademicYear();
        target.setId(2L);
        target.setInstitution(sampleInstitution);
        target.setName("2026-2027");
        target.setStatus("INACTIVE");

        AcademicYear currentActive = new AcademicYear();
        currentActive.setId(1L);
        currentActive.setInstitution(sampleInstitution);
        currentActive.setName("2025-2026");
        currentActive.setStatus("ACTIVE");

        when(academicYearRepository.findById(2L)).thenReturn(Optional.of(target));
        when(academicYearRepository.findByInstitutionId(1L)).thenReturn(Collections.singletonList(currentActive));
        when(academicYearRepository.save(any(AcademicYear.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AcademicYearSummaryResponse res = academicYearService.activateAcademicYear(2L, "admin", "127.0.0.1", "TestAgent");

        assertNotNull(res);
        assertEquals("ACTIVE", target.getStatus());
        assertEquals("INACTIVE", currentActive.getStatus());
        verify(academicYearRepository).save(currentActive);
    }

    // =========================================================================
    // 3. SEMESTER TESTS
    // =========================================================================

    @Test
    @DisplayName("Create semester with duplicate number in same academic year throws ConflictException")
    void testCreateSemester_DuplicateNumber_ThrowsConflict() {
        AcademicYear year = new AcademicYear();
        year.setId(5L);
        year.setName("2026-2027");

        CreateSemesterRequest req = new CreateSemesterRequest();
        req.setAcademicYearId(5L);
        req.setName("Semester 1");
        req.setNumber(1);
        req.setStartDate(LocalDate.of(2026, 8, 1));
        req.setEndDate(LocalDate.of(2026, 12, 15));

        when(academicYearRepository.findById(5L)).thenReturn(Optional.of(year));
        when(semesterRepository.existsByAcademicYearIdAndNumber(5L, 1)).thenReturn(true);

        assertThrows(ConflictException.class, () ->
                semesterService.createSemester(req, "admin", "127.0.0.1", "TestAgent"));
    }

    // =========================================================================
    // 4. PROGRAM TESTS
    // =========================================================================

    @Test
    @DisplayName("Create program with duplicate code in department throws ConflictException")
    void testCreateProgram_DuplicateCode_ThrowsConflict() {
        Department dept = new Department();
        dept.setId(10L);
        dept.setName("Computer Science");

        CreateProgramRequest req = new CreateProgramRequest();
        req.setDepartmentId(10L);
        req.setName("B.Tech Computer Science");
        req.setCode("BTECH_CSE");
        req.setDegreeType(DegreeType.B_TECH);
        req.setDurationYears(4);

        when(departmentRepository.findById(10L)).thenReturn(Optional.of(dept));
        when(programRepository.existsByDepartmentIdAndCode(10L, "BTECH_CSE")).thenReturn(true);

        assertThrows(ConflictException.class, () ->
                programService.createProgram(req, "admin", "127.0.0.1", "TestAgent"));
    }

    // =========================================================================
    // 5. SUBJECT TESTS
    // =========================================================================

    @Test
    @DisplayName("Create subject with duplicate code in program throws ConflictException")
    void testCreateSubject_DuplicateCode_ThrowsConflict() {
        Program prog = new Program();
        prog.setId(20L);
        prog.setName("B.Tech CSE");

        Semester sem = new Semester();
        sem.setId(30L);
        sem.setName("Semester 3");

        CreateSubjectRequest req = new CreateSubjectRequest();
        req.setProgramId(20L);
        req.setSemesterId(30L);
        req.setCode("CS301");
        req.setName("Data Structures");
        req.setCredits(4);
        req.setSubjectType(SubjectType.THEORY);

        when(programRepository.findById(20L)).thenReturn(Optional.of(prog));
        when(semesterRepository.findById(30L)).thenReturn(Optional.of(sem));
        when(subjectRepository.existsByProgramIdAndCode(20L, "CS301")).thenReturn(true);

        assertThrows(ConflictException.class, () ->
                subjectService.createSubject(req, "admin", "127.0.0.1", "TestAgent"));
    }

    // =========================================================================
    // 6. SECTION TESTS
    // =========================================================================

    @Test
    @DisplayName("Create section with duplicate name in same program, year, and semester throws ConflictException")
    void testCreateSection_DuplicateSection_ThrowsConflict() {
        Program prog = new Program();
        prog.setId(20L);
        prog.setName("B.Tech CSE");

        AcademicYear year = new AcademicYear();
        year.setId(5L);
        year.setName("2026-2027");

        Semester sem = new Semester();
        sem.setId(30L);
        sem.setName("Semester 3");

        CreateSectionRequest req = new CreateSectionRequest();
        req.setProgramId(20L);
        req.setAcademicYearId(5L);
        req.setSemesterId(30L);
        req.setName("Section A");
        req.setCapacity(60);

        when(programRepository.findById(20L)).thenReturn(Optional.of(prog));
        when(academicYearRepository.findById(5L)).thenReturn(Optional.of(year));
        when(semesterRepository.findById(30L)).thenReturn(Optional.of(sem));
        when(sectionRepository.existsByProgramIdAndAcademicYearIdAndSemesterIdAndName(20L, 5L, 30L, "SECTION A")).thenReturn(true);

        assertThrows(ConflictException.class, () ->
                sectionService.createSection(req, "admin", "127.0.0.1", "TestAgent"));
    }

    @Test
    @DisplayName("Delete section with enrolled students throws ConflictException")
    void testDeleteSection_EnrolledStudents_ThrowsConflict() {
        Section section = new Section();
        section.setId(40L);
        section.setName("A");

        when(sectionRepository.findById(40L)).thenReturn(Optional.of(section));
        when(studentRepository.countBySectionId(40L)).thenReturn(35L);

        assertThrows(ConflictException.class, () ->
                sectionService.deleteSection(40L, "admin", "127.0.0.1", "TestAgent"));
    }
}
