package com.ahrao.dto.staff;

import java.time.LocalDate;

public class PrincipalResponse {

    private Long id;
    private Long institutionId;
    private String institutionName;
    private String institutionCode;

    private Long facultyId;
    private String employeeId;
    private String facultyName;
    private String facultyEmail;
    private String facultyPhone;
    private String designation;
    private String departmentName;

    private Long userId;
    private String username;

    private LocalDate startDate;
    private LocalDate endDate;
    private String status;

    public PrincipalResponse() {
    }

    public PrincipalResponse(
            Long id,
            Long institutionId,
            String institutionName,
            String institutionCode,
            Long facultyId,
            String employeeId,
            String facultyName,
            String facultyEmail,
            String facultyPhone,
            String designation,
            String departmentName,
            Long userId,
            String username,
            LocalDate startDate,
            LocalDate endDate,
            String status) {
        this.id = id;
        this.institutionId = institutionId;
        this.institutionName = institutionName;
        this.institutionCode = institutionCode;
        this.facultyId = facultyId;
        this.employeeId = employeeId;
        this.facultyName = facultyName;
        this.facultyEmail = facultyEmail;
        this.facultyPhone = facultyPhone;
        this.designation = designation;
        this.departmentName = departmentName;
        this.userId = userId;
        this.username = username;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(Long institutionId) {
        this.institutionId = institutionId;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public String getInstitutionCode() {
        return institutionCode;
    }

    public void setInstitutionCode(String institutionCode) {
        this.institutionCode = institutionCode;
    }

    public Long getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(Long facultyId) {
        this.facultyId = facultyId;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getFacultyName() {
        return facultyName;
    }

    public void setFacultyName(String facultyName) {
        this.facultyName = facultyName;
    }

    public String getFacultyEmail() {
        return facultyEmail;
    }

    public void setFacultyEmail(String facultyEmail) {
        this.facultyEmail = facultyEmail;
    }

    public String getFacultyPhone() {
        return facultyPhone;
    }

    public void setFacultyPhone(String facultyPhone) {
        this.facultyPhone = facultyPhone;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
