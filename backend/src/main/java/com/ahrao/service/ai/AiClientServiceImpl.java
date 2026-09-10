package com.ahrao.service.ai;

import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class AiClientServiceImpl implements AiClientService {

    private static final Logger log = LoggerFactory.getLogger(AiClientServiceImpl.class);

    private final RestTemplate restTemplate;
    private final String aiServiceUrl;
    private final ObjectMapper objectMapper;

    public AiClientServiceImpl(
            @Qualifier("aiRestTemplate") RestTemplate restTemplate,
            @Value("${ahrao.ai.service-url:http://127.0.0.1:8000}") String aiServiceUrl,
            ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.aiServiceUrl = aiServiceUrl.replaceAll("/+$", "");
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean isAvailable() {
        try {
            String url = aiServiceUrl + "/health";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.debug("AI microservice /health check failed: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public <T> T post(String endpoint, Object requestBody, Class<T> responseType) {
        String url = aiServiceUrl + (endpoint.startsWith("/") ? endpoint : "/" + endpoint);
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<T> response = restTemplate.exchange(url, HttpMethod.POST, entity, responseType);
            return response.getBody();
        } catch (ResourceAccessException e) {
            log.warn("AI Service connection timeout or unavailable at {}: {}", url, e.getMessage());
            return null;
        } catch (RestClientException e) {
            log.warn("AI Service call to {} returned error: {}", url, e.getMessage());
            return null;
        } catch (Exception e) {
            log.error("Unexpected error communicating with AI service at {}: {}", url, e.getMessage());
            return null;
        }
    }

    @Override
    public <T> List<T> postForList(String endpoint, Object requestBody, Class<T> elementType) {
        String url = aiServiceUrl + (endpoint.startsWith("/") ? endpoint : "/" + endpoint);
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JavaType listType = objectMapper.getTypeFactory().constructCollectionType(List.class, elementType);
                return objectMapper.readValue(response.getBody(), listType);
            }
            return new ArrayList<>();
        } catch (ResourceAccessException e) {
            log.warn("AI Service connection timeout or unavailable at {}: {}", url, e.getMessage());
            return new ArrayList<>();
        } catch (RestClientException e) {
            log.warn("AI Service call to {} returned error: {}", url, e.getMessage());
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("Unexpected error communicating with AI service for list at {}: {}", url, e.getMessage());
            return new ArrayList<>();
        }
    }
}
