package com.ahrao.dto.hod;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class HodDepartmentWorkloadOverviewDto {

    private long totalFaculty;
    private long facultyWithWorkloadCount;
    private long balancedCount;
    private long overloadCount;
    private long underloadCount;
    private long pendingCalculationCount;
    private BigDecimal averageWeeklyHours;
    private BigDecimal totalDepartmentHours;

    private List<HodFacultySummaryDto> facultyWorkloads = new ArrayList<>();

    public HodDepartmentWorkloadOverviewDto() {
    }

    public long getTotalFaculty() { return totalFaculty; }
    public void setTotalFaculty(long totalFaculty) { this.totalFaculty = totalFaculty; }
    public long getFacultyWithWorkloadCount() { return facultyWithWorkloadCount; }
    public void setFacultyWithWorkloadCount(long facultyWithWorkloadCount) { this.facultyWithWorkloadCount = facultyWithWorkloadCount; }
    public long getBalancedCount() { return balancedCount; }
    public void setBalancedCount(long balancedCount) { this.balancedCount = balancedCount; }
    public long getOverloadCount() { return overloadCount; }
    public void setOverloadCount(long overloadCount) { this.overloadCount = overloadCount; }
    public long getUnderloadCount() { return underloadCount; }
    public void setUnderloadCount(long underloadCount) { this.underloadCount = underloadCount; }
    public long getPendingCalculationCount() { return pendingCalculationCount; }
    public void setPendingCalculationCount(long pendingCalculationCount) { this.pendingCalculationCount = pendingCalculationCount; }
    public BigDecimal getAverageWeeklyHours() { return averageWeeklyHours; }
    public void setAverageWeeklyHours(BigDecimal averageWeeklyHours) { this.averageWeeklyHours = averageWeeklyHours; }
    public BigDecimal getTotalDepartmentHours() { return totalDepartmentHours; }
    public void setTotalDepartmentHours(BigDecimal totalDepartmentHours) { this.totalDepartmentHours = totalDepartmentHours; }
    public List<HodFacultySummaryDto> getFacultyWorkloads() { return facultyWorkloads; }
    public void setFacultyWorkloads(List<HodFacultySummaryDto> facultyWorkloads) { this.facultyWorkloads = facultyWorkloads; }
}
