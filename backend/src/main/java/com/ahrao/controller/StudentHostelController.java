package com.ahrao.controller;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.student.hostel.StudentHostelAllocationHistoryDto;
import com.ahrao.dto.student.hostel.StudentHostelResponse;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.security.SecurityUtils;
import com.ahrao.service.student.StudentHostelService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/student/hostel")
@PreAuthorize("hasRole('STUDENT')")
public class StudentHostelController {

    private final StudentHostelService studentHostelService;

    public StudentHostelController(StudentHostelService studentHostelService) {
        this.studentHostelService = studentHostelService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<StudentHostelResponse>> getStudentHostel() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated student context not found"));

        StudentHostelResponse response = studentHostelService.getStudentHostel(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Student hostel information retrieved successfully", response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<StudentHostelAllocationHistoryDto>>> getStudentHostelHistory() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authenticated student context not found"));

        List<StudentHostelAllocationHistoryDto> history = studentHostelService.getStudentHostelHistory(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Student hostel allocation history retrieved successfully", history));
    }
}
