package com.ahrao.dto.faculty.resource;

public class FacultyAvailableResourceDto {

    private Long id;
    private String name;
    private String code;
    private Long categoryId;
    private String categoryName;
    private Integer capacity;
    private String location;
    private String status;

    public FacultyAvailableResourceDto() {
    }

    public FacultyAvailableResourceDto(
            Long id,
            String name,
            String code,
            Long categoryId,
            String categoryName,
            Integer capacity,
            String location,
            String status) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
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
