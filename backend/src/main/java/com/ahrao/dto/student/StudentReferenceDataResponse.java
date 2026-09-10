package com.ahrao.dto.student;

import java.util.List;

public class StudentReferenceDataResponse {

    private List<DepartmentOption> departments;
    private List<ProgramOption> programs;
    private List<SectionOption> sections;
    private List<UserOption> unassignedUsers;

    public StudentReferenceDataResponse() {
    }

    public StudentReferenceDataResponse(
            List<DepartmentOption> departments,
            List<ProgramOption> programs,
            List<SectionOption> sections,
            List<UserOption> unassignedUsers) {
        this.departments = departments;
        this.programs = programs;
        this.sections = sections;
        this.unassignedUsers = unassignedUsers;
    }

    public List<DepartmentOption> getDepartments() {
        return departments;
    }

    public void setDepartments(List<DepartmentOption> departments) {
        this.departments = departments;
    }

    public List<ProgramOption> getPrograms() {
        return programs;
    }

    public void setPrograms(List<ProgramOption> programs) {
        this.programs = programs;
    }

    public List<SectionOption> getSections() {
        return sections;
    }

    public void setSections(List<SectionOption> sections) {
        this.sections = sections;
    }

    public List<UserOption> getUnassignedUsers() {
        return unassignedUsers;
    }

    public void setUnassignedUsers(List<UserOption> unassignedUsers) {
        this.unassignedUsers = unassignedUsers;
    }

    public static class DepartmentOption {
        private Long id;
        private String name;
        private String code;

        public DepartmentOption() {}
        public DepartmentOption(Long id, String name, String code) {
            this.id = id;
            this.name = name;
            this.code = code;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
    }

    public static class ProgramOption {
        private Long id;
        private String name;
        private String code;
        private Long departmentId;

        public ProgramOption() {}
        public ProgramOption(Long id, String name, String code, Long departmentId) {
            this.id = id;
            this.name = name;
            this.code = code;
            this.departmentId = departmentId;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public Long getDepartmentId() { return departmentId; }
        public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    }

    public static class SectionOption {
        private Long id;
        private String name;
        private Long programId;
        private Integer capacity;

        public SectionOption() {}
        public SectionOption(Long id, String name, Long programId, Integer capacity) {
            this.id = id;
            this.name = name;
            this.programId = programId;
            this.capacity = capacity;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Long getProgramId() { return programId; }
        public void setProgramId(Long programId) { this.programId = programId; }
        public Integer getCapacity() { return capacity; }
        public void setCapacity(Integer capacity) { this.capacity = capacity; }
    }

    public static class UserOption {
        private Long id;
        private String username;
        private String fullName;
        private String email;

        public UserOption() {}
        public UserOption(Long id, String username, String fullName, String email) {
            this.id = id;
            this.username = username;
            this.fullName = fullName;
            this.email = email;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
}
