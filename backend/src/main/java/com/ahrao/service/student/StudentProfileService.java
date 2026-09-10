package com.ahrao.service.student;

import com.ahrao.dto.student.StudentProfileDto;
import com.ahrao.dto.student.StudentProfileUpdateRequest;

public interface StudentProfileService {
    StudentProfileDto getProfile(Long userId);
    StudentProfileDto updateProfile(Long userId, StudentProfileUpdateRequest request, String ipAddress, String userAgent);
}
