package com.ahrao.service.resource;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.resource.ClassroomDetailsResponse;
import com.ahrao.dto.resource.ClassroomSummaryResponse;
import com.ahrao.dto.resource.CreateClassroomRequest;
import com.ahrao.dto.resource.UpdateClassroomRequest;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.ResourceStatus;
import com.ahrao.entity.enums.ResourceType;
import com.ahrao.entity.resource.Classroom;
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
import com.ahrao.repository.resource.ClassroomRepository;
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
public class ClassroomManagementServiceImpl implements ClassroomManagementService {

    private final ClassroomRepository classroomRepository;
    private final ResourceRepository resourceRepository;
    private final ResourceCategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;
    private final InstitutionRepository institutionRepository;
    private final ResourceAllocationRepository allocationRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public ClassroomManagementServiceImpl(ClassroomRepository classroomRepository,
                                         ResourceRepository resourceRepository,
                                         ResourceCategoryRepository categoryRepository,
                                         DepartmentRepository departmentRepository,
                                         InstitutionRepository institutionRepository,
                                         ResourceAllocationRepository allocationRepository,
                                         TimetableEntryRepository timetableEntryRepository,
                                         AuditLogRepository auditLogRepository,
                                         UserRepository userRepository) {
        this.classroomRepository = classroomRepository;
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
    public PagedResponse<ClassroomSummaryResponse> getClassrooms(String search, String building, String roomType, String status, Pageable pageable) {
        Specification<Classroom> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate roomMatch = cb.like(cb.lower(root.get("roomNumber")), pattern);
                Predicate bldgMatch = cb.like(cb.lower(root.get("building")), pattern);
                Predicate resMatch = cb.like(cb.lower(root.get("resource").get("name")), pattern);
                predicates.add(cb.or(roomMatch, bldgMatch, resMatch));
            }
            if (building != null && !building.trim().isEmpty() && !"ALL".equalsIgnoreCase(building.trim())) {
                predicates.add(cb.equal(cb.lower(root.get("building")), building.trim().toLowerCase()));
            }
            if (roomType != null && !roomType.trim().isEmpty() && !"ALL".equalsIgnoreCase(roomType.trim())) {
                predicates.add(cb.equal(cb.upper(root.get("roomType")), roomType.trim().toUpperCase()));
            }
            if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status.trim())) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Classroom> page = classroomRepository.findAll(spec, pageable);
        List<ClassroomSummaryResponse> content = page.getContent().stream()
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
    public ClassroomDetailsResponse getClassroomById(Long id) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found with ID: " + id));
        return mapToDetails(classroom);
    }

    @Override
    public ClassroomDetailsResponse createClassroom(CreateClassroomRequest request, String adminUsername, String ip, String userAgent) {
        if (request.getCapacity() == null || request.getCapacity() <= 0) {
            throw new BadRequestException("Capacity must be greater than zero");
        }
        if (classroomRepository.existsByBuildingAndRoomNumber(request.getBuilding().trim(), request.getRoomNumber().trim())) {
            throw new ConflictException("A classroom with room number '" + request.getRoomNumber().trim()
                    + "' already exists in building '" + request.getBuilding().trim() + "'");
        }

        // Determine code
        String code = request.getCode() != null && !request.getCode().trim().isEmpty()
                ? request.getCode().trim().toUpperCase()
                : (request.getBuilding().trim() + "-" + request.getRoomNumber().trim()).toUpperCase().replace(" ", "");

        if (resourceRepository.existsByCode(code)) {
            code = code + "-" + System.currentTimeMillis() % 10000;
        }

        String name = request.getName() != null && !request.getName().trim().isEmpty()
                ? request.getName().trim()
                : request.getBuilding().trim() + " " + request.getRoomNumber().trim();

        Institution institution = institutionRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Institution not configured"));

        // Find or create CLASSROOM category
        ResourceCategory category = categoryRepository.findAll().stream()
                .filter(c -> c.getResourceType() == ResourceType.CLASSROOM)
                .findFirst()
                .orElseGet(() -> {
                    ResourceCategory newCat = new ResourceCategory();
                    newCat.setName("Classrooms");
                    newCat.setResourceType(ResourceType.CLASSROOM);
                    newCat.setDescription("Instructional classrooms and lecture halls");
                    newCat.setStatus("ACTIVE");
                    return categoryRepository.save(newCat);
                });

        Department department = null;
        if (request.getDepartmentId() != null && request.getDepartmentId() > 0) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));
        }

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

        Classroom classroom = new Classroom();
        classroom.setResource(savedResource);
        classroom.setBuilding(request.getBuilding().trim());
        classroom.setFloor(request.getFloor().trim());
        classroom.setRoomNumber(request.getRoomNumber().trim());
        classroom.setCapacity(request.getCapacity());
        classroom.setRoomType(request.getRoomType() != null ? request.getRoomType().trim() : "LECTURE_HALL");
        classroom.setHasProjector(request.getHasProjector() != null ? request.getHasProjector() : true);
        classroom.setHasAc(request.getHasAc() != null ? request.getHasAc() : false);
        classroom.setHasSmartBoard(request.getHasSmartBoard() != null ? request.getHasSmartBoard() : false);
        classroom.setStatus(request.getStatus() != null ? request.getStatus().trim().toUpperCase() : "AVAILABLE");

        Classroom savedClassroom = classroomRepository.save(classroom);

        logAudit(adminUsername, "CLASSROOM_CREATED", "Classroom", savedClassroom.getId(),
                null, "Created classroom: " + savedClassroom.getBuilding() + " " + savedClassroom.getRoomNumber() + " (Cap: " + savedClassroom.getCapacity() + ")", ip, userAgent);

        return mapToDetails(savedClassroom);
    }

    @Override
    public ClassroomDetailsResponse updateClassroom(Long id, UpdateClassroomRequest request, String adminUsername, String ip, String userAgent) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found with ID: " + id));

        if (request.getCapacity() == null || request.getCapacity() <= 0) {
            throw new BadRequestException("Capacity must be greater than zero");
        }

        if (classroomRepository.existsByBuildingAndRoomNumberAndIdNot(request.getBuilding().trim(), request.getRoomNumber().trim(), id)) {
            throw new ConflictException("Another classroom with room number '" + request.getRoomNumber().trim()
                    + "' already exists in building '" + request.getBuilding().trim() + "'");
        }

        String oldValue = "room=" + classroom.getBuilding() + "-" + classroom.getRoomNumber() + ", capacity=" + classroom.getCapacity() + ", status=" + classroom.getStatus();

        classroom.setBuilding(request.getBuilding().trim());
        classroom.setFloor(request.getFloor().trim());
        classroom.setRoomNumber(request.getRoomNumber().trim());
        classroom.setCapacity(request.getCapacity());
        if (request.getRoomType() != null) classroom.setRoomType(request.getRoomType().trim());
        if (request.getHasProjector() != null) classroom.setHasProjector(request.getHasProjector());
        if (request.getHasAc() != null) classroom.setHasAc(request.getHasAc());
        if (request.getHasSmartBoard() != null) classroom.setHasSmartBoard(request.getHasSmartBoard());
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            classroom.setStatus(request.getStatus().trim().toUpperCase());
        }

        // Sync Resource record
        Resource res = classroom.getResource();
        if (res != null) {
            if (request.getName() != null && !request.getName().trim().isEmpty()) {
                res.setName(request.getName().trim());
            } else {
                res.setName(classroom.getBuilding() + " " + classroom.getRoomNumber());
            }
            if (request.getCode() != null && !request.getCode().trim().isEmpty()) {
                String code = request.getCode().trim().toUpperCase();
                if (resourceRepository.existsByCodeAndIdNot(code, res.getId())) {
                    throw new ConflictException("Another resource with code '" + code + "' already exists");
                }
                res.setCode(code);
            }
            res.setCapacity(request.getCapacity());
            res.setLocation(classroom.getBuilding() + ", Floor " + classroom.getFloor());
            if (request.getDescription() != null) res.setDescription(request.getDescription().trim());
            if (request.getStatus() != null) {
                try {
                    res.setStatus(ResourceStatus.valueOf(request.getStatus().trim().toUpperCase()));
                } catch (Exception ignored) {}
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
            resourceRepository.save(res);
        }

        Classroom updated = classroomRepository.save(classroom);
        String newValue = "room=" + updated.getBuilding() + "-" + updated.getRoomNumber() + ", capacity=" + updated.getCapacity() + ", status=" + updated.getStatus();

        logAudit(adminUsername, "CLASSROOM_UPDATED", "Classroom", updated.getId(),
                oldValue, newValue, ip, userAgent);

        return mapToDetails(updated);
    }

    @Override
    public ClassroomSummaryResponse changeStatus(Long id, String status, String adminUsername, String ip, String userAgent) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found with ID: " + id));

        String oldStatus = classroom.getStatus();
        String newStatus = status.trim().toUpperCase();
        classroom.setStatus(newStatus);

        Resource res = classroom.getResource();
        if (res != null) {
            try {
                res.setStatus(ResourceStatus.valueOf(newStatus));
                resourceRepository.save(res);
            } catch (Exception ignored) {}
        }

        Classroom updated = classroomRepository.save(classroom);

        logAudit(adminUsername, "CLASSROOM_STATUS_CHANGED", "Classroom", updated.getId(),
                "status=" + oldStatus, "status=" + newStatus, ip, userAgent);

        return mapToSummary(updated);
    }

    @Override
    public void deleteClassroom(Long id, String adminUsername, String ip, String userAgent) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found with ID: " + id));

        Resource resource = classroom.getResource();
        if (resource != null) {
            if (allocationRepository.existsByResourceId(resource.getId())) {
                throw new ConflictException("Cannot delete classroom '" + classroom.getBuilding() + " " + classroom.getRoomNumber()
                        + "' because it is referenced by existing allocation records. Deactivate instead.");
            }
            if (timetableEntryRepository.existsByResourceId(resource.getId())) {
                throw new ConflictException("Cannot delete classroom '" + classroom.getBuilding() + " " + classroom.getRoomNumber()
                        + "' because it is referenced by existing timetable entries. Deactivate instead.");
            }
            classroomRepository.delete(classroom);
            resourceRepository.delete(resource);
        } else {
            classroomRepository.delete(classroom);
        }

        logAudit(adminUsername, "CLASSROOM_DELETED", "Classroom", id,
                "room=" + classroom.getBuilding() + " " + classroom.getRoomNumber(), null, ip, userAgent);
    }

    private ClassroomSummaryResponse mapToSummary(Classroom c) {
        ClassroomSummaryResponse res = new ClassroomSummaryResponse();
        res.setId(c.getId());
        if (c.getResource() != null) {
            res.setResourceId(c.getResource().getId());
            res.setResourceCode(c.getResource().getCode());
            res.setResourceName(c.getResource().getName());
        }
        res.setBuilding(c.getBuilding());
        res.setFloor(c.getFloor());
        res.setRoomNumber(c.getRoomNumber());
        res.setCapacity(c.getCapacity());
        res.setRoomType(c.getRoomType());
        res.setHasProjector(c.getHasProjector());
        res.setHasAc(c.getHasAc());
        res.setHasSmartBoard(c.getHasSmartBoard());
        res.setStatus(c.getStatus());
        return res;
    }

    private ClassroomDetailsResponse mapToDetails(Classroom c) {
        ClassroomDetailsResponse res = new ClassroomDetailsResponse();
        res.setId(c.getId());
        if (c.getResource() != null) {
            Resource r = c.getResource();
            res.setResourceId(r.getId());
            res.setResourceCode(r.getCode());
            res.setResourceName(r.getName());
            res.setResourceDescription(r.getDescription());
            res.setResourceStatus(r.getStatus());
            res.setCreatedAt(r.getCreatedAt());
            res.setUpdatedAt(r.getUpdatedAt());
            if (r.getDepartment() != null) {
                res.setDepartmentId(r.getDepartment().getId());
                res.setDepartmentName(r.getDepartment().getName());
            }
            res.setTotalAllocations(allocationRepository.findByResourceId(r.getId()).size());
        }
        res.setBuilding(c.getBuilding());
        res.setFloor(c.getFloor());
        res.setRoomNumber(c.getRoomNumber());
        res.setCapacity(c.getCapacity());
        res.setRoomType(c.getRoomType());
        res.setHasProjector(c.getHasProjector());
        res.setHasAc(c.getHasAc());
        res.setHasSmartBoard(c.getHasSmartBoard());
        res.setStatus(c.getStatus());
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
