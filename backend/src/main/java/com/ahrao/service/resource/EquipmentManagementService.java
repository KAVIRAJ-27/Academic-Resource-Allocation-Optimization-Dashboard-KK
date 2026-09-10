package com.ahrao.service.resource;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.resource.CreateEquipmentRequest;
import com.ahrao.dto.resource.EquipmentDetailsResponse;
import com.ahrao.dto.resource.EquipmentSummaryResponse;
import com.ahrao.dto.resource.UpdateEquipmentRequest;
import org.springframework.data.domain.Pageable;

public interface EquipmentManagementService {
    PagedResponse<EquipmentSummaryResponse> getEquipment(String search, Long departmentId, String conditionStatus, String status, Pageable pageable);
    EquipmentDetailsResponse getEquipmentById(Long id);
    EquipmentDetailsResponse createEquipment(CreateEquipmentRequest request, String adminUsername, String ip, String userAgent);
    EquipmentDetailsResponse updateEquipment(Long id, UpdateEquipmentRequest request, String adminUsername, String ip, String userAgent);
    EquipmentSummaryResponse changeStatus(Long id, String status, String adminUsername, String ip, String userAgent);
    void deleteEquipment(Long id, String adminUsername, String ip, String userAgent);
}
