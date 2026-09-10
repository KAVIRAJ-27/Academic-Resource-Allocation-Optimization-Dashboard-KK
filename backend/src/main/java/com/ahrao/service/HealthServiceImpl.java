package com.ahrao.service;

import com.ahrao.dto.HealthResponse;
import com.ahrao.service.ai.AiClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class HealthServiceImpl implements HealthService {

    @Value("${spring.application.name:ahrao-backend}")
    private String appName;

    private final DataSource dataSource;
    private final AiClientService aiClientService;

    @Autowired
    public HealthServiceImpl(
            @Autowired(required = false) DataSource dataSource,
            @Autowired(required = false) AiClientService aiClientService) {
        this.dataSource = dataSource;
        this.aiClientService = aiClientService;
    }

    @Override
    public HealthResponse getSystemHealth() {
        Map<String, Object> components = new LinkedHashMap<>();
        components.put("application", "UP");

        boolean dbLive = false;
        if (dataSource != null) {
            try (Connection conn = dataSource.getConnection()) {
                dbLive = conn.isValid(2);
            } catch (Exception ignored) {
                dbLive = false;
            }
        }
        components.put("database", dbLive ? "UP" : "DEGRADED");

        boolean aiLive = false;
        if (aiClientService != null) {
            try {
                aiLive = aiClientService.isAvailable();
            } catch (Exception ignored) {
                aiLive = false;
            }
        }
        components.put("aiService", aiLive ? "UP" : "UNAVAILABLE");

        Map<String, Object> env = new LinkedHashMap<>();
        env.put("appName", appName);
        env.put("javaVersion", System.getProperty("java.version"));
        env.put("os", System.getProperty("os.name"));
        env.put("components", components);

        return new HealthResponse(
                "UP",
                "Academic & Hostel Resource Allocation Optimization Dashboard",
                "AHRAO",
                "1.0.0-SNAPSHOT",
                "Phase 35: Production Ready",
                env
        );
    }
}
