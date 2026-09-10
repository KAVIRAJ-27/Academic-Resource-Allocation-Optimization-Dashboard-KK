package com.ahrao.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public class FacultyWorkloadInsightDto {
    @JsonProperty("faculty_id")
    private Long facultyId;
    @JsonProperty("faculty_name")
    private String facultyName;
    @JsonProperty("department_name")
    private String departmentName;
    @JsonProperty("assigned_hours")
    private Double assignedHours;
    @JsonProperty("max_hours")
    private Double maxHours;
    @JsonProperty("workload_status")
    private String workloadStatus; // LOW, NORMAL, HIGH, OVERLOADED
    @JsonProperty("variance_from_avg")
    private Double varianceFromAvg;
    @JsonProperty("is_imbalanced")
    private Boolean isImbalanced;
    private String explanation;

    public FacultyWorkloadInsightDto() {}

    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public Double getAssignedHours() { return assignedHours; }
    public void setAssignedHours(Double assignedHours) { this.assignedHours = assignedHours; }

    public Double getMaxHours() { return maxHours; }
    public void setMaxHours(Double maxHours) { this.maxHours = maxHours; }

    public String getWorkloadStatus() { return workloadStatus; }
    public void setWorkloadStatus(String workloadStatus) { this.workloadStatus = workloadStatus; }

    public Double getVarianceFromAvg() { return varianceFromAvg; }
    public void setVarianceFromAvg(Double varianceFromAvg) { this.varianceFromAvg = varianceFromAvg; }

    public Boolean getIsImbalanced() { return isImbalanced; }
    public void setIsImbalanced(Boolean isImbalanced) { this.isImbalanced = isImbalanced; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
