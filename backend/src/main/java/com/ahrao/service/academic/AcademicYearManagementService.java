package com.ahrao.service.academic;

import com.ahrao.dto.academic.AcademicYearDetailsResponse;
import com.ahrao.dto.academic.AcademicYearSummaryResponse;
import com.ahrao.dto.academic.CreateAcademicYearRequest;
import com.ahrao.dto.academic.UpdateAcademicYearRequest;
import com.ahrao.dto.common.PagedResponse;
import org.springframework.data.domain.Pageable;

public interface AcademicYearManagementService {
    PagedResponse<AcademicYearSummaryResponse> getAcademicYears(String search, String status, Pageable pageable);
    AcademicYearDetailsResponse getAcademicYearById(Long id);
    AcademicYearSummaryResponse createAcademicYear(CreateAcademicYearRequest request, String adminUsername, String ipAddress, String userAgent);
    AcademicYearSummaryResponse updateAcademicYear(Long id, UpdateAcademicYearRequest request, String adminUsername, String ipAddress, String userAgent);
    AcademicYearSummaryResponse updateAcademicYearStatus(Long id, String status, String adminUsername, String ipAddress, String userAgent);
    AcademicYearSummaryResponse activateAcademicYear(Long id, String adminUsername, String ipAddress, String userAgent);
    void deleteAcademicYear(Long id, String adminUsername, String ipAddress, String userAgent);
}
