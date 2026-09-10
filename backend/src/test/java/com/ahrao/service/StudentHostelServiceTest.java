package com.ahrao.service;

import com.ahrao.dto.student.hostel.StudentHostelAllocationHistoryDto;
import com.ahrao.dto.student.hostel.StudentHostelResponse;
import com.ahrao.entity.academic.AcademicYear;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.allocation.HostelAllocation;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.HostelBedStatus;
import com.ahrao.entity.enums.HostelType;
import com.ahrao.entity.enums.RoomType;
import com.ahrao.entity.hostel.*;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
import com.ahrao.repository.hostel.HostelFacilityRepository;
import com.ahrao.repository.hostel.WardenRepository;
import com.ahrao.service.student.StudentHostelServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentHostelServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private HostelAllocationRepository hostelAllocationRepository;

    @Mock
    private HostelBedRepository hostelBedRepository;

    @Mock
    private HostelFacilityRepository hostelFacilityRepository;

    @Mock
    private WardenRepository wardenRepository;

    @InjectMocks
    private StudentHostelServiceImpl service;

    private User mockUser;
    private Student mockStudent;
    private Hostel mockHostel;
    private HostelBlock mockBlock;
    private HostelFloor mockFloor;
    private HostelRoom mockRoom;
    private HostelBed mockBed;
    private HostelAllocation mockAllocation;
    private HostelFacility mockFacility;
    private Warden mockWarden;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(10L);
        mockUser.setUsername("alex_student");
        mockUser.setFirstName("Alex");
        mockUser.setLastName("Mercer");
        mockUser.setEmail("alex@univ.edu");

        mockStudent = new Student();
        mockStudent.setId(1L);
        mockStudent.setUser(mockUser);
        mockStudent.setStatus("ACTIVE");

        Institution institution = new Institution();
        institution.setId(1L);
        institution.setName("National Institute of Technology");

        mockHostel = new Hostel();
        mockHostel.setId(100L);
        mockHostel.setName("Nilgiri Boys Hostel");
        mockHostel.setCode("HSTL-NB-01");
        mockHostel.setType(HostelType.BOYS);
        mockHostel.setAddress("North Campus Sector B");
        mockHostel.setCapacity(300);
        mockHostel.setStatus("ACTIVE");
        mockHostel.setInstitution(institution);

        mockBlock = new HostelBlock();
        mockBlock.setId(200L);
        mockBlock.setName("Block A");
        mockBlock.setCode("BLK-A");
        mockBlock.setNumberOfFloors(4);
        mockBlock.setStatus("ACTIVE");
        mockBlock.setHostel(mockHostel);

        mockFloor = new HostelFloor();
        mockFloor.setId(300L);
        mockFloor.setName("Second Floor");
        mockFloor.setFloorNumber(2);
        mockFloor.setStatus("ACTIVE");
        mockFloor.setBlock(mockBlock);

        mockRoom = new HostelRoom();
        mockRoom.setId(400L);
        mockRoom.setRoomNumber("A-204");
        mockRoom.setRoomType(RoomType.DOUBLE);
        mockRoom.setCapacity(2);
        mockRoom.setStatus("OCCUPIED");
        mockRoom.setFloor(mockFloor);

        mockBed = new HostelBed();
        mockBed.setId(500L);
        mockBed.setBedNumber("A-204-B1");
        mockBed.setStatus(HostelBedStatus.OCCUPIED);
        mockBed.setRoom(mockRoom);

        AcademicYear year = new AcademicYear();
        year.setId(1L);
        year.setName("2025-2026");

        mockAllocation = new HostelAllocation();
        mockAllocation.setId(600L);
        mockAllocation.setStudent(mockStudent);
        mockAllocation.setBed(mockBed);
        mockAllocation.setAcademicYear(year);
        mockAllocation.setStartDate(LocalDate.of(2025, 8, 1));
        mockAllocation.setEndDate(LocalDate.of(2026, 5, 31));
        mockAllocation.setStatus(AllocationStatus.ACTIVE);

        mockFacility = new HostelFacility();
        mockFacility.setId(700L);
        mockFacility.setName("High-Speed Wi-Fi");
        mockFacility.setDescription("24/7 campus fiber broadband");
        mockFacility.setQuantity(4);
        mockFacility.setStatus("ACTIVE");
        mockFacility.setHostel(mockHostel);

        User wardenUser = new User();
        wardenUser.setId(88L);
        wardenUser.setFirstName("Vikram");
        wardenUser.setLastName("Sharma");
        wardenUser.setEmail("warden.vikram@univ.edu");

        mockWarden = new Warden();
        mockWarden.setId(800L);
        mockWarden.setUser(wardenUser);
        mockWarden.setEmployeeId("WRD-001");
        mockWarden.setContactNumber("+91-9876543210");
        mockWarden.setStatus("ACTIVE");
        mockWarden.setAssignedHostels(Set.of(mockHostel));
    }

    @Test
    @DisplayName("getStudentHostel should return complete hierarchy and metadata when student is allocated")
    void testGetStudentHostelAllocatedSuccess() {
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));
        when(hostelAllocationRepository.findByStudentId(1L)).thenReturn(List.of(mockAllocation));
        when(hostelAllocationRepository.findByStudentIdAndStatus(1L, AllocationStatus.ACTIVE))
                .thenReturn(Optional.of(mockAllocation));
        when(hostelBedRepository.countByRoomIdAndStatus(400L, HostelBedStatus.OCCUPIED)).thenReturn(2L);
        when(hostelFacilityRepository.findByHostelId(100L)).thenReturn(List.of(mockFacility));
        when(wardenRepository.findByAssignedHostelsId(100L)).thenReturn(List.of(mockWarden));

        StudentHostelResponse response = service.getStudentHostel(10L);

        assertNotNull(response);
        assertTrue(response.isAllocated());

        // Allocation
        assertNotNull(response.getCurrentAllocation());
        assertEquals(600L, response.getCurrentAllocation().getId());
        assertEquals("ACTIVE", response.getCurrentAllocation().getStatus());
        assertEquals(LocalDate.of(2025, 8, 1), response.getCurrentAllocation().getStartDate());
        assertEquals("2025-2026", response.getCurrentAllocation().getAcademicYearName());

        // Bed & Room
        assertNotNull(response.getBed());
        assertEquals("A-204-B1", response.getBed().getBedNumber());
        assertNotNull(response.getRoom());
        assertEquals("A-204", response.getRoom().getRoomNumber());
        assertEquals("DOUBLE", response.getRoom().getRoomType());
        assertEquals(2, response.getRoom().getCapacity());
        assertEquals(2, response.getRoom().getCurrentOccupancy());

        // Hierarchy
        assertNotNull(response.getFloor());
        assertEquals("Second Floor", response.getFloor().getName());
        assertEquals(2, response.getFloor().getFloorNumber());

        assertNotNull(response.getBlock());
        assertEquals("Block A", response.getBlock().getName());

        assertNotNull(response.getHostel());
        assertEquals("Nilgiri Boys Hostel", response.getHostel().getName());
        assertEquals("BOYS", response.getHostel().getType());

        // Facilities
        assertEquals(1, response.getFacilities().size());
        assertEquals("High-Speed Wi-Fi", response.getFacilities().get(0).getName());

        // Wardens
        assertEquals(1, response.getWardens().size());
        assertEquals("Vikram Sharma", response.getWardens().get(0).getName());
        assertEquals("warden.vikram@univ.edu", response.getWardens().get(0).getEmail());
        assertEquals("+91-9876543210", response.getWardens().get(0).getContactNumber());

        // History
        assertEquals(1, response.getHistory().size());
    }

    @Test
    @DisplayName("getStudentHostel should return allocated=false when student has no active allocation")
    void testGetStudentHostelNotAllocated() {
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));
        when(hostelAllocationRepository.findByStudentId(1L)).thenReturn(Collections.emptyList());
        when(hostelAllocationRepository.findByStudentIdAndStatus(1L, AllocationStatus.ACTIVE))
                .thenReturn(Optional.empty());

        StudentHostelResponse response = service.getStudentHostel(10L);

        assertNotNull(response);
        assertFalse(response.isAllocated());
        assertNull(response.getCurrentAllocation());
        assertNull(response.getHostel());
        assertNull(response.getBed());
        assertNull(response.getRoom());
        assertTrue(response.getFacilities().isEmpty());
        assertTrue(response.getWardens().isEmpty());
    }

    @Test
    @DisplayName("getStudentHostel should throw ResourceNotFoundException when student profile not found")
    void testGetStudentHostelStudentNotFound() {
        when(studentRepository.findByUserId(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getStudentHostel(999L));
    }

    @Test
    @DisplayName("getStudentHostelHistory should return mapped historical allocations")
    void testGetStudentHostelHistorySuccess() {
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));
        when(hostelAllocationRepository.findByStudentId(1L)).thenReturn(List.of(mockAllocation));

        List<StudentHostelAllocationHistoryDto> history = service.getStudentHostelHistory(10L);

        assertNotNull(history);
        assertEquals(1, history.size());
        assertEquals("Nilgiri Boys Hostel", history.get(0).getHostelName());
        assertEquals("A-204", history.get(0).getRoomNumber());
        assertEquals("A-204-B1", history.get(0).getBedNumber());
    }
}
