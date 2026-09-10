package com.ahrao.dto.ai;

import java.util.Map;

public class ModelTrainingResultDto {
    private String status;
    private String message;
    private Map<String, Object> metadata;

    public ModelTrainingResultDto() {}

    public ModelTrainingResultDto(String status, String message, Map<String, Object> metadata) {
        this.status = status;
        this.message = message;
        this.metadata = metadata;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
}
