package com.ahrao.dto.user;

import com.ahrao.entity.enums.UserStatus;

import java.time.Instant;
import java.util.List;

public class UserSummaryResponse {

    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private UserStatus status;
    private List<String> roles;
    private List<String> permissions;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant lastLoginAt;

    public UserSummaryResponse() {
    }

    public UserSummaryResponse(
            Long id,
            String username,
            String email,
            String firstName,
            String lastName,
            String phone,
            UserStatus status,
            List<String> roles,
            List<String> permissions,
            Instant createdAt,
            Instant lastLoginAt) {
        this(id, username, email, firstName, lastName, phone, status, roles, permissions, createdAt, null, lastLoginAt);
    }

    public UserSummaryResponse(
            Long id,
            String username,
            String email,
            String firstName,
            String lastName,
            String phone,
            UserStatus status,
            List<String> roles,
            List<String> permissions,
            Instant createdAt,
            Instant updatedAt,
            Instant lastLoginAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.status = status;
        this.roles = roles;
        this.permissions = permissions;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lastLoginAt = lastLoginAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public List<String> getPermissions() {
        return permissions;
    }

    public void setPermissions(List<String> permissions) {
        this.permissions = permissions;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(Instant lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }
}
