package com.ahrao.service.impl;

import com.ahrao.dto.auth.CurrentUserResponse;
import com.ahrao.dto.auth.LoginRequest;
import com.ahrao.dto.auth.LoginResponse;
import com.ahrao.dto.auth.RegisterRequest;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.user.RoleRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.security.JwtTokenProvider;
import com.ahrao.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            AuditLogRepository auditLogRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request, String ipAddress, String userAgent) {
        String identifier = request.getUsernameOrEmail().trim();

        // 1. Find User by username or email with roles & permissions
        Optional<User> userOpt = userRepository.findByIdentifierWithRoles(identifier);
        if (userOpt.isEmpty()) {
            recordAuditLog(null, "LOGIN_FAILURE", "USER", null, "Failed login attempt for nonexistent identifier: " + identifier, ipAddress, userAgent);
            throw new BadCredentialsException("Invalid username or password");
        }

        User user = userOpt.get();

        // 2. Account Status Validation
        if (user.getStatus() == UserStatus.SUSPENDED) {
            recordAuditLog(user, "LOGIN_BLOCKED_SUSPENDED", "USER", user.getId(), "Login attempted on suspended account", ipAddress, userAgent);
            throw new LockedException("Account has been suspended. Please contact the administrator.");
        }

        if (user.getStatus() == UserStatus.INACTIVE) {
            recordAuditLog(user, "LOGIN_BLOCKED_INACTIVE", "USER", user.getId(), "Login attempted on inactive account", ipAddress, userAgent);
            throw new DisabledException("Account is currently inactive. Please contact your department.");
        }

        if (user.getStatus() == UserStatus.PENDING) {
            recordAuditLog(user, "LOGIN_BLOCKED_PENDING", "USER", user.getId(), "Login attempted on pending approval account", ipAddress, userAgent);
            throw new DisabledException("Account is pending approval. You will be notified once activated.");
        }

        // 3. BCrypt Password Verification
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            recordAuditLog(user, "LOGIN_FAILURE_BAD_CREDENTIALS", "USER", user.getId(), "Bad credentials entered", ipAddress, userAgent);
            throw new BadCredentialsException("Invalid username or password");
        }

        // 4. Update Last Login Timestamp
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        // 5. Generate JWT Token
        CustomUserDetails userDetails = CustomUserDetails.build(user);
        String token = tokenProvider.generateTokenFromUserDetails(userDetails);

        // 6. Extract Roles & Permissions Strings
        List<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        List<String> permissionNames = user.getRoles().stream()
                .filter(r -> r.getPermissions() != null)
                .flatMap(r -> r.getPermissions().stream())
                .map(com.ahrao.entity.user.Permission::getName)
                .distinct()
                .collect(Collectors.toList());

        // 7. Record Login Success in Audit Log
        recordAuditLog(user, "LOGIN_SUCCESS", "USER", user.getId(), "Successful user authentication", ipAddress, userAgent);

        return new LoginResponse(
                token,
                tokenProvider.getJwtExpirationMs(),
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                roleNames,
                permissionNames,
                user.getStatus()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public CurrentUserResponse getCurrentUser(String username) {
        User user = userRepository.findByIdentifierWithRoles(username)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user session is no longer valid"));

        List<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        List<String> permissionNames = user.getRoles().stream()
                .filter(r -> r.getPermissions() != null)
                .flatMap(r -> r.getPermissions().stream())
                .map(com.ahrao.entity.user.Permission::getName)
                .distinct()
                .collect(Collectors.toList());

        return new CurrentUserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                roleNames,
                permissionNames,
                user.getStatus(),
                user.getLastLoginAt()
        );
    }

    @Override
    @Transactional
    public CurrentUserResponse register(RegisterRequest request, String ipAddress, String userAgent) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsername(username)) {
            throw new ConflictException("Username is already taken: " + username);
        }

        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email address is already registered: " + email);
        }

        // Determine requested role (default to STUDENT if not provided or invalid)
        String roleName = request.getRole() != null ? request.getRole().trim().toUpperCase() : "STUDENT";
        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.findByName("STUDENT")
                        .orElseThrow(() -> new BadRequestException("Role not found in database: " + roleName)));

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPhone(request.getPhone());
        user.setStatus(UserStatus.ACTIVE);
        user.setRoles(new HashSet<>(Collections.singletonList(role)));

        User savedUser = userRepository.save(user);

        recordAuditLog(savedUser, "USER_REGISTER", "USER", savedUser.getId(), "New user registered with role: " + role.getName(), ipAddress, userAgent);

        return getCurrentUser(savedUser.getUsername());
    }

    @Override
    @Transactional
    public void logout(String username, String ipAddress, String userAgent) {
        userRepository.findByUsername(username).ifPresent(user ->
                recordAuditLog(user, "LOGOUT", "USER", user.getId(), "User logged out", ipAddress, userAgent)
        );
    }

    private void recordAuditLog(
            User user,
            String action,
            String entityType,
            Long entityId,
            String description,
            String ipAddress,
            String userAgent) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setUser(user);
            auditLog.setAction(action);
            auditLog.setEntityType(entityType);
            auditLog.setEntityId(entityId);
            auditLog.setNewValue(description);
            auditLog.setIpAddress(ipAddress);
            auditLog.setUserAgent(userAgent);
            auditLog.setCreatedAt(Instant.now());
            auditLogRepository.save(auditLog);
        } catch (Exception ex) {
            logger.warn("Could not write audit log entry: {}", ex.getMessage());
        }
    }
}
