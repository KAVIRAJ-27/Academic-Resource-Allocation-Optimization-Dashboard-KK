package com.ahrao.service;

import com.ahrao.dto.auth.ChangePasswordRequest;
import com.ahrao.dto.auth.UpdateProfileRequest;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.user.CreateUserRequest;
import com.ahrao.dto.user.UpdateUserRequest;
import com.ahrao.dto.user.UpdateUserRolesRequest;
import com.ahrao.dto.user.UserSummaryResponse;
import com.ahrao.entity.enums.UserStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {

    PagedResponse<UserSummaryResponse> getUsers(String search, String role, UserStatus status, Pageable pageable);

    List<UserSummaryResponse> getAllUsers(String search, String role, UserStatus status);

    UserSummaryResponse getUserById(Long id);

    UserSummaryResponse createUser(CreateUserRequest request, String adminUsername, String ipAddress, String userAgent);

    UserSummaryResponse updateUser(Long id, UpdateUserRequest request, String adminUsername, String ipAddress, String userAgent);

    UserSummaryResponse updateUserStatus(Long id, UserStatus newStatus, String adminUsername, String ipAddress, String userAgent);

    UserSummaryResponse updateUserRoles(Long id, UpdateUserRolesRequest request, String adminUsername, String ipAddress, String userAgent);

    void resetUserPassword(Long id, String newPassword, String adminUsername, String ipAddress, String userAgent);

    void changePassword(String username, ChangePasswordRequest request, String ipAddress, String userAgent);

    UserSummaryResponse updateProfile(String username, UpdateProfileRequest request, String ipAddress, String userAgent);
}
