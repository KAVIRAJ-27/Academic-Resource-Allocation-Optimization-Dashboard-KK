package com.ahrao.service.hod;

import com.ahrao.dto.hod.HodDepartmentAssignmentItemDto;
import com.ahrao.dto.hod.HodDepartmentWorkloadOverviewDto;
import com.ahrao.dto.hod.HodFacultyWorkloadDetailDto;

import java.util.List;

public interface HodWorkloadService {

    HodDepartmentWorkloadOverviewDto getWorkloadOverview(Long userId);

    HodFacultyWorkloadDetailDto getFacultyWorkloadDetail(Long userId, Long facultyId);

    List<HodDepartmentAssignmentItemDto> getDepartmentAssignments(Long userId);
}
