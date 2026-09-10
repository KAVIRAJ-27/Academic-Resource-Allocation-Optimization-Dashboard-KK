package com.ahrao.service.academic.impl;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.student.CreateStudentRequest;
import com.ahrao.dto.student.StudentDetailsResponse;
import com.ahrao.dto.student.StudentReferenceDataResponse;
import com.ahrao.dto.student.StudentSummaryResponse;
import com.ahrao.dto.student.UpdateStudentRequest;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Program;
import com.ahrao.entity.academic.Section;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.DepartmentRepository;
import com.ahrao.repository.academic.ProgramRepository;
import com.ahrao.repository.academic.SectionRepository;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.user.RoleRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.academic.AdminStudentService;
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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminStudentServiceImpl implements AdminStudentService {

    private static final Logger logger = LoggerFactory.getLogger(AdminStudentServiceImpl.class);

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final ProgramRepository programRepository;
    private final SectionRepository sectionRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminStudentServiceImpl(
            StudentRepository studentRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            DepartmentRepository departmentRepository,
            ProgramRepository programRepository,
            SectionRepository sectionRepository,
            AuditLogRepository auditLogRepository,
            PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.departmentRepository = departmentRepository;
        this.programRepository = programRepository;
        this.sectionRepository = sectionRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<StudentSummaryResponse> getStudents(
            String search,
            Long departmentId,
            Long programId,
            Long sectionId,
            String status,
            Pageable pageable) {

        Specification<Student> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            Join<Student, User> userJoin = root.join("user", JoinType.INNER);

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("registerNumber")), pattern),
                        cb.like(cb.lower(root.get("rollNumber")), pattern),
                        cb.like(cb.lower(userJoin.get("firstName")), pattern),
                        cb.like(cb.lower(userJoin.get("lastName")), pattern),
                        cb.like(cb.lower(userJoin.get("email")), pattern),
                        cb.like(cb.lower(userJoin.get("username")), pattern)
                ));
            }

            if (departmentId != null) {
                predicates.add(cb.equal(root.get("department").get("id"), departmentId));
            }

            if (programId != null) {
                predicates.add(cb.equal(root.get("program").get("id"), programId));
            }

            if (sectionId != null) {
                predicates.add(cb.equal(root.get("section").get("id"), sectionId));
            }

            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status.trim())) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }

            if (!Long.class.equals(query.getResultType()) && !long.class.equals(query.getResultType())) {
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Student> studentPage = studentRepository.findAll(spec, pageable);

        List<StudentSummaryResponse> content = studentPage.getContent().stream()
                .map(this::mapToSummaryResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                studentPage.getNumber(),
                studentPage.getSize(),
                studentPage.getTotalElements(),
                studentPage.getTotalPages(),
                studentPage.isFirst(),
                studentPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public StudentDetailsResponse getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student record not found with ID: " + id));

        return mapToDetailsResponse(student);
    }

    @Override
    @Transactional
    public StudentSummaryResponse createStudent(
            CreateStudentRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        String regNum = request.getRegisterNumber().trim();
        if (studentRepository.existsByRegisterNumber(regNum)) {
            throw new ConflictException("Register number '" + regNum + "' already exists");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new BadRequestException("Department with ID " + request.getDepartmentId() + " does not exist"));

        Program program = programRepository.findById(request.getProgramId())
                .orElseThrow(() -> new BadRequestException("Program with ID " + request.getProgramId() + " does not exist"));

        if (!program.getDepartment().getId().equals(department.getId())) {
            throw new BadRequestException("Selected Program does not belong to Department '" + department.getName() + "'");
        }

        Section section = null;
        if (request.getSectionId() != null) {
            section = sectionRepository.findById(request.getSectionId())
                    .orElseThrow(() -> new BadRequestException("Section with ID " + request.getSectionId() + " does not exist"));
            if (!section.getProgram().getId().equals(program.getId())) {
                throw new BadRequestException("Selected Section does not belong to Program '" + program.getName() + "'");
            }
        }

        User studentUser;
        if (request.getUserId() != null) {
            // Option 1: Link to existing User
            studentUser = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new BadRequestException("User with ID " + request.getUserId() + " does not exist"));

            if (studentRepository.existsByUserId(studentUser.getId())) {
                throw new ConflictException("User account '@" + studentUser.getUsername() + "' is already linked to another student record");
            }

            // Ensure STUDENT role is present
            boolean hasStudentRole = studentUser.getRoles().stream()
                    .anyMatch(r -> "STUDENT".equalsIgnoreCase(r.getName()) || "ROLE_STUDENT".equalsIgnoreCase(r.getName()));

            if (!hasStudentRole) {
                Role studentRole = roleRepository.findByName("STUDENT")
                        .orElseThrow(() -> new BadRequestException("STUDENT role not configured"));
                studentUser.getRoles().add(studentRole);
                studentUser = userRepository.save(studentUser);
            }
        } else {
            // Option 2: Create new User account simultaneously
            if (request.getUsername() == null || request.getUsername().isBlank()) {
                throw new BadRequestException("Username is required when creating a new student user account");
            }
            if (request.getEmail() == null || request.getEmail().isBlank()) {
                throw new BadRequestException("Email is required when creating a new student user account");
            }
            if (request.getPassword() == null || request.getPassword().length() < 6) {
                throw new BadRequestException("Password must be at least 6 characters");
            }
            if (request.getFirstName() == null || request.getFirstName().isBlank()) {
                throw new BadRequestException("First name is required");
            }
            if (request.getLastName() == null || request.getLastName().isBlank()) {
                throw new BadRequestException("Last name is required");
            }

            String username = request.getUsername().trim();
            String email = request.getEmail().trim().toLowerCase();

            if (userRepository.existsByUsername(username)) {
                throw new ConflictException("Username '" + username + "' is already registered");
            }
            if (userRepository.existsByEmail(email)) {
                throw new ConflictException("Email '" + email + "' is already registered");
            }

            Role studentRole = roleRepository.findByName("STUDENT")
                    .orElseThrow(() -> new BadRequestException("STUDENT role not configured"));

            User newUser = new User();
            newUser.setUsername(username);
            newUser.setEmail(email);
            newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            newUser.setFirstName(request.getFirstName().trim());
            newUser.setLastName(request.getLastName().trim());
            newUser.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
            newUser.setStatus(UserStatus.ACTIVE);
            newUser.setRoles(Collections.singleton(studentRole));

            studentUser = userRepository.save(newUser);

            User adminUser = adminUsername != null ? userRepository.findByUsername(adminUsername).orElse(null) : null;
            recordAuditLog(adminUser, "USER_CREATED", "USER", studentUser.getId(), null,
                    "Provisioned student user account @" + studentUser.getUsername(), ipAddress, userAgent);
        }

        Student student = new Student();
        student.setUser(studentUser);
        student.setDepartment(department);
        student.setProgram(program);
        student.setSection(section);
        student.setRegisterNumber(regNum);
        student.setRollNumber(request.getRollNumber() != null ? request.getRollNumber().trim() : null);
        student.setAdmissionYear(request.getAdmissionYear());
        student.setCurrentSemester(request.getCurrentSemester());
        student.setStatus(request.getStatus() != null ? request.getStatus().trim().toUpperCase() : "ACTIVE");

        Student saved = studentRepository.save(student);

        User adminUser = adminUsername != null ? userRepository.findByUsername(adminUsername).orElse(null) : null;
        recordAuditLog(adminUser, "STUDENT_CREATED", "STUDENT", saved.getId(), null,
                "Enrolled student " + saved.getRegisterNumber() + " into " + program.getCode(), ipAddress, userAgent);

        return mapToSummaryResponse(saved);
    }

    @Override
    @Transactional
    public StudentSummaryResponse updateStudent(
            Long id,
            UpdateStudentRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student record not found with ID: " + id));

        String newRegNum = request.getRegisterNumber().trim();
        if (studentRepository.existsByRegisterNumberAndIdNot(newRegNum, id)) {
            throw new ConflictException("Register number '" + newRegNum + "' is already registered to another student");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new BadRequestException("Department with ID " + request.getDepartmentId() + " does not exist"));

        Program program = programRepository.findById(request.getProgramId())
                .orElseThrow(() -> new BadRequestException("Program with ID " + request.getProgramId() + " does not exist"));

        if (!program.getDepartment().getId().equals(department.getId())) {
            throw new BadRequestException("Selected Program does not belong to Department '" + department.getName() + "'");
        }

        Section section = null;
        if (request.getSectionId() != null) {
            section = sectionRepository.findById(request.getSectionId())
                    .orElseThrow(() -> new BadRequestException("Section with ID " + request.getSectionId() + " does not exist"));
            if (!section.getProgram().getId().equals(program.getId())) {
                throw new BadRequestException("Selected Section does not belong to Program '" + program.getName() + "'");
            }
        }

        // Update linked user profile attributes if provided
        User user = student.getUser();
        if (user != null && request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = request.getEmail().trim().toLowerCase();
            if (!newEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                throw new ConflictException("Email '" + newEmail + "' is already registered to another user");
            }
            user.setEmail(newEmail);
            if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
                user.setFirstName(request.getFirstName().trim());
            }
            if (request.getLastName() != null && !request.getLastName().isBlank()) {
                user.setLastName(request.getLastName().trim());
            }
            if (request.getPhone() != null) {
                user.setPhone(request.getPhone().trim());
            }
            userRepository.save(user);
        }

        String oldDetails = String.format("Reg: %s, Dept: %s, Prog: %s, Sem: %d, Status: %s",
                student.getRegisterNumber(), student.getDepartment().getCode(), student.getProgram().getCode(),
                student.getCurrentSemester(), student.getStatus());

        student.setRegisterNumber(newRegNum);
        student.setRollNumber(request.getRollNumber() != null ? request.getRollNumber().trim() : null);
        student.setDepartment(department);
        student.setProgram(program);
        student.setSection(section);
        student.setAdmissionYear(request.getAdmissionYear());
        student.setCurrentSemester(request.getCurrentSemester());
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            student.setStatus(request.getStatus().trim().toUpperCase());
        }

        Student updated = studentRepository.save(student);

        String newDetails = String.format("Reg: %s, Dept: %s, Prog: %s, Sem: %d, Status: %s",
                updated.getRegisterNumber(), updated.getDepartment().getCode(), updated.getProgram().getCode(),
                updated.getCurrentSemester(), updated.getStatus());

        User adminUser = adminUsername != null ? userRepository.findByUsername(adminUsername).orElse(null) : null;
        recordAuditLog(adminUser, "STUDENT_UPDATED", "STUDENT", updated.getId(),
                oldDetails, newDetails, ipAddress, userAgent);

        return mapToSummaryResponse(updated);
    }

    @Override
    @Transactional
    public StudentSummaryResponse updateStudentStatus(
            Long id,
            String status,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student record not found with ID: " + id));

        String oldStatus = student.getStatus();
        String newStatus = status.trim().toUpperCase();
        student.setStatus(newStatus);

        Student updated = studentRepository.save(student);

        User adminUser = adminUsername != null ? userRepository.findByUsername(adminUsername).orElse(null) : null;
        recordAuditLog(adminUser, "STUDENT_STATUS_CHANGED", "STUDENT", updated.getId(),
                "Status: " + oldStatus, "Status: " + newStatus, ipAddress, userAgent);

        return mapToSummaryResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentReferenceDataResponse getReferenceData() {
        List<Department> departments = departmentRepository.findAll();
        List<Program> programs = programRepository.findAll();
        List<Section> sections = sectionRepository.findAll();
        List<User> unassignedUsers = userRepository.findUnassignedStudentUsers();

        List<StudentReferenceDataResponse.DepartmentOption> deptOptions = departments.stream()
                .map(d -> new StudentReferenceDataResponse.DepartmentOption(d.getId(), d.getName(), d.getCode()))
                .collect(Collectors.toList());

        List<StudentReferenceDataResponse.ProgramOption> progOptions = programs.stream()
                .map(p -> new StudentReferenceDataResponse.ProgramOption(p.getId(), p.getName(), p.getCode(), p.getDepartment().getId()))
                .collect(Collectors.toList());

        List<StudentReferenceDataResponse.SectionOption> sectionOptions = sections.stream()
                .map(s -> new StudentReferenceDataResponse.SectionOption(s.getId(), s.getName(), s.getProgram().getId(), s.getCapacity()))
                .collect(Collectors.toList());

        List<StudentReferenceDataResponse.UserOption> userOptions = unassignedUsers.stream()
                .map(u -> new StudentReferenceDataResponse.UserOption(
                        u.getId(),
                        u.getUsername(),
                        u.getFirstName() + " " + u.getLastName(),
                        u.getEmail()
                ))
                .collect(Collectors.toList());

        return new StudentReferenceDataResponse(deptOptions, progOptions, sectionOptions, userOptions);
    }

    private StudentSummaryResponse mapToSummaryResponse(Student s) {
        User u = s.getUser();
        Department d = s.getDepartment();
        Program p = s.getProgram();
        Section sec = s.getSection();

        return new StudentSummaryResponse(
                s.getId(),
                s.getRegisterNumber(),
                s.getRollNumber(),
                u != null ? u.getFirstName() + " " + u.getLastName() : "Unknown",
                u != null ? u.getEmail() : null,
                u != null ? u.getPhone() : null,
                u != null ? u.getId() : null,
                u != null ? u.getUsername() : null,
                u != null ? u.getStatus() : null,
                d != null ? d.getId() : null,
                d != null ? d.getName() : null,
                d != null ? d.getCode() : null,
                p != null ? p.getId() : null,
                p != null ? p.getName() : null,
                p != null ? p.getCode() : null,
                sec != null ? sec.getId() : null,
                sec != null ? sec.getName() : null,
                s.getAdmissionYear(),
                s.getCurrentSemester(),
                s.getStatus(),
                s.getCreatedAt(),
                s.getUpdatedAt()
        );
    }

    private StudentDetailsResponse mapToDetailsResponse(Student s) {
        User u = s.getUser();
        Department d = s.getDepartment();
        Program p = s.getProgram();
        Section sec = s.getSection();

        StudentDetailsResponse resp = new StudentDetailsResponse();
        resp.setId(s.getId());
        resp.setRegisterNumber(s.getRegisterNumber());
        resp.setRollNumber(s.getRollNumber());
        resp.setAdmissionYear(s.getAdmissionYear());
        resp.setCurrentSemester(s.getCurrentSemester());
        resp.setStatus(s.getStatus());
        resp.setCreatedAt(s.getCreatedAt());
        resp.setUpdatedAt(s.getUpdatedAt());

        if (u != null) {
            resp.setUserId(u.getId());
            resp.setUsername(u.getUsername());
            resp.setEmail(u.getEmail());
            resp.setFirstName(u.getFirstName());
            resp.setLastName(u.getLastName());
            resp.setPhone(u.getPhone());
            resp.setUserStatus(u.getStatus());
            resp.setRoles(u.getRoles().stream().map(Role::getName).collect(Collectors.toList()));
            resp.setUserLastLoginAt(u.getLastLoginAt());
        }

        if (d != null) {
            resp.setDepartmentId(d.getId());
            resp.setDepartmentName(d.getName());
            resp.setDepartmentCode(d.getCode());
        }

        if (p != null) {
            resp.setProgramId(p.getId());
            resp.setProgramName(p.getName());
            resp.setProgramCode(p.getCode());
            resp.setDegreeType(p.getDegreeType());
            resp.setDurationYears(p.getDurationYears());
        }

        if (sec != null) {
            resp.setSectionId(sec.getId());
            resp.setSectionName(sec.getName());
            resp.setSectionCapacity(sec.getCapacity());
        }

        return resp;
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
