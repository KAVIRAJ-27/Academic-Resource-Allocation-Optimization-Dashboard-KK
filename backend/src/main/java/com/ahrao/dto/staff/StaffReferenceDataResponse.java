package com.ahrao.dto.staff;

import java.util.List;

public class StaffReferenceDataResponse {

    private List<DepartmentOption> departments;
    private List<HostelOption> hostels;
    private List<InstitutionOption> institutions;
    private List<FacultyOption> eligibleFaculty;
    private List<UserOption> unassignedUsers;

    public StaffReferenceDataResponse() {
    }

    public StaffReferenceDataResponse(
            List<DepartmentOption> departments,
            List<HostelOption> hostels,
            List<InstitutionOption> institutions,
            List<FacultyOption> eligibleFaculty,
            List<UserOption> unassignedUsers) {
        this.departments = departments;
        this.hostels = hostels;
        this.institutions = institutions;
        this.eligibleFaculty = eligibleFaculty;
        this.unassignedUsers = unassignedUsers;
    }

    public static class DepartmentOption {
        private Long id;
        private String name;
        private String code;

        public DepartmentOption() {
        }

        public DepartmentOption(Long id, String name, String code) {
            this.id = id;
            this.name = name;
            this.code = code;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
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
    }

    public static class HostelOption {
        private Long id;
        private String name;
        private String code;
        private String type;
        private Integer capacity;

        public HostelOption() {
        }

        public HostelOption(Long id, String name, String code, String type, Integer capacity) {
            this.id = id;
            this.name = name;
            this.code = code;
            this.type = type;
            this.capacity = capacity;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
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

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public Integer getCapacity() {
            return capacity;
        }

        public void setCapacity(Integer capacity) {
            this.capacity = capacity;
        }
    }

    public static class InstitutionOption {
        private Long id;
        private String name;
        private String code;

        public InstitutionOption() {
        }

        public InstitutionOption(Long id, String name, String code) {
            this.id = id;
            this.name = name;
            this.code = code;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
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
    }

    public static class FacultyOption {
        private Long id;
        private String employeeId;
        private String name;
        private Long departmentId;
        private String departmentName;
        private String designation;

        public FacultyOption() {
        }

        public FacultyOption(Long id, String employeeId, String name, Long departmentId, String departmentName, String designation) {
            this.id = id;
            this.employeeId = employeeId;
            this.name = name;
            this.departmentId = departmentId;
            this.departmentName = departmentName;
            this.designation = designation;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getEmployeeId() {
            return employeeId;
        }

        public void setEmployeeId(String employeeId) {
            this.employeeId = employeeId;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
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

        public String getDesignation() {
            return designation;
        }

        public void setDesignation(String designation) {
            this.designation = designation;
        }
    }

    public static class UserOption {
        private Long id;
        private String username;
        private String email;
        private String firstName;
        private String lastName;

        public UserOption() {
        }

        public UserOption(Long id, String username, String email, String firstName, String lastName) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }
    }

    public List<DepartmentOption> getDepartments() {
        return departments;
    }

    public void setDepartments(List<DepartmentOption> departments) {
        this.departments = departments;
    }

    public List<HostelOption> getHostels() {
        return hostels;
    }

    public void setHostels(List<HostelOption> hostels) {
        this.hostels = hostels;
    }

    public List<InstitutionOption> getInstitutions() {
        return institutions;
    }

    public void setInstitutions(List<InstitutionOption> institutions) {
        this.institutions = institutions;
    }

    public List<FacultyOption> getEligibleFaculty() {
        return eligibleFaculty;
    }

    public void setEligibleFaculty(List<FacultyOption> eligibleFaculty) {
        this.eligibleFaculty = eligibleFaculty;
    }

    public List<UserOption> getUnassignedUsers() {
        return unassignedUsers;
    }

    public void setUnassignedUsers(List<UserOption> unassignedUsers) {
        this.unassignedUsers = unassignedUsers;
    }
}
