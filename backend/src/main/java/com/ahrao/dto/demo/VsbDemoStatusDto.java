package com.ahrao.dto.demo;

import java.util.Map;

public class VsbDemoStatusDto {

    private boolean installed;
    private String institutionCode = "VSB";
    private String institutionName = "VSB Engineering College";
    private Map<String, Long> entityCounts;

    public VsbDemoStatusDto() {
    }

    public VsbDemoStatusDto(boolean installed, Map<String, Long> entityCounts) {
        this.installed = installed;
        this.entityCounts = entityCounts;
    }

    public boolean isInstalled() {
        return installed;
    }

    public void setInstalled(boolean installed) {
        this.installed = installed;
    }

    public String getInstitutionCode() {
        return institutionCode;
    }

    public void setInstitutionCode(String institutionCode) {
        this.institutionCode = institutionCode;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public Map<String, Long> getEntityCounts() {
        return entityCounts;
    }

    public void setEntityCounts(Map<String, Long> entityCounts) {
        this.entityCounts = entityCounts;
    }
}
