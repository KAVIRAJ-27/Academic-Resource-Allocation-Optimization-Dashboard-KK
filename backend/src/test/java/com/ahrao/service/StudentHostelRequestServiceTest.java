package com.ahrao.service;

import com.ahrao.dto.student.hostel.request.CreateStudentHostelRequest;
import com.ahrao.dto.student.hostel.request.StudentHostelRequestDto;
import com.ahrao.dto.student.hostel.request.StudentHostelRequestSummaryCountsDto;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.allocation.HostelAllocation;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.hostel.HostelBed;
import com.ahrao.entity.hostel.HostelBlock;
import com.ahrao.entity.hostel.HostelFloor;
import com.ahrao.entity.hostel.HostelRoom;
import com.ahrao.entity.request.HostelRequest;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.HostelRequestRepository;
import com.ahrao.service.student.StudentHostelRequestServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentHostelRequestServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private HostelAllocationRepository hostelAllocationRepository;

    @Mock
    private HostelRequestRepository hostelRequestRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private StudentHostelRequestServiceImpl requestService;

    private User mockUser;
    private Student mockStudent;
    private Hostel mockHostel;
    private HostelBlock mockBlock;
    private HostelFloor mockFloor;
    private HostelRoom mockRoom;
    private HostelBed mockBed;
    private HostelAllocation mockAllocation;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(10L);
        mockUser.setUsername("alex.mercer");
        mockUser.setFirstName("Alex");
        mockUser.setLastName("Mercer");

        mockStudent = new Student();
        mockStudent.setId(100L);
        mockStudent.setUser(mockUser);
        mockStudent.setRegisterNumber("REG-1001");

        mockHostel = new Hostel();
        mockHostel.setId(1L);
        mockHostel.setName("Mandela Hall");

        mockBlock = new HostelBlock();
        mockBlock.setId(2L);
        mockBlock.setName("Block A");
        mockBlock.setHostel(mockHostel);

        mockFloor = new HostelFloor();
        mockFloor.setId(3L);
        mockFloor.setFloorNumber(2);
        mockFloor.setBlock(mockBlock);

        mockRoom = new HostelRoom();
        mockRoom.setId(4L);
        mockRoom.setRoomNumber("201");
        mockRoom.setFloor(mockFloor);

        mockBed = new HostelBed();
        mockBed.setId(5L);
        mockBed.setBedNumber("B1");
        mockBed.setRoom(mockRoom);

        mockAllocation = new HostelAllocation();
        mockAllocation.setId(500L);
        mockAllocation.setStudent(mockStudent);
        mockAllocation.setBed(mockBed);
        mockAllocation.setStatus(AllocationStatus.ACTIVE);
    }

    @Test
    @DisplayName("Create request succeeds when student has active allocation")
    void testCreateRequestSuccess() {
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));
        when(hostelAllocationRepository.findByStudentIdAndStatus(100L, AllocationStatus.ACTIVE))
                .thenReturn(Optional.of(mockAllocation));
        when(hostelRequestRepository.existsByStudentIdAndHostelIdAndRequestTypeAndStatus(
                100L, 1L, "ROOM_CHANGE", RequestStatus.PENDING)).thenReturn(false);

        HostelRequest saved = new HostelRequest();
        saved.setId(999L);
        saved.setStudent(mockStudent);
        saved.setHostel(mockHostel);
        saved.setRequestType("ROOM_CHANGE");
        saved.setDescription("Need quiet floor");
        saved.setPriority(PriorityLevel.HIGH);
        saved.setStatus(RequestStatus.PENDING);

        when(hostelRequestRepository.save(any(HostelRequest.class))).thenReturn(saved);

        CreateStudentHostelRequest req = new CreateStudentHostelRequest(
                "ROOM_CHANGE", "Need quiet floor", PriorityLevel.HIGH);

        StudentHostelRequestDto result = requestService.createRequest(10L, req, "127.0.0.1", "Browser");

        assertNotNull(result);
        assertEquals(999L, result.getId());
        assertEquals("ROOM_CHANGE", result.getRequestType());
        assertEquals("Mandela Hall", result.getHostelName());
        assertEquals(RequestStatus.PENDING, result.getStatus());

        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Create request fails when student has no active allocation")
    void testCreateRequestNoAllocationFails() {
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));
        when(hostelAllocationRepository.findByStudentIdAndStatus(100L, AllocationStatus.ACTIVE))
                .thenReturn(Optional.empty());

        CreateStudentHostelRequest req = new CreateStudentHostelRequest(
                "ROOM_CHANGE", "Need quiet floor", PriorityLevel.HIGH);

        assertThrows(BadRequestException.class, () ->
                requestService.createRequest(10L, req, "127.0.0.1", "Browser"));
        verifyNoInteractions(hostelRequestRepository);
    }

    @Test
    @DisplayName("Create request fails if duplicate pending request exists")
    void testCreateRequestDuplicateFails() {
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));
        when(hostelAllocationRepository.findByStudentIdAndStatus(100L, AllocationStatus.ACTIVE))
                .thenReturn(Optional.of(mockAllocation));
        when(hostelRequestRepository.existsByStudentIdAndHostelIdAndRequestTypeAndStatus(
                100L, 1L, "ROOM_CHANGE", RequestStatus.PENDING)).thenReturn(true);

        CreateStudentHostelRequest req = new CreateStudentHostelRequest(
                "ROOM_CHANGE", "Need quiet floor", PriorityLevel.HIGH);

        assertThrows(ConflictException.class, () ->
                requestService.createRequest(10L, req, "127.0.0.1", "Browser"));
        verify(hostelRequestRepository, never()).save(any());
    }

    @Test
    @DisplayName("Cancel request succeeds for pending request owned by student")
    void testCancelRequestSuccess() {
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));

        HostelRequest hr = new HostelRequest();
        hr.setId(999L);
        hr.setStudent(mockStudent);
        hr.setHostel(mockHostel);
        hr.setRequestType("MAINTENANCE");
        hr.setStatus(RequestStatus.PENDING);

        when(hostelRequestRepository.findById(999L)).thenReturn(Optional.of(hr));
        when(hostelRequestRepository.save(any(HostelRequest.class))).thenAnswer(inv -> inv.getArgument(0));

        StudentHostelRequestDto result = requestService.cancelRequest(10L, 999L, "127.0.0.1", "Browser");

        assertNotNull(result);
        assertEquals(RequestStatus.CANCELLED, result.getStatus());
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Cancel request fails when status is already APPROVED")
    void testCancelNonPendingRequestFails() {
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));

        HostelRequest hr = new HostelRequest();
        hr.setId(999L);
        hr.setStudent(mockStudent);
        hr.setHostel(mockHostel);
        hr.setStatus(RequestStatus.APPROVED);

        when(hostelRequestRepository.findById(999L)).thenReturn(Optional.of(hr));

        assertThrows(BadRequestException.class, () ->
                requestService.cancelRequest(10L, 999L, "127.0.0.1", "Browser"));
        verify(hostelRequestRepository, never()).save(any());
    }

    @Test
    @DisplayName("Get request by ID fails if owned by another student (ownership security)")
    void testGetRequestWrongOwnerThrows() {
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));

        Student otherStudent = new Student();
        otherStudent.setId(9999L);

        HostelRequest hr = new HostelRequest();
        hr.setId(888L);
        hr.setStudent(otherStudent);

        when(hostelRequestRepository.findById(888L)).thenReturn(Optional.of(hr));

        assertThrows(com.ahrao.exception.ForbiddenException.class, () ->
                requestService.getRequestById(10L, 888L));
    }

    @Test
    @DisplayName("Get request summary counts returns correct aggregation")
    void testGetRequestCounts() {
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));
        when(hostelRequestRepository.countByStudentId(100L)).thenReturn(5L);
        when(hostelRequestRepository.countByStudentIdAndStatus(100L, RequestStatus.PENDING)).thenReturn(2L);
        when(hostelRequestRepository.countByStudentIdAndStatus(100L, RequestStatus.APPROVED)).thenReturn(1L);
        when(hostelRequestRepository.countByStudentIdAndStatus(100L, RequestStatus.REJECTED)).thenReturn(1L);
        when(hostelRequestRepository.countByStudentIdAndStatus(100L, RequestStatus.CANCELLED)).thenReturn(1L);
        when(hostelRequestRepository.countByStudentIdAndStatus(100L, RequestStatus.COMPLETED)).thenReturn(0L);

        StudentHostelRequestSummaryCountsDto counts = requestService.getRequestCounts(10L);

        assertNotNull(counts);
        assertEquals(5, counts.getTotal());
        assertEquals(2, counts.getPending());
        assertEquals(1, counts.getApproved());
        assertEquals(1, counts.getRejected());
        assertEquals(1, counts.getCancelled());
        assertEquals(0, counts.getCompleted());
    }
}
