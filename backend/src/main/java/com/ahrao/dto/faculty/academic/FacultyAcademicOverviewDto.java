package com.ahrao.dto.faculty.academic;

import java.util.ArrayList;
import java.util.List;

public class FacultyAcademicOverviewDto {

    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private String institutionName;

    private int assignedCoursesCount;
    private int assignedSubjectsCount;
    private int assignedSectionsCount;
    private int totalWeeklyInstructionHours;

    private List<FacultyCourseDto> assignedPrograms = new ArrayList<>();
    private List<FacultySubjectDto> assignedSubjects = new ArrayList<>();

    public FacultyAcademicOverviewDto() {
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

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public int getAssignedCoursesCount() {
        return assignedCoursesCount;
    }

    public void setAssignedCoursesCount(int assignedCoursesCount) {
        this.assignedCoursesCount = assignedCoursesCount;
    }

    public int getAssignedSubjectsCount() {
        return assignedSubjectsCount;
    }

    public void setAssignedSubjectsCount(int assignedSubjectsCount) {
        this.assignedSubjectsCount = assignedSubjectsCount;
    }

    public int getAssignedSectionsCount() {
        return assignedSectionsCount;
    }

    public void setAssignedSectionsCount(int assignedSectionsCount) {
        this.assignedSectionsCount = assignedSectionsCount;
    }

    public int getTotalWeeklyInstructionHours() {
        return totalWeeklyInstructionHours;
    }

    public void setTotalWeeklyInstructionHours(int totalWeeklyInstructionHours) {
        this.totalWeeklyInstructionHours = totalWeeklyInstructionHours;
    }

    public List<FacultyCourseDto> getAssignedPrograms() {
        return assignedPrograms;
    }

    public void setAssignedPrograms(List<FacultyCourseDto> assignedPrograms) {
        this.assignedPrograms = assignedPrograms != null ? assignedPrograms : new ArrayList<>();
    }

    public List<FacultySubjectDto> getAssignedSubjects() {
        return assignedSubjects;
    }

    public void setAssignedSubjects(List<FacultySubjectDto> assignedSubjects) {
        this.assignedSubjects = assignedSubjects != null ? assignedSubjects : new ArrayList<>();
    }
}
