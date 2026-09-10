package com.ahrao.dto.academic;

import com.ahrao.entity.enums.DegreeType;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class ProgramDetailsResponse {
    private Long id;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private String name;
    private String code;
    private DegreeType degreeType;
    private Integer durationYears;
    private String status;
    private Long subjectCount;
    private Long sectionCount;
    private Long studentCount;
    private List<SubjectSummaryResponse> subjects = new ArrayList<>();
    private List<SectionSummaryResponse> sections = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;

    public ProgramDetailsResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public DegreeType getDegreeType() {
        return degreeType;
    }

    public void setDegreeType(DegreeType degreeType) {
        this.degreeType = degreeType;
    }

    public Integer getDurationYears() {
        return durationYears;
    }

    public void setDurationYears(Integer durationYears) {
        this.durationYears = durationYears;
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

    public Long getStudentCount() {
        return studentCount;
    }

    public void setStudentCount(Long studentCount) {
        this.studentCount = studentCount;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
