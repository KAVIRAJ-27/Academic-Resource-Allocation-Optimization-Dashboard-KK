package com.ahrao.dto.dashboard;

public class UserDistributionDto {
    private long totalUsers;
    private long adminCount;
    private long principalCount;
    private long hodCount;
    private long facultyCount;
    private long studentCount;
    private long wardenCount;

    public UserDistributionDto() {
    }

    public UserDistributionDto(long totalUsers, long adminCount, long principalCount, long hodCount,
                               long facultyCount, long studentCount, long wardenCount) {
        this.totalUsers = totalUsers;
        this.adminCount = adminCount;
        this.principalCount = principalCount;
        this.hodCount = hodCount;
        this.facultyCount = facultyCount;
        this.studentCount = studentCount;
        this.wardenCount = wardenCount;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getAdminCount() {
        return adminCount;
    }

    public void setAdminCount(long adminCount) {
        this.adminCount = adminCount;
    }

    public long getPrincipalCount() {
        return principalCount;
    }

    public void setPrincipalCount(long principalCount) {
        this.principalCount = principalCount;
    }

    public long getHodCount() {
        return hodCount;
    }

    public void setHodCount(long hodCount) {
        this.hodCount = hodCount;
    }

    public long getFacultyCount() {
        return facultyCount;
    }

    public void setFacultyCount(long facultyCount) {
        this.facultyCount = facultyCount;
    }

    public long getStudentCount() {
        return studentCount;
    }

    public void setStudentCount(long studentCount) {
        this.studentCount = studentCount;
    }

    public long getWardenCount() {
        return wardenCount;
    }

    public void setWardenCount(long wardenCount) {
        this.wardenCount = wardenCount;
    }
}
