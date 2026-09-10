package com.ahrao.service.hod;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hod.resource.HodApprovalActionRequest;
import com.ahrao.dto.hod.resource.HodResourceRequestDetailDto;
import com.ahrao.dto.hod.resource.HodResourceRequestOverviewKpiDto;
import com.ahrao.dto.hod.resource.HodResourceRequestSummaryDto;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.enums.RequestStatus;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface HodResourceRequestService {

    PagedResponse<HodResourceRequestSummaryDto> getDepartmentRequests(
            Long userId,
            Long categoryId,
            Long resourceId,
            RequestStatus status,
            PriorityLevel priority,
            String search,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable
    );

    HodResourceRequestDetailDto getRequestDetails(Long userId, Long requestId);

    HodResourceRequestOverviewKpiDto getRequestSummary(Long userId);

    HodResourceRequestDetailDto approveRequest(Long userId, Long requestId, HodApprovalActionRequest request);

    HodResourceRequestDetailDto rejectRequest(Long userId, Long requestId, HodApprovalActionRequest request);
}
