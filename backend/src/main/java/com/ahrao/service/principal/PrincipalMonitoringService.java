package com.ahrao.service.principal;

import com.ahrao.dto.principal.monitoring.PrincipalMonitoringResponse;

public interface PrincipalMonitoringService {
    PrincipalMonitoringResponse getMonitoring(Long principalUserId);
}
