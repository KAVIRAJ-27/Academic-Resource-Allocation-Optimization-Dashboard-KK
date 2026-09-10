package com.ahrao.service.impl;

import com.ahrao.dto.dashboard.*;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.*;
import com.ahrao.repository.academic.DepartmentRepository;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.approval.ApprovalRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
import com.ahrao.repository.hostel.HostelRepository;
import com.ahrao.repository.hostel.HostelRoomRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.request.HostelComplaintRepository;
import com.ahrao.repository.request.HostelRequestRepository;
import com.ahrao.repository.request.MaintenanceRequestRepository;
import com.ahrao.repository.resource.ResourceRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.AdminDashboardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private static final Logger log = LoggerFactory.getLogger(AdminDashboardServiceImpl.class);

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final ResourceRepository resourceRepository;
    private final HostelRepository hostelRepository;
    private final HostelRoomRepository hostelRoomRepository;
    private final HostelBedRepository hostelBedRepository;
    private final AcademicResourceRequestRepository academicResourceRequestRepository;
    private final HostelRequestRepository hostelRequestRepository;
    private final ResourceAllocationRepository resourceAllocationRepository;
    private final HostelAllocationRepository hostelAllocationRepository;
    private final ApprovalRepository approvalRepository;
    private final HostelComplaintRepository hostelComplaintRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminDashboardServiceImpl(
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            ResourceRepository resourceRepository,
            HostelRepository hostelRepository,
            HostelRoomRepository hostelRoomRepository,
            HostelBedRepository hostelBedRepository,
            AcademicResourceRequestRepository academicResourceRequestRepository,
            HostelRequestRepository hostelRequestRepository,
            ResourceAllocationRepository resourceAllocationRepository,
            HostelAllocationRepository hostelAllocationRepository,
            ApprovalRepository approvalRepository,
            HostelComplaintRepository hostelComplaintRepository,
            MaintenanceRequestRepository maintenanceRequestRepository,
            AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.resourceRepository = resourceRepository;
        this.hostelRepository = hostelRepository;
        this.hostelRoomRepository = hostelRoomRepository;
        this.hostelBedRepository = hostelBedRepository;
        this.academicResourceRequestRepository = academicResourceRequestRepository;
        this.hostelRequestRepository = hostelRequestRepository;
        this.resourceAllocationRepository = resourceAllocationRepository;
        this.hostelAllocationRepository = hostelAllocationRepository;
        this.approvalRepository = approvalRepository;
        this.hostelComplaintRepository = hostelComplaintRepository;
        this.maintenanceRequestRepository = maintenanceRequestRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public AdminDashboardOverviewResponse getDashboardOverview() {
        log.debug("Generating real-time Admin dashboard overview");
        AdminDashboardOverviewResponse response = new AdminDashboardOverviewResponse();

        // 1. Users & Distribution
        UserDistributionDto userDist = getUserDistribution();
        response.setTotalUsers(userDist.getTotalUsers());
        response.setUserDistribution(userDist);

        // 2. Departments
        long totalDepts = departmentRepository.count();
        long activeDepts = departmentRepository.countByStatus("ACTIVE");
        response.setTotalDepartments(totalDepts);
        response.setActiveDepartments(activeDepts);

        // 3. Academic Resources
        AcademicResourceOverviewDto acadOverview = getAcademicResourceOverview();
        response.setTotalAcademicResources(acadOverview.getTotalResources());
        response.setAcademicResourceOverview(acadOverview);

        // 4. Hostel Resources
        HostelResourceOverviewDto hostelOverview = getHostelResourceOverview();
        response.setTotalHostelResources(hostelOverview.getTotalHostels());
        response.setTotalHostels(hostelOverview.getTotalHostels());
        response.setTotalRooms(hostelOverview.getTotalRooms());
        response.setTotalBeds(hostelOverview.getTotalBeds());
        response.setHostelResourceOverview(hostelOverview);

        // 5. Requests Summary
        long acadPending = academicResourceRequestRepository.countByStatus(RequestStatus.PENDING);
        long acadApproved = academicResourceRequestRepository.countByStatus(RequestStatus.APPROVED);
        long acadRejected = academicResourceRequestRepository.countByStatus(RequestStatus.REJECTED);
        long acadCompleted = academicResourceRequestRepository.countByStatus(RequestStatus.COMPLETED);
        long acadCancelled = academicResourceRequestRepository.countByStatus(RequestStatus.CANCELLED);

        long hostelPending = hostelRequestRepository.countByStatus(RequestStatus.PENDING);
        long hostelApproved = hostelRequestRepository.countByStatus(RequestStatus.APPROVED);
        long hostelRejected = hostelRequestRepository.countByStatus(RequestStatus.REJECTED);
        long hostelCompleted = hostelRequestRepository.countByStatus(RequestStatus.COMPLETED);
        long hostelCancelled = hostelRequestRepository.countByStatus(RequestStatus.CANCELLED);

        long totalPendingReq = acadPending + hostelPending;
        long totalApprovedReq = acadApproved + hostelApproved;
        long totalRejectedReq = acadRejected + hostelRejected;
        long totalCompletedReq = acadCompleted + hostelCompleted;
        long totalCancelledReq = acadCancelled + hostelCancelled;
        long totalRequests = totalPendingReq + totalApprovedReq + totalRejectedReq + totalCompletedReq + totalCancelledReq;

        response.setPendingRequests(totalPendingReq);
        response.setRequestSummary(new RequestSummaryDto(
                totalRequests, totalPendingReq, totalApprovedReq, totalRejectedReq, totalCompletedReq, totalCancelledReq
        ));

        // 6. Allocations Summary
        long acadAllocActive = resourceAllocationRepository.countByStatus(AllocationStatus.ACTIVE);
        long acadAllocPending = resourceAllocationRepository.countByStatus(AllocationStatus.PENDING);
        long acadAllocCompleted = resourceAllocationRepository.countByStatus(AllocationStatus.COMPLETED);
        long acadAllocCancelled = resourceAllocationRepository.countByStatus(AllocationStatus.CANCELLED);

        long hostelAllocActive = hostelAllocationRepository.countByStatus(AllocationStatus.ACTIVE);
        long hostelAllocPending = hostelAllocationRepository.countByStatus(AllocationStatus.PENDING);
        long hostelAllocCompleted = hostelAllocationRepository.countByStatus(AllocationStatus.COMPLETED);
        long hostelAllocCancelled = hostelAllocationRepository.countByStatus(AllocationStatus.CANCELLED);

        long totalActiveAlloc = acadAllocActive + hostelAllocActive;
        long totalPendingAlloc = acadAllocPending + hostelAllocPending;
        long totalCompletedAlloc = acadAllocCompleted + hostelAllocCompleted;
        long totalCancelledAlloc = acadAllocCancelled + hostelAllocCancelled;
        long totalAlloc = totalActiveAlloc + totalPendingAlloc + totalCompletedAlloc + totalCancelledAlloc;

        response.setActiveAllocations(totalActiveAlloc);
        response.setAllocationSummary(new AllocationSummaryDto(
                totalAlloc, totalActiveAlloc, totalPendingAlloc, totalCompletedAlloc, totalCancelledAlloc
        ));

        // 7. Approvals Summary
        long pendingApprovals = approvalRepository.countByStatus(ApprovalStatus.PENDING);
        long approvedApprovals = approvalRepository.countByStatus(ApprovalStatus.APPROVED);
        long rejectedApprovals = approvalRepository.countByStatus(ApprovalStatus.REJECTED);
        long cancelledApprovals = approvalRepository.countByStatus(ApprovalStatus.CANCELLED);
        long totalApprovals = pendingApprovals + approvedApprovals + rejectedApprovals + cancelledApprovals;

        response.setPendingApprovals(pendingApprovals);
        response.setApprovalSummary(new ApprovalSummaryDto(
                totalApprovals, pendingApprovals, approvedApprovals, rejectedApprovals, cancelledApprovals
        ));

        // 8. Open Issues (Hostel Complaints + Maintenance Requests)
        long openComplaints = hostelComplaintRepository.countByStatusIn(
                Arrays.asList(ComplaintStatus.OPEN, ComplaintStatus.IN_PROGRESS)
        );
        long openMaintenance = maintenanceRequestRepository.countByStatusIn(
                Arrays.asList(MaintenanceStatus.OPEN, MaintenanceStatus.ASSIGNED, MaintenanceStatus.IN_PROGRESS)
        );
        long totalOpenIssues = openComplaints + openMaintenance;

        response.setOpenIssues(totalOpenIssues);
        response.setOpenComplaints(openComplaints);
        response.setOpenMaintenanceRequests(openMaintenance);

        // 9. Recent Activity from Audit Logs (Top 10)
        List<AuditLog> recentLogs = auditLogRepository.findRecentAuditLogs(PageRequest.of(0, 10));
        List<RecentActivityDto> activityDtos = new ArrayList<>();
        for (AuditLog logItem : recentLogs) {
            String username = logItem.getUser() != null ? logItem.getUser().getUsername() : "System";
            String description = formatAuditDescription(logItem);
            activityDtos.add(new RecentActivityDto(
                    logItem.getId(),
                    logItem.getAction(),
                    logItem.getEntityType(),
                    logItem.getEntityId(),
                    description,
                    username,
                    logItem.getCreatedAt()
            ));
        }
        response.setRecentActivities(activityDtos);

        return response;
    }

    @Override
    public UserDistributionDto getUserDistribution() {
        long totalUsers = userRepository.count();
        long adminCount = 0;
        long principalCount = 0;
        long hodCount = 0;
        long facultyCount = 0;
        long studentCount = 0;
        long wardenCount = 0;

        List<Object[]> roleCounts = userRepository.countUsersByRoleName();
        for (Object[] row : roleCounts) {
            Object roleObj = row[0];
            String roleName = roleObj != null ? roleObj.toString() : "";
            long count = ((Number) row[1]).longValue();

            if (roleName.contains("ADMIN")) {
                adminCount += count;
            } else if (roleName.contains("PRINCIPAL")) {
                principalCount += count;
            } else if (roleName.contains("HOD")) {
                hodCount += count;
            } else if (roleName.contains("FACULTY")) {
                facultyCount += count;
            } else if (roleName.contains("STUDENT")) {
                studentCount += count;
            } else if (roleName.contains("WARDEN")) {
                wardenCount += count;
            }
        }

        return new UserDistributionDto(
                totalUsers, adminCount, principalCount, hodCount, facultyCount, studentCount, wardenCount
        );
    }

    @Override
    public AcademicResourceOverviewDto getAcademicResourceOverview() {
        long totalResources = resourceRepository.count();
        long available = resourceRepository.countByStatus(ResourceStatus.AVAILABLE);
        long allocated = resourceRepository.countByStatus(ResourceStatus.ALLOCATED);
        long maintenance = resourceRepository.countByStatus(ResourceStatus.MAINTENANCE);
        long inactive = resourceRepository.countByStatus(ResourceStatus.INACTIVE);

        double utilizationRate = 0.0;
        long activePool = available + allocated;
        if (activePool > 0) {
            utilizationRate = roundToSingleDecimal(((double) allocated / activePool) * 100.0);
        }

        return new AcademicResourceOverviewDto(
                totalResources, available, allocated, maintenance, inactive, utilizationRate
        );
    }

    @Override
    public HostelResourceOverviewDto getHostelResourceOverview() {
        long totalHostels = hostelRepository.count();
        long totalRooms = hostelRoomRepository.count();
        long totalBeds = hostelBedRepository.count();

        long availableBeds = hostelBedRepository.countByStatus(HostelBedStatus.AVAILABLE);
        long occupiedBeds = hostelBedRepository.countByStatus(HostelBedStatus.OCCUPIED);
        long maintenanceBeds = hostelBedRepository.countByStatus(HostelBedStatus.MAINTENANCE);
        long reservedBeds = hostelBedRepository.countByStatus(HostelBedStatus.RESERVED);
        long inactiveBeds = hostelBedRepository.countByStatus(HostelBedStatus.INACTIVE);

        // Usable capacity defines beds that can actively house students (excludes inactive and maintenance)
        long usableBeds = availableBeds + occupiedBeds + reservedBeds;
        double occupancyRate = 0.0;
        if (usableBeds > 0) {
            occupancyRate = roundToSingleDecimal(((double) occupiedBeds / usableBeds) * 100.0);
        }

        return new HostelResourceOverviewDto(
                totalHostels, totalRooms, totalBeds, usableBeds, occupiedBeds,
                availableBeds, maintenanceBeds, reservedBeds, inactiveBeds, occupancyRate
        );
    }

    private double roundToSingleDecimal(double value) {
        return BigDecimal.valueOf(value)
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private String formatAuditDescription(AuditLog log) {
        String action = log.getAction() != null ? log.getAction().replace('_', ' ') : "Activity";
        String entityType = log.getEntityType() != null ? log.getEntityType() : "System";
        Long entityId = log.getEntityId();
        if (entityId != null) {
            return String.format("%s on %s #%d", action, entityType, entityId);
        }
        return String.format("%s on %s", action, entityType);
    }
}
