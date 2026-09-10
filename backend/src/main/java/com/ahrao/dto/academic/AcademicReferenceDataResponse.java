package com.ahrao.dto.academic;

import java.util.ArrayList;
import java.util.List;

public class AcademicReferenceDataResponse {

    private InstitutionResponse institution;
    private List<DepartmentLookup> departments = new ArrayList<>();
    private List<ProgramLookup> programs = new ArrayList<>();
    private List<AcademicYearLookup> academicYears = new ArrayList<>();
    private List<SemesterLookup> semesters = new ArrayList<>();
    private List<String> degreeTypes = new ArrayList<>();
    private List<String> subjectTypes = new ArrayList<>();
    private List<String> statuses = new ArrayList<>();

    public AcademicReferenceDataResponse() {
    }

    public InstitutionResponse getInstitution() {
        return institution;
    }

    public void setInstitution(InstitutionResponse institution) {
        this.institution = institution;
    }

    public List<DepartmentLookup> getDepartments() {
        return departments;
    }

    public void setDepartments(List<DepartmentLookup> departments) {
        this.departments = departments;
    }

    public List<ProgramLookup> getPrograms() {
        return programs;
    }

    public void setPrograms(List<ProgramLookup> programs) {
        this.programs = programs;
    }

    public List<AcademicYearLookup> getAcademicYears() {
        return academicYears;
    }

    public void setAcademicYears(List<AcademicYearLookup> academicYears) {
        this.academicYears = academicYears;
    }

    public List<SemesterLookup> getSemesters() {
        return semesters;
    }

    public void setSemesters(List<SemesterLookup> semesters) {
        this.semesters = semesters;
    }

    public List<String> getDegreeTypes() {
        return degreeTypes;
    }

    public void setDegreeTypes(List<String> degreeTypes) {
        this.degreeTypes = degreeTypes;
    }

    public List<String> getSubjectTypes() {
        return subjectTypes;
    }

    public void setSubjectTypes(List<String> subjectTypes) {
        this.subjectTypes = subjectTypes;
    }

    public List<String> getStatuses() {
        return statuses;
    }

    public void setStatuses(List<String> statuses) {
        this.statuses = statuses;
    }

    // Static nested lookup classes
    public static class DepartmentLookup {
        private Long id;
        private String name;
        private String code;
        private String status;

        public DepartmentLookup(Long id, String name, String code, String status) {
            this.id = id;
            this.name = name;
            this.code = code;
            this.status = status;
        }

        public Long getId() { return id; }
        public String getName() { return name; }
        public String getCode() { return code; }
        public String getStatus() { return status; }
    }

    public static class ProgramLookup {
        private Long id;
        private Long departmentId;
        private String name;
        private String code;
        private String degreeType;
        private String status;

        public ProgramLookup(Long id, Long departmentId, String name, String code, String degreeType, String status) {
            this.id = id;
            this.departmentId = departmentId;
            this.name = name;
            this.code = code;
            this.degreeType = degreeType;
            this.status = status;
        }

        public Long getId() { return id; }
        public Long getDepartmentId() { return departmentId; }
        public String getName() { return name; }
        public String getCode() { return code; }
        public String getDegreeType() { return degreeType; }
        public String getStatus() { return status; }
    }

    public static class AcademicYearLookup {
        private Long id;
        private String name;
        private String status;

        public AcademicYearLookup(Long id, String name, String status) {
            this.id = id;
            this.name = name;
            this.status = status;
        }

        public Long getId() { return id; }
        public String getName() { return name; }
        public String getStatus() { return status; }
    }

    public static class SemesterLookup {
        private Long id;
        private Long academicYearId;
        private String name;
        private Integer number;
        private String status;

        public SemesterLookup(Long id, Long academicYearId, String name, Integer number, String status) {
            this.id = id;
            this.academicYearId = academicYearId;
            this.name = name;
            this.number = number;
            this.status = status;
        }

        public Long getId() { return id; }
        public Long getAcademicYearId() { return academicYearId; }
        public String getName() { return name; }
        public Integer getNumber() { return number; }
        public String getStatus() { return status; }
    }
}
