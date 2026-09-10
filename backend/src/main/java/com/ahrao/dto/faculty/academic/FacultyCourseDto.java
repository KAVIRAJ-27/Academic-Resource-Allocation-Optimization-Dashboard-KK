package com.ahrao.dto.faculty.academic;

public class FacultyCourseDto {

    private Long programId;
    private String programCode;
    private String programName;
    private String degreeType;
    private Integer durationYears;
    private String departmentName;
    private String departmentCode;
    private String status;
    private int assignedSubjectsCount;

    public FacultyCourseDto() {
    }

    public Long getProgramId() {
        return programId;
    }

    public void setProgramId(Long programId) {
        this.programId = programId;
    }

    public String getProgramCode() {
        return programCode;
    }

    public void setProgramCode(String programCode) {
        this.programCode = programCode;
    }

    public String getProgramName() {
        return programName;
    }

    public void setProgramName(String programName) {
        this.programName = programName;
    }

    public String getDegreeType() {
        return degreeType;
    }

    public void setDegreeType(String degreeType) {
        this.degreeType = degreeType;
    }

    public Integer getDurationYears() {
        return durationYears;
    }

    public void setDurationYears(Integer durationYears) {
        this.durationYears = durationYears;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getAssignedSubjectsCount() {
        return assignedSubjectsCount;
    }

    public void setAssignedSubjectsCount(int assignedSubjectsCount) {
        this.assignedSubjectsCount = assignedSubjectsCount;
    }
}
