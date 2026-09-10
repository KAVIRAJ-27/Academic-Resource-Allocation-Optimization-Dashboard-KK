package com.ahrao.dto.student.academic;

import com.ahrao.entity.enums.SubjectType;

public class StudentSubjectDetailsDto {
    private Long id;
    private String code;
    private String name;
    private Integer credits;
    private SubjectType subjectType;
    private String status;

    private Long departmentId;
    private String departmentName;
    private String departmentCode;

    private Long programId;
    private String programName;
    private String programCode;

    private Long semesterId;
    private String semesterName;
    private Integer semesterNumber;

    // Assigned Faculty Information
    private Long facultyId;
    private String facultyName;
    private String facultyEmployeeId;
    private String facultyDesignation;
    private String facultyQualification;
    private String facultyEmail;
    private String facultyDepartment;
    private Integer hoursPerWeek;

    // Student Section context
    private Long sectionId;
    private String sectionName;

    public StudentSubjectDetailsDto() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public SubjectType getSubjectType() { return subjectType; }
    public void setSubjectType(SubjectType subjectType) { this.subjectType = subjectType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public Long getProgramId() { return programId; }
    public void setProgramId(Long programId) { this.programId = programId; }

    public String getProgramName() { return programName; }
    public void setProgramName(String programName) { this.programName = programName; }

    public String getProgramCode() { return programCode; }
    public void setProgramCode(String programCode) { this.programCode = programCode; }

    public Long getSemesterId() { return semesterId; }
    public void setSemesterId(Long semesterId) { this.semesterId = semesterId; }

    public String getSemesterName() { return semesterName; }
    public void setSemesterName(String semesterName) { this.semesterName = semesterName; }

    public Integer getSemesterNumber() { return semesterNumber; }
    public void setSemesterNumber(Integer semesterNumber) { this.semesterNumber = semesterNumber; }

    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public String getFacultyEmployeeId() { return facultyEmployeeId; }
    public void setFacultyEmployeeId(String facultyEmployeeId) { this.facultyEmployeeId = facultyEmployeeId; }

    public String getFacultyDesignation() { return facultyDesignation; }
    public void setFacultyDesignation(String facultyDesignation) { this.facultyDesignation = facultyDesignation; }

    public String getFacultyQualification() { return facultyQualification; }
    public void setFacultyQualification(String facultyQualification) { this.facultyQualification = facultyQualification; }

    public String getFacultyEmail() { return facultyEmail; }
    public void setFacultyEmail(String facultyEmail) { this.facultyEmail = facultyEmail; }

    public String getFacultyDepartment() { return facultyDepartment; }
    public void setFacultyDepartment(String facultyDepartment) { this.facultyDepartment = facultyDepartment; }

    public Integer getHoursPerWeek() { return hoursPerWeek; }
    public void setHoursPerWeek(Integer hoursPerWeek) { this.hoursPerWeek = hoursPerWeek; }

    public Long getSectionId() { return sectionId; }
    public void setSectionId(Long sectionId) { this.sectionId = sectionId; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }
}
