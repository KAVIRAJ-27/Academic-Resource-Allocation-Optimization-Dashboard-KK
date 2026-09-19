package com.ahrao.service;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.student.academic.StudentAcademicResponse;
import com.ahrao.dto.student.academic.StudentSubjectDetailsDto;
import com.ahrao.dto.student.academic.StudentSubjectDto;
import com.ahrao.dto.student.academic.StudentTimetableEntryDto;
import com.ahrao.entity.academic.*;
import com.ahrao.entity.enums.SubjectType;
import com.ahrao.entity.resource.Resource;
import com.ahrao.entity.resource.ResourceCategory;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.FacultySubjectAssignmentRepository;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.academic.SubjectRepository;
import com.ahrao.repository.academic.TimetableEntryRepository;
import com.ahrao.service.student.StudentAcademicServiceImpl;
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

import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import org.mockito.ArgumentMatchers;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentAcademicServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private FacultySubjectAssignmentRepository assignmentRepository;

    @Mock
    private TimetableEntryRepository timetableEntryRepository;

    @InjectMocks
    private StudentAcademicServiceImpl studentAcademicService;

    private Student mockStudent;
    private Department mockDept;
    private Program mockProgram;
    private Section mockSection;
    private Semester mockSemester;
    private AcademicYear mockAcademicYear;
    private Subject mockSubject1;
    private Subject mockSubject2;
    private Faculty mockFaculty;

    @BeforeEach
    void setUp() {
        User mockUser = new User();
        mockUser.setUsername("alex_student");
        mockUser.setFirstName("Alex");
        mockUser.setLastName("Mercer");
        mockUser.setEmail("alex@univ.edu");

        mockDept = new Department();
        mockDept.setId(10L);
        mockDept.setName("Computer Science and Engineering");
        mockDept.setCode("CSE");

        mockProgram = new Program();
        mockProgram.setId(1L);
        mockProgram.setName("B.Tech CSE");
        mockProgram.setCode("BTECH-CSE");
        mockProgram.setDegreeType(com.ahrao.entity.enums.DegreeType.B_TECH);
        mockProgram.setDurationYears(4);
        mockProgram.setDepartment(mockDept);

        mockAcademicYear = new AcademicYear();
        mockAcademicYear.setName("2025-2026");

        mockSemester = new Semester();
        mockSemester.setName("Semester 6");
        mockSemester.setNumber(6);
        mockSemester.setAcademicYear(mockAcademicYear);

        mockSection = new Section();
        mockSection.setId(20L);
        mockSection.setName("Section A");
        mockSection.setProgram(mockProgram);
        mockSection.setSemester(mockSemester);
        mockSection.setAcademicYear(mockAcademicYear);

        mockStudent = new Student();
        mockStudent.setId(1L);
        mockStudent.setUser(mockUser);
        mockStudent.setDepartment(mockDept);
        mockStudent.setProgram(mockProgram);
        mockStudent.setSection(mockSection);
        mockStudent.setRegisterNumber("RA2111003010001");
        mockStudent.setRollNumber("CSE-001");
        mockStudent.setAdmissionYear(2022);
        mockStudent.setCurrentSemester(6);
        mockStudent.setStatus("ACTIVE");

        mockSubject1 = new Subject();
        mockSubject1.setId(101L);
        mockSubject1.setCode("CS601");
        mockSubject1.setName("Distributed Systems");
        mockSubject1.setCredits(4);
        mockSubject1.setSubjectType(SubjectType.THEORY);
        mockSubject1.setProgram(mockProgram);
        mockSubject1.setSemester(mockSemester);
        mockSubject1.setStatus("ACTIVE");

        mockSubject2 = new Subject();
        mockSubject2.setId(102L);
        mockSubject2.setCode("CS602");
        mockSubject2.setName("Compiler Design");
        mockSubject2.setCredits(3);
        mockSubject2.setSubjectType(SubjectType.THEORY);
        mockSubject2.setProgram(mockProgram);
        mockSubject2.setSemester(mockSemester);
        mockSubject2.setStatus("ACTIVE");

        User facultyUser = new User();
        facultyUser.setFirstName("Alan");
        facultyUser.setLastName("Turing");
        facultyUser.setEmail("alan.turing@univ.edu");

        mockFaculty = new Faculty();
        mockFaculty.setId(5L);
        mockFaculty.setUser(facultyUser);
        mockFaculty.setEmployeeId("FAC-001");
        mockFaculty.setDesignation("Associate Professor");
        mockFaculty.setDepartment(mockDept);
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("getAcademicOverview should return complete academic structure and verified subjects")
    void testGetAcademicOverviewSuccess() {
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));
        when(subjectRepository.findAll(ArgumentMatchers.<Specification<Subject>>any())).thenReturn(List.of(mockSubject1, mockSubject2));
        lenient().when(assignmentRepository.findFirstBySubjectIdAndSectionId(any(), any())).thenReturn(Optional.empty());
        lenient().when(assignmentRepository.findFirstBySubjectId(any())).thenReturn(Optional.empty());
        when(timetableEntryRepository.findBySectionId(any())).thenReturn(Collections.emptyList());

        StudentAcademicResponse response = studentAcademicService.getAcademicOverview(10L);

        assertNotNull(response);
        assertNotNull(response.getOverview());
        assertEquals("Alex Mercer", response.getOverview().getStudentName());
        assertEquals("RA2111003010001", response.getOverview().getRegisterNumber());
        assertEquals("Computer Science and Engineering", response.getOverview().getDepartmentName());
        assertEquals("B.Tech CSE", response.getOverview().getProgramName());
        assertEquals("Section A", response.getOverview().getSectionName());
        assertEquals(6, response.getOverview().getCurrentSemester());

        assertEquals(2, response.getSubjects().size());
        assertEquals(7, response.getTotalCredits()); // 4 + 3
        assertEquals(8, response.getAvailableSemesters().size());
    }

    @Test
    @DisplayName("getAcademicOverview should throw ResourceNotFoundException when student profile missing")
    void testGetAcademicOverviewStudentNotFound() {
        when(studentRepository.findByUserId(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> studentAcademicService.getAcademicOverview(99L));
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("getStudentSubjects should return paged subjects within student program scope")
    void testGetStudentSubjects() {
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));

        Page<Subject> mockPage = new PageImpl<>(List.of(mockSubject1), PageRequest.of(0, 10), 1);
        when(subjectRepository.findAll(ArgumentMatchers.<Specification<Subject>>any(), any(Pageable.class))).thenReturn(mockPage);

        PagedResponse<StudentSubjectDto> response = studentAcademicService.getStudentSubjects(
                10L, "Distributed", 6, SubjectType.THEORY, "ACTIVE", PageRequest.of(0, 10));

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals("CS601", response.getContent().get(0).getCode());
        assertEquals("Distributed Systems", response.getContent().get(0).getName());
    }

    @Test
    @DisplayName("getSubjectDetails should succeed when subject belongs to student program")
    void testGetSubjectDetailsSuccess() {
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));
        when(subjectRepository.findById(1L)).thenReturn(Optional.of(mockSubject1));

        FacultySubjectAssignment assignment = new FacultySubjectAssignment();
        assignment.setFaculty(mockFaculty);
        assignment.setHoursPerWeek(4);
        when(assignmentRepository.findFirstBySubjectIdAndSectionId(any(), any()))
                .thenReturn(Optional.of(assignment));

        StudentSubjectDetailsDto details = studentAcademicService.getSubjectDetails(10L, 1L);

        assertNotNull(details);
        assertEquals("CS601", details.getCode());
        assertEquals("Alan Turing", details.getFacultyName());
        assertEquals("Associate Professor", details.getFacultyDesignation());
    }

    @Test
    @DisplayName("getSubjectDetails should throw ForbiddenException when subject is outside student program")
    void testGetSubjectDetailsScopeForbidden() {
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));

        Program otherProgram = new Program();
        otherProgram.setId(99L);
        Subject otherSubject = new Subject();
        otherSubject.setId(2L);
        otherSubject.setCode("ME101");
        otherSubject.setName("Thermodynamics");
        otherSubject.setProgram(otherProgram);

        when(subjectRepository.findById(2L)).thenReturn(Optional.of(otherSubject));

        assertThrows(ForbiddenException.class, () -> studentAcademicService.getSubjectDetails(10L, 2L));
    }

    @Test
    @DisplayName("getStudentTimetable should return sorted timetable entries for student section")
    void testGetStudentTimetable() {
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));

        TimeSlot slot = new TimeSlot();
        slot.setDayOfWeek("MONDAY");
        slot.setStartTime(LocalTime.of(9, 0));
        slot.setEndTime(LocalTime.of(10, 0));
        slot.setName("Period 1");

        Resource classroom = new Resource();
        classroom.setName("Hall 101");
        classroom.setCode("CR-101");
        ResourceCategory cat = new ResourceCategory();
        cat.setName("Classroom");
        classroom.setCategory(cat);

        TimetableEntry entry = new TimetableEntry();
        entry.setTimeSlot(slot);
        entry.setSubject(mockSubject1);
        entry.setFaculty(mockFaculty);
        entry.setResource(classroom);
        entry.setStatus("ACTIVE");

        when(timetableEntryRepository.findBySectionId(any())).thenReturn(List.of(entry));

        List<StudentTimetableEntryDto> timetable = studentAcademicService.getStudentTimetable(10L);

        assertNotNull(timetable);
        assertEquals(1, timetable.size());
        assertEquals("MONDAY", timetable.get(0).getDayOfWeek());
        assertEquals("CS601", timetable.get(0).getSubjectCode());
        assertEquals("Hall 101", timetable.get(0).getResourceName());
    }
}
