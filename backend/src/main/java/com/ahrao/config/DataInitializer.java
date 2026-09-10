package com.ahrao.config;

import com.ahrao.entity.enums.UserStatus;
import com.ahrao.entity.user.Permission;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.repository.user.PermissionRepository;
import com.ahrao.repository.user.RoleRepository;
import com.ahrao.repository.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Idempotent seed initializer for baseline roles, permissions, and development test accounts.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        initializeRolesAndPermissions();
        initializeDevUsers();
    }

    private void initializeRolesAndPermissions() {
        // Ensure standard 6 roles exist
        List<String> requiredRoles = Arrays.asList(
                "ADMIN", "PRINCIPAL", "HOD", "FACULTY", "STUDENT", "WARDEN"
        );

        for (String roleName : requiredRoles) {
            if (!roleRepository.existsByName(roleName)) {
                Role role = new Role(roleName, "Standard " + roleName + " platform role");
                roleRepository.save(role);
            }
        }

        // Ensure baseline permissions exist
        Map<String, String> standardPermissions = new HashMap<>();
        standardPermissions.put("USER_READ", "Read user directory");
        standardPermissions.put("USER_WRITE", "Create and update users");
        standardPermissions.put("ACADEMIC_READ", "Read academic schedules and resources");
        standardPermissions.put("ACADEMIC_ALLOCATE", "Allocate academic classrooms and labs");
        standardPermissions.put("HOSTEL_READ", "Read hostel buildings and occupancy");
        standardPermissions.put("HOSTEL_ALLOCATE", "Allocate hostel beds and manage residents");
        standardPermissions.put("APPROVAL_MANAGE", "Approve and review resource requests");
        standardPermissions.put("SYSTEM_ADMIN", "Manage system configurations and audit logs");

        for (Map.Entry<String, String> entry : standardPermissions.entrySet()) {
            if (!permissionRepository.existsByName(entry.getKey())) {
                Permission permission = new Permission(entry.getKey(), entry.getValue());
                permissionRepository.save(permission);
            }
        }

        // Link permissions to roles idempotently
        linkRolePermissions();
    }

    private void linkRolePermissions() {
        roleRepository.findByName("ADMIN").ifPresent(adminRole -> {
            if (adminRole.getPermissions() == null || adminRole.getPermissions().isEmpty()) {
                adminRole.setPermissions(new HashSet<>(permissionRepository.findAll()));
                roleRepository.save(adminRole);
            }
        });

        roleRepository.findByName("PRINCIPAL").ifPresent(role -> {
            if (role.getPermissions() == null || role.getPermissions().isEmpty()) {
                Set<Permission> perms = new HashSet<>();
                addPerm(perms, "USER_READ", "ACADEMIC_READ", "HOSTEL_READ", "APPROVAL_MANAGE");
                role.setPermissions(perms);
                roleRepository.save(role);
            }
        });

        roleRepository.findByName("HOD").ifPresent(role -> {
            if (role.getPermissions() == null || role.getPermissions().isEmpty()) {
                Set<Permission> perms = new HashSet<>();
                addPerm(perms, "USER_READ", "ACADEMIC_READ", "ACADEMIC_ALLOCATE", "APPROVAL_MANAGE");
                role.setPermissions(perms);
                roleRepository.save(role);
            }
        });

        roleRepository.findByName("FACULTY").ifPresent(role -> {
            if (role.getPermissions() == null || role.getPermissions().isEmpty()) {
                Set<Permission> perms = new HashSet<>();
                addPerm(perms, "ACADEMIC_READ");
                role.setPermissions(perms);
                roleRepository.save(role);
            }
        });

        roleRepository.findByName("STUDENT").ifPresent(role -> {
            if (role.getPermissions() == null || role.getPermissions().isEmpty()) {
                Set<Permission> perms = new HashSet<>();
                addPerm(perms, "ACADEMIC_READ", "HOSTEL_READ");
                role.setPermissions(perms);
                roleRepository.save(role);
            }
        });

        roleRepository.findByName("WARDEN").ifPresent(role -> {
            if (role.getPermissions() == null || role.getPermissions().isEmpty()) {
                Set<Permission> perms = new HashSet<>();
                addPerm(perms, "HOSTEL_READ", "HOSTEL_ALLOCATE", "APPROVAL_MANAGE");
                role.setPermissions(perms);
                roleRepository.save(role);
            }
        });
    }

    private void addPerm(Set<Permission> perms, String... names) {
        for (String name : names) {
            permissionRepository.findByName(name).ifPresent(perms::add);
        }
    }

    private void initializeDevUsers() {
        createDevUserIfMissing("admin", "admin@ahrao.edu", "Admin@123", "System", "Administrator", "ADMIN", UserStatus.ACTIVE);
        createDevUserIfMissing("principal", "principal@ahrao.edu", "Principal@123", "Margaret", "Sterling", "PRINCIPAL", UserStatus.ACTIVE);
        createDevUserIfMissing("hod_cs", "hod.cs@ahrao.edu", "Hod@123", "Rajesh", "Sharma", "HOD", UserStatus.ACTIVE);
        createDevUserIfMissing("faculty_john", "faculty@ahrao.edu", "Faculty@123", "Elena", "Rostova", "FACULTY", UserStatus.ACTIVE);
        createDevUserIfMissing("student_alex", "student@ahrao.edu", "Student@123", "Aiden", "Brooks", "STUDENT", UserStatus.ACTIVE);
        createDevUserIfMissing("warden_smith", "warden@ahrao.edu", "Warden@123", "Marcus", "Cole", "WARDEN", UserStatus.ACTIVE);

        // Security test users with non-active statuses
        createDevUserIfMissing("suspended_user", "suspended@ahrao.edu", "Suspended@123", "Suspended", "Account", "STUDENT", UserStatus.SUSPENDED);
        createDevUserIfMissing("inactive_user", "inactive@ahrao.edu", "Inactive@123", "Inactive", "Account", "STUDENT", UserStatus.INACTIVE);
    }

    private void createDevUserIfMissing(
            String username,
            String email,
            String rawPassword,
            String firstName,
            String lastName,
            String roleName,
            UserStatus status) {

        if (!userRepository.existsByUsername(username)) {
            Role role = roleRepository.findByName(roleName).orElse(null);
            if (role != null) {
                User user = new User();
                user.setUsername(username);
                user.setEmail(email);
                user.setPasswordHash(passwordEncoder.encode(rawPassword));
                user.setFirstName(firstName);
                user.setLastName(lastName);
                user.setStatus(status);
                user.setRoles(new HashSet<>(Collections.singletonList(role)));
                userRepository.save(user);
                logger.info("Initialized test account: username='{}', role='{}', status='{}'", username, roleName, status);
            }
        }
    }
}
