package com.ahrao.service;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.faculty.academic.FacultySubjectDetailsDto;
import com.ahrao.dto.faculty.academic.FacultySubjectDto;
import com.ahrao.entity.academic.*;
import com.ahrao.entity.enums.DegreeType;
import com.ahrao.entity.enums.SubjectType;
import com.ahrao.entity.resource.Resource;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.FacultySubjectAssignmentRepository;
import com.ahrao.repository.academic.TimetableEntryRepository;
import com.ahrao.service.faculty.FacultySubjectServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FacultySubjectServiceTest {

    @Mock
    private FacultyRepository facultyRepository;

    @Mock
    private FacultySubjectAssignmentRepository facultySubjectAssignmentRepository;

    @Mock
    private TimetableEntryRepository timetableEntryRepository;

    @InjectMocks
    private FacultySubjectServiceImpl facultySubjectService;

    private Faculty testFaculty;
    private Program testProgram;
    private Subject testSubject1;
    private Subject testSubject2;
    private Section testSectionA;
    private Semester testSemester5;
    private FacultySubjectAssignment testAssignment1;
    private FacultySubjectAssignment testAssignment2;
    private TimetableEntry testEntry;

    @BeforeEach
    void setUp() {
        testFaculty = new Faculty();
        testFaculty.setId(50L);

        Department dept = new Department();
        dept.setId(10L);
        dept.setName("Computer Science & Engineering");
        dept.setCode("CSE");

        testProgram = new Program();
        testProgram.setId(200L);
        testProgram.setName("B.Tech CSE");
        testProgram.setCode("BT-CSE");
        testProgram.setDegreeType(DegreeType.B_TECH);
        testProgram.setDepartment(dept);

        testSemester5 = new Semester();
        testSemester5.setId(15L);
        testSemester5.setNumber(5);
        testSemester5.setName("Semester 5");

        testSubject1 = new Subject();
        testSubject1.setId(301L);
        testSubject1.setName("Database Management Systems");
        testSubject1.setCode("CS501");
        testSubject1.setCredits(4);
        testSubject1.setSubjectType(SubjectType.THEORY);
        testSubject1.setProgram(testProgram);
        testSubject1.setSemester(testSemester5);

        testSubject2 = new Subject();
        testSubject2.setId(302L);
        testSubject2.setName("Operating Systems");
        testSubject2.setCode("CS502");
        testSubject2.setCredits(3);
        testSubject2.setSubjectType(SubjectType.THEORY);
        testSubject2.setProgram(testProgram);
        testSubject2.setSemester(testSemester5);

        testSectionA = new Section();
        testSectionA.setId(401L);
        testSectionA.setName("A");
        testSectionA.setCapacity(60);

        testAssignment1 = new FacultySubjectAssignment();
        testAssignment1.setId(501L);
        testAssignment1.setFaculty(testFaculty);
        testAssignment1.setSubject(testSubject1);
        testAssignment1.setSection(testSectionA);
        testAssignment1.setSemester(testSemester5);
        testAssignment1.setHoursPerWeek(4);
        testAssignment1.setStatus("ACTIVE");

        testAssignment2 = new FacultySubjectAssignment();
        testAssignment2.setId(502L);
        testAssignment2.setFaculty(testFaculty);
        testAssignment2.setSubject(testSubject2);
        testAssignment2.setSection(testSectionA);
        testAssignment2.setSemester(testSemester5);
        testAssignment2.setHoursPerWeek(3);
        testAssignment2.setStatus("ACTIVE");

        TimeSlot timeSlot = new TimeSlot();
        timeSlot.setId(901L);
        timeSlot.setDayOfWeek("MONDAY");
        timeSlot.setStartTime(LocalTime.of(9, 30));
        timeSlot.setEndTime(LocalTime.of(10, 30));
        timeSlot.setName("Period 1");

        Resource resource = new Resource();
        resource.setId(801L);
        resource.setName("Lab 101");
        resource.setCode("LAB-101");
        resource.setLocation("Block B");
        resource.setCapacity(60);

        testEntry = new TimetableEntry();
        testEntry.setId(701L);
        testEntry.setFaculty(testFaculty);
        testEntry.setSubject(testSubject1);
        testEntry.setSection(testSectionA);
        testEntry.setTimeSlot(timeSlot);
        testEntry.setResource(resource);
        testEntry.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("getAssignedSubjects: Returns paginated subjects with search filtering")
    void testGetAssignedSubjects_SearchFilter() {
        when(facultyRepository.findByUserId(101L)).thenReturn(Optional.of(testFaculty));
        when(facultySubjectAssignmentRepository.findActiveByFacultyIdWithDetails(50L))
                .thenReturn(List.of(testAssignment1, testAssignment2));

        PagedResponse<FacultySubjectDto> result = facultySubjectService.getAssignedSubjects(
                101L, "database", null, null, PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("CS501", result.getContent().get(0).getSubjectCode());
        assertEquals("Database Management Systems", result.getContent().get(0).getSubjectName());
    }

    @Test
    @DisplayName("getAssignedSubjects: Respects program and semester filters")
    void testGetAssignedSubjects_ProgramAndSemesterFilter() {
        when(facultyRepository.findByUserId(101L)).thenReturn(Optional.of(testFaculty));
        when(facultySubjectAssignmentRepository.findActiveByFacultyIdWithDetails(50L))
                .thenReturn(List.of(testAssignment1, testAssignment2));

        PagedResponse<FacultySubjectDto> result = facultySubjectService.getAssignedSubjects(
                101L, null, 200L, 5, PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
    }

    @Test
    @DisplayName("getSubjectDetails: Successfully returns details with sections and timetable entries")
    void testGetSubjectDetails_Success() {
        when(facultyRepository.findByUserId(101L)).thenReturn(Optional.of(testFaculty));
        when(facultySubjectAssignmentRepository.existsByFacultyIdAndSubjectId(50L, 301L)).thenReturn(true);
        when(facultySubjectAssignmentRepository.findActiveByFacultyIdAndSubjectIdWithDetails(50L, 301L))
                .thenReturn(List.of(testAssignment1));
        when(timetableEntryRepository.findActiveByFacultyIdAndSubjectIdWithDetails(50L, 301L))
                .thenReturn(List.of(testEntry));

        FacultySubjectDetailsDto details = facultySubjectService.getSubjectDetails(101L, 301L);

        assertNotNull(details);
        assertEquals("CS501", details.getSubjectCode());
        assertEquals("Database Management Systems", details.getSubjectName());
        assertEquals(4, details.getCredits());
        assertEquals("BT-CSE", details.getProgramCode());
        assertEquals("Computer Science & Engineering", details.getDepartmentName());
        assertEquals(1, details.getAssignedSections().size());
        assertEquals("A", details.getAssignedSections().get(0).getSectionName());
        assertEquals(1, details.getTimetableSlots().size());
        assertEquals("MONDAY", details.getTimetableSlots().get(0).getDayOfWeek());
    }

    @Test
    @DisplayName("getSubjectDetails: Strictly prevents access to unassigned subjects (Security check)")
    void testGetSubjectDetails_SubjectNotAssigned_ThrowsException() {
        when(facultyRepository.findByUserId(101L)).thenReturn(Optional.of(testFaculty));
        when(facultySubjectAssignmentRepository.existsByFacultyIdAndSubjectId(50L, 999L)).thenReturn(false);

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> facultySubjectService.getSubjectDetails(101L, 999L));

        assertTrue(ex.getMessage().contains("not assigned to authenticated faculty"));
        verify(timetableEntryRepository, never()).findActiveByFacultyIdAndSubjectIdWithDetails(anyLong(), anyLong());
    }

    @Test
    @DisplayName("getSubjectDetails: Throws ResourceNotFoundException when faculty profile is missing")
    void testGetSubjectDetails_FacultyNotFound() {
        when(facultyRepository.findByUserId(101L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> facultySubjectService.getSubjectDetails(101L, 301L));
    }
}
