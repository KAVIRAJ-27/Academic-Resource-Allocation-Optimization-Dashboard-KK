package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.auth.ChangePasswordRequest;
import com.ahrao.dto.auth.CurrentUserResponse;
import com.ahrao.dto.auth.LoginRequest;
import com.ahrao.dto.auth.LoginResponse;
import com.ahrao.dto.auth.RegisterRequest;
import com.ahrao.dto.auth.UpdateProfileRequest;
import com.ahrao.dto.user.UserSummaryResponse;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.AuthService;
import com.ahrao.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {

        String ipAddress = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");

        LoginResponse response = authService.login(loginRequest, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<CurrentUserResponse>> getCurrentUser() {
        String username = SecurityUtils.getCurrentUsername()
                .orElseThrow(() -> new com.ahrao.exception.UnauthorizedException("No authenticated principal present"));

        CurrentUserResponse response = authService.getCurrentUser(username);
        return ResponseEntity.ok(ApiResponse.success("Current user profile retrieved", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<CurrentUserResponse>> register(
            @Valid @RequestBody RegisterRequest registerRequest,
            HttpServletRequest request) {

        String ipAddress = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");

        CurrentUserResponse response = authService.register(registerRequest, ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            HttpServletRequest httpRequest) {
        String username = SecurityUtils.getCurrentUsername()
                .orElseThrow(() -> new com.ahrao.exception.UnauthorizedException("Authentication required"));

        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        userService.changePassword(username, request, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            HttpServletRequest httpRequest) {
        String username = SecurityUtils.getCurrentUsername()
                .orElseThrow(() -> new com.ahrao.exception.UnauthorizedException("Authentication required"));

        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        UserSummaryResponse response = userService.updateProfile(username, request, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        String username = SecurityUtils.getCurrentUsername().orElse(null);
        String ipAddress = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");

        if (username != null) {
            authService.logout(username, ipAddress, userAgent);
        }

        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
