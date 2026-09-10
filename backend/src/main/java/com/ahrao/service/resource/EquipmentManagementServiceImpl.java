package com.ahrao.service.resource;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.resource.CreateEquipmentRequest;
import com.ahrao.dto.resource.EquipmentDetailsResponse;
import com.ahrao.dto.resource.EquipmentSummaryResponse;
import com.ahrao.dto.resource.UpdateEquipmentRequest;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.ResourceStatus;
import com.ahrao.entity.enums.ResourceType;
import com.ahrao.entity.resource.Equipment;
import com.ahrao.entity.resource.Resource;
import com.ahrao.entity.resource.ResourceCategory;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.DepartmentRepository;
import com.ahrao.repository.academic.InstitutionRepository;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.resource.EquipmentRepository;
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
public class EquipmentManagementServiceImpl implements EquipmentManagementService {

    private final EquipmentRepository equipmentRepository;
    private final ResourceRepository resourceRepository;
    private final ResourceCategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;
    private final InstitutionRepository institutionRepository;
    private final ResourceAllocationRepository allocationRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public EquipmentManagementServiceImpl(EquipmentRepository equipmentRepository,
                                         ResourceRepository resourceRepository,
                                         ResourceCategoryRepository categoryRepository,
                                         DepartmentRepository departmentRepository,
                                         InstitutionRepository institutionRepository,
                                         ResourceAllocationRepository allocationRepository,
                                         AuditLogRepository auditLogRepository,
                                         UserRepository userRepository) {
        this.equipmentRepository = equipmentRepository;
        this.resourceRepository = resourceRepository;
        this.categoryRepository = categoryRepository;
        this.departmentRepository = departmentRepository;
        this.institutionRepository = institutionRepository;
        this.allocationRepository = allocationRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<EquipmentSummaryResponse> getEquipment(String search, Long departmentId, String conditionStatus, String status, Pageable pageable) {
        Specification<Equipment> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate serialMatch = cb.like(cb.lower(root.get("serialNumber")), pattern);
                Predicate modelMatch = cb.like(cb.lower(root.get("model")), pattern);
                Predicate mfgMatch = cb.like(cb.lower(root.get("manufacturer")), pattern);
                Predicate resMatch = cb.like(cb.lower(root.get("resource").get("name")), pattern);
                predicates.add(cb.or(serialMatch, modelMatch, mfgMatch, resMatch));
            }
            if (departmentId != null) {
                predicates.add(cb.equal(root.get("resource").get("department").get("id"), departmentId));
            }
            if (conditionStatus != null && !conditionStatus.trim().isEmpty() && !"ALL".equalsIgnoreCase(conditionStatus.trim())) {
                predicates.add(cb.equal(cb.upper(root.get("conditionStatus")), conditionStatus.trim().toUpperCase()));
            }
            if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status.trim())) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Equipment> page = equipmentRepository.findAll(spec, pageable);
        List<EquipmentSummaryResponse> content = page.getContent().stream()
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
    public EquipmentDetailsResponse getEquipmentById(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + id));
        return mapToDetails(equipment);
    }

    @Override
    public EquipmentDetailsResponse createEquipment(CreateEquipmentRequest request, String adminUsername, String ip, String userAgent) {
        if (request.getSerialNumber() == null || request.getSerialNumber().trim().isEmpty()) {
            throw new BadRequestException("Serial number is required");
        }
        if (equipmentRepository.existsBySerialNumber(request.getSerialNumber().trim())) {
            throw new ConflictException("Equipment with serial number '" + request.getSerialNumber().trim() + "' already exists");
        }
        if (request.getQuantity() == null || request.getQuantity() < 1) {
            throw new BadRequestException("Quantity must be at least 1");
        }

        Resource resource;
        if (request.getResourceId() != null && request.getResourceId() > 0) {
            resource = resourceRepository.findById(request.getResourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + request.getResourceId()));
        } else {
            // Auto create Resource
            Institution institution = institutionRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Institution not configured"));

            ResourceCategory category = categoryRepository.findAll().stream()
                    .filter(c -> c.getResourceType() == ResourceType.EQUIPMENT)
                    .findFirst()
                    .orElseGet(() -> {
                        ResourceCategory newCat = new ResourceCategory();
                        newCat.setName("Audio-Visual Equipment");
                        newCat.setResourceType(ResourceType.EQUIPMENT);
                        newCat.setDescription("Smart educational equipment and laboratory instruments");
                        newCat.setStatus("ACTIVE");
                        return categoryRepository.save(newCat);
                    });

            Department department = null;
            if (request.getDepartmentId() != null && request.getDepartmentId() > 0) {
                department = departmentRepository.findById(request.getDepartmentId())
                        .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));
            }

            String code = request.getCode() != null && !request.getCode().trim().isEmpty()
                    ? request.getCode().trim().toUpperCase()
                    : "EQ-" + request.getSerialNumber().trim().toUpperCase();

            if (resourceRepository.existsByCode(code)) {
                code = code + "-" + System.currentTimeMillis() % 10000;
            }

            String name = request.getName() != null && !request.getName().trim().isEmpty()
                    ? request.getName().trim()
                    : (request.getManufacturer() != null ? request.getManufacturer() + " " : "") + (request.getModel() != null ? request.getModel() : "Equipment");

            resource = new Resource();
            resource.setInstitution(institution);
            resource.setCategory(category);
            resource.setDepartment(department);
            resource.setName(name);
            resource.setCode(code);
            resource.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
            resource.setCapacity(request.getQuantity());
            resource.setStatus(request.getStatus() != null ? ResourceStatus.valueOf(request.getStatus().trim().toUpperCase()) : ResourceStatus.AVAILABLE);
            resource.setQuantity(request.getQuantity());
            resource.setAvailableQuantity(request.getQuantity());

            resource = resourceRepository.save(resource);
        }

        Equipment equipment = new Equipment();
        equipment.setResource(resource);
        equipment.setSerialNumber(request.getSerialNumber().trim());
        equipment.setManufacturer(request.getManufacturer() != null ? request.getManufacturer().trim() : null);
        equipment.setModel(request.getModel() != null ? request.getModel().trim() : null);
        equipment.setPurchaseDate(request.getPurchaseDate());
        equipment.setWarrantyExpiry(request.getWarrantyExpiry());
        equipment.setConditionStatus(request.getConditionStatus() != null ? request.getConditionStatus().trim().toUpperCase() : "GOOD");
        equipment.setQuantity(request.getQuantity());
        equipment.setStatus(request.getStatus() != null ? request.getStatus().trim().toUpperCase() : "AVAILABLE");

        Equipment saved = equipmentRepository.save(equipment);

        logAudit(adminUsername, "EQUIPMENT_CREATED", "Equipment", saved.getId(),
                null, "Created equipment: SN=" + saved.getSerialNumber() + " (" + saved.getManufacturer() + " " + saved.getModel() + ")", ip, userAgent);

        return mapToDetails(saved);
    }

    @Override
    public EquipmentDetailsResponse updateEquipment(Long id, UpdateEquipmentRequest request, String adminUsername, String ip, String userAgent) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + id));

        if (request.getSerialNumber() == null || request.getSerialNumber().trim().isEmpty()) {
            throw new BadRequestException("Serial number is required");
        }
        if (equipmentRepository.existsBySerialNumberAndIdNot(request.getSerialNumber().trim(), id)) {
            throw new ConflictException("Another equipment with serial number '" + request.getSerialNumber().trim() + "' already exists");
        }
        if (request.getQuantity() != null && request.getQuantity() < 1) {
            throw new BadRequestException("Quantity must be at least 1");
        }

        String oldValue = "SN=" + equipment.getSerialNumber() + ", condition=" + equipment.getConditionStatus()
                + ", status=" + equipment.getStatus() + ", qty=" + equipment.getQuantity();

        equipment.setSerialNumber(request.getSerialNumber().trim());
        equipment.setManufacturer(request.getManufacturer() != null ? request.getManufacturer().trim() : null);
        equipment.setModel(request.getModel() != null ? request.getModel().trim() : null);
        equipment.setPurchaseDate(request.getPurchaseDate());
        equipment.setWarrantyExpiry(request.getWarrantyExpiry());
        if (request.getConditionStatus() != null && !request.getConditionStatus().trim().isEmpty()) {
            equipment.setConditionStatus(request.getConditionStatus().trim().toUpperCase());
        }
        if (request.getQuantity() != null) {
            equipment.setQuantity(request.getQuantity());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            equipment.setStatus(request.getStatus().trim().toUpperCase());
        }

        // Sync parent Resource
        Resource res = equipment.getResource();
        if (res != null) {
            if (request.getName() != null && !request.getName().trim().isEmpty()) {
                res.setName(request.getName().trim());
            }
            if (request.getCode() != null && !request.getCode().trim().isEmpty()) {
                String code = request.getCode().trim().toUpperCase();
                if (resourceRepository.existsByCodeAndIdNot(code, res.getId())) {
                    throw new ConflictException("Another resource with code '" + code + "' already exists");
                }
                res.setCode(code);
            }
            if (request.getDepartmentId() != null) {
                if (request.getDepartmentId() > 0) {
                    Department dept = departmentRepository.findById(request.getDepartmentId())
                            .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));
                    res.setDepartment(dept);
                } else {
                    res.setDepartment(null);
                }
            }
            if (request.getQuantity() != null) {
                res.setQuantity(request.getQuantity());
            }
            if (request.getDescription() != null) res.setDescription(request.getDescription().trim());
            if (request.getStatus() != null) {
                try {
                    res.setStatus(ResourceStatus.valueOf(request.getStatus().trim().toUpperCase()));
                } catch (Exception ignored) {}
            }
            resourceRepository.save(res);
        }

        Equipment updated = equipmentRepository.save(equipment);
        String newValue = "SN=" + updated.getSerialNumber() + ", condition=" + updated.getConditionStatus()
                + ", status=" + updated.getStatus() + ", qty=" + updated.getQuantity();

        logAudit(adminUsername, "EQUIPMENT_UPDATED", "Equipment", updated.getId(),
                oldValue, newValue, ip, userAgent);

        return mapToDetails(updated);
    }

    @Override
    public EquipmentSummaryResponse changeStatus(Long id, String status, String adminUsername, String ip, String userAgent) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + id));

        String oldStatus = equipment.getStatus();
        String newStatus = status.trim().toUpperCase();
        equipment.setStatus(newStatus);

        Resource res = equipment.getResource();
        if (res != null) {
            try {
                res.setStatus(ResourceStatus.valueOf(newStatus));
                resourceRepository.save(res);
            } catch (Exception ignored) {}
        }

        Equipment updated = equipmentRepository.save(equipment);

        logAudit(adminUsername, "EQUIPMENT_STATUS_CHANGED", "Equipment", updated.getId(),
                "status=" + oldStatus, "status=" + newStatus, ip, userAgent);

        return mapToSummary(updated);
    }

    @Override
    public void deleteEquipment(Long id, String adminUsername, String ip, String userAgent) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + id));

        Resource resource = equipment.getResource();
        if (resource != null) {
            if (allocationRepository.existsByResourceId(resource.getId())) {
                throw new ConflictException("Cannot delete equipment '" + equipment.getSerialNumber()
                        + "' because its underlying resource is referenced by existing allocations. Deactivate instead.");
            }
            equipmentRepository.delete(equipment);
            resourceRepository.delete(resource);
        } else {
            equipmentRepository.delete(equipment);
        }

        logAudit(adminUsername, "EQUIPMENT_DELETED", "Equipment", id,
                "SN=" + equipment.getSerialNumber(), null, ip, userAgent);
    }

    private EquipmentSummaryResponse mapToSummary(Equipment e) {
        EquipmentSummaryResponse res = new EquipmentSummaryResponse();
        res.setId(e.getId());
        if (e.getResource() != null) {
            Resource r = e.getResource();
            res.setResourceId(r.getId());
            res.setResourceCode(r.getCode());
            res.setResourceName(r.getName());
            if (r.getDepartment() != null) {
                res.setDepartmentId(r.getDepartment().getId());
                res.setDepartmentCode(r.getDepartment().getCode());
                res.setDepartmentName(r.getDepartment().getName());
            }
        }
        res.setSerialNumber(e.getSerialNumber());
        res.setManufacturer(e.getManufacturer());
        res.setModel(e.getModel());
        res.setPurchaseDate(e.getPurchaseDate());
        res.setWarrantyExpiry(e.getWarrantyExpiry());
        res.setConditionStatus(e.getConditionStatus());
        res.setQuantity(e.getQuantity());
        res.setStatus(e.getStatus());
        return res;
    }

    private EquipmentDetailsResponse mapToDetails(Equipment e) {
        EquipmentDetailsResponse res = new EquipmentDetailsResponse();
        res.setId(e.getId());
        if (e.getResource() != null) {
            Resource r = e.getResource();
            res.setResourceId(r.getId());
            res.setResourceCode(r.getCode());
            res.setResourceName(r.getName());
            res.setResourceDescription(r.getDescription());
            res.setResourceStatus(r.getStatus());
            res.setCreatedAt(r.getCreatedAt());
            res.setUpdatedAt(r.getUpdatedAt());
            if (r.getDepartment() != null) {
                res.setDepartmentId(r.getDepartment().getId());
                res.setDepartmentCode(r.getDepartment().getCode());
                res.setDepartmentName(r.getDepartment().getName());
            }
            res.setTotalAllocations(allocationRepository.findByResourceId(r.getId()).size());
        }
        res.setSerialNumber(e.getSerialNumber());
        res.setManufacturer(e.getManufacturer());
        res.setModel(e.getModel());
        res.setPurchaseDate(e.getPurchaseDate());
        res.setWarrantyExpiry(e.getWarrantyExpiry());
        res.setConditionStatus(e.getConditionStatus());
        res.setQuantity(e.getQuantity());
        res.setStatus(e.getStatus());
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
