package com.ahrao.service.student;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.student.resource.CreateStudentResourceRequest;
import com.ahrao.dto.student.resource.StudentResourceRequestDto;
import com.ahrao.dto.student.resource.StudentResourceRequestSummaryCountsDto;
import com.ahrao.dto.student.resource.StudentResourceSummaryDto;
import com.ahrao.entity.enums.RequestStatus;

import java.time.LocalDate;
import java.util.List;

public interface StudentResourceRequestService {
    PagedResponse<StudentResourceRequestDto> getMyRequests(
            Long userId,
            RequestStatus status,
            Long categoryId,
            LocalDate date,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDirection);

    StudentResourceRequestDto getRequestById(Long userId, Long requestId);

    StudentResourceRequestDto createRequest(
            Long userId,
            CreateStudentResourceRequest request,
            String ipAddress,
            String userAgent);

    StudentResourceRequestDto cancelRequest(
            Long userId,
            Long requestId,
            String ipAddress,
            String userAgent);

    StudentResourceRequestSummaryCountsDto getRequestCounts(Long userId);

    List<StudentResourceSummaryDto> getAvailableResources(Long userId, Long categoryId);
}
