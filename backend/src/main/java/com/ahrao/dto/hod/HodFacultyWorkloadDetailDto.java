package com.ahrao.dto.hod;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class HodFacultyWorkloadDetailDto {

    private Long facultyId;
    private String facultyName;
    private String employeeId;
    private String designation;
    private Long departmentId;
    private String departmentName;

    // Current Workload metrics
    private BigDecimal totalHours;
    private BigDecimal teachingHours;
    private BigDecimal labHours;
    private BigDecimal otherHours;
    private String workloadStatus;
    private Instant calculatedAt;
    private String academicYear;
    private String semesterName;

    // Subject/Section breakdown
    private List<WorkloadCourseItem> assignments = new ArrayList<>();

    // Historical calculations
    private List<WorkloadHistoryItem> history = new ArrayList<>();

    public static class WorkloadCourseItem {
        private Long assignmentId;
        private Long subjectId;
        private String subjectCode;
        private String subjectName;
        private Integer credits;
        private String programCode;
        private String programName;
        private String sectionName;
        private Integer hoursPerWeek;
        private String status;

        public WorkloadCourseItem() {}

        public Long getAssignmentId() { return assignmentId; }
        public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }
        public Long getSubjectId() { return subjectId; }
        public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
        public String getSubjectCode() { return subjectCode; }
        public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }
        public String getSubjectName() { return subjectName; }
        public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
        public Integer getCredits() { return credits; }
        public void setCredits(Integer credits) { this.credits = credits; }
        public String getProgramCode() { return programCode; }
        public void setProgramCode(String programCode) { this.programCode = programCode; }
        public String getProgramName() { return programName; }
        public void setProgramName(String programName) { this.programName = programName; }
        public String getSectionName() { return sectionName; }
        public void setSectionName(String sectionName) { this.sectionName = sectionName; }
        public Integer getHoursPerWeek() { return hoursPerWeek; }
        public void setHoursPerWeek(Integer hoursPerWeek) { this.hoursPerWeek = hoursPerWeek; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class WorkloadHistoryItem {
        private Long workloadId;
        private String academicYear;
        private String semesterName;
        private BigDecimal totalHours;
        private BigDecimal teachingHours;
        private BigDecimal labHours;
        private BigDecimal otherHours;
        private String workloadStatus;
        private Instant calculatedAt;

        public WorkloadHistoryItem() {}

        public Long getWorkloadId() { return workloadId; }
        public void setWorkloadId(Long workloadId) { this.workloadId = workloadId; }
        public String getAcademicYear() { return academicYear; }
        public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
        public String getSemesterName() { return semesterName; }
        public void setSemesterName(String semesterName) { this.semesterName = semesterName; }
        public BigDecimal getTotalHours() { return totalHours; }
        public void setTotalHours(BigDecimal totalHours) { this.totalHours = totalHours; }
        public BigDecimal getTeachingHours() { return teachingHours; }
        public void setTeachingHours(BigDecimal teachingHours) { this.teachingHours = teachingHours; }
        public BigDecimal getLabHours() { return labHours; }
        public void setLabHours(BigDecimal labHours) { this.labHours = labHours; }
        public BigDecimal getOtherHours() { return otherHours; }
        public void setOtherHours(BigDecimal otherHours) { this.otherHours = otherHours; }
        public String getWorkloadStatus() { return workloadStatus; }
        public void setWorkloadStatus(String workloadStatus) { this.workloadStatus = workloadStatus; }
        public Instant getCalculatedAt() { return calculatedAt; }
        public void setCalculatedAt(Instant calculatedAt) { this.calculatedAt = calculatedAt; }
    }

    public HodFacultyWorkloadDetailDto() {
    }

    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }
    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public BigDecimal getTotalHours() { return totalHours; }
    public void setTotalHours(BigDecimal totalHours) { this.totalHours = totalHours; }
    public BigDecimal getTeachingHours() { return teachingHours; }
    public void setTeachingHours(BigDecimal teachingHours) { this.teachingHours = teachingHours; }
    public BigDecimal getLabHours() { return labHours; }
    public void setLabHours(BigDecimal labHours) { this.labHours = labHours; }
    public BigDecimal getOtherHours() { return otherHours; }
    public void setOtherHours(BigDecimal otherHours) { this.otherHours = otherHours; }
    public String getWorkloadStatus() { return workloadStatus; }
    public void setWorkloadStatus(String workloadStatus) { this.workloadStatus = workloadStatus; }
    public Instant getCalculatedAt() { return calculatedAt; }
    public void setCalculatedAt(Instant calculatedAt) { this.calculatedAt = calculatedAt; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public String getSemesterName() { return semesterName; }
    public void setSemesterName(String semesterName) { this.semesterName = semesterName; }
    public List<WorkloadCourseItem> getAssignments() { return assignments; }
    public void setAssignments(List<WorkloadCourseItem> assignments) { this.assignments = assignments; }
    public List<WorkloadHistoryItem> getHistory() { return history; }
    public void setHistory(List<WorkloadHistoryItem> history) { this.history = history; }
}
