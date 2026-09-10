package com.ahrao.dto.staff;

import java.time.LocalDate;

public class HodSummaryResponse {

    private Long id;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;

    private Long facultyId;
    private String employeeId;
    private String facultyName;
    private String facultyEmail;
    private String facultyPhone;
    private String designation;

    private LocalDate startDate;
    private LocalDate endDate;
    private String status;

    public HodSummaryResponse() {
    }

    public HodSummaryResponse(
            Long id,
            Long departmentId,
            String departmentName,
            String departmentCode,
            Long facultyId,
            String employeeId,
            String facultyName,
            String facultyEmail,
            String facultyPhone,
            String designation,
            LocalDate startDate,
            LocalDate endDate,
            String status) {
        this.id = id;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.departmentCode = departmentCode;
        this.facultyId = facultyId;
        this.employeeId = employeeId;
        this.facultyName = facultyName;
        this.facultyEmail = facultyEmail;
        this.facultyPhone = facultyPhone;
        this.designation = designation;
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
