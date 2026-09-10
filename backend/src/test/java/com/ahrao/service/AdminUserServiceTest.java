package com.ahrao.service;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.user.CreateUserRequest;
import com.ahrao.dto.user.UpdateUserRequest;
import com.ahrao.dto.user.UpdateUserRolesRequest;
import com.ahrao.dto.user.UserSummaryResponse;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.user.RoleRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private User sampleUser;
    private Role adminRole;
    private Role studentRole;

    @BeforeEach
    void setUp() {
        adminRole = new Role();
        adminRole.setName("ADMIN");

        studentRole = new Role();
        studentRole.setName("STUDENT");

        sampleUser = new User();
        sampleUser.setUsername("testadmin");
        sampleUser.setEmail("admin@ahrao.edu");
        sampleUser.setPasswordHash("$2a$10$hashedPasswordHere");
        sampleUser.setFirstName("Test");
        sampleUser.setLastName("Administrator");
        sampleUser.setStatus(UserStatus.ACTIVE);
        sampleUser.setRoles(new HashSet<>(Collections.singletonList(adminRole)));
    }

    @Test
    @DisplayName("Should return paginated users with proper metadata")
    void testGetUsers_Pagination() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> mockPage = new PageImpl<>(Collections.singletonList(sampleUser), pageable, 1);

        when(userRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(mockPage);

        PagedResponse<UserSummaryResponse> response = userService.getUsers("test", "ADMIN", UserStatus.ACTIVE, pageable);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals("testadmin", response.getContent().get(0).getUsername());
        assertEquals(0, response.getPage());
        assertEquals(10, response.getSize());
        assertEquals(1, response.getTotalElements());
        assertEquals(1, response.getTotalPages());
        assertTrue(response.isFirst());
        assertTrue(response.isLast());
    }

    @Test
    @DisplayName("Should create user with BCrypt hash and record audit log")
    void testCreateUser_Success() {
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("newuser");
        request.setEmail("newuser@ahrao.edu");
        request.setPassword("SecurePass123!");
        request.setFirstName("New");
        request.setLastName("User");
        request.setRoles(Collections.singleton("STUDENT"));
        request.setStatus(UserStatus.ACTIVE);

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@ahrao.edu")).thenReturn(false);
        when(roleRepository.findByName("STUDENT")).thenReturn(Optional.of(studentRole));
        when(passwordEncoder.encode("SecurePass123!")).thenReturn("$2a$10$encodedSecureHash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserSummaryResponse response = userService.createUser(request, "admin", "127.0.0.1", "JUnit");

        assertNotNull(response);
        assertEquals("newuser", response.getUsername());
        assertEquals("newuser@ahrao.edu", response.getEmail());
        assertTrue(response.getRoles().contains("STUDENT"));
        verify(passwordEncoder).encode("SecurePass123!");
        verify(auditLogRepository).save(any());
    }

    @Test
    @DisplayName("Should throw 409 Conflict when username already exists")
    void testCreateUser_DuplicateUsername_ThrowsConflict() {
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("existinguser");
        request.setEmail("unique@ahrao.edu");

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () ->
                userService.createUser(request, "admin", "127.0.0.1", "JUnit")
        );

        assertTrue(ex.getMessage().contains("already registered"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw 409 Conflict when email already exists")
    void testCreateUser_DuplicateEmail_ThrowsConflict() {
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("uniqueuser");
        request.setEmail("existing@ahrao.edu");

        when(userRepository.existsByUsername("uniqueuser")).thenReturn(false);
        when(userRepository.existsByEmail("existing@ahrao.edu")).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () ->
                userService.createUser(request, "admin", "127.0.0.1", "JUnit")
        );

        assertTrue(ex.getMessage().contains("already registered"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should prevent self-lockout when admin tries to suspend own account")
    void testSelfLockout_SuspendOwnAccount_ThrowsConflict() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        ConflictException ex = assertThrows(ConflictException.class, () ->
                userService.updateUserStatus(1L, UserStatus.SUSPENDED, "testadmin", "127.0.0.1", "JUnit")
        );

        assertTrue(ex.getMessage().contains("cannot deactivate or suspend their own account"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should prevent self-lockout when admin tries to remove ADMIN role from self")
    void testSelfLockout_RemoveAdminRoleFromSelf_ThrowsConflict() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        UpdateUserRolesRequest request = new UpdateUserRolesRequest(Collections.singleton("STUDENT"));

        ConflictException ex = assertThrows(ConflictException.class, () ->
                userService.updateUserRoles(1L, request, "testadmin", "127.0.0.1", "JUnit")
        );

        assertTrue(ex.getMessage().contains("cannot remove the ADMIN role from their own account"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should protect last active admin from being deactivated")
    void testLastAdminProtection_SuspendLastAdmin_ThrowsConflict() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.countOtherActiveAdmins(any())).thenReturn(0L);

        ConflictException ex = assertThrows(ConflictException.class, () ->
                userService.updateUserStatus(1L, UserStatus.SUSPENDED, "otheradmin", "127.0.0.1", "JUnit")
        );

        assertTrue(ex.getMessage().contains("Cannot deactivate or suspend the last active administrator"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should protect last active admin from role demotion")
    void testLastAdminProtection_DemoteLastAdmin_ThrowsConflict() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.countOtherActiveAdmins(any())).thenReturn(0L);

        UpdateUserRolesRequest request = new UpdateUserRolesRequest(Collections.singleton("FACULTY"));

        ConflictException ex = assertThrows(ConflictException.class, () ->
                userService.updateUserRoles(1L, request, "otheradmin", "127.0.0.1", "JUnit")
        );

        assertTrue(ex.getMessage().contains("Cannot remove ADMIN role from the last active administrator"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should update user profile successfully when validations pass")
    void testUpdateUser_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateUserRequest request = new UpdateUserRequest();
        request.setEmail("admin.updated@ahrao.edu");
        request.setFirstName("UpdatedFirst");
        request.setLastName("UpdatedLast");
        request.setPhone("+91 99999 88888");

        when(userRepository.existsByEmail("admin.updated@ahrao.edu")).thenReturn(false);

        UserSummaryResponse response = userService.updateUser(1L, request, "otheradmin", "127.0.0.1", "JUnit");

        assertNotNull(response);
        assertEquals("UpdatedFirst", response.getFirstName());
        assertEquals("UpdatedLast", response.getLastName());
        assertEquals("admin.updated@ahrao.edu", response.getEmail());
        verify(auditLogRepository).save(any());
    }

    @Test
    @DisplayName("Should reset password securely and never expose password in response")
    void testResetPassword_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.encode("NewSecretKey99#")).thenReturn("$2a$10$newHashValueEncoded");

        userService.resetUserPassword(1L, "NewSecretKey99#", "superadmin", "127.0.0.1", "JUnit");

        verify(passwordEncoder).encode("NewSecretKey99#");
        verify(userRepository).save(sampleUser);
        verify(auditLogRepository).save(any());
    }
}
