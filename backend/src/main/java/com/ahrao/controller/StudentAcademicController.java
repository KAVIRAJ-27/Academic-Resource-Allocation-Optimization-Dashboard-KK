package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.student.academic.StudentAcademicResponse;
import com.ahrao.dto.student.academic.StudentSubjectDetailsDto;
import com.ahrao.dto.student.academic.StudentSubjectDto;
import com.ahrao.dto.student.academic.StudentTimetableEntryDto;
import com.ahrao.entity.enums.SubjectType;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.student.StudentAcademicService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/academics")
@PreAuthorize("hasRole('STUDENT')")
public class StudentAcademicController {

    private final StudentAcademicService studentAcademicService;

    public StudentAcademicController(StudentAcademicService studentAcademicService) {
        this.studentAcademicService = studentAcademicService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<StudentAcademicResponse>> getAcademicOverview() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated student context not found"));

        StudentAcademicResponse response = studentAcademicService.getAcademicOverview(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Student academic overview retrieved successfully", response));
    }

    @GetMapping("/subjects")
    public ResponseEntity<ApiResponse<PagedResponse<StudentSubjectDto>>> getSubjects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) SubjectType type,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "code") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated student context not found"));

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<StudentSubjectDto> response = studentAcademicService.getStudentSubjects(
                currentUserId, search, semester, type, status, pageable);

        return ResponseEntity.ok(ApiResponse.success("Student subjects retrieved successfully", response));
    }

    @GetMapping("/subjects/{subjectId}")
    public ResponseEntity<ApiResponse<StudentSubjectDetailsDto>> getSubjectDetails(@PathVariable Long subjectId) {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated student context not found"));

        StudentSubjectDetailsDto response = studentAcademicService.getSubjectDetails(currentUserId, subjectId);
        return ResponseEntity.ok(ApiResponse.success("Subject details retrieved successfully", response));
    }

    @GetMapping("/timetable")
    public ResponseEntity<ApiResponse<List<StudentTimetableEntryDto>>> getTimetable() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated student context not found"));

        List<StudentTimetableEntryDto> response = studentAcademicService.getStudentTimetable(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Student timetable retrieved successfully", response));
    }
}
