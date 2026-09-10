package com.ahrao.service;

import com.ahrao.dto.academic.allocation.AutoAcademicAllocationRequest;
import com.ahrao.dto.academic.allocation.CreateAcademicAllocationRequest;
import com.ahrao.dto.academic.allocation.AcademicAllocationDetailDto;
import com.ahrao.entity.academic.AcademicYear;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.academic.Semester;
import com.ahrao.entity.allocation.ResourceAllocation;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.enums.ResourceStatus;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.resource.Classroom;
import com.ahrao.entity.resource.Resource;
import com.ahrao.entity.resource.ResourceCategory;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ConflictException;
import com.ahrao.repository.academic.AcademicYearRepository;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.SectionRepository;
import com.ahrao.repository.academic.SemesterRepository;
import com.ahrao.repository.academic.TimeSlotRepository;
import com.ahrao.repository.academic.TimetableEntryRepository;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.resource.ClassroomRepository;
import com.ahrao.repository.resource.LaboratoryRepository;
import com.ahrao.repository.resource.ResourceRepository;
import com.ahrao.service.academic.allocation.*;
import com.ahrao.service.hod.HodDepartmentResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AcademicAllocationServiceTest {

    @Mock
    private ResourceAllocationRepository allocationRepository;
    @Mock
    private AcademicResourceRequestRepository requestRepository;
    @Mock
    private ResourceRepository resourceRepository;
    @Mock
    private ClassroomRepository classroomRepository;
    @Mock
    private LaboratoryRepository laboratoryRepository;
    @Mock
    private AcademicYearRepository academicYearRepository;
    @Mock
    private SemesterRepository semesterRepository;
    @Mock
    private TimeSlotRepository timeSlotRepository;
    @Mock
    private AuditLogRepository auditLogRepository;
    @Mock
    private TimetableEntryRepository timetableEntryRepository;
    @Mock
    private FacultyRepository facultyRepository;
    @Mock
    private SectionRepository sectionRepository;
    @Mock
    private HodDepartmentResolver hodDepartmentResolver;

    private AcademicAllocationValidator validator;
    private AcademicResourceCandidateService candidateService;
    private AcademicAllocationService allocationService;

    private User adminUser;
    private Institution institution;
    private Department department;
    private ResourceCategory category;
    private AcademicResourceRequest academicRequest;
    private Resource resource60;
    private Resource resource100;
    private AcademicYear academicYear;
    private Semester semester;

    @BeforeEach
    public void setUp() {
        validator = new AcademicAllocationValidatorImpl(
                allocationRepository,
                timetableEntryRepository,
                facultyRepository,
                sectionRepository,
                hodDepartmentResolver
        );

        candidateService = new AcademicResourceCandidateServiceImpl(
                resourceRepository,
                classroomRepository,
                laboratoryRepository,
                validator
        );

        com.ahrao.service.conflict.AcademicConflictValidator academicConflictValidator = new com.ahrao.service.conflict.AcademicConflictValidator(
                resourceRepository,
                allocationRepository,
                timetableEntryRepository,
                requestRepository,
                timeSlotRepository,
                facultyRepository,
                sectionRepository,
                hodDepartmentResolver
        );

        com.ahrao.service.conflict.ConflictDetectionService conflictDetectionService = new com.ahrao.service.conflict.ConflictDetectionServiceImpl(
                academicConflictValidator,
                mock(com.ahrao.service.conflict.HostelConflictValidator.class)
        );

        allocationService = new AcademicAllocationServiceImpl(
                allocationRepository,
                requestRepository,
                resourceRepository,
                classroomRepository,
                laboratoryRepository,
                academicYearRepository,
                semesterRepository,
                timeSlotRepository,
                auditLogRepository,
                validator,
                candidateService,
                hodDepartmentResolver,
                conflictDetectionService
        );


        institution = new Institution();
        institution.setId(1L);
        institution.setName("Test University");

        department = new Department();
        department.setId(10L);
        department.setName("Computer Science");
        department.setInstitution(institution);

        Role adminRole = new Role();
        adminRole.setId(1L);
        adminRole.setName("ROLE_ADMIN");

        adminUser = new User();
        adminUser.setId(100L);
        adminUser.setEmail("admin@ahrao.edu");
        adminUser.setFirstName("Super");
        adminUser.setLastName("Admin");
        adminUser.setRoles(Set.of(adminRole));

        category = new ResourceCategory();
        category.setId(5L);
        category.setName("Classroom");

        academicRequest = new AcademicResourceRequest();
        academicRequest.setId(500L);
        academicRequest.setRequester(adminUser);
        academicRequest.setDepartment(department);
        academicRequest.setCategory(category);
        academicRequest.setPurpose("Database Systems Lecture");
        academicRequest.setRequestedDate(LocalDate.now().plusDays(2));
        academicRequest.setStartTime(LocalTime.of(10, 0));
        academicRequest.setEndTime(LocalTime.of(12, 0));
        academicRequest.setQuantity(45); // Requested capacity
        academicRequest.setPriority(PriorityLevel.HIGH);
        academicRequest.setStatus(RequestStatus.PENDING);

        resource60 = new Resource();
        resource60.setId(60L);
        resource60.setName("Room 101");
        resource60.setCode("CS-101");
        resource60.setCapacity(60);
        resource60.setInstitution(institution);
        resource60.setCategory(category);
        resource60.setStatus(ResourceStatus.AVAILABLE);

        resource100 = new Resource();
        resource100.setId(100L);
        resource100.setName("Auditorium B");
        resource100.setCode("AUD-B");
        resource100.setCapacity(100);
        resource100.setInstitution(institution);
        resource100.setCategory(category);
        resource100.setStatus(ResourceStatus.AVAILABLE);

        academicYear = new AcademicYear();
        academicYear.setId(2026L);
        academicYear.setName("2026-2027");

        semester = new Semester();
        semester.setId(1L);
        semester.setName("Semester 1");
        semester.setStatus("ACTIVE");
    }

    @Test
    public void testManualAllocation_Success() {
        when(requestRepository.findById(500L)).thenReturn(Optional.of(academicRequest));
        when(resourceRepository.findByIdWithLock(60L)).thenReturn(Optional.of(resource60));
        when(allocationRepository.existsActiveByRequestId(eq(500L), any())).thenReturn(false);
        when(allocationRepository.existsOverlappingAllocation(eq(60L), any(), any(), any())).thenReturn(false);
        when(timetableEntryRepository.existsOverlappingTimetableEntry(eq(60L), anyString(), any(), any())).thenReturn(false);
        when(academicYearRepository.findByInstitutionIdAndStatus(1L, "ACTIVE")).thenReturn(Optional.of(academicYear));
        when(semesterRepository.findByAcademicYearId(2026L)).thenReturn(List.of(semester));
        when(allocationRepository.save(any(ResourceAllocation.class))).thenAnswer(invocation -> {
            ResourceAllocation ra = invocation.getArgument(0);
            ra.setId(888L);
            return ra;
        });

        CreateAcademicAllocationRequest req = new CreateAcademicAllocationRequest(500L, 60L);
        AcademicAllocationDetailDto result = allocationService.allocateResource(req, adminUser);

        assertNotNull(result);
        assertEquals(888L, result.getId());
        assertEquals(60L, result.getResourceId());
        assertEquals(500L, result.getRequestId());
        assertEquals(AllocationStatus.ACTIVE, result.getStatus());
        assertEquals(RequestStatus.APPROVED, academicRequest.getStatus());

        verify(allocationRepository).save(any(ResourceAllocation.class));
        verify(requestRepository).save(academicRequest);
        verify(auditLogRepository).save(any(AuditLog.class));
    }

    @Test
    public void testAutoAllocation_DeterministicSelection() {
        when(requestRepository.findById(500L)).thenReturn(Optional.of(academicRequest));
        when(resourceRepository.findCandidatesForAllocation(1L, 5L, 10L)).thenReturn(List.of(resource100, resource60));
        when(resourceRepository.findByIdWithLock(60L)).thenReturn(Optional.of(resource60));
        when(allocationRepository.existsActiveByRequestId(eq(500L), any())).thenReturn(false);
        when(allocationRepository.existsOverlappingAllocation(anyLong(), any(), any(), any())).thenReturn(false);
        when(timetableEntryRepository.existsOverlappingTimetableEntry(anyLong(), anyString(), any(), any())).thenReturn(false);
        when(academicYearRepository.findByInstitutionIdAndStatus(1L, "ACTIVE")).thenReturn(Optional.of(academicYear));
        when(semesterRepository.findByAcademicYearId(2026L)).thenReturn(List.of(semester));
        when(allocationRepository.save(any(ResourceAllocation.class))).thenAnswer(invocation -> {
            ResourceAllocation ra = invocation.getArgument(0);
            ra.setId(999L);
            return ra;
        });

        AutoAcademicAllocationRequest req = new AutoAcademicAllocationRequest(500L);
        AcademicAllocationDetailDto result = allocationService.autoAllocateResource(req, adminUser);

        assertNotNull(result);
        // Deterministic rule: requestedCapacity=45 -> resource60 has wastedCapacity=15, resource100 has wastedCapacity=55
        // Best fit is resource60!
        assertEquals(60L, result.getResourceId());
        assertEquals(999L, result.getId());
    }

    @Test
    public void testAllocation_InsufficientCapacity_ThrowsConflict() {
        academicRequest.setQuantity(80); // Needs 80 seats
        when(requestRepository.findById(500L)).thenReturn(Optional.of(academicRequest));
        when(resourceRepository.findByIdWithLock(60L)).thenReturn(Optional.of(resource60)); // Only has 60

        CreateAcademicAllocationRequest req = new CreateAcademicAllocationRequest(500L, 60L);
        ConflictException exception = assertThrows(ConflictException.class, () ->
                allocationService.allocateResource(req, adminUser));

        assertTrue(exception.getMessage().contains("insufficient for requested capacity"));
    }

    @Test
    public void testAllocation_ResourceMaintenance_ThrowsConflict() {
        resource60.setStatus(ResourceStatus.MAINTENANCE);
        when(requestRepository.findById(500L)).thenReturn(Optional.of(academicRequest));
        when(resourceRepository.findByIdWithLock(60L)).thenReturn(Optional.of(resource60));

        CreateAcademicAllocationRequest req = new CreateAcademicAllocationRequest(500L, 60L);
        ConflictException exception = assertThrows(ConflictException.class, () ->
                allocationService.allocateResource(req, adminUser));

        assertTrue(exception.getMessage().contains("MAINTENANCE"));
    }

    @Test
    public void testAllocation_TimeConflict_ThrowsConflict() {
        when(requestRepository.findById(500L)).thenReturn(Optional.of(academicRequest));
        when(resourceRepository.findByIdWithLock(60L)).thenReturn(Optional.of(resource60));
        when(allocationRepository.existsOverlappingAllocation(eq(60L), any(), any(), any())).thenReturn(true);

        CreateAcademicAllocationRequest req = new CreateAcademicAllocationRequest(500L, 60L);
        ConflictException exception = assertThrows(ConflictException.class, () ->
                allocationService.allocateResource(req, adminUser));

        assertTrue(exception.getMessage().contains("already allocated"));
    }

    @Test
    public void testAllocation_TimetableConflict_ThrowsConflict() {
        when(requestRepository.findById(500L)).thenReturn(Optional.of(academicRequest));
        when(resourceRepository.findByIdWithLock(60L)).thenReturn(Optional.of(resource60));
        when(allocationRepository.existsOverlappingAllocation(eq(60L), any(), any(), any())).thenReturn(false);
        when(timetableEntryRepository.existsOverlappingTimetableEntry(eq(60L), anyString(), any(), any())).thenReturn(true);

        CreateAcademicAllocationRequest req = new CreateAcademicAllocationRequest(500L, 60L);
        ConflictException exception = assertThrows(ConflictException.class, () ->
                allocationService.allocateResource(req, adminUser));

        assertTrue(exception.getMessage().contains("recurring academic class"));
    }

    @Test
    public void testAllocation_AlreadyAllocated_ThrowsConflict() {
        when(requestRepository.findById(500L)).thenReturn(Optional.of(academicRequest));
        when(allocationRepository.existsActiveByRequestId(eq(500L), any())).thenReturn(true);

        CreateAcademicAllocationRequest req = new CreateAcademicAllocationRequest(500L, 60L);
        ConflictException exception = assertThrows(ConflictException.class, () ->
                allocationService.allocateResource(req, adminUser));

        assertTrue(exception.getMessage().contains("already been allocated"));
    }

    @Test
    public void testAllocation_CancelledRequest_ThrowsConflict() {
        academicRequest.setStatus(RequestStatus.CANCELLED);
        when(requestRepository.findById(500L)).thenReturn(Optional.of(academicRequest));

        CreateAcademicAllocationRequest req = new CreateAcademicAllocationRequest(500L, 60L);
        ConflictException exception = assertThrows(ConflictException.class, () ->
                allocationService.allocateResource(req, adminUser));

        assertTrue(exception.getMessage().contains("Cannot allocate cancelled request"));
    }

    @Test
    public void testCancelAllocation_Success() {
        ResourceAllocation allocation = new ResourceAllocation();
        allocation.setId(777L);
        allocation.setResource(resource60);
        allocation.setRequest(academicRequest);
        allocation.setStatus(AllocationStatus.ACTIVE);

        when(allocationRepository.findById(777L)).thenReturn(Optional.of(allocation));
        when(allocationRepository.save(any(ResourceAllocation.class))).thenReturn(allocation);

        AcademicAllocationDetailDto result = allocationService.cancelAllocation(777L, "Instructor unavailable", adminUser);

        assertNotNull(result);
        assertEquals(AllocationStatus.CANCELLED, allocation.getStatus());
        verify(allocationRepository).save(allocation);
        verify(auditLogRepository).save(any(AuditLog.class));
    }

    @Test
    public void testCancelAllocation_AlreadyCancelled_ThrowsConflict() {
        ResourceAllocation allocation = new ResourceAllocation();
        allocation.setId(777L);
        allocation.setStatus(AllocationStatus.CANCELLED);

        when(allocationRepository.findById(777L)).thenReturn(Optional.of(allocation));

        ConflictException exception = assertThrows(ConflictException.class, () ->
                allocationService.cancelAllocation(777L, "Re-cancel", adminUser));

        assertTrue(exception.getMessage().contains("already cancelled"));
    }
}
