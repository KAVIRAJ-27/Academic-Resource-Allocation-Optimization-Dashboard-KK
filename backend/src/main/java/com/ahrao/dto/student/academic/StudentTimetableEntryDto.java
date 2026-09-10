package com.ahrao.dto.student.academic;

import com.ahrao.entity.enums.SubjectType;
import java.time.LocalTime;

public class StudentTimetableEntryDto {
    private Long id;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String timeSlotName;

    private Long subjectId;
    private String subjectCode;
    private String subjectName;
    private SubjectType subjectType;

    private Long facultyId;
    private String facultyName;
    private String facultyDesignation;

    private Long resourceId;
    private String resourceName;
    private String resourceCode;
    private String resourceCategory;

    private String status;

    public StudentTimetableEntryDto() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getTimeSlotName() { return timeSlotName; }
    public void setTimeSlotName(String timeSlotName) { this.timeSlotName = timeSlotName; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public SubjectType getSubjectType() { return subjectType; }
    public void setSubjectType(SubjectType subjectType) { this.subjectType = subjectType; }

    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public String getFacultyDesignation() { return facultyDesignation; }
    public void setFacultyDesignation(String facultyDesignation) { this.facultyDesignation = facultyDesignation; }

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }

    public String getResourceCode() { return resourceCode; }
    public void setResourceCode(String resourceCode) { this.resourceCode = resourceCode; }

    public String getResourceCategory() { return resourceCategory; }
    public void setResourceCategory(String resourceCategory) { this.resourceCategory = resourceCategory; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
