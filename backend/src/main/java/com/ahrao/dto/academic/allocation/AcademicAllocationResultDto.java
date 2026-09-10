package com.ahrao.dto.academic.allocation;

import com.ahrao.entity.enums.AllocationStatus;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class AcademicAllocationResultDto {

    private boolean success;
    private String message;
    private Long allocationId;
    private Long requestId;
    private Long resourceId;
    private String resourceName;
    private String categoryName;
    private String building;
    private String roomNumber;
    private Integer capacity;
    private Long allocatedToUserId;
    private String allocatedToUserName;
    private Instant startDatetime;
    private Instant endDatetime;
    private AllocationStatus status;
    private Double score;
    private List<String> conflicts = new ArrayList<>();

    public AcademicAllocationResultDto() {
    }

    public static AcademicAllocationResultDto success(
            Long allocationId,
            Long requestId,
            Long resourceId,
            String resourceName,
            String categoryName,
            String building,
            String roomNumber,
            Integer capacity,
            Long allocatedToUserId,
            String allocatedToUserName,
            Instant startDatetime,
            Instant endDatetime,
            AllocationStatus status,
            Double score,
            String message) {
        AcademicAllocationResultDto dto = new AcademicAllocationResultDto();
        dto.setSuccess(true);
        dto.setAllocationId(allocationId);
        dto.setRequestId(requestId);
        dto.setResourceId(resourceId);
        dto.setResourceName(resourceName);
        dto.setCategoryName(categoryName);
        dto.setBuilding(building);
        dto.setRoomNumber(roomNumber);
        dto.setCapacity(capacity);
        dto.setAllocatedToUserId(allocatedToUserId);
        dto.setAllocatedToUserName(allocatedToUserName);
        dto.setStartDatetime(startDatetime);
        dto.setEndDatetime(endDatetime);
        dto.setStatus(status);
        dto.setScore(score);
        dto.setMessage(message);
        return dto;
    }

    public static AcademicAllocationResultDto failure(String message, List<String> conflicts) {
        AcademicAllocationResultDto dto = new AcademicAllocationResultDto();
        dto.setSuccess(false);
        dto.setMessage(message);
        if (conflicts != null) {
            dto.setConflicts(conflicts);
        }
        return dto;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getAllocationId() {
        return allocationId;
    }

    public void setAllocationId(Long allocationId) {
        this.allocationId = allocationId;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Long getAllocatedToUserId() {
        return allocatedToUserId;
    }

    public void setAllocatedToUserId(Long allocatedToUserId) {
        this.allocatedToUserId = allocatedToUserId;
    }

    public String getAllocatedToUserName() {
        return allocatedToUserName;
    }

    public void setAllocatedToUserName(String allocatedToUserName) {
        this.allocatedToUserName = allocatedToUserName;
    }

    public Instant getStartDatetime() {
        return startDatetime;
    }

    public void setStartDatetime(Instant startDatetime) {
        this.startDatetime = startDatetime;
    }

    public Instant getEndDatetime() {
        return endDatetime;
    }

    public void setEndDatetime(Instant endDatetime) {
        this.endDatetime = endDatetime;
    }

    public AllocationStatus getStatus() {
        return status;
    }

    public void setStatus(AllocationStatus status) {
        this.status = status;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public List<String> getConflicts() {
        return conflicts;
    }

    public void setConflicts(List<String> conflicts) {
        this.conflicts = conflicts;
    }
}
