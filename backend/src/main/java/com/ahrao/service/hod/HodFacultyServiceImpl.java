package com.ahrao.service.hod;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hod.HodFacultyDetailDto;
import com.ahrao.dto.hod.HodFacultySummaryDto;
import com.ahrao.dto.hod.HodUpdateFacultyRequest;
import com.ahrao.dto.hod.HodUpdateStatusRequest;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Faculty;
import com.ahrao.entity.academic.FacultySubjectAssignment;
import com.ahrao.entity.academic.FacultyWorkload;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.FacultySubjectAssignmentRepository;
import com.ahrao.repository.academic.FacultyWorkloadRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.user.UserRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class HodFacultyServiceImpl implements HodFacultyService {

    private static final Logger log = LoggerFactory.getLogger(HodFacultyServiceImpl.class);

    private final HodDepartmentResolver hodDepartmentResolver;
    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final FacultySubjectAssignmentRepository facultySubjectAssignmentRepository;
    private final FacultyWorkloadRepository facultyWorkloadRepository;
    private final AcademicResourceRequestRepository academicResourceRequestRepository;
    private final AuditLogRepository auditLogRepository;

    public HodFacultyServiceImpl(
            HodDepartmentResolver hodDepartmentResolver,
            FacultyRepository facultyRepository,
            UserRepository userRepository,
            FacultySubjectAssignmentRepository facultySubjectAssignmentRepository,
            FacultyWorkloadRepository facultyWorkloadRepository,
            AcademicResourceRequestRepository academicResourceRequestRepository,
            AuditLogRepository auditLogRepository) {
        this.hodDepartmentResolver = hodDepartmentResolver;
        this.facultyRepository = facultyRepository;
        this.userRepository = userRepository;
        this.facultySubjectAssignmentRepository = facultySubjectAssignmentRepository;
        this.facultyWorkloadRepository = facultyWorkloadRepository;
        this.academicResourceRequestRepository = academicResourceRequestRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public PagedResponse<HodFacultySummaryDto> getFaculty(Long userId, String search, String status, Pageable pageable) {
        Department department = hodDepartmentResolver.resolveHodDepartment(userId);
        Long departmentId = department.getId();

        Specification<Faculty> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("department").get("id"), departmentId));

            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Join<Faculty, User> userJoin = root.join("user");
                Predicate empIdMatch = cb.like(cb.lower(root.get("employeeId")), pattern);
                Predicate firstNameMatch = cb.like(cb.lower(userJoin.get("firstName")), pattern);
                Predicate lastNameMatch = cb.like(cb.lower(userJoin.get("lastName")), pattern);
                Predicate emailMatch = cb.like(cb.lower(userJoin.get("email")), pattern);
                predicates.add(cb.or(empIdMatch, firstNameMatch, lastNameMatch, emailMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Faculty> facultyPage = facultyRepository.findAll(spec, pageable);

        List<HodFacultySummaryDto> dtoList = facultyPage.getContent().stream()
                .map(this::mapToSummaryDto)
                .toList();

        return new PagedResponse<>(
                dtoList,
                facultyPage.getNumber(),
                facultyPage.getSize(),
                facultyPage.getTotalElements(),
                facultyPage.getTotalPages(),
                facultyPage.isFirst(),
                facultyPage.isLast()
        );
    }

    @Override
    public HodFacultyDetailDto getFacultyById(Long userId, Long facultyId) {
        Department department = hodDepartmentResolver.resolveHodDepartment(userId);
        Long departmentId = department.getId();

        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + facultyId));

        // Strict department scope verification
        if (faculty.getDepartment() == null || !faculty.getDepartment().getId().equals(departmentId)) {
            log.warn("Security Alert: User {} attempted cross-department faculty access for facultyId={}", userId, facultyId);
            throw new ForbiddenException("Access denied: Faculty does not belong to your authorized department.");
        }

        HodFacultyDetailDto dto = new HodFacultyDetailDto();
        dto.setId(faculty.getId());
        User u = faculty.getUser();
        if (u != null) {
            dto.setUserId(u.getId());
            dto.setFirstName(u.getFirstName());
            dto.setLastName(u.getLastName());
            dto.setFullName((u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "")).trim());
            dto.setEmail(u.getEmail());
            dto.setPhone(u.getPhone());
        }
        dto.setEmployeeId(faculty.getEmployeeId());
        dto.setDesignation(faculty.getDesignation());
        dto.setQualification(faculty.getQualification());
        dto.setJoiningDate(faculty.getJoiningDate());
        dto.setStatus(faculty.getStatus());
        dto.setDepartmentId(department.getId());
        dto.setDepartmentName(department.getName());
        dto.setDepartmentCode(department.getCode());

        // Latest Workload
        Optional<FacultyWorkload> wlOpt = facultyWorkloadRepository.findFirstByFacultyIdOrderByCalculatedAtDesc(faculty.getId());
        if (wlOpt.isPresent()) {
            FacultyWorkload wl = wlOpt.get();
            dto.setTotalWorkloadHours(wl.getTotalHours() != null ? wl.getTotalHours() : BigDecimal.ZERO);
            dto.setTeachingHours(wl.getTeachingHours() != null ? wl.getTeachingHours() : BigDecimal.ZERO);
            dto.setLabHours(wl.getLabHours() != null ? wl.getLabHours() : BigDecimal.ZERO);
            dto.setOtherHours(wl.getOtherHours() != null ? wl.getOtherHours() : BigDecimal.ZERO);
            dto.setWorkloadStatus(wl.getWorkloadStatus() != null ? wl.getWorkloadStatus() : "BALANCED");
            dto.setWorkloadCalculatedAt(wl.getCalculatedAt());
        } else {
            dto.setTotalWorkloadHours(BigDecimal.ZERO);
            dto.setTeachingHours(BigDecimal.ZERO);
            dto.setLabHours(BigDecimal.ZERO);
            dto.setOtherHours(BigDecimal.ZERO);
            dto.setWorkloadStatus("PENDING_CALCULATION");
        }

        // Active Course Assignments
        List<FacultySubjectAssignment> assignments = facultySubjectAssignmentRepository.findActiveByFacultyIdWithDetails(faculty.getId());
        List<HodFacultyDetailDto.AssignedSubjectItem> assignedItems = new ArrayList<>();
        for (FacultySubjectAssignment a : assignments) {
            HodFacultyDetailDto.AssignedSubjectItem item = new HodFacultyDetailDto.AssignedSubjectItem();
            item.setAssignmentId(a.getId());
            if (a.getSubject() != null) {
                item.setSubjectId(a.getSubject().getId());
                item.setSubjectCode(a.getSubject().getCode());
                item.setSubjectName(a.getSubject().getName());
                item.setCredits(a.getSubject().getCredits());
                if (a.getSubject().getProgram() != null) {
                    item.setProgramId(a.getSubject().getProgram().getId());
                    item.setProgramName(a.getSubject().getProgram().getName());
                    item.setProgramCode(a.getSubject().getProgram().getCode());
                }
            }
            if (a.getSection() != null) {
                item.setSectionId(a.getSection().getId());
                item.setSectionName(a.getSection().getName());
            }
            item.setHoursPerWeek(a.getHoursPerWeek());
            item.setAcademicYear(a.getAcademicYear() != null ? a.getAcademicYear().getName() : "N/A");
            item.setSemesterName(a.getSemester() != null ? a.getSemester().getName() : "N/A");
            assignedItems.add(item);
        }
        dto.setAssignedSubjects(assignedItems);

        // Recent Resource Requests
        if (u != null) {
            List<AcademicResourceRequest> requests = academicResourceRequestRepository.findByRequesterUserId(u.getId());
            List<HodFacultyDetailDto.FacultyRequestItem> reqItems = requests.stream()
                    .sorted((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()))
                    .limit(5)
                    .map(r -> {
                        HodFacultyDetailDto.FacultyRequestItem ri = new HodFacultyDetailDto.FacultyRequestItem();
                        ri.setRequestId(r.getId());
                        if (r.getRequestedResource() != null) {
                            ri.setResourceName(r.getRequestedResource().getName());
                            ri.setResourceCode(r.getRequestedResource().getCode());
                        } else {
                            ri.setResourceName("Academic Resource");
                            ri.setResourceCode("N/A");
                        }
                        ri.setPurpose(r.getPurpose());
                        ri.setRequestedDate(r.getRequestedDate());
                        ri.setPriority(r.getPriority() != null ? r.getPriority().name() : "NORMAL");
                        ri.setStatus(r.getStatus() != null ? r.getStatus().name() : "PENDING");
                        ri.setCreatedAt(r.getCreatedAt());
                        return ri;
                    })
                    .toList();
            dto.setRecentRequests(reqItems);
        }

        return dto;
    }

    @Override
    @Transactional
    public HodFacultySummaryDto updateFacultyStatus(Long userId, Long facultyId, HodUpdateStatusRequest request) {
        Department department = hodDepartmentResolver.resolveHodDepartment(userId);
        Long departmentId = department.getId();
        Faculty hodFaculty = hodDepartmentResolver.resolveHodFaculty(userId);

        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + facultyId));

        if (faculty.getDepartment() == null || !faculty.getDepartment().getId().equals(departmentId)) {
            log.warn("Security Alert: User {} attempted cross-department faculty status change for facultyId={}", userId, facultyId);
            throw new ForbiddenException("Access denied: Faculty does not belong to your authorized department.");
        }

        String oldStatus = faculty.getStatus();
        String newStatus = request.getStatus().toUpperCase();

        faculty.setStatus(newStatus);
        User u = faculty.getUser();
        if (u != null) {
            u.setStatus(UserStatus.valueOf(newStatus));
            userRepository.save(u);
        }
        facultyRepository.save(faculty);

        // Audit Event
        AuditLog auditLog = new AuditLog();
        auditLog.setUser(hodFaculty.getUser());
        auditLog.setAction("HOD_FACULTY_STATUS_CHANGED");
        auditLog.setEntityType("Faculty");
        auditLog.setEntityId(faculty.getId());
        auditLog.setOldValue(oldStatus);
        auditLog.setNewValue(newStatus);
        auditLog.setCreatedAt(Instant.now());
        auditLogRepository.save(auditLog);

        log.info("HOD (userId={}) updated status of facultyId={} from {} to {}", userId, facultyId, oldStatus, newStatus);
        return mapToSummaryDto(faculty);
    }

    @Override
    @Transactional
    public HodFacultyDetailDto updateFacultyProfile(Long userId, Long facultyId, HodUpdateFacultyRequest request) {
        Department department = hodDepartmentResolver.resolveHodDepartment(userId);
        Long departmentId = department.getId();
        Faculty hodFaculty = hodDepartmentResolver.resolveHodFaculty(userId);

        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + facultyId));

        if (faculty.getDepartment() == null || !faculty.getDepartment().getId().equals(departmentId)) {
            log.warn("Security Alert: User {} attempted cross-department faculty update for facultyId={}", userId, facultyId);
            throw new ForbiddenException("Access denied: Faculty does not belong to your authorized department.");
        }

        if (request.getDesignation() != null && !request.getDesignation().isBlank()) {
            faculty.setDesignation(request.getDesignation().trim());
        }
        if (request.getQualification() != null) {
            faculty.setQualification(request.getQualification().trim());
        }

        User u = faculty.getUser();
        if (u != null && request.getPhone() != null) {
            u.setPhone(request.getPhone().trim());
            userRepository.save(u);
        }
        facultyRepository.save(faculty);

        // Audit Event
        AuditLog auditLog = new AuditLog();
        auditLog.setUser(hodFaculty.getUser());
        auditLog.setAction("HOD_FACULTY_UPDATED");
        auditLog.setEntityType("Faculty");
        auditLog.setEntityId(faculty.getId());
        auditLog.setNewValue(String.format("designation=%s, qualification=%s", faculty.getDesignation(), faculty.getQualification()));
        auditLog.setCreatedAt(Instant.now());
        auditLogRepository.save(auditLog);

        log.info("HOD (userId={}) updated permitted profile fields for facultyId={}", userId, facultyId);
        return getFacultyById(userId, facultyId);
    }

    private HodFacultySummaryDto mapToSummaryDto(Faculty faculty) {
        HodFacultySummaryDto dto = new HodFacultySummaryDto();
        dto.setId(faculty.getId());
        User u = faculty.getUser();
        if (u != null) {
            dto.setUserId(u.getId());
            dto.setFullName((u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "")).trim());
            dto.setEmail(u.getEmail());
            dto.setPhone(u.getPhone());
        } else {
            dto.setFullName("Faculty #" + faculty.getId());
            dto.setEmail("N/A");
        }
        dto.setEmployeeId(faculty.getEmployeeId());
        dto.setDesignation(faculty.getDesignation());
        dto.setQualification(faculty.getQualification());
        dto.setJoiningDate(faculty.getJoiningDate());
        dto.setStatus(faculty.getStatus());

        // Assigned subjects count
        long activeSubjects = facultySubjectAssignmentRepository.countByFacultyIdAndStatus(faculty.getId(), "ACTIVE");
        dto.setAssignedSubjectsCount((int) activeSubjects);

        // Workload hours & status
        Optional<FacultyWorkload> wlOpt = facultyWorkloadRepository.findFirstByFacultyIdOrderByCalculatedAtDesc(faculty.getId());
        if (wlOpt.isPresent()) {
            FacultyWorkload wl = wlOpt.get();
            dto.setTotalWorkloadHours(wl.getTotalHours() != null ? wl.getTotalHours() : BigDecimal.ZERO);
            dto.setWorkloadStatus(wl.getWorkloadStatus() != null ? wl.getWorkloadStatus() : "BALANCED");
        } else {
            dto.setTotalWorkloadHours(BigDecimal.ZERO);
            dto.setWorkloadStatus("PENDING_CALCULATION");
        }

        return dto;
    }
}
