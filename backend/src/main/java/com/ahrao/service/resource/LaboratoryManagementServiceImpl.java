package com.ahrao.service.resource;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.resource.CreateLaboratoryRequest;
import com.ahrao.dto.resource.LaboratoryDetailsResponse;
import com.ahrao.dto.resource.LaboratorySummaryResponse;
import com.ahrao.dto.resource.UpdateLaboratoryRequest;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.ResourceStatus;
import com.ahrao.entity.enums.ResourceType;
import com.ahrao.entity.resource.Laboratory;
import com.ahrao.entity.resource.Resource;
import com.ahrao.entity.resource.ResourceCategory;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.DepartmentRepository;
import com.ahrao.repository.academic.InstitutionRepository;
import com.ahrao.repository.academic.TimetableEntryRepository;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.resource.LaboratoryRepository;
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
public class LaboratoryManagementServiceImpl implements LaboratoryManagementService {

    private final LaboratoryRepository laboratoryRepository;
    private final ResourceRepository resourceRepository;
    private final ResourceCategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;
    private final InstitutionRepository institutionRepository;
    private final ResourceAllocationRepository allocationRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public LaboratoryManagementServiceImpl(LaboratoryRepository laboratoryRepository,
                                          ResourceRepository resourceRepository,
                                          ResourceCategoryRepository categoryRepository,
                                          DepartmentRepository departmentRepository,
                                          InstitutionRepository institutionRepository,
                                          ResourceAllocationRepository allocationRepository,
                                          TimetableEntryRepository timetableEntryRepository,
                                         AuditLogRepository auditLogRepository,
                                         UserRepository userRepository) {
        this.laboratoryRepository = laboratoryRepository;
        this.resourceRepository = resourceRepository;
        this.categoryRepository = categoryRepository;
        this.departmentRepository = departmentRepository;
        this.institutionRepository = institutionRepository;
        this.allocationRepository = allocationRepository;
        this.timetableEntryRepository = timetableEntryRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<LaboratorySummaryResponse> getLaboratories(String search, Long departmentId, String labType, String status, Pageable pageable) {
        Specification<Laboratory> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate roomMatch = cb.like(cb.lower(root.get("roomNumber")), pattern);
                Predicate bldgMatch = cb.like(cb.lower(root.get("building")), pattern);
                Predicate resMatch = cb.like(cb.lower(root.get("resource").get("name")), pattern);
                Predicate codeMatch = cb.like(cb.lower(root.get("resource").get("code")), pattern);
                predicates.add(cb.or(roomMatch, bldgMatch, resMatch, codeMatch));
            }
            if (departmentId != null) {
                predicates.add(cb.equal(root.get("resource").get("department").get("id"), departmentId));
            }
            if (labType != null && !labType.trim().isEmpty() && !"ALL".equalsIgnoreCase(labType.trim())) {
                predicates.add(cb.equal(cb.upper(root.get("labType")), labType.trim().toUpperCase()));
            }
            if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status.trim())) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Laboratory> page = laboratoryRepository.findAll(spec, pageable);
        List<LaboratorySummaryResponse> content = page.getContent().stream()
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
    public LaboratoryDetailsResponse getLaboratoryById(Long id) {
        Laboratory laboratory = laboratoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laboratory not found with ID: " + id));
        return mapToDetails(laboratory);
    }

    @Override
    public LaboratoryDetailsResponse createLaboratory(CreateLaboratoryRequest request, String adminUsername, String ip, String userAgent) {
        if (request.getCapacity() == null || request.getCapacity() <= 0) {
            throw new BadRequestException("Capacity must be greater than zero");
        }
        if (request.getComputerCount() != null && request.getComputerCount() < 0) {
            throw new BadRequestException("Computer count cannot be negative");
        }
        if (laboratoryRepository.existsByBuildingAndRoomNumber(request.getBuilding().trim(), request.getRoomNumber().trim())) {
            throw new ConflictException("A laboratory with room number '" + request.getRoomNumber().trim()
                    + "' already exists in building '" + request.getBuilding().trim() + "'");
        }

        Department department = null;
        if (request.getDepartmentId() != null && request.getDepartmentId() > 0) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));
        }

        String code = request.getCode() != null && !request.getCode().trim().isEmpty()
                ? request.getCode().trim().toUpperCase()
                : (request.getBuilding().trim() + "-" + request.getRoomNumber().trim()).toUpperCase().replace(" ", "");

        if (resourceRepository.existsByCode(code)) {
            code = code + "-" + System.currentTimeMillis() % 10000;
        }

        String name = request.getName() != null && !request.getName().trim().isEmpty()
                ? request.getName().trim()
                : request.getBuilding().trim() + " " + request.getRoomNumber().trim() + " Lab";

        Institution institution = institutionRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Institution not configured"));

        // Find or create LABORATORY category
        ResourceCategory category = categoryRepository.findAll().stream()
                .filter(c -> c.getResourceType() == ResourceType.LABORATORY)
                .findFirst()
                .orElseGet(() -> {
                    ResourceCategory newCat = new ResourceCategory();
                    newCat.setName("Laboratories");
                    newCat.setResourceType(ResourceType.LABORATORY);
                    newCat.setDescription("Experimental and computational laboratories");
                    newCat.setStatus("ACTIVE");
                    return categoryRepository.save(newCat);
                });

        Resource resource = new Resource();
        resource.setInstitution(institution);
        resource.setCategory(category);
        resource.setDepartment(department);
        resource.setName(name);
        resource.setCode(code);
        resource.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getBuilding().trim() + ", Floor " + request.getFloor().trim());
        resource.setStatus(request.getStatus() != null ? ResourceStatus.valueOf(request.getStatus().trim().toUpperCase()) : ResourceStatus.AVAILABLE);
        resource.setQuantity(1);
        resource.setAvailableQuantity(1);

        Resource savedResource = resourceRepository.save(resource);

        Laboratory laboratory = new Laboratory();
        laboratory.setResource(savedResource);
        laboratory.setBuilding(request.getBuilding().trim());
        laboratory.setFloor(request.getFloor().trim());
        laboratory.setRoomNumber(request.getRoomNumber().trim());
        laboratory.setCapacity(request.getCapacity());
        laboratory.setLabType(request.getLabType() != null ? request.getLabType().trim() : "COMPUTER_LAB");
        laboratory.setComputerCount(request.getComputerCount() != null ? request.getComputerCount() : 30);
        laboratory.setStatus(request.getStatus() != null ? request.getStatus().trim().toUpperCase() : "AVAILABLE");

        Laboratory savedLaboratory = laboratoryRepository.save(laboratory);

        logAudit(adminUsername, "LABORATORY_CREATED", "Laboratory", savedLaboratory.getId(),
                null, "Created laboratory: " + savedLaboratory.getBuilding() + " " + savedLaboratory.getRoomNumber() + " (" + savedLaboratory.getLabType() + ")", ip, userAgent);

        return mapToDetails(savedLaboratory);
    }

    @Override
    public LaboratoryDetailsResponse updateLaboratory(Long id, UpdateLaboratoryRequest request, String adminUsername, String ip, String userAgent) {
        Laboratory laboratory = laboratoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laboratory not found with ID: " + id));

        if (request.getCapacity() == null || request.getCapacity() <= 0) {
            throw new BadRequestException("Capacity must be greater than zero");
        }
        if (request.getComputerCount() != null && request.getComputerCount() < 0) {
            throw new BadRequestException("Computer count cannot be negative");
        }

        if (laboratoryRepository.existsByBuildingAndRoomNumberAndIdNot(request.getBuilding().trim(), request.getRoomNumber().trim(), id)) {
            throw new ConflictException("Another laboratory with room number '" + request.getRoomNumber().trim()
                    + "' already exists in building '" + request.getBuilding().trim() + "'");
        }

        Department department = null;
        if (request.getDepartmentId() != null && request.getDepartmentId() > 0) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));
        }

        String oldValue = "room=" + laboratory.getBuilding() + "-" + laboratory.getRoomNumber() + ", type=" + laboratory.getLabType()
                + ", capacity=" + laboratory.getCapacity() + ", computers=" + laboratory.getComputerCount();

        laboratory.setBuilding(request.getBuilding().trim());
        laboratory.setFloor(request.getFloor().trim());
        laboratory.setRoomNumber(request.getRoomNumber().trim());
        laboratory.setCapacity(request.getCapacity());
        if (request.getLabType() != null) laboratory.setLabType(request.getLabType().trim());
        if (request.getComputerCount() != null) laboratory.setComputerCount(request.getComputerCount());
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            laboratory.setStatus(request.getStatus().trim().toUpperCase());
        }

        // Sync Resource record
        Resource res = laboratory.getResource();
        if (res != null) {
            if (request.getName() != null && !request.getName().trim().isEmpty()) {
                res.setName(request.getName().trim());
            } else {
                res.setName(laboratory.getBuilding() + " " + laboratory.getRoomNumber() + " Lab");
            }
            if (request.getCode() != null && !request.getCode().trim().isEmpty()) {
                String code = request.getCode().trim().toUpperCase();
                if (resourceRepository.existsByCodeAndIdNot(code, res.getId())) {
                    throw new ConflictException("Another resource with code '" + code + "' already exists");
                }
                res.setCode(code);
            }
            res.setDepartment(department);
            res.setCapacity(request.getCapacity());
            res.setLocation(laboratory.getBuilding() + ", Floor " + laboratory.getFloor());
            if (request.getDescription() != null) res.setDescription(request.getDescription().trim());
            if (request.getStatus() != null) {
                try {
                    res.setStatus(ResourceStatus.valueOf(request.getStatus().trim().toUpperCase()));
                } catch (Exception ignored) {}
            }
            resourceRepository.save(res);
        }

        Laboratory updated = laboratoryRepository.save(laboratory);
        String newValue = "room=" + updated.getBuilding() + "-" + updated.getRoomNumber() + ", type=" + updated.getLabType()
                + ", capacity=" + updated.getCapacity() + ", computers=" + updated.getComputerCount();

        logAudit(adminUsername, "LABORATORY_UPDATED", "Laboratory", updated.getId(),
                oldValue, newValue, ip, userAgent);

        return mapToDetails(updated);
    }

    @Override
    public LaboratorySummaryResponse changeStatus(Long id, String status, String adminUsername, String ip, String userAgent) {
        Laboratory laboratory = laboratoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laboratory not found with ID: " + id));

        String oldStatus = laboratory.getStatus();
        String newStatus = status.trim().toUpperCase();
        laboratory.setStatus(newStatus);

        Resource res = laboratory.getResource();
        if (res != null) {
            try {
                res.setStatus(ResourceStatus.valueOf(newStatus));
                resourceRepository.save(res);
            } catch (Exception ignored) {}
        }

        Laboratory updated = laboratoryRepository.save(laboratory);

        logAudit(adminUsername, "LABORATORY_STATUS_CHANGED", "Laboratory", updated.getId(),
                "status=" + oldStatus, "status=" + newStatus, ip, userAgent);

        return mapToSummary(updated);
    }

    @Override
    public void deleteLaboratory(Long id, String adminUsername, String ip, String userAgent) {
        Laboratory laboratory = laboratoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laboratory not found with ID: " + id));

        Resource resource = laboratory.getResource();
        if (resource != null) {
            if (allocationRepository.existsByResourceId(resource.getId())) {
                throw new ConflictException("Cannot delete laboratory '" + laboratory.getBuilding() + " " + laboratory.getRoomNumber()
                        + "' because it is referenced by existing allocation records. Deactivate instead.");
            }
            if (timetableEntryRepository.existsByResourceId(resource.getId())) {
                throw new ConflictException("Cannot delete laboratory '" + laboratory.getBuilding() + " " + laboratory.getRoomNumber()
                        + "' because it is assigned to existing timetable entries. Deactivate instead.");
            }
            laboratoryRepository.delete(laboratory);
            resourceRepository.delete(resource);
        } else {
            laboratoryRepository.delete(laboratory);
        }

        logAudit(adminUsername, "LABORATORY_DELETED", "Laboratory", id,
                "room=" + laboratory.getBuilding() + " " + laboratory.getRoomNumber(), null, ip, userAgent);
    }

    private LaboratorySummaryResponse mapToSummary(Laboratory l) {
        LaboratorySummaryResponse res = new LaboratorySummaryResponse();
        res.setId(l.getId());
        if (l.getResource() != null) {
            Resource r = l.getResource();
            res.setResourceId(r.getId());
            res.setResourceCode(r.getCode());
            res.setResourceName(r.getName());
            if (r.getDepartment() != null) {
                res.setDepartmentId(r.getDepartment().getId());
                res.setDepartmentCode(r.getDepartment().getCode());
                res.setDepartmentName(r.getDepartment().getName());
            }
        }
        res.setBuilding(l.getBuilding());
        res.setFloor(l.getFloor());
        res.setRoomNumber(l.getRoomNumber());
        res.setCapacity(l.getCapacity());
        res.setLabType(l.getLabType());
        res.setComputerCount(l.getComputerCount());
        res.setStatus(l.getStatus());
        return res;
    }

    private LaboratoryDetailsResponse mapToDetails(Laboratory l) {
        LaboratoryDetailsResponse res = new LaboratoryDetailsResponse();
        res.setId(l.getId());
        if (l.getResource() != null) {
            Resource r = l.getResource();
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
        res.setBuilding(l.getBuilding());
        res.setFloor(l.getFloor());
        res.setRoomNumber(l.getRoomNumber());
        res.setCapacity(l.getCapacity());
        res.setLabType(l.getLabType());
        res.setComputerCount(l.getComputerCount());
        res.setStatus(l.getStatus());
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
