package com.ahrao.service.faculty;

import com.ahrao.dto.faculty.dashboard.FacultyDashboardDto;

public interface FacultyDashboardService {

    FacultyDashboardDto getDashboard(Long userId);
}
