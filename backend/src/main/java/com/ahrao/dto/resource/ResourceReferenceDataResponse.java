package com.ahrao.dto.resource;

import java.util.List;

public class ResourceReferenceDataResponse {

    public static class ReferenceOption {
        private Long id;
        private String code;
        private String name;
        private String type;
        private String status;

        public ReferenceOption() {}

        public ReferenceOption(Long id, String code, String name) {
            this.id = id;
            this.code = code;
            this.name = name;
        }

        public ReferenceOption(Long id, String code, String name, String type, String status) {
            this.id = id;
            this.code = code;
            this.name = name;
            this.type = type;
            this.status = status;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    private List<ReferenceOption> categories;
    private List<ReferenceOption> departments;
    private List<String> resourceStatuses;
    private List<String> resourceTypes;
    private List<String> roomTypes;
    private List<String> labTypes;
    private List<String> conditionStatuses;
    private List<String> daysOfWeek;

    public ResourceReferenceDataResponse() {
    }

    public List<ReferenceOption> getCategories() {
        return categories;
    }

    public void setCategories(List<ReferenceOption> categories) {
        this.categories = categories;
    }

    public List<ReferenceOption> getDepartments() {
        return departments;
    }

    public void setDepartments(List<ReferenceOption> departments) {
        this.departments = departments;
    }

    public List<String> getResourceStatuses() {
        return resourceStatuses;
    }

    public void setResourceStatuses(List<String> resourceStatuses) {
        this.resourceStatuses = resourceStatuses;
    }

    public List<String> getResourceTypes() {
        return resourceTypes;
    }

    public void setResourceTypes(List<String> resourceTypes) {
        this.resourceTypes = resourceTypes;
    }

    public List<String> getRoomTypes() {
        return roomTypes;
    }

    public void setRoomTypes(List<String> roomTypes) {
        this.roomTypes = roomTypes;
    }

    public List<String> getLabTypes() {
        return labTypes;
    }

    public void setLabTypes(List<String> labTypes) {
        this.labTypes = labTypes;
    }

    public List<String> getConditionStatuses() {
        return conditionStatuses;
    }

    public void setConditionStatuses(List<String> conditionStatuses) {
        this.conditionStatuses = conditionStatuses;
    }

    public List<String> getDaysOfWeek() {
        return daysOfWeek;
    }

    public void setDaysOfWeek(List<String> daysOfWeek) {
        this.daysOfWeek = daysOfWeek;
    }
}
