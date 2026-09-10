package com.ahrao.service.impl;

import com.ahrao.dto.auth.ChangePasswordRequest;
import com.ahrao.dto.auth.UpdateProfileRequest;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.user.CreateUserRequest;
import com.ahrao.dto.user.UpdateUserRequest;
import com.ahrao.dto.user.UpdateUserRolesRequest;
import com.ahrao.dto.user.UserSummaryResponse;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.entity.user.Permission;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.user.RoleRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.UserService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            AuditLogRepository auditLogRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserSummaryResponse> getUsers(String search, String roleFilter, UserStatus statusFilter, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("username")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(cb.lower(root.get("firstName")), pattern),
                        cb.like(cb.lower(root.get("lastName")), pattern)
                ));
            }

            if (roleFilter != null && !roleFilter.isBlank() && !"ALL".equalsIgnoreCase(roleFilter.trim())) {
                Join<User, Role> roleJoin = root.join("roles", JoinType.INNER);
                predicates.add(cb.equal(cb.upper(roleJoin.get("name")), roleFilter.trim().toUpperCase()));
            }

            if (statusFilter != null) {
                predicates.add(cb.equal(root.get("status"), statusFilter));
            }

            if (!Long.class.equals(query.getResultType()) && !long.class.equals(query.getResultType())) {
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> userPage = userRepository.findAll(spec, pageable);

        List<UserSummaryResponse> content = userPage.getContent().stream()
                .map(this::mapToSummaryResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                userPage.getNumber(),
                userPage.getSize(),
                userPage.getTotalElements(),
                userPage.getTotalPages(),
                userPage.isFirst(),
                userPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getAllUsers(String search, String roleFilter, UserStatus statusFilter) {
        List<User> users = userRepository.findAllWithRoles();

        return users.stream()
                .filter(u -> {
                    if (search != null && !search.isBlank()) {
                        String query = search.trim().toLowerCase();
                        boolean matchName = (u.getFirstName() + " " + u.getLastName()).toLowerCase().contains(query);
                        boolean matchUser = u.getUsername().toLowerCase().contains(query);
                        boolean matchEmail = u.getEmail().toLowerCase().contains(query);
                        if (!matchName && !matchUser && !matchEmail) {
                            return false;
                        }
                    }
                    if (roleFilter != null && !roleFilter.isBlank() && !"ALL".equalsIgnoreCase(roleFilter.trim())) {
                        boolean matchRole = u.getRoles().stream()
                                .anyMatch(r -> r.getName().equalsIgnoreCase(roleFilter.trim()));
                        if (!matchRole) {
                            return false;
                        }
                    }
                    if (statusFilter != null) {
                        if (u.getStatus() != statusFilter) {
                            return false;
                        }
                    }
                    return true;
                })
                .map(this::mapToSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserSummaryResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToSummaryResponse(user);
    }

    @Override
    @Transactional
    public UserSummaryResponse createUser(CreateUserRequest request, String adminUsername, String ipAddress, String userAgent) {
        if (userRepository.existsByUsername(request.getUsername().trim())) {
            throw new ConflictException("Username '" + request.getUsername() + "' is already registered");
        }
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new ConflictException("Email '" + request.getEmail() + "' is already registered");
        }

        Set<Role> roles = new HashSet<>();
        for (String roleName : request.getRoles()) {
            Role role = roleRepository.findByName(roleName.toUpperCase())
                    .orElseThrow(() -> new BadRequestException("Role '" + roleName + "' does not exist"));
            roles.add(role);
        }

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        user.setStatus(request.getStatus() != null ? request.getStatus() : UserStatus.ACTIVE);
        user.setRoles(roles);

        User savedUser = userRepository.save(user);

        User adminUser = adminUsername != null ? userRepository.findByUsername(adminUsername).orElse(null) : null;
        recordAuditLog(adminUser, "USER_CREATED", "USER", savedUser.getId(), null,
                "Provisioned user " + savedUser.getUsername() + " with roles " + request.getRoles(), ipAddress, userAgent);

        return mapToSummaryResponse(savedUser);
    }

    @Override
    @Transactional
    public UserSummaryResponse updateUser(Long id, UpdateUserRequest request, String adminUsername, String ipAddress, String userAgent) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        String newEmail = request.getEmail().trim().toLowerCase();
        if (!newEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
            throw new ConflictException("Email '" + newEmail + "' is already registered to another user");
        }

        String oldSummary = String.format("Status: %s, Roles: %s, Name: %s %s",
                user.getStatus(),
                user.getRoles().stream().map(Role::getName).collect(Collectors.joining(",")),
                user.getFirstName(),
                user.getLastName());

        // Validate status changes if supplied
        if (request.getStatus() != null && request.getStatus() != user.getStatus()) {
            validateStatusChange(user, request.getStatus(), adminUsername);
            user.setStatus(request.getStatus());
        }

        // Validate roles changes if supplied
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            validateRoleChange(user, request.getRoles(), adminUsername);
            Set<Role> roles = new HashSet<>();
            for (String roleName : request.getRoles()) {
                Role role = roleRepository.findByName(roleName.toUpperCase())
                        .orElseThrow(() -> new BadRequestException("Role '" + roleName + "' does not exist"));
                roles.add(role);
            }
            user.setRoles(roles);
        }

        user.setEmail(newEmail);
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);

        User updated = userRepository.save(user);

        String newSummary = String.format("Status: %s, Roles: %s, Name: %s %s",
                updated.getStatus(),
                updated.getRoles().stream().map(Role::getName).collect(Collectors.joining(",")),
                updated.getFirstName(),
                updated.getLastName());

        User adminUser = adminUsername != null ? userRepository.findByUsername(adminUsername).orElse(null) : null;
        recordAuditLog(adminUser, "USER_UPDATED", "USER", updated.getId(),
                oldSummary, newSummary, ipAddress, userAgent);

        return mapToSummaryResponse(updated);
    }

    @Override
    @Transactional
    public UserSummaryResponse updateUserStatus(Long id, UserStatus newStatus, String adminUsername, String ipAddress, String userAgent) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        validateStatusChange(user, newStatus, adminUsername);

        UserStatus oldStatus = user.getStatus();
        user.setStatus(newStatus);
        User updated = userRepository.save(user);

        User adminUser = adminUsername != null ? userRepository.findByUsername(adminUsername).orElse(null) : null;
        recordAuditLog(adminUser, "USER_STATUS_UPDATED", "USER", updated.getId(),
                "Status: " + oldStatus, "Status: " + newStatus, ipAddress, userAgent);

        return mapToSummaryResponse(updated);
    }

    @Override
    @Transactional
    public UserSummaryResponse updateUserRoles(Long id, UpdateUserRolesRequest request, String adminUsername, String ipAddress, String userAgent) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        validateRoleChange(user, request.getRoles(), adminUsername);

        String oldRoles = user.getRoles().stream().map(Role::getName).collect(Collectors.joining(","));

        Set<Role> roles = new HashSet<>();
        for (String roleName : request.getRoles()) {
            Role role = roleRepository.findByName(roleName.toUpperCase())
                    .orElseThrow(() -> new BadRequestException("Role '" + roleName + "' does not exist"));
            roles.add(role);
        }

        user.setRoles(roles);
        User updated = userRepository.save(user);

        String newRoles = updated.getRoles().stream().map(Role::getName).collect(Collectors.joining(","));

        User adminUser = adminUsername != null ? userRepository.findByUsername(adminUsername).orElse(null) : null;
        recordAuditLog(adminUser, "USER_ROLES_UPDATED", "USER", updated.getId(),
                "Roles: [" + oldRoles + "]", "Roles: [" + newRoles + "]", ipAddress, userAgent);

        return mapToSummaryResponse(updated);
    }

    @Override
    @Transactional
    public void resetUserPassword(Long id, String newPassword, String adminUsername, String ipAddress, String userAgent) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        User adminUser = adminUsername != null ? userRepository.findByUsername(adminUsername).orElse(null) : null;
        recordAuditLog(adminUser, "ADMIN_PASSWORD_RESET", "USER", user.getId(), null,
                "Password reset by administrator for username: " + user.getUsername(), ipAddress, userAgent);
    }

    @Override
    @Transactional
    public void changePassword(String username, ChangePasswordRequest request, String ipAddress, String userAgent) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        recordAuditLog(user, "USER_PASSWORD_CHANGED", "USER", user.getId(), null,
                "User changed account password", ipAddress, userAgent);
    }

    @Override
    @Transactional
    public UserSummaryResponse updateProfile(String username, UpdateProfileRequest request, String ipAddress, String userAgent) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        String newEmail = request.getEmail().trim().toLowerCase();
        if (!newEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
            throw new ConflictException("Email '" + newEmail + "' is already registered to another user");
        }

        String oldDetails = String.format("%s %s <%s>, Phone: %s", user.getFirstName(), user.getLastName(), user.getEmail(), user.getPhone());

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(newEmail);
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);

        User updated = userRepository.save(user);

        String newDetails = String.format("%s %s <%s>, Phone: %s", updated.getFirstName(), updated.getLastName(), updated.getEmail(), updated.getPhone());

        recordAuditLog(user, "USER_PROFILE_UPDATED", "USER", user.getId(), oldDetails, newDetails, ipAddress, userAgent);

        return mapToSummaryResponse(updated);
    }

    private void validateStatusChange(User targetUser, UserStatus newStatus, String adminUsername) {
        // 1. Self-lockout check: an admin cannot deactivate or suspend their own account
        if (adminUsername != null && adminUsername.equalsIgnoreCase(targetUser.getUsername())) {
            if (newStatus == UserStatus.INACTIVE || newStatus == UserStatus.SUSPENDED) {
                throw new ConflictException("Action rejected: Administrators cannot deactivate or suspend their own account");
            }
        }

        // 2. Last active admin check: cannot disable the last active ADMIN account
        boolean isCurrentlyAdmin = targetUser.getRoles().stream()
                .anyMatch(r -> "ADMIN".equalsIgnoreCase(r.getName()) || "ROLE_ADMIN".equalsIgnoreCase(r.getName()));

        if (isCurrentlyAdmin && targetUser.getStatus() == UserStatus.ACTIVE && newStatus != UserStatus.ACTIVE) {
            long otherActiveAdmins = userRepository.countOtherActiveAdmins(targetUser.getId());
            if (otherActiveAdmins == 0) {
                throw new ConflictException("Action rejected: Cannot deactivate or suspend the last active administrator");
            }
        }
    }

    private void validateRoleChange(User targetUser, Set<String> newRoleNames, String adminUsername) {
        boolean hadAdmin = targetUser.getRoles().stream()
                .anyMatch(r -> "ADMIN".equalsIgnoreCase(r.getName()) || "ROLE_ADMIN".equalsIgnoreCase(r.getName()));

        boolean willHaveAdmin = newRoleNames != null && newRoleNames.stream()
                .anyMatch(r -> "ADMIN".equalsIgnoreCase(r) || "ROLE_ADMIN".equalsIgnoreCase(r));

        if (hadAdmin && !willHaveAdmin) {
            // 1. Self-demotion check
            if (adminUsername != null && adminUsername.equalsIgnoreCase(targetUser.getUsername())) {
                throw new ConflictException("Action rejected: Administrators cannot remove the ADMIN role from their own account");
            }

            // 2. Last active admin check
            if (targetUser.getStatus() == UserStatus.ACTIVE) {
                long otherActiveAdmins = userRepository.countOtherActiveAdmins(targetUser.getId());
                if (otherActiveAdmins == 0) {
                    throw new ConflictException("Action rejected: Cannot remove ADMIN role from the last active administrator");
                }
            }
        }
    }

    private UserSummaryResponse mapToSummaryResponse(User user) {
        List<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .sorted()
                .collect(Collectors.toList());

        List<String> permissions = user.getRoles().stream()
                .flatMap(r -> r.getPermissions().stream())
                .map(Permission::getName)
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        return new UserSummaryResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getStatus(),
                roleNames,
                permissions,
                user.getCreatedAt(),
                user.getUpdatedAt(),
                user.getLastLoginAt()
        );
    }

    private void recordAuditLog(
            User user,
            String action,
            String entityType,
            Long entityId,
            String oldValue,
            String newValue,
            String ipAddress,
            String userAgent) {
        try {
            AuditLog log = new AuditLog();
            log.setUser(user);
            log.setAction(action);
            log.setEntityType(entityType);
            log.setEntityId(entityId);
            log.setOldValue(oldValue);
            log.setNewValue(newValue);
            log.setIpAddress(ipAddress);
            log.setUserAgent(userAgent);
            log.setCreatedAt(Instant.now());
            auditLogRepository.save(log);
        } catch (Exception ex) {
            logger.error("Failed to record audit log for action: {}", action, ex);
        }
    }
}
