package com.ahrao.service.academic;

import com.ahrao.dto.academic.CreateProgramRequest;
import com.ahrao.dto.academic.ProgramDetailsResponse;
import com.ahrao.dto.academic.ProgramSummaryResponse;
import com.ahrao.dto.academic.UpdateProgramRequest;
import com.ahrao.dto.common.PagedResponse;
import org.springframework.data.domain.Pageable;

public interface ProgramManagementService {
    PagedResponse<ProgramSummaryResponse> getPrograms(String search, Long departmentId, String status, Pageable pageable);
    ProgramDetailsResponse getProgramById(Long id);
    ProgramSummaryResponse createProgram(CreateProgramRequest request, String adminUsername, String ipAddress, String userAgent);
    ProgramSummaryResponse updateProgram(Long id, UpdateProgramRequest request, String adminUsername, String ipAddress, String userAgent);
    ProgramSummaryResponse updateProgramStatus(Long id, String status, String adminUsername, String ipAddress, String userAgent);
    void deleteProgram(Long id, String adminUsername, String ipAddress, String userAgent);
}
