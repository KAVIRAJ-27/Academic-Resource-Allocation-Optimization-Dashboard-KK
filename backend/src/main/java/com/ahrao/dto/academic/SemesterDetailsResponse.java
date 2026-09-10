package com.ahrao.dto.academic;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class SemesterDetailsResponse {
    private Long id;
    private Long academicYearId;
    private String academicYearName;
    private String name;
    private Integer number;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Long subjectCount;
    private Long sectionCount;
    private List<SubjectSummaryResponse> subjects = new ArrayList<>();
    private List<SectionSummaryResponse> sections = new ArrayList<>();

    public SemesterDetailsResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAcademicYearId() {
        return academicYearId;
    }

    public void setAcademicYearId(Long academicYearId) {
        this.academicYearId = academicYearId;
    }

    public String getAcademicYearName() {
        return academicYearName;
    }

    public void setAcademicYearName(String academicYearName) {
        this.academicYearName = academicYearName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getNumber() {
        return number;
    }

    public void setNumber(Integer number) {
        this.number = number;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getSubjectCount() {
        return subjectCount;
    }

    public void setSubjectCount(Long subjectCount) {
        this.subjectCount = subjectCount;
    }

    public Long getSectionCount() {
        return sectionCount;
    }

    public void setSectionCount(Long sectionCount) {
        this.sectionCount = sectionCount;
    }

    public List<SubjectSummaryResponse> getSubjects() {
        return subjects;
    }

    public void setSubjects(List<SubjectSummaryResponse> subjects) {
        this.subjects = subjects;
    }

    public List<SectionSummaryResponse> getSections() {
        return sections;
    }

    public void setSections(List<SectionSummaryResponse> sections) {
        this.sections = sections;
    }
}
