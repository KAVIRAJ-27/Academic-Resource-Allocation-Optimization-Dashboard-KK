package com.ahrao.service.academic;

import com.ahrao.dto.academic.CreateSubjectRequest;
import com.ahrao.dto.academic.SubjectDetailsResponse;
import com.ahrao.dto.academic.SubjectSummaryResponse;
import com.ahrao.dto.academic.UpdateSubjectRequest;
import com.ahrao.dto.common.PagedResponse;
import org.springframework.data.domain.Pageable;

public interface SubjectManagementService {
    PagedResponse<SubjectSummaryResponse> getSubjects(
            String search, Long departmentId, Long programId, Long semesterId, String status, Pageable pageable);
    SubjectDetailsResponse getSubjectById(Long id);
    SubjectSummaryResponse createSubject(CreateSubjectRequest request, String adminUsername, String ipAddress, String userAgent);
    SubjectSummaryResponse updateSubject(Long id, UpdateSubjectRequest request, String adminUsername, String ipAddress, String userAgent);
    SubjectSummaryResponse updateSubjectStatus(Long id, String status, String adminUsername, String ipAddress, String userAgent);
    void deleteSubject(Long id, String adminUsername, String ipAddress, String userAgent);
}
