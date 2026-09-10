package com.ahrao.service.academic.impl;

import com.ahrao.dto.academic.CreateSubjectRequest;
import com.ahrao.dto.academic.SubjectDetailsResponse;
import com.ahrao.dto.academic.SubjectSummaryResponse;
import com.ahrao.dto.academic.UpdateSubjectRequest;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.entity.academic.Program;
import com.ahrao.entity.academic.Semester;
import com.ahrao.entity.academic.Subject;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.ProgramRepository;
import com.ahrao.repository.academic.SemesterRepository;
import com.ahrao.repository.academic.SubjectRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.academic.SubjectManagementService;
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
public class SubjectManagementServiceImpl implements SubjectManagementService {

    private final SubjectRepository subjectRepository;
    private final ProgramRepository programRepository;
    private final SemesterRepository semesterRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public SubjectManagementServiceImpl(
            SubjectRepository subjectRepository,
            ProgramRepository programRepository,
            SemesterRepository semesterRepository,
            AuditLogRepository auditLogRepository,
            UserRepository userRepository) {
        this.subjectRepository = subjectRepository;
        this.programRepository = programRepository;
        this.semesterRepository = semesterRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<SubjectSummaryResponse> getSubjects(
            String search, Long departmentId, Long programId, Long semesterId, String status, Pageable pageable) {

        Specification<Subject> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (departmentId != null) {
                predicates.add(cb.equal(root.get("program").get("department").get("id"), departmentId));
            }

            if (programId != null) {
                predicates.add(cb.equal(root.get("program").get("id"), programId));
            }

            if (semesterId != null) {
                predicates.add(cb.equal(root.get("semester").get("id"), semesterId));
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

        Page<Subject> page = subjectRepository.findAll(spec, pageable);
        List<SubjectSummaryResponse> content = page.getContent().stream()
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
    public SubjectDetailsResponse getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + id));

        SubjectDetailsResponse response = new SubjectDetailsResponse();
        response.setId(subject.getId());
        response.setProgramId(subject.getProgram().getId());
        response.setProgramName(subject.getProgram().getName());
        response.setProgramCode(subject.getProgram().getCode());
        response.setDepartmentId(subject.getProgram().getDepartment().getId());
        response.setDepartmentName(subject.getProgram().getDepartment().getName());
        response.setSemesterId(subject.getSemester().getId());
        response.setSemesterName(subject.getSemester().getName());
        response.setSemesterNumber(subject.getSemester().getNumber());
        response.setCode(subject.getCode());
        response.setName(subject.getName());
        response.setCredits(subject.getCredits());
        response.setSubjectType(subject.getSubjectType());
        response.setStatus(subject.getStatus());
        response.setCreatedAt(subject.getCreatedAt());
        response.setUpdatedAt(subject.getUpdatedAt());

        return response;
    }

    @Override
    @Transactional
    public SubjectSummaryResponse createSubject(
            CreateSubjectRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Program program = programRepository.findById(request.getProgramId())
                .orElseThrow(() -> new ResourceNotFoundException("Program not found with ID: " + request.getProgramId()));

        Semester semester = semesterRepository.findById(request.getSemesterId())
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with ID: " + request.getSemesterId()));

        String normalizedCode = request.getCode().trim().toUpperCase();

        if (subjectRepository.existsByProgramIdAndCode(program.getId(), normalizedCode)) {
            throw new ConflictException("Subject code '" + normalizedCode + "' already exists in program " + program.getName());
        }

        Subject subject = new Subject();
        subject.setProgram(program);
        subject.setSemester(semester);
        subject.setCode(normalizedCode);
        subject.setName(request.getName().trim());
        subject.setCredits(request.getCredits());
        subject.setSubjectType(request.getSubjectType());
        subject.setStatus("ACTIVE");

        Subject saved = subjectRepository.save(subject);

        logAudit(adminUsername, "SUBJECT_CREATED", "Subject", saved.getId(), null,
                "{\"name\":\"" + saved.getName() + "\",\"code\":\"" + saved.getCode() + "\"}", ipAddress, userAgent);

        return toSummaryResponse(saved);
    }

    @Override
    @Transactional
    public SubjectSummaryResponse updateSubject(
            Long id,
            UpdateSubjectRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + id));

        Semester semester = semesterRepository.findById(request.getSemesterId())
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with ID: " + request.getSemesterId()));

        String normalizedCode = request.getCode().trim().toUpperCase();

        if (subjectRepository.existsByProgramIdAndCodeAndIdNot(subject.getProgram().getId(), normalizedCode, id)) {
            throw new ConflictException("Subject code '" + normalizedCode + "' already exists in program " + subject.getProgram().getName());
        }

        String oldValue = "{\"name\":\"" + subject.getName() + "\",\"code\":\"" + subject.getCode() + "\"}";
        subject.setSemester(semester);
        subject.setCode(normalizedCode);
        subject.setName(request.getName().trim());
        subject.setCredits(request.getCredits());
        subject.setSubjectType(request.getSubjectType());

        Subject updated = subjectRepository.save(subject);
        String newValue = "{\"name\":\"" + updated.getName() + "\",\"code\":\"" + updated.getCode() + "\"}";

        logAudit(adminUsername, "SUBJECT_UPDATED", "Subject", updated.getId(), oldValue, newValue, ipAddress, userAgent);

        return toSummaryResponse(updated);
    }

    @Override
    @Transactional
    public SubjectSummaryResponse updateSubjectStatus(
            Long id,
            String status,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + id));

        String targetStatus = status.trim().toUpperCase();
        String oldValue = "{\"status\":\"" + subject.getStatus() + "\"}";
        subject.setStatus(targetStatus);
        Subject saved = subjectRepository.save(subject);
        String newValue = "{\"status\":\"" + saved.getStatus() + "\"}";

        logAudit(adminUsername, "SUBJECT_STATUS_CHANGED", "Subject", saved.getId(), oldValue, newValue, ipAddress, userAgent);

        return toSummaryResponse(saved);
    }

    @Override
    @Transactional
    public void deleteSubject(Long id, String adminUsername, String ipAddress, String userAgent) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + id));

        subjectRepository.delete(subject);

        logAudit(adminUsername, "SUBJECT_DELETED", "Subject", id,
                "{\"name\":\"" + subject.getName() + "\"}", null, ipAddress, userAgent);
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

    private SubjectSummaryResponse toSummaryResponse(Subject entity) {
        SubjectSummaryResponse res = new SubjectSummaryResponse();
        res.setId(entity.getId());
        res.setProgramId(entity.getProgram().getId());
        res.setProgramName(entity.getProgram().getName());
        res.setProgramCode(entity.getProgram().getCode());
        res.setDepartmentId(entity.getProgram().getDepartment().getId());
        res.setDepartmentName(entity.getProgram().getDepartment().getName());
        res.setSemesterId(entity.getSemester().getId());
        res.setSemesterName(entity.getSemester().getName());
        res.setSemesterNumber(entity.getSemester().getNumber());
        res.setCode(entity.getCode());
        res.setName(entity.getName());
        res.setCredits(entity.getCredits());
        res.setSubjectType(entity.getSubjectType());
        res.setStatus(entity.getStatus());
        res.setCreatedAt(entity.getCreatedAt());
        res.setUpdatedAt(entity.getUpdatedAt());
        return res;
    }
}
