package com.ahrao.dto.student;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class StudentDashboardDto {

    private StudentSummary student;
    private AcademicSummary academic;
    private HostelSummary hostel;
    private MetricsSummary metrics;
    private List<RecentActivityItem> recentActivities = new ArrayList<>();

    public StudentDashboardDto() {
    }

    public StudentSummary getStudent() {
        return student;
    }

    public void setStudent(StudentSummary student) {
        this.student = student;
    }

    public AcademicSummary getAcademic() {
        return academic;
    }

    public void setAcademic(AcademicSummary academic) {
        this.academic = academic;
    }

    public HostelSummary getHostel() {
        return hostel;
    }

    public void setHostel(HostelSummary hostel) {
        this.hostel = hostel;
    }

    public MetricsSummary getMetrics() {
        return metrics;
    }

    public void setMetrics(MetricsSummary metrics) {
        this.metrics = metrics;
    }

    public List<RecentActivityItem> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<RecentActivityItem> recentActivities) {
        this.recentActivities = recentActivities;
    }

    // Inner classes
    public static class StudentSummary {
        private Long id;
        private String name;
        private String registerNumber;
        private String rollNumber;
        private String email;
        private String phone;
        private String status;

        public StudentSummary() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getRegisterNumber() { return registerNumber; }
        public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }
        public String getRollNumber() { return rollNumber; }
        public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class AcademicSummary {
        private String departmentName;
        private String departmentCode;
        private String programName;
        private String programCode;
        private Integer currentSemester;
        private String sectionName;
        private String academicYearName;

        public AcademicSummary() {}

        public String getDepartmentName() { return departmentName; }
        public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
        public String getDepartmentCode() { return departmentCode; }
        public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }
        public String getProgramName() { return programName; }
        public void setProgramName(String programName) { this.programName = programName; }
        public String getProgramCode() { return programCode; }
        public void setProgramCode(String programCode) { this.programCode = programCode; }
        public Integer getCurrentSemester() { return currentSemester; }
        public void setCurrentSemester(Integer currentSemester) { this.currentSemester = currentSemester; }
        public String getSectionName() { return sectionName; }
        public void setSectionName(String sectionName) { this.sectionName = sectionName; }
        public String getAcademicYearName() { return academicYearName; }
        public void setAcademicYearName(String academicYearName) { this.academicYearName = academicYearName; }
    }

    public static class HostelSummary {
        private boolean allocated;
        private String hostelName;
        private String blockName;
        private Integer floorNumber;
        private String roomNumber;
        private String bedNumber;
        private String allocationStatus;

        public HostelSummary() {}

        public boolean isAllocated() { return allocated; }
        public void setAllocated(boolean allocated) { this.allocated = allocated; }
        public String getHostelName() { return hostelName; }
        public void setHostelName(String hostelName) { this.hostelName = hostelName; }
        public String getBlockName() { return blockName; }
        public void setBlockName(String blockName) { this.blockName = blockName; }
        public Integer getFloorNumber() { return floorNumber; }
        public void setFloorNumber(Integer floorNumber) { this.floorNumber = floorNumber; }
        public String getRoomNumber() { return roomNumber; }
        public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
        public String getBedNumber() { return bedNumber; }
        public void setBedNumber(String bedNumber) { this.bedNumber = bedNumber; }
        public String getAllocationStatus() { return allocationStatus; }
        public void setAllocationStatus(String allocationStatus) { this.allocationStatus = allocationStatus; }
    }

    public static class MetricsSummary {
        private int enrolledCoursesCount;
        private int weeklyClassHours;
        private boolean hostelAllocated;
        private int activeAllocationsCount;
        private int pendingRequestsCount;

        public MetricsSummary() {}

        public int getEnrolledCoursesCount() { return enrolledCoursesCount; }
        public void setEnrolledCoursesCount(int enrolledCoursesCount) { this.enrolledCoursesCount = enrolledCoursesCount; }
        public int getWeeklyClassHours() { return weeklyClassHours; }
        public void setWeeklyClassHours(int weeklyClassHours) { this.weeklyClassHours = weeklyClassHours; }
        public boolean isHostelAllocated() { return hostelAllocated; }
        public void setHostelAllocated(boolean hostelAllocated) { this.hostelAllocated = hostelAllocated; }
        public int getActiveAllocationsCount() { return activeAllocationsCount; }
        public void setActiveAllocationsCount(int activeAllocationsCount) { this.activeAllocationsCount = activeAllocationsCount; }
        public int getPendingRequestsCount() { return pendingRequestsCount; }
        public void setPendingRequestsCount(int pendingRequestsCount) { this.pendingRequestsCount = pendingRequestsCount; }
    }

    public static class RecentActivityItem {
        private Long id;
        private String action;
        private String description;
        private Instant timestamp;

        public RecentActivityItem() {}

        public RecentActivityItem(Long id, String action, String description, Instant timestamp) {
            this.id = id;
            this.action = action;
            this.description = description;
            this.timestamp = timestamp;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Instant getTimestamp() { return timestamp; }
        public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    }
}
