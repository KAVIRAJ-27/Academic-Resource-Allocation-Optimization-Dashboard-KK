package com.ahrao.service;

import com.ahrao.dto.faculty.academic.FacultyAcademicOverviewDto;
import com.ahrao.dto.faculty.academic.FacultyCourseDto;
import com.ahrao.entity.academic.*;
import com.ahrao.entity.enums.DegreeType;
import com.ahrao.entity.enums.SubjectType;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.FacultySubjectAssignmentRepository;
import com.ahrao.service.faculty.FacultyAcademicServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FacultyAcademicServiceTest {

    @Mock
    private FacultyRepository facultyRepository;

    @Mock
    private FacultySubjectAssignmentRepository facultySubjectAssignmentRepository;

    @InjectMocks
    private FacultyAcademicServiceImpl facultyAcademicService;

    private Faculty testFaculty;
    private Department testDept;
    private Institution testInst;
    private Program testProgram;
    private Subject testSubject;
    private Section testSection;
    private FacultySubjectAssignment testAssignment;

    @BeforeEach
    void setUp() {
        testInst = new Institution();
        testInst.setId(1L);
        testInst.setName("Apex Institute of Technology");

        testDept = new Department();
        testDept.setId(10L);
        testDept.setName("Computer Science & Engineering");
        testDept.setCode("CSE");
        testDept.setInstitution(testInst);

        testFaculty = new Faculty();
        testFaculty.setId(50L);
        testFaculty.setDepartment(testDept);

        testProgram = new Program();
        testProgram.setId(200L);
        testProgram.setName("B.Tech Computer Science");
        testProgram.setCode("BT-CSE");
        testProgram.setDegreeType(DegreeType.B_TECH);
        testProgram.setDurationYears(4);
        testProgram.setDepartment(testDept);

        testSubject = new Subject();
        testSubject.setId(300L);
        testSubject.setName("Data Structures & Algorithms");
        testSubject.setCode("CS301");
        testSubject.setCredits(4);
        testSubject.setSubjectType(SubjectType.THEORY);
        testSubject.setProgram(testProgram);

        testSection = new Section();
        testSection.setId(400L);
        testSection.setName("A");
        testSection.setCapacity(60);

        testAssignment = new FacultySubjectAssignment();
        testAssignment.setId(500L);
        testAssignment.setFaculty(testFaculty);
        testAssignment.setSubject(testSubject);
        testAssignment.setSection(testSection);
        testAssignment.setHoursPerWeek(4);
        testAssignment.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("getAcademicOverview: Successfully aggregates assigned programs, subjects, and hours")
    void testGetAcademicOverview_Success() {
        when(facultyRepository.findByUserId(101L)).thenReturn(Optional.of(testFaculty));
        when(facultySubjectAssignmentRepository.findActiveByFacultyIdWithDetails(50L))
                .thenReturn(List.of(testAssignment));

        FacultyAcademicOverviewDto overview = facultyAcademicService.getAcademicOverview(101L);

        assertNotNull(overview);
        assertEquals("Computer Science & Engineering", overview.getDepartmentName());
        assertEquals("CSE", overview.getDepartmentCode());
        assertEquals("Apex Institute of Technology", overview.getInstitutionName());
        assertEquals(1, overview.getAssignedCoursesCount());
        assertEquals(1, overview.getAssignedSubjectsCount());
        assertEquals(1, overview.getAssignedSectionsCount());
        assertEquals(4, overview.getTotalWeeklyInstructionHours());

        assertEquals(1, overview.getAssignedPrograms().size());
        assertEquals("BT-CSE", overview.getAssignedPrograms().get(0).getProgramCode());

        assertEquals(1, overview.getAssignedSubjects().size());
        assertEquals("CS301", overview.getAssignedSubjects().get(0).getSubjectCode());
    }

    @Test
    @DisplayName("getAcademicOverview: Throws ResourceNotFoundException when faculty does not exist")
    void testGetAcademicOverview_FacultyNotFound() {
        when(facultyRepository.findByUserId(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> facultyAcademicService.getAcademicOverview(999L));
        verify(facultySubjectAssignmentRepository, never()).findActiveByFacultyIdWithDetails(anyLong());
    }

    @Test
    @DisplayName("getAssignedCourses: Successfully extracts unique courses with assigned subject counts")
    void testGetAssignedCourses_Success() {
        when(facultyRepository.findByUserId(101L)).thenReturn(Optional.of(testFaculty));
        when(facultySubjectAssignmentRepository.findActiveByFacultyIdWithDetails(50L))
                .thenReturn(List.of(testAssignment));

        List<FacultyCourseDto> courses = facultyAcademicService.getAssignedCourses(101L);

        assertNotNull(courses);
        assertEquals(1, courses.size());
        FacultyCourseDto course = courses.get(0);
        assertEquals(200L, course.getProgramId());
        assertEquals("BT-CSE", course.getProgramCode());
        assertEquals("B.Tech Computer Science", course.getProgramName());
        assertEquals("B_TECH", course.getDegreeType());
        assertEquals(1, course.getAssignedSubjectsCount());
    }

    @Test
    @DisplayName("getAssignedCourses: Returns empty list when faculty has no active assignments")
    void testGetAssignedCourses_Empty() {
        when(facultyRepository.findByUserId(101L)).thenReturn(Optional.of(testFaculty));
        when(facultySubjectAssignmentRepository.findActiveByFacultyIdWithDetails(50L))
                .thenReturn(Collections.emptyList());

        List<FacultyCourseDto> courses = facultyAcademicService.getAssignedCourses(101L);

        assertNotNull(courses);
        assertTrue(courses.isEmpty());
    }
}
