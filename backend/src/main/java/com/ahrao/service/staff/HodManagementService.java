package com.ahrao.service.staff;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.staff.CreateHodAssignmentRequest;
import com.ahrao.dto.staff.HodDetailsResponse;
import com.ahrao.dto.staff.HodSummaryResponse;
import com.ahrao.dto.staff.UpdateHodAssignmentRequest;
import org.springframework.data.domain.Pageable;

public interface HodManagementService {

    PagedResponse<HodSummaryResponse> getHods(
            String search,
            Long departmentId,
            String status,
            Pageable pageable
    );

    HodDetailsResponse getHodById(Long id);

    HodSummaryResponse assignHod(
            CreateHodAssignmentRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent
    );

    HodSummaryResponse updateHodAssignment(
            Long id,
            UpdateHodAssignmentRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent
    );

    HodSummaryResponse updateHodStatus(
            Long id,
            String status,
            String adminUsername,
            String ipAddress,
            String userAgent
    );
}
