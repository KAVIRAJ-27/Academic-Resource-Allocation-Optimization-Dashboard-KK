package com.ahrao.service;

import com.ahrao.dto.faculty.workload.FacultyWorkloadResponseDto;
import com.ahrao.entity.academic.*;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.FacultySubjectAssignmentRepository;
import com.ahrao.repository.academic.FacultyWorkloadRepository;
import com.ahrao.service.faculty.FacultyWorkloadServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FacultyWorkloadServiceTest {

    @Mock
    private FacultyRepository facultyRepository;

    @Mock
    private FacultyWorkloadRepository workloadRepository;

    @Mock
    private FacultySubjectAssignmentRepository assignmentRepository;

    @InjectMocks
    private FacultyWorkloadServiceImpl service;

    private User mockUser;
    private Faculty mockFaculty;
    private Department mockDept;
    private AcademicYear mockYear;
    private Semester mockSemester;
    private FacultyWorkload mockWorkload;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(10L);
        mockUser.setFirstName("Barbara");
        mockUser.setLastName("Liskov");

        mockDept = new Department();
        mockDept.setId(1L);
        mockDept.setName("Computer Science");

        mockFaculty = new Faculty();
        mockFaculty.setId(5L);
        mockFaculty.setUser(mockUser);
        mockFaculty.setDepartment(mockDept);
        mockFaculty.setEmployeeId("FAC-005");
        mockFaculty.setStatus("ACTIVE");

        mockYear = new AcademicYear();
        mockYear.setId(1L);
        mockYear.setName("2024-2025");

        mockSemester = new Semester();
        mockSemester.setId(1L);
        mockSemester.setName("Semester 1");

        mockWorkload = new FacultyWorkload();
        mockWorkload.setId(100L);
        mockWorkload.setFaculty(mockFaculty);
        mockWorkload.setTotalHours(java.math.BigDecimal.valueOf(16.0));
        mockWorkload.setTeachingHours(java.math.BigDecimal.valueOf(12.0));
        mockWorkload.setLabHours(java.math.BigDecimal.valueOf(4.0));
        mockWorkload.setOtherHours(java.math.BigDecimal.ZERO);
        mockWorkload.setWorkloadStatus("BALANCED");
        mockWorkload.setAcademicYear(mockYear);
        mockWorkload.setSemester(mockSemester);
        mockWorkload.setCalculatedAt(java.time.Instant.now());
    }

    @Test
    @DisplayName("getWorkload returns full workload summary, breakdown, and history when present")
    void testGetWorkload_Success() {
        Long userId = 10L;
        when(facultyRepository.findByUserId(userId)).thenReturn(Optional.of(mockFaculty));
        when(workloadRepository.findFirstByFacultyIdOrderByCalculatedAtDesc(mockFaculty.getId()))
                .thenReturn(Optional.of(mockWorkload));
        when(workloadRepository.findByFacultyId(mockFaculty.getId())).thenReturn(List.of(mockWorkload));

        // Create assignment
        Subject subject = new Subject();
        subject.setId(20L);
        subject.setCode("CS301");
        subject.setName("Data Structures");
        subject.setCredits(4);

        Program program = new Program();
        program.setName("B.Tech CSE");
        subject.setProgram(program);

        Section section = new Section();
        section.setName("Section A");

        FacultySubjectAssignment assignment = new FacultySubjectAssignment();
        assignment.setId(30L);
        assignment.setFaculty(mockFaculty);
        assignment.setSubject(subject);
        assignment.setSection(section);
        assignment.setAcademicYear(mockYear);
        assignment.setSemester(mockSemester);
        assignment.setStatus("ACTIVE");
        assignment.setHoursPerWeek(4);

        when(assignmentRepository.findActiveByFacultyIdWithDetails(mockFaculty.getId())).thenReturn(List.of(assignment));

        FacultyWorkloadResponseDto response = service.getWorkload(userId);

        assertNotNull(response);
        assertNotNull(response.getSummary());
        assertEquals(java.math.BigDecimal.valueOf(16.0), response.getSummary().getTotalHours());
        assertEquals(java.math.BigDecimal.valueOf(12.0), response.getSummary().getTeachingHours());
        assertEquals(java.math.BigDecimal.valueOf(4.0), response.getSummary().getLabHours());
        assertEquals("BALANCED", response.getSummary().getWorkloadStatus());
        assertEquals("2024-2025", response.getSummary().getAcademicYearName());
        assertEquals("Semester 1", response.getSummary().getSemesterName());

        // Breakdown
        assertNotNull(response.getBreakdown());
        assertEquals(1, response.getBreakdown().size());
        assertEquals("CS301", response.getBreakdown().get(0).getSubjectCode());
        assertEquals("Section A", response.getBreakdown().get(0).getSectionName());

        // History
        assertNotNull(response.getHistory());
        assertEquals(1, response.getHistory().size());
        assertEquals("BALANCED", response.getHistory().get(0).getWorkloadStatus());
    }

    @Test
    @DisplayName("getWorkload with no workload record returns empty state DTO without errors")
    void testGetWorkload_EmptyData_ReturnsEmptyDto() {
        Long userId = 10L;
        when(facultyRepository.findByUserId(userId)).thenReturn(Optional.of(mockFaculty));
        when(workloadRepository.findFirstByFacultyIdOrderByCalculatedAtDesc(mockFaculty.getId()))
                .thenReturn(Optional.empty());
        when(workloadRepository.findByFacultyId(mockFaculty.getId())).thenReturn(Collections.emptyList());
        when(assignmentRepository.findActiveByFacultyIdWithDetails(mockFaculty.getId())).thenReturn(Collections.emptyList());

        FacultyWorkloadResponseDto response = service.getWorkload(userId);

        assertNotNull(response);
        assertNotNull(response.getSummary());
        assertEquals(java.math.BigDecimal.ZERO, response.getSummary().getTotalHours());
        assertEquals(0, response.getSummary().getAssignedSubjectsCount());
        assertEquals("PENDING_CALCULATION", response.getSummary().getWorkloadStatus());
        assertTrue(response.getBreakdown().isEmpty());
        assertTrue(response.getHistory().isEmpty());
    }

    @Test
    @DisplayName("getWorkload throws ResourceNotFoundException when user has no faculty record")
    void testGetWorkload_FacultyNotFound_ThrowsException() {
        Long userId = 999L;
        when(facultyRepository.findByUserId(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getWorkload(userId));
        verifyNoInteractions(workloadRepository);
        verifyNoInteractions(assignmentRepository);
    }
}
