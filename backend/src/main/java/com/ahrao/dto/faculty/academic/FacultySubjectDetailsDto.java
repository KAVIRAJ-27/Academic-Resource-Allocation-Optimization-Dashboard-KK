package com.ahrao.dto.faculty.academic;

import java.util.ArrayList;
import java.util.List;

public class FacultySubjectDetailsDto {

    private Long subjectId;
    private String subjectCode;
    private String subjectName;
    private Integer credits;
    private String subjectType;
    private String status;

    private Long programId;
    private String programCode;
    private String programName;
    private String degreeType;

    private Long departmentId;
    private String departmentName;
    private String departmentCode;

    private Long semesterId;
    private Integer semesterNumber;
    private String semesterName;
    private String academicYearName;

    private Integer totalHoursPerWeek;

    private List<AssignedSectionDto> assignedSections = new ArrayList<>();
    private List<FacultyTimetableEntryDto> timetableSlots = new ArrayList<>();

    public FacultySubjectDetailsDto() {
    }

    public static class AssignedSectionDto {
        private Long assignmentId;
        private Long sectionId;
        private String sectionName;
        private Integer capacity;
        private Integer hoursPerWeek;
        private String status;

        public AssignedSectionDto() {
        }

        public Long getAssignmentId() {
            return assignmentId;
        }

        public void setAssignmentId(Long assignmentId) {
            this.assignmentId = assignmentId;
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

        public Integer getCapacity() {
            return capacity;
        }

        public void setCapacity(Integer capacity) {
            this.capacity = capacity;
        }

        public Integer getHoursPerWeek() {
            return hoursPerWeek;
        }

        public void setHoursPerWeek(Integer hoursPerWeek) {
            this.hoursPerWeek = hoursPerWeek;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public String getSubjectCode() {
        return subjectCode;
    }

    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public String getSubjectType() {
        return subjectType;
    }

    public void setSubjectType(String subjectType) {
        this.subjectType = subjectType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public Long getSemesterId() {
        return semesterId;
    }

    public void setSemesterId(Long semesterId) {
        this.semesterId = semesterId;
    }

    public Integer getSemesterNumber() {
        return semesterNumber;
    }

    public void setSemesterNumber(Integer semesterNumber) {
        this.semesterNumber = semesterNumber;
    }

    public String getSemesterName() {
        return semesterName;
    }

    public void setSemesterName(String semesterName) {
        this.semesterName = semesterName;
    }

    public String getAcademicYearName() {
        return academicYearName;
    }

    public void setAcademicYearName(String academicYearName) {
        this.academicYearName = academicYearName;
    }

    public Integer getTotalHoursPerWeek() {
        return totalHoursPerWeek;
    }

    public void setTotalHoursPerWeek(Integer totalHoursPerWeek) {
        this.totalHoursPerWeek = totalHoursPerWeek;
    }

    public List<AssignedSectionDto> getAssignedSections() {
        return assignedSections;
    }

    public void setAssignedSections(List<AssignedSectionDto> assignedSections) {
        this.assignedSections = assignedSections != null ? assignedSections : new ArrayList<>();
    }

    public List<FacultyTimetableEntryDto> getTimetableSlots() {
        return timetableSlots;
    }

    public void setTimetableSlots(List<FacultyTimetableEntryDto> timetableSlots) {
        this.timetableSlots = timetableSlots != null ? timetableSlots : new ArrayList<>();
    }
}
