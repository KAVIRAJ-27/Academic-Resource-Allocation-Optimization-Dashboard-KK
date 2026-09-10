package com.ahrao.service.warden;

import com.ahrao.entity.allocation.HostelAllocation;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.hostel.HostelBed;
import com.ahrao.entity.hostel.HostelFacility;
import com.ahrao.entity.hostel.HostelRoom;
import com.ahrao.entity.hostel.Warden;
import com.ahrao.entity.request.HostelComplaint;
import com.ahrao.entity.request.MaintenanceRequest;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
import com.ahrao.repository.hostel.HostelFacilityRepository;
import com.ahrao.repository.hostel.HostelRoomRepository;
import com.ahrao.repository.hostel.WardenRepository;
import com.ahrao.repository.request.HostelComplaintRepository;
import com.ahrao.repository.request.MaintenanceRequestRepository;
import com.ahrao.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class WardenScopeServiceImpl implements WardenScopeService {

    private final WardenRepository wardenRepository;
    private final HostelRoomRepository hostelRoomRepository;
    private final HostelBedRepository hostelBedRepository;
    private final HostelAllocationRepository hostelAllocationRepository;
    private final HostelFacilityRepository hostelFacilityRepository;
    private final HostelComplaintRepository hostelComplaintRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;

    public WardenScopeServiceImpl(
            WardenRepository wardenRepository,
            HostelRoomRepository hostelRoomRepository,
            HostelBedRepository hostelBedRepository,
            HostelAllocationRepository hostelAllocationRepository,
            HostelFacilityRepository hostelFacilityRepository,
            HostelComplaintRepository hostelComplaintRepository,
            MaintenanceRequestRepository maintenanceRequestRepository) {
        this.wardenRepository = wardenRepository;
        this.hostelRoomRepository = hostelRoomRepository;
        this.hostelBedRepository = hostelBedRepository;
        this.hostelAllocationRepository = hostelAllocationRepository;
        this.hostelFacilityRepository = hostelFacilityRepository;
        this.hostelComplaintRepository = hostelComplaintRepository;
        this.maintenanceRequestRepository = maintenanceRequestRepository;
    }

    @Override
    public Warden resolveWarden() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new ForbiddenException("No authenticated user found in security context."));

        Warden warden = wardenRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new ForbiddenException("Authenticated user is not registered as a Warden."));

        if (warden.getStatus() != null && !"ACTIVE".equalsIgnoreCase(warden.getStatus())) {
            throw new ForbiddenException("Warden account is currently inactive.");
        }

        return warden;
    }

    @Override
    public Set<Hostel> getAuthorizedHostels() {
        Warden warden = resolveWarden();
        return warden.getAssignedHostels() != null ? warden.getAssignedHostels() : Collections.emptySet();
    }

    @Override
    public Set<Long> getAuthorizedHostelIds() {
        return getAuthorizedHostels().stream()
                .map(Hostel::getId)
                .collect(Collectors.toSet());
    }

    @Override
    public Long validateHostelAccess(Long hostelId) {
        Set<Long> authorizedIds = getAuthorizedHostelIds();
        if (authorizedIds.isEmpty()) {
            throw new ForbiddenException("No hostel has been assigned to your account.");
        }

        if (hostelId != null) {
            if (!authorizedIds.contains(hostelId)) {
                throw new ForbiddenException("You are not authorized to access hostel with ID: " + hostelId);
            }
            return hostelId;
        }

        // If not specified, and warden has exactly one hostel, auto-select it
        if (authorizedIds.size() == 1) {
            return authorizedIds.iterator().next();
        }

        return null;
    }

    @Override
    public HostelRoom validateRoomAccess(Long roomId) {
        HostelRoom room = hostelRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel room not found with ID: " + roomId));

        Long hostelId = resolveHostelIdFromRoom(room);
        Set<Long> authorizedIds = getAuthorizedHostelIds();

        if (hostelId == null || !authorizedIds.contains(hostelId)) {
            throw new ForbiddenException("Room '" + room.getRoomNumber() + "' belongs to a hostel outside your authorized scope.");
        }

        return room;
    }

    @Override
    public HostelBed validateBedAccess(Long bedId) {
        HostelBed bed = hostelBedRepository.findById(bedId)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel bed not found with ID: " + bedId));

        Long hostelId = resolveHostelIdFromBed(bed);
        Set<Long> authorizedIds = getAuthorizedHostelIds();

        if (hostelId == null || !authorizedIds.contains(hostelId)) {
            throw new ForbiddenException("Bed '" + bed.getBedNumber() + "' belongs to a hostel outside your authorized scope.");
        }

        return bed;
    }

    @Override
    public HostelAllocation validateAllocationAccess(Long allocationId) {
        HostelAllocation allocation = hostelAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel allocation not found with ID: " + allocationId));

        Long hostelId = resolveHostelIdFromBed(allocation.getBed());
        Set<Long> authorizedIds = getAuthorizedHostelIds();

        if (hostelId == null || !authorizedIds.contains(hostelId)) {
            throw new ForbiddenException("Hostel allocation #" + allocationId + " belongs to a hostel outside your authorized scope.");
        }

        return allocation;
    }

    @Override
    public HostelFacility validateFacilityAccess(Long facilityId) {
        HostelFacility facility = hostelFacilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel facility not found with ID: " + facilityId));

        Long hostelId = facility.getHostel() != null ? facility.getHostel().getId() : null;
        Set<Long> authorizedIds = getAuthorizedHostelIds();

        if (hostelId == null || !authorizedIds.contains(hostelId)) {
            throw new ForbiddenException("Hostel facility #" + facilityId + " belongs to a hostel outside your authorized scope.");
        }

        return facility;
    }

    @Override
    public HostelComplaint validateComplaintAccess(Long complaintId) {
        HostelComplaint complaint = hostelComplaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel complaint not found with ID: " + complaintId));

        Long hostelId = complaint.getHostel() != null ? complaint.getHostel().getId() : null;
        Set<Long> authorizedIds = getAuthorizedHostelIds();

        if (hostelId == null || !authorizedIds.contains(hostelId)) {
            throw new ForbiddenException("Hostel complaint #" + complaintId + " belongs to a hostel outside your authorized scope.");
        }

        return complaint;
    }

    @Override
    public MaintenanceRequest validateMaintenanceAccess(Long maintenanceId) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(maintenanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance request not found with ID: " + maintenanceId));

        Long hostelId = request.getHostel() != null ? request.getHostel().getId() : null;
        if (hostelId == null && request.getRoom() != null) {
            hostelId = resolveHostelIdFromRoom(request.getRoom());
        }

        Set<Long> authorizedIds = getAuthorizedHostelIds();

        if (hostelId == null || !authorizedIds.contains(hostelId)) {
            throw new ForbiddenException("Maintenance request #" + maintenanceId + " belongs to a hostel outside your authorized scope.");
        }

        return request;
    }

    private Long resolveHostelIdFromRoom(HostelRoom room) {
        if (room == null || room.getFloor() == null || room.getFloor().getBlock() == null || room.getFloor().getBlock().getHostel() == null) {
            return null;
        }
        return room.getFloor().getBlock().getHostel().getId();
    }

    private Long resolveHostelIdFromBed(HostelBed bed) {
        if (bed == null) {
            return null;
        }
        return resolveHostelIdFromRoom(bed.getRoom());
    }
}
