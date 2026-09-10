package com.ahrao.service.staff;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.staff.CreateFacultyRequest;
import com.ahrao.dto.staff.FacultyDetailsResponse;
import com.ahrao.dto.staff.FacultySummaryResponse;
import com.ahrao.dto.staff.UpdateFacultyRequest;
import org.springframework.data.domain.Pageable;

public interface FacultyManagementService {

    PagedResponse<FacultySummaryResponse> getFaculty(
            String search,
            Long departmentId,
            String status,
            Pageable pageable
    );

    FacultyDetailsResponse getFacultyById(Long id);

    FacultySummaryResponse createFaculty(
            CreateFacultyRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent
    );

    FacultySummaryResponse updateFaculty(
            Long id,
            UpdateFacultyRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent
    );

    FacultySummaryResponse updateFacultyStatus(
            Long id,
            String status,
            String adminUsername,
            String ipAddress,
            String userAgent
    );
}
