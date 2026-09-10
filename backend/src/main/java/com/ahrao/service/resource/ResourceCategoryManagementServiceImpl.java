package com.ahrao.service.resource;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.resource.CreateResourceCategoryRequest;
import com.ahrao.dto.resource.ResourceCategoryResponse;
import com.ahrao.dto.resource.UpdateResourceCategoryRequest;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.ResourceType;
import com.ahrao.entity.resource.ResourceCategory;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.resource.ResourceCategoryRepository;
import com.ahrao.repository.resource.ResourceRepository;
import com.ahrao.repository.user.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ResourceCategoryManagementServiceImpl implements ResourceCategoryManagementService {

    private final ResourceCategoryRepository categoryRepository;
    private final ResourceRepository resourceRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public ResourceCategoryManagementServiceImpl(ResourceCategoryRepository categoryRepository,
                                                 ResourceRepository resourceRepository,
                                                 AuditLogRepository auditLogRepository,
                                                 UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.resourceRepository = resourceRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ResourceCategoryResponse> getCategories(String search, String status, ResourceType resourceType, Pageable pageable) {
        Specification<ResourceCategory> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), pattern);
                predicates.add(cb.or(nameMatch, descMatch));
            }
            if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status.trim())) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }
            if (resourceType != null) {
                predicates.add(cb.equal(root.get("resourceType"), resourceType));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ResourceCategory> page = categoryRepository.findAll(spec, pageable);
        List<ResourceCategoryResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ResourceCategoryResponse getCategoryById(Long id) {
        ResourceCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource category not found with ID: " + id));
        return mapToResponse(category);
    }

    @Override
    public ResourceCategoryResponse createCategory(CreateResourceCategoryRequest request, String adminUsername, String ip, String userAgent) {
        if (categoryRepository.existsByName(request.getName().trim())) {
            throw new ConflictException("A resource category with name '" + request.getName().trim() + "' already exists");
        }

        ResourceCategory category = new ResourceCategory();
        category.setName(request.getName().trim());
        category.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        category.setResourceType(request.getResourceType());
        category.setStatus(request.getStatus() != null ? request.getStatus().trim().toUpperCase() : "ACTIVE");

        ResourceCategory saved = categoryRepository.save(category);
        logAudit(adminUsername, "RESOURCE_CATEGORY_CREATED", "ResourceCategory", saved.getId(),
                null, "Created category: " + saved.getName() + " (" + saved.getResourceType() + ")", ip, userAgent);

        return mapToResponse(saved);
    }

    @Override
    public ResourceCategoryResponse updateCategory(Long id, UpdateResourceCategoryRequest request, String adminUsername, String ip, String userAgent) {
        ResourceCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource category not found with ID: " + id));

        if (categoryRepository.existsByNameAndIdNot(request.getName().trim(), id)) {
            throw new ConflictException("Another resource category with name '" + request.getName().trim() + "' already exists");
        }

        String oldValue = "name=" + category.getName() + ", type=" + category.getResourceType() + ", status=" + category.getStatus();

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        category.setResourceType(request.getResourceType());
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            category.setStatus(request.getStatus().trim().toUpperCase());
        }

        ResourceCategory updated = categoryRepository.save(category);
        String newValue = "name=" + updated.getName() + ", type=" + updated.getResourceType() + ", status=" + updated.getStatus();

        logAudit(adminUsername, "RESOURCE_CATEGORY_UPDATED", "ResourceCategory", updated.getId(),
                oldValue, newValue, ip, userAgent);

        return mapToResponse(updated);
    }

    @Override
    public ResourceCategoryResponse changeStatus(Long id, String status, String adminUsername, String ip, String userAgent) {
        ResourceCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource category not found with ID: " + id));

        String oldStatus = category.getStatus();
        String newStatus = status.trim().toUpperCase();
        category.setStatus(newStatus);
        ResourceCategory updated = categoryRepository.save(category);

        logAudit(adminUsername, "RESOURCE_CATEGORY_STATUS_CHANGED", "ResourceCategory", updated.getId(),
                "status=" + oldStatus, "status=" + newStatus, ip, userAgent);

        return mapToResponse(updated);
    }

    @Override
    public void deleteCategory(Long id, String adminUsername, String ip, String userAgent) {
        ResourceCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource category not found with ID: " + id));

        long count = resourceRepository.countByCategoryId(id);
        if (count > 0) {
            throw new ConflictException("Cannot delete resource category '" + category.getName() + "' because "
                    + count + " resource(s) belong to it. Please deactivate the category or reassign its resources first.");
        }

        categoryRepository.delete(category);
        logAudit(adminUsername, "RESOURCE_CATEGORY_DELETED", "ResourceCategory", id,
                "name=" + category.getName(), null, ip, userAgent);
    }

    private ResourceCategoryResponse mapToResponse(ResourceCategory category) {
        long count = resourceRepository.countByCategoryId(category.getId());
        return new ResourceCategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getResourceType(),
                category.getStatus(),
                count
        );
    }

    private void logAudit(String adminUsername, String action, String entityType, Long entityId,
                          String oldValue, String newValue, String ipAddress, String userAgent) {
        if (adminUsername == null) return;
        AuditLog log = new AuditLog();
        userRepository.findByUsername(adminUsername).ifPresent(log::setUser);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        log.setCreatedAt(Instant.now());
        auditLogRepository.save(log);
    }
}
