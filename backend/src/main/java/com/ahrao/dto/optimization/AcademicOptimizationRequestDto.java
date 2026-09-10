package com.ahrao.dto.optimization;

import java.time.LocalDate;
import java.time.LocalTime;

public class AcademicOptimizationRequestDto {
    private Long requestId;
    private Long timeSlotId;
    private LocalDate requestedDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer requestedCapacity;
    private Long categoryId;
    private Long departmentId;

    public AcademicOptimizationRequestDto() {
    }

    public AcademicOptimizationRequestDto(Long requestId) {
        this.requestId = requestId;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public Long getTimeSlotId() {
        return timeSlotId;
    }

    public void setTimeSlotId(Long timeSlotId) {
        this.timeSlotId = timeSlotId;
    }

    public LocalDate getRequestedDate() {
        return requestedDate;
    }

    public void setRequestedDate(LocalDate requestedDate) {
        this.requestedDate = requestedDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public Integer getRequestedCapacity() {
        return requestedCapacity;
    }

    public void setRequestedCapacity(Integer requestedCapacity) {
        this.requestedCapacity = requestedCapacity;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }
}
