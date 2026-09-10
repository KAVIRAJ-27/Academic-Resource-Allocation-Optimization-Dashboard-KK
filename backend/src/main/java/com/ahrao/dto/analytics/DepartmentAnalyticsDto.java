package com.ahrao.dto.analytics;

import java.util.ArrayList;
import java.util.List;

public class DepartmentAnalyticsDto {

    private List<DepartmentMetricsDto> departments = new ArrayList<>();

    public DepartmentAnalyticsDto() {
    }

    public List<DepartmentMetricsDto> getDepartments() {
        return departments;
    }

    public void setDepartments(List<DepartmentMetricsDto> departments) {
        this.departments = departments;
    }

    public static class DepartmentMetricsDto {
        private Long departmentId;
        private String departmentName;
        private String departmentCode;
        private long studentCount;
        private long facultyCount;
        private long subjectCount;
        private long resourceCount;
        private long requestCount;
        private long allocationCount;
        private double resourceUtilizationPercentage;
        private double averageFacultyWorkload;

        public DepartmentMetricsDto() {
        }

        public Long getDepartmentId() {
            return departmentId;
        }

        public void setDepartmentId(Long departmentId) {
            this.departmentId = departmentId;
        }

        public String getDepartmentName() {
            return departmentName;
        }

        public void setDepartmentName(String departmentName) {
            this.departmentName = departmentName;
        }

        public String getDepartmentCode() {
            return departmentCode;
        }

        public void setDepartmentCode(String departmentCode) {
            this.departmentCode = departmentCode;
        }

        public long getStudentCount() {
            return studentCount;
        }

        public void setStudentCount(long studentCount) {
            this.studentCount = studentCount;
        }

        public long getFacultyCount() {
            return facultyCount;
        }

        public void setFacultyCount(long facultyCount) {
            this.facultyCount = facultyCount;
        }

        public long getSubjectCount() {
            return subjectCount;
        }

        public void setSubjectCount(long subjectCount) {
            this.subjectCount = subjectCount;
        }

        public long getResourceCount() {
            return resourceCount;
        }

        public void setResourceCount(long resourceCount) {
            this.resourceCount = resourceCount;
        }

        public long getRequestCount() {
            return requestCount;
        }

        public void setRequestCount(long requestCount) {
            this.requestCount = requestCount;
        }

        public long getAllocationCount() {
            return allocationCount;
        }

        public void setAllocationCount(long allocationCount) {
            this.allocationCount = allocationCount;
        }

        public double getResourceUtilizationPercentage() {
            return resourceUtilizationPercentage;
        }

        public void setResourceUtilizationPercentage(double resourceUtilizationPercentage) {
            this.resourceUtilizationPercentage = resourceUtilizationPercentage;
        }

        public double getAverageFacultyWorkload() {
            return averageFacultyWorkload;
        }

        public void setAverageFacultyWorkload(double averageFacultyWorkload) {
            this.averageFacultyWorkload = averageFacultyWorkload;
        }
    }
}
