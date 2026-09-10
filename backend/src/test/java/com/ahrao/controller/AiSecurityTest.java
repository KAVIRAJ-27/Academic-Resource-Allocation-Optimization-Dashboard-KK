package com.ahrao.controller;

import com.ahrao.dto.ai.AiFilterParams;
import com.ahrao.dto.ai.AiOverviewDto;
import com.ahrao.service.ai.AiInsightsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.reflect.Method;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiSecurityTest {

    @Mock
    private AiInsightsService aiService;

    private AiController aiController;

    @BeforeEach
    void setUp() {
        aiController = new AiController(aiService);
    }

    @Test
    @DisplayName("Security: AiController enforces class-level role authorization")
    void testClassLevelPreAuthorize() {
        PreAuthorize annotation = AiController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(annotation, "AiController must have @PreAuthorize at class level");
        assertTrue(annotation.value().contains("ADMIN"));
        assertTrue(annotation.value().contains("PRINCIPAL"));
        assertTrue(annotation.value().contains("HOD"));
        assertTrue(annotation.value().contains("WARDEN"));
        assertTrue(annotation.value().contains("FACULTY"));
        assertTrue(annotation.value().contains("STUDENT"));
    }

    @Test
    @DisplayName("Security: trainModels endpoint strictly restricted to ADMIN role")
    void testTrainModelsEndpoint_AdminOnly() throws NoSuchMethodException {
        Method trainMethod = AiController.class.getMethod("trainModels", String.class);
        PreAuthorize annotation = trainMethod.getAnnotation(PreAuthorize.class);
        assertNotNull(annotation, "trainModels method must have @PreAuthorize");
        assertEquals("hasRole('ADMIN')", annotation.value());
    }

    @Test
    @DisplayName("Controller: getOverview delegates to AiInsightsService")
    void testGetOverviewDelegation() {
        when(aiService.getOverview(any())).thenReturn(new AiOverviewDto());
        var res = aiController.getOverview(new AiFilterParams());
        assertNotNull(res);
        assertEquals(200, res.getStatusCode().value());
        verify(aiService, times(1)).getOverview(any());
    }

    @Test
    @DisplayName("Controller: trainModels delegates to AiInsightsService")
    void testTrainModelsDelegation() {
        when(aiService.trainModels("academic-demand")).thenReturn(Map.of("status", "SUCCESS"));
        var res = aiController.trainModels("academic-demand");
        assertNotNull(res);
        assertEquals(200, res.getStatusCode().value());
        verify(aiService, times(1)).trainModels("academic-demand");
    }
}
