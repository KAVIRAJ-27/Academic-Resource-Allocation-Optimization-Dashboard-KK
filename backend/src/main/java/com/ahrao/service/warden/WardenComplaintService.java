package com.ahrao.service.warden;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.UpdateComplaintStatusRequest;
import com.ahrao.dto.warden.WardenComplaintDetailDto;
import com.ahrao.dto.warden.WardenComplaintSummaryDto;
import com.ahrao.entity.enums.ComplaintStatus;
import com.ahrao.entity.enums.PriorityLevel;

public interface WardenComplaintService {
    PagedResponse<WardenComplaintSummaryDto> getComplaints(
            Long hostelId,
            Long blockId,
            Integer floorNumber,
            Long roomId,
            ComplaintStatus status,
            PriorityLevel priority,
            String category,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir);

    WardenComplaintDetailDto getComplaintById(Long id);

    WardenComplaintDetailDto updateComplaintStatus(
            Long id,
            UpdateComplaintStatusRequest request,
            String ipAddress,
            String userAgent);
}
