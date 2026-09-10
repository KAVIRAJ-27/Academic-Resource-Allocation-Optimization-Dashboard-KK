package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.user.AdminResetPasswordRequest;
import com.ahrao.dto.user.CreateUserRequest;
import com.ahrao.dto.user.UpdateUserRequest;
import com.ahrao.dto.user.UpdateUserRolesRequest;
import com.ahrao.dto.user.UpdateUserStatusRequest;
import com.ahrao.dto.user.UserSummaryResponse;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminOverview() {
        return ResponseEntity.ok(ApiResponse.success("Admin overview telemetry retrieved",
                Map.of("role", "ADMIN", "accessLevel", "GLOBAL", "status", "AUTHORIZED")));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PagedResponse<UserSummaryResponse>>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) UserStatus status,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        PagedResponse<UserSummaryResponse> users = userService.getUsers(search, role, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> getUserById(@PathVariable Long id) {
        UserSummaryResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved", user));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> createUser(
            @Valid @RequestBody CreateUserRequest request,
            HttpServletRequest httpRequest) {
        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        UserSummaryResponse created = userService.createUser(request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully", created));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request,
            HttpServletRequest httpRequest) {
        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        UserSummaryResponse updated = userService.updateUser(id, request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updated));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request,
            HttpServletRequest httpRequest) {
        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        UserSummaryResponse updated = userService.updateUserStatus(id, request.getStatus(), adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", updated));
    }

    @PatchMapping("/users/{id}/roles")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> updateUserRoles(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRolesRequest request,
            HttpServletRequest httpRequest) {
        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        UserSummaryResponse updated = userService.updateUserRoles(id, request, adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("User roles updated successfully", updated));
    }

    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetUserPassword(
            @PathVariable Long id,
            @Valid @RequestBody AdminResetPasswordRequest request,
            HttpServletRequest httpRequest) {
        String adminUsername = SecurityUtils.getCurrentUsername().orElse("system_admin");
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        userService.resetUserPassword(id, request.getNewPassword(), adminUsername, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("User password has been reset successfully", null));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
