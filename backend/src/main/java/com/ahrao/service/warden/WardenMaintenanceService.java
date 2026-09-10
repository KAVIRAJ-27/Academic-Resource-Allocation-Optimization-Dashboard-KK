package com.ahrao.service.warden;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.AssignMaintenanceRequest;
import com.ahrao.dto.warden.CreateWardenMaintenanceRequest;
import com.ahrao.dto.warden.UpdateMaintenanceStatusRequest;
import com.ahrao.dto.warden.WardenMaintenanceDetailDto;
import com.ahrao.dto.warden.WardenMaintenanceSummaryDto;
import com.ahrao.entity.enums.MaintenanceStatus;
import com.ahrao.entity.enums.PriorityLevel;

public interface WardenMaintenanceService {
    PagedResponse<WardenMaintenanceSummaryDto> getMaintenanceRequests(
            Long hostelId,
            Long blockId,
            Integer floorNumber,
            Long roomId,
            MaintenanceStatus status,
            PriorityLevel priority,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir);

    WardenMaintenanceDetailDto getMaintenanceRequestById(Long id);

    WardenMaintenanceDetailDto updateMaintenanceStatus(
            Long id,
            UpdateMaintenanceStatusRequest request,
            String ipAddress,
            String userAgent);

    WardenMaintenanceDetailDto assignMaintenance(
            Long id,
            AssignMaintenanceRequest request,
            String ipAddress,
            String userAgent);

    WardenMaintenanceDetailDto createMaintenanceRequest(
            CreateWardenMaintenanceRequest request,
            String ipAddress,
            String userAgent);
}
