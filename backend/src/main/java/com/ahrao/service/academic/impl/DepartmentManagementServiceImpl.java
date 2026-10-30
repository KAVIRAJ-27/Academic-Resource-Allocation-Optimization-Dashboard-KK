package com.ahrao.service.academic.impl;

import com.ahrao.dto.academic.CreateDepartmentRequest;
import com.ahrao.dto.academic.DepartmentDetailsResponse;
import com.ahrao.dto.academic.DepartmentSummaryResponse;
import com.ahrao.dto.academic.ProgramSummaryResponse;
import com.ahrao.dto.academic.UpdateDepartmentRequest;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.DepartmentHOD;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.academic.Program;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.DepartmentHODRepository;
import com.ahrao.repository.academic.DepartmentRepository;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.InstitutionRepository;
import com.ahrao.repository.academic.ProgramRepository;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.academic.SubjectRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.academic.DepartmentManagementService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DepartmentManagementServiceImpl implements DepartmentManagementService {

    private final DepartmentRepository departmentRepository;
    private final InstitutionRepository institutionRepository;
    private final ProgramRepository programRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final DepartmentHODRepository departmentHODRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public DepartmentManagementServiceImpl(
            DepartmentRepository departmentRepository,
            InstitutionRepository institutionRepository,
            ProgramRepository programRepository,
            FacultyRepository facultyRepository,
            StudentRepository studentRepository,
            SubjectRepository subjectRepository,
            DepartmentHODRepository departmentHODRepository,
            AuditLogRepository auditLogRepository,
            UserRepository userRepository) {
        this.departmentRepository = departmentRepository;
        this.institutionRepository = institutionRepository;
        this.programRepository = programRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.departmentHODRepository = departmentHODRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DepartmentSummaryResponse> getDepartments(String search, String status, Pageable pageable) {
        Specification<Department> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                Predicate codeMatch = cb.like(cb.lower(root.get("code")), pattern);
                predicates.add(cb.or(nameMatch, codeMatch));
            }

            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Department> page = departmentRepository.findAll(spec, pageable);
        List<DepartmentSummaryResponse> content = page.getContent().stream()
                .map(this::toSummaryResponse)
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
    public DepartmentDetailsResponse getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));

        DepartmentDetailsResponse response = new DepartmentDetailsResponse();
        response.setId(department.getId());
        response.setInstitutionId(department.getInstitution().getId());
        response.setInstitutionName(department.getInstitution().getName());
        response.setName(department.getName());
        response.setCode(department.getCode());
        response.setDescription(department.getDescription());
        response.setStatus(department.getStatus());
        response.setCreatedAt(department.getCreatedAt());
        response.setUpdatedAt(department.getUpdatedAt());

        response.setProgramCount(programRepository.countByDepartmentId(id));
        response.setFacultyCount(facultyRepository.countByDepartmentId(id));
        response.setStudentCount(studentRepository.countByDepartmentId(id));

        List<Program> programs = programRepository.findByDepartmentId(id);
        long totalSubjects = 0;
        for (Program p : programs) {
            totalSubjects += subjectRepository.countByProgramId(p.getId());
        }
        response.setSubjectCount(totalSubjects);

        Optional<DepartmentHOD> activeHod = departmentHODRepository.findFirstByDepartmentIdAndStatus(id, "ACTIVE");
        if (activeHod.isPresent() && activeHod.get().getFaculty() != null) {
            var faculty = activeHod.get().getFaculty();
            response.setHodFacultyId(faculty.getId());
            response.setHodName(faculty.getUser().getFirstName() + " " + faculty.getUser().getLastName());
            response.setHodEmployeeId(faculty.getEmployeeId());
            response.setHodEmail(faculty.getUser().getEmail());
        }

        List<ProgramSummaryResponse> programResponses = programs.stream()
                .map(p -> {
                    ProgramSummaryResponse psr = new ProgramSummaryResponse();
                    psr.setId(p.getId());
                    psr.setDepartmentId(id);
                    psr.setDepartmentName(department.getName());
                    psr.setDepartmentCode(department.getCode());
                    psr.setName(p.getName());
                    psr.setCode(p.getCode());
                    psr.setDegreeType(p.getDegreeType());
                    psr.setDurationYears(p.getDurationYears());
                    psr.setStatus(p.getStatus());
                    psr.setCreatedAt(p.getCreatedAt());
                    psr.setUpdatedAt(p.getUpdatedAt());
                    return psr;
                })
                .collect(Collectors.toList());
        response.setPrograms(programResponses);

        return response;
    }

    @Override
    @Transactional
    public DepartmentSummaryResponse createDepartment(
            CreateDepartmentRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Institution institution;
        if (request.getInstitutionId() != null) {
            institution = institutionRepository.findById(request.getInstitutionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Institution not found with ID: " + request.getInstitutionId()));
        } else {
            institution = institutionRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("No default institution exists. Please configure institution first."));
        }

        String normalizedCode = request.getCode().trim().toUpperCase();
        String normalizedName = request.getName().trim();

        if (departmentRepository.existsByInstitutionIdAndCode(institution.getId(), normalizedCode)) {
            throw new ConflictException("Department code '" + normalizedCode + "' already exists in this institution.");
        }

        if (departmentRepository.existsByInstitutionIdAndName(institution.getId(), normalizedName)) {
            throw new ConflictException("Department name '" + normalizedName + "' already exists in this institution.");
        }

        Department department = new Department();
        department.setInstitution(institution);
        department.setName(normalizedName);
        department.setCode(normalizedCode);
        department.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        department.setStatus("ACTIVE");

        Department saved = departmentRepository.save(department);

        logAudit(adminUsername, "DEPARTMENT_CREATED", "Department", saved.getId(), null,
                "{\"name\":\"" + saved.getName() + "\",\"code\":\"" + saved.getCode() + "\"}", ipAddress, userAgent);

        return toSummaryResponse(saved);
    }

    @Override
    @Transactional
    public DepartmentSummaryResponse updateDepartment(
            Long id,
            UpdateDepartmentRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));

        String normalizedCode = request.getCode().trim().toUpperCase();
        String normalizedName = request.getName().trim();

        if (departmentRepository.existsByInstitutionIdAndCodeAndIdNot(department.getInstitution().getId(), normalizedCode, id)) {
            throw new ConflictException("Department code '" + normalizedCode + "' already exists in this institution.");
        }

        if (departmentRepository.existsByInstitutionIdAndNameAndIdNot(department.getInstitution().getId(), normalizedName, id)) {
            throw new ConflictException("Department name '" + normalizedName + "' already exists in this institution.");
        }

        String oldValue = "{\"name\":\"" + department.getName() + "\",\"code\":\"" + department.getCode() + "\"}";

        department.setName(normalizedName);
        department.setCode(normalizedCode);
        department.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);

        Department updated = departmentRepository.save(department);
        String newValue = "{\"name\":\"" + updated.getName() + "\",\"code\":\"" + updated.getCode() + "\"}";

        logAudit(adminUsername, "DEPARTMENT_UPDATED", "Department", updated.getId(), oldValue, newValue, ipAddress, userAgent);

        return toSummaryResponse(updated);
    }

    @Override
    @Transactional
    public DepartmentSummaryResponse updateDepartmentStatus(
            Long id,
            String status,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));

        String targetStatus = status.trim().toUpperCase();

        if (!targetStatus.equals("ACTIVE")) {
            long activePrograms = programRepository.countByDepartmentIdAndStatus(id, "ACTIVE");
            if (activePrograms > 0) {
                throw new ConflictException("Cannot deactivate department '" + department.getName() +
                        "' because it has " + activePrograms + " active program(s). Deactivate or reassign them first.");
            }
            long activeFaculty = facultyRepository.countByDepartmentId(id);
            if (activeFaculty > 0) {
                throw new ConflictException("Cannot deactivate department '" + department.getName() +
                        "' because it has " + activeFaculty + " appointed faculty member(s).");
            }
            if (departmentHODRepository.existsByDepartmentIdAndStatus(id, "ACTIVE")) {
                throw new ConflictException("Cannot deactivate department '" + department.getName() +
                        "' because an active Head of Department (HOD) is currently assigned.");
            }
        }

        String oldValue = "{\"status\":\"" + department.getStatus() + "\"}";
        department.setStatus(targetStatus);
        Department saved = departmentRepository.save(department);
        String newValue = "{\"status\":\"" + saved.getStatus() + "\"}";

        logAudit(adminUsername, "DEPARTMENT_STATUS_CHANGED", "Department", saved.getId(), oldValue, newValue, ipAddress, userAgent);

        return toSummaryResponse(saved);
    }

    @Override
    @Transactional
    public void deleteDepartment(Long id, String adminUsername, String ipAddress, String userAgent) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));

        long programs = programRepository.countByDepartmentId(id);
        if (programs > 0) {
            throw new ConflictException("Department cannot be deleted because " + programs + " degree program(s) are linked to it.");
        }
        long faculty = facultyRepository.countByDepartmentId(id);
        if (faculty > 0) {
            throw new ConflictException("Department cannot be deleted because " + faculty + " faculty member(s) belong to it.");
        }
        long students = studentRepository.countByDepartmentId(id);
        if (students > 0) {
            throw new ConflictException("Department cannot be deleted because " + students + " enrolled student(s) belong to it.");
        }
        if (departmentHODRepository.existsByDepartmentIdAndStatus(id, "ACTIVE")) {
            throw new ConflictException("Department cannot be deleted because an active Head of Department assignment exists.");
        }

        departmentRepository.delete(department);

        logAudit(adminUsername, "DEPARTMENT_DELETED", "Department", id,
                "{\"name\":\"" + department.getName() + "\",\"code\":\"" + department.getCode() + "\"}", null, ipAddress, userAgent);
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

    private DepartmentSummaryResponse toSummaryResponse(Department entity) {
        DepartmentSummaryResponse res = new DepartmentSummaryResponse();
        res.setId(entity.getId());
        res.setInstitutionId(entity.getInstitution().getId());
        res.setInstitutionName(entity.getInstitution().getName());
        res.setName(entity.getName());
        res.setCode(entity.getCode());
        res.setDescription(entity.getDescription());
        res.setStatus(entity.getStatus());
        res.setCreatedAt(entity.getCreatedAt());
        res.setUpdatedAt(entity.getUpdatedAt());

        res.setProgramCount(programRepository.countByDepartmentId(entity.getId()));
        res.setFacultyCount(facultyRepository.countByDepartmentId(entity.getId()));
        res.setStudentCount(studentRepository.countByDepartmentId(entity.getId()));

        Optional<DepartmentHOD> activeHod = departmentHODRepository.findFirstByDepartmentIdAndStatus(entity.getId(), "ACTIVE");
        if (activeHod.isPresent() && activeHod.get().getFaculty() != null) {
            var facUser = activeHod.get().getFaculty().getUser();
            res.setHodName(facUser.getFirstName() + " " + facUser.getLastName());
        }

        return res;
    }
}
