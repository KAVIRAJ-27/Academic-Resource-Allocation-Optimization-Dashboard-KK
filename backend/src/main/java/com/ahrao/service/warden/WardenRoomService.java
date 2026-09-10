package com.ahrao.service.warden;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.WardenRoomDetailDto;
import com.ahrao.dto.warden.WardenRoomSummaryDto;
import org.springframework.data.domain.Pageable;

public interface WardenRoomService {
    PagedResponse<WardenRoomSummaryDto> getRooms(
            Long hostelId,
            Long blockId,
            Integer floorNumber,
            String status,
            String search,
            Pageable pageable);

    WardenRoomDetailDto getRoomById(Long roomId);
}
