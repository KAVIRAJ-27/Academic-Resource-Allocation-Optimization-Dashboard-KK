package com.ahrao.service.academic.impl;

import com.ahrao.dto.academic.CreateSemesterRequest;
import com.ahrao.dto.academic.SectionSummaryResponse;
import com.ahrao.dto.academic.SemesterDetailsResponse;
import com.ahrao.dto.academic.SemesterSummaryResponse;
import com.ahrao.dto.academic.SubjectSummaryResponse;
import com.ahrao.dto.academic.UpdateSemesterRequest;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.entity.academic.AcademicYear;
import com.ahrao.entity.academic.Section;
import com.ahrao.entity.academic.Semester;
import com.ahrao.entity.academic.Subject;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.AcademicYearRepository;
import com.ahrao.repository.academic.SectionRepository;
import com.ahrao.repository.academic.SemesterRepository;
import com.ahrao.repository.academic.SubjectRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.academic.SemesterManagementService;
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
public class SemesterManagementServiceImpl implements SemesterManagementService {

    private final SemesterRepository semesterRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SubjectRepository subjectRepository;
    private final SectionRepository sectionRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public SemesterManagementServiceImpl(
            SemesterRepository semesterRepository,
            AcademicYearRepository academicYearRepository,
            SubjectRepository subjectRepository,
            SectionRepository sectionRepository,
            AuditLogRepository auditLogRepository,
            UserRepository userRepository) {
        this.semesterRepository = semesterRepository;
        this.academicYearRepository = academicYearRepository;
        this.subjectRepository = subjectRepository;
        this.sectionRepository = sectionRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<SemesterSummaryResponse> getSemesters(
            Long academicYearId, String status, String search, Pageable pageable) {

        Specification<Semester> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (academicYearId != null) {
                predicates.add(cb.equal(root.get("academicYear").get("id"), academicYearId));
            }

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("name")), pattern));
            }

            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Semester> page = semesterRepository.findAll(spec, pageable);
        List<SemesterSummaryResponse> content = page.getContent().stream()
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
    public SemesterDetailsResponse getSemesterById(Long id) {
        Semester semester = semesterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with ID: " + id));

        SemesterDetailsResponse response = new SemesterDetailsResponse();
        response.setId(semester.getId());
        response.setAcademicYearId(semester.getAcademicYear().getId());
        response.setAcademicYearName(semester.getAcademicYear().getName());
        response.setName(semester.getName());
        response.setNumber(semester.getNumber());
        response.setStartDate(semester.getStartDate());
        response.setEndDate(semester.getEndDate());
        response.setStatus(semester.getStatus());

        response.setSubjectCount(subjectRepository.countBySemesterId(id));
        response.setSectionCount(sectionRepository.countBySemesterId(id));

        List<Subject> subjects = subjectRepository.findBySemesterId(id);
        List<SubjectSummaryResponse> subjectResponses = subjects.stream()
                .map(s -> {
                    SubjectSummaryResponse ssr = new SubjectSummaryResponse();
                    ssr.setId(s.getId());
                    ssr.setProgramId(s.getProgram().getId());
                    ssr.setProgramName(s.getProgram().getName());
                    ssr.setProgramCode(s.getProgram().getCode());
                    ssr.setDepartmentId(s.getProgram().getDepartment().getId());
                    ssr.setDepartmentName(s.getProgram().getDepartment().getName());
                    ssr.setSemesterId(id);
                    ssr.setSemesterName(semester.getName());
                    ssr.setSemesterNumber(semester.getNumber());
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

        List<Section> sections = sectionRepository.findBySemesterId(id);
        List<SectionSummaryResponse> sectionResponses = sections.stream()
                .map(sec -> {
                    SectionSummaryResponse ssr = new SectionSummaryResponse();
                    ssr.setId(sec.getId());
                    ssr.setProgramId(sec.getProgram().getId());
                    ssr.setProgramName(sec.getProgram().getName());
                    ssr.setProgramCode(sec.getProgram().getCode());
                    ssr.setDepartmentId(sec.getProgram().getDepartment().getId());
                    ssr.setDepartmentName(sec.getProgram().getDepartment().getName());
                    ssr.setAcademicYearId(sec.getAcademicYear().getId());
                    ssr.setAcademicYearName(sec.getAcademicYear().getName());
                    ssr.setSemesterId(id);
                    ssr.setSemesterName(semester.getName());
                    ssr.setSemesterNumber(semester.getNumber());
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
    public SemesterSummaryResponse createSemester(
            CreateSemesterRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        if (!request.getStartDate().isBefore(request.getEndDate())) {
            throw new BadRequestException("Start date must be strictly before end date.");
        }

        AcademicYear year = academicYearRepository.findById(request.getAcademicYearId())
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found with ID: " + request.getAcademicYearId()));

        if (semesterRepository.existsByAcademicYearIdAndNumber(year.getId(), request.getNumber())) {
            throw new ConflictException("Semester number " + request.getNumber() + " already exists in academic year " + year.getName());
        }

        Semester semester = new Semester();
        semester.setAcademicYear(year);
        semester.setName(request.getName().trim());
        semester.setNumber(request.getNumber());
        semester.setStartDate(request.getStartDate());
        semester.setEndDate(request.getEndDate());
        semester.setStatus("ACTIVE");

        Semester saved = semesterRepository.save(semester);

        logAudit(adminUsername, "SEMESTER_CREATED", "Semester", saved.getId(), null,
                "{\"name\":\"" + saved.getName() + "\",\"number\":" + saved.getNumber() + "}", ipAddress, userAgent);

        return toSummaryResponse(saved);
    }

    @Override
    @Transactional
    public SemesterSummaryResponse updateSemester(
            Long id,
            UpdateSemesterRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Semester semester = semesterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with ID: " + id));

        if (!request.getStartDate().isBefore(request.getEndDate())) {
            throw new BadRequestException("Start date must be strictly before end date.");
        }

        if (semesterRepository.existsByAcademicYearIdAndNumberAndIdNot(semester.getAcademicYear().getId(), request.getNumber(), id)) {
            throw new ConflictException("Semester number " + request.getNumber() + " already exists in academic year " + semester.getAcademicYear().getName());
        }

        String oldValue = "{\"name\":\"" + semester.getName() + "\",\"number\":" + semester.getNumber() + "}";
        semester.setName(request.getName().trim());
        semester.setNumber(request.getNumber());
        semester.setStartDate(request.getStartDate());
        semester.setEndDate(request.getEndDate());

        Semester updated = semesterRepository.save(semester);
        String newValue = "{\"name\":\"" + updated.getName() + "\",\"number\":" + updated.getNumber() + "}";

        logAudit(adminUsername, "SEMESTER_UPDATED", "Semester", updated.getId(), oldValue, newValue, ipAddress, userAgent);

        return toSummaryResponse(updated);
    }

    @Override
    @Transactional
    public SemesterSummaryResponse updateSemesterStatus(
            Long id,
            String status,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Semester semester = semesterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with ID: " + id));

        String targetStatus = status.trim().toUpperCase();

        if (!targetStatus.equals("ACTIVE")) {
            long activeSubjects = subjectRepository.countBySemesterIdAndStatus(id, "ACTIVE");
            if (activeSubjects > 0) {
                throw new ConflictException("Cannot deactivate semester '" + semester.getName() +
                        "' because it has " + activeSubjects + " active subject(s).");
            }
            long activeSections = sectionRepository.countBySemesterIdAndStatus(id, "ACTIVE");
            if (activeSections > 0) {
                throw new ConflictException("Cannot deactivate semester '" + semester.getName() +
                        "' because it has " + activeSections + " active cohort section(s).");
            }
        }

        String oldValue = "{\"status\":\"" + semester.getStatus() + "\"}";
        semester.setStatus(targetStatus);
        Semester saved = semesterRepository.save(semester);
        String newValue = "{\"status\":\"" + saved.getStatus() + "\"}";

        logAudit(adminUsername, "SEMESTER_STATUS_CHANGED", "Semester", saved.getId(), oldValue, newValue, ipAddress, userAgent);

        return toSummaryResponse(saved);
    }

    @Override
    @Transactional
    public void deleteSemester(Long id, String adminUsername, String ipAddress, String userAgent) {
        Semester semester = semesterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with ID: " + id));

        long subjects = subjectRepository.countBySemesterId(id);
        if (subjects > 0) {
            throw new ConflictException("Semester cannot be deleted because " + subjects + " subject(s) are assigned to it.");
        }
        long sections = sectionRepository.countBySemesterId(id);
        if (sections > 0) {
            throw new ConflictException("Semester cannot be deleted because " + sections + " section(s) are configured for it.");
        }

        semesterRepository.delete(semester);

        logAudit(adminUsername, "SEMESTER_DELETED", "Semester", id,
                "{\"name\":\"" + semester.getName() + "\"}", null, ipAddress, userAgent);
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

    private SemesterSummaryResponse toSummaryResponse(Semester entity) {
        SemesterSummaryResponse res = new SemesterSummaryResponse();
        res.setId(entity.getId());
        res.setAcademicYearId(entity.getAcademicYear().getId());
        res.setAcademicYearName(entity.getAcademicYear().getName());
        res.setName(entity.getName());
        res.setNumber(entity.getNumber());
        res.setStartDate(entity.getStartDate());
        res.setEndDate(entity.getEndDate());
        res.setStatus(entity.getStatus());

        res.setSubjectCount(subjectRepository.countBySemesterId(entity.getId()));
        res.setSectionCount(sectionRepository.countBySemesterId(entity.getId()));

        return res;
    }
}
