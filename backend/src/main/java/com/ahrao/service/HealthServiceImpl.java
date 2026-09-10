package com.ahrao.service;

import com.ahrao.dto.HealthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class HealthServiceImpl implements HealthService {

    @Value("${spring.application.name:ahrao-backend}")
    private String appName;

    @Value("${spring.datasource.url:jdbc:mysql://localhost:3306/academic_hostel_resource_allocation}")
    private String dbUrl;

    @Override
    public HealthResponse getSystemHealth() {
        Map<String, Object> env = new LinkedHashMap<>();
        env.put("appName", appName);
        env.put("javaVersion", System.getProperty("java.version"));
        env.put("os", System.getProperty("os.name"));
        env.put("architecture", "Controller -> Service -> Repository -> MySQL");
        env.put("dbConfigured", true);

        return new HealthResponse(
                "UP",
                "Academic & Hostel Resource Allocation Optimization Dashboard",
                "AHRAO",
                "1.0.0-SNAPSHOT",
                "Phase 1: Architectural Foundation",
                env
        );
    }
}
