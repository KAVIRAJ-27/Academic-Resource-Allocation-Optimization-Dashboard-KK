package com.ahrao.service.academic.impl;

import com.ahrao.dto.academic.CreateProgramRequest;
import com.ahrao.dto.academic.ProgramDetailsResponse;
import com.ahrao.dto.academic.ProgramSummaryResponse;
import com.ahrao.dto.academic.SectionSummaryResponse;
import com.ahrao.dto.academic.SubjectSummaryResponse;
import com.ahrao.dto.academic.UpdateProgramRequest;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Program;
import com.ahrao.entity.academic.Section;
import com.ahrao.entity.academic.Subject;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.DepartmentRepository;
import com.ahrao.repository.academic.ProgramRepository;
import com.ahrao.repository.academic.SectionRepository;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.academic.SubjectRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.academic.ProgramManagementService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProgramManagementServiceImpl implements ProgramManagementService {

    private final ProgramRepository programRepository;
    private final DepartmentRepository departmentRepository;
    private final SubjectRepository subjectRepository;
    private final SectionRepository sectionRepository;
    private final StudentRepository studentRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public ProgramManagementServiceImpl(
            ProgramRepository programRepository,
            DepartmentRepository departmentRepository,
            SubjectRepository subjectRepository,
            SectionRepository sectionRepository,
            StudentRepository studentRepository,
            AuditLogRepository auditLogRepository,
            UserRepository userRepository) {
        this.programRepository = programRepository;
        this.departmentRepository = departmentRepository;
        this.subjectRepository = subjectRepository;
        this.sectionRepository = sectionRepository;
        this.studentRepository = studentRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProgramSummaryResponse> getPrograms(
            String search, Long departmentId, String status, Pageable pageable) {

        Specification<Program> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (departmentId != null) {
                predicates.add(cb.equal(root.get("department").get("id"), departmentId));
            }

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

        Page<Program> page = programRepository.findAll(spec, pageable);
        List<ProgramSummaryResponse> content = page.getContent().stream()
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
    public ProgramDetailsResponse getProgramById(Long id) {
        Program program = programRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program not found with ID: " + id));

        ProgramDetailsResponse response = new ProgramDetailsResponse();
        response.setId(program.getId());
        response.setDepartmentId(program.getDepartment().getId());
        response.setDepartmentName(program.getDepartment().getName());
        response.setDepartmentCode(program.getDepartment().getCode());
        response.setName(program.getName());
        response.setCode(program.getCode());
        response.setDegreeType(program.getDegreeType());
        response.setDurationYears(program.getDurationYears());
        response.setStatus(program.getStatus());
        response.setCreatedAt(program.getCreatedAt());
        response.setUpdatedAt(program.getUpdatedAt());

        response.setSubjectCount(subjectRepository.countByProgramId(id));
        response.setSectionCount(sectionRepository.countByProgramId(id));
        response.setStudentCount(studentRepository.countByProgramId(id));

        List<Subject> subjects = subjectRepository.findByProgramId(id);
        List<SubjectSummaryResponse> subjectResponses = subjects.stream()
                .map(s -> {
                    SubjectSummaryResponse ssr = new SubjectSummaryResponse();
                    ssr.setId(s.getId());
                    ssr.setProgramId(id);
                    ssr.setProgramName(program.getName());
                    ssr.setProgramCode(program.getCode());
                    ssr.setDepartmentId(program.getDepartment().getId());
                    ssr.setDepartmentName(program.getDepartment().getName());
                    ssr.setSemesterId(s.getSemester().getId());
                    ssr.setSemesterName(s.getSemester().getName());
                    ssr.setSemesterNumber(s.getSemester().getNumber());
                    ssr.setCode(s.getCode());
                    ssr.setName(s.getName());
                    ssr.setCredits(s.getCredits());
                    ssr.setSubjectType(s.getSubjectType());
                    ssr.setStatus(s.getStatus());
                    ssr.setCreatedAt(s.getCreatedAt());
                    ssr.setUpdatedAt(s.getUpdatedAt());
                    return ssr;
                })
                .collect(Collectors.toList());
        response.setSubjects(subjectResponses);

        List<Section> sections = sectionRepository.findByProgramId(id);
        List<SectionSummaryResponse> sectionResponses = sections.stream()
                .map(sec -> {
                    SectionSummaryResponse ssr = new SectionSummaryResponse();
                    ssr.setId(sec.getId());
                    ssr.setProgramId(id);
                    ssr.setProgramName(program.getName());
                    ssr.setProgramCode(program.getCode());
                    ssr.setDepartmentId(program.getDepartment().getId());
                    ssr.setDepartmentName(program.getDepartment().getName());
                    ssr.setAcademicYearId(sec.getAcademicYear().getId());
                    ssr.setAcademicYearName(sec.getAcademicYear().getName());
                    ssr.setSemesterId(sec.getSemester().getId());
                    ssr.setSemesterName(sec.getSemester().getName());
                    ssr.setSemesterNumber(sec.getSemester().getNumber());
                    ssr.setName(sec.getName());
                    ssr.setCapacity(sec.getCapacity());
                    ssr.setStatus(sec.getStatus());
                    return ssr;
                })
                .collect(Collectors.toList());
        response.setSections(sectionResponses);

        return response;
    }

    @Override
    @Transactional
    public ProgramSummaryResponse createProgram(
            CreateProgramRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        String normalizedCode = request.getCode().trim().toUpperCase();
        String normalizedName = request.getName().trim();

        if (programRepository.existsByDepartmentIdAndCode(department.getId(), normalizedCode)) {
            throw new ConflictException("Program code '" + normalizedCode + "' already exists in department " + department.getName());
        }

        if (programRepository.existsByDepartmentIdAndName(department.getId(), normalizedName)) {
            throw new ConflictException("Program name '" + normalizedName + "' already exists in department " + department.getName());
        }

        Program program = new Program();
        program.setDepartment(department);
        program.setName(normalizedName);
        program.setCode(normalizedCode);
        program.setDegreeType(request.getDegreeType());
        program.setDurationYears(request.getDurationYears());
        program.setStatus("ACTIVE");

        Program saved = programRepository.save(program);

        logAudit(adminUsername, "PROGRAM_CREATED", "Program", saved.getId(), null,
                "{\"name\":\"" + saved.getName() + "\",\"code\":\"" + saved.getCode() + "\"}", ipAddress, userAgent);

        return toSummaryResponse(saved);
    }

    @Override
    @Transactional
    public ProgramSummaryResponse updateProgram(
            Long id,
            UpdateProgramRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Program program = programRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program not found with ID: " + id));

        String normalizedCode = request.getCode().trim().toUpperCase();
        String normalizedName = request.getName().trim();

        if (programRepository.existsByDepartmentIdAndCodeAndIdNot(program.getDepartment().getId(), normalizedCode, id)) {
            throw new ConflictException("Program code '" + normalizedCode + "' already exists in department " + program.getDepartment().getName());
        }

        if (programRepository.existsByDepartmentIdAndNameAndIdNot(program.getDepartment().getId(), normalizedName, id)) {
            throw new ConflictException("Program name '" + normalizedName + "' already exists in department " + program.getDepartment().getName());
        }

        String oldValue = "{\"name\":\"" + program.getName() + "\",\"code\":\"" + program.getCode() + "\"}";
        program.setName(normalizedName);
        program.setCode(normalizedCode);
        program.setDegreeType(request.getDegreeType());
        program.setDurationYears(request.getDurationYears());

        Program updated = programRepository.save(program);
        String newValue = "{\"name\":\"" + updated.getName() + "\",\"code\":\"" + updated.getCode() + "\"}";

        logAudit(adminUsername, "PROGRAM_UPDATED", "Program", updated.getId(), oldValue, newValue, ipAddress, userAgent);

        return toSummaryResponse(updated);
    }

    @Override
    @Transactional
    public ProgramSummaryResponse updateProgramStatus(
            Long id,
            String status,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Program program = programRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program not found with ID: " + id));

        String targetStatus = status.trim().toUpperCase();

        if (!targetStatus.equals("ACTIVE")) {
            long activeSubjects = subjectRepository.countByProgramIdAndStatus(id, "ACTIVE");
            if (activeSubjects > 0) {
                throw new ConflictException("Cannot deactivate program '" + program.getName() +
                        "' because it has " + activeSubjects + " active subject(s).");
            }
            long activeSections = sectionRepository.countByProgramIdAndStatus(id, "ACTIVE");
            if (activeSections > 0) {
                throw new ConflictException("Cannot deactivate program '" + program.getName() +
                        "' because it has " + activeSections + " active cohort section(s).");
            }
            long activeStudents = studentRepository.countByProgramId(id);
            if (activeStudents > 0) {
                throw new ConflictException("Cannot deactivate program '" + program.getName() +
                        "' because it has " + activeStudents + " enrolled student(s).");
            }
        }

        String oldValue = "{\"status\":\"" + program.getStatus() + "\"}";
        program.setStatus(targetStatus);
        Program saved = programRepository.save(program);
        String newValue = "{\"status\":\"" + saved.getStatus() + "\"}";

        logAudit(adminUsername, "PROGRAM_STATUS_CHANGED", "Program", saved.getId(), oldValue, newValue, ipAddress, userAgent);

        return toSummaryResponse(saved);
    }

    @Override
    @Transactional
    public void deleteProgram(Long id, String adminUsername, String ipAddress, String userAgent) {
        Program program = programRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program not found with ID: " + id));

        long subjects = subjectRepository.countByProgramId(id);
        if (subjects > 0) {
            throw new ConflictException("Program cannot be deleted because " + subjects + " subject(s) are registered under it.");
        }
        long sections = sectionRepository.countByProgramId(id);
        if (sections > 0) {
            throw new ConflictException("Program cannot be deleted because " + sections + " section(s) are associated with it.");
        }
        long students = studentRepository.countByProgramId(id);
        if (students > 0) {
            throw new ConflictException("Program cannot be deleted because " + students + " student(s) are enrolled in it.");
        }

        programRepository.delete(program);

        logAudit(adminUsername, "PROGRAM_DELETED", "Program", id,
                "{\"name\":\"" + program.getName() + "\"}", null, ipAddress, userAgent);
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

    private ProgramSummaryResponse toSummaryResponse(Program entity) {
        ProgramSummaryResponse res = new ProgramSummaryResponse();
        res.setId(entity.getId());
        res.setDepartmentId(entity.getDepartment().getId());
        res.setDepartmentName(entity.getDepartment().getName());
        res.setDepartmentCode(entity.getDepartment().getCode());
        res.setName(entity.getName());
        res.setCode(entity.getCode());
        res.setDegreeType(entity.getDegreeType());
        res.setDurationYears(entity.getDurationYears());
        res.setStatus(entity.getStatus());
        res.setCreatedAt(entity.getCreatedAt());
        res.setUpdatedAt(entity.getUpdatedAt());

        res.setSubjectCount(subjectRepository.countByProgramId(entity.getId()));
        res.setSectionCount(sectionRepository.countByProgramId(entity.getId()));
        res.setStudentCount(studentRepository.countByProgramId(entity.getId()));

        return res;
    }
}
