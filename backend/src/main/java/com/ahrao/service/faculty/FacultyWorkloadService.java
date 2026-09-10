package com.ahrao.service.faculty;

import com.ahrao.dto.faculty.workload.FacultyWorkloadResponseDto;

public interface FacultyWorkloadService {

    FacultyWorkloadResponseDto getWorkload(Long userId);
}
