package com.ahrao.dto.student.resource;

public class StudentResourceSummaryDto {
    private Long id;
    private String code;
    private String name;
    private Long categoryId;
    private String categoryName;
    private Long departmentId;
    private String departmentName;
    private Integer capacity;
    private String location;
    private String status;

    public StudentResourceSummaryDto() {
    }

    public StudentResourceSummaryDto(Long id, String code, String name, Long categoryId, String categoryName, Long departmentId, String departmentName, Integer capacity, String location, String status) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.capacity = capacity;
        this.location = location;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
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

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
