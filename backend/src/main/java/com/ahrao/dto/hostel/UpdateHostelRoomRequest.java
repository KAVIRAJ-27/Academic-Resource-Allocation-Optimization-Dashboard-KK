package com.ahrao.dto.hostel;

import com.ahrao.entity.enums.RoomType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class UpdateHostelRoomRequest {

    @NotNull(message = "Room type is required (SINGLE, DOUBLE, TRIPLE, FOUR_SHARING, DORMITORY)")
    private RoomType roomType;

    @NotNull(message = "Room capacity is required")
    @Min(value = 1, message = "Room capacity must be at least 1")
    private Integer capacity;

    public UpdateHostelRoomRequest() {
    }

    public RoomType getRoomType() { return roomType; }
    public void setRoomType(RoomType roomType) { this.roomType = roomType; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
}
