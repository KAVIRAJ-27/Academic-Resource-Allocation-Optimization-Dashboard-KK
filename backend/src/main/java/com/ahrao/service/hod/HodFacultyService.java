package com.ahrao.service.hod;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hod.HodFacultyDetailDto;
import com.ahrao.dto.hod.HodFacultySummaryDto;
import com.ahrao.dto.hod.HodUpdateFacultyRequest;
import com.ahrao.dto.hod.HodUpdateStatusRequest;
import org.springframework.data.domain.Pageable;

public interface HodFacultyService {

    PagedResponse<HodFacultySummaryDto> getFaculty(Long userId, String search, String status, Pageable pageable);

    HodFacultyDetailDto getFacultyById(Long userId, Long facultyId);

    HodFacultySummaryDto updateFacultyStatus(Long userId, Long facultyId, HodUpdateStatusRequest request);

    HodFacultyDetailDto updateFacultyProfile(Long userId, Long facultyId, HodUpdateFacultyRequest request);
}
