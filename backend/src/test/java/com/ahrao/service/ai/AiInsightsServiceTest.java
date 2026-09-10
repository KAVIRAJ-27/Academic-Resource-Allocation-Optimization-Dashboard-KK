package com.ahrao.service.ai;

import com.ahrao.dto.ai.*;
import com.ahrao.entity.academic.Department;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.hod.HodDepartmentResolver;
import com.ahrao.service.warden.WardenScopeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiInsightsServiceTest {

    @Mock
    private AiClientService aiClient;

    @Mock
    private AiDataPreparationService dataPrepService;

    @Mock
    private HodDepartmentResolver hodDepartmentResolver;

    @Mock
    private WardenScopeService wardenScopeService;

    private AiInsightsServiceImpl aiService;

    @BeforeEach
    void setUp() {
        aiService = new AiInsightsServiceImpl(aiClient, dataPrepService, hodDepartmentResolver, wardenScopeService);
    }

    @Test
    void getOverview_whenAiServiceUnavailable_returnsSafeFallback() {
        when(dataPrepService.preparePredictPayload(any(), any(), any()))
                .thenReturn(new AiPredictPayloadDto());
        when(aiClient.post(eq("/predict/overview"), any(), eq(AiOverviewDto.class)))
                .thenReturn(null);

        AiOverviewDto result = aiService.getOverview(new AiFilterParams());

        assertNotNull(result);
        assertEquals("AI_SERVICE_UNAVAILABLE", result.getStatus());
        assertTrue(result.getMessage().contains("temporarily unavailable"));
    }

    @Test
    void getOverview_whenSuccessful_returnsAiOverview() {
        AiOverviewDto mockResponse = new AiOverviewDto();
        mockResponse.setStatus("SUCCESS");
        mockResponse.setActivePredictionsCount(4);

        when(dataPrepService.preparePredictPayload(any(), any(), any()))
                .thenReturn(new AiPredictPayloadDto());
        when(aiClient.post(eq("/predict/overview"), any(), eq(AiOverviewDto.class)))
                .thenReturn(mockResponse);

        AiOverviewDto result = aiService.getOverview(new AiFilterParams());

        assertNotNull(result);
        assertEquals("SUCCESS", result.getStatus());
        assertEquals(4, result.getActivePredictionsCount());
    }

    @Test
    void getAcademicDemand_hodAccessingOtherDepartment_throwsForbiddenException() {
        try (MockedStatic<SecurityUtils> mockedSecurity = Mockito.mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(() -> SecurityUtils.hasAnyRole("ADMIN", "PRINCIPAL")).thenReturn(false);
            mockedSecurity.when(() -> SecurityUtils.hasRole("HOD")).thenReturn(true);
            mockedSecurity.when(SecurityUtils::getCurrentUserId).thenReturn(Optional.of(10L));

            Department authorizedDept = new Department();
            authorizedDept.setId(1L);
            when(hodDepartmentResolver.resolveHodDepartment(10L)).thenReturn(authorizedDept);

            AiFilterParams params = new AiFilterParams();
            params.setDepartmentId(2L); // Different department

            assertThrows(ForbiddenException.class, () -> aiService.getAcademicDemand(params));
        }
    }

    @Test
    void getHostelOccupancy_wardenAccessingOtherHostel_throwsForbiddenException() {
        try (MockedStatic<SecurityUtils> mockedSecurity = Mockito.mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(() -> SecurityUtils.hasAnyRole("ADMIN", "PRINCIPAL")).thenReturn(false);
            mockedSecurity.when(() -> SecurityUtils.hasRole("WARDEN")).thenReturn(true);

            when(wardenScopeService.getAuthorizedHostelIds()).thenReturn(Set.of(101L));

            AiFilterParams params = new AiFilterParams();
            params.setHostelId(999L); // Unauthorized hostel

            assertThrows(ForbiddenException.class, () -> aiService.getHostelOccupancy(params));
        }
    }

    @Test
    void trainModels_nonAdmin_throwsForbiddenException() {
        try (MockedStatic<SecurityUtils> mockedSecurity = Mockito.mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(() -> SecurityUtils.hasRole("ADMIN")).thenReturn(false);

            assertThrows(ForbiddenException.class, () -> aiService.trainModels("academic-demand"));
        }
    }
}
