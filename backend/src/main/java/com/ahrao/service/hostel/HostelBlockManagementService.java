package com.ahrao.service.hostel;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hostel.CreateHostelBlockRequest;
import com.ahrao.dto.hostel.HostelBlockDetailsResponse;
import com.ahrao.dto.hostel.HostelBlockSummaryResponse;
import com.ahrao.dto.hostel.UpdateHostelBlockRequest;
import org.springframework.data.domain.Pageable;

public interface HostelBlockManagementService {
    PagedResponse<HostelBlockSummaryResponse> getBlocks(Long hostelId, String search, String status, Pageable pageable);
    HostelBlockDetailsResponse getBlockById(Long id);
    HostelBlockSummaryResponse createBlock(CreateHostelBlockRequest request, String adminUsername, String ip, String userAgent);
    HostelBlockSummaryResponse updateBlock(Long id, UpdateHostelBlockRequest request, String adminUsername, String ip, String userAgent);
    HostelBlockSummaryResponse changeStatus(Long id, String status, String adminUsername, String ip, String userAgent);
    void deleteBlock(Long id, String adminUsername, String ip, String userAgent);
}
