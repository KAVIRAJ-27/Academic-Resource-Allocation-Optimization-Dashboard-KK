package com.ahrao.dto.academic.allocation;

import java.util.ArrayList;
import java.util.List;

public class AcademicCandidateResourceDto {

    private Long resourceId;
    private String resourceName;
    private String categoryName;
    private String departmentName;
    private String building;
    private String roomNumber;
    private Integer capacity;
    private double score;
    private boolean conflictFree;
    private List<String> conflictReasons = new ArrayList<>();
    private boolean preferenceMatch;
    private boolean departmentMatch;
    private int capacityWaste;

    public AcademicCandidateResourceDto() {
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public boolean isConflictFree() {
        return conflictFree;
    }

    public void setConflictFree(boolean conflictFree) {
        this.conflictFree = conflictFree;
    }

    public List<String> getConflictReasons() {
        return conflictReasons;
    }

    public void setConflictReasons(List<String> conflictReasons) {
        this.conflictReasons = conflictReasons;
    }

    public boolean isPreferenceMatch() {
        return preferenceMatch;
    }

    public void setPreferenceMatch(boolean preferenceMatch) {
        this.preferenceMatch = preferenceMatch;
    }

    public boolean isDepartmentMatch() {
        return departmentMatch;
    }

    public void setDepartmentMatch(boolean departmentMatch) {
        this.departmentMatch = departmentMatch;
    }

    public int getCapacityWaste() {
        return capacityWaste;
    }

    public void setCapacityWaste(int capacityWaste) {
        this.capacityWaste = capacityWaste;
    }
}
