package com.ahrao.dto.warden;

import java.util.List;

public class WardenBedDetailDto extends WardenBedSummaryDto {
    private List<WardenAllocationSummaryDto> allocationHistory;

    public WardenBedDetailDto() {
    }

    public List<WardenAllocationSummaryDto> getAllocationHistory() {
        return allocationHistory;
    }

    public void setAllocationHistory(List<WardenAllocationSummaryDto> allocationHistory) {
        this.allocationHistory = allocationHistory;
    }
}
