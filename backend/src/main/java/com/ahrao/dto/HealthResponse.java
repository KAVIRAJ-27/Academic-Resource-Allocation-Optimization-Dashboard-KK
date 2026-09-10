package com.ahrao.dto;

import java.time.Instant;
import java.util.Map;

/**
 * Health telemetry response model.
 */
public class HealthResponse {

    private String status;
    private String project;
    private String shortName;
    private String version;
    private String phase;
    private Instant timestamp;
    private Map<String, Object> environment;

    public HealthResponse() {
        this.timestamp = Instant.now();
    }

    public HealthResponse(String status, String project, String shortName, String version, String phase, Map<String, Object> environment) {
        this.status = status;
        this.project = project;
        this.shortName = shortName;
        this.version = version;
        this.phase = phase;
        this.timestamp = Instant.now();
        this.environment = environment;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getProject() {
        return project;
    }

    public void setProject(String project) {
        this.project = project;
    }

    public String getShortName() {
        return shortName;
    }

    public void setShortName(String shortName) {
        this.shortName = shortName;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getPhase() {
        return phase;
    }

    public void setPhase(String phase) {
        this.phase = phase;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Map<String, Object> getEnvironment() {
        return environment;
    }

    public void setEnvironment(Map<String, Object> environment) {
        this.environment = environment;
    }
}
