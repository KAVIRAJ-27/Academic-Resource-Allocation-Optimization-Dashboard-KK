package com.ahrao.service;

import com.ahrao.dto.warden.CreateHostelAllocationRequest;
import com.ahrao.dto.warden.WardenAllocationDetailDto;
import com.ahrao.dto.warden.WardenAllocationSummaryDto;
import com.ahrao.entity.academic.AcademicYear;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.academic.Program;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.allocation.HostelAllocation;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.HostelBedStatus;
import com.ahrao.entity.enums.HostelType;
import com.ahrao.entity.enums.RoomType;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.hostel.HostelBed;
import com.ahrao.entity.hostel.HostelBlock;
import com.ahrao.entity.hostel.HostelFloor;
import com.ahrao.entity.hostel.HostelRoom;
import com.ahrao.entity.hostel.Warden;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.repository.academic.AcademicYearRepository;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
import com.ahrao.service.warden.WardenAllocationServiceImpl;
import com.ahrao.service.warden.WardenScopeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WardenAllocationServiceTest {

    @Mock
    private HostelAllocationRepository hostelAllocationRepository;

    @Mock
    private HostelBedRepository hostelBedRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private AcademicYearRepository academicYearRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private WardenScopeService wardenScopeService;

    @InjectMocks
    private WardenAllocationServiceImpl service;

    private Warden mockWarden;
    private User mockWardenUser;
    private Student mockStudent;
    private User mockStudentUser;
    private Hostel mockHostel;
    private HostelBlock mockBlock;
    private HostelFloor mockFloor;
    private HostelRoom mockRoom;
    private HostelBed mockBed;
    private AcademicYear mockAcademicYear;
    private HostelAllocation mockAllocation;

    @BeforeEach
    void setUp() {
        mockWardenUser = new User();
        mockWardenUser.setUsername("warden.john");

        mockWarden = new Warden();
        mockWarden.setUser(mockWardenUser);
        mockWarden.setStatus("ACTIVE");

        Institution inst = new Institution();
        inst.setName("Tech University");

        mockHostel = new Hostel();
        mockHostel.setId(10L);
        mockHostel.setName("Emerald Boys Hostel");
        mockHostel.setCode("EBH");
        mockHostel.setType(HostelType.BOYS);
        mockHostel.setInstitution(inst);
        mockHostel.setStatus("ACTIVE");

        mockBlock = new HostelBlock();
        mockBlock.setId(20L);
        mockBlock.setName("Block A");
        mockBlock.setCode("A");
        mockBlock.setHostel(mockHostel);

        mockFloor = new HostelFloor();
        mockFloor.setId(30L);
        mockFloor.setFloorNumber(1);
        mockFloor.setName("1st Floor");
        mockFloor.setBlock(mockBlock);

        mockRoom = new HostelRoom();
        mockRoom.setId(40L);
        mockRoom.setRoomNumber("A-101");
        mockRoom.setFloor(mockFloor);
        mockRoom.setCapacity(2);
        mockRoom.setRoomType(RoomType.DOUBLE);
        mockRoom.setStatus("AVAILABLE");

        mockBed = new HostelBed();
        mockBed.setId(50L);
        mockBed.setBedNumber("A-101-01");
        mockBed.setRoom(mockRoom);
        mockBed.setStatus(HostelBedStatus.AVAILABLE);

        mockStudentUser = new User();
        mockStudentUser.setUsername("alex.chen");
        mockStudentUser.setFirstName("Alex");
        mockStudentUser.setLastName("Chen");
        mockStudentUser.setStatus(UserStatus.ACTIVE);

        Department dept = new Department();
        dept.setName("Computer Science");

        Program prog = new Program();
        prog.setName("B.Tech CSE");

        mockStudent = new Student();
        mockStudent.setId(100L);
        mockStudent.setUser(mockStudentUser);
        mockStudent.setRegisterNumber("CS2026001");
        mockStudent.setRollNumber("26CS01");
        mockStudent.setDepartment(dept);
        mockStudent.setProgram(prog);
        mockStudent.setStatus("ACTIVE");

        mockAcademicYear = new AcademicYear();
        mockAcademicYear.setId(1L);
        mockAcademicYear.setName("2026-2027");
        mockAcademicYear.setStatus("ACTIVE");

        mockAllocation = new HostelAllocation();
        mockAllocation.setId(500L);
        mockAllocation.setStudent(mockStudent);
        mockAllocation.setBed(mockBed);
        mockAllocation.setAcademicYear(mockAcademicYear);
        mockAllocation.setStartDate(LocalDate.now());
        mockAllocation.setStatus(AllocationStatus.ACTIVE);
    }

    @Test
    @DisplayName("Should successfully create hostel allocation and update bed to OCCUPIED")
    void testCreateAllocation_Success() {
        CreateHostelAllocationRequest request = new CreateHostelAllocationRequest(
                100L, 50L, 1L, LocalDate.of(2026, 9, 1), LocalDate.of(2027, 6, 30));

        when(wardenScopeService.resolveWarden()).thenReturn(mockWarden);
        when(wardenScopeService.getAuthorizedHostelIds()).thenReturn(Set.of(10L));
        when(studentRepository.findById(100L)).thenReturn(Optional.of(mockStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(100L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelBedRepository.findByIdWithLock(50L)).thenReturn(Optional.of(mockBed));
        when(hostelAllocationRepository.existsByHostelBedIdAndStatus(50L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelAllocationRepository.countByHostelBedRoomIdAndStatus(40L, AllocationStatus.ACTIVE)).thenReturn(0L);
        when(academicYearRepository.findById(1L)).thenReturn(Optional.of(mockAcademicYear));
        when(hostelAllocationRepository.save(any(HostelAllocation.class))).thenAnswer(inv -> {
            HostelAllocation a = inv.getArgument(0);
            a.setId(777L);
            return a;
        });

        WardenAllocationSummaryDto result = service.createAllocation(request, "127.0.0.1", "JUnit");

        assertNotNull(result);
        assertEquals(777L, result.getId());
        assertEquals(AllocationStatus.ACTIVE, result.getStatus());
        assertEquals(HostelBedStatus.OCCUPIED, mockBed.getStatus());
        verify(hostelBedRepository).save(mockBed);
        verify(auditLogRepository).save(any());
    }

    @Test
    @DisplayName("Should reject allocation if student already has an active allocation (409 Conflict)")
    void testCreateAllocation_StudentAlreadyHasActiveAllocation() {
        CreateHostelAllocationRequest request = new CreateHostelAllocationRequest(
                100L, 50L, 1L, LocalDate.now(), null);

        when(wardenScopeService.resolveWarden()).thenReturn(mockWarden);
        when(wardenScopeService.getAuthorizedHostelIds()).thenReturn(Set.of(10L));
        when(studentRepository.findById(100L)).thenReturn(Optional.of(mockStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(100L, AllocationStatus.ACTIVE)).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () ->
                service.createAllocation(request, "127.0.0.1", "JUnit"));

        assertTrue(ex.getMessage().contains("already has an active hostel allocation"));
        verify(hostelAllocationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject allocation if bed is not in Warden's authorized hostel (403 Forbidden)")
    void testCreateAllocation_BedOutsideWardenScope() {
        CreateHostelAllocationRequest request = new CreateHostelAllocationRequest(
                100L, 50L, 1L, LocalDate.now(), null);

        // Warden authorized only for hostel 999, but bed is in hostel 10
        when(wardenScopeService.resolveWarden()).thenReturn(mockWarden);
        when(wardenScopeService.getAuthorizedHostelIds()).thenReturn(Set.of(999L));
        when(studentRepository.findById(100L)).thenReturn(Optional.of(mockStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(100L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelBedRepository.findByIdWithLock(50L)).thenReturn(Optional.of(mockBed));

        ForbiddenException ex = assertThrows(ForbiddenException.class, () ->
                service.createAllocation(request, "127.0.0.1", "JUnit"));

        assertTrue(ex.getMessage().contains("outside your authorized scope"));
    }

    @Test
    @DisplayName("Should reject allocation if bed is already OCCUPIED (409 Conflict)")
    void testCreateAllocation_BedAlreadyOccupied() {
        mockBed.setStatus(HostelBedStatus.OCCUPIED);
        CreateHostelAllocationRequest request = new CreateHostelAllocationRequest(
                100L, 50L, 1L, LocalDate.now(), null);

        when(wardenScopeService.resolveWarden()).thenReturn(mockWarden);
        when(wardenScopeService.getAuthorizedHostelIds()).thenReturn(Set.of(10L));
        when(studentRepository.findById(100L)).thenReturn(Optional.of(mockStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(100L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelBedRepository.findByIdWithLock(50L)).thenReturn(Optional.of(mockBed));

        ConflictException ex = assertThrows(ConflictException.class, () ->
                service.createAllocation(request, "127.0.0.1", "JUnit"));

        assertTrue(ex.getMessage().contains("no longer available"));
    }

    @Test
    @DisplayName("Should reject allocation if room capacity is reached (409 Conflict)")
    void testCreateAllocation_RoomCapacityReached() {
        mockRoom.setCapacity(2);
        CreateHostelAllocationRequest request = new CreateHostelAllocationRequest(
                100L, 50L, 1L, LocalDate.now(), null);

        when(wardenScopeService.resolveWarden()).thenReturn(mockWarden);
        when(wardenScopeService.getAuthorizedHostelIds()).thenReturn(Set.of(10L));
        when(studentRepository.findById(100L)).thenReturn(Optional.of(mockStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(100L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelBedRepository.findByIdWithLock(50L)).thenReturn(Optional.of(mockBed));
        when(hostelAllocationRepository.existsByHostelBedIdAndStatus(50L, AllocationStatus.ACTIVE)).thenReturn(false);
        // Already 2 active allocations in room with capacity 2
        when(hostelAllocationRepository.countByHostelBedRoomIdAndStatus(40L, AllocationStatus.ACTIVE)).thenReturn(2L);

        ConflictException ex = assertThrows(ConflictException.class, () ->
                service.createAllocation(request, "127.0.0.1", "JUnit"));

        assertTrue(ex.getMessage().contains("Room capacity (2) has been reached"));
    }

    @Test
    @DisplayName("Should reject allocation if end date is before start date (400 Bad Request)")
    void testCreateAllocation_InvalidDates() {
        CreateHostelAllocationRequest request = new CreateHostelAllocationRequest(
                100L, 50L, 1L, LocalDate.of(2027, 1, 1), LocalDate.of(2026, 1, 1));

        when(wardenScopeService.resolveWarden()).thenReturn(mockWarden);
        when(wardenScopeService.getAuthorizedHostelIds()).thenReturn(Set.of(10L));
        when(studentRepository.findById(100L)).thenReturn(Optional.of(mockStudent));
        when(hostelAllocationRepository.existsByStudentIdAndStatus(100L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelBedRepository.findByIdWithLock(50L)).thenReturn(Optional.of(mockBed));
        when(hostelAllocationRepository.existsByHostelBedIdAndStatus(50L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(hostelAllocationRepository.countByHostelBedRoomIdAndStatus(40L, AllocationStatus.ACTIVE)).thenReturn(0L);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                service.createAllocation(request, "127.0.0.1", "JUnit"));

        assertTrue(ex.getMessage().contains("End date cannot be earlier than start date"));
    }

    @Test
    @DisplayName("Should release allocation safely, set status to COMPLETED, and free bed to AVAILABLE")
    void testReleaseAllocation_Success() {
        mockAllocation.setStatus(AllocationStatus.ACTIVE);
        mockBed.setStatus(HostelBedStatus.OCCUPIED);

        when(wardenScopeService.resolveWarden()).thenReturn(mockWarden);
        when(wardenScopeService.validateAllocationAccess(500L)).thenReturn(mockAllocation);
        when(hostelAllocationRepository.save(any(HostelAllocation.class))).thenReturn(mockAllocation);

        WardenAllocationSummaryDto result = service.releaseAllocation(500L, "127.0.0.1", "JUnit");

        assertNotNull(result);
        assertEquals(AllocationStatus.COMPLETED, mockAllocation.getStatus());
        assertNotNull(mockAllocation.getReleasedAt());
        assertEquals(HostelBedStatus.AVAILABLE, mockBed.getStatus());
        verify(hostelBedRepository).save(mockBed);
        verify(auditLogRepository).save(any());
        // Verify we DO NOT delete the allocation
        verify(hostelAllocationRepository, never()).delete(any(HostelAllocation.class));
        verify(hostelAllocationRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("Should reject releasing an allocation that is not ACTIVE")
    void testReleaseAllocation_AlreadyCompleted() {
        mockAllocation.setStatus(AllocationStatus.COMPLETED);

        when(wardenScopeService.resolveWarden()).thenReturn(mockWarden);
        when(wardenScopeService.validateAllocationAccess(500L)).thenReturn(mockAllocation);

        ConflictException ex = assertThrows(ConflictException.class, () ->
                service.releaseAllocation(500L, "127.0.0.1", "JUnit"));

        assertTrue(ex.getMessage().contains("Only ACTIVE allocations can be released"));
    }

    @Test
    @DisplayName("Should retrieve allocation by ID with full details")
    void testGetAllocationById() {
        when(wardenScopeService.validateAllocationAccess(500L)).thenReturn(mockAllocation);

        WardenAllocationDetailDto detail = service.getAllocationById(500L);

        assertNotNull(detail);
        assertEquals(500L, detail.getId());
        assertEquals("Alex Chen", detail.getStudentName());
        assertEquals("A-101", detail.getRoomNumber());
        assertEquals("A-101-01", detail.getBedNumber());
    }
}
