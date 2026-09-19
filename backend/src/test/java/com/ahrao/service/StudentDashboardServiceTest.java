package com.ahrao.service;

import com.ahrao.dto.student.StudentDashboardDto;
import com.ahrao.dto.student.StudentProfileDto;
import com.ahrao.dto.student.StudentProfileUpdateRequest;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Program;
import com.ahrao.entity.academic.Section;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.academic.Subject;
import com.ahrao.entity.allocation.HostelAllocation;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.DegreeType;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.hostel.HostelBed;
import com.ahrao.entity.hostel.HostelBlock;
import com.ahrao.entity.hostel.HostelFloor;
import com.ahrao.entity.hostel.HostelRoom;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.academic.SubjectRepository;
import com.ahrao.repository.academic.TimetableEntryRepository;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.request.HostelRequestRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.student.StudentDashboardServiceImpl;
import com.ahrao.service.student.StudentProfileServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import org.mockito.ArgumentMatchers;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentDashboardServiceTest {

    @Mock
    private StudentRepository studentRepository;
    @Mock
    private SubjectRepository subjectRepository;
    @Mock
    private TimetableEntryRepository timetableEntryRepository;
    @Mock
    private HostelAllocationRepository hostelAllocationRepository;
    @Mock
    private ResourceAllocationRepository resourceAllocationRepository;
    @Mock
    private AuditLogRepository auditLogRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AcademicResourceRequestRepository academicResourceRequestRepository;
    @Mock
    private HostelRequestRepository hostelRequestRepository;

    private StudentDashboardServiceImpl dashboardService;
    private StudentProfileServiceImpl profileService;

    private User mockUser;
    private Student mockStudent;
    private Department mockDept;
    private Program mockProg;
    private Section mockSection;

    @BeforeEach
    void setUp() {
        dashboardService = new StudentDashboardServiceImpl(
                studentRepository,
                subjectRepository,
                timetableEntryRepository,
                hostelAllocationRepository,
                resourceAllocationRepository,
                auditLogRepository,
                academicResourceRequestRepository,
                hostelRequestRepository
        );

        profileService = new StudentProfileServiceImpl(
                studentRepository,
                userRepository,
                hostelAllocationRepository,
                auditLogRepository
        );

        mockUser = new User();
        mockUser.setUsername("alex.mercer");
        mockUser.setFirstName("Alex");
        mockUser.setLastName("Mercer");
        mockUser.setEmail("alex@example.com");
        mockUser.setPhone("+1234567890");
        mockUser.setStatus(UserStatus.ACTIVE);
        Role role = new Role();
        role.setName("ROLE_STUDENT");
        mockUser.setRoles(Set.of(role));

        mockDept = new Department();
        mockDept.setName("Computer Science");
        mockDept.setCode("CS");

        mockProg = new Program();
        mockProg.setName("B.Tech Computer Science");
        mockProg.setCode("BT-CS");
        mockProg.setDegreeType(DegreeType.B_TECH);
        mockProg.setDurationYears(4);

        mockSection = new Section();
        mockSection.setName("A");

        mockStudent = new Student();
        mockStudent.setUser(mockUser);
        mockStudent.setDepartment(mockDept);
        mockStudent.setProgram(mockProg);
        mockStudent.setSection(mockSection);
        mockStudent.setRegisterNumber("REG-1001");
        mockStudent.setRollNumber("ROLL-01");
        mockStudent.setAdmissionYear(2023);
        mockStudent.setCurrentSemester(3);
        mockStudent.setStatus("ACTIVE");
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("getDashboard succeeds with real data aggregation")
    void testGetDashboardSuccess() {
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));
        when(hostelAllocationRepository.findByStudentIdAndStatus(any(), eq(AllocationStatus.ACTIVE)))
                .thenReturn(Optional.empty());
        when(subjectRepository.count(ArgumentMatchers.<Specification<Subject>>any())).thenReturn(6L);
        when(timetableEntryRepository.findBySectionId(any())).thenReturn(Collections.emptyList());
        when(resourceAllocationRepository.findByAllocatedToUserId(10L)).thenReturn(Collections.emptyList());
        when(auditLogRepository.findByUserIdOrderByCreatedAtDesc(eq(10L), any(Pageable.class)))
                .thenReturn(Collections.emptyList());

        StudentDashboardDto result = dashboardService.getDashboard(10L);

        assertNotNull(result);
        assertEquals("Alex Mercer", result.getStudent().getName());
        assertEquals("REG-1001", result.getStudent().getRegisterNumber());
        assertEquals("Computer Science", result.getAcademic().getDepartmentName());
        assertEquals(3, result.getAcademic().getCurrentSemester());
        assertFalse(result.getHostel().isAllocated());
        assertEquals(6, result.getMetrics().getEnrolledCoursesCount());
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("getDashboard populates active hostel allocation details")
    void testGetDashboardWithHostel() {
        Hostel hostel = new Hostel();
        hostel.setName("Nelson Mandela Hostel");
        HostelBlock block = new HostelBlock();
        block.setName("Block C");
        block.setHostel(hostel);
        HostelFloor floor = new HostelFloor();
        floor.setFloorNumber(2);
        floor.setBlock(block);
        HostelRoom room = new HostelRoom();
        room.setRoomNumber("204");
        room.setFloor(floor);
        HostelBed bed = new HostelBed();
        bed.setBedNumber("B1");
        bed.setRoom(room);

        HostelAllocation allocation = new HostelAllocation();
        allocation.setBed(bed);
        allocation.setStatus(AllocationStatus.ACTIVE);
        allocation.setStartDate(LocalDate.of(2024, 8, 1));

        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));
        when(hostelAllocationRepository.findByStudentIdAndStatus(any(), eq(AllocationStatus.ACTIVE)))
                .thenReturn(Optional.of(allocation));
        when(subjectRepository.count(ArgumentMatchers.<Specification<Subject>>any())).thenReturn(5L);
        when(timetableEntryRepository.findBySectionId(any())).thenReturn(Collections.emptyList());
        when(resourceAllocationRepository.findByAllocatedToUserId(10L)).thenReturn(Collections.emptyList());
        when(auditLogRepository.findByUserIdOrderByCreatedAtDesc(eq(10L), any(Pageable.class)))
                .thenReturn(Collections.emptyList());

        StudentDashboardDto result = dashboardService.getDashboard(10L);

        assertNotNull(result);
        assertTrue(result.getHostel().isAllocated());
        assertEquals("Nelson Mandela Hostel", result.getHostel().getHostelName());
        assertEquals("Block C", result.getHostel().getBlockName());
        assertEquals("204", result.getHostel().getRoomNumber());
        assertEquals("B1", result.getHostel().getBedNumber());
    }

    @Test
    @DisplayName("getProfile succeeds and returns complete read-only academic and editable contact info")
    void testGetProfileSuccess() {
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));
        when(hostelAllocationRepository.findByStudentIdAndStatus(any(), eq(AllocationStatus.ACTIVE)))
                .thenReturn(Optional.empty());

        StudentProfileDto result = profileService.getProfile(10L);

        assertNotNull(result);
        assertEquals("Alex Mercer", result.getFullName());
        assertEquals("alex@example.com", result.getEmail());
        assertEquals("+1234567890", result.getPhone());
        assertEquals("REG-1001", result.getRegisterNumber());
        assertEquals("Computer Science", result.getDepartmentName());
        assertEquals("B.Tech Computer Science", result.getProgramName());
        assertEquals("Section A", "Section " + result.getSectionName());
    }

    @Test
    @DisplayName("updateProfile modifies safe contact fields and writes audit log")
    void testUpdateProfileSuccess() {
        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));
        when(hostelAllocationRepository.findByStudentIdAndStatus(any(), eq(AllocationStatus.ACTIVE)))
                .thenReturn(Optional.empty());

        StudentProfileUpdateRequest request = new StudentProfileUpdateRequest("Alexander", "Mercer", "+9876543210");
        StudentProfileDto result = profileService.updateProfile(10L, request, "192.168.1.1", "Mozilla/5.0");

        assertNotNull(result);
        assertEquals("Alexander", mockUser.getFirstName());
        assertEquals("+9876543210", mockUser.getPhone());
        verify(userRepository, times(1)).save(mockUser);
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("getProfile throws ResourceNotFoundException when no student linked to user")
    void testGetProfileNotFound() {
        when(studentRepository.findByUserId(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> profileService.getProfile(99L));
    }
}
