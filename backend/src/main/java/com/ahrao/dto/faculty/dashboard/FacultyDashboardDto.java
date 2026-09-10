package com.ahrao.dto.faculty.dashboard;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class FacultyDashboardDto {

    private FacultySummaryDto profile;
    private FacultyDepartmentDto department;
    private FacultyMetricsDto metrics;
    private List<FacultyAssignedSubjectDto> assignedSubjects = new ArrayList<>();
    private FacultyWorkloadDto workloadSummary;
    private List<FacultyTimetableItemDto> timetableSummary = new ArrayList<>();
    private FacultyRequisitionSummaryDto requisitionSummary;
    private List<FacultyActivityDto> recentActivities = new ArrayList<>();

    public FacultyDashboardDto() {
    }

    public FacultySummaryDto getProfile() {
        return profile;
    }

    public void setProfile(FacultySummaryDto profile) {
        this.profile = profile;
    }

    public FacultyDepartmentDto getDepartment() {
        return department;
    }

    public void setDepartment(FacultyDepartmentDto department) {
        this.department = department;
    }

    public FacultyMetricsDto getMetrics() {
        return metrics;
    }

    public void setMetrics(FacultyMetricsDto metrics) {
        this.metrics = metrics;
    }

    public List<FacultyAssignedSubjectDto> getAssignedSubjects() {
        return assignedSubjects;
    }

    public void setAssignedSubjects(List<FacultyAssignedSubjectDto> assignedSubjects) {
        this.assignedSubjects = assignedSubjects != null ? assignedSubjects : new ArrayList<>();
    }

    public FacultyWorkloadDto getWorkloadSummary() {
        return workloadSummary;
    }

    public void setWorkloadSummary(FacultyWorkloadDto workloadSummary) {
        this.workloadSummary = workloadSummary;
    }

    public List<FacultyTimetableItemDto> getTimetableSummary() {
        return timetableSummary;
    }

    public void setTimetableSummary(List<FacultyTimetableItemDto> timetableSummary) {
        this.timetableSummary = timetableSummary != null ? timetableSummary : new ArrayList<>();
    }

    public FacultyRequisitionSummaryDto getRequisitionSummary() {
        return requisitionSummary;
    }

    public void setRequisitionSummary(FacultyRequisitionSummaryDto requisitionSummary) {
        this.requisitionSummary = requisitionSummary;
    }

    public List<FacultyActivityDto> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<FacultyActivityDto> recentActivities) {
        this.recentActivities = recentActivities != null ? recentActivities : new ArrayList<>();
    }

    // ==========================================
    // Inner Telemetry Classes
    // ==========================================

    public static class FacultySummaryDto {
        private Long facultyId;
        private Long userId;
        private String fullName;
        private String employeeId;
        private String designation;
        private String qualification;
        private String email;
        private String phone;
        private String departmentName;
        private String departmentCode;
        private String status;
        private LocalDate joiningDate;

        public FacultySummaryDto() {}

        public Long getFacultyId() { return facultyId; }
        public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmployeeId() { return employeeId; }
        public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
        public String getDesignation() { return designation; }
        public void setDesignation(String designation) { this.designation = designation; }
        public String getQualification() { return qualification; }
        public void setQualification(String qualification) { this.qualification = qualification; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getDepartmentName() { return departmentName; }
        public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
        public String getDepartmentCode() { return departmentCode; }
        public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public LocalDate getJoiningDate() { return joiningDate; }
        public void setJoiningDate(LocalDate joiningDate) { this.joiningDate = joiningDate; }
    }

    public static class FacultyDepartmentDto {
        private Long departmentId;
        private String departmentName;
        private String departmentCode;
        private String institutionName;

        public FacultyDepartmentDto() {}

        public Long getDepartmentId() { return departmentId; }
        public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
        public String getDepartmentName() { return departmentName; }
        public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
        public String getDepartmentCode() { return departmentCode; }
        public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }
        public String getInstitutionName() { return institutionName; }
        public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }
    }

    public static class FacultyMetricsDto {
        private int assignedSubjectsCount;
        private int weeklyInstructionHours;
        private int upcomingClassesCount;
        private int pendingRequisitionsCount;

        public FacultyMetricsDto() {}

        public int getAssignedSubjectsCount() { return assignedSubjectsCount; }
        public void setAssignedSubjectsCount(int assignedSubjectsCount) { this.assignedSubjectsCount = assignedSubjectsCount; }
        public int getWeeklyInstructionHours() { return weeklyInstructionHours; }
        public void setWeeklyInstructionHours(int weeklyInstructionHours) { this.weeklyInstructionHours = weeklyInstructionHours; }
        public int getUpcomingClassesCount() { return upcomingClassesCount; }
        public void setUpcomingClassesCount(int upcomingClassesCount) { this.upcomingClassesCount = upcomingClassesCount; }
        public int getPendingRequisitionsCount() { return pendingRequisitionsCount; }
        public void setPendingRequisitionsCount(int pendingRequisitionsCount) { this.pendingRequisitionsCount = pendingRequisitionsCount; }
    }

    public static class FacultyAssignedSubjectDto {
        private Long id;
        private Long subjectId;
        private String subjectCode;
        private String subjectName;
        private String programName;
        private String sectionName;
        private String academicYearName;
        private String semesterName;
        private Integer hoursPerWeek;
        private String status;

        public FacultyAssignedSubjectDto() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getSubjectId() { return subjectId; }
        public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
        public String getSubjectCode() { return subjectCode; }
        public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }
        public String getSubjectName() { return subjectName; }
        public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
        public String getProgramName() { return programName; }
        public void setProgramName(String programName) { this.programName = programName; }
        public String getSectionName() { return sectionName; }
        public void setSectionName(String sectionName) { this.sectionName = sectionName; }
        public String getAcademicYearName() { return academicYearName; }
        public void setAcademicYearName(String academicYearName) { this.academicYearName = academicYearName; }
        public String getSemesterName() { return semesterName; }
        public void setSemesterName(String semesterName) { this.semesterName = semesterName; }
        public Integer getHoursPerWeek() { return hoursPerWeek; }
        public void setHoursPerWeek(Integer hoursPerWeek) { this.hoursPerWeek = hoursPerWeek; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class FacultyWorkloadDto {
        private Long id;
        private BigDecimal totalHours;
        private BigDecimal teachingHours;
        private BigDecimal labHours;
        private BigDecimal otherHours;
        private String workloadStatus;
        private String academicYearName;
        private String semesterName;
        private Instant calculatedAt;

        public FacultyWorkloadDto() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
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
        public String getAcademicYearName() { return academicYearName; }
        public void setAcademicYearName(String academicYearName) { this.academicYearName = academicYearName; }
        public String getSemesterName() { return semesterName; }
        public void setSemesterName(String semesterName) { this.semesterName = semesterName; }
        public Instant getCalculatedAt() { return calculatedAt; }
        public void setCalculatedAt(Instant calculatedAt) { this.calculatedAt = calculatedAt; }
    }

    public static class FacultyTimetableItemDto {
        private Long id;
        private String subjectCode;
        private String subjectName;
        private String roomNumber;
        private String roomName;
        private String dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private String sectionName;

        public FacultyTimetableItemDto() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getSubjectCode() { return subjectCode; }
        public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }
        public String getSubjectName() { return subjectName; }
        public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
        public String getRoomNumber() { return roomNumber; }
        public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
        public String getRoomName() { return roomName; }
        public void setRoomName(String roomName) { this.roomName = roomName; }
        public String getDayOfWeek() { return dayOfWeek; }
        public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        public LocalTime getEndTime() { return endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
        public String getSectionName() { return sectionName; }
        public void setSectionName(String sectionName) { this.sectionName = sectionName; }
    }

    public static class FacultyRequisitionSummaryDto {
        private int pendingCount;
        private int approvedCount;
        private int totalCount;
        private List<FacultyRequisitionItemDto> recentRequisitions = new ArrayList<>();

        public FacultyRequisitionSummaryDto() {}

        public int getPendingCount() { return pendingCount; }
        public void setPendingCount(int pendingCount) { this.pendingCount = pendingCount; }
        public int getApprovedCount() { return approvedCount; }
        public void setApprovedCount(int approvedCount) { this.approvedCount = approvedCount; }
        public int getTotalCount() { return totalCount; }
        public void setTotalCount(int totalCount) { this.totalCount = totalCount; }
        public List<FacultyRequisitionItemDto> getRecentRequisitions() { return recentRequisitions; }
        public void setRecentRequisitions(List<FacultyRequisitionItemDto> recentRequisitions) {
            this.recentRequisitions = recentRequisitions != null ? recentRequisitions : new ArrayList<>();
        }
    }

    public static class FacultyRequisitionItemDto {
        private Long id;
        private String resourceName;
        private String categoryName;
        private String purpose;
        private LocalDate requestedDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private String priority;
        private String status;

        public FacultyRequisitionItemDto() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getResourceName() { return resourceName; }
        public void setResourceName(String resourceName) { this.resourceName = resourceName; }
        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
        public String getPurpose() { return purpose; }
        public void setPurpose(String purpose) { this.purpose = purpose; }
        public LocalDate getRequestedDate() { return requestedDate; }
        public void setRequestedDate(LocalDate requestedDate) { this.requestedDate = requestedDate; }
        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        public LocalTime getEndTime() { return endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class FacultyActivityDto {
        private Long id;
        private String action;
        private String description;
        private Instant createdAt;

        public FacultyActivityDto() {}

        public FacultyActivityDto(Long id, String action, String description, Instant createdAt) {
            this.id = id;
            this.action = action;
            this.description = description;
            this.createdAt = createdAt;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }
}
