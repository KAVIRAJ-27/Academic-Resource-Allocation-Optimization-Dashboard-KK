package com.ahrao.service.hostel;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hostel.CreateHostelFloorRequest;
import com.ahrao.dto.hostel.HostelFloorDetailsResponse;
import com.ahrao.dto.hostel.HostelFloorSummaryResponse;
import com.ahrao.dto.hostel.UpdateHostelFloorRequest;
import org.springframework.data.domain.Pageable;

public interface HostelFloorManagementService {
    PagedResponse<HostelFloorSummaryResponse> getFloors(Long hostelId, Long blockId, String search, String status, Pageable pageable);
    HostelFloorDetailsResponse getFloorById(Long id);
    HostelFloorSummaryResponse createFloor(CreateHostelFloorRequest request, String adminUsername, String ip, String userAgent);
    HostelFloorSummaryResponse updateFloor(Long id, UpdateHostelFloorRequest request, String adminUsername, String ip, String userAgent);
    HostelFloorSummaryResponse changeStatus(Long id, String status, String adminUsername, String ip, String userAgent);
    void deleteFloor(Long id, String adminUsername, String ip, String userAgent);
}
