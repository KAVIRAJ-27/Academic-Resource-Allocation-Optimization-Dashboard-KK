package com.ahrao.service.warden;

import com.ahrao.entity.allocation.HostelAllocation;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.hostel.HostelBed;
import com.ahrao.entity.hostel.HostelFacility;
import com.ahrao.entity.hostel.HostelRoom;
import com.ahrao.entity.hostel.Warden;
import com.ahrao.entity.request.HostelComplaint;
import com.ahrao.entity.request.MaintenanceRequest;

import java.util.Set;

public interface WardenScopeService {
    Warden resolveWarden();
    Set<Hostel> getAuthorizedHostels();
    Set<Long> getAuthorizedHostelIds();
    Long validateHostelAccess(Long hostelId);
    HostelRoom validateRoomAccess(Long roomId);
    HostelBed validateBedAccess(Long bedId);
    HostelAllocation validateAllocationAccess(Long allocationId);
    HostelFacility validateFacilityAccess(Long facilityId);
    HostelComplaint validateComplaintAccess(Long complaintId);
    MaintenanceRequest validateMaintenanceAccess(Long maintenanceId);
}
