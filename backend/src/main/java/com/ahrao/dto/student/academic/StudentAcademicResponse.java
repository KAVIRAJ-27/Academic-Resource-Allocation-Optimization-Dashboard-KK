package com.ahrao.dto.student.academic;

import java.util.ArrayList;
import java.util.List;

public class StudentAcademicResponse {
    private StudentAcademicOverviewDto overview;
    private List<StudentSubjectDto> subjects = new ArrayList<>();
    private List<StudentTimetableEntryDto> timetable = new ArrayList<>();
    private List<Integer> availableSemesters = new ArrayList<>();
    private Integer totalCredits = 0;

    public StudentAcademicResponse() {
    }

    public StudentAcademicResponse(StudentAcademicOverviewDto overview,
                                  List<StudentSubjectDto> subjects,
                                  List<StudentTimetableEntryDto> timetable,
                                  List<Integer> availableSemesters,
                                  Integer totalCredits) {
        this.overview = overview;
        this.subjects = subjects;
        this.timetable = timetable;
        this.availableSemesters = availableSemesters;
        this.totalCredits = totalCredits;
    }

    public StudentAcademicOverviewDto getOverview() { return overview; }
    public void setOverview(StudentAcademicOverviewDto overview) { this.overview = overview; }

    public List<StudentSubjectDto> getSubjects() { return subjects; }
    public void setSubjects(List<StudentSubjectDto> subjects) { this.subjects = subjects; }

    public List<StudentTimetableEntryDto> getTimetable() { return timetable; }
    public void setTimetable(List<StudentTimetableEntryDto> timetable) { this.timetable = timetable; }

    public List<Integer> getAvailableSemesters() { return availableSemesters; }
    public void setAvailableSemesters(List<Integer> availableSemesters) { this.availableSemesters = availableSemesters; }

    public Integer getTotalCredits() { return totalCredits; }
    public void setTotalCredits(Integer totalCredits) { this.totalCredits = totalCredits; }
}
