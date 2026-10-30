package com.ahrao.service.principal;

import com.ahrao.dto.principal.dashboard.PrincipalRecentActivityDto;
import com.ahrao.dto.principal.monitoring.PrincipalDepartmentMonitoringDto;
import com.ahrao.dto.principal.monitoring.PrincipalHostelMonitoringDto;
import com.ahrao.dto.principal.monitoring.PrincipalMonitoringResponse;
import com.ahrao.dto.principal.monitoring.PrincipalMonitoringSummaryDto;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.DepartmentHOD;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.*;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.repository.academic.*;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.approval.ApprovalRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
import com.ahrao.repository.hostel.HostelRepository;
import com.ahrao.repository.hostel.HostelRoomRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.resource.ResourceRepository;
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
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class PrincipalMonitoringServiceImpl implements PrincipalMonitoringService {

    private static final Logger log = LoggerFactory.getLogger(PrincipalMonitoringServiceImpl.class);

    private final PrincipalInstitutionResolver institutionResolver;
    private final DepartmentRepository departmentRepository;
    private final DepartmentHODRepository departmentHODRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final ProgramRepository programRepository;
    private final SubjectRepository subjectRepository;
    private final ResourceRepository resourceRepository;
    private final AcademicResourceRequestRepository academicResourceRequestRepository;
    private final ResourceAllocationRepository resourceAllocationRepository;
    private final HostelRepository hostelRepository;
    private final HostelRoomRepository hostelRoomRepository;
    private final HostelBedRepository hostelBedRepository;
    private final ApprovalRepository approvalRepository;
    private final AuditLogRepository auditLogRepository;

    public PrincipalMonitoringServiceImpl(
            PrincipalInstitutionResolver institutionResolver,
            DepartmentRepository departmentRepository,
            DepartmentHODRepository departmentHODRepository,
            StudentRepository studentRepository,
            FacultyRepository facultyRepository,
            ProgramRepository programRepository,
            SubjectRepository subjectRepository,
            ResourceRepository resourceRepository,
            AcademicResourceRequestRepository academicResourceRequestRepository,
            ResourceAllocationRepository resourceAllocationRepository,
            HostelRepository hostelRepository,
            HostelRoomRepository hostelRoomRepository,
            HostelBedRepository hostelBedRepository,
            ApprovalRepository approvalRepository,
            AuditLogRepository auditLogRepository) {
        this.institutionResolver = institutionResolver;
        this.departmentRepository = departmentRepository;
        this.departmentHODRepository = departmentHODRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.programRepository = programRepository;
        this.subjectRepository = subjectRepository;
        this.resourceRepository = resourceRepository;
        this.academicResourceRequestRepository = academicResourceRequestRepository;
        this.resourceAllocationRepository = resourceAllocationRepository;
        this.hostelRepository = hostelRepository;
        this.hostelRoomRepository = hostelRoomRepository;
        this.hostelBedRepository = hostelBedRepository;
        this.approvalRepository = approvalRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public PrincipalMonitoringResponse getMonitoring(Long principalUserId) {
        log.info("Fetching Principal institution monitoring for userId: {}", principalUserId);

        Institution institution = institutionResolver.resolvePrincipalInstitution(principalUserId);
        if (institution == null) {
            throw new AccessDeniedException("No authorized institution found for current principal");
        }

        Long institutionId = institution.getId();

        // 1. Summary
        long totalDepts = departmentRepository.countByInstitutionId(institutionId);
        long totalStuds = studentRepository.countByDepartmentInstitutionId(institutionId);
        long totalFacs = facultyRepository.countByDepartmentInstitutionId(institutionId);
        long totalProgs = programRepository.countByDepartmentInstitutionId(institutionId);
        long totalSubjs = subjectRepository.countByProgramDepartmentInstitutionId(institutionId);
        long totalRes = resourceRepository.countByInstitutionId(institutionId);
        long availRes = resourceRepository.countByInstitutionIdAndStatus(institutionId, ResourceStatus.AVAILABLE);
        long allocRes = resourceRepository.countByInstitutionIdAndStatus(institutionId, ResourceStatus.ALLOCATED);
        long maintRes = resourceRepository.countByInstitutionIdAndStatus(institutionId, ResourceStatus.MAINTENANCE);
        long inactRes = resourceRepository.countByInstitutionIdAndStatus(institutionId, ResourceStatus.INACTIVE);
        long pendingReqs = academicResourceRequestRepository.countByDepartmentInstitutionIdAndStatus(institutionId, RequestStatus.PENDING);
        long activeAlloc = resourceAllocationRepository.countByDepartmentInstitutionIdAndStatus(institutionId, AllocationStatus.ACTIVE);
        long totalHostels = hostelRepository.countByInstitutionId(institutionId);
        long totalBeds = hostelBedRepository.countByRoomFloorBlockHostelInstitutionId(institutionId);
        long occupiedBeds = hostelBedRepository.countByRoomFloorBlockHostelInstitutionIdAndStatus(institutionId, HostelBedStatus.OCCUPIED);
        long pendingApps = approvalRepository.countByApprovalLevelAndStatus(ApprovalLevel.PRINCIPAL, ApprovalStatus.PENDING);
        if (pendingApps == 0) {
            pendingApps = approvalRepository.countByStatus(ApprovalStatus.PENDING);
        }

        PrincipalMonitoringSummaryDto summary = new PrincipalMonitoringSummaryDto();
        summary.setTotalDepartments(totalDepts);
        summary.setTotalStudents(totalStuds);
        summary.setTotalFaculty(totalFacs);
        summary.setTotalPrograms(totalProgs);
        summary.setTotalSubjects(totalSubjs);
        summary.setTotalResources(totalRes);
        summary.setAvailableResources(availRes);
        summary.setAllocatedResources(allocRes);
        summary.setMaintenanceResources(maintRes);
        summary.setInactiveResources(inactRes);
        summary.setPendingRequests(pendingReqs);
        summary.setActiveAllocations(activeAlloc);
        summary.setTotalHostels(totalHostels);
        summary.setTotalHostelBeds(totalBeds);
        summary.setOccupiedHostelBeds(occupiedBeds);
        summary.setPendingApprovals(pendingApps);

        // 2. Department Monitoring
        List<Department> departments = departmentRepository.findByInstitutionId(institutionId);
        List<PrincipalDepartmentMonitoringDto> deptList = new ArrayList<>();
        for (Department dept : departments) {
            PrincipalDepartmentMonitoringDto dDto = new PrincipalDepartmentMonitoringDto();
            dDto.setDepartmentId(dept.getId());
            dDto.setDepartmentName(dept.getName());
            dDto.setDepartmentCode(dept.getCode());
            dDto.setStatus(dept.getStatus());

            Optional<DepartmentHOD> hodOpt = departmentHODRepository.findFirstByDepartmentIdAndStatus(dept.getId(), "ACTIVE");
            if (hodOpt.isPresent() && hodOpt.get().getFaculty() != null && hodOpt.get().getFaculty().getUser() != null) {
                var u = hodOpt.get().getFaculty().getUser();
                String first = u.getFirstName() != null ? u.getFirstName() : "";
                String last = u.getLastName() != null ? u.getLastName() : "";
                String full = (first + " " + last).trim();
                dDto.setHodName(!full.isEmpty() ? full : u.getUsername());
                dDto.setHodEmail(u.getEmail());
            } else {
                dDto.setHodName("Unassigned");
                dDto.setHodEmail("");
            }

            dDto.setStudentCount(studentRepository.countByDepartmentId(dept.getId()));
            dDto.setFacultyCount(facultyRepository.countByDepartmentId(dept.getId()));
            dDto.setProgramCount(programRepository.countByDepartmentId(dept.getId()));
            dDto.setSubjectCount(subjectRepository.countByProgramDepartmentId(dept.getId()));
            dDto.setTotalRequests(academicResourceRequestRepository.countByDepartmentId(dept.getId()));
            dDto.setPendingRequests(academicResourceRequestRepository.countByDepartmentIdAndStatus(dept.getId(), RequestStatus.PENDING));
            dDto.setApprovedRequests(academicResourceRequestRepository.countByDepartmentIdAndStatus(dept.getId(), RequestStatus.APPROVED));
            dDto.setActiveAllocations(resourceAllocationRepository.countByDepartmentIdAndStatus(dept.getId(), AllocationStatus.ACTIVE));

            deptList.add(dDto);
        }

        // 3. Hostel Monitoring
        List<Hostel> hostels = hostelRepository.findByInstitutionId(institutionId);
        List<PrincipalHostelMonitoringDto> hostelList = new ArrayList<>();
        for (Hostel h : hostels) {
            PrincipalHostelMonitoringDto hDto = new PrincipalHostelMonitoringDto();
            hDto.setHostelId(h.getId());
            hDto.setHostelName(h.getName());
            hDto.setHostelCode(h.getCode());
            hDto.setStatus(h.getStatus());

            long rooms = hostelRoomRepository.countByFloorBlockHostelId(h.getId());
            long beds = hostelBedRepository.countByRoomFloorBlockHostelId(h.getId());
            long occ = hostelBedRepository.countByRoomFloorBlockHostelIdAndStatus(h.getId(), HostelBedStatus.OCCUPIED);
            long avail = hostelBedRepository.countByRoomFloorBlockHostelIdAndStatus(h.getId(), HostelBedStatus.AVAILABLE);
            long maint = hostelBedRepository.countByRoomFloorBlockHostelIdAndStatus(h.getId(), HostelBedStatus.MAINTENANCE);
            long res = hostelBedRepository.countByRoomFloorBlockHostelIdAndStatus(h.getId(), HostelBedStatus.RESERVED);

            hDto.setTotalRooms(rooms);
            hDto.setTotalBeds(beds);
            hDto.setOccupiedBeds(occ);
            hDto.setAvailableBeds(avail);
            hDto.setMaintenanceBeds(maint);
            hDto.setReservedBeds(res);

            if (occ + avail > 0) {
                double rate = ((double) occ / (double) (occ + avail)) * 100.0;
                hDto.setOccupancyRate(BigDecimal.valueOf(rate).setScale(1, RoundingMode.HALF_UP).doubleValue());
            } else {
                hDto.setOccupancyRate(null);
            }

            hostelList.add(hDto);
        }

        // 4. Safe Recent Activity
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

                PrincipalRecentActivityDto aDto = new PrincipalRecentActivityDto();
                aDto.setId(logEntry.getId());
                aDto.setAction(logEntry.getAction());
                aDto.setEntityType(logEntry.getEntityType());
                aDto.setEntityId(logEntry.getEntityId());
                aDto.setUserName(userName);
                aDto.setUserEmail(userEmail);
                aDto.setCreatedAt(logEntry.getCreatedAt());
                aDto.setDetails(safeDetails);
                recentActivity.add(aDto);
            }
        }

        PrincipalMonitoringResponse response = new PrincipalMonitoringResponse();
        response.setSummary(summary);
        response.setDepartments(deptList);
        response.setHostels(hostelList);
        response.setRecentActivity(recentActivity);
        return response;
    }
}
