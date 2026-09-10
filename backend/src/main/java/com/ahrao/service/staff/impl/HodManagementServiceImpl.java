package com.ahrao.service.staff.impl;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.staff.CreateHodAssignmentRequest;
import com.ahrao.dto.staff.HodDetailsResponse;
import com.ahrao.dto.staff.HodSummaryResponse;
import com.ahrao.dto.staff.UpdateHodAssignmentRequest;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.DepartmentHOD;
import com.ahrao.entity.academic.Faculty;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.DepartmentHODRepository;
import com.ahrao.repository.academic.DepartmentRepository;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.user.RoleRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.staff.HodManagementService;
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
public class HodManagementServiceImpl implements HodManagementService {

    private final DepartmentHODRepository departmentHODRepository;
    private final DepartmentRepository departmentRepository;
    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditLogRepository auditLogRepository;

    public HodManagementServiceImpl(
            DepartmentHODRepository departmentHODRepository,
            DepartmentRepository departmentRepository,
            FacultyRepository facultyRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            AuditLogRepository auditLogRepository) {
        this.departmentHODRepository = departmentHODRepository;
        this.departmentRepository = departmentRepository;
        this.facultyRepository = facultyRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<HodSummaryResponse> getHods(
            String search,
            Long departmentId,
            String status,
            Pageable pageable) {

        Specification<DepartmentHOD> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                var deptJoin = root.join("department");
                var facultyJoin = root.join("faculty");
                var userJoin = facultyJoin.join("user");

                Predicate deptNameMatch = cb.like(cb.lower(deptJoin.get("name")), term);
                Predicate deptCodeMatch = cb.like(cb.lower(deptJoin.get("code")), term);
                Predicate empIdMatch = cb.like(cb.lower(facultyJoin.get("employeeId")), term);
                Predicate usernameMatch = cb.like(cb.lower(userJoin.get("username")), term);
                Predicate firstNameMatch = cb.like(cb.lower(userJoin.get("firstName")), term);
                Predicate lastNameMatch = cb.like(cb.lower(userJoin.get("lastName")), term);
                Predicate emailMatch = cb.like(cb.lower(userJoin.get("email")), term);

                predicates.add(cb.or(deptNameMatch, deptCodeMatch, empIdMatch, usernameMatch, firstNameMatch, lastNameMatch, emailMatch));
            }

            if (departmentId != null) {
                predicates.add(cb.equal(root.get("department").get("id"), departmentId));
            }

            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<DepartmentHOD> page = departmentHODRepository.findAll(spec, pageable);

        List<HodSummaryResponse> content = page.getContent().stream()
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
    public HodDetailsResponse getHodById(Long id) {
        DepartmentHOD hod = departmentHODRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HOD assignment not found with ID: " + id));
        return mapToDetails(hod);
    }

    @Override
    @Transactional
    public HodSummaryResponse assignHod(
            CreateHodAssignmentRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        Faculty faculty = facultyRepository.findById(request.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + request.getFacultyId()));

        String requestedStatus = request.getStatus() != null ? request.getStatus().trim().toUpperCase() : "ACTIVE";

        if ("ACTIVE".equalsIgnoreCase(requestedStatus)) {
            if (departmentHODRepository.existsByDepartmentIdAndStatus(department.getId(), "ACTIVE")) {
                throw new ConflictException("Department '" + department.getName() + "' already has an active HOD assignment. Please conclude or deactivate the existing assignment first.");
            }
        }

        // Attach HOD role to user if not present
        User user = faculty.getUser();
        if (user != null) {
            Role hodRole = roleRepository.findByName("HOD")
                    .orElseThrow(() -> new ResourceNotFoundException("Role 'HOD' not configured in system."));
            if (user.getRoles() == null) {
                user.setRoles(new HashSet<>());
            }
            if (!user.getRoles().contains(hodRole)) {
                user.getRoles().add(hodRole);
                userRepository.save(user);
            }
        }

        DepartmentHOD hod = new DepartmentHOD();
        hod.setDepartment(department);
        hod.setFaculty(faculty);
        hod.setStartDate(request.getStartDate());
        hod.setEndDate(request.getEndDate());
        hod.setStatus(requestedStatus);

        DepartmentHOD saved = departmentHODRepository.save(hod);

        logAudit(adminUsername, "HOD_ASSIGNED", "DepartmentHOD", saved.getId(), null,
                "{\"department\":\"" + department.getCode() + "\",\"facultyId\":\"" + faculty.getEmployeeId() + "\"}",
                ipAddress, userAgent);

        return mapToSummary(saved);
    }

    @Override
    @Transactional
    public HodSummaryResponse updateHodAssignment(
            Long id,
            UpdateHodAssignmentRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        DepartmentHOD hod = departmentHODRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HOD assignment not found with ID: " + id));

        String newStatus = request.getStatus() != null ? request.getStatus().trim().toUpperCase() : hod.getStatus();

        if ("ACTIVE".equalsIgnoreCase(newStatus) && !"ACTIVE".equalsIgnoreCase(hod.getStatus())) {
            if (departmentHODRepository.existsByDepartmentIdAndStatusAndIdNot(hod.getDepartment().getId(), "ACTIVE", id)) {
                throw new ConflictException("Department '" + hod.getDepartment().getName() + "' already has an active HOD assignment.");
            }
        }

        if (request.getFacultyId() != null && !request.getFacultyId().equals(hod.getFaculty().getId())) {
            Faculty newFaculty = facultyRepository.findById(request.getFacultyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + request.getFacultyId()));
            hod.setFaculty(newFaculty);

            // Assign HOD role to new faculty
            User user = newFaculty.getUser();
            if (user != null) {
                Role hodRole = roleRepository.findByName("HOD")
                        .orElseThrow(() -> new ResourceNotFoundException("Role 'HOD' not configured in system."));
                if (user.getRoles() == null) {
                    user.setRoles(new HashSet<>());
                }
                user.getRoles().add(hodRole);
                userRepository.save(user);
            }
        }

        hod.setStartDate(request.getStartDate());
        hod.setEndDate(request.getEndDate());
        hod.setStatus(newStatus);

        DepartmentHOD updated = departmentHODRepository.save(hod);

        logAudit(adminUsername, "HOD_UPDATED", "DepartmentHOD", updated.getId(), null,
                "{\"department\":\"" + updated.getDepartment().getCode() + "\",\"status\":\"" + newStatus + "\"}",
                ipAddress, userAgent);

        return mapToSummary(updated);
    }

    @Override
    @Transactional
    public HodSummaryResponse updateHodStatus(
            Long id,
            String status,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        DepartmentHOD hod = departmentHODRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HOD assignment not found with ID: " + id));

        String oldStatus = hod.getStatus();
        String newStatus = status.trim().toUpperCase();

        if ("ACTIVE".equalsIgnoreCase(newStatus) && !"ACTIVE".equalsIgnoreCase(oldStatus)) {
            if (departmentHODRepository.existsByDepartmentIdAndStatusAndIdNot(hod.getDepartment().getId(), "ACTIVE", id)) {
                throw new ConflictException("Department '" + hod.getDepartment().getName() + "' already has another active HOD assignment.");
            }
        }

        hod.setStatus(newStatus);
        DepartmentHOD updated = departmentHODRepository.save(hod);

        logAudit(adminUsername, "HOD_STATUS_CHANGED", "DepartmentHOD", updated.getId(),
                "{\"status\":\"" + oldStatus + "\"}",
                "{\"status\":\"" + newStatus + "\"}",
                ipAddress, userAgent);

        return mapToSummary(updated);
    }

    private HodSummaryResponse mapToSummary(DepartmentHOD h) {
        Department d = h.getDepartment();
        Faculty f = h.getFaculty();
        User u = f != null ? f.getUser() : null;

        return new HodSummaryResponse(
                h.getId(),
                d != null ? d.getId() : null,
                d != null ? d.getName() : "N/A",
                d != null ? d.getCode() : "N/A",
                f != null ? f.getId() : null,
                f != null ? f.getEmployeeId() : "N/A",
                u != null ? u.getFirstName() + " " + u.getLastName() : "N/A",
                u != null ? u.getEmail() : "N/A",
                u != null ? u.getPhone() : null,
                f != null ? f.getDesignation() : "N/A",
                h.getStartDate(),
                h.getEndDate(),
                h.getStatus()
        );
    }

    private HodDetailsResponse mapToDetails(DepartmentHOD h) {
        Department d = h.getDepartment();
        Faculty f = h.getFaculty();
        User u = f != null ? f.getUser() : null;

        HodDetailsResponse details = new HodDetailsResponse();
        details.setId(h.getId());
        details.setStartDate(h.getStartDate());
        details.setEndDate(h.getEndDate());
        details.setStatus(h.getStatus());

        if (d != null) {
            details.setDepartmentId(d.getId());
            details.setDepartmentName(d.getName());
            details.setDepartmentCode(d.getCode());
            details.setDepartmentDescription(d.getDescription());
        }

        if (f != null) {
            details.setFacultyId(f.getId());
            details.setEmployeeId(f.getEmployeeId());
            details.setDesignation(f.getDesignation());
            details.setQualification(f.getQualification());
        }

        if (u != null) {
            details.setUserId(u.getId());
            details.setUsername(u.getUsername());
            details.setFacultyName(u.getFirstName() + " " + u.getLastName());
            details.setFacultyEmail(u.getEmail());
            details.setFacultyPhone(u.getPhone());
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
