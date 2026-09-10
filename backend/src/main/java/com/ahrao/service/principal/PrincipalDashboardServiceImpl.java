package com.ahrao.service.principal;

import com.ahrao.dto.principal.dashboard.*;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.approval.Approval;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.*;
import com.ahrao.entity.user.User;
import com.ahrao.repository.academic.*;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.approval.ApprovalRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
import com.ahrao.repository.hostel.HostelRepository;
import com.ahrao.repository.hostel.HostelRoomRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.resource.ResourceRepository;
import com.ahrao.repository.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class PrincipalDashboardServiceImpl implements PrincipalDashboardService {

    private static final Logger log = LoggerFactory.getLogger(PrincipalDashboardServiceImpl.class);

    private final PrincipalInstitutionResolver institutionResolver;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final ProgramRepository programRepository;
    private final SubjectRepository subjectRepository;
    private final SectionRepository sectionRepository;
    private final ResourceRepository resourceRepository;
    private final AcademicResourceRequestRepository academicResourceRequestRepository;
    private final ResourceAllocationRepository resourceAllocationRepository;
    private final HostelRepository hostelRepository;
    private final HostelRoomRepository hostelRoomRepository;
    private final HostelBedRepository hostelBedRepository;
    private final FacultyWorkloadRepository facultyWorkloadRepository;
    private final ApprovalRepository approvalRepository;
    private final AuditLogRepository auditLogRepository;

    public PrincipalDashboardServiceImpl(
            PrincipalInstitutionResolver institutionResolver,
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            StudentRepository studentRepository,
            FacultyRepository facultyRepository,
            ProgramRepository programRepository,
            SubjectRepository subjectRepository,
            SectionRepository sectionRepository,
            ResourceRepository resourceRepository,
            AcademicResourceRequestRepository academicResourceRequestRepository,
            ResourceAllocationRepository resourceAllocationRepository,
            HostelRepository hostelRepository,
            HostelRoomRepository hostelRoomRepository,
            HostelBedRepository hostelBedRepository,
            FacultyWorkloadRepository facultyWorkloadRepository,
            ApprovalRepository approvalRepository,
            AuditLogRepository auditLogRepository) {
        this.institutionResolver = institutionResolver;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.programRepository = programRepository;
        this.subjectRepository = subjectRepository;
        this.sectionRepository = sectionRepository;
        this.resourceRepository = resourceRepository;
        this.academicResourceRequestRepository = academicResourceRequestRepository;
        this.resourceAllocationRepository = resourceAllocationRepository;
        this.hostelRepository = hostelRepository;
        this.hostelRoomRepository = hostelRoomRepository;
        this.hostelBedRepository = hostelBedRepository;
        this.facultyWorkloadRepository = facultyWorkloadRepository;
        this.approvalRepository = approvalRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public PrincipalDashboardResponse getDashboard(Long principalUserId) {
        log.info("Fetching Principal institution dashboard for userId: {}", principalUserId);

        Institution institution = institutionResolver.resolvePrincipalInstitution(principalUserId);
        if (institution == null) {
            throw new AccessDeniedException("No authorized institution found for current principal");
        }

        Long institutionId = institution.getId();
        log.debug("Resolved institution {} ({}) for principal {}", institution.getName(), institutionId, principalUserId);

        User principalUser = userRepository.findById(principalUserId).orElse(null);
        String principalName = "Principal";
        String principalEmail = "";
        if (principalUser != null) {
            String first = principalUser.getFirstName() != null ? principalUser.getFirstName() : "";
            String last = principalUser.getLastName() != null ? principalUser.getLastName() : "";
            String full = (first + " " + last).trim();
            principalName = !full.isEmpty() ? full : principalUser.getUsername();
            principalEmail = principalUser.getEmail();
        }

        // 1. Institution DTO
        long totalDepts = departmentRepository.countByInstitutionId(institutionId);
        long totalProgs = programRepository.countByDepartmentInstitutionId(institutionId);
        long totalStuds = studentRepository.countByDepartmentInstitutionId(institutionId);
        long totalFacs = facultyRepository.countByDepartmentInstitutionId(institutionId);

        PrincipalInstitutionDto institutionDto = new PrincipalInstitutionDto();
        institutionDto.setId(institution.getId());
        institutionDto.setName(institution.getName());
        institutionDto.setCode(institution.getCode());
        institutionDto.setContactEmail(institution.getEmail());
        institutionDto.setContactPhone(institution.getPhone());
        institutionDto.setStatus("ACTIVE");
        institutionDto.setAddress(institution.getAddress());
        institutionDto.setPrincipalName(principalName);
        institutionDto.setPrincipalEmail(principalEmail);
        institutionDto.setDepartmentCount(totalDepts);
        institutionDto.setProgramCount(totalProgs);
        institutionDto.setStudentCount(totalStuds);
        institutionDto.setFacultyCount(totalFacs);

        // 2. KPI Summary
        long totalSubjects = subjectRepository.countByProgramDepartmentInstitutionId(institutionId);
        long totalSections = sectionRepository.countByProgramDepartmentInstitutionId(institutionId);
        long totalResources = resourceRepository.countByInstitutionId(institutionId);
        long pendingRequests = academicResourceRequestRepository.countByDepartmentInstitutionIdAndStatus(institutionId, RequestStatus.PENDING);
        long activeAllocations = resourceAllocationRepository.countByDepartmentInstitutionIdAndStatus(institutionId, AllocationStatus.ACTIVE);
        long totalHostels = hostelRepository.countByInstitutionId(institutionId);
        long totalHostelBeds = hostelBedRepository.countByRoomFloorBlockHostelInstitutionId(institutionId);
        long occupiedBeds = hostelBedRepository.countByRoomFloorBlockHostelInstitutionIdAndStatus(institutionId, HostelBedStatus.OCCUPIED);
        long pendingApprovalsCount = approvalRepository.countByApprovalLevelAndStatus(ApprovalLevel.PRINCIPAL, ApprovalStatus.PENDING);
        if (pendingApprovalsCount == 0) {
            pendingApprovalsCount = approvalRepository.countByStatus(ApprovalStatus.PENDING);
        }

        PrincipalKpiSummaryDto kpiSummary = new PrincipalKpiSummaryDto();
        kpiSummary.setTotalDepartments(totalDepts);
        kpiSummary.setTotalStudents(totalStuds);
        kpiSummary.setTotalFaculty(totalFacs);
        kpiSummary.setTotalPrograms(totalProgs);
        kpiSummary.setTotalSubjects(totalSubjects);
        kpiSummary.setTotalSections(totalSections);
        kpiSummary.setAcademicResources(totalResources);
        kpiSummary.setPendingResourceRequests(pendingRequests);
        kpiSummary.setActiveAllocations(activeAllocations);
        kpiSummary.setTotalHostels(totalHostels);
        kpiSummary.setTotalHostelBeds(totalHostelBeds);
        kpiSummary.setOccupiedHostelBeds(occupiedBeds);
        kpiSummary.setPendingApprovals(pendingApprovalsCount);

        // 3. Departments Overview
        List<Department> departments = departmentRepository.findByInstitutionId(institutionId);
        List<PrincipalDepartmentOverviewDto> departmentList = new ArrayList<>();
        for (Department dept : departments) {
            long deptStudents = studentRepository.countByDepartmentId(dept.getId());
            long deptFaculty = facultyRepository.countByDepartmentId(dept.getId());
            long deptPrograms = programRepository.countByDepartmentId(dept.getId());
            long deptSubjects = subjectRepository.countByProgramDepartmentId(dept.getId());
            long deptPendingReqs = academicResourceRequestRepository.countByDepartmentIdAndStatus(dept.getId(), RequestStatus.PENDING);
            long deptActiveAlloc = resourceAllocationRepository.countByDepartmentIdAndStatus(dept.getId(), AllocationStatus.ACTIVE);

            PrincipalDepartmentOverviewDto deptDto = new PrincipalDepartmentOverviewDto();
            deptDto.setDepartmentId(dept.getId());
            deptDto.setDepartmentName(dept.getName());
            deptDto.setDepartmentCode(dept.getCode());
            deptDto.setStatus(dept.getStatus());
            deptDto.setStudentCount(deptStudents);
            deptDto.setFacultyCount(deptFaculty);
            deptDto.setProgramCount(deptPrograms);
            deptDto.setSubjectCount(deptSubjects);
            deptDto.setPendingRequestCount(deptPendingReqs);
            deptDto.setActiveAllocationCount(deptActiveAlloc);
            departmentList.add(deptDto);
        }

        // 4. Student Overview
        long activeStuds = studentRepository.countByDepartmentInstitutionIdAndStatus(institutionId, "ACTIVE");
        long inactiveStuds = studentRepository.countByDepartmentInstitutionIdAndStatus(institutionId, "INACTIVE");
        List<Object[]> studentDeptRows = studentRepository.countStudentsGroupedByDepartmentInInstitution(institutionId);
        List<PrincipalStudentOverviewDto.DepartmentStudentCountDto> studentByDept = new ArrayList<>();
        if (studentDeptRows != null) {
            for (Object[] row : studentDeptRows) {
                studentByDept.add(new PrincipalStudentOverviewDto.DepartmentStudentCountDto(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        (String) row[2],
                        ((Number) row[3]).longValue()
                ));
            }
        }

        List<Object[]> studentProgRows = studentRepository.countStudentsGroupedByProgramInInstitution(institutionId);
        List<PrincipalStudentOverviewDto.ProgramStudentCountDto> studentByProg = new ArrayList<>();
        if (studentProgRows != null) {
            for (Object[] row : studentProgRows) {
                studentByProg.add(new PrincipalStudentOverviewDto.ProgramStudentCountDto(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        (String) row[2],
                        ((Number) row[3]).longValue()
                ));
            }
        }

        PrincipalStudentOverviewDto studentOverview = new PrincipalStudentOverviewDto();
        studentOverview.setTotalStudents(totalStuds);
        studentOverview.setActiveStudents(activeStuds);
        studentOverview.setInactiveStudents(inactiveStuds);
        studentOverview.setByDepartment(studentByDept);
        studentOverview.setByProgram(studentByProg);

        // 5. Faculty Overview
        long activeFacs = facultyRepository.countByDepartmentInstitutionIdAndStatus(institutionId, "ACTIVE");
        long inactiveFacs = facultyRepository.countByDepartmentInstitutionIdAndStatus(institutionId, "INACTIVE");
        List<Object[]> facultyDeptRows = facultyRepository.countFacultyGroupedByDepartmentInInstitution(institutionId);
        List<PrincipalFacultyOverviewDto.DepartmentFacultyCountDto> facultyByDept = new ArrayList<>();
        if (facultyDeptRows != null) {
            for (Object[] row : facultyDeptRows) {
                facultyByDept.add(new PrincipalFacultyOverviewDto.DepartmentFacultyCountDto(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        ((Number) row[2]).longValue()
                ));
            }
        }

        // Faculty Workload Summary
        List<Object[]> workloadRows = facultyWorkloadRepository.countWorkloadsGroupedByStatusInInstitution(institutionId);
        long balancedCount = 0;
        long overloadCount = 0;
        long underloadCount = 0;
        long totalWorkloads = 0;
        if (workloadRows != null) {
            for (Object[] row : workloadRows) {
                String status = row[0] != null ? row[0].toString().toUpperCase() : "";
                long count = ((Number) row[1]).longValue();
                totalWorkloads += count;
                if ("BALANCED".equals(status)) {
                    balancedCount += count;
                } else if ("OVERLOAD".equals(status)) {
                    overloadCount += count;
                } else if ("UNDERLOAD".equals(status)) {
                    underloadCount += count;
                }
            }
        }
        Double avgHours = facultyWorkloadRepository.findAverageHoursInInstitution(institutionId);
        if (avgHours != null) {
            avgHours = BigDecimal.valueOf(avgHours).setScale(1, RoundingMode.HALF_UP).doubleValue();
        }

        PrincipalFacultyOverviewDto.WorkloadSummaryDto workloadSummary = new PrincipalFacultyOverviewDto.WorkloadSummaryDto();
        workloadSummary.setTotalRecorded(totalWorkloads);
        workloadSummary.setBalancedCount(balancedCount);
        workloadSummary.setOverloadCount(overloadCount);
        workloadSummary.setUnderloadCount(underloadCount);
        workloadSummary.setAverageHours(avgHours);

        PrincipalFacultyOverviewDto facultyOverview = new PrincipalFacultyOverviewDto();
        facultyOverview.setTotalFaculty(totalFacs);
        facultyOverview.setActiveFaculty(activeFacs);
        facultyOverview.setInactiveFaculty(inactiveFacs);
        facultyOverview.setByDepartment(facultyByDept);
        facultyOverview.setWorkloadSummary(workloadSummary);

        // 6. Academic Resources Overview
        long availRes = resourceRepository.countByInstitutionIdAndStatus(institutionId, ResourceStatus.AVAILABLE);
        long allocRes = resourceRepository.countByInstitutionIdAndStatus(institutionId, ResourceStatus.ALLOCATED);
        long maintRes = resourceRepository.countByInstitutionIdAndStatus(institutionId, ResourceStatus.MAINTENANCE);
        long inactRes = resourceRepository.countByInstitutionIdAndStatus(institutionId, ResourceStatus.INACTIVE);

        PrincipalResourceOverviewDto resourceOverview = new PrincipalResourceOverviewDto();
        resourceOverview.setTotalResources(totalResources);
        resourceOverview.setAvailableResources(availRes);
        resourceOverview.setAllocatedResources(allocRes);
        resourceOverview.setMaintenanceResources(maintRes);
        resourceOverview.setInactiveResources(inactRes);

        // 7. Resource Requests Overview
        long totalReqs = academicResourceRequestRepository.countByDepartmentInstitutionId(institutionId);
        long appReqs = academicResourceRequestRepository.countByDepartmentInstitutionIdAndStatus(institutionId, RequestStatus.APPROVED);
        long rejReqs = academicResourceRequestRepository.countByDepartmentInstitutionIdAndStatus(institutionId, RequestStatus.REJECTED);
        long canReqs = academicResourceRequestRepository.countByDepartmentInstitutionIdAndStatus(institutionId, RequestStatus.CANCELLED);
        long compReqs = academicResourceRequestRepository.countByDepartmentInstitutionIdAndStatus(institutionId, RequestStatus.COMPLETED);

        PrincipalRequestOverviewDto requestOverview = new PrincipalRequestOverviewDto();
        requestOverview.setTotalRequests(totalReqs);
        requestOverview.setPendingRequests(pendingRequests);
        requestOverview.setApprovedRequests(appReqs);
        requestOverview.setRejectedRequests(rejReqs);
        requestOverview.setCancelledRequests(canReqs);
        requestOverview.setCompletedRequests(compReqs);

        // 8. Allocations Overview
        long totalAlloc = resourceAllocationRepository.countByDepartmentInstitutionId(institutionId);
        long pendAlloc = resourceAllocationRepository.countByDepartmentInstitutionIdAndStatus(institutionId, AllocationStatus.PENDING);
        long compAlloc = resourceAllocationRepository.countByDepartmentInstitutionIdAndStatus(institutionId, AllocationStatus.COMPLETED);
        long canAlloc = resourceAllocationRepository.countByDepartmentInstitutionIdAndStatus(institutionId, AllocationStatus.CANCELLED);

        PrincipalAllocationOverviewDto allocationOverview = new PrincipalAllocationOverviewDto();
        allocationOverview.setTotalAllocations(totalAlloc);
        allocationOverview.setActiveAllocations(activeAllocations);
        allocationOverview.setPendingAllocations(pendAlloc);
        allocationOverview.setCompletedAllocations(compAlloc);
        allocationOverview.setCancelledAllocations(canAlloc);

        // 9. Hostel Overview
        long totalRooms = hostelRoomRepository.countByFloorBlockHostelInstitutionId(institutionId);
        long availBeds = hostelBedRepository.countByRoomFloorBlockHostelInstitutionIdAndStatus(institutionId, HostelBedStatus.AVAILABLE);
        long maintBeds = hostelBedRepository.countByRoomFloorBlockHostelInstitutionIdAndStatus(institutionId, HostelBedStatus.MAINTENANCE);
        long resBeds = hostelBedRepository.countByRoomFloorBlockHostelInstitutionIdAndStatus(institutionId, HostelBedStatus.RESERVED);
        long inactBeds = hostelBedRepository.countByRoomFloorBlockHostelInstitutionIdAndStatus(institutionId, HostelBedStatus.INACTIVE);

        Double occupancyRate = null;
        long usableBeds = occupiedBeds + availBeds;
        if (usableBeds > 0) {
            double rate = ((double) occupiedBeds / (double) usableBeds) * 100.0;
            occupancyRate = BigDecimal.valueOf(rate).setScale(1, RoundingMode.HALF_UP).doubleValue();
        }

        PrincipalHostelOverviewDto hostelOverview = new PrincipalHostelOverviewDto();
        hostelOverview.setTotalHostels(totalHostels);
        hostelOverview.setTotalRooms(totalRooms);
        hostelOverview.setTotalBeds(totalHostelBeds);
        hostelOverview.setOccupiedBeds(occupiedBeds);
        hostelOverview.setAvailableBeds(availBeds);
        hostelOverview.setMaintenanceBeds(maintBeds);
        hostelOverview.setReservedBeds(resBeds);
        hostelOverview.setInactiveBeds(inactBeds);
        hostelOverview.setOccupancyRate(occupancyRate);
        hostelOverview.setOccupancyFormula("(occupiedBeds / (occupiedBeds + availableBeds)) * 100");

        // 10. Pending Approvals
        List<Approval> approvals = approvalRepository.findByApprovalLevelAndStatusOrderByCreatedAtDesc(
                ApprovalLevel.PRINCIPAL, ApprovalStatus.PENDING, PageRequest.of(0, 10));
        if (approvals.isEmpty()) {
            approvals = approvalRepository.findByStatusOrderByCreatedAtDesc(
                    ApprovalStatus.PENDING, PageRequest.of(0, 10));
        }

        List<PrincipalPendingApprovalsDto.PendingApprovalItemDto> approvalItems = new ArrayList<>();
        for (Approval app : approvals) {
            String reqName = "Unknown";
            String reqEmail = "";
            if (app.getRequestedBy() != null) {
                String first = app.getRequestedBy().getFirstName() != null ? app.getRequestedBy().getFirstName() : "";
                String last = app.getRequestedBy().getLastName() != null ? app.getRequestedBy().getLastName() : "";
                String full = (first + " " + last).trim();
                reqName = !full.isEmpty() ? full : app.getRequestedBy().getUsername();
                reqEmail = app.getRequestedBy().getEmail();
            }

            PrincipalPendingApprovalsDto.PendingApprovalItemDto item = new PrincipalPendingApprovalsDto.PendingApprovalItemDto();
            item.setId(app.getId());
            item.setEntityType(app.getEntityType());
            item.setEntityId(app.getEntityId());
            item.setRequesterName(reqName);
            item.setRequesterEmail(reqEmail);
            item.setApprovalLevel(app.getApprovalLevel() != null ? app.getApprovalLevel().name() : "");
            item.setStatus(app.getStatus() != null ? app.getStatus().name() : "");
            item.setComments(app.getComments());
            item.setCreatedAt(app.getCreatedAt());
            approvalItems.add(item);
        }

        PrincipalPendingApprovalsDto pendingApprovals = new PrincipalPendingApprovalsDto();
        pendingApprovals.setPendingCount(pendingApprovalsCount);
        pendingApprovals.setItems(approvalItems);

        // 11. Recent Safe Activity (Audit Log)
        List<AuditLog> auditLogs = auditLogRepository.findRecentInstitutionAuditLogs(institutionId, PageRequest.of(0, 10));
        if (auditLogs == null || auditLogs.isEmpty()) {
            auditLogs = auditLogRepository.findRecentAuditLogs(PageRequest.of(0, 10));
        }

        List<PrincipalRecentActivityDto> recentActivity = new ArrayList<>();
        if (auditLogs != null) {
            for (AuditLog logEntry : auditLogs) {
                String userName = "System";
                String userEmail = "";
                if (logEntry.getUser() != null) {
                    String first = logEntry.getUser().getFirstName() != null ? logEntry.getUser().getFirstName() : "";
                    String last = logEntry.getUser().getLastName() != null ? logEntry.getUser().getLastName() : "";
                    String full = (first + " " + last).trim();
                    userName = !full.isEmpty() ? full : logEntry.getUser().getUsername();
                    userEmail = logEntry.getUser().getEmail();
                }

                String safeDetails = logEntry.getAction() + " on " + logEntry.getEntityType()
                        + (logEntry.getEntityId() != null ? " #" + logEntry.getEntityId() : "");

                PrincipalRecentActivityDto activityDto = new PrincipalRecentActivityDto();
                activityDto.setId(logEntry.getId());
                activityDto.setAction(logEntry.getAction());
                activityDto.setEntityType(logEntry.getEntityType());
                activityDto.setEntityId(logEntry.getEntityId());
                activityDto.setUserName(userName);
                activityDto.setUserEmail(userEmail);
                activityDto.setCreatedAt(logEntry.getCreatedAt());
                activityDto.setDetails(safeDetails);
                recentActivity.add(activityDto);
            }
        }

        PrincipalDashboardResponse response = new PrincipalDashboardResponse();
        response.setInstitution(institutionDto);
        response.setKpiSummary(kpiSummary);
        response.setDepartments(departmentList);
        response.setStudents(studentOverview);
        response.setFaculty(facultyOverview);
        response.setAcademicResources(resourceOverview);
        response.setResourceRequests(requestOverview);
        response.setAllocations(allocationOverview);
        response.setHostel(hostelOverview);
        response.setApprovals(pendingApprovals);
        response.setRecentActivity(recentActivity);
        return response;
    }
}
