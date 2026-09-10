package com.ahrao.dto.academic.allocation;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.LocalTime;

public class AllocateAcademicResourceRequest {

    private Long requestId;
    private Long resourceId;
    private Long allocatedToUserId;

    @NotNull(message = "Start datetime is required")
    private Instant startDatetime;

    @NotNull(message = "End datetime is required")
    private Instant endDatetime;

    private String remarks;

    private Long academicYearId;
    private Long semesterId;
    private Long sectionId;
    private Long subjectId;

    // Optional timetable linkage
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;

    private Boolean forceOverride = false;

    public AllocateAcademicResourceRequest() {
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

    public Long getAllocatedToUserId() {
        return allocatedToUserId;
    }

    public void setAllocatedToUserId(Long allocatedToUserId) {
        this.allocatedToUserId = allocatedToUserId;
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

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public Long getAcademicYearId() {
        return academicYearId;
    }

    public void setAcademicYearId(Long academicYearId) {
        this.academicYearId = academicYearId;
    }

    public Long getSemesterId() {
        return semesterId;
    }

    public void setSemesterId(Long semesterId) {
        this.semesterId = semesterId;
    }

    public Long getSectionId() {
        return sectionId;
    }

    public void setSectionId(Long sectionId) {
        this.sectionId = sectionId;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
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

    public Boolean getForceOverride() {
        return forceOverride;
    }

    public void setForceOverride(Boolean forceOverride) {
        this.forceOverride = forceOverride;
    }
}
