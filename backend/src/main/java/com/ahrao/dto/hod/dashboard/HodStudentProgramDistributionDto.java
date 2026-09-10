package com.ahrao.dto.hod.dashboard;

public class HodStudentProgramDistributionDto {

    private Long programId;
    private String programCode;
    private String programName;
    private String degreeType;
    private long studentCount;
    private double percentage;

    public HodStudentProgramDistributionDto() {
    }

    public HodStudentProgramDistributionDto(
            Long programId,
            String programCode,
            String programName,
            String degreeType,
            long studentCount) {
        this.programId = programId;
        this.programCode = programCode;
        this.programName = programName;
        this.degreeType = degreeType;
        this.studentCount = studentCount;
        this.percentage = 0.0;
    }

    public HodStudentProgramDistributionDto(
            Long programId,
            String programCode,
            String programName,
            String degreeType,
            long studentCount,
            double percentage) {
        this.programId = programId;
        this.programCode = programCode;
        this.programName = programName;
        this.degreeType = degreeType;
        this.studentCount = studentCount;
        this.percentage = percentage;
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

    public long getStudentCount() {
        return studentCount;
    }

    public void setStudentCount(long studentCount) {
        this.studentCount = studentCount;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }
}
