package com.ahrao.service.academic;

import com.ahrao.dto.academic.CreateSemesterRequest;
import com.ahrao.dto.academic.SemesterDetailsResponse;
import com.ahrao.dto.academic.SemesterSummaryResponse;
import com.ahrao.dto.academic.UpdateSemesterRequest;
import com.ahrao.dto.common.PagedResponse;
import org.springframework.data.domain.Pageable;

public interface SemesterManagementService {
    PagedResponse<SemesterSummaryResponse> getSemesters(Long academicYearId, String status, String search, Pageable pageable);
    SemesterDetailsResponse getSemesterById(Long id);
    SemesterSummaryResponse createSemester(CreateSemesterRequest request, String adminUsername, String ipAddress, String userAgent);
    SemesterSummaryResponse updateSemester(Long id, UpdateSemesterRequest request, String adminUsername, String ipAddress, String userAgent);
    SemesterSummaryResponse updateSemesterStatus(Long id, String status, String adminUsername, String ipAddress, String userAgent);
    void deleteSemester(Long id, String adminUsername, String ipAddress, String userAgent);
}
