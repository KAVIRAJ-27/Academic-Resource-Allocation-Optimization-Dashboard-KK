package com.ahrao.service.conflict;

import com.ahrao.dto.conflict.ConflictCheckRequestDto;
import com.ahrao.dto.conflict.ConflictItemDto;
import com.ahrao.dto.conflict.ConflictResultDto;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Faculty;
import com.ahrao.entity.academic.Section;
import com.ahrao.entity.academic.TimeSlot;
import com.ahrao.entity.academic.TimetableEntry;
import com.ahrao.entity.allocation.ResourceAllocation;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.ConflictCode;
import com.ahrao.entity.enums.ConflictSeverity;
import com.ahrao.entity.enums.ResourceStatus;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.resource.Resource;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.SectionRepository;
import com.ahrao.repository.academic.TimeSlotRepository;
import com.ahrao.repository.academic.TimetableEntryRepository;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.resource.ResourceRepository;
import com.ahrao.service.hod.HodDepartmentResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class AcademicConflictDetectionTest {

    @Mock
    private ResourceRepository resourceRepository;
    @Mock
    private ResourceAllocationRepository allocationRepository;
    @Mock
    private TimetableEntryRepository timetableEntryRepository;
    @Mock
    private AcademicResourceRequestRepository requestRepository;
    @Mock
    private TimeSlotRepository timeSlotRepository;
    @Mock
    private FacultyRepository facultyRepository;
    @Mock
    private SectionRepository sectionRepository;
    @Mock
    private HodDepartmentResolver hodDepartmentResolver;

    private AcademicConflictValidator academicValidator;
    private ConflictDetectionService conflictDetectionService;

    private Resource testResource;
    private AcademicResourceRequest testRequest;
    private Department testDept;
    private User testUser;

    @BeforeEach
    void setUp() {
        academicValidator = new AcademicConflictValidator(
                resourceRepository,
                allocationRepository,
                timetableEntryRepository,
                requestRepository,
                timeSlotRepository,
                facultyRepository,
                sectionRepository,
                hodDepartmentResolver
        );

        HostelConflictValidator mockHostelValidator = mock(HostelConflictValidator.class);
        conflictDetectionService = new ConflictDetectionServiceImpl(academicValidator, mockHostelValidator);

        testDept = new Department();
        testDept.setId(10L);
        testDept.setName("Computer Science");

        testUser = new User();
        testUser.setId(100L);
        testUser.setUsername("faculty_alice");
        Role facultyRole = new Role("ROLE_FACULTY", "Faculty");
        testUser.setRoles(Set.of(facultyRole));

        testResource = new Resource();
        testResource.setId(201L);
        testResource.setName("CS-Lab-1");
        testResource.setCapacity(50);
        testResource.setStatus(ResourceStatus.AVAILABLE);
        testResource.setDepartment(testDept);

        testRequest = new AcademicResourceRequest();
        testRequest.setId(501L);
        testRequest.setStatus(RequestStatus.PENDING);
        testRequest.setRequestedDate(LocalDate.now().plusDays(2));
        testRequest.setStartTime(LocalTime.of(10, 0));
        testRequest.setEndTime(LocalTime.of(11, 0));
        testRequest.setQuantity(40);
        testRequest.setDepartment(testDept);
        testRequest.setRequester(testUser);

        when(requestRepository.findById(501L)).thenReturn(Optional.of(testRequest));
        when(allocationRepository.existsActiveByRequestId(any(), any())).thenReturn(false);
    }

    @Test
    @DisplayName("1. No academic conflict: safe resource allocation allowed")
    void testNoAcademicConflict() {
        when(resourceRepository.findById(201L)).thenReturn(Optional.of(testResource));
        when(allocationRepository.existsOverlappingAllocation(eq(201L), any(), any(), any()))
                .thenReturn(false);
        when(timetableEntryRepository.existsOverlappingTimetableEntry(eq(201L), any(), any(), any()))
                .thenReturn(false);

        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .resourceId(201L)
                .academicRequestId(501L)
                .allocationDate(testRequest.getRequestedDate())
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 0))
                .requiredCapacity(40)
                .targetResource(testResource)
                .build();

        ConflictResultDto result = conflictDetectionService.detectAcademicConflicts(request);

        assertNotNull(result);
        assertTrue(result.isValid());
        assertTrue(result.getConflicts().isEmpty());
    }

    @Test
    @DisplayName("2. Resource double booking: overlapping allocation returns RESOURCE_DOUBLE_BOOKED")
    void testResourceDoubleBooking() {
        when(resourceRepository.findById(201L)).thenReturn(Optional.of(testResource));
        when(allocationRepository.existsOverlappingAllocation(eq(201L), any(), any(), any()))
                .thenReturn(true);
        when(timetableEntryRepository.existsOverlappingTimetableEntry(eq(201L), any(), any(), any()))
                .thenReturn(false);

        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .resourceId(201L)
                .academicRequestId(501L)
                .allocationDate(testRequest.getRequestedDate())
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 0))
                .requiredCapacity(40)
                .targetResource(testResource)
                .build();

        ConflictResultDto result = conflictDetectionService.detectAcademicConflicts(request);

        assertNotNull(result);
        assertFalse(result.isValid());
        assertEquals(1, result.getConflicts().size());
        assertEquals(ConflictCode.RESOURCE_DOUBLE_BOOKED.name(), result.getConflicts().get(0).getConflictType());
        assertEquals(ConflictSeverity.ERROR, result.getConflicts().get(0).getSeverity());
    }

    @Test
    @DisplayName("3. Faculty overlap: faculty busy with timetable class returns FACULTY_TIME_CONFLICT")
    void testFacultyOverlap() {
        Faculty faculty = new Faculty();
        faculty.setId(10L);
        faculty.setUser(testUser);

        TimetableEntry clashingEntry = new TimetableEntry();
        clashingEntry.setId(777L);
        TimeSlot ts = new TimeSlot();
        ts.setDayOfWeek("MONDAY");
        ts.setStartTime(LocalTime.of(10, 0));
        ts.setEndTime(LocalTime.of(11, 0));
        clashingEntry.setTimeSlot(ts);

        when(resourceRepository.findById(201L)).thenReturn(Optional.of(testResource));
        when(allocationRepository.existsOverlappingAllocation(eq(201L), any(), any(), any()))
                .thenReturn(false);
        when(timetableEntryRepository.existsOverlappingTimetableEntry(eq(201L), any(), any(), any()))
                .thenReturn(false);
        when(facultyRepository.findById(10L)).thenReturn(Optional.of(faculty));
        when(facultyRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(faculty));
        when(timetableEntryRepository.existsOverlappingFacultyTimetable(eq(10L), any(), any(), any()))
                .thenReturn(true);

        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .resourceId(201L)
                .academicRequestId(501L)
                .allocationDate(testRequest.getRequestedDate())
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 0))
                .facultyId(10L)
                .targetResource(testResource)
                .build();

        ConflictResultDto result = conflictDetectionService.detectAcademicConflicts(request);

        assertNotNull(result);
        assertFalse(result.isValid());
        boolean hasFacultyConflict = result.getConflicts().stream()
                .anyMatch(c -> c.getConflictType().equals(ConflictCode.FACULTY_TIME_CONFLICT.name()));
        assertTrue(hasFacultyConflict);
    }

    @Test
    @DisplayName("4. Section overlap: section already scheduled returns SECTION_TIME_CONFLICT")
    void testSectionOverlap() {
        when(resourceRepository.findById(201L)).thenReturn(Optional.of(testResource));
        when(allocationRepository.existsOverlappingAllocation(eq(201L), any(), any(), any()))
                .thenReturn(false);
        when(timetableEntryRepository.existsOverlappingTimetableEntry(eq(201L), any(), any(), any()))
                .thenReturn(false);
        when(timetableEntryRepository.existsOverlappingSectionTimetable(eq(55L), any(), any(), any()))
                .thenReturn(true);

        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .resourceId(201L)
                .academicRequestId(501L)
                .sectionId(55L)
                .allocationDate(testRequest.getRequestedDate())
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 0))
                .targetResource(testResource)
                .build();

        ConflictResultDto result = conflictDetectionService.detectAcademicConflicts(request);

        assertNotNull(result);
        assertFalse(result.isValid());
        boolean hasSectionConflict = result.getConflicts().stream()
                .anyMatch(c -> c.getConflictType().equals(ConflictCode.SECTION_TIME_CONFLICT.name()));
        assertTrue(hasSectionConflict);
    }

    @Test
    @DisplayName("5. Capacity exceeded: requested seats exceed resource capacity")
    void testCapacityExceeded() {
        when(resourceRepository.findById(201L)).thenReturn(Optional.of(testResource));

        // Capacity is 50, but requesting 60
        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .resourceId(201L)
                .academicRequestId(501L)
                .allocationDate(testRequest.getRequestedDate())
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 0))
                .requiredCapacity(60)
                .targetResource(testResource)
                .build();

        ConflictResultDto result = conflictDetectionService.detectAcademicConflicts(request);

        assertNotNull(result);
        assertFalse(result.isValid());
        boolean hasCapacityConflict = result.getConflicts().stream()
                .anyMatch(c -> c.getConflictType().equals(ConflictCode.CAPACITY_EXCEEDED.name()));
        assertTrue(hasCapacityConflict);
    }

    @Test
    @DisplayName("6. Resource unavailable: MAINTENANCE status returns RESOURCE_UNAVAILABLE")
    void testResourceUnavailable_Maintenance() {
        testResource.setStatus(ResourceStatus.MAINTENANCE);
        when(resourceRepository.findById(201L)).thenReturn(Optional.of(testResource));

        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .resourceId(201L)
                .targetResource(testResource)
                .build();

        ConflictResultDto result = conflictDetectionService.detectAcademicConflicts(request);

        assertNotNull(result);
        assertFalse(result.isValid());
        boolean hasUnavailableConflict = result.getConflicts().stream()
                .anyMatch(c -> c.getConflictType().equals(ConflictCode.RESOURCE_UNAVAILABLE.name()));
        assertTrue(hasUnavailableConflict);
    }

    @Test
    @DisplayName("7. Resource unavailable: INACTIVE status returns RESOURCE_UNAVAILABLE")
    void testResourceUnavailable_Inactive() {
        testResource.setStatus(ResourceStatus.INACTIVE);
        when(resourceRepository.findById(201L)).thenReturn(Optional.of(testResource));

        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .resourceId(201L)
                .targetResource(testResource)
                .build();

        ConflictResultDto result = conflictDetectionService.detectAcademicConflicts(request);

        assertNotNull(result);
        assertFalse(result.isValid());
        boolean hasUnavailableConflict = result.getConflicts().stream()
                .anyMatch(c -> c.getConflictType().equals(ConflictCode.RESOURCE_UNAVAILABLE.name()));
        assertTrue(hasUnavailableConflict);
    }

    @Test
    @DisplayName("8. Invalid resource: Non-existent resource ID returns INVALID_RESOURCE")
    void testInvalidResource_NotFound() {
        when(resourceRepository.findById(999L)).thenReturn(Optional.empty());

        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .resourceId(999L)
                .build();

        ConflictResultDto result = conflictDetectionService.detectAcademicConflicts(request);

        assertNotNull(result);
        assertFalse(result.isValid());
        assertEquals(ConflictCode.INVALID_RESOURCE.name(), result.getConflicts().get(0).getConflictType());
    }

    @Test
    @DisplayName("9. Invalid time slot: end time before or equal to start time")
    void testInvalidTimeSlot() {
        when(resourceRepository.findById(201L)).thenReturn(Optional.of(testResource));

        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .resourceId(201L)
                .startTime(LocalTime.of(12, 0))
                .endTime(LocalTime.of(11, 0))
                .targetResource(testResource)
                .build();

        ConflictResultDto result = conflictDetectionService.detectAcademicConflicts(request);

        assertNotNull(result);
        assertFalse(result.isValid());
        boolean hasInvalidTimeSlot = result.getConflicts().stream()
                .anyMatch(c -> c.getConflictType().equals(ConflictCode.INVALID_TIME_SLOT.name()));
        assertTrue(hasInvalidTimeSlot);
    }

    @Test
    @DisplayName("10. Scope violation: requester department does not match resource department")
    void testScopeViolation() {
        when(resourceRepository.findById(201L)).thenReturn(Optional.of(testResource));

        // Requester belongs to Department 99, but resource belongs to Department 10
        Department otherDept = new Department();
        otherDept.setId(99L);
        otherDept.setName("Mechanical Engineering");

        User hodUser = new User();
        hodUser.setId(300L);
        hodUser.setUsername("hod_mech");
        hodUser.setRoles(Set.of(new Role("ROLE_HOD", "Head of Department")));

        AcademicResourceRequest otherDeptRequest = new AcademicResourceRequest();
        otherDeptRequest.setId(602L);
        otherDeptRequest.setDepartment(otherDept);
        otherDeptRequest.setRequester(hodUser);

        when(requestRepository.findById(602L)).thenReturn(Optional.of(otherDeptRequest));

        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .resourceId(201L)
                .academicRequestId(602L)
                .allocationDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0))
                .targetResource(testResource)
                .build();

        ConflictResultDto result = conflictDetectionService.detectAcademicConflicts(request, hodUser);

        assertNotNull(result);
        assertFalse(result.isValid());
        boolean hasScopeViolation = result.getConflicts().stream()
                .anyMatch(c -> c.getConflictType().equals(ConflictCode.RESOURCE_SCOPE_VIOLATION.name()));
        assertTrue(hasScopeViolation);
    }

    @Test
    @DisplayName("11. Overlapping dates/times: collision detected via existsOverlappingAllocation")
    void testOverlappingDatesAndTimes() {
        when(resourceRepository.findById(201L)).thenReturn(Optional.of(testResource));
        when(allocationRepository.existsOverlappingAllocation(eq(201L), any(), any(), any()))
                .thenReturn(true);
        when(timetableEntryRepository.existsOverlappingTimetableEntry(eq(201L), any(), any(), any()))
                .thenReturn(false);

        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .resourceId(201L)
                .allocationDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(14, 30))
                .endTime(LocalTime.of(16, 0))
                .targetResource(testResource)
                .build();

        ConflictResultDto result = conflictDetectionService.detectAcademicConflicts(request);

        assertNotNull(result);
        assertFalse(result.isValid());
        assertEquals(ConflictCode.RESOURCE_DOUBLE_BOOKED.name(), result.getConflicts().get(0).getConflictType());
    }

    @Test
    @DisplayName("12. Non-overlapping adjacent time slots: exactly consecutive slots are permitted")
    void testNonOverlappingAdjacentTimeSlots() {
        when(resourceRepository.findById(201L)).thenReturn(Optional.of(testResource));
        when(allocationRepository.existsOverlappingAllocation(eq(201L), any(), any(), any()))
                .thenReturn(false);
        when(timetableEntryRepository.existsOverlappingTimetableEntry(eq(201L), any(), any(), any()))
                .thenReturn(false);

        // 10:00 - 11:00 when an existing allocation is 11:00 - 12:00
        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .resourceId(201L)
                .allocationDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 0))
                .targetResource(testResource)
                .build();

        ConflictResultDto result = conflictDetectionService.detectAcademicConflicts(request);

        assertNotNull(result);
        assertTrue(result.isValid());
        assertTrue(result.getConflicts().isEmpty());
    }
}
