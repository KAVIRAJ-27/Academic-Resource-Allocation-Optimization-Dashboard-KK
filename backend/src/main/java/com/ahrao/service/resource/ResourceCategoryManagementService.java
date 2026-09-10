package com.ahrao.service.resource;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.resource.CreateResourceCategoryRequest;
import com.ahrao.dto.resource.ResourceCategoryResponse;
import com.ahrao.dto.resource.UpdateResourceCategoryRequest;
import com.ahrao.entity.enums.ResourceType;
import org.springframework.data.domain.Pageable;

public interface ResourceCategoryManagementService {
    PagedResponse<ResourceCategoryResponse> getCategories(String search, String status, ResourceType resourceType, Pageable pageable);
    ResourceCategoryResponse getCategoryById(Long id);
    ResourceCategoryResponse createCategory(CreateResourceCategoryRequest request, String adminUsername, String ip, String userAgent);
    ResourceCategoryResponse updateCategory(Long id, UpdateResourceCategoryRequest request, String adminUsername, String ip, String userAgent);
    ResourceCategoryResponse changeStatus(Long id, String status, String adminUsername, String ip, String userAgent);
    void deleteCategory(Long id, String adminUsername, String ip, String userAgent);
}
