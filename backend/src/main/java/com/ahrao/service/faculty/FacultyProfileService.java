package com.ahrao.service.faculty;

import com.ahrao.dto.faculty.profile.FacultyProfileDto;
import com.ahrao.dto.faculty.profile.UpdateFacultyProfileRequest;

public interface FacultyProfileService {

    FacultyProfileDto getProfile(Long userId);

    FacultyProfileDto updateProfile(Long userId, UpdateFacultyProfileRequest request, String ipAddress, String userAgent);
}
