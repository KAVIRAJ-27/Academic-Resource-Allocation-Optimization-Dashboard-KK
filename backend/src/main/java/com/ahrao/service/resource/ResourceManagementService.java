package com.ahrao.service.resource;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.resource.CreateResourceRequest;
import com.ahrao.dto.resource.ResourceDetailsResponse;
import com.ahrao.dto.resource.ResourceSummaryResponse;
import com.ahrao.dto.resource.UpdateResourceRequest;
import com.ahrao.entity.enums.ResourceStatus;
import org.springframework.data.domain.Pageable;

public interface ResourceManagementService {
    PagedResponse<ResourceSummaryResponse> getResources(String search, Long categoryId, Long departmentId,
                                                        ResourceStatus status, String location,
                                                        Integer minCapacity, Integer maxCapacity,
                                                        Pageable pageable);
    ResourceDetailsResponse getResourceById(Long id);
    ResourceDetailsResponse createResource(CreateResourceRequest request, String adminUsername, String ip, String userAgent);
    ResourceDetailsResponse updateResource(Long id, UpdateResourceRequest request, String adminUsername, String ip, String userAgent);
    ResourceSummaryResponse changeStatus(Long id, ResourceStatus status, String adminUsername, String ip, String userAgent);
    void deleteResource(Long id, String adminUsername, String ip, String userAgent);
}
