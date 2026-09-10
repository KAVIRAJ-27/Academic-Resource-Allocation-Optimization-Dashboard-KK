package com.ahrao.service.academic.impl;

import com.ahrao.dto.academic.AcademicYearDetailsResponse;
import com.ahrao.dto.academic.AcademicYearSummaryResponse;
import com.ahrao.dto.academic.CreateAcademicYearRequest;
import com.ahrao.dto.academic.SemesterSummaryResponse;
import com.ahrao.dto.academic.UpdateAcademicYearRequest;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.entity.academic.AcademicYear;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.academic.Semester;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.AcademicYearRepository;
import com.ahrao.repository.academic.InstitutionRepository;
import com.ahrao.repository.academic.SectionRepository;
import com.ahrao.repository.academic.SemesterRepository;
import com.ahrao.repository.academic.SubjectRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.academic.AcademicYearManagementService;
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
public class AcademicYearManagementServiceImpl implements AcademicYearManagementService {

    private final AcademicYearRepository academicYearRepository;
    private final InstitutionRepository institutionRepository;
    private final SemesterRepository semesterRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AcademicYearManagementServiceImpl(
            AcademicYearRepository academicYearRepository,
            InstitutionRepository institutionRepository,
            SemesterRepository semesterRepository,
            SectionRepository sectionRepository,
            SubjectRepository subjectRepository,
            AuditLogRepository auditLogRepository,
            UserRepository userRepository) {
        this.academicYearRepository = academicYearRepository;
        this.institutionRepository = institutionRepository;
        this.semesterRepository = semesterRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AcademicYearSummaryResponse> getAcademicYears(String search, String status, Pageable pageable) {
        Specification<AcademicYear> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("name")), pattern));
            }

            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<AcademicYear> page = academicYearRepository.findAll(spec, pageable);
        List<AcademicYearSummaryResponse> content = page.getContent().stream()
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
    public AcademicYearDetailsResponse getAcademicYearById(Long id) {
        AcademicYear year = academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found with ID: " + id));

        AcademicYearDetailsResponse response = new AcademicYearDetailsResponse();
        response.setId(year.getId());
        response.setInstitutionId(year.getInstitution().getId());
        response.setInstitutionName(year.getInstitution().getName());
        response.setName(year.getName());
        response.setStartDate(year.getStartDate());
        response.setEndDate(year.getEndDate());
        response.setStatus(year.getStatus());
        response.setCreatedAt(year.getCreatedAt());
        response.setUpdatedAt(year.getUpdatedAt());

        response.setSemesterCount(semesterRepository.countByAcademicYearId(id));
        response.setSectionCount(sectionRepository.countByAcademicYearId(id));

        List<Semester> semesters = semesterRepository.findByAcademicYearId(id);
        List<SemesterSummaryResponse> semesterResponses = semesters.stream()
                .map(s -> {
                    SemesterSummaryResponse ssr = new SemesterSummaryResponse();
                    ssr.setId(s.getId());
                    ssr.setAcademicYearId(id);
                    ssr.setAcademicYearName(year.getName());
                    ssr.setName(s.getName());
                    ssr.setNumber(s.getNumber());
                    ssr.setStartDate(s.getStartDate());
                    ssr.setEndDate(s.getEndDate());
                    ssr.setStatus(s.getStatus());
                    ssr.setSubjectCount(subjectRepository.countBySemesterId(s.getId()));
                    ssr.setSectionCount(sectionRepository.countBySemesterId(s.getId()));
                    return ssr;
                })
                .collect(Collectors.toList());
        response.setSemesters(semesterResponses);

        return response;
    }

    @Override
    @Transactional
    public AcademicYearSummaryResponse createAcademicYear(
            CreateAcademicYearRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        if (!request.getStartDate().isBefore(request.getEndDate())) {
            throw new BadRequestException("Start date must be strictly before end date.");
        }

        Institution institution;
        if (request.getInstitutionId() != null) {
            institution = institutionRepository.findById(request.getInstitutionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Institution not found with ID: " + request.getInstitutionId()));
        } else {
            institution = institutionRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("No default institution found."));
        }

        String normalizedName = request.getName().trim();

        if (academicYearRepository.existsByInstitutionIdAndName(institution.getId(), normalizedName)) {
            throw new ConflictException("Academic year '" + normalizedName + "' already exists in this institution.");
        }

        AcademicYear year = new AcademicYear();
        year.setInstitution(institution);
        year.setName(normalizedName);
        year.setStartDate(request.getStartDate());
        year.setEndDate(request.getEndDate());
        year.setStatus("ACTIVE");

        AcademicYear saved = academicYearRepository.save(year);

        logAudit(adminUsername, "ACADEMIC_YEAR_CREATED", "AcademicYear", saved.getId(), null,
                "{\"name\":\"" + saved.getName() + "\"}", ipAddress, userAgent);

        return toSummaryResponse(saved);
    }

    @Override
    @Transactional
    public AcademicYearSummaryResponse updateAcademicYear(
            Long id,
            UpdateAcademicYearRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        AcademicYear year = academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found with ID: " + id));

        if (!request.getStartDate().isBefore(request.getEndDate())) {
            throw new BadRequestException("Start date must be strictly before end date.");
        }

        String normalizedName = request.getName().trim();

        if (academicYearRepository.existsByInstitutionIdAndNameAndIdNot(year.getInstitution().getId(), normalizedName, id)) {
            throw new ConflictException("Academic year '" + normalizedName + "' already exists in this institution.");
        }

        String oldValue = "{\"name\":\"" + year.getName() + "\"}";
        year.setName(normalizedName);
        year.setStartDate(request.getStartDate());
        year.setEndDate(request.getEndDate());

        AcademicYear updated = academicYearRepository.save(year);
        String newValue = "{\"name\":\"" + updated.getName() + "\"}";

        logAudit(adminUsername, "ACADEMIC_YEAR_UPDATED", "AcademicYear", updated.getId(), oldValue, newValue, ipAddress, userAgent);

        return toSummaryResponse(updated);
    }

    @Override
    @Transactional
    public AcademicYearSummaryResponse updateAcademicYearStatus(
            Long id,
            String status,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        AcademicYear year = academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found with ID: " + id));

        String targetStatus = status.trim().toUpperCase();

        if (!targetStatus.equals("ACTIVE")) {
            long activeSemesters = semesterRepository.countByAcademicYearIdAndStatus(id, "ACTIVE");
            if (activeSemesters > 0) {
                throw new ConflictException("Cannot deactivate academic year '" + year.getName() +
                        "' because it has " + activeSemesters + " active semester(s). Conclude or deactivate them first.");
            }
            long activeSections = sectionRepository.countByAcademicYearIdAndStatus(id, "ACTIVE");
            if (activeSections > 0) {
                throw new ConflictException("Cannot deactivate academic year '" + year.getName() +
                        "' because it has " + activeSections + " active cohort section(s).");
            }
        }

        String oldValue = "{\"status\":\"" + year.getStatus() + "\"}";
        year.setStatus(targetStatus);
        AcademicYear saved = academicYearRepository.save(year);
        String newValue = "{\"status\":\"" + saved.getStatus() + "\"}";

        logAudit(adminUsername, "ACADEMIC_YEAR_STATUS_CHANGED", "AcademicYear", saved.getId(), oldValue, newValue, ipAddress, userAgent);

        return toSummaryResponse(saved);
    }

    @Override
    @Transactional
    public AcademicYearSummaryResponse activateAcademicYear(
            Long id,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        AcademicYear targetYear = academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found with ID: " + id));

        // Deactivate any currently active academic year in the institution
        List<AcademicYear> activeYears = academicYearRepository.findByInstitutionId(targetYear.getInstitution().getId())
                .stream()
                .filter(y -> "ACTIVE".equalsIgnoreCase(y.getStatus()) && !y.getId().equals(id))
                .collect(Collectors.toList());

        for (AcademicYear activeYear : activeYears) {
            activeYear.setStatus("INACTIVE");
            academicYearRepository.save(activeYear);
        }

        targetYear.setStatus("ACTIVE");
        AcademicYear saved = academicYearRepository.save(targetYear);

        logAudit(adminUsername, "ACADEMIC_YEAR_ACTIVATED", "AcademicYear", saved.getId(), null,
                "{\"name\":\"" + saved.getName() + "\",\"status\":\"ACTIVE\"}", ipAddress, userAgent);

        return toSummaryResponse(saved);
    }

    @Override
    @Transactional
    public void deleteAcademicYear(Long id, String adminUsername, String ipAddress, String userAgent) {
        AcademicYear year = academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found with ID: " + id));

        long semesters = semesterRepository.countByAcademicYearId(id);
        if (semesters > 0) {
            throw new ConflictException("Academic year cannot be deleted because " + semesters + " semester(s) are configured under it.");
        }
        long sections = sectionRepository.countByAcademicYearId(id);
        if (sections > 0) {
            throw new ConflictException("Academic year cannot be deleted because " + sections + " section(s) are linked to it.");
        }

        academicYearRepository.delete(year);

        logAudit(adminUsername, "ACADEMIC_YEAR_DELETED", "AcademicYear", id,
                "{\"name\":\"" + year.getName() + "\"}", null, ipAddress, userAgent);
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

    private AcademicYearSummaryResponse toSummaryResponse(AcademicYear entity) {
        AcademicYearSummaryResponse res = new AcademicYearSummaryResponse();
        res.setId(entity.getId());
        res.setInstitutionId(entity.getInstitution().getId());
        res.setInstitutionName(entity.getInstitution().getName());
        res.setName(entity.getName());
        res.setStartDate(entity.getStartDate());
        res.setEndDate(entity.getEndDate());
        res.setStatus(entity.getStatus());
        res.setCreatedAt(entity.getCreatedAt());
        res.setUpdatedAt(entity.getUpdatedAt());

        res.setSemesterCount(semesterRepository.countByAcademicYearId(entity.getId()));
        res.setSectionCount(sectionRepository.countByAcademicYearId(entity.getId()));

        return res;
    }
}
