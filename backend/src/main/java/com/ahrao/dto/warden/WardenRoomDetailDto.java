package com.ahrao.dto.warden;

import java.util.List;

public class WardenRoomDetailDto extends WardenRoomSummaryDto {
    private List<WardenBedSummaryDto> beds;

    public WardenRoomDetailDto() {
    }

    public List<WardenBedSummaryDto> getBeds() {
        return beds;
    }

    public void setBeds(List<WardenBedSummaryDto> beds) {
        this.beds = beds;
    }
}
