package com.ahrao.service;

import com.ahrao.dto.student.hostel.complaint.CreateStudentHostelComplaint;
import com.ahrao.dto.student.hostel.complaint.StudentHostelComplaintDto;
import com.ahrao.dto.student.hostel.complaint.StudentHostelComplaintSummaryCountsDto;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.allocation.HostelAllocation;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.ComplaintStatus;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.hostel.HostelBed;
import com.ahrao.entity.hostel.HostelBlock;
import com.ahrao.entity.hostel.HostelFloor;
import com.ahrao.entity.hostel.HostelRoom;
import com.ahrao.entity.request.HostelComplaint;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.HostelComplaintRepository;
import com.ahrao.service.student.StudentHostelComplaintServiceImpl;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentHostelComplaintServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private HostelAllocationRepository hostelAllocationRepository;

    @Mock
    private HostelComplaintRepository hostelComplaintRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private StudentHostelComplaintServiceImpl complaintService;

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
    @DisplayName("Create complaint succeeds when student has active allocation")
    void testCreateComplaintSuccess() {
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));
        when(hostelAllocationRepository.findByStudentIdAndStatus(100L, AllocationStatus.ACTIVE))
                .thenReturn(Optional.of(mockAllocation));

        HostelComplaint saved = new HostelComplaint();
        saved.setId(777L);
        saved.setStudent(mockStudent);
        saved.setHostel(mockHostel);
        saved.setRoom(mockRoom);
        saved.setCategory("ELECTRICAL");
        saved.setTitle("Ceiling fan not rotating");
        saved.setDescription("Fan regulator switch is broken");
        saved.setPriority(PriorityLevel.MEDIUM);
        saved.setStatus(ComplaintStatus.OPEN);

        when(hostelComplaintRepository.save(any(HostelComplaint.class))).thenReturn(saved);

        CreateStudentHostelComplaint req = new CreateStudentHostelComplaint(
                "ELECTRICAL", "Ceiling fan not rotating", "Fan regulator switch is broken", PriorityLevel.MEDIUM);

        StudentHostelComplaintDto result = complaintService.createComplaint(10L, req, "127.0.0.1", "Browser");

        assertNotNull(result);
        assertEquals(777L, result.getId());
        assertEquals("ELECTRICAL", result.getCategory());
        assertEquals("Ceiling fan not rotating", result.getTitle());
        assertEquals("Mandela Hall", result.getHostelName());
        assertEquals("201", result.getRoomNumber());
        assertEquals(ComplaintStatus.OPEN, result.getStatus());

        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Create complaint fails when student has no active allocation")
    void testCreateComplaintNoAllocationFails() {
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));
        when(hostelAllocationRepository.findByStudentIdAndStatus(100L, AllocationStatus.ACTIVE))
                .thenReturn(Optional.empty());

        CreateStudentHostelComplaint req = new CreateStudentHostelComplaint(
                "ELECTRICAL", "Ceiling fan not rotating", "Fan regulator switch is broken", PriorityLevel.MEDIUM);

        assertThrows(BadRequestException.class, () ->
                complaintService.createComplaint(10L, req, "127.0.0.1", "Browser"));
        verifyNoInteractions(hostelComplaintRepository);
    }

    @Test
    @DisplayName("Get complaint by ID fails if owned by another student (ownership security)")
    void testGetComplaintWrongOwnerThrows() {
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));

        Student otherStudent = new Student();
        otherStudent.setId(9999L);

        HostelComplaint hc = new HostelComplaint();
        hc.setId(666L);
        hc.setStudent(otherStudent);

        when(hostelComplaintRepository.findById(666L)).thenReturn(Optional.of(hc));

        assertThrows(com.ahrao.exception.ForbiddenException.class, () ->
                complaintService.getComplaintById(10L, 666L));
    }

    @Test
    @DisplayName("Get complaint summary counts returns correct aggregation")
    void testGetComplaintCounts() {
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));
        when(hostelComplaintRepository.countByStudentId(100L)).thenReturn(4L);
        when(hostelComplaintRepository.countByStudentIdAndStatus(100L, ComplaintStatus.OPEN)).thenReturn(2L);
        when(hostelComplaintRepository.countByStudentIdAndStatus(100L, ComplaintStatus.IN_PROGRESS)).thenReturn(1L);
        when(hostelComplaintRepository.countByStudentIdAndStatus(100L, ComplaintStatus.RESOLVED)).thenReturn(1L);
        when(hostelComplaintRepository.countByStudentIdAndStatus(100L, ComplaintStatus.CLOSED)).thenReturn(0L);
        when(hostelComplaintRepository.countByStudentIdAndStatus(100L, ComplaintStatus.REJECTED)).thenReturn(0L);

        StudentHostelComplaintSummaryCountsDto counts = complaintService.getComplaintCounts(10L);

        assertNotNull(counts);
        assertEquals(4, counts.getTotal());
        assertEquals(2, counts.getOpen());
        assertEquals(1, counts.getInProgress());
        assertEquals(1, counts.getResolved());
        assertEquals(0, counts.getClosed());
        assertEquals(0, counts.getRejected());
    }
}
