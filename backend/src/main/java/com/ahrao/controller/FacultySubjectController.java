package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.faculty.academic.FacultySubjectDetailsDto;
import com.ahrao.dto.faculty.academic.FacultySubjectDto;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.faculty.FacultySubjectService;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/faculty/subjects")
@PreAuthorize("hasRole('FACULTY')")
public class FacultySubjectController {

    private final FacultySubjectService facultySubjectService;

    public FacultySubjectController(FacultySubjectService facultySubjectService) {
        this.facultySubjectService = facultySubjectService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<FacultySubjectDto>>> getAssignedSubjects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long programId,
            @RequestParam(required = false) Integer semester,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated faculty context not found"));

        PagedResponse<FacultySubjectDto> response = facultySubjectService.getAssignedSubjects(
                currentUserId, search, programId, semester, PageRequest.of(page, size));

        return ResponseEntity.ok(ApiResponse.success("Assigned subjects retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FacultySubjectDetailsDto>> getSubjectDetails(
            @PathVariable("id") Long subjectId) {

        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated faculty context not found"));

        FacultySubjectDetailsDto details = facultySubjectService.getSubjectDetails(currentUserId, subjectId);
        return ResponseEntity.ok(ApiResponse.success("Subject details retrieved successfully", details));
    }
}
