package com.ahrao.service.resource;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.resource.CreateLaboratoryRequest;
import com.ahrao.dto.resource.LaboratoryDetailsResponse;
import com.ahrao.dto.resource.LaboratorySummaryResponse;
import com.ahrao.dto.resource.UpdateLaboratoryRequest;
import org.springframework.data.domain.Pageable;

public interface LaboratoryManagementService {
    PagedResponse<LaboratorySummaryResponse> getLaboratories(String search, Long departmentId, String labType, String status, Pageable pageable);
    LaboratoryDetailsResponse getLaboratoryById(Long id);
    LaboratoryDetailsResponse createLaboratory(CreateLaboratoryRequest request, String adminUsername, String ip, String userAgent);
    LaboratoryDetailsResponse updateLaboratory(Long id, UpdateLaboratoryRequest request, String adminUsername, String ip, String userAgent);
    LaboratorySummaryResponse changeStatus(Long id, String status, String adminUsername, String ip, String userAgent);
    void deleteLaboratory(Long id, String adminUsername, String ip, String userAgent);
}
