package com.ahrao.service.faculty;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.faculty.resource.*;
import com.ahrao.entity.enums.RequestStatus;

import java.time.LocalDate;
import java.util.List;

public interface FacultyResourceRequestService {

    PagedResponse<FacultyResourceRequestDto> getMyRequests(
            Long userId,
            RequestStatus status,
            Long categoryId,
            LocalDate date,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDirection
    );

    FacultyResourceRequestSummaryCountsDto getRequestCounts(Long userId);

    List<FacultyAvailableResourceDto> getAvailableResources(Long userId, Long categoryId);

    FacultyResourceRequestDetailsDto getRequestById(Long userId, Long requestId);

    FacultyResourceRequestDto createRequest(
            Long userId,
            CreateFacultyResourceRequest req,
            String ipAddress,
            String userAgent
    );

    FacultyResourceRequestDto cancelRequest(
            Long userId,
            Long requestId,
            String ipAddress,
            String userAgent
    );
}
