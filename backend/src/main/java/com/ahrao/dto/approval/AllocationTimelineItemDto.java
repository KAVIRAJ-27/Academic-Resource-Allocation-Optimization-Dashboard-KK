package com.ahrao.dto.approval;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

public class AllocationTimelineItemDto {

    private String eventType;
    private String status;
    private String actorName;
    private String actorRole;
    private Instant timestamp;
    private String comment;
    private Map<String, Object> metadata = new HashMap<>();

    public AllocationTimelineItemDto() {
    }

    public AllocationTimelineItemDto(String eventType, String status, String actorName, String actorRole, Instant timestamp, String comment) {
        this.eventType = eventType;
        this.status = status;
        this.actorName = actorName;
        this.actorRole = actorRole;
        this.timestamp = timestamp;
        this.comment = comment;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getActorName() {
        return actorName;
    }

    public void setActorName(String actorName) {
        this.actorName = actorName;
    }

    public String getActorRole() {
        return actorRole;
    }

    public void setActorRole(String actorRole) {
        this.actorRole = actorRole;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }
}
