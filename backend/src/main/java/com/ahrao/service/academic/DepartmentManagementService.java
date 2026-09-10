package com.ahrao.service.academic;

import com.ahrao.dto.academic.CreateDepartmentRequest;
import com.ahrao.dto.academic.DepartmentDetailsResponse;
import com.ahrao.dto.academic.DepartmentSummaryResponse;
import com.ahrao.dto.academic.UpdateDepartmentRequest;
import com.ahrao.dto.common.PagedResponse;
import org.springframework.data.domain.Pageable;

public interface DepartmentManagementService {
    PagedResponse<DepartmentSummaryResponse> getDepartments(String search, String status, Pageable pageable);
    DepartmentDetailsResponse getDepartmentById(Long id);
    DepartmentSummaryResponse createDepartment(CreateDepartmentRequest request, String adminUsername, String ipAddress, String userAgent);
    DepartmentSummaryResponse updateDepartment(Long id, UpdateDepartmentRequest request, String adminUsername, String ipAddress, String userAgent);
    DepartmentSummaryResponse updateDepartmentStatus(Long id, String status, String adminUsername, String ipAddress, String userAgent);
    void deleteDepartment(Long id, String adminUsername, String ipAddress, String userAgent);
}
