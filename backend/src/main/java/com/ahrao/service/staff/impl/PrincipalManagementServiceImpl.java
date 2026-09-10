package com.ahrao.service.staff.impl;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.staff.AssignPrincipalRequest;
import com.ahrao.dto.staff.PrincipalResponse;
import com.ahrao.dto.staff.UpdatePrincipalAssignmentRequest;
import com.ahrao.entity.academic.Faculty;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.academic.PrincipalAssignment;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.InstitutionRepository;
import com.ahrao.repository.academic.PrincipalAssignmentRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.user.RoleRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.staff.PrincipalManagementService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrincipalManagementServiceImpl implements PrincipalManagementService {

    private final PrincipalAssignmentRepository principalAssignmentRepository;
    private final InstitutionRepository institutionRepository;
    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditLogRepository auditLogRepository;

    public PrincipalManagementServiceImpl(
            PrincipalAssignmentRepository principalAssignmentRepository,
            InstitutionRepository institutionRepository,
            FacultyRepository facultyRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            AuditLogRepository auditLogRepository) {
        this.principalAssignmentRepository = principalAssignmentRepository;
        this.institutionRepository = institutionRepository;
        this.facultyRepository = facultyRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PrincipalResponse getCurrentPrincipal() {
        Institution inst = getPrimaryInstitution();
        return principalAssignmentRepository.findByInstitutionIdAndStatus(inst.getId(), "ACTIVE")
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PrincipalResponse> getPrincipalHistory(
            String search,
            String status,
            Pageable pageable) {

        Specification<PrincipalAssignment> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                var facultyJoin = root.join("faculty");
                var userJoin = facultyJoin.join("user");
                var instJoin = root.join("institution");

                Predicate empIdMatch = cb.like(cb.lower(facultyJoin.get("employeeId")), term);
                Predicate usernameMatch = cb.like(cb.lower(userJoin.get("username")), term);
                Predicate firstNameMatch = cb.like(cb.lower(userJoin.get("firstName")), term);
                Predicate lastNameMatch = cb.like(cb.lower(userJoin.get("lastName")), term);
                Predicate emailMatch = cb.like(cb.lower(userJoin.get("email")), term);
                Predicate instMatch = cb.like(cb.lower(instJoin.get("name")), term);

                predicates.add(cb.or(empIdMatch, usernameMatch, firstNameMatch, lastNameMatch, emailMatch, instMatch));
            }

            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PrincipalAssignment> page = principalAssignmentRepository.findAll(spec, pageable);

        List<PrincipalResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
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
    public PrincipalResponse getPrincipalById(Long id) {
        PrincipalAssignment assignment = principalAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Principal assignment not found with ID: " + id));
        return mapToResponse(assignment);
    }

    @Override
    @Transactional
    public PrincipalResponse assignPrincipal(
            AssignPrincipalRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Institution institution = request.getInstitutionId() != null
                ? institutionRepository.findById(request.getInstitutionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Institution not found with ID: " + request.getInstitutionId()))
                : getPrimaryInstitution();

        Faculty faculty = facultyRepository.findById(request.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + request.getFacultyId()));

        String requestedStatus = request.getStatus() != null ? request.getStatus().trim().toUpperCase() : "ACTIVE";

        if ("ACTIVE".equalsIgnoreCase(requestedStatus)) {
            if (principalAssignmentRepository.existsByInstitutionIdAndStatus(institution.getId(), "ACTIVE")) {
                throw new ConflictException("An active Principal is already assigned to this institution. Conclude or deactivate the existing assignment first.");
            }
        }

        // Attach PRINCIPAL role to user if not present
        User user = faculty.getUser();
        if (user != null) {
            Role principalRole = roleRepository.findByName("PRINCIPAL")
                    .orElseThrow(() -> new ResourceNotFoundException("Role 'PRINCIPAL' not configured in system."));
            if (user.getRoles() == null) {
                user.setRoles(new HashSet<>());
            }
            if (!user.getRoles().contains(principalRole)) {
                user.getRoles().add(principalRole);
                userRepository.save(user);
            }
        }

        PrincipalAssignment assignment = new PrincipalAssignment();
        assignment.setInstitution(institution);
        assignment.setFaculty(faculty);
        assignment.setStartDate(request.getStartDate());
        assignment.setEndDate(request.getEndDate());
        assignment.setStatus(requestedStatus);

        PrincipalAssignment saved = principalAssignmentRepository.save(assignment);

        logAudit(adminUsername, "PRINCIPAL_ASSIGNED", "PrincipalAssignment", saved.getId(), null,
                "{\"institution\":\"" + institution.getCode() + "\",\"facultyId\":\"" + faculty.getEmployeeId() + "\"}",
                ipAddress, userAgent);

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public PrincipalResponse updatePrincipalAssignment(
            Long id,
            UpdatePrincipalAssignmentRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        PrincipalAssignment assignment = principalAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Principal assignment not found with ID: " + id));

        String newStatus = request.getStatus() != null ? request.getStatus().trim().toUpperCase() : assignment.getStatus();

        if ("ACTIVE".equalsIgnoreCase(newStatus) && !"ACTIVE".equalsIgnoreCase(assignment.getStatus())) {
            if (principalAssignmentRepository.existsByInstitutionIdAndStatusAndIdNot(assignment.getInstitution().getId(), "ACTIVE", id)) {
                throw new ConflictException("Another active Principal is already assigned to this institution.");
            }
        }

        if (request.getFacultyId() != null && !request.getFacultyId().equals(assignment.getFaculty().getId())) {
            Faculty newFaculty = facultyRepository.findById(request.getFacultyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + request.getFacultyId()));
            assignment.setFaculty(newFaculty);

            User user = newFaculty.getUser();
            if (user != null) {
                Role principalRole = roleRepository.findByName("PRINCIPAL")
                        .orElseThrow(() -> new ResourceNotFoundException("Role 'PRINCIPAL' not configured in system."));
                if (user.getRoles() == null) {
                    user.setRoles(new HashSet<>());
                }
                user.getRoles().add(principalRole);
                userRepository.save(user);
            }
        }

        assignment.setStartDate(request.getStartDate());
        assignment.setEndDate(request.getEndDate());
        assignment.setStatus(newStatus);

        PrincipalAssignment updated = principalAssignmentRepository.save(assignment);

        logAudit(adminUsername, "PRINCIPAL_UPDATED", "PrincipalAssignment", updated.getId(), null,
                "{\"status\":\"" + newStatus + "\"}", ipAddress, userAgent);

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public PrincipalResponse updatePrincipalStatus(
            Long id,
            String status,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        PrincipalAssignment assignment = principalAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Principal assignment not found with ID: " + id));

        String oldStatus = assignment.getStatus();
        String newStatus = status.trim().toUpperCase();

        if ("ACTIVE".equalsIgnoreCase(newStatus) && !"ACTIVE".equalsIgnoreCase(oldStatus)) {
            if (principalAssignmentRepository.existsByInstitutionIdAndStatusAndIdNot(assignment.getInstitution().getId(), "ACTIVE", id)) {
                throw new ConflictException("Another active Principal is already assigned to this institution.");
            }
        }

        assignment.setStatus(newStatus);
        PrincipalAssignment updated = principalAssignmentRepository.save(assignment);

        logAudit(adminUsername, "PRINCIPAL_STATUS_CHANGED", "PrincipalAssignment", updated.getId(),
                "{\"status\":\"" + oldStatus + "\"}",
                "{\"status\":\"" + newStatus + "\"}",
                ipAddress, userAgent);

        return mapToResponse(updated);
    }

    private Institution getPrimaryInstitution() {
        return institutionRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No institution configured in system database."));
    }

    private PrincipalResponse mapToResponse(PrincipalAssignment pa) {
        Institution inst = pa.getInstitution();
        Faculty f = pa.getFaculty();
        User u = f != null ? f.getUser() : null;

        return new PrincipalResponse(
                pa.getId(),
                inst != null ? inst.getId() : null,
                inst != null ? inst.getName() : "N/A",
                inst != null ? inst.getCode() : "N/A",
                f != null ? f.getId() : null,
                f != null ? f.getEmployeeId() : "N/A",
                u != null ? u.getFirstName() + " " + u.getLastName() : "N/A",
                u != null ? u.getEmail() : "N/A",
                u != null ? u.getPhone() : null,
                f != null ? f.getDesignation() : "N/A",
                f != null && f.getDepartment() != null ? f.getDepartment().getName() : "N/A",
                u != null ? u.getId() : null,
                u != null ? u.getUsername() : "N/A",
                pa.getStartDate(),
                pa.getEndDate(),
                pa.getStatus()
        );
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
