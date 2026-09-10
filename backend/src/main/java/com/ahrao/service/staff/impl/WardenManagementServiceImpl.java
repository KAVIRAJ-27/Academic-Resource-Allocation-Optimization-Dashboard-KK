package com.ahrao.service.staff.impl;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.staff.CreateWardenRequest;
import com.ahrao.dto.staff.UpdateWardenRequest;
import com.ahrao.dto.staff.WardenDetailsResponse;
import com.ahrao.dto.staff.WardenHostelAssignmentRequest;
import com.ahrao.dto.staff.WardenSummaryResponse;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.hostel.Warden;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.hostel.HostelRepository;
import com.ahrao.repository.hostel.WardenRepository;
import com.ahrao.repository.user.RoleRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.staff.WardenManagementService;
import jakarta.persistence.criteria.Join;
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
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class WardenManagementServiceImpl implements WardenManagementService {

    private final WardenRepository wardenRepository;
    private final HostelRepository hostelRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public WardenManagementServiceImpl(
            WardenRepository wardenRepository,
            HostelRepository hostelRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            AuditLogRepository auditLogRepository,
            PasswordEncoder passwordEncoder) {
        this.wardenRepository = wardenRepository;
        this.hostelRepository = hostelRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<WardenSummaryResponse> getWardens(
            String search,
            Long hostelId,
            String status,
            Pageable pageable) {

        Specification<Warden> spec = (root, query, cb) -> {
            query.distinct(true);
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                var userJoin = root.join("user");

                Predicate empIdMatch = cb.like(cb.lower(root.get("employeeId")), term);
                Predicate contactMatch = cb.like(cb.lower(root.get("contactNumber")), term);
                Predicate usernameMatch = cb.like(cb.lower(userJoin.get("username")), term);
                Predicate firstNameMatch = cb.like(cb.lower(userJoin.get("firstName")), term);
                Predicate lastNameMatch = cb.like(cb.lower(userJoin.get("lastName")), term);
                Predicate emailMatch = cb.like(cb.lower(userJoin.get("email")), term);

                predicates.add(cb.or(empIdMatch, contactMatch, usernameMatch, firstNameMatch, lastNameMatch, emailMatch));
            }

            if (hostelId != null) {
                Join<Warden, Hostel> hostelJoin = root.join("assignedHostels");
                predicates.add(cb.equal(hostelJoin.get("id"), hostelId));
            }

            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Warden> page = wardenRepository.findAll(spec, pageable);

        List<WardenSummaryResponse> content = page.getContent().stream()
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
    public WardenDetailsResponse getWardenById(Long id) {
        Warden warden = wardenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warden not found with ID: " + id));
        return mapToDetails(warden);
    }

    @Override
    @Transactional
    public WardenSummaryResponse createWarden(
            CreateWardenRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        String employeeId = request.getEmployeeId().trim().toUpperCase();
        if (wardenRepository.existsByEmployeeId(employeeId)) {
            throw new ConflictException("Employee ID '" + employeeId + "' already exists.");
        }

        User user;
        boolean isNewUser = false;

        Role wardenRole = roleRepository.findByName("WARDEN")
                .orElseThrow(() -> new ResourceNotFoundException("Role 'WARDEN' not configured in system."));

        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + request.getUserId()));

            if (wardenRepository.existsByUserId(request.getUserId())) {
                throw new ConflictException("User @" + user.getUsername() + " is already linked to a warden record.");
            }

            if (user.getRoles() == null) {
                user.setRoles(new HashSet<>());
            }
            user.getRoles().add(wardenRole);
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
            user.setStatus(UserStatus.ACTIVE);
            user.setRoles(new HashSet<>(List.of(wardenRole)));
            user = userRepository.save(user);
            isNewUser = true;

            logAudit(adminUsername, "USER_CREATED", "User", user.getId(), null,
                    "{\"username\":\"" + username + "\",\"role\":\"WARDEN\"}", ipAddress, userAgent);
        }

        Warden warden = new Warden();
        warden.setUser(user);
        warden.setEmployeeId(employeeId);
        warden.setContactNumber(request.getContactNumber().trim());
        warden.setStatus(request.getStatus() != null ? request.getStatus().trim().toUpperCase() : "ACTIVE");

        if (request.getHostelIds() != null && !request.getHostelIds().isEmpty()) {
            Set<Hostel> hostels = new HashSet<>(hostelRepository.findAllById(request.getHostelIds()));
            warden.setAssignedHostels(hostels);
        }

        Warden saved = wardenRepository.save(warden);

        logAudit(adminUsername, "WARDEN_CREATED", "Warden", saved.getId(), null,
                "{\"employeeId\":\"" + saved.getEmployeeId() + "\"}", ipAddress, userAgent);

        return mapToSummary(saved);
    }

    @Override
    @Transactional
    public WardenSummaryResponse updateWarden(
            Long id,
            UpdateWardenRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Warden warden = wardenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warden not found with ID: " + id));

        String newEmpId = request.getEmployeeId().trim().toUpperCase();
        if (wardenRepository.existsByEmployeeIdAndIdNot(newEmpId, id)) {
            throw new ConflictException("Employee ID '" + newEmpId + "' is already in use by another warden.");
        }

        warden.setEmployeeId(newEmpId);
        warden.setContactNumber(request.getContactNumber().trim());
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            warden.setStatus(request.getStatus().trim().toUpperCase());
        }

        if (request.getHostelIds() != null) {
            Set<Hostel> hostels = new HashSet<>(hostelRepository.findAllById(request.getHostelIds()));
            warden.setAssignedHostels(hostels);
        }

        // Update editable user details
        User user = warden.getUser();
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
            userRepository.save(user);
        }

        Warden updated = wardenRepository.save(warden);

        logAudit(adminUsername, "WARDEN_UPDATED", "Warden", updated.getId(), null,
                "{\"employeeId\":\"" + updated.getEmployeeId() + "\"}", ipAddress, userAgent);

        return mapToSummary(updated);
    }

    @Override
    @Transactional
    public WardenSummaryResponse updateWardenStatus(
            Long id,
            String status,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Warden warden = wardenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warden not found with ID: " + id));

        String oldStatus = warden.getStatus();
        String newStatus = status.trim().toUpperCase();
        warden.setStatus(newStatus);

        Warden updated = wardenRepository.save(warden);

        logAudit(adminUsername, "WARDEN_STATUS_CHANGED", "Warden", updated.getId(),
                "{\"status\":\"" + oldStatus + "\"}",
                "{\"status\":\"" + newStatus + "\"}",
                ipAddress, userAgent);

        return mapToSummary(updated);
    }

    @Override
    @Transactional
    public WardenSummaryResponse assignHostels(
            Long id,
            WardenHostelAssignmentRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Warden warden = wardenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warden not found with ID: " + id));

        Set<Hostel> hostels = new HashSet<>(hostelRepository.findAllById(request.getHostelIds()));
        warden.setAssignedHostels(hostels);

        Warden updated = wardenRepository.save(warden);

        logAudit(adminUsername, "WARDEN_HOSTEL_ASSIGNED", "Warden", updated.getId(), null,
                "{\"assignedHostelsCount\":" + hostels.size() + "}", ipAddress, userAgent);

        return mapToSummary(updated);
    }

    private WardenSummaryResponse mapToSummary(Warden w) {
        User u = w.getUser();

        List<WardenSummaryResponse.HostelOption> hostels = w.getAssignedHostels() != null
                ? w.getAssignedHostels().stream()
                    .map(h -> new WardenSummaryResponse.HostelOption(h.getId(), h.getName(), h.getCode(), h.getType() != null ? h.getType().name() : "N/A"))
                    .collect(Collectors.toList())
                : List.of();

        return new WardenSummaryResponse(
                w.getId(),
                u != null ? u.getId() : null,
                u != null ? u.getUsername() : "N/A",
                u != null ? u.getEmail() : "N/A",
                u != null ? u.getFirstName() : "",
                u != null ? u.getLastName() : "",
                w.getEmployeeId(),
                w.getContactNumber(),
                w.getStatus(),
                u != null ? u.getStatus() : null,
                hostels,
                w.getCreatedAt(),
                w.getUpdatedAt()
        );
    }

    private WardenDetailsResponse mapToDetails(Warden w) {
        User u = w.getUser();

        WardenDetailsResponse details = new WardenDetailsResponse();
        details.setId(w.getId());
        details.setEmployeeId(w.getEmployeeId());
        details.setContactNumber(w.getContactNumber());
        details.setStatus(w.getStatus());
        details.setCreatedAt(w.getCreatedAt());
        details.setUpdatedAt(w.getUpdatedAt());

        if (u != null) {
            details.setUserId(u.getId());
            details.setUsername(u.getUsername());
            details.setEmail(u.getEmail());
            details.setFirstName(u.getFirstName());
            details.setLastName(u.getLastName());
            details.setUserStatus(u.getStatus());
            details.setRoles(u.getRoles() != null ? u.getRoles().stream().map(Role::getName).collect(Collectors.toList()) : List.of());
            details.setUserLastLoginAt(u.getLastLoginAt());
        }

        if (w.getAssignedHostels() != null) {
            List<WardenDetailsResponse.HostelDetail> hostels = w.getAssignedHostels().stream()
                    .map(h -> new WardenDetailsResponse.HostelDetail(
                            h.getId(),
                            h.getName(),
                            h.getCode(),
                            h.getType() != null ? h.getType().name() : "N/A",
                            h.getAddress(),
                            h.getCapacity()
                    ))
                    .collect(Collectors.toList());
            details.setAssignedHostels(hostels);
        } else {
            details.setAssignedHostels(List.of());
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
