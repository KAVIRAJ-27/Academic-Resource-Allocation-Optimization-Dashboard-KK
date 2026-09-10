package com.ahrao.service.principal;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.principal.approval.PrincipalApprovalActionRequest;
import com.ahrao.dto.principal.resource.PrincipalResourceRequestDetailDto;
import com.ahrao.dto.principal.resource.PrincipalResourceRequestSummaryDto;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.enums.RequestStatus;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface PrincipalResourceRequestService {

    PagedResponse<PrincipalResourceRequestSummaryDto> getInstitutionRequests(
            Long userId,
            Long departmentId,
            Long categoryId,
            Long resourceId,
            RequestStatus status,
            PriorityLevel priority,
            String search,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable
    );

    PrincipalResourceRequestDetailDto getRequestById(Long userId, Long requestId);

    PrincipalResourceRequestDetailDto approveRequest(Long userId, Long requestId, PrincipalApprovalActionRequest actionRequest);

    PrincipalResourceRequestDetailDto rejectRequest(Long userId, Long requestId, PrincipalApprovalActionRequest actionRequest);
}
