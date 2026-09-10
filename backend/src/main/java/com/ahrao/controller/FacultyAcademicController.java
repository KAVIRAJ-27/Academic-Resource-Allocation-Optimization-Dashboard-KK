package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.faculty.academic.FacultyAcademicOverviewDto;
import com.ahrao.dto.faculty.academic.FacultyCourseDto;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.faculty.FacultyAcademicService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/faculty")
@PreAuthorize("hasRole('FACULTY')")
public class FacultyAcademicController {

    private final FacultyAcademicService facultyAcademicService;

    public FacultyAcademicController(FacultyAcademicService facultyAcademicService) {
        this.facultyAcademicService = facultyAcademicService;
    }

    @GetMapping("/academics")
    public ResponseEntity<ApiResponse<FacultyAcademicOverviewDto>> getAcademicOverview() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated faculty context not found"));

        FacultyAcademicOverviewDto overview = facultyAcademicService.getAcademicOverview(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Faculty academic overview retrieved successfully", overview));
    }

    @GetMapping({"/academics/courses", "/courses"})
    public ResponseEntity<ApiResponse<List<FacultyCourseDto>>> getAssignedCourses() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated faculty context not found"));

        List<FacultyCourseDto> courses = facultyAcademicService.getAssignedCourses(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Assigned academic courses retrieved successfully", courses));
    }
}
