package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.resource.*;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.security.CustomUserDetails;
import com.ahrao.service.resource.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminResourceSecurityTest {

    @Mock
    private ResourceCategoryManagementService resourceCategoryManagementService;
    @Mock
    private ResourceManagementService resourceManagementService;
    @Mock
    private ClassroomManagementService classroomManagementService;
    @Mock
    private LaboratoryManagementService laboratoryManagementService;
    @Mock
    private EquipmentManagementService equipmentManagementService;
    @Mock
    private TimeSlotManagementService timeSlotManagementService;
    @Mock
    private ResourceOverviewService resourceOverviewService;

    @InjectMocks
    private AdminResourceCategoryController adminResourceCategoryController;
    @InjectMocks
    private AdminResourceController adminResourceController;
    @InjectMocks
    private AdminClassroomController adminClassroomController;
    @InjectMocks
    private AdminLaboratoryController adminLaboratoryController;
    @InjectMocks
    private AdminEquipmentController adminEquipmentController;
    @InjectMocks
    private AdminTimeSlotController adminTimeSlotController;
    @InjectMocks
    private AdminResourceOverviewController adminResourceOverviewController;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(String role) {
        CustomUserDetails userDetails = new CustomUserDetails(
                1L,
                "admin",
                "admin@ahrao.edu",
                "System",
                "Administrator",
                "encodedPassword",
                UserStatus.ACTIVE,
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role))
        );
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    @DisplayName("All Phase 10 Academic Resource Controllers must have @PreAuthorize('hasRole(\\'ADMIN\\')') at class level")
    void testPreAuthorizeAnnotationPresentOnAllResourceControllers() {
        PreAuthorize catPreAuth = AdminResourceCategoryController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(catPreAuth);
        assertEquals("hasRole('ADMIN')", catPreAuth.value());

        PreAuthorize resPreAuth = AdminResourceController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(resPreAuth);
        assertEquals("hasRole('ADMIN')", resPreAuth.value());

        PreAuthorize classPreAuth = AdminClassroomController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(classPreAuth);
        assertEquals("hasRole('ADMIN')", classPreAuth.value());

        PreAuthorize labPreAuth = AdminLaboratoryController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(labPreAuth);
        assertEquals("hasRole('ADMIN')", labPreAuth.value());

        PreAuthorize eqPreAuth = AdminEquipmentController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(eqPreAuth);
        assertEquals("hasRole('ADMIN')", eqPreAuth.value());

        PreAuthorize tsPreAuth = AdminTimeSlotController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(tsPreAuth);
        assertEquals("hasRole('ADMIN')", tsPreAuth.value());

        PreAuthorize ovPreAuth = AdminResourceOverviewController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(ovPreAuth);
        assertEquals("hasRole('ADMIN')", ovPreAuth.value());
    }

    @Test
    @DisplayName("Authenticated ADMIN can invoke getOverview successfully")
    void testGetOverview_AsAdmin_Success() {
        authenticateAs("ADMIN");

        ResourceOverviewResponse overview = new ResourceOverviewResponse();
        overview.setTotalResources(10L);
        when(resourceOverviewService.getOverview()).thenReturn(overview);

        ResponseEntity<ApiResponse<ResourceOverviewResponse>> response =
                adminResourceOverviewController.getOverview();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals(10L, response.getBody().getData().getTotalResources());
    }

    @Test
    @DisplayName("Authenticated ADMIN can invoke getResources successfully")
    void testGetResources_AsAdmin_Success() {
        authenticateAs("ADMIN");

        PagedResponse<ResourceSummaryResponse> paged = new PagedResponse<>(
                Collections.emptyList(), 0, 10, 0, 0, true, true);
        when(resourceManagementService.getResources(isNull(), isNull(), isNull(), isNull(), isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(paged);

        ResponseEntity<ApiResponse<PagedResponse<ResourceSummaryResponse>>> response =
                adminResourceController.getResources(null, null, null, null, null, null, null, 0, 10, "name", "ASC");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
    }

    @Test
    @DisplayName("Authenticated ADMIN can invoke getClassrooms successfully")
    void testGetClassrooms_AsAdmin_Success() {
        authenticateAs("ADMIN");

        PagedResponse<ClassroomSummaryResponse> paged = new PagedResponse<>(
                Collections.emptyList(), 0, 10, 0, 0, true, true);
        when(classroomManagementService.getClassrooms(isNull(), isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(paged);

        ResponseEntity<ApiResponse<PagedResponse<ClassroomSummaryResponse>>> response =
                adminClassroomController.getClassrooms(null, null, null, null, 0, 10, "building", "ASC");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
    }

    @Test
    @DisplayName("Authenticated ADMIN can invoke getTimeSlots successfully")
    void testGetTimeSlots_AsAdmin_Success() {
        authenticateAs("ADMIN");

        PagedResponse<TimeSlotSummaryResponse> paged = new PagedResponse<>(
                Collections.emptyList(), 0, 10, 0, 0, true, true);
        when(timeSlotManagementService.getTimeSlots(isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(paged);

        ResponseEntity<ApiResponse<PagedResponse<TimeSlotSummaryResponse>>> response =
                adminTimeSlotController.getTimeSlots(null, null, null, 0, 10, "startTime", "ASC");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
    }
}
