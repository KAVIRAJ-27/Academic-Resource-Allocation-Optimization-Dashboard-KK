package com.ahrao.service.student;

import com.ahrao.dto.student.StudentDashboardDto;

public interface StudentDashboardService {
    StudentDashboardDto getDashboard(Long userId);
}
