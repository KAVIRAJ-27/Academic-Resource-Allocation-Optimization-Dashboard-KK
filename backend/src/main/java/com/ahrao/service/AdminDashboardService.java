package com.ahrao.service;

import com.ahrao.dto.dashboard.AcademicResourceOverviewDto;
import com.ahrao.dto.dashboard.AdminDashboardOverviewResponse;
import com.ahrao.dto.dashboard.HostelResourceOverviewDto;
import com.ahrao.dto.dashboard.UserDistributionDto;

public interface AdminDashboardService {
    AdminDashboardOverviewResponse getDashboardOverview();
    UserDistributionDto getUserDistribution();
    AcademicResourceOverviewDto getAcademicResourceOverview();
    HostelResourceOverviewDto getHostelResourceOverview();
}
