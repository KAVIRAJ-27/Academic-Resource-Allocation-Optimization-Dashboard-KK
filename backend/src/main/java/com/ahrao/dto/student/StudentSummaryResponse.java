package com.ahrao.dto.student;

import com.ahrao.entity.enums.UserStatus;

import java.time.Instant;

public class StudentSummaryResponse {

    private Long id;
    private String registerNumber;
    private String rollNumber;
    private String studentName;
    private String email;
    private String phone;
    private Long userId;
    private String username;
    private UserStatus userStatus;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private Long programId;
    private String programName;
    private String programCode;
    private Long sectionId;
    private String sectionName;
    private Integer admissionYear;
    private Integer currentSemester;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;

    public StudentSummaryResponse() {
    }

    public StudentSummaryResponse(
            Long id,
            String registerNumber,
            String rollNumber,
            String studentName,
            String email,
            String phone,
            Long userId,
            String username,
            UserStatus userStatus,
            Long departmentId,
            String departmentName,
            String departmentCode,
            Long programId,
            String programName,
            String programCode,
            Long sectionId,
            String sectionName,
            Integer admissionYear,
            Integer currentSemester,
            String status,
            Instant createdAt,
            Instant updatedAt) {
        this.id = id;
        this.registerNumber = registerNumber;
        this.rollNumber = rollNumber;
        this.studentName = studentName;
        this.email = email;
        this.phone = phone;
        this.userId = userId;
        this.username = username;
        this.userStatus = userStatus;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.departmentCode = departmentCode;
        this.programId = programId;
        this.programName = programName;
        this.programCode = programCode;
        this.sectionId = sectionId;
        this.sectionName = sectionName;
        this.admissionYear = admissionYear;
        this.currentSemester = currentSemester;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRegisterNumber() {
        return registerNumber;
    }

    public void setRegisterNumber(String registerNumber) {
        this.registerNumber = registerNumber;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
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

    public UserStatus getUserStatus() {
        return userStatus;
    }

    public void setUserStatus(UserStatus userStatus) {
        this.userStatus = userStatus;
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

    public Long getProgramId() {
        return programId;
    }

    public void setProgramId(Long programId) {
        this.programId = programId;
    }

    public String getProgramName() {
        return programName;
    }

    public void setProgramName(String programName) {
        this.programName = programName;
    }

    public String getProgramCode() {
        return programCode;
    }

    public void setProgramCode(String programCode) {
        this.programCode = programCode;
    }

    public Long getSectionId() {
        return sectionId;
    }

    public void setSectionId(Long sectionId) {
        this.sectionId = sectionId;
    }

    public String getSectionName() {
        return sectionName;
    }

    public void setSectionName(String sectionName) {
        this.sectionName = sectionName;
    }

    public Integer getAdmissionYear() {
        return admissionYear;
    }

    public void setAdmissionYear(Integer admissionYear) {
        this.admissionYear = admissionYear;
    }

    public Integer getCurrentSemester() {
        return currentSemester;
    }

    public void setCurrentSemester(Integer currentSemester) {
        this.currentSemester = currentSemester;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
