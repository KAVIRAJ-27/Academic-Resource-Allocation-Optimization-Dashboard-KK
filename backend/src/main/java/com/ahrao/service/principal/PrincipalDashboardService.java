package com.ahrao.service.principal;

import com.ahrao.dto.principal.dashboard.PrincipalDashboardResponse;

public interface PrincipalDashboardService {
    PrincipalDashboardResponse getDashboard(Long principalUserId);
}
