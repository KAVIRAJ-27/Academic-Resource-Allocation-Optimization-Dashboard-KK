package com.ahrao.service.resource;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.resource.CreateTimeSlotRequest;
import com.ahrao.dto.resource.TimeSlotDetailsResponse;
import com.ahrao.dto.resource.TimeSlotSummaryResponse;
import com.ahrao.dto.resource.UpdateTimeSlotRequest;
import org.springframework.data.domain.Pageable;

public interface TimeSlotManagementService {
    PagedResponse<TimeSlotSummaryResponse> getTimeSlots(String search, String dayOfWeek, String status, Pageable pageable);
    TimeSlotDetailsResponse getTimeSlotById(Long id);
    TimeSlotDetailsResponse createTimeSlot(CreateTimeSlotRequest request, String adminUsername, String ip, String userAgent);
    TimeSlotDetailsResponse updateTimeSlot(Long id, UpdateTimeSlotRequest request, String adminUsername, String ip, String userAgent);
    TimeSlotSummaryResponse changeStatus(Long id, String status, String adminUsername, String ip, String userAgent);
    void deleteTimeSlot(Long id, String adminUsername, String ip, String userAgent);
}
