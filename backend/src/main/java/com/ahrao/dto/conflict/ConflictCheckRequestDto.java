package com.ahrao.dto.conflict;

import com.ahrao.entity.enums.ConflictDomain;

import java.time.LocalDate;
import java.time.LocalTime;

public class ConflictCheckRequestDto {
    private ConflictDomain domain;

    // Academic parameters
    private Long resourceId;
    private Long requestId;
    private Long facultyId;
    private Long sectionId;
    private Long timeSlotId;
    private LocalDate requestedDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer requestedCapacity;
    private Long departmentId;

    // Hostel parameters
    private Long studentId;
    private Long hostelId;
    private Long roomId;
    private Long bedId;
    private Long hostelRequestId;
    private LocalDate startDate;
    private LocalDate endDate;

    // Existing allocation check (to exclude self in overlap checks)
    private Long existingAllocationId;

    // Optional pre-resolved target entities to avoid redundant database lookups
    private transient Object targetResource;
    private transient Object targetBed;

    public ConflictCheckRequestDto() {
    }


    public ConflictDomain getDomain() {
        return domain;
    }

    public void setDomain(ConflictDomain domain) {
        this.domain = domain;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public Long getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(Long facultyId) {
        this.facultyId = facultyId;
    }

    public Long getSectionId() {
        return sectionId;
    }

    public void setSectionId(Long sectionId) {
        this.sectionId = sectionId;
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

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getHostelId() {
        return hostelId;
    }

    public void setHostelId(Long hostelId) {
        this.hostelId = hostelId;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public Long getBedId() {
        return bedId;
    }

    public void setBedId(Long bedId) {
        this.bedId = bedId;
    }

    public Long getHostelRequestId() {
        return hostelRequestId;
    }

    public void setHostelRequestId(Long hostelRequestId) {
        this.hostelRequestId = hostelRequestId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Long getExistingAllocationId() {
        return existingAllocationId;
    }

    public void setExistingAllocationId(Long existingAllocationId) {
        this.existingAllocationId = existingAllocationId;
    }

    public Object getTargetResource() {
        return targetResource;
    }

    public void setTargetResource(Object targetResource) {
        this.targetResource = targetResource;
    }

    public Object getTargetBed() {
        return targetBed;
    }

    public void setTargetBed(Object targetBed) {
        this.targetBed = targetBed;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final ConflictCheckRequestDto dto = new ConflictCheckRequestDto();

        public Builder domain(ConflictDomain domain) { dto.setDomain(domain); return this; }
        public Builder resourceId(Long resourceId) { dto.setResourceId(resourceId); return this; }
        public Builder requestId(Long requestId) { dto.setRequestId(requestId); return this; }
        public Builder academicRequestId(Long requestId) { dto.setRequestId(requestId); return this; }
        public Builder facultyId(Long facultyId) { dto.setFacultyId(facultyId); return this; }
        public Builder facultyUserId(Long facultyId) { dto.setFacultyId(facultyId); return this; }
        public Builder sectionId(Long sectionId) { dto.setSectionId(sectionId); return this; }
        public Builder timeSlotId(Long timeSlotId) { dto.setTimeSlotId(timeSlotId); return this; }
        public Builder requestedDate(LocalDate requestedDate) { dto.setRequestedDate(requestedDate); return this; }
        public Builder allocationDate(LocalDate requestedDate) { dto.setRequestedDate(requestedDate); return this; }
        public Builder startTime(LocalTime startTime) { dto.setStartTime(startTime); return this; }
        public Builder endTime(LocalTime endTime) { dto.setEndTime(endTime); return this; }
        public Builder requestedCapacity(Integer requestedCapacity) { dto.setRequestedCapacity(requestedCapacity); return this; }
        public Builder requiredCapacity(Integer requestedCapacity) { dto.setRequestedCapacity(requestedCapacity); return this; }
        public Builder departmentId(Long departmentId) { dto.setDepartmentId(departmentId); return this; }
        public Builder studentId(Long studentId) { dto.setStudentId(studentId); return this; }
        public Builder hostelId(Long hostelId) { dto.setHostelId(hostelId); return this; }
        public Builder roomId(Long roomId) { dto.setRoomId(roomId); return this; }
        public Builder bedId(Long bedId) { dto.setBedId(bedId); return this; }
        public Builder hostelRequestId(Long hostelRequestId) { dto.setHostelRequestId(hostelRequestId); return this; }
        public Builder startDate(LocalDate startDate) { dto.setStartDate(startDate); return this; }
        public Builder endDate(LocalDate endDate) { dto.setEndDate(endDate); return this; }
        public Builder existingAllocationId(Long existingAllocationId) { dto.setExistingAllocationId(existingAllocationId); return this; }
        public Builder targetResource(Object targetResource) { dto.setTargetResource(targetResource); return this; }
        public Builder targetBed(Object targetBed) { dto.setTargetBed(targetBed); return this; }
        public Builder targetStudent(Object targetStudent) { return this; }
        public Builder academicRequest(Object academicRequest) { return this; }
        public Builder authenticatedUser(Object authenticatedUser) { return this; }

        public ConflictCheckRequestDto build() {
            return dto;
        }
    }
}

