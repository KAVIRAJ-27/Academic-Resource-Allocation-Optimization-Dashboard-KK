package com.ahrao.service;

import com.ahrao.dto.hostel.allocation.*;
import com.ahrao.entity.academic.AcademicYear;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.allocation.HostelAllocation;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.HostelBedStatus;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.entity.hostel.*;
import com.ahrao.entity.request.HostelRequest;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.repository.academic.AcademicYearRepository;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
import com.ahrao.repository.hostel.HostelRepository;
import com.ahrao.repository.request.HostelRequestRepository;
import com.ahrao.service.hostel.*;
import com.ahrao.service.warden.WardenScopeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class HostelResourceAllocationServiceTest {

    @Mock
    private HostelAllocationRepository hostelAllocationRepository;

    @Mock
    private HostelBedRepository hostelBedRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private HostelRepository hostelRepository;

    @Mock
    private HostelRequestRepository hostelRequestRepository;

    @Mock
    private AcademicYearRepository academicYearRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private WardenScopeService wardenScopeService;

    private HostelAllocationValidationService validationService;
    private HostelCandidateService candidateService;
    private HostelResourceAllocationService allocationService;

    private User adminUser;
    private User wardenUser;
    private Student activeStudent;
    private Hostel activeHostel;
    private HostelBlock activeBlock;
    private HostelFloor activeFloor;
    private HostelRoom activeRoom;
    private HostelBed availableBed1;
    private HostelBed availableBed2;
    private AcademicYear activeYear;

    @BeforeEach
    void setUp() {
        validationService = new HostelAllocationValidationServiceImpl(
                studentRepository,
                hostelRepository,
                hostelBedRepository,
                hostelAllocationRepository,
                hostelRequestRepository,
                wardenScopeService
        );

        candidateService = new HostelCandidateServiceImpl(
                hostelBedRepository,
                hostelAllocationRepository
        );

        com.ahrao.service.conflict.HostelConflictValidator hostelConflictValidator = new com.ahrao.service.conflict.HostelConflictValidator(
                studentRepository,
                hostelRepository,
                hostelBedRepository,
                hostelAllocationRepository,
                hostelRequestRepository,
                wardenScopeService
        );

        com.ahrao.service.conflict.ConflictDetectionService conflictDetectionService = new com.ahrao.service.conflict.ConflictDetectionServiceImpl(
                mock(com.ahrao.service.conflict.AcademicConflictValidator.class),
                hostelConflictValidator
        );

        allocationService = new HostelResourceAllocationServiceImpl(
                hostelAllocationRepository,
                hostelBedRepository,
                studentRepository,
                hostelRepository,
                hostelRequestRepository,
                academicYearRepository,
                auditLogRepository,
                wardenScopeService,
                validationService,
                candidateService,
                conflictDetectionService
        );


        // Role & Users
        Role adminRole = new Role("ROLE_ADMIN", "Administrator");
        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setUsername("admin");
        adminUser.setStatus(UserStatus.ACTIVE);
        adminUser.setRoles(Set.of(adminRole));

        Role wardenRole = new Role("ROLE_WARDEN", "Warden");
        wardenUser = new User();
        wardenUser.setId(2L);
        wardenUser.setUsername("warden_raj");
        wardenUser.setStatus(UserStatus.ACTIVE);
        wardenUser.setRoles(Set.of(wardenRole));

        // Student
        User studentUser = new User();
        studentUser.setId(10L);
        studentUser.setFirstName("Arun");
        studentUser.setLastName("Kumar");
        studentUser.setEmail("arun@university.edu");
        studentUser.setStatus(UserStatus.ACTIVE);

        Department dept = new Department();
        dept.setId(1L);
        dept.setName("Computer Science");

        activeStudent = new Student();
        activeStudent.setId(100L);
        activeStudent.setRollNumber("CS2026-001");
        activeStudent.setUser(studentUser);
        activeStudent.setDepartment(dept);
        activeStudent.setStatus("ACTIVE");

        // Hostel hierarchy
        Institution institution = new Institution();
        institution.setId(1L);
        institution.setName("Main Campus");

        activeHostel = new Hostel();
        activeHostel.setId(10L);
        activeHostel.setName("Nilgiri Hostel");
        activeHostel.setCode("NILGIRI");
        activeHostel.setStatus("ACTIVE");
        activeHostel.setInstitution(institution);

        activeBlock = new HostelBlock();
        activeBlock.setId(20L);
        activeBlock.setName("Block A");
        activeBlock.setHostel(activeHostel);
        activeBlock.setStatus("ACTIVE");

        activeFloor = new HostelFloor();
        activeFloor.setId(30L);
        activeFloor.setFloorNumber(1);
        activeFloor.setBlock(activeBlock);
        activeFloor.setStatus("ACTIVE");

        activeRoom = new HostelRoom();
        activeRoom.setId(40L);
        activeRoom.setRoomNumber("101");
        activeRoom.setCapacity(2);
        activeRoom.setStatus("AVAILABLE");
        activeRoom.setFloor(activeFloor);

        availableBed1 = new HostelBed();
        availableBed1.setId(101L);
        availableBed1.setBedNumber("B1");
        availableBed1.setStatus(HostelBedStatus.AVAILABLE);
        availableBed1.setRoom(activeRoom);

        availableBed2 = new HostelBed();
        availableBed2.setId(102L);
        availableBed2.setBedNumber("B2");
        availableBed2.setStatus(HostelBedStatus.AVAILABLE);
        availableBed2.setRoom(activeRoom);

        activeYear = new AcademicYear();
        activeYear.setId(1L);
        activeYear.setName("2026-2027");
        activeYear.setStatus("ACTIVE");
    }

    @Test
    void testManualAllocation_Success() {
        when(hostelRepository.findById(10L)).thenReturn(Optional.of(activeHostel));
        when(studentRepository.findById(100L)).thenReturn(Optional.of(activeStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(100L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelBedRepository.findByIdWithLock(101L)).thenReturn(Optional.of(availableBed1));
        when(hostelAllocationRepository.existsByHostelBedIdAndStatus(101L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelAllocationRepository.countByHostelBedRoomIdAndStatus(40L, AllocationStatus.ACTIVE)).thenReturn(0L);
        when(academicYearRepository.findByStatus("ACTIVE")).thenReturn(List.of(activeYear));
        when(hostelAllocationRepository.save(any(HostelAllocation.class))).thenAnswer(inv -> {
            HostelAllocation a = inv.getArgument(0);
            a.setId(500L);
            return a;
        });

        HostelAllocationRequestDto req = new HostelAllocationRequestDto(
                100L, 10L, 40L, 101L, null, LocalDate.now(), LocalDate.now().plusMonths(6), null);

        HostelAllocationResponseDto response = allocationService.allocate(req, adminUser, "127.0.0.1", "TestAgent");

        assertNotNull(response);
        assertEquals(500L, response.getId());
        assertEquals(AllocationStatus.ACTIVE, response.getStatus());
        assertEquals("MANUAL", response.getAllocationMethod());
        assertEquals(101L, response.getBedId());
        assertEquals(HostelBedStatus.OCCUPIED, availableBed1.getStatus());

        verify(hostelBedRepository).save(availableBed1);
        verify(auditLogRepository).save(any(AuditLog.class));
    }

    @Test
    void testAutoAllocation_DeterministicCandidateSelection() {
        HostelRequest hr = new HostelRequest();
        hr.setId(99L);
        hr.setStudent(activeStudent);
        hr.setHostel(activeHostel);
        hr.setStatus(RequestStatus.PENDING);

        when(hostelRepository.findById(10L)).thenReturn(Optional.of(activeHostel));
        when(hostelRequestRepository.findById(99L)).thenReturn(Optional.of(hr));
        when(studentRepository.findById(100L)).thenReturn(Optional.of(activeStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(100L, AllocationStatus.ACTIVE)).thenReturn(false);

        // Candidate service evaluates beds
        when(hostelBedRepository.findCandidateBedsByHostelId(10L, HostelBedStatus.AVAILABLE)).thenReturn(List.of(availableBed1, availableBed2));
        when(hostelAllocationRepository.existsByHostelBedIdAndStatus(101L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelAllocationRepository.countByHostelBedRoomIdAndStatus(40L, AllocationStatus.ACTIVE)).thenReturn(0L);

        // Bed locking
        when(hostelBedRepository.findByIdWithLock(101L)).thenReturn(Optional.of(availableBed1));
        when(academicYearRepository.findByStatus("ACTIVE")).thenReturn(List.of(activeYear));
        when(hostelAllocationRepository.save(any(HostelAllocation.class))).thenAnswer(inv -> {
            HostelAllocation a = inv.getArgument(0);
            a.setId(600L);
            return a;
        });

        AutoHostelAllocationRequestDto req = new AutoHostelAllocationRequestDto(99L);

        HostelAllocationResponseDto response = allocationService.autoAllocate(req, adminUser, "127.0.0.1", "TestAgent");

        assertNotNull(response);
        assertEquals(600L, response.getId());
        assertEquals("AUTO", response.getAllocationMethod());
        assertEquals(99L, response.getHostelRequestId());
        assertEquals(101L, response.getBedId());
        assertEquals(HostelBedStatus.OCCUPIED, availableBed1.getStatus());
        assertEquals(RequestStatus.APPROVED, hr.getStatus());

        verify(hostelRequestRepository).save(hr);
        verify(auditLogRepository).save(any(AuditLog.class));
    }

    @Test
    void testPreviewAllocation_DoesNotModifyDatabase() {
        HostelRequest hr = new HostelRequest();
        hr.setId(99L);
        hr.setStudent(activeStudent);
        hr.setHostel(activeHostel);

        when(hostelRequestRepository.findById(99L)).thenReturn(Optional.of(hr));
        when(studentRepository.findById(100L)).thenReturn(Optional.of(activeStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(100L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelBedRepository.findCandidateBedsByHostelId(10L, HostelBedStatus.AVAILABLE)).thenReturn(List.of(availableBed1, availableBed2));
        when(hostelAllocationRepository.existsByHostelBedIdAndStatus(anyLong(), eq(AllocationStatus.ACTIVE))).thenReturn(false);
        when(hostelAllocationRepository.countByHostelBedRoomIdAndStatus(anyLong(), eq(AllocationStatus.ACTIVE))).thenReturn(0L);

        HostelAllocationPreviewRequestDto req = new HostelAllocationPreviewRequestDto(99L);

        HostelAllocationPreviewDto preview = allocationService.previewAllocation(req, adminUser);

        assertNotNull(preview);
        assertTrue(preview.isEligible());
        assertEquals(2, preview.getCandidateCount());
        assertNotNull(preview.getRecommendedBed());
        assertEquals(101L, preview.getRecommendedBed().getBedId());

        // Zero mutations!
        verify(hostelAllocationRepository, never()).save(any());
        verify(hostelBedRepository, never()).save(any());
        verify(auditLogRepository, never()).save(any());
    }

    @Test
    void testAllocation_StudentAlreadyAllocated_ThrowsConflict() {
        when(hostelRepository.findById(10L)).thenReturn(Optional.of(activeHostel));
        when(studentRepository.findById(100L)).thenReturn(Optional.of(activeStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(100L, AllocationStatus.ACTIVE)).thenReturn(true);

        HostelAllocationRequestDto req = new HostelAllocationRequestDto(
                100L, 10L, 40L, 101L, null, LocalDate.now(), null, null);

        assertThrows(ConflictException.class, () -> allocationService.allocate(req, adminUser, "127.0.0.1", "TestAgent"));
        verify(hostelAllocationRepository, never()).save(any());
    }

    @Test
    void testAllocation_BedAlreadyAllocated_ThrowsConflict() {
        when(hostelRepository.findById(10L)).thenReturn(Optional.of(activeHostel));
        when(studentRepository.findById(100L)).thenReturn(Optional.of(activeStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(100L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelBedRepository.findByIdWithLock(101L)).thenReturn(Optional.of(availableBed1));
        when(hostelAllocationRepository.existsByHostelBedIdAndStatus(101L, AllocationStatus.ACTIVE)).thenReturn(true);

        HostelAllocationRequestDto req = new HostelAllocationRequestDto(
                100L, 10L, 40L, 101L, null, LocalDate.now(), null, null);

        assertThrows(ConflictException.class, () -> allocationService.allocate(req, adminUser, "127.0.0.1", "TestAgent"));
        verify(hostelAllocationRepository, never()).save(any());
    }

    @Test
    void testAllocation_RoomCapacityExceeded_ThrowsConflict() {
        when(hostelRepository.findById(10L)).thenReturn(Optional.of(activeHostel));
        when(studentRepository.findById(100L)).thenReturn(Optional.of(activeStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(100L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelBedRepository.findByIdWithLock(101L)).thenReturn(Optional.of(availableBed1));
        when(hostelAllocationRepository.existsByHostelBedIdAndStatus(101L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelAllocationRepository.countByHostelBedRoomIdAndStatus(40L, AllocationStatus.ACTIVE)).thenReturn(2L); // room capacity is 2

        HostelAllocationRequestDto req = new HostelAllocationRequestDto(
                100L, 10L, 40L, 101L, null, LocalDate.now(), null, null);

        assertThrows(ConflictException.class, () -> allocationService.allocate(req, adminUser, "127.0.0.1", "TestAgent"));
        verify(hostelAllocationRepository, never()).save(any());
    }

    @Test
    void testAllocation_UnauthorizedHostelScope_ThrowsForbidden() {
        when(hostelRepository.findById(10L)).thenReturn(Optional.of(activeHostel));
        when(wardenScopeService.getAuthorizedHostelIds()).thenReturn(Set.of(999L)); // Assigned to 999, not 10

        HostelAllocationRequestDto req = new HostelAllocationRequestDto(
                100L, 10L, 40L, 101L, null, LocalDate.now(), null, null);

        assertThrows(ForbiddenException.class, () -> allocationService.allocate(req, wardenUser, "127.0.0.1", "TestAgent"));
        verify(hostelAllocationRepository, never()).save(any());
    }

    @Test
    void testAllocation_InvalidHierarchy_ThrowsBadRequest() {
        when(hostelRepository.findById(10L)).thenReturn(Optional.of(activeHostel));
        when(studentRepository.findById(100L)).thenReturn(Optional.of(activeStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(100L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelBedRepository.findByIdWithLock(101L)).thenReturn(Optional.of(availableBed1));

        // Send roomId 999 while bed belongs to room 40
        HostelAllocationRequestDto req = new HostelAllocationRequestDto(
                100L, 10L, 999L, 101L, null, LocalDate.now(), null, null);

        assertThrows(BadRequestException.class, () -> allocationService.allocate(req, adminUser, "127.0.0.1", "TestAgent"));
        verify(hostelAllocationRepository, never()).save(any());
    }

    @Test
    void testReleaseAllocation_SuccessAndPreservesHistory() {
        HostelAllocation existing = new HostelAllocation();
        existing.setId(777L);
        existing.setStudent(activeStudent);
        existing.setBed(availableBed1);
        availableBed1.setStatus(HostelBedStatus.OCCUPIED);
        existing.setStatus(AllocationStatus.ACTIVE);

        when(hostelRepository.findById(10L)).thenReturn(Optional.of(activeHostel));
        when(hostelAllocationRepository.findById(777L)).thenReturn(Optional.of(existing));
        when(hostelAllocationRepository.save(existing)).thenReturn(existing);

        HostelAllocationResponseDto response = allocationService.releaseAllocation(777L, adminUser, "127.0.0.1", "TestAgent");

        assertNotNull(response);
        assertEquals(AllocationStatus.COMPLETED, existing.getStatus());
        assertNotNull(existing.getReleasedAt());
        assertEquals(HostelBedStatus.AVAILABLE, availableBed1.getStatus());

        verify(hostelAllocationRepository).save(existing);
        verify(hostelBedRepository).save(availableBed1);
        verify(auditLogRepository).save(any(AuditLog.class));
    }

    @Test
    void testReleaseAllocation_NonActive_ThrowsConflict() {
        HostelAllocation existing = new HostelAllocation();
        existing.setId(777L);
        existing.setStudent(activeStudent);
        existing.setBed(availableBed1);
        existing.setStatus(AllocationStatus.COMPLETED);

        when(hostelRepository.findById(10L)).thenReturn(Optional.of(activeHostel));
        when(hostelAllocationRepository.findById(777L)).thenReturn(Optional.of(existing));

        ConflictException ex = assertThrows(ConflictException.class, () -> allocationService.releaseAllocation(777L, adminUser, "127.0.0.1", "TestAgent"));
        assertTrue(ex.getMessage().contains("ALLOCATION_ALREADY_RELEASED"));
        verify(hostelAllocationRepository, never()).save(existing);
    }

    @Test
    void testAllocation_BedUnavailable_ThrowsConflict() {
        availableBed1.setStatus(HostelBedStatus.MAINTENANCE);

        when(hostelRepository.findById(10L)).thenReturn(Optional.of(activeHostel));
        when(studentRepository.findById(100L)).thenReturn(Optional.of(activeStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(100L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelBedRepository.findByIdWithLock(101L)).thenReturn(Optional.of(availableBed1));

        HostelAllocationRequestDto req = new HostelAllocationRequestDto(
                100L, 10L, 40L, 101L, null, LocalDate.now(), null, null);

        ConflictException ex = assertThrows(ConflictException.class, () -> allocationService.allocate(req, adminUser, "127.0.0.1", "TestAgent"));
        assertTrue(ex.getMessage().contains("BED_NOT_AVAILABLE"));
        verify(hostelAllocationRepository, never()).save(any());
    }

    @Test
    void testAllocation_HostelCapacityExceeded_ThrowsConflict() {
        activeHostel.setCapacity(50);

        when(hostelRepository.findById(10L)).thenReturn(Optional.of(activeHostel));
        when(studentRepository.findById(100L)).thenReturn(Optional.of(activeStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(100L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelBedRepository.findByIdWithLock(101L)).thenReturn(Optional.of(availableBed1));
        when(hostelAllocationRepository.existsByHostelBedIdAndStatus(101L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelAllocationRepository.countByHostelBedRoomIdAndStatus(40L, AllocationStatus.ACTIVE)).thenReturn(0L);
        when(hostelAllocationRepository.countByHostelBedRoomFloorBlockHostelIdAndStatus(10L, AllocationStatus.ACTIVE)).thenReturn(50L);

        HostelAllocationRequestDto req = new HostelAllocationRequestDto(
                100L, 10L, 40L, 101L, null, LocalDate.now(), null, null);

        ConflictException ex = assertThrows(ConflictException.class, () -> allocationService.allocate(req, adminUser, "127.0.0.1", "TestAgent"));
        assertTrue(ex.getMessage().contains("HOSTEL_CAPACITY_EXCEEDED"));
        verify(hostelAllocationRepository, never()).save(any());
    }

    @Test
    void testAutoAllocation_NoAvailableBed_ThrowsConflict() {
        HostelRequest hr = new HostelRequest();
        hr.setId(99L);
        hr.setStudent(activeStudent);
        hr.setHostel(activeHostel);
        hr.setStatus(RequestStatus.PENDING);

        when(hostelRepository.findById(10L)).thenReturn(Optional.of(activeHostel));
        when(hostelRequestRepository.findById(99L)).thenReturn(Optional.of(hr));
        when(studentRepository.findById(100L)).thenReturn(Optional.of(activeStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(100L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelBedRepository.findCandidateBedsByHostelId(10L, HostelBedStatus.AVAILABLE)).thenReturn(Collections.emptyList());

        AutoHostelAllocationRequestDto req = new AutoHostelAllocationRequestDto(99L);

        ConflictException ex = assertThrows(ConflictException.class, () -> allocationService.autoAllocate(req, adminUser, "127.0.0.1", "TestAgent"));
        assertTrue(ex.getMessage().contains("No available beds found"));
        verify(hostelAllocationRepository, never()).save(any());
    }

    @Test
    void testAllocation_InactiveHostel_ThrowsConflict() {
        activeHostel.setStatus("INACTIVE");
        when(hostelRepository.findById(10L)).thenReturn(Optional.of(activeHostel));

        HostelAllocationRequestDto req = new HostelAllocationRequestDto(
                100L, 10L, 40L, 101L, null, LocalDate.now(), null, null);

        ConflictException ex = assertThrows(ConflictException.class, () -> allocationService.allocate(req, adminUser, "127.0.0.1", "TestAgent"));
        assertTrue(ex.getMessage().contains("HOSTEL_INACTIVE"));
    }

    @Test
    void testAllocation_InactiveRoom_ThrowsConflict() {
        activeRoom.setStatus("MAINTENANCE");

        when(hostelRepository.findById(10L)).thenReturn(Optional.of(activeHostel));
        when(studentRepository.findById(100L)).thenReturn(Optional.of(activeStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(100L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelBedRepository.findByIdWithLock(101L)).thenReturn(Optional.of(availableBed1));

        HostelAllocationRequestDto req = new HostelAllocationRequestDto(
                100L, 10L, 40L, 101L, null, LocalDate.now(), null, null);

        ConflictException ex = assertThrows(ConflictException.class, () -> allocationService.allocate(req, adminUser, "127.0.0.1", "TestAgent"));
        assertTrue(ex.getMessage().contains("ROOM_INACTIVE"));
    }

    @Test
    void testAllocation_InactiveBed_ThrowsConflict() {
        availableBed1.setStatus(HostelBedStatus.INACTIVE);

        when(hostelRepository.findById(10L)).thenReturn(Optional.of(activeHostel));
        when(studentRepository.findById(100L)).thenReturn(Optional.of(activeStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(100L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelBedRepository.findByIdWithLock(101L)).thenReturn(Optional.of(availableBed1));

        HostelAllocationRequestDto req = new HostelAllocationRequestDto(
                100L, 10L, 40L, 101L, null, LocalDate.now(), null, null);

        ConflictException ex = assertThrows(ConflictException.class, () -> allocationService.allocate(req, adminUser, "127.0.0.1", "TestAgent"));
        assertTrue(ex.getMessage().contains("BED_NOT_AVAILABLE"));
    }

    @Test
    void testAllocation_InvalidStudent_ThrowsConflict() {
        activeStudent.setStatus("SUSPENDED");
        when(hostelRepository.findById(10L)).thenReturn(Optional.of(activeHostel));
        when(studentRepository.findById(100L)).thenReturn(Optional.of(activeStudent));

        HostelAllocationRequestDto req = new HostelAllocationRequestDto(
                100L, 10L, 40L, 101L, null, LocalDate.now(), null, null);

        ConflictException ex = assertThrows(ConflictException.class, () -> allocationService.allocate(req, adminUser, "127.0.0.1", "TestAgent"));
        assertTrue(ex.getMessage().contains("STUDENT_INACTIVE"));
    }

    @Test
    void testAutoAllocation_ConcurrencyRecheckFails_ThrowsConflict() {
        HostelRequest hr = new HostelRequest();
        hr.setId(99L);
        hr.setStudent(activeStudent);
        hr.setHostel(activeHostel);
        hr.setStatus(RequestStatus.PENDING);

        when(hostelRepository.findById(10L)).thenReturn(Optional.of(activeHostel));
        when(hostelRequestRepository.findById(99L)).thenReturn(Optional.of(hr));
        when(studentRepository.findById(100L)).thenReturn(Optional.of(activeStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(100L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelBedRepository.findCandidateBedsByHostelId(10L, HostelBedStatus.AVAILABLE)).thenReturn(List.of(availableBed1));

        // When locked, another transaction has already marked it OCCUPIED
        HostelBed concurrentlyOccupied = new HostelBed();
        concurrentlyOccupied.setId(101L);
        concurrentlyOccupied.setStatus(HostelBedStatus.OCCUPIED);
        concurrentlyOccupied.setRoom(activeRoom);
        when(hostelBedRepository.findByIdWithLock(101L)).thenReturn(Optional.of(concurrentlyOccupied));

        AutoHostelAllocationRequestDto req = new AutoHostelAllocationRequestDto(99L);

        ConflictException ex = assertThrows(ConflictException.class, () -> allocationService.autoAllocate(req, adminUser, "127.0.0.1", "TestAgent"));
        assertTrue(ex.getMessage().contains("BED_NOT_AVAILABLE"));
        verify(hostelAllocationRepository, never()).save(any());
    }
}
