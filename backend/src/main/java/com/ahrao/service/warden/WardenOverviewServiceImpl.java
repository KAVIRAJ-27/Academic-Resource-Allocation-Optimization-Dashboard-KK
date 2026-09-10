package com.ahrao.service.warden;

import com.ahrao.dto.warden.WardenOverviewDto;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.ComplaintStatus;
import com.ahrao.entity.enums.HostelBedStatus;
import com.ahrao.entity.enums.MaintenanceStatus;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
import com.ahrao.repository.hostel.HostelFacilityRepository;
import com.ahrao.repository.request.HostelComplaintRepository;
import com.ahrao.repository.request.MaintenanceRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class WardenOverviewServiceImpl implements WardenOverviewService {

    private final WardenScopeService wardenScopeService;
    private final HostelBedRepository hostelBedRepository;
    private final HostelAllocationRepository hostelAllocationRepository;
    private final HostelFacilityRepository hostelFacilityRepository;
    private final HostelComplaintRepository hostelComplaintRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;

    public WardenOverviewServiceImpl(
            WardenScopeService wardenScopeService,
            HostelBedRepository hostelBedRepository,
            HostelAllocationRepository hostelAllocationRepository,
            HostelFacilityRepository hostelFacilityRepository,
            HostelComplaintRepository hostelComplaintRepository,
            MaintenanceRequestRepository maintenanceRequestRepository) {
        this.wardenScopeService = wardenScopeService;
        this.hostelBedRepository = hostelBedRepository;
        this.hostelAllocationRepository = hostelAllocationRepository;
        this.hostelFacilityRepository = hostelFacilityRepository;
        this.hostelComplaintRepository = hostelComplaintRepository;
        this.maintenanceRequestRepository = maintenanceRequestRepository;
    }

    @Override
    public WardenOverviewDto getWardenOverview(Long hostelId) {
        Set<Long> authorizedIds = wardenScopeService.getAuthorizedHostelIds();
        if (authorizedIds.isEmpty()) {
            return new WardenOverviewDto();
        }

        if (hostelId != null && !authorizedIds.contains(hostelId)) {
            throw new ForbiddenException("Requested hostel is outside your authorized scope.");
        }

        Set<Long> queryHostelIds = (hostelId != null) ? Set.of(hostelId) : authorizedIds;

        WardenOverviewDto dto = new WardenOverviewDto();

        // 1. Bed metrics
        long totalBeds = hostelBedRepository.countByRoomFloorBlockHostelIdIn(queryHostelIds);
        long occupiedBeds = hostelBedRepository.countByRoomFloorBlockHostelIdInAndStatus(queryHostelIds, HostelBedStatus.OCCUPIED);
        long availableBeds = hostelBedRepository.countByRoomFloorBlockHostelIdInAndStatus(queryHostelIds, HostelBedStatus.AVAILABLE);
        dto.setTotalBeds(totalBeds);
        dto.setOccupiedBeds(occupiedBeds);
        dto.setAvailableBeds(availableBeds);

        // 2. Residents
        long residentStudents = hostelAllocationRepository.countByHostelBedRoomFloorBlockHostelIdInAndStatus(queryHostelIds, AllocationStatus.ACTIVE);
        dto.setResidentStudents(residentStudents);

        // 3. Facilities
        long totalFacilities = hostelFacilityRepository.countByHostelIdIn(queryHostelIds);
        long activeFacilities = hostelFacilityRepository.countByHostelIdInAndStatus(queryHostelIds, "ACTIVE");
        dto.setTotalFacilities(totalFacilities);
        dto.setActiveFacilities(activeFacilities);

        // 4. Complaints
        long openComplaints = hostelComplaintRepository.countByHostelIdInAndStatusIn(queryHostelIds, List.of(ComplaintStatus.OPEN));
        long inProgressComplaints = hostelComplaintRepository.countByHostelIdInAndStatusIn(queryHostelIds, List.of(ComplaintStatus.IN_PROGRESS));
        long resolvedComplaints = hostelComplaintRepository.countByHostelIdInAndStatusIn(queryHostelIds, List.of(ComplaintStatus.RESOLVED));
        dto.setOpenComplaints(openComplaints);
        dto.setInProgressComplaints(inProgressComplaints);
        dto.setResolvedComplaints(resolvedComplaints);

        // 5. Maintenance
        long openMaintenance = maintenanceRequestRepository.countByHostelIdInAndStatusIn(queryHostelIds, List.of(MaintenanceStatus.OPEN));
        long inProgressMaintenance = maintenanceRequestRepository.countByHostelIdInAndStatusIn(queryHostelIds, List.of(MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.ASSIGNED));
        long completedMaintenance = maintenanceRequestRepository.countByHostelIdInAndStatusIn(queryHostelIds, List.of(MaintenanceStatus.COMPLETED));
        dto.setOpenMaintenance(openMaintenance);
        dto.setInProgressMaintenance(inProgressMaintenance);
        dto.setCompletedMaintenance(completedMaintenance);

        return dto;
    }
}
