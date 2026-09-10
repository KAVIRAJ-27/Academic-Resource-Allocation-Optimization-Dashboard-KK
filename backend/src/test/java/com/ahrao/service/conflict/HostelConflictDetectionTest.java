package com.ahrao.service.conflict;

import com.ahrao.dto.conflict.ConflictCheckRequestDto;
import com.ahrao.dto.conflict.ConflictItemDto;
import com.ahrao.dto.conflict.ConflictResultDto;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.allocation.HostelAllocation;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.ConflictCode;
import com.ahrao.entity.enums.ConflictSeverity;
import com.ahrao.entity.enums.HostelBedStatus;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.hostel.*;
import com.ahrao.entity.request.HostelRequest;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.hostel.*;
import com.ahrao.repository.request.HostelRequestRepository;
import com.ahrao.service.warden.WardenScopeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class HostelConflictDetectionTest {

    @Mock
    private HostelBedRepository bedRepository;
    @Mock
    private HostelRepository hostelRepository;
    @Mock
    private HostelAllocationRepository hostelAllocationRepository;
    @Mock
    private HostelRequestRepository hostelRequestRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private WardenScopeService wardenScopeService;

    private HostelConflictValidator hostelValidator;
    private ConflictDetectionService conflictDetectionService;

    private Hostel testHostel;
    private HostelBlock testBlock;
    private HostelFloor testFloor;
    private HostelRoom testRoom;
    private HostelBed testBed;
    private Student testStudent;
    private HostelRequest testRequest;
    private User testWarden;

    @BeforeEach
    void setUp() {
        hostelValidator = new HostelConflictValidator(
                studentRepository,
                hostelRepository,
                bedRepository,
                hostelAllocationRepository,
                hostelRequestRepository,
                wardenScopeService
        );

        AcademicConflictValidator mockAcademicValidator = mock(AcademicConflictValidator.class);
        conflictDetectionService = new ConflictDetectionServiceImpl(mockAcademicValidator, hostelValidator);

        testHostel = new Hostel();
        testHostel.setId(1L);
        testHostel.setName("Nilgiri Hostel");
        testHostel.setStatus("ACTIVE");
        testHostel.setCapacity(100);

        testBlock = new HostelBlock();
        testBlock.setId(10L);
        testBlock.setName("A Block");
        testBlock.setHostel(testHostel);
        testBlock.setStatus("ACTIVE");

        testFloor = new HostelFloor();
        testFloor.setId(100L);
        testFloor.setFloorNumber(1);
        testFloor.setBlock(testBlock);

        testRoom = new HostelRoom();
        testRoom.setId(500L);
        testRoom.setRoomNumber("101");
        testRoom.setCapacity(2);
        testRoom.setFloor(testFloor);
        testRoom.setStatus("AVAILABLE");

        testBed = new HostelBed();
        testBed.setId(1001L);
        testBed.setBedNumber("101-A");
        testBed.setStatus(HostelBedStatus.AVAILABLE);
        testBed.setRoom(testRoom);

        testStudent = new Student();
        testStudent.setId(50L);

        testRequest = new HostelRequest();
        testRequest.setId(700L);
        testRequest.setStudent(testStudent);
        testRequest.setStatus(RequestStatus.APPROVED);

        testWarden = new User();
        testWarden.setId(900L);
        testWarden.setUsername("warden_raj");
        testWarden.setRoles(Set.of(new Role("ROLE_WARDEN", "Warden")));
    }

    @Test
    @DisplayName("1. No hostel conflict: candidate bed safely passed")
    void testNoHostelConflict() {
        when(bedRepository.findById(1001L)).thenReturn(Optional.of(testBed));
        when(studentRepository.findById(50L)).thenReturn(Optional.of(testStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(50L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelAllocationRepository.existsByHostelBedIdAndStatus(1001L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelAllocationRepository.countByHostelBedRoomIdAndStatus(500L, AllocationStatus.ACTIVE)).thenReturn(0L);
        when(hostelAllocationRepository.countByHostelBedRoomFloorBlockHostelIdAndStatus(1L, AllocationStatus.ACTIVE)).thenReturn(10L);

        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .studentId(50L)
                .bedId(1001L)
                .roomId(500L)
                .hostelId(1L)
                .hostelRequestId(700L)
                .targetBed(testBed)
                .build();

        when(hostelRequestRepository.findById(700L)).thenReturn(Optional.of(testRequest));

        ConflictResultDto result = conflictDetectionService.detectHostelConflicts(request);

        assertNotNull(result);
        assertTrue(result.isValid());
        assertTrue(result.getConflicts().isEmpty());
    }

    @Test
    @DisplayName("2. Student already allocated: student has active allocation returns STUDENT_ALREADY_ALLOCATED")
    void testStudentAlreadyAllocated() {
        when(bedRepository.findById(1001L)).thenReturn(Optional.of(testBed));
        when(studentRepository.findById(50L)).thenReturn(Optional.of(testStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(50L, AllocationStatus.ACTIVE))
                .thenReturn(true);

        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .studentId(50L)
                .bedId(1001L)
                .roomId(500L)
                .hostelId(1L)
                .targetBed(testBed)
                .build();

        ConflictResultDto result = conflictDetectionService.detectHostelConflicts(request);

        assertNotNull(result);
        assertFalse(result.isValid());
        boolean hasStudentAllocated = result.getConflicts().stream()
                .anyMatch(c -> c.getConflictType().equals(ConflictCode.STUDENT_ALREADY_ALLOCATED.name()));
        assertTrue(hasStudentAllocated);
    }

    @Test
    @DisplayName("3. Bed already allocated: active allocation on bed returns BED_ALREADY_ALLOCATED")
    void testBedAlreadyAllocated() {
        when(bedRepository.findById(1001L)).thenReturn(Optional.of(testBed));
        when(studentRepository.findById(50L)).thenReturn(Optional.of(testStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(50L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelAllocationRepository.existsByHostelBedIdAndStatus(1001L, AllocationStatus.ACTIVE))
                .thenReturn(true);

        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .studentId(50L)
                .bedId(1001L)
                .roomId(500L)
                .hostelId(1L)
                .targetBed(testBed)
                .build();

        ConflictResultDto result = conflictDetectionService.detectHostelConflicts(request);

        assertNotNull(result);
        assertFalse(result.isValid());
        boolean hasBedAllocated = result.getConflicts().stream()
                .anyMatch(c -> c.getConflictType().equals(ConflictCode.BED_ALREADY_ALLOCATED.name()));
        assertTrue(hasBedAllocated);
    }

    @Test
    @DisplayName("4. Bed unavailable: MAINTENANCE bed returns BED_UNAVAILABLE")
    void testBedUnavailable() {
        testBed.setStatus(HostelBedStatus.MAINTENANCE);
        when(bedRepository.findById(1001L)).thenReturn(Optional.of(testBed));

        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .bedId(1001L)
                .targetBed(testBed)
                .build();

        ConflictResultDto result = conflictDetectionService.detectHostelConflicts(request);

        assertNotNull(result);
        assertFalse(result.isValid());
        boolean hasBedUnavailable = result.getConflicts().stream()
                .anyMatch(c -> c.getConflictType().equals(ConflictCode.BED_UNAVAILABLE.name()));
        assertTrue(hasBedUnavailable);
    }

    @Test
    @DisplayName("5. Room capacity exceeded: active room allocations reach room capacity")
    void testRoomCapacityExceeded() {
        when(bedRepository.findById(1001L)).thenReturn(Optional.of(testBed));
        when(studentRepository.findById(50L)).thenReturn(Optional.of(testStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(50L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelAllocationRepository.existsByHostelBedIdAndStatus(1001L, AllocationStatus.ACTIVE)).thenReturn(false);
        // Capacity is 2, active allocations = 2
        when(hostelAllocationRepository.countByHostelBedRoomIdAndStatus(500L, AllocationStatus.ACTIVE)).thenReturn(2L);

        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .studentId(50L)
                .bedId(1001L)
                .roomId(500L)
                .hostelId(1L)
                .targetBed(testBed)
                .build();

        ConflictResultDto result = conflictDetectionService.detectHostelConflicts(request);

        assertNotNull(result);
        assertFalse(result.isValid());
        boolean hasRoomCapacity = result.getConflicts().stream()
                .anyMatch(c -> c.getConflictType().equals(ConflictCode.ROOM_CAPACITY_EXCEEDED.name()));
        assertTrue(hasRoomCapacity);
    }

    @Test
    @DisplayName("6. Hostel capacity exceeded: active hostel occupancy reaches total capacity")
    void testHostelCapacityExceeded() {
        when(bedRepository.findById(1001L)).thenReturn(Optional.of(testBed));
        when(studentRepository.findById(50L)).thenReturn(Optional.of(testStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(50L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelAllocationRepository.existsByHostelBedIdAndStatus(1001L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelAllocationRepository.countByHostelBedRoomIdAndStatus(500L, AllocationStatus.ACTIVE)).thenReturn(1L);
        // Hostel capacity is 100, active allocations = 100
        when(hostelAllocationRepository.countByHostelBedRoomFloorBlockHostelIdAndStatus(1L, AllocationStatus.ACTIVE)).thenReturn(100L);

        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .studentId(50L)
                .bedId(1001L)
                .roomId(500L)
                .hostelId(1L)
                .targetBed(testBed)
                .build();

        ConflictResultDto result = conflictDetectionService.detectHostelConflicts(request);

        assertNotNull(result);
        assertFalse(result.isValid());
        boolean hasHostelCapacity = result.getConflicts().stream()
                .anyMatch(c -> c.getConflictType().equals(ConflictCode.HOSTEL_CAPACITY_EXCEEDED.name()));
        assertTrue(hasHostelCapacity);
    }

    @Test
    @DisplayName("7. Inactive hostel: hostel marked inactive returns HOSTEL_INACTIVE")
    void testInactiveHostel() {
        testHostel.setStatus("INACTIVE");
        when(bedRepository.findById(1001L)).thenReturn(Optional.of(testBed));

        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .bedId(1001L)
                .targetBed(testBed)
                .build();

        ConflictResultDto result = conflictDetectionService.detectHostelConflicts(request);

        assertNotNull(result);
        assertFalse(result.isValid());
        boolean hasHostelInactive = result.getConflicts().stream()
                .anyMatch(c -> c.getConflictType().equals(ConflictCode.HOSTEL_INACTIVE.name()));
        assertTrue(hasHostelInactive);
    }

    @Test
    @DisplayName("8. Inactive room: room marked inactive returns ROOM_INACTIVE")
    void testInactiveRoom() {
        testRoom.setStatus("INACTIVE");
        when(bedRepository.findById(1001L)).thenReturn(Optional.of(testBed));

        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .bedId(1001L)
                .targetBed(testBed)
                .build();

        ConflictResultDto result = conflictDetectionService.detectHostelConflicts(request);

        assertNotNull(result);
        assertFalse(result.isValid());
        boolean hasRoomInactive = result.getConflicts().stream()
                .anyMatch(c -> c.getConflictType().equals(ConflictCode.ROOM_INACTIVE.name()));
        assertTrue(hasRoomInactive);
    }

    @Test
    @DisplayName("9. Inactive bed: bed marked inactive returns BED_INACTIVE")
    void testInactiveBed() {
        testBed.setStatus(HostelBedStatus.INACTIVE);
        when(bedRepository.findById(1001L)).thenReturn(Optional.of(testBed));

        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .bedId(1001L)
                .targetBed(testBed)
                .build();

        ConflictResultDto result = conflictDetectionService.detectHostelConflicts(request);

        assertNotNull(result);
        assertFalse(result.isValid());
        boolean hasBedInactive = result.getConflicts().stream()
                .anyMatch(c -> c.getConflictType().equals(ConflictCode.BED_INACTIVE.name()));
        assertTrue(hasBedInactive);
    }

    @Test
    @DisplayName("10. Invalid hostel hierarchy: bed doesn't belong to room or hostel returns INVALID_HOSTEL_HIERARCHY")
    void testInvalidHierarchy() {
        when(bedRepository.findById(1001L)).thenReturn(Optional.of(testBed));

        // Request supplies roomId 999 while bed belongs to room 500
        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .bedId(1001L)
                .roomId(999L)
                .hostelId(1L)
                .targetBed(testBed)
                .build();

        ConflictResultDto result = conflictDetectionService.detectHostelConflicts(request);

        assertNotNull(result);
        assertFalse(result.isValid());
        boolean hasHierarchyConflict = result.getConflicts().stream()
                .anyMatch(c -> c.getConflictType().equals(ConflictCode.INVALID_HOSTEL_HIERARCHY.name()));
        assertTrue(hasHierarchyConflict);
    }

    @Test
    @DisplayName("11. Warden scope violation: warden not assigned to hostel returns WARDEN_SCOPE_VIOLATION")
    void testWardenScopeViolation() {
        when(bedRepository.findById(1001L)).thenReturn(Optional.of(testBed));
        when(wardenScopeService.getAuthorizedHostelIds()).thenReturn(Collections.emptySet());

        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .bedId(1001L)
                .hostelId(1L)
                .targetBed(testBed)
                .build();

        ConflictResultDto result = conflictDetectionService.detectHostelConflicts(request, testWarden);

        assertNotNull(result);
        assertFalse(result.isValid());
        boolean hasWardenViolation = result.getConflicts().stream()
                .anyMatch(c -> c.getConflictType().equals(ConflictCode.WARDEN_SCOPE_VIOLATION.name()));
        assertTrue(hasWardenViolation);
    }

    @Test
    @DisplayName("12. Invalid hostel request: request is already cancelled returns HOSTEL_REQUEST_INVALID")
    void testHostelRequestInvalid() {
        testRequest.setStatus(RequestStatus.CANCELLED);
        when(bedRepository.findById(1001L)).thenReturn(Optional.of(testBed));
        when(hostelRequestRepository.findById(700L)).thenReturn(Optional.of(testRequest));

        ConflictCheckRequestDto request = ConflictCheckRequestDto.builder()
                .bedId(1001L)
                .hostelRequestId(700L)
                .targetBed(testBed)
                .build();

        ConflictResultDto result = conflictDetectionService.detectHostelConflicts(request);

        assertNotNull(result);
        assertFalse(result.isValid());
        boolean hasRequestInvalid = result.getConflicts().stream()
                .anyMatch(c -> c.getConflictType().equals(ConflictCode.HOSTEL_REQUEST_INVALID.name()));
        assertTrue(hasRequestInvalid);
    }
}
