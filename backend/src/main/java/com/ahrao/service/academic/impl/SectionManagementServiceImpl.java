package com.ahrao.service.academic.impl;

import com.ahrao.dto.academic.CreateSectionRequest;
import com.ahrao.dto.academic.SectionDetailsResponse;
import com.ahrao.dto.academic.SectionSummaryResponse;
import com.ahrao.dto.academic.UpdateSectionRequest;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.entity.academic.AcademicYear;
import com.ahrao.entity.academic.Program;
import com.ahrao.entity.academic.Section;
import com.ahrao.entity.academic.Semester;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.AcademicYearRepository;
import com.ahrao.repository.academic.ProgramRepository;
import com.ahrao.repository.academic.SectionRepository;
import com.ahrao.repository.academic.SemesterRepository;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.academic.SectionManagementService;
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
public class SectionManagementServiceImpl implements SectionManagementService {

    private final SectionRepository sectionRepository;
    private final ProgramRepository programRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SemesterRepository semesterRepository;
    private final StudentRepository studentRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public SectionManagementServiceImpl(
            SectionRepository sectionRepository,
            ProgramRepository programRepository,
            AcademicYearRepository academicYearRepository,
            SemesterRepository semesterRepository,
            StudentRepository studentRepository,
            AuditLogRepository auditLogRepository,
            UserRepository userRepository) {
        this.sectionRepository = sectionRepository;
        this.programRepository = programRepository;
        this.academicYearRepository = academicYearRepository;
        this.semesterRepository = semesterRepository;
        this.studentRepository = studentRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<SectionSummaryResponse> getSections(
            String search,
            Long departmentId,
            Long programId,
            Long academicYearId,
            Long semesterId,
            String status,
            Pageable pageable) {

        Specification<Section> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (departmentId != null) {
                predicates.add(cb.equal(root.get("program").get("department").get("id"), departmentId));
            }

            if (programId != null) {
                predicates.add(cb.equal(root.get("program").get("id"), programId));
            }

            if (academicYearId != null) {
                predicates.add(cb.equal(root.get("academicYear").get("id"), academicYearId));
            }

            if (semesterId != null) {
                predicates.add(cb.equal(root.get("semester").get("id"), semesterId));
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

        Page<Section> page = sectionRepository.findAll(spec, pageable);
        List<SectionSummaryResponse> content = page.getContent().stream()
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
    public SectionDetailsResponse getSectionById(Long id) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with ID: " + id));

        SectionDetailsResponse response = new SectionDetailsResponse();
        response.setId(section.getId());
        response.setProgramId(section.getProgram().getId());
        response.setProgramName(section.getProgram().getName());
        response.setProgramCode(section.getProgram().getCode());
        response.setDepartmentId(section.getProgram().getDepartment().getId());
        response.setDepartmentName(section.getProgram().getDepartment().getName());
        response.setAcademicYearId(section.getAcademicYear().getId());
        response.setAcademicYearName(section.getAcademicYear().getName());
        response.setSemesterId(section.getSemester().getId());
        response.setSemesterName(section.getSemester().getName());
        response.setSemesterNumber(section.getSemester().getNumber());
        response.setName(section.getName());
        response.setCapacity(section.getCapacity());
        response.setStatus(section.getStatus());
        response.setStudentCount(studentRepository.countBySectionId(id));

        return response;
    }

    @Override
    @Transactional
    public SectionSummaryResponse createSection(
            CreateSectionRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Program program = programRepository.findById(request.getProgramId())
                .orElseThrow(() -> new ResourceNotFoundException("Program not found with ID: " + request.getProgramId()));

        AcademicYear academicYear = academicYearRepository.findById(request.getAcademicYearId())
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found with ID: " + request.getAcademicYearId()));

        Semester semester = semesterRepository.findById(request.getSemesterId())
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with ID: " + request.getSemesterId()));

        String normalizedName = request.getName().trim().toUpperCase();

        if (sectionRepository.existsByProgramIdAndAcademicYearIdAndSemesterIdAndName(
                program.getId(), academicYear.getId(), semester.getId(), normalizedName)) {
            throw new ConflictException("Section '" + normalizedName + "' already exists for program " +
                    program.getName() + " in " + academicYear.getName() + " (" + semester.getName() + ")");
        }

        Section section = new Section();
        section.setProgram(program);
        section.setAcademicYear(academicYear);
        section.setSemester(semester);
        section.setName(normalizedName);
        section.setCapacity(request.getCapacity());
        section.setStatus("ACTIVE");

        Section saved = sectionRepository.save(section);

        logAudit(adminUsername, "SECTION_CREATED", "Section", saved.getId(), null,
                "{\"name\":\"" + saved.getName() + "\",\"program\":\"" + program.getCode() + "\"}", ipAddress, userAgent);

        return toSummaryResponse(saved);
    }

    @Override
    @Transactional
    public SectionSummaryResponse updateSection(
            Long id,
            UpdateSectionRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with ID: " + id));

        String normalizedName = request.getName().trim().toUpperCase();

        if (sectionRepository.existsByProgramIdAndAcademicYearIdAndSemesterIdAndNameAndIdNot(
                section.getProgram().getId(), section.getAcademicYear().getId(), section.getSemester().getId(), normalizedName, id)) {
            throw new ConflictException("Section '" + normalizedName + "' already exists for this program and semester.");
        }

        String oldValue = "{\"name\":\"" + section.getName() + "\",\"capacity\":" + section.getCapacity() + "}";
        section.setName(normalizedName);
        section.setCapacity(request.getCapacity());

        Section updated = sectionRepository.save(section);
        String newValue = "{\"name\":\"" + updated.getName() + "\",\"capacity\":" + updated.getCapacity() + "}";

        logAudit(adminUsername, "SECTION_UPDATED", "Section", updated.getId(), oldValue, newValue, ipAddress, userAgent);

        return toSummaryResponse(updated);
    }

    @Override
    @Transactional
    public SectionSummaryResponse updateSectionStatus(
            Long id,
            String status,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with ID: " + id));

        String targetStatus = status.trim().toUpperCase();

        if (!targetStatus.equals("ACTIVE")) {
            long students = studentRepository.countBySectionId(id);
            if (students > 0) {
                throw new ConflictException("Cannot deactivate section '" + section.getName() +
                        "' because " + students + " student(s) are assigned to it.");
            }
        }

        String oldValue = "{\"status\":\"" + section.getStatus() + "\"}";
        section.setStatus(targetStatus);
        Section saved = sectionRepository.save(section);
        String newValue = "{\"status\":\"" + saved.getStatus() + "\"}";

        logAudit(adminUsername, "SECTION_STATUS_CHANGED", "Section", saved.getId(), oldValue, newValue, ipAddress, userAgent);

        return toSummaryResponse(saved);
    }

    @Override
    @Transactional
    public void deleteSection(Long id, String adminUsername, String ipAddress, String userAgent) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with ID: " + id));

        long students = studentRepository.countBySectionId(id);
        if (students > 0) {
            throw new ConflictException("Section cannot be deleted because " + students + " student(s) are assigned to it.");
        }

        sectionRepository.delete(section);

        logAudit(adminUsername, "SECTION_DELETED", "Section", id,
                "{\"name\":\"" + section.getName() + "\"}", null, ipAddress, userAgent);
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

    private SectionSummaryResponse toSummaryResponse(Section entity) {
        SectionSummaryResponse res = new SectionSummaryResponse();
        res.setId(entity.getId());
        res.setProgramId(entity.getProgram().getId());
        res.setProgramName(entity.getProgram().getName());
        res.setProgramCode(entity.getProgram().getCode());
        res.setDepartmentId(entity.getProgram().getDepartment().getId());
        res.setDepartmentName(entity.getProgram().getDepartment().getName());
        res.setAcademicYearId(entity.getAcademicYear().getId());
        res.setAcademicYearName(entity.getAcademicYear().getName());
        res.setSemesterId(entity.getSemester().getId());
        res.setSemesterName(entity.getSemester().getName());
        res.setSemesterNumber(entity.getSemester().getNumber());
        res.setName(entity.getName());
        res.setCapacity(entity.getCapacity());
        res.setStatus(entity.getStatus());
        res.setStudentCount(studentRepository.countBySectionId(entity.getId()));
        return res;
    }
}
