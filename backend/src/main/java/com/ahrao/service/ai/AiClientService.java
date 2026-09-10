package com.ahrao.service.ai;

import java.util.List;

public interface AiClientService {
    boolean isAvailable();
    <T> T post(String endpoint, Object requestBody, Class<T> responseType);
    <T> List<T> postForList(String endpoint, Object requestBody, Class<T> elementType);
}
