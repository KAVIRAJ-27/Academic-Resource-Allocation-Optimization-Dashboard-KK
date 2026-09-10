package com.ahrao.dto.student.hostel.complaint;

import com.ahrao.entity.enums.PriorityLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateStudentHostelComplaint {

    @NotBlank(message = "Category is required")
    private String category = "ROOM";

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 150, message = "Title must be between 5 and 150 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String description;

    @NotNull(message = "Priority is required")
    private PriorityLevel priority = PriorityLevel.MEDIUM;

    private Long roomId;

    public CreateStudentHostelComplaint() {
    }

    public CreateStudentHostelComplaint(String category, String title, String description, PriorityLevel priority) {
        this(category, title, description, priority, null);
    }

    public CreateStudentHostelComplaint(String category, String title, String description, PriorityLevel priority, Long roomId) {
        this.category = category;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.roomId = roomId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public PriorityLevel getPriority() {
        return priority;
    }

    public void setPriority(PriorityLevel priority) {
        this.priority = priority;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }
}
