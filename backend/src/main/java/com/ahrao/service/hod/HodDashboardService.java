package com.ahrao.service.hod;

import com.ahrao.dto.hod.dashboard.HodDashboardResponse;

public interface HodDashboardService {

    /**
     * Get HOD dashboard data for the authenticated HOD.
     * Department is resolved automatically from the user's principal.
     *
     * @return Full HOD dashboard response
     */
    HodDashboardResponse getHodDashboard();

    /**
     * Get HOD dashboard data for the given user ID.
     * Used for testing and internal service calls.
     *
     * @param userId user ID of the HOD
     * @return Full HOD dashboard response
     */
    HodDashboardResponse getHodDashboard(Long userId);
}
