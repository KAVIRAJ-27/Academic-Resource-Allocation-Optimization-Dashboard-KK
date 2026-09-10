package com.ahrao.controller.warden;

import com.ahrao.dto.ApiResponse;
import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.WardenStudentSearchDto;
import com.ahrao.service.warden.WardenStudentService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/warden/students")
@PreAuthorize("hasRole('WARDEN')")
public class WardenStudentController {

    private final WardenStudentService wardenStudentService;

    public WardenStudentController(WardenStudentService wardenStudentService) {
        this.wardenStudentService = wardenStudentService;
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PagedResponse<WardenStudentSearchDto>>> searchStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long programId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "registerNumber") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<WardenStudentSearchDto> response = wardenStudentService.searchStudents(
                search, departmentId, programId, pageable);

        return ResponseEntity.ok(ApiResponse.success("Eligible students retrieved successfully", response));
    }
}
