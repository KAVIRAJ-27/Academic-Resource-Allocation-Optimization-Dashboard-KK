package com.ahrao.service.staff;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.staff.AssignPrincipalRequest;
import com.ahrao.dto.staff.PrincipalResponse;
import com.ahrao.dto.staff.UpdatePrincipalAssignmentRequest;
import org.springframework.data.domain.Pageable;

public interface PrincipalManagementService {

    PrincipalResponse getCurrentPrincipal();

    PagedResponse<PrincipalResponse> getPrincipalHistory(
            String search,
            String status,
            Pageable pageable
    );

    PrincipalResponse getPrincipalById(Long id);

    PrincipalResponse assignPrincipal(
            AssignPrincipalRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent
    );

    PrincipalResponse updatePrincipalAssignment(
            Long id,
            UpdatePrincipalAssignmentRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent
    );

    PrincipalResponse updatePrincipalStatus(
            Long id,
            String status,
            String adminUsername,
            String ipAddress,
            String userAgent
    );
}
