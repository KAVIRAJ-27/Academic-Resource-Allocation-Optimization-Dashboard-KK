package com.ahrao.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public class FacultyWorkloadHistoryDto {
    @JsonProperty("faculty_id")
    private Long facultyId;
    @JsonProperty("faculty_name")
    private String facultyName;
    @JsonProperty("department_id")
    private Long departmentId;
    @JsonProperty("department_name")
    private String departmentName;
    @JsonProperty("assigned_hours")
    private Double assignedHours;
    @JsonProperty("max_hours")
    private Double maxHours = 20.0;
    @JsonProperty("subject_count")
    private Integer subjectCount = 1;
    @JsonProperty("workload_status")
    private String workloadStatus = "NORMAL";

    public FacultyWorkloadHistoryDto() {}

    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public Double getAssignedHours() { return assignedHours; }
    public void setAssignedHours(Double assignedHours) { this.assignedHours = assignedHours; }

    public Double getMaxHours() { return maxHours; }
    public void setMaxHours(Double maxHours) { this.maxHours = maxHours; }

    public Integer getSubjectCount() { return subjectCount; }
    public void setSubjectCount(Integer subjectCount) { this.subjectCount = subjectCount; }

    public String getWorkloadStatus() { return workloadStatus; }
    public void setWorkloadStatus(String workloadStatus) { this.workloadStatus = workloadStatus; }
}
