package com.ahrao.service.hod;

import com.ahrao.dto.hod.dashboard.*;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.DepartmentHOD;
import com.ahrao.entity.academic.Faculty;
import com.ahrao.entity.academic.FacultyWorkload;
import com.ahrao.entity.allocation.ResourceAllocation;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.enums.ResourceStatus;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.repository.academic.*;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.resource.ResourceRepository;
import com.ahrao.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class HodDashboardServiceImpl implements HodDashboardService {

    private static final Logger log = LoggerFactory.getLogger(HodDashboardServiceImpl.class);

    private final FacultyRepository facultyRepository;
    private final DepartmentHODRepository departmentHODRepository;
    private final StudentRepository studentRepository;
    private final ProgramRepository programRepository;
    private final SubjectRepository subjectRepository;
    private final SectionRepository sectionRepository;
    private final AcademicResourceRequestRepository academicResourceRequestRepository;
    private final ResourceAllocationRepository resourceAllocationRepository;
    private final ResourceRepository resourceRepository;
    private final FacultyWorkloadRepository facultyWorkloadRepository;
    private final FacultySubjectAssignmentRepository facultySubjectAssignmentRepository;
    private final AuditLogRepository auditLogRepository;

    public HodDashboardServiceImpl(
            FacultyRepository facultyRepository,
            DepartmentHODRepository departmentHODRepository,
            StudentRepository studentRepository,
            ProgramRepository programRepository,
            SubjectRepository subjectRepository,
            SectionRepository sectionRepository,
            AcademicResourceRequestRepository academicResourceRequestRepository,
            ResourceAllocationRepository resourceAllocationRepository,
            ResourceRepository resourceRepository,
            FacultyWorkloadRepository facultyWorkloadRepository,
            FacultySubjectAssignmentRepository facultySubjectAssignmentRepository,
            AuditLogRepository auditLogRepository) {
        this.facultyRepository = facultyRepository;
        this.departmentHODRepository = departmentHODRepository;
        this.studentRepository = studentRepository;
        this.programRepository = programRepository;
        this.subjectRepository = subjectRepository;
        this.sectionRepository = sectionRepository;
        this.academicResourceRequestRepository = academicResourceRequestRepository;
        this.resourceAllocationRepository = resourceAllocationRepository;
        this.resourceRepository = resourceRepository;
        this.facultyWorkloadRepository = facultyWorkloadRepository;
        this.facultySubjectAssignmentRepository = facultySubjectAssignmentRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public HodDashboardResponse getHodDashboard() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new ForbiddenException("No authenticated user found in security context"));
        return getHodDashboard(currentUserId);
    }

    @Override
    public HodDashboardResponse getHodDashboard(Long userId) {
        log.info("Generating HOD Department Dashboard for userId={}", userId);

        // 1. Resolve Faculty profile
        Faculty hodFaculty = facultyRepository.findByUserId(userId)
                .orElseThrow(() -> new ForbiddenException("Authenticated user is not registered as faculty."));

        // 2. Resolve Department assignment
        Department department = null;
        LocalDate hodSince = null;

        Optional<DepartmentHOD> hodAssignmentOpt = departmentHODRepository.findFirstByFacultyUserIdAndStatus(userId, "ACTIVE");
        if (hodAssignmentOpt.isPresent()) {
            department = hodAssignmentOpt.get().getDepartment();
            hodSince = hodAssignmentOpt.get().getStartDate();
        } else if (hodFaculty.getDepartment() != null) {
            department = hodFaculty.getDepartment();
            hodSince = hodFaculty.getJoiningDate();
        }

        if (department == null) {
            throw new ForbiddenException("No active department assignment found for authenticated HOD.");
        }

        Long departmentId = department.getId();
        User hodUser = hodFaculty.getUser();

        HodDashboardResponse response = new HodDashboardResponse();

        // 3. Department & HOD Information
        HodDepartmentInfoDto deptInfo = new HodDepartmentInfoDto();
        deptInfo.setId(department.getId());
        deptInfo.setName(department.getName());
        deptInfo.setCode(department.getCode());
        deptInfo.setStatus(department.getStatus());
        deptInfo.setInstitutionName(department.getInstitution() != null ? department.getInstitution().getName() : "N/A");
        if (hodUser != null) {
            deptInfo.setHodName((hodUser.getFirstName() + " " + (hodUser.getLastName() != null ? hodUser.getLastName() : "")).trim());
            deptInfo.setHodEmail(hodUser.getEmail());
        } else {
            deptInfo.setHodName("N/A");
            deptInfo.setHodEmail("N/A");
        }
        deptInfo.setHodEmployeeId(hodFaculty.getEmployeeId());
        deptInfo.setHodSince(hodSince);
        response.setDepartment(deptInfo);

        // 4. Summary KPIs (Department Scoped)
        long totalStudents = studentRepository.countByDepartmentId(departmentId);
        long totalFaculty = facultyRepository.countByDepartmentId(departmentId);
        long totalPrograms = programRepository.countByDepartmentId(departmentId);
        long totalSubjects = subjectRepository.countByProgramDepartmentId(departmentId);
        long activeSections = sectionRepository.countByProgramDepartmentIdAndStatus(departmentId, "ACTIVE");
        long pendingRequests = academicResourceRequestRepository.countByDepartmentIdAndStatus(departmentId, RequestStatus.PENDING);
        long activeAllocations = resourceAllocationRepository.countByDepartmentIdAndStatus(departmentId, AllocationStatus.ACTIVE);
        long totalResources = resourceRepository.countByDepartmentId(departmentId);

        HodDepartmentSummaryKpiDto kpis = new HodDepartmentSummaryKpiDto();
        kpis.setTotalStudents(totalStudents);
        kpis.setTotalFaculty(totalFaculty);
        kpis.setTotalPrograms(totalPrograms);
        kpis.setTotalSubjects(totalSubjects);
        kpis.setActiveSections(activeSections);
        kpis.setPendingResourceRequests(pendingRequests);
        kpis.setActiveResourceAllocations(activeAllocations);
        kpis.setTotalDepartmentResources(totalResources);
        response.setSummary(kpis);

        // 5. Student Enrollment by Program Breakdown
        List<Object[]> programDistributionRows = studentRepository.countStudentsGroupedByProgramInDepartment(departmentId);
        List<HodStudentProgramDistributionDto> studentDistributions = new ArrayList<>();
        long totalEnrolled = 0;
        for (Object[] row : programDistributionRows) {
            Long pId = (Long) row[0];
            String pCode = (String) row[1];
            String pName = (String) row[2];
            String degreeType = row[3] != null ? row[3].toString() : "N/A";
            long count = ((Number) row[4]).longValue();
            totalEnrolled += count;
            studentDistributions.add(new HodStudentProgramDistributionDto(pId, pCode, pName, degreeType, count, 0.0));
        }
        if (totalEnrolled > 0) {
            for (HodStudentProgramDistributionDto item : studentDistributions) {
                double pct = Math.round(((double) item.getStudentCount() / (double) totalEnrolled) * 1000.0) / 10.0;
                item.setPercentage(pct);
            }
        }
        response.setStudentDistribution(studentDistributions);

        // 6. Faculty Workload Overview
        List<Faculty> departmentFaculty = facultyRepository.findByDepartmentId(departmentId);
        List<HodFacultyWorkloadSummaryItemDto> workloadItems = new ArrayList<>();
        for (Faculty f : departmentFaculty) {
            HodFacultyWorkloadSummaryItemDto wItem = new HodFacultyWorkloadSummaryItemDto();
            wItem.setFacultyId(f.getId());
            User fUser = f.getUser();
            wItem.setFacultyName(fUser != null ? (fUser.getFirstName() + " " + (fUser.getLastName() != null ? fUser.getLastName() : "")).trim() : "Faculty #" + f.getId());
            wItem.setEmployeeId(f.getEmployeeId());
            wItem.setDesignation(f.getDesignation());

            long activeAssignments = facultySubjectAssignmentRepository.countByFacultyIdAndStatus(f.getId(), "ACTIVE");
            wItem.setAssignedSubjectsCount((int) activeAssignments);

            Optional<FacultyWorkload> latestWorkloadOpt = facultyWorkloadRepository.findFirstByFacultyIdOrderByCalculatedAtDesc(f.getId());
            if (latestWorkloadOpt.isPresent()) {
                FacultyWorkload fw = latestWorkloadOpt.get();
                wItem.setTotalHours(fw.getTotalHours() != null ? fw.getTotalHours() : BigDecimal.ZERO);
                wItem.setTeachingHours(fw.getTeachingHours() != null ? fw.getTeachingHours() : BigDecimal.ZERO);
                wItem.setLabHours(fw.getLabHours() != null ? fw.getLabHours() : BigDecimal.ZERO);
                wItem.setWorkloadStatus(fw.getWorkloadStatus() != null ? fw.getWorkloadStatus() : "BALANCED");
            } else {
                wItem.setTotalHours(BigDecimal.ZERO);
                wItem.setTeachingHours(BigDecimal.ZERO);
                wItem.setLabHours(BigDecimal.ZERO);
                wItem.setWorkloadStatus("PENDING_CALCULATION");
            }
            workloadItems.add(wItem);
        }
        response.setFacultyWorkloads(workloadItems);

        // 7. Pending Academic Resource Requests
        List<AcademicResourceRequest> pendingList = academicResourceRequestRepository.findTop5ByDepartmentIdAndStatusOrderByCreatedAtDesc(departmentId, RequestStatus.PENDING);
        List<HodPendingResourceRequestItemDto> pendingDtos = new ArrayList<>();
        for (AcademicResourceRequest req : pendingList) {
            HodPendingResourceRequestItemDto pDto = new HodPendingResourceRequestItemDto();
            pDto.setRequestId(req.getId());
            if (req.getRequestedResource() != null) {
                pDto.setResourceName(req.getRequestedResource().getName());
                pDto.setResourceCode(req.getRequestedResource().getCode());
                if (req.getRequestedResource().getCategory() != null) {
                    pDto.setResourceCategoryName(req.getRequestedResource().getCategory().getName());
                } else {
                    pDto.setResourceCategoryName("Academic Resource");
                }
            } else {
                pDto.setResourceName("N/A");
                pDto.setResourceCode("N/A");
                pDto.setResourceCategoryName("Academic Resource");
            }

            if (req.getRequester() != null) {
                pDto.setRequesterName((req.getRequester().getFirstName() + " " + (req.getRequester().getLastName() != null ? req.getRequester().getLastName() : "")).trim());
            } else {
                pDto.setRequesterName("Department Staff");
            }

            pDto.setPurpose(req.getPurpose());
            pDto.setRequestedDate(req.getRequestedDate());
            pDto.setStartTime(req.getStartTime());
            pDto.setEndTime(req.getEndTime());
            pDto.setPriority(req.getPriority() != null ? req.getPriority().name() : "NORMAL");
            pDto.setStatus(req.getStatus() != null ? req.getStatus().name() : "PENDING");
            pDto.setCreatedAt(req.getCreatedAt());
            pendingDtos.add(pDto);
        }
        response.setPendingRequests(pendingDtos);

        // 8. Active Academic Resource Allocations
        List<ResourceAllocation> activeAllocationsList = resourceAllocationRepository.findTop5ByDepartmentIdAndStatusOrderByCreatedAtDesc(departmentId, AllocationStatus.ACTIVE);
        List<HodActiveAllocationItemDto> activeAllocationDtos = new ArrayList<>();
        for (ResourceAllocation alloc : activeAllocationsList) {
            HodActiveAllocationItemDto aDto = new HodActiveAllocationItemDto();
            aDto.setAllocationId(alloc.getId());
            if (alloc.getResource() != null) {
                aDto.setResourceName(alloc.getResource().getName());
                aDto.setResourceCode(alloc.getResource().getCode());
                if (alloc.getResource().getCategory() != null) {
                    aDto.setResourceCategoryName(alloc.getResource().getCategory().getName());
                } else {
                    aDto.setResourceCategoryName("Academic Resource");
                }
            } else {
                aDto.setResourceName("N/A");
                aDto.setResourceCode("N/A");
                aDto.setResourceCategoryName("Academic Resource");
            }

            if (alloc.getAllocatedToUser() != null) {
                User u = alloc.getAllocatedToUser();
                aDto.setAllocatedToName((u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "")).trim());
                if (u.getRoles() != null && !u.getRoles().isEmpty()) {
                    String rName = u.getRoles().iterator().next().getName();
                    aDto.setAllocatedToRole(rName != null ? rName.replace("ROLE_", "") : "USER");
                } else {
                    aDto.setAllocatedToRole("USER");
                }
            } else {
                aDto.setAllocatedToName("N/A");
                aDto.setAllocatedToRole("N/A");
            }

            aDto.setPurpose(alloc.getPurpose());
            aDto.setStartDatetime(alloc.getStartDatetime());
            aDto.setEndDatetime(alloc.getEndDatetime());
            aDto.setQuantity(alloc.getQuantity());
            aDto.setStatus(alloc.getStatus() != null ? alloc.getStatus().name() : "ACTIVE");
            activeAllocationDtos.add(aDto);
        }
        response.setActiveAllocations(activeAllocationDtos);

        // 9. Department Resource Utilization
        long deptTotalResources = resourceRepository.countByDepartmentId(departmentId);
        long deptAvailable = resourceRepository.countByDepartmentIdAndStatus(departmentId, ResourceStatus.AVAILABLE);
        long deptAllocated = resourceRepository.countByDepartmentIdAndStatus(departmentId, ResourceStatus.ALLOCATED);
        long deptMaintenance = resourceRepository.countByDepartmentIdAndStatus(departmentId, ResourceStatus.MAINTENANCE);
        long deptInactive = resourceRepository.countByDepartmentIdAndStatus(departmentId, ResourceStatus.INACTIVE);

        HodResourceUtilizationSummaryDto resourceUtilization = new HodResourceUtilizationSummaryDto(
                deptTotalResources, deptAvailable, deptAllocated, deptMaintenance, deptInactive
        );
        response.setResourceUtilization(resourceUtilization);

        // 10. Recent Department Activity (Top 10)
        List<AuditLog> recentLogs = auditLogRepository.findRecentDepartmentAuditLogs(departmentId, PageRequest.of(0, 10));
        List<HodActivityDto> activityDtos = new ArrayList<>();
        for (AuditLog logItem : recentLogs) {
            String performedBy = logItem.getUser() != null ?
                    (logItem.getUser().getFirstName() + " " + (logItem.getUser().getLastName() != null ? logItem.getUser().getLastName() : "")).trim() : "System";
            String action = logItem.getAction() != null ? logItem.getAction().replace('_', ' ') : "Activity";
            String entityType = logItem.getEntityType() != null ? logItem.getEntityType() : "Department";
            String description = logItem.getEntityId() != null
                    ? String.format("%s on %s #%d", action, entityType, logItem.getEntityId())
                    : String.format("%s on %s", action, entityType);

            activityDtos.add(new HodActivityDto(
                    logItem.getId(),
                    logItem.getAction(),
                    logItem.getEntityType(),
                    logItem.getEntityId(),
                    description,
                    performedBy,
                    logItem.getCreatedAt()
            ));
        }
        response.setRecentActivities(activityDtos);

        log.info("Successfully assembled HOD Department Dashboard for departmentId={}, totalStudents={}, totalFaculty={}",
                departmentId, totalStudents, totalFaculty);

        return response;
    }
}
