package com.ahrao.service.student;

import com.ahrao.dto.student.StudentProfileDto;
import com.ahrao.dto.student.StudentProfileUpdateRequest;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Program;
import com.ahrao.entity.academic.Section;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.allocation.HostelAllocation;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudentProfileServiceImpl implements StudentProfileService {

    private static final Logger logger = LoggerFactory.getLogger(StudentProfileServiceImpl.class);

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final HostelAllocationRepository hostelAllocationRepository;
    private final AuditLogRepository auditLogRepository;

    public StudentProfileServiceImpl(
            StudentRepository studentRepository,
            UserRepository userRepository,
            HostelAllocationRepository hostelAllocationRepository,
            AuditLogRepository auditLogRepository) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.hostelAllocationRepository = hostelAllocationRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public StudentProfileDto getProfile(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for authenticated user ID: " + userId));

        User user = student.getUser();
        StudentProfileDto dto = new StudentProfileDto();

        // Personal
        dto.setStudentId(student.getId());
        dto.setUserId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setFullName(user.getFirstName() + " " + user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());

        // Academic
        dto.setRegisterNumber(student.getRegisterNumber());
        dto.setRollNumber(student.getRollNumber());
        dto.setAdmissionYear(student.getAdmissionYear());
        dto.setCurrentSemester(student.getCurrentSemester());
        dto.setStatus(student.getStatus());

        Department dept = student.getDepartment();
        if (dept != null) {
            dto.setDepartmentId(dept.getId());
            dto.setDepartmentName(dept.getName());
            dto.setDepartmentCode(dept.getCode());
        }

        Program prog = student.getProgram();
        if (prog != null) {
            dto.setProgramId(prog.getId());
            dto.setProgramName(prog.getName());
            dto.setProgramCode(prog.getCode());
            if (prog.getDegreeType() != null) {
                dto.setDegreeLevel(prog.getDegreeType().name());
            }
            dto.setDurationYears(prog.getDurationYears());
        }

        Section sec = student.getSection();
        if (sec != null) {
            dto.setSectionId(sec.getId());
            dto.setSectionName(sec.getName());
            if (sec.getAcademicYear() != null) {
                dto.setAcademicYearId(sec.getAcademicYear().getId());
                dto.setAcademicYearName(sec.getAcademicYear().getName());
            }
        }

        // Account
        dto.setUsername(user.getUsername());
        dto.setUserStatus(user.getStatus() != null ? user.getStatus().name() : "ACTIVE");
        if (user.getRoles() != null) {
            List<String> roles = user.getRoles().stream()
                    .map(r -> r.getName())
                    .collect(Collectors.toList());
            dto.setRoles(roles);
        } else {
            dto.setRoles(Collections.singletonList("ROLE_STUDENT"));
        }
        dto.setLastLoginAt(user.getLastLoginAt());

        // Hostel Allocation (active)
        Optional<HostelAllocation> allocationOpt = hostelAllocationRepository
                .findByStudentIdAndStatus(student.getId(), AllocationStatus.ACTIVE);

        if (allocationOpt.isPresent()) {
            HostelAllocation allocation = allocationOpt.get();
            dto.setHostelAllocated(true);
            dto.setHostelAllocationId(allocation.getId());
            dto.setAllocationStatus(allocation.getStatus() != null ? allocation.getStatus().name() : "ACTIVE");
            dto.setAllocationStartDate(allocation.getStartDate());

            if (allocation.getBed() != null) {
                dto.setBedNumber(allocation.getBed().getBedNumber());
                if (allocation.getBed().getRoom() != null) {
                    dto.setRoomNumber(allocation.getBed().getRoom().getRoomNumber());
                    if (allocation.getBed().getRoom().getFloor() != null) {
                        dto.setFloorNumber(allocation.getBed().getRoom().getFloor().getFloorNumber());
                        if (allocation.getBed().getRoom().getFloor().getBlock() != null) {
                            dto.setBlockName(allocation.getBed().getRoom().getFloor().getBlock().getName());
                            if (allocation.getBed().getRoom().getFloor().getBlock().getHostel() != null) {
                                dto.setHostelName(allocation.getBed().getRoom().getFloor().getBlock().getHostel().getName());
                            }
                        }
                    }
                }
            }
        } else {
            dto.setHostelAllocated(false);
        }

        return dto;
    }

    @Override
    @Transactional
    public StudentProfileDto updateProfile(Long userId, StudentProfileUpdateRequest request, String ipAddress, String userAgent) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for authenticated user ID: " + userId));

        User user = student.getUser();
        String oldPhone = user.getPhone();
        String oldFirst = user.getFirstName();
        String oldLast = user.getLastName();

        boolean updated = false;

        if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty()) {
            user.setFirstName(request.getFirstName().trim());
            updated = true;
        }

        if (request.getLastName() != null && !request.getLastName().trim().isEmpty()) {
            user.setLastName(request.getLastName().trim());
            updated = true;
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
            updated = true;
        }

        if (updated) {
            userRepository.save(user);

            String oldValue = String.format("Name: %s %s, Phone: %s", oldFirst, oldLast, oldPhone);
            String newValue = String.format("Name: %s %s, Phone: %s", user.getFirstName(), user.getLastName(), user.getPhone());

            recordAuditLog(user, "STUDENT_PROFILE_UPDATED", "STUDENT", student.getId(),
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
