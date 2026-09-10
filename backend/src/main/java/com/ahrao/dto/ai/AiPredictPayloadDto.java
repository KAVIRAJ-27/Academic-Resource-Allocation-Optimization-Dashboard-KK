package com.ahrao.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;

public class AiPredictPayloadDto {
    @JsonProperty("department_id")
    private Long departmentId;
    @JsonProperty("hostel_id")
    private Long hostelId;
    @JsonProperty("academic_year_id")
    private Long academicYearId;
    @JsonProperty("semester_id")
    private Long semesterId;
    @JsonProperty("resource_category")
    private String resourceCategory;
    @JsonProperty("prediction_horizon")
    private String predictionHorizon = "NEXT_MONTH";

    private List<AllocationHistoryDto> allocations = new ArrayList<>();
    private List<RequestHistoryDto> requests = new ArrayList<>();
    private List<ConflictHistoryDto> conflicts = new ArrayList<>();
    private List<HostelHistoryDto> hostels = new ArrayList<>();
    private List<FacultyWorkloadHistoryDto> workloads = new ArrayList<>();

    public AiPredictPayloadDto() {}

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public Long getHostelId() { return hostelId; }
    public void setHostelId(Long hostelId) { this.hostelId = hostelId; }

    public Long getAcademicYearId() { return academicYearId; }
    public void setAcademicYearId(Long academicYearId) { this.academicYearId = academicYearId; }

    public Long getSemesterId() { return semesterId; }
    public void setSemesterId(Long semesterId) { this.semesterId = semesterId; }

    public String getResourceCategory() { return resourceCategory; }
    public void setResourceCategory(String resourceCategory) { this.resourceCategory = resourceCategory; }

    public String getPredictionHorizon() { return predictionHorizon; }
    public void setPredictionHorizon(String predictionHorizon) { this.predictionHorizon = predictionHorizon; }

    public List<AllocationHistoryDto> getAllocations() { return allocations; }
    public void setAllocations(List<AllocationHistoryDto> allocations) { this.allocations = allocations; }

    public List<RequestHistoryDto> getRequests() { return requests; }
    public void setRequests(List<RequestHistoryDto> requests) { this.requests = requests; }

    public List<ConflictHistoryDto> getConflicts() { return conflicts; }
    public void setConflicts(List<ConflictHistoryDto> conflicts) { this.conflicts = conflicts; }

    public List<HostelHistoryDto> getHostels() { return hostels; }
    public void setHostels(List<HostelHistoryDto> hostels) { this.hostels = hostels; }

    public List<FacultyWorkloadHistoryDto> getWorkloads() { return workloads; }
    public void setWorkloads(List<FacultyWorkloadHistoryDto> workloads) { this.workloads = workloads; }
}
