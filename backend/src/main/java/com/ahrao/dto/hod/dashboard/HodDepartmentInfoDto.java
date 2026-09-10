package com.ahrao.dto.hod.dashboard;

import java.time.LocalDate;

public class HodDepartmentInfoDto {

    private Long id;
    private String name;
    private String code;
    private String status;
    private String institutionName;
    private String hodName;
    private String hodEmail;
    private String hodEmployeeId;
    private LocalDate hodSince;

    public HodDepartmentInfoDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public String getHodName() {
        return hodName;
    }

    public void setHodName(String hodName) {
        this.hodName = hodName;
    }

    public String getHodEmail() {
        return hodEmail;
    }

    public void setHodEmail(String hodEmail) {
        this.hodEmail = hodEmail;
    }

    public String getHodEmployeeId() {
        return hodEmployeeId;
    }

    public void setHodEmployeeId(String hodEmployeeId) {
        this.hodEmployeeId = hodEmployeeId;
    }

    public LocalDate getHodSince() {
        return hodSince;
    }

    public void setHodSince(LocalDate hodSince) {
        this.hodSince = hodSince;
    }
}
