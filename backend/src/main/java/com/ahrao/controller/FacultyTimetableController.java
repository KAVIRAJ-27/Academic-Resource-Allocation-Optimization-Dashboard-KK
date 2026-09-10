package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.faculty.academic.FacultyTimetableEntryDto;
import com.ahrao.dto.faculty.academic.FacultyTimetableResponseDto;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.faculty.FacultyTimetableService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faculty/timetable")
@PreAuthorize("hasRole('FACULTY')")
public class FacultyTimetableController {

    private final FacultyTimetableService facultyTimetableService;

    public FacultyTimetableController(FacultyTimetableService facultyTimetableService) {
        this.facultyTimetableService = facultyTimetableService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<FacultyTimetableResponseDto>> getTimetable(
            @RequestParam(required = false) String dayOfWeek,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long sectionId,
            @RequestParam(required = false, defaultValue = "false") Boolean todayOnly) {

        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated faculty context not found"));

        FacultyTimetableResponseDto response = facultyTimetableService.getTimetable(
                currentUserId, dayOfWeek, subjectId, sectionId, todayOnly);

        return ResponseEntity.ok(ApiResponse.success("Faculty timetable retrieved successfully", response));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<FacultyTimetableEntryDto>>> getTodayClasses() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated faculty context not found"));

        List<FacultyTimetableEntryDto> todayClasses = facultyTimetableService.getTodayClasses(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Today's timetable classes retrieved successfully", todayClasses));
    }
}
