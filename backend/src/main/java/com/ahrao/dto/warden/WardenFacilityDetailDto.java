package com.ahrao.dto.warden;

public class WardenFacilityDetailDto extends WardenFacilitySummaryDto {
    private String hostelAddress;
    private Integer hostelCapacity;

    public WardenFacilityDetailDto() {
    }

    public String getHostelAddress() {
        return hostelAddress;
    }

    public void setHostelAddress(String hostelAddress) {
        this.hostelAddress = hostelAddress;
    }

    public Integer getHostelCapacity() {
        return hostelCapacity;
    }

    public void setHostelCapacity(Integer hostelCapacity) {
        this.hostelCapacity = hostelCapacity;
    }
}
