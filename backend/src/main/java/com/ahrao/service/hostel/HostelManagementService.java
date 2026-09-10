package com.ahrao.service.hostel;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hostel.CreateHostelRequest;
import com.ahrao.dto.hostel.HostelDetailsResponse;
import com.ahrao.dto.hostel.HostelSummaryResponse;
import com.ahrao.dto.hostel.UpdateHostelRequest;
import com.ahrao.entity.enums.HostelType;
import org.springframework.data.domain.Pageable;

public interface HostelManagementService {
    PagedResponse<HostelSummaryResponse> getHostels(String search, String status, HostelType type, Pageable pageable);
    HostelDetailsResponse getHostelById(Long id);
    HostelSummaryResponse createHostel(CreateHostelRequest request, String adminUsername, String ip, String userAgent);
    HostelSummaryResponse updateHostel(Long id, UpdateHostelRequest request, String adminUsername, String ip, String userAgent);
    HostelSummaryResponse changeStatus(Long id, String status, String adminUsername, String ip, String userAgent);
    void deleteHostel(Long id, String adminUsername, String ip, String userAgent);
}
