package com.ahrao.dto.analytics;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class FacultyWorkloadAnalyticsDto {

    private long totalFaculty;
    private double averageWorkloadHours;
    private double maxWorkloadHours;
    private double minWorkloadHours;
    private long overloadedFacultyCount;
    private long balancedFacultyCount;
    private long underutilizedFacultyCount;

    private Map<String, Long> workloadStatusDistribution;
    private List<FacultyWorkloadSummaryItemDto> facultyWorkloads = new ArrayList<>();

    public FacultyWorkloadAnalyticsDto() {
    }

    public long getTotalFaculty() {
        return totalFaculty;
    }

    public void setTotalFaculty(long totalFaculty) {
        this.totalFaculty = totalFaculty;
    }

    public double getAverageWorkloadHours() {
        return averageWorkloadHours;
    }

    public void setAverageWorkloadHours(double averageWorkloadHours) {
        this.averageWorkloadHours = averageWorkloadHours;
    }

    public double getMaxWorkloadHours() {
        return maxWorkloadHours;
    }

    public void setMaxWorkloadHours(double maxWorkloadHours) {
        this.maxWorkloadHours = maxWorkloadHours;
    }

    public double getMinWorkloadHours() {
        return minWorkloadHours;
    }

    public void setMinWorkloadHours(double minWorkloadHours) {
        this.minWorkloadHours = minWorkloadHours;
    }

    public long getOverloadedFacultyCount() {
        return overloadedFacultyCount;
    }

    public void setOverloadedFacultyCount(long overloadedFacultyCount) {
        this.overloadedFacultyCount = overloadedFacultyCount;
    }

    public long getBalancedFacultyCount() {
        return balancedFacultyCount;
    }

    public void setBalancedFacultyCount(long balancedFacultyCount) {
        this.balancedFacultyCount = balancedFacultyCount;
    }

    public long getUnderutilizedFacultyCount() {
        return underutilizedFacultyCount;
    }

    public void setUnderutilizedFacultyCount(long underutilizedFacultyCount) {
        this.underutilizedFacultyCount = underutilizedFacultyCount;
    }

    public Map<String, Long> getWorkloadStatusDistribution() {
        return workloadStatusDistribution;
    }

    public void setWorkloadStatusDistribution(Map<String, Long> workloadStatusDistribution) {
        this.workloadStatusDistribution = workloadStatusDistribution;
    }

    public List<FacultyWorkloadSummaryItemDto> getFacultyWorkloads() {
        return facultyWorkloads;
    }

    public void setFacultyWorkloads(List<FacultyWorkloadSummaryItemDto> facultyWorkloads) {
        this.facultyWorkloads = facultyWorkloads;
    }

    public static class FacultyWorkloadSummaryItemDto {
        private Long facultyId;
        private String facultyName;
        private String employeeId;
        private String departmentName;
        private double totalHours;
        private double teachingHours;
        private double labHours;
        private String workloadStatus;

        public FacultyWorkloadSummaryItemDto() {
        }

        public Long getFacultyId() {
            return facultyId;
        }

        public void setFacultyId(Long facultyId) {
            this.facultyId = facultyId;
        }

        public String getFacultyName() {
            return facultyName;
        }

        public void setFacultyName(String facultyName) {
            this.facultyName = facultyName;
        }

        public String getEmployeeId() {
            return employeeId;
        }

        public void setEmployeeId(String employeeId) {
            this.employeeId = employeeId;
        }

        public String getDepartmentName() {
            return departmentName;
        }

        public void setDepartmentName(String departmentName) {
            this.departmentName = departmentName;
        }

        public double getTotalHours() {
            return totalHours;
        }

        public void setTotalHours(double totalHours) {
            this.totalHours = totalHours;
        }

        public double getTeachingHours() {
            return teachingHours;
        }

        public void setTeachingHours(double teachingHours) {
            this.teachingHours = teachingHours;
        }

        public double getLabHours() {
            return labHours;
        }

        public void setLabHours(double labHours) {
            this.labHours = labHours;
        }

        public String getWorkloadStatus() {
            return workloadStatus;
        }

        public void setWorkloadStatus(String workloadStatus) {
            this.workloadStatus = workloadStatus;
        }
    }
}
