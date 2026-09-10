package com.ahrao.dto.hostel;

import com.ahrao.entity.enums.HostelBedStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateHostelBedRequest {

    @NotNull(message = "Room ID is required")
    private Long roomId;

    @NotBlank(message = "Bed number/identifier is required")
    @Size(max = 20, message = "Bed number cannot exceed 20 characters")
    private String bedNumber;

    private HostelBedStatus status = HostelBedStatus.AVAILABLE;

    public CreateHostelBedRequest() {
    }

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public String getBedNumber() { return bedNumber; }
    public void setBedNumber(String bedNumber) { this.bedNumber = bedNumber; }

    public HostelBedStatus getStatus() { return status; }
    public void setStatus(HostelBedStatus status) { this.status = status; }
}
