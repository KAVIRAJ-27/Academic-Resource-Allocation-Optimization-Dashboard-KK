package com.ahrao.dto.hod;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class HodFacultyDetailDto {

    private Long id;
    private Long userId;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private String designation;
    private String qualification;
    private String specialization;
    private LocalDate joiningDate;
    private String status;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;

    // Workload breakdown
    private BigDecimal totalWorkloadHours;
    private BigDecimal teachingHours;
    private BigDecimal labHours;
    private BigDecimal otherHours;
    private String workloadStatus;
    private Instant workloadCalculatedAt;

    // Assigned courses
    private List<AssignedSubjectItem> assignedSubjects = new ArrayList<>();

    // Recent resource requests
    private List<FacultyRequestItem> recentRequests = new ArrayList<>();

    public static class AssignedSubjectItem {
        private Long assignmentId;
        private Long subjectId;
        private String subjectCode;
        private String subjectName;
        private Integer credits;
        private Long programId;
        private String programName;
        private String programCode;
        private Long sectionId;
        private String sectionName;
        private Integer hoursPerWeek;
        private String academicYear;
        private String semesterName;

        public AssignedSubjectItem() {}

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
        public Long getProgramId() { return programId; }
        public void setProgramId(Long programId) { this.programId = programId; }
        public String getProgramName() { return programName; }
        public void setProgramName(String programName) { this.programName = programName; }
        public String getProgramCode() { return programCode; }
        public void setProgramCode(String programCode) { this.programCode = programCode; }
        public Long getSectionId() { return sectionId; }
        public void setSectionId(Long sectionId) { this.sectionId = sectionId; }
        public String getSectionName() { return sectionName; }
        public void setSectionName(String sectionName) { this.sectionName = sectionName; }
        public Integer getHoursPerWeek() { return hoursPerWeek; }
        public void setHoursPerWeek(Integer hoursPerWeek) { this.hoursPerWeek = hoursPerWeek; }
        public String getAcademicYear() { return academicYear; }
        public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
        public String getSemesterName() { return semesterName; }
        public void setSemesterName(String semesterName) { this.semesterName = semesterName; }
    }

    public static class FacultyRequestItem {
        private Long requestId;
        private String resourceName;
        private String resourceCode;
        private String purpose;
        private LocalDate requestedDate;
        private String priority;
        private String status;
        private Instant createdAt;

        public FacultyRequestItem() {}

        public Long getRequestId() { return requestId; }
        public void setRequestId(Long requestId) { this.requestId = requestId; }
        public String getResourceName() { return resourceName; }
        public void setResourceName(String resourceName) { this.resourceName = resourceName; }
        public String getResourceCode() { return resourceCode; }
        public void setResourceCode(String resourceCode) { this.resourceCode = resourceCode; }
        public String getPurpose() { return purpose; }
        public void setPurpose(String purpose) { this.purpose = purpose; }
        public LocalDate getRequestedDate() { return requestedDate; }
        public void setRequestedDate(LocalDate requestedDate) { this.requestedDate = requestedDate; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }

    public HodFacultyDetailDto() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public LocalDate getJoiningDate() { return joiningDate; }
    public void setJoiningDate(LocalDate joiningDate) { this.joiningDate = joiningDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }
    public BigDecimal getTotalWorkloadHours() { return totalWorkloadHours; }
    public void setTotalWorkloadHours(BigDecimal totalWorkloadHours) { this.totalWorkloadHours = totalWorkloadHours; }
    public BigDecimal getTeachingHours() { return teachingHours; }
    public void setTeachingHours(BigDecimal teachingHours) { this.teachingHours = teachingHours; }
    public BigDecimal getLabHours() { return labHours; }
    public void setLabHours(BigDecimal labHours) { this.labHours = labHours; }
    public BigDecimal getOtherHours() { return otherHours; }
    public void setOtherHours(BigDecimal otherHours) { this.otherHours = otherHours; }
    public String getWorkloadStatus() { return workloadStatus; }
    public void setWorkloadStatus(String workloadStatus) { this.workloadStatus = workloadStatus; }
    public Instant getWorkloadCalculatedAt() { return workloadCalculatedAt; }
    public void setWorkloadCalculatedAt(Instant workloadCalculatedAt) { this.workloadCalculatedAt = workloadCalculatedAt; }
    public List<AssignedSubjectItem> getAssignedSubjects() { return assignedSubjects; }
    public void setAssignedSubjects(List<AssignedSubjectItem> assignedSubjects) { this.assignedSubjects = assignedSubjects; }
    public List<FacultyRequestItem> getRecentRequests() { return recentRequests; }
    public void setRecentRequests(List<FacultyRequestItem> recentRequests) { this.recentRequests = recentRequests; }
}
