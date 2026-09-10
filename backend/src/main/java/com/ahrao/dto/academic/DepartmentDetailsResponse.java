package com.ahrao.dto.academic;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class DepartmentDetailsResponse {
    private Long id;
    private Long institutionId;
    private String institutionName;
    private String name;
    private String code;
    private String description;
    private String status;
    private Long programCount;
    private Long subjectCount;
    private Long facultyCount;
    private Long studentCount;
    private Long hodFacultyId;
    private String hodName;
    private String hodEmployeeId;
    private String hodEmail;
    private List<ProgramSummaryResponse> programs = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;

    public DepartmentDetailsResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(Long institutionId) {
        this.institutionId = institutionId;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getProgramCount() {
        return programCount;
    }

    public void setProgramCount(Long programCount) {
        this.programCount = programCount;
    }

    public Long getSubjectCount() {
        return subjectCount;
    }

    public void setSubjectCount(Long subjectCount) {
        this.subjectCount = subjectCount;
    }

    public Long getFacultyCount() {
        return facultyCount;
    }

    public void setFacultyCount(Long facultyCount) {
        this.facultyCount = facultyCount;
    }

    public Long getStudentCount() {
        return studentCount;
    }

    public void setStudentCount(Long studentCount) {
        this.studentCount = studentCount;
    }

    public Long getHodFacultyId() {
        return hodFacultyId;
    }

    public void setHodFacultyId(Long hodFacultyId) {
        this.hodFacultyId = hodFacultyId;
    }

    public String getHodName() {
        return hodName;
    }

    public void setHodName(String hodName) {
        this.hodName = hodName;
    }

    public String getHodEmployeeId() {
        return hodEmployeeId;
    }

    public void setHodEmployeeId(String hodEmployeeId) {
        this.hodEmployeeId = hodEmployeeId;
    }

    public String getHodEmail() {
        return hodEmail;
    }

    public void setHodEmail(String hodEmail) {
        this.hodEmail = hodEmail;
    }

    public List<ProgramSummaryResponse> getPrograms() {
        return programs;
    }

    public void setPrograms(List<ProgramSummaryResponse> programs) {
        this.programs = programs;
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
