package com.ahrao.service.resource;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.resource.*;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.ResourceStatus;
import com.ahrao.entity.resource.*;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.DepartmentRepository;
import com.ahrao.repository.academic.InstitutionRepository;
import com.ahrao.repository.academic.TimetableEntryRepository;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.resource.*;
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
public class ResourceManagementServiceImpl implements ResourceManagementService {

    private final ResourceRepository resourceRepository;
    private final ResourceCategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;
    private final InstitutionRepository institutionRepository;
    private final ClassroomRepository classroomRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final EquipmentRepository equipmentRepository;
    private final ResourceAllocationRepository allocationRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public ResourceManagementServiceImpl(ResourceRepository resourceRepository,
                                         ResourceCategoryRepository categoryRepository,
                                         DepartmentRepository departmentRepository,
                                         InstitutionRepository institutionRepository,
                                         ClassroomRepository classroomRepository,
                                         LaboratoryRepository laboratoryRepository,
                                         EquipmentRepository equipmentRepository,
                                         ResourceAllocationRepository allocationRepository,
                                         TimetableEntryRepository timetableEntryRepository,
                                         AuditLogRepository auditLogRepository,
                                         UserRepository userRepository) {
        this.resourceRepository = resourceRepository;
        this.categoryRepository = categoryRepository;
        this.departmentRepository = departmentRepository;
        this.institutionRepository = institutionRepository;
        this.classroomRepository = classroomRepository;
        this.laboratoryRepository = laboratoryRepository;
        this.equipmentRepository = equipmentRepository;
        this.allocationRepository = allocationRepository;
        this.timetableEntryRepository = timetableEntryRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ResourceSummaryResponse> getResources(String search, Long categoryId, Long departmentId,
                                                               ResourceStatus status, String location,
                                                               Integer minCapacity, Integer maxCapacity,
                                                               Pageable pageable) {
        Specification<Resource> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                Predicate codeMatch = cb.like(cb.lower(root.get("code")), pattern);
                Predicate locMatch = cb.like(cb.lower(root.get("location")), pattern);
                predicates.add(cb.or(nameMatch, codeMatch, locMatch));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (departmentId != null) {
                predicates.add(cb.equal(root.get("department").get("id"), departmentId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (location != null && !location.trim().isEmpty() && !"ALL".equalsIgnoreCase(location.trim())) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.trim().toLowerCase() + "%"));
            }
            if (minCapacity != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), minCapacity));
            }
            if (maxCapacity != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("capacity"), maxCapacity));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Resource> page = resourceRepository.findAll(spec, pageable);
        List<ResourceSummaryResponse> content = page.getContent().stream()
                .map(this::mapToSummary)
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
    public ResourceDetailsResponse getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));
        return mapToDetails(resource);
    }

    @Override
    public ResourceDetailsResponse createResource(CreateResourceRequest request, String adminUsername, String ip, String userAgent) {
        if (resourceRepository.existsByCode(request.getCode().trim())) {
            throw new ConflictException("A resource with code '" + request.getCode().trim() + "' already exists");
        }
        if (request.getCapacity() != null && request.getCapacity() <= 0) {
            throw new BadRequestException("Capacity must be greater than zero");
        }

        ResourceCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource category not found with ID: " + request.getCategoryId()));

        Institution institution = institutionRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Institution record not configured"));

        Department department = null;
        if (request.getDepartmentId() != null && request.getDepartmentId() > 0) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));
        }

        Resource resource = new Resource();
        resource.setInstitution(institution);
        resource.setCategory(category);
        resource.setDepartment(department);
        resource.setName(request.getName().trim());
        resource.setCode(request.getCode().trim().toUpperCase());
        resource.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        resource.setCapacity(request.getCapacity() != null ? request.getCapacity() : 60);
        resource.setLocation(request.getLocation() != null ? request.getLocation().trim() : null);
        resource.setStatus(request.getStatus() != null ? request.getStatus() : ResourceStatus.AVAILABLE);
        int qty = request.getQuantity() != null && request.getQuantity() > 0 ? request.getQuantity() : 1;
        resource.setQuantity(qty);
        resource.setAvailableQuantity(qty);

        Resource saved = resourceRepository.save(resource);
        logAudit(adminUsername, "RESOURCE_CREATED", "Resource", saved.getId(),
                null, "Created resource: " + saved.getCode() + " (" + saved.getName() + ")", ip, userAgent);

        return mapToDetails(saved);
    }

    @Override
    public ResourceDetailsResponse updateResource(Long id, UpdateResourceRequest request, String adminUsername, String ip, String userAgent) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));

        if (resourceRepository.existsByCodeAndIdNot(request.getCode().trim(), id)) {
            throw new ConflictException("Another resource with code '" + request.getCode().trim() + "' already exists");
        }
        if (request.getCapacity() != null && request.getCapacity() <= 0) {
            throw new BadRequestException("Capacity must be greater than zero");
        }

        ResourceCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource category not found with ID: " + request.getCategoryId()));

        Department department = null;
        if (request.getDepartmentId() != null && request.getDepartmentId() > 0) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));
        }

        String oldValue = "name=" + resource.getName() + ", code=" + resource.getCode() + ", status=" + resource.getStatus()
                + ", capacity=" + resource.getCapacity();

        resource.setName(request.getName().trim());
        resource.setCode(request.getCode().trim().toUpperCase());
        resource.setCategory(category);
        resource.setDepartment(department);
        resource.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        if (request.getCapacity() != null) {
            resource.setCapacity(request.getCapacity());
        }
        resource.setLocation(request.getLocation() != null ? request.getLocation().trim() : null);
        if (request.getStatus() != null) {
            resource.setStatus(request.getStatus());
        }
        if (request.getQuantity() != null && request.getQuantity() > 0) {
            resource.setQuantity(request.getQuantity());
            if (resource.getAvailableQuantity() > request.getQuantity()) {
                resource.setAvailableQuantity(request.getQuantity());
            }
        }

        Resource updated = resourceRepository.save(resource);
        String newValue = "name=" + updated.getName() + ", code=" + updated.getCode() + ", status=" + updated.getStatus()
                + ", capacity=" + updated.getCapacity();

        logAudit(adminUsername, "RESOURCE_UPDATED", "Resource", updated.getId(),
                oldValue, newValue, ip, userAgent);

        return mapToDetails(updated);
    }

    @Override
    public ResourceSummaryResponse changeStatus(Long id, ResourceStatus status, String adminUsername, String ip, String userAgent) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));

        ResourceStatus oldStatus = resource.getStatus();
        resource.setStatus(status);

        // Also sync child classroom / lab / equipment status if present
        classroomRepository.findByResourceId(id).ifPresent(c -> {
            c.setStatus(status.name());
            classroomRepository.save(c);
        });
        laboratoryRepository.findByResourceId(id).ifPresent(l -> {
            l.setStatus(status.name());
            laboratoryRepository.save(l);
        });
        equipmentRepository.findByResourceId(id).ifPresent(e -> {
            e.setStatus(status.name());
            equipmentRepository.save(e);
        });

        Resource updated = resourceRepository.save(resource);

        logAudit(adminUsername, "RESOURCE_STATUS_CHANGED", "Resource", updated.getId(),
                "status=" + oldStatus, "status=" + status, ip, userAgent);

        return mapToSummary(updated);
    }

    @Override
    public void deleteResource(Long id, String adminUsername, String ip, String userAgent) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + id));

        if (allocationRepository.existsByResourceId(id)) {
            throw new ConflictException("Cannot delete resource '" + resource.getCode()
                    + "' because it is referenced by existing allocation records. Please deactivate or set to MAINTENANCE instead.");
        }
        if (timetableEntryRepository.existsByResourceId(id)) {
            throw new ConflictException("Cannot delete resource '" + resource.getCode()
                    + "' because it is assigned to existing timetable entries. Please deactivate instead.");
        }

        classroomRepository.findByResourceId(id).ifPresent(classroomRepository::delete);
        laboratoryRepository.findByResourceId(id).ifPresent(laboratoryRepository::delete);
        equipmentRepository.findByResourceId(id).ifPresent(equipmentRepository::delete);

        resourceRepository.delete(resource);
        logAudit(adminUsername, "RESOURCE_DELETED", "Resource", id,
                "code=" + resource.getCode() + ", name=" + resource.getName(), null, ip, userAgent);
    }

    private ResourceSummaryResponse mapToSummary(Resource r) {
        ResourceSummaryResponse res = new ResourceSummaryResponse();
        res.setId(r.getId());
        res.setCode(r.getCode());
        res.setName(r.getName());
        if (r.getCategory() != null) {
            res.setCategoryId(r.getCategory().getId());
            res.setCategoryName(r.getCategory().getName());
            res.setResourceType(r.getCategory().getResourceType());
        }
        if (r.getDepartment() != null) {
            res.setDepartmentId(r.getDepartment().getId());
            res.setDepartmentCode(r.getDepartment().getCode());
            res.setDepartmentName(r.getDepartment().getName());
        }
        res.setCapacity(r.getCapacity());
        res.setLocation(r.getLocation());
        res.setStatus(r.getStatus());
        res.setQuantity(r.getQuantity());
        res.setAvailableQuantity(r.getAvailableQuantity());
        res.setCreatedAt(r.getCreatedAt());
        return res;
    }

    private ResourceDetailsResponse mapToDetails(Resource r) {
        ResourceDetailsResponse res = new ResourceDetailsResponse();
        res.setId(r.getId());
        res.setCode(r.getCode());
        res.setName(r.getName());
        res.setDescription(r.getDescription());
        if (r.getCategory() != null) {
            res.setCategoryId(r.getCategory().getId());
            res.setCategoryName(r.getCategory().getName());
            res.setResourceType(r.getCategory().getResourceType());
        }
        if (r.getDepartment() != null) {
            res.setDepartmentId(r.getDepartment().getId());
            res.setDepartmentCode(r.getDepartment().getCode());
            res.setDepartmentName(r.getDepartment().getName());
        }
        res.setCapacity(r.getCapacity());
        res.setLocation(r.getLocation());
        res.setStatus(r.getStatus());
        res.setQuantity(r.getQuantity());
        res.setAvailableQuantity(r.getAvailableQuantity());
        res.setCreatedAt(r.getCreatedAt());
        res.setUpdatedAt(r.getUpdatedAt());

        // Check child models
        classroomRepository.findByResourceId(r.getId()).ifPresent(c -> {
            ClassroomSummaryResponse cr = new ClassroomSummaryResponse();
            cr.setId(c.getId());
            cr.setResourceId(r.getId());
            cr.setResourceCode(r.getCode());
            cr.setResourceName(r.getName());
            cr.setBuilding(c.getBuilding());
            cr.setFloor(c.getFloor());
            cr.setRoomNumber(c.getRoomNumber());
            cr.setCapacity(c.getCapacity());
            cr.setRoomType(c.getRoomType());
            cr.setHasProjector(c.getHasProjector());
            cr.setHasAc(c.getHasAc());
            cr.setHasSmartBoard(c.getHasSmartBoard());
            cr.setStatus(c.getStatus());
            res.setClassroomDetails(cr);
        });

        laboratoryRepository.findByResourceId(r.getId()).ifPresent(l -> {
            LaboratorySummaryResponse lr = new LaboratorySummaryResponse();
            lr.setId(l.getId());
            lr.setResourceId(r.getId());
            lr.setResourceCode(r.getCode());
            lr.setResourceName(r.getName());
            if (r.getDepartment() != null) {
                lr.setDepartmentId(r.getDepartment().getId());
                lr.setDepartmentCode(r.getDepartment().getCode());
                lr.setDepartmentName(r.getDepartment().getName());
            }
            lr.setBuilding(l.getBuilding());
            lr.setFloor(l.getFloor());
            lr.setRoomNumber(l.getRoomNumber());
            lr.setCapacity(l.getCapacity());
            lr.setLabType(l.getLabType());
            lr.setComputerCount(l.getComputerCount());
            lr.setStatus(l.getStatus());
            res.setLaboratoryDetails(lr);
        });

        equipmentRepository.findByResourceId(r.getId()).ifPresent(e -> {
            EquipmentSummaryResponse er = new EquipmentSummaryResponse();
            er.setId(e.getId());
            er.setResourceId(r.getId());
            er.setResourceCode(r.getCode());
            er.setResourceName(r.getName());
            if (r.getDepartment() != null) {
                er.setDepartmentId(r.getDepartment().getId());
                er.setDepartmentCode(r.getDepartment().getCode());
                er.setDepartmentName(r.getDepartment().getName());
            }
            er.setSerialNumber(e.getSerialNumber());
            er.setManufacturer(e.getManufacturer());
            er.setModel(e.getModel());
            er.setPurchaseDate(e.getPurchaseDate());
            er.setWarrantyExpiry(e.getWarrantyExpiry());
            er.setConditionStatus(e.getConditionStatus());
            er.setQuantity(e.getQuantity());
            er.setStatus(e.getStatus());
            res.setEquipmentDetails(er);
        });

        res.setTotalAllocations(allocationRepository.findByResourceId(r.getId()).size());
        return res;
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
