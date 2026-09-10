package com.ahrao.service;

import com.ahrao.dto.faculty.profile.FacultyProfileDto;
import com.ahrao.dto.faculty.profile.UpdateFacultyProfileRequest;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Faculty;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.faculty.FacultyProfileServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FacultyProfileServiceTest {

    @Mock
    private FacultyRepository facultyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private FacultyProfileServiceImpl facultyProfileService;

    private User testUser;
    private Faculty testFaculty;
    private Department testDept;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(101L);
        testUser.setUsername("prof_curie");
        testUser.setFirstName("Marie");
        testUser.setLastName("Curie");
        testUser.setEmail("marie.curie@univ.edu");
        testUser.setPhone("+33123456789");
        testUser.setStatus(UserStatus.ACTIVE);

        Role role = new Role();
        role.setName("ROLE_FACULTY");
        testUser.setRoles(new HashSet<>(Collections.singletonList(role)));

        Institution institution = new Institution();
        institution.setName("Sorbonne University");

        testDept = new Department();
        testDept.setId(5L);
        testDept.setName("Physics & Chemistry");
        testDept.setCode("PHY-CHEM");
        testDept.setInstitution(institution);

        testFaculty = new Faculty();
        testFaculty.setId(201L);
        testFaculty.setUser(testUser);
        testFaculty.setDepartment(testDept);
        testFaculty.setEmployeeId("FAC-0201");
        testFaculty.setDesignation("Professor");
        testFaculty.setQualification("D.Sc. Physics");
        testFaculty.setJoiningDate(LocalDate.of(2015, 8, 15));
        testFaculty.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("getProfile successfully maps faculty, department, and account details")
    void testGetProfileSuccess() {
        when(facultyRepository.findByUserId(101L)).thenReturn(Optional.of(testFaculty));

        FacultyProfileDto profile = facultyProfileService.getProfile(101L);

        assertNotNull(profile);
        assertEquals(101L, profile.getUserId());
        assertEquals(201L, profile.getFacultyId());
        assertEquals("Marie Curie", profile.getFullName());
        assertEquals("marie.curie@univ.edu", profile.getEmail());
        assertEquals("+33123456789", profile.getPhone());
        assertEquals("D.Sc. Physics", profile.getQualification());
        assertEquals("FAC-0201", profile.getEmployeeId());
        assertEquals("Professor", profile.getDesignation());
        assertEquals("Physics & Chemistry", profile.getDepartmentName());
        assertEquals("PHY-CHEM", profile.getDepartmentCode());
        assertEquals("Sorbonne University", profile.getInstitutionName());
        assertEquals("ACTIVE", profile.getAccountStatus());
        assertTrue(profile.getRoles().contains("ROLE_FACULTY"));
    }

    @Test
    @DisplayName("getProfile throws ResourceNotFoundException when faculty record does not exist")
    void testGetProfileNotFound() {
        when(facultyRepository.findByUserId(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> facultyProfileService.getProfile(999L));
    }

    @Test
    @DisplayName("updateProfile persists modified personal fields and records audit log")
    void testUpdateProfileSuccess() {
        when(facultyRepository.findByUserId(101L)).thenReturn(Optional.of(testFaculty));

        UpdateFacultyProfileRequest request = new UpdateFacultyProfileRequest(
                "Marie", "S. Curie", "+33987654321", "Nobel Laureate / D.Sc."
        );

        FacultyProfileDto updated = facultyProfileService.updateProfile(101L, request, "192.168.1.10", "Mozilla/5.0");

        assertNotNull(updated);
        assertEquals("Marie S. Curie", testUser.getLastName().contains("S.") ? "Marie " + testUser.getLastName() : updated.getFullName());
        assertEquals("+33987654321", testUser.getPhone());
        assertEquals("Nobel Laureate / D.Sc.", testFaculty.getQualification());

        verify(userRepository, times(1)).save(testUser);
        verify(facultyRepository, times(1)).save(testFaculty);

        ArgumentCaptor<AuditLog> logCaptor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository, times(1)).save(logCaptor.capture());
        AuditLog savedLog = logCaptor.getValue();
        assertEquals("FACULTY_PROFILE_UPDATED", savedLog.getAction());
        assertEquals("FACULTY", savedLog.getEntityType());
        assertEquals(201L, savedLog.getEntityId());
        assertEquals("192.168.1.10", savedLog.getIpAddress());
        assertEquals("Mozilla/5.0", savedLog.getUserAgent());
    }

    @Test
    @DisplayName("updateProfile throws ResourceNotFoundException when faculty record is absent")
    void testUpdateProfileNotFound() {
        when(facultyRepository.findByUserId(999L)).thenReturn(Optional.empty());

        UpdateFacultyProfileRequest request = new UpdateFacultyProfileRequest("A", "B", "+123", "Q");
        assertThrows(ResourceNotFoundException.class, () ->
                facultyProfileService.updateProfile(999L, request, "127.0.0.1", "Browser"));

        verifyNoInteractions(userRepository);
        verifyNoInteractions(auditLogRepository);
    }
}
