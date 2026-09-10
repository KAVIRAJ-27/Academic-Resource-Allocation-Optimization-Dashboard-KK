package com.ahrao.service.principal;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.principal.approval.PrincipalApprovalActionRequest;
import com.ahrao.dto.principal.approval.PrincipalApprovalDetailDto;
import com.ahrao.dto.principal.approval.PrincipalApprovalSummaryDto;
import com.ahrao.entity.enums.ApprovalLevel;
import com.ahrao.entity.enums.ApprovalStatus;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface PrincipalApprovalService {

    PagedResponse<PrincipalApprovalSummaryDto> getInstitutionApprovals(
            Long userId,
            Long departmentId,
            ApprovalStatus status,
            ApprovalLevel approvalLevel,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable
    );

    PrincipalApprovalDetailDto getApprovalById(Long userId, Long approvalId);

    PrincipalApprovalDetailDto approveApproval(Long userId, Long approvalId, PrincipalApprovalActionRequest actionRequest);

    PrincipalApprovalDetailDto rejectApproval(Long userId, Long approvalId, PrincipalApprovalActionRequest actionRequest);
}
