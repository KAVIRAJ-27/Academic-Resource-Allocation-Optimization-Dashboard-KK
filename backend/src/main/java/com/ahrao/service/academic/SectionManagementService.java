package com.ahrao.service.academic;

import com.ahrao.dto.academic.CreateSectionRequest;
import com.ahrao.dto.academic.SectionDetailsResponse;
import com.ahrao.dto.academic.SectionSummaryResponse;
import com.ahrao.dto.academic.UpdateSectionRequest;
import com.ahrao.dto.common.PagedResponse;
import org.springframework.data.domain.Pageable;

public interface SectionManagementService {
    PagedResponse<SectionSummaryResponse> getSections(
            String search, Long departmentId, Long programId, Long academicYearId, Long semesterId, String status, Pageable pageable);
    SectionDetailsResponse getSectionById(Long id);
    SectionSummaryResponse createSection(CreateSectionRequest request, String adminUsername, String ipAddress, String userAgent);
    SectionSummaryResponse updateSection(Long id, UpdateSectionRequest request, String adminUsername, String ipAddress, String userAgent);
    SectionSummaryResponse updateSectionStatus(Long id, String status, String adminUsername, String ipAddress, String userAgent);
    void deleteSection(Long id, String adminUsername, String ipAddress, String userAgent);
}
