package com.ahrao.service.staff;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.staff.CreateWardenRequest;
import com.ahrao.dto.staff.UpdateWardenRequest;
import com.ahrao.dto.staff.WardenDetailsResponse;
import com.ahrao.dto.staff.WardenHostelAssignmentRequest;
import com.ahrao.dto.staff.WardenSummaryResponse;
import org.springframework.data.domain.Pageable;

public interface WardenManagementService {

    PagedResponse<WardenSummaryResponse> getWardens(
            String search,
            Long hostelId,
            String status,
            Pageable pageable
    );

    WardenDetailsResponse getWardenById(Long id);

    WardenSummaryResponse createWarden(
            CreateWardenRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent
    );

    WardenSummaryResponse updateWarden(
            Long id,
            UpdateWardenRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent
    );

    WardenSummaryResponse updateWardenStatus(
            Long id,
            String status,
            String adminUsername,
            String ipAddress,
            String userAgent
    );

    WardenSummaryResponse assignHostels(
            Long id,
            WardenHostelAssignmentRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent
    );
}
