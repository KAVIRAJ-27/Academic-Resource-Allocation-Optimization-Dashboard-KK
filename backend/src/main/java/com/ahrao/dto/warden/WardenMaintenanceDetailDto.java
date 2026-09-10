package com.ahrao.dto.warden;

public class WardenMaintenanceDetailDto extends WardenMaintenanceSummaryDto {
    private String description;
    private String reportedByEmail;
    private String assignedToEmail;

    public WardenMaintenanceDetailDto() {
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getReportedByEmail() {
        return reportedByEmail;
    }

    public void setReportedByEmail(String reportedByEmail) {
        this.reportedByEmail = reportedByEmail;
    }

    public String getAssignedToEmail() {
        return assignedToEmail;
    }

    public void setAssignedToEmail(String assignedToEmail) {
        this.assignedToEmail = assignedToEmail;
    }
}
