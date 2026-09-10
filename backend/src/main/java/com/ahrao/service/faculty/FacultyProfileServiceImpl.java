package com.ahrao.service.faculty;

import com.ahrao.dto.faculty.profile.FacultyProfileDto;
import com.ahrao.dto.faculty.profile.UpdateFacultyProfileRequest;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Faculty;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacultyProfileServiceImpl implements FacultyProfileService {

    private static final Logger logger = LoggerFactory.getLogger(FacultyProfileServiceImpl.class);

    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public FacultyProfileServiceImpl(
            FacultyRepository facultyRepository,
            UserRepository userRepository,
            AuditLogRepository auditLogRepository) {
        this.facultyRepository = facultyRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyProfileDto getProfile(Long userId) {
        Faculty faculty = facultyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for authenticated user ID: " + userId));

        User user = faculty.getUser();
        FacultyProfileDto dto = new FacultyProfileDto();

        // Identity & Personal
        dto.setUserId(user.getId());
        dto.setFacultyId(faculty.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setFullName(user.getFirstName() + " " + user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setQualification(faculty.getQualification());

        // Academic & Employment
        dto.setEmployeeId(faculty.getEmployeeId());
        dto.setDesignation(faculty.getDesignation());
        dto.setJoiningDate(faculty.getJoiningDate());
        dto.setFacultyStatus(faculty.getStatus());

        Department dept = faculty.getDepartment();
        if (dept != null) {
            dto.setDepartmentId(dept.getId());
            dto.setDepartmentName(dept.getName());
            dto.setDepartmentCode(dept.getCode());
            if (dept.getInstitution() != null) {
                dto.setInstitutionName(dept.getInstitution().getName());
            }
        }

        // Account & Credentials
        dto.setUsername(user.getUsername());
        dto.setAccountStatus(user.getStatus() != null ? user.getStatus().name() : "ACTIVE");
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            List<String> roles = user.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toList());
            dto.setRoles(roles);
        } else {
            dto.setRoles(Collections.singletonList("ROLE_FACULTY"));
        }
        dto.setLastLoginAt(user.getLastLoginAt());

        return dto;
    }

    @Override
    @Transactional
    public FacultyProfileDto updateProfile(Long userId, UpdateFacultyProfileRequest request, String ipAddress, String userAgent) {
        Faculty faculty = facultyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for authenticated user ID: " + userId));

        User user = faculty.getUser();

        String oldFirstName = user.getFirstName();
        String oldLastName = user.getLastName();
        String oldPhone = user.getPhone();
        String oldQualification = faculty.getQualification();

        boolean userUpdated = false;
        boolean facultyUpdated = false;

        if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty()) {
            user.setFirstName(request.getFirstName().trim());
            userUpdated = true;
        }

        if (request.getLastName() != null && !request.getLastName().trim().isEmpty()) {
            user.setLastName(request.getLastName().trim());
            userUpdated = true;
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
            userUpdated = true;
        }

        if (request.getQualification() != null) {
            faculty.setQualification(request.getQualification().trim());
            facultyUpdated = true;
        }

        if (userUpdated) {
            userRepository.save(user);
        }

        if (facultyUpdated) {
            facultyRepository.save(faculty);
        }

        if (userUpdated || facultyUpdated) {
            String oldValue = String.format("Name: %s %s, Phone: %s, Qualification: %s",
                    oldFirstName, oldLastName, oldPhone, oldQualification);
            String newValue = String.format("Name: %s %s, Phone: %s, Qualification: %s",
                    user.getFirstName(), user.getLastName(), user.getPhone(), faculty.getQualification());

            recordAuditLog(user, "FACULTY_PROFILE_UPDATED", "FACULTY", faculty.getId(),
                    oldValue, newValue, ipAddress, userAgent);
        }

        return getProfile(userId);
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
