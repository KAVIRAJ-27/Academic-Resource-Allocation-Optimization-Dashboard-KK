package com.ahrao.service;

import com.ahrao.dto.auth.CurrentUserResponse;
import com.ahrao.dto.auth.LoginRequest;
import com.ahrao.dto.auth.LoginResponse;
import com.ahrao.dto.auth.RegisterRequest;

public interface AuthService {

    LoginResponse login(LoginRequest request, String ipAddress, String userAgent);

    CurrentUserResponse getCurrentUser(String username);

    CurrentUserResponse register(RegisterRequest request, String ipAddress, String userAgent);

    void logout(String username, String ipAddress, String userAgent);
}
