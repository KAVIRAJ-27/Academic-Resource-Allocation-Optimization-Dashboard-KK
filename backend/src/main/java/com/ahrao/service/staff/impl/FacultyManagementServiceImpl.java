package com.ahrao.service.staff.impl;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.staff.CreateFacultyRequest;
import com.ahrao.dto.staff.FacultyDetailsResponse;
import com.ahrao.dto.staff.FacultySummaryResponse;
import com.ahrao.dto.staff.UpdateFacultyRequest;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Faculty;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.DepartmentRepository;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.user.RoleRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.staff.FacultyManagementService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacultyManagementServiceImpl implements FacultyManagementService {

    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public FacultyManagementServiceImpl(
            FacultyRepository facultyRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            DepartmentRepository departmentRepository,
            AuditLogRepository auditLogRepository,
            PasswordEncoder passwordEncoder) {
        this.facultyRepository = facultyRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.departmentRepository = departmentRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<FacultySummaryResponse> getFaculty(
            String search,
            Long departmentId,
            String status,
            Pageable pageable) {

        Specification<Faculty> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                var userJoin = root.join("user");
                var deptJoin = root.join("department");
                Predicate empIdMatch = cb.like(cb.lower(root.get("employeeId")), term);
                Predicate designationMatch = cb.like(cb.lower(root.get("designation")), term);
                Predicate usernameMatch = cb.like(cb.lower(userJoin.get("username")), term);
                Predicate emailMatch = cb.like(cb.lower(userJoin.get("email")), term);
                Predicate firstNameMatch = cb.like(cb.lower(userJoin.get("firstName")), term);
                Predicate lastNameMatch = cb.like(cb.lower(userJoin.get("lastName")), term);
                Predicate deptNameMatch = cb.like(cb.lower(deptJoin.get("name")), term);
                Predicate deptCodeMatch = cb.like(cb.lower(deptJoin.get("code")), term);

                predicates.add(cb.or(empIdMatch, designationMatch, usernameMatch, emailMatch, firstNameMatch, lastNameMatch, deptNameMatch, deptCodeMatch));
            }

            if (departmentId != null) {
                predicates.add(cb.equal(root.get("department").get("id"), departmentId));
            }

            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Faculty> page = facultyRepository.findAll(spec, pageable);

        List<FacultySummaryResponse> content = page.getContent().stream()
                .map(this::mapToSummary)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyDetailsResponse getFacultyById(Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + id));
        return mapToDetails(faculty);
    }

    @Override
    @Transactional
    public FacultySummaryResponse createFaculty(
            CreateFacultyRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        String employeeId = request.getEmployeeId().trim().toUpperCase();
        if (facultyRepository.existsByEmployeeId(employeeId)) {
            throw new ConflictException("Employee ID '" + employeeId + "' already exists.");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        User user;
        boolean isNewUser = false;

        Role facultyRole = roleRepository.findByName("FACULTY")
                .orElseThrow(() -> new ResourceNotFoundException("Role 'FACULTY' not configured in system."));

        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + request.getUserId()));

            if (facultyRepository.existsByUserId(request.getUserId())) {
                throw new ConflictException("User @" + user.getUsername() + " is already linked to a faculty record.");
            }

            if (user.getRoles() == null) {
                user.setRoles(new HashSet<>());
            }
            user.getRoles().add(facultyRole);
            user = userRepository.save(user);
        } else {
            String username = request.getUsername().trim().toLowerCase();
            String email = request.getEmail().trim().toLowerCase();

            if (userRepository.existsByUsername(username)) {
                throw new ConflictException("Username '" + username + "' is already registered.");
            }
            if (userRepository.existsByEmail(email)) {
                throw new ConflictException("Email '" + email + "' is already registered.");
            }

            user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setFirstName(request.getFirstName().trim());
            user.setLastName(request.getLastName().trim());
            user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
            user.setStatus(UserStatus.ACTIVE);
            user.setRoles(new HashSet<>(List.of(facultyRole)));
            user = userRepository.save(user);
            isNewUser = true;

            logAudit(adminUsername, "USER_CREATED", "User", user.getId(), null,
                    "{\"username\":\"" + username + "\",\"role\":\"FACULTY\"}", ipAddress, userAgent);
        }

        Faculty faculty = new Faculty();
        faculty.setUser(user);
        faculty.setDepartment(department);
        faculty.setEmployeeId(employeeId);
        faculty.setDesignation(request.getDesignation().trim());
        faculty.setQualification(request.getQualification() != null ? request.getQualification().trim() : null);
        faculty.setJoiningDate(request.getJoiningDate());
        faculty.setStatus(request.getStatus() != null ? request.getStatus().trim().toUpperCase() : "ACTIVE");

        Faculty saved = facultyRepository.save(faculty);

        logAudit(adminUsername, "FACULTY_CREATED", "Faculty", saved.getId(), null,
                "{\"employeeId\":\"" + saved.getEmployeeId() + "\",\"department\":\"" + department.getCode() + "\"}",
                ipAddress, userAgent);

        return mapToSummary(saved);
    }

    @Override
    @Transactional
    public FacultySummaryResponse updateFaculty(
            Long id,
            UpdateFacultyRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + id));

        String newEmpId = request.getEmployeeId().trim().toUpperCase();
        if (facultyRepository.existsByEmployeeIdAndIdNot(newEmpId, id)) {
            throw new ConflictException("Employee ID '" + newEmpId + "' is already in use by another faculty member.");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        faculty.setEmployeeId(newEmpId);
        faculty.setDepartment(department);
        faculty.setDesignation(request.getDesignation().trim());
        faculty.setQualification(request.getQualification() != null ? request.getQualification().trim() : null);
        faculty.setJoiningDate(request.getJoiningDate());
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            faculty.setStatus(request.getStatus().trim().toUpperCase());
        }

        // Update editable user attributes
        User user = faculty.getUser();
        if (user != null) {
            if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
                String newEmail = request.getEmail().trim().toLowerCase();
                if (!newEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                    throw new ConflictException("Email '" + newEmail + "' is already registered to another account.");
                }
                user.setEmail(newEmail);
            }
            if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty()) {
                user.setFirstName(request.getFirstName().trim());
            }
            if (request.getLastName() != null && !request.getLastName().trim().isEmpty()) {
                user.setLastName(request.getLastName().trim());
            }
            if (request.getPhone() != null) {
                user.setPhone(request.getPhone().trim());
            }
            userRepository.save(user);
        }

        Faculty updated = facultyRepository.save(faculty);

        logAudit(adminUsername, "FACULTY_UPDATED", "Faculty", updated.getId(), null,
                "{\"employeeId\":\"" + updated.getEmployeeId() + "\",\"department\":\"" + department.getCode() + "\"}",
                ipAddress, userAgent);

        return mapToSummary(updated);
    }

    @Override
    @Transactional
    public FacultySummaryResponse updateFacultyStatus(
            Long id,
            String status,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + id));

        String oldStatus = faculty.getStatus();
        String newStatus = status.trim().toUpperCase();
        faculty.setStatus(newStatus);

        Faculty updated = facultyRepository.save(faculty);

        logAudit(adminUsername, "FACULTY_STATUS_CHANGED", "Faculty", updated.getId(),
                "{\"status\":\"" + oldStatus + "\"}",
                "{\"status\":\"" + newStatus + "\"}",
                ipAddress, userAgent);

        return mapToSummary(updated);
    }

    private FacultySummaryResponse mapToSummary(Faculty f) {
        User u = f.getUser();
        Department d = f.getDepartment();

        return new FacultySummaryResponse(
                f.getId(),
                u != null ? u.getId() : null,
                u != null ? u.getUsername() : "N/A",
                u != null ? u.getEmail() : "N/A",
                u != null ? u.getFirstName() : "",
                u != null ? u.getLastName() : "",
                u != null ? u.getPhone() : null,
                u != null ? u.getStatus() : null,
                d != null ? d.getId() : null,
                d != null ? d.getName() : "N/A",
                d != null ? d.getCode() : "N/A",
                f.getEmployeeId(),
                f.getDesignation(),
                f.getQualification(),
                f.getJoiningDate(),
                f.getStatus(),
                f.getCreatedAt(),
                f.getUpdatedAt()
        );
    }

    private FacultyDetailsResponse mapToDetails(Faculty f) {
        User u = f.getUser();
        Department d = f.getDepartment();

        FacultyDetailsResponse details = new FacultyDetailsResponse();
        details.setId(f.getId());
        details.setEmployeeId(f.getEmployeeId());
        details.setDesignation(f.getDesignation());
        details.setQualification(f.getQualification());
        details.setJoiningDate(f.getJoiningDate());
        details.setStatus(f.getStatus());
        details.setCreatedAt(f.getCreatedAt());
        details.setUpdatedAt(f.getUpdatedAt());

        if (u != null) {
            details.setUserId(u.getId());
            details.setUsername(u.getUsername());
            details.setEmail(u.getEmail());
            details.setFirstName(u.getFirstName());
            details.setLastName(u.getLastName());
            details.setPhone(u.getPhone());
            details.setUserStatus(u.getStatus());
            details.setRoles(u.getRoles() != null ? u.getRoles().stream().map(Role::getName).collect(Collectors.toList()) : List.of());
            details.setUserLastLoginAt(u.getLastLoginAt());
        }

        if (d != null) {
            details.setDepartmentId(d.getId());
            details.setDepartmentName(d.getName());
            details.setDepartmentCode(d.getCode());
            details.setDepartmentDescription(d.getDescription());
        }

        return details;
    }

    private void logAudit(String adminUsername, String action, String entityType, Long entityId,
                          String oldValue, String newValue, String ipAddress, String userAgent) {
        AuditLog log = new AuditLog();
        userRepository.findByUsername(adminUsername).ifPresent(log::setUser);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        log.setCreatedAt(Instant.now());
        auditLogRepository.save(log);
    }
}
