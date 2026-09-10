package com.ahrao.dto.request;

import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.enums.RequestStatus;

import java.time.LocalDate;
import java.time.LocalTime;

public class AcademicRequestDto {
    private Long id;
    private Long requesterUserId;
    private String requesterName;
    private Long departmentId;
    private Long resourceCategoryId;
    private String categoryName;
    private Long requestedResourceId;
    private String requestedResourceName;
    private String purpose;
    private LocalDate requestedDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer quantity;
    private PriorityLevel priority;
    private RequestStatus status;
    private String description;

    public AcademicRequestDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRequesterUserId() { return requesterUserId; }
    public void setRequesterUserId(Long requesterUserId) { this.requesterUserId = requesterUserId; }

    public String getRequesterName() { return requesterName; }
    public void setRequesterName(String requesterName) { this.requesterName = requesterName; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public Long getResourceCategoryId() { return resourceCategoryId; }
    public void setResourceCategoryId(Long resourceCategoryId) { this.resourceCategoryId = resourceCategoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public Long getRequestedResourceId() { return requestedResourceId; }
    public void setRequestedResourceId(Long requestedResourceId) { this.requestedResourceId = requestedResourceId; }

    public String getRequestedResourceName() { return requestedResourceName; }
    public void setRequestedResourceName(String requestedResourceName) { this.requestedResourceName = requestedResourceName; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public LocalDate getRequestedDate() { return requestedDate; }
    public void setRequestedDate(LocalDate requestedDate) { this.requestedDate = requestedDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public PriorityLevel getPriority() { return priority; }
    public void setPriority(PriorityLevel priority) { this.priority = priority; }

    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
