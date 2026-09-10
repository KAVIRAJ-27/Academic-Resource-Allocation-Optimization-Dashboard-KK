package com.ahrao.dto.principal.dashboard;

import java.util.ArrayList;
import java.util.List;

public class PrincipalFacultyOverviewDto {
    private long totalFaculty;
    private long activeFaculty;
    private long inactiveFaculty;
    private List<DepartmentFacultyCountDto> byDepartment = new ArrayList<>();
    private WorkloadSummaryDto workloadSummary = new WorkloadSummaryDto();

    public PrincipalFacultyOverviewDto() {
    }

    public long getTotalFaculty() {
        return totalFaculty;
    }

    public void setTotalFaculty(long totalFaculty) {
        this.totalFaculty = totalFaculty;
    }

    public long getActiveFaculty() {
        return activeFaculty;
    }

    public void setActiveFaculty(long activeFaculty) {
        this.activeFaculty = activeFaculty;
    }

    public long getInactiveFaculty() {
        return inactiveFaculty;
    }

    public void setInactiveFaculty(long inactiveFaculty) {
        this.inactiveFaculty = inactiveFaculty;
    }

    public List<DepartmentFacultyCountDto> getByDepartment() {
        return byDepartment;
    }

    public void setByDepartment(List<DepartmentFacultyCountDto> byDepartment) {
        this.byDepartment = byDepartment;
    }

    public WorkloadSummaryDto getWorkloadSummary() {
        return workloadSummary;
    }

    public void setWorkloadSummary(WorkloadSummaryDto workloadSummary) {
        this.workloadSummary = workloadSummary;
    }

    public static class DepartmentFacultyCountDto {
        private Long departmentId;
        private String departmentName;
        private String departmentCode;
        private long facultyCount;

        public DepartmentFacultyCountDto() {
        }

        public DepartmentFacultyCountDto(Long departmentId, String departmentName, long facultyCount) {
            this.departmentId = departmentId;
            this.departmentName = departmentName;
            this.facultyCount = facultyCount;
        }

        public DepartmentFacultyCountDto(Long departmentId, String departmentName, String departmentCode, long facultyCount) {
            this.departmentId = departmentId;
            this.departmentName = departmentName;
            this.departmentCode = departmentCode;
            this.facultyCount = facultyCount;
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

        public long getFacultyCount() {
            return facultyCount;
        }

        public void setFacultyCount(long facultyCount) {
            this.facultyCount = facultyCount;
        }
    }

    public static class WorkloadSummaryDto {
        private long totalRecorded;
        private long balancedCount;
        private long overloadCount;
        private long underloadCount;
        private Double averageHours;

        public WorkloadSummaryDto() {
        }

        public long getTotalRecorded() {
            return totalRecorded;
        }

        public void setTotalRecorded(long totalRecorded) {
            this.totalRecorded = totalRecorded;
        }

        public long getBalancedCount() {
            return balancedCount;
        }

        public void setBalancedCount(long balancedCount) {
            this.balancedCount = balancedCount;
        }

        public long getOverloadCount() {
            return overloadCount;
        }

        public void setOverloadCount(long overloadCount) {
            this.overloadCount = overloadCount;
        }

        public long getUnderloadCount() {
            return underloadCount;
        }

        public void setUnderloadCount(long underloadCount) {
            this.underloadCount = underloadCount;
        }

        public Double getAverageHours() {
            return averageHours;
        }

        public void setAverageHours(Double averageHours) {
            this.averageHours = averageHours;
        }
    }
}
