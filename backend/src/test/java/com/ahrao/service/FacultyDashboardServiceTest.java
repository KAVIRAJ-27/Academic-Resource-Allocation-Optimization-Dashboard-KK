package com.ahrao.service;

import com.ahrao.dto.faculty.dashboard.FacultyDashboardDto;
import com.ahrao.entity.academic.*;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.resource.Resource;
import com.ahrao.entity.resource.ResourceCategory;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.FacultySubjectAssignmentRepository;
import com.ahrao.repository.academic.FacultyWorkloadRepository;
import com.ahrao.repository.academic.TimetableEntryRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.service.faculty.FacultyDashboardServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FacultyDashboardServiceTest {

    @Mock
    private FacultyRepository facultyRepository;

    @Mock
    private FacultySubjectAssignmentRepository facultySubjectAssignmentRepository;

    @Mock
    private FacultyWorkloadRepository facultyWorkloadRepository;

    @Mock
    private TimetableEntryRepository timetableEntryRepository;

    @Mock
    private AcademicResourceRequestRepository academicResourceRequestRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private FacultyDashboardServiceImpl facultyDashboardService;

    private User testUser;
    private Faculty testFaculty;
    private Department testDept;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(55L);
        testUser.setFirstName("Ada");
        testUser.setLastName("Lovelace");
        testUser.setEmail("ada.lovelace@univ.edu");
        testUser.setPhone("+44123456789");

        testDept = new Department();
        testDept.setId(8L);
        testDept.setName("Computer Science");
        testDept.setCode("CS");

        testFaculty = new Faculty();
        testFaculty.setId(155L);
        testFaculty.setUser(testUser);
        testFaculty.setDepartment(testDept);
        testFaculty.setEmployeeId("FAC-0155");
        testFaculty.setDesignation("Associate Professor");
        testFaculty.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("getDashboard aggregates real database metrics and summaries accurately")
    void testGetDashboardFullData() {
        when(facultyRepository.findByUserId(55L)).thenReturn(Optional.of(testFaculty));

        // Assigned subject
        Subject subj = new Subject();
        subj.setId(10L);
        subj.setCode("CS301");
        subj.setName("Algorithms & Data Structures");
        Program prog = new Program();
        prog.setName("B.Tech Computer Science");
        subj.setProgram(prog);

        Section sec = new Section();
        sec.setName("Section A");

        FacultySubjectAssignment assignment = new FacultySubjectAssignment();
        assignment.setId(1L);
        assignment.setFaculty(testFaculty);
        assignment.setSubject(subj);
        assignment.setSection(sec);
        assignment.setHoursPerWeek(4);
        assignment.setStatus("ACTIVE");

        when(facultySubjectAssignmentRepository.findByFacultyId(155L))
                .thenReturn(Collections.singletonList(assignment));

        // Workload
        FacultyWorkload workload = new FacultyWorkload();
        workload.setId(50L);
        workload.setTotalHours(new BigDecimal("16.00"));
        workload.setTeachingHours(new BigDecimal("12.00"));
        workload.setLabHours(new BigDecimal("4.00"));
        workload.setWorkloadStatus("BALANCED");
        workload.setCalculatedAt(Instant.now());

        when(facultyWorkloadRepository.findFirstByFacultyIdOrderByCalculatedAtDesc(155L))
                .thenReturn(Optional.of(workload));

        // Timetable
        TimetableEntry entry = new TimetableEntry();
        entry.setId(70L);
        entry.setFaculty(testFaculty);
        entry.setSubject(subj);
        entry.setSection(sec);

        Resource room = new Resource();
        room.setCode("LH-201");
        room.setName("Lecture Hall 201");
        entry.setResource(room);

        TimeSlot slot = new TimeSlot();
        slot.setDayOfWeek("MONDAY");
        slot.setStartTime(LocalTime.of(9, 0));
        slot.setEndTime(LocalTime.of(10, 0));
        entry.setTimeSlot(slot);

        when(timetableEntryRepository.findByFacultyId(155L))
                .thenReturn(Collections.singletonList(entry));

        // Requisitions
        AcademicResourceRequest request = new AcademicResourceRequest();
        request.setId(90L);
        request.setRequester(testUser);
        request.setPurpose("Extra GPU Compute for Deep Learning Lab");
        request.setRequestedDate(LocalDate.now().plusDays(2));
        request.setStartTime(LocalTime.of(14, 0));
        request.setEndTime(LocalTime.of(17, 0));
        request.setPriority(PriorityLevel.HIGH);
        request.setStatus(RequestStatus.PENDING);
        request.setCreatedAt(Instant.now());

        ResourceCategory cat = new ResourceCategory();
        cat.setName("Laboratory");
        request.setCategory(cat);

        when(academicResourceRequestRepository.findByRequesterUserId(55L))
                .thenReturn(Collections.singletonList(request));
        when(academicResourceRequestRepository.countByRequesterUserIdAndStatus(55L, RequestStatus.PENDING))
                .thenReturn(1L);
        when(academicResourceRequestRepository.countByRequesterUserIdAndStatus(55L, RequestStatus.APPROVED))
                .thenReturn(0L);

        // Audit log
        AuditLog log = new AuditLog();
        log.setId(300L);
        log.setAction("FACULTY_PROFILE_UPDATED");
        log.setCreatedAt(Instant.now());

        when(auditLogRepository.findByUserIdOrderByCreatedAtDesc(eq(55L), any(Pageable.class)))
                .thenReturn(Collections.singletonList(log));

        // Execute
        FacultyDashboardDto dashboard = facultyDashboardService.getDashboard(55L);

        assertNotNull(dashboard);
        assertEquals("Ada Lovelace", dashboard.getProfile().getFullName());
        assertEquals("FAC-0155", dashboard.getProfile().getEmployeeId());
        assertEquals("Computer Science", dashboard.getDepartment().getDepartmentName());

        // Metrics
        assertEquals(1, dashboard.getMetrics().getAssignedSubjectsCount());
        assertEquals(16, dashboard.getMetrics().getWeeklyInstructionHours());
        assertEquals(1, dashboard.getMetrics().getUpcomingClassesCount());
        assertEquals(1, dashboard.getMetrics().getPendingRequisitionsCount());

        // Lists
        assertEquals(1, dashboard.getAssignedSubjects().size());
        assertEquals("CS301", dashboard.getAssignedSubjects().get(0).getSubjectCode());

        assertNotNull(dashboard.getWorkloadSummary());
        assertEquals(new BigDecimal("16.00"), dashboard.getWorkloadSummary().getTotalHours());
        assertEquals("BALANCED", dashboard.getWorkloadSummary().getWorkloadStatus());

        assertEquals(1, dashboard.getTimetableSummary().size());
        assertEquals("LH-201", dashboard.getTimetableSummary().get(0).getRoomNumber());
        assertEquals("MONDAY", dashboard.getTimetableSummary().get(0).getDayOfWeek());

        assertEquals(1, dashboard.getRequisitionSummary().getPendingCount());
        assertEquals(1, dashboard.getRequisitionSummary().getRecentRequisitions().size());

        assertEquals(1, dashboard.getRecentActivities().size());
        assertEquals("Profile contact information updated successfully", dashboard.getRecentActivities().get(0).getDescription());
    }

    @Test
    @DisplayName("getDashboard handles empty state safely with zero fake numbers")
    void testGetDashboardEmptyState() {
        when(facultyRepository.findByUserId(55L)).thenReturn(Optional.of(testFaculty));
        when(facultySubjectAssignmentRepository.findByFacultyId(155L)).thenReturn(Collections.emptyList());
        when(facultyWorkloadRepository.findFirstByFacultyIdOrderByCalculatedAtDesc(155L)).thenReturn(Optional.empty());
        when(timetableEntryRepository.findByFacultyId(155L)).thenReturn(Collections.emptyList());
        when(academicResourceRequestRepository.findByRequesterUserId(55L)).thenReturn(Collections.emptyList());
        when(academicResourceRequestRepository.countByRequesterUserIdAndStatus(55L, RequestStatus.PENDING)).thenReturn(0L);
        when(academicResourceRequestRepository.countByRequesterUserIdAndStatus(55L, RequestStatus.APPROVED)).thenReturn(0L);
        when(auditLogRepository.findByUserIdOrderByCreatedAtDesc(eq(55L), any(Pageable.class))).thenReturn(Collections.emptyList());

        FacultyDashboardDto dashboard = facultyDashboardService.getDashboard(55L);

        assertNotNull(dashboard);
        assertEquals(0, dashboard.getMetrics().getAssignedSubjectsCount());
        assertEquals(0, dashboard.getMetrics().getWeeklyInstructionHours());
        assertEquals(0, dashboard.getMetrics().getUpcomingClassesCount());
        assertEquals(0, dashboard.getMetrics().getPendingRequisitionsCount());
        assertTrue(dashboard.getAssignedSubjects().isEmpty());
        assertNull(dashboard.getWorkloadSummary());
        assertTrue(dashboard.getTimetableSummary().isEmpty());
        assertEquals(0, dashboard.getRequisitionSummary().getPendingCount());
        assertTrue(dashboard.getRequisitionSummary().getRecentRequisitions().isEmpty());
        assertTrue(dashboard.getRecentActivities().isEmpty());
    }

    @Test
    @DisplayName("getDashboard throws ResourceNotFoundException when faculty record does not exist")
    void testGetDashboardNotFound() {
        when(facultyRepository.findByUserId(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> facultyDashboardService.getDashboard(999L));
    }
}
