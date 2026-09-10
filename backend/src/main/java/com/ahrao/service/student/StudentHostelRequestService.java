package com.ahrao.service.student;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.student.hostel.request.CreateStudentHostelRequest;
import com.ahrao.dto.student.hostel.request.StudentHostelRequestDto;
import com.ahrao.dto.student.hostel.request.StudentHostelRequestSummaryCountsDto;
import com.ahrao.entity.enums.RequestStatus;

public interface StudentHostelRequestService {
    PagedResponse<StudentHostelRequestDto> getMyRequests(
            Long userId,
            RequestStatus status,
            String requestType,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDirection);

    StudentHostelRequestDto getRequestById(Long userId, Long requestId);

    StudentHostelRequestDto createRequest(
            Long userId,
            CreateStudentHostelRequest req,
            String ipAddress,
            String userAgent);

    StudentHostelRequestDto cancelRequest(
            Long userId,
            Long requestId,
            String ipAddress,
            String userAgent);

    StudentHostelRequestSummaryCountsDto getRequestCounts(Long userId);
}
