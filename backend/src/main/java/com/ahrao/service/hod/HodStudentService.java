package com.ahrao.service.hod;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hod.HodStudentDetailDto;
import com.ahrao.dto.hod.HodStudentReferenceDataDto;
import com.ahrao.dto.hod.HodStudentSummaryDto;
import com.ahrao.dto.hod.HodUpdateStatusRequest;
import com.ahrao.dto.hod.HodUpdateStudentRequest;
import org.springframework.data.domain.Pageable;

public interface HodStudentService {

    PagedResponse<HodStudentSummaryDto> getStudents(
            Long userId, String search, Long programId, Long sectionId, Integer semester, String status, Pageable pageable);

    HodStudentDetailDto getStudentById(Long userId, Long studentId);

    HodStudentReferenceDataDto getReferenceData(Long userId);

    HodStudentSummaryDto updateStudentStatus(Long userId, Long studentId, HodUpdateStatusRequest request);

    HodStudentDetailDto updateStudentProfile(Long userId, Long studentId, HodUpdateStudentRequest request);
}
