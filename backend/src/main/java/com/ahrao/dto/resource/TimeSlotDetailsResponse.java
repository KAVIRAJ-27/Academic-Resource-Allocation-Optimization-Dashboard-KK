package com.ahrao.dto.resource;

import java.time.LocalTime;

public class TimeSlotDetailsResponse {
    private Long id;
    private Long institutionId;
    private String institutionName;
    private String name;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private long totalTimetableEntries;
    private long totalAllocations;

    public TimeSlotDetailsResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(Long institutionId) {
        this.institutionId = institutionId;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getTotalTimetableEntries() {
        return totalTimetableEntries;
    }

    public void setTotalTimetableEntries(long totalTimetableEntries) {
        this.totalTimetableEntries = totalTimetableEntries;
    }

    public long getTotalAllocations() {
        return totalAllocations;
    }

    public void setTotalAllocations(long totalAllocations) {
        this.totalAllocations = totalAllocations;
    }
}
