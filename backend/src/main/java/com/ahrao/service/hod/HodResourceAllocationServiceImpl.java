package com.ahrao.service.hod;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hod.resource.HodResourceAllocationDetailDto;
import com.ahrao.dto.hod.resource.HodResourceAllocationOverviewKpiDto;
import com.ahrao.dto.hod.resource.HodResourceAllocationSummaryDto;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.allocation.ResourceAllocation;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.resource.Resource;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class HodResourceAllocationServiceImpl implements HodResourceAllocationService {

    private static final Logger log = LoggerFactory.getLogger(HodResourceAllocationServiceImpl.class);

    private final HodDepartmentResolver departmentResolver;
    private final ResourceAllocationRepository allocationRepository;

    public HodResourceAllocationServiceImpl(
            HodDepartmentResolver departmentResolver,
            ResourceAllocationRepository allocationRepository
    ) {
        this.departmentResolver = departmentResolver;
        this.allocationRepository = allocationRepository;
    }

    @Override
    public PagedResponse<HodResourceAllocationSummaryDto> getDepartmentAllocations(
            Long userId,
            Long resourceId,
            Long allocatedToUserId,
            AllocationStatus status,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable
    ) {
        Department department = departmentResolver.resolveHodDepartment(userId);

        Specification<ResourceAllocation> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Mandatory Department Scope
            predicates.add(cb.equal(root.get("department").get("id"), department.getId()));

            // 2. Status Filter
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // 3. Resource Filter
            if (resourceId != null) {
                predicates.add(cb.equal(root.get("resource").get("id"), resourceId));
            }

            // 4. Beneficiary User Filter
            if (allocatedToUserId != null) {
                predicates.add(cb.equal(root.get("allocatedToUser").get("id"), allocatedToUserId));
            }

            // 5. Date Range Filters
            if (fromDate != null) {
                Instant startOfFromDate = fromDate.atStartOfDay().toInstant(ZoneOffset.UTC);
                predicates.add(cb.greaterThanOrEqualTo(root.get("startDatetime"), startOfFromDate));
            }
            if (toDate != null) {
                Instant endOfToDate = toDate.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
                predicates.add(cb.lessThan(root.get("startDatetime"), endOfToDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ResourceAllocation> pageResult = allocationRepository.findAll(spec, pageable);
        List<HodResourceAllocationSummaryDto> dtoList = pageResult.getContent()
                .stream()
                .map(this::mapToSummaryDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                dtoList,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isFirst(),
                pageResult.isLast()
        );
    }

    @Override
    public HodResourceAllocationDetailDto getAllocationDetails(Long userId, Long allocationId) {
        Department department = departmentResolver.resolveHodDepartment(userId);
        ResourceAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource allocation not found with id: " + allocationId));

        if (allocation.getDepartment() == null || !allocation.getDepartment().getId().equals(department.getId())) {
            log.warn("Security Alert: User {} attempted cross-department access to allocation id={}", userId, allocationId);
            throw new ForbiddenException("Access denied: Resource allocation belongs to another department.");
        }

        return mapToDetailDto(allocation);
    }

    @Override
    public HodResourceAllocationOverviewKpiDto getAllocationSummary(Long userId) {
        Department department = departmentResolver.resolveHodDepartment(userId);
        Long deptId = department.getId();

        HodResourceAllocationOverviewKpiDto kpi = new HodResourceAllocationOverviewKpiDto();
        kpi.setTotalAllocations(allocationRepository.countByDepartmentId(deptId));
        kpi.setActiveAllocations(allocationRepository.countByDepartmentIdAndStatus(deptId, AllocationStatus.ACTIVE));
        kpi.setPendingAllocations(allocationRepository.countByDepartmentIdAndStatus(deptId, AllocationStatus.PENDING));
        kpi.setCompletedAllocations(allocationRepository.countByDepartmentIdAndStatus(deptId, AllocationStatus.COMPLETED));

        return kpi;
    }

    private HodResourceAllocationSummaryDto mapToSummaryDto(ResourceAllocation entity) {
        HodResourceAllocationSummaryDto dto = new HodResourceAllocationSummaryDto();
        dto.setId(entity.getId());

        if (entity.getResource() != null) {
            Resource r = entity.getResource();
            dto.setResourceId(r.getId());
            dto.setResourceName(r.getName());
            dto.setResourceCode(r.getCode());
            if (r.getCategory() != null) {
                dto.setCategoryName(r.getCategory().getName());
            }
        }

        if (entity.getAllocatedToUser() != null) {
            User u = entity.getAllocatedToUser();
            dto.setAllocatedToUserId(u.getId());
            dto.setAllocatedToName((u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "")).trim());
            dto.setAllocatedToEmail(u.getEmail());
            if (u.getRoles() != null && !u.getRoles().isEmpty()) {
                dto.setAllocatedToRole(u.getRoles().stream().map(Role::getName).collect(Collectors.joining(", ")));
            }
        }

        if (entity.getDepartment() != null) {
            dto.setDepartmentId(entity.getDepartment().getId());
            dto.setDepartmentName(entity.getDepartment().getName());
        }

        if (entity.getAcademicYear() != null) {
            dto.setAcademicYearName(entity.getAcademicYear().getName());
        }

        if (entity.getSemester() != null) {
            dto.setSemesterName(entity.getSemester().getName());
        }

        if (entity.getTimeSlot() != null) {
            dto.setTimeSlotName(entity.getTimeSlot().getName() + " (" + entity.getTimeSlot().getStartTime() + "-" + entity.getTimeSlot().getEndTime() + ")");
        }

        dto.setStartDatetime(entity.getStartDatetime());
        dto.setEndDatetime(entity.getEndDatetime());
        dto.setQuantity(entity.getQuantity());
        dto.setPurpose(entity.getPurpose());
        dto.setStatus(entity.getStatus());

        if (entity.getAllocatedBy() != null) {
            User b = entity.getAllocatedBy();
            dto.setAllocatedByUserId(b.getId());
            dto.setAllocatedByName((b.getFirstName() + " " + (b.getLastName() != null ? b.getLastName() : "")).trim());
        }

        if (entity.getRequest() != null) {
            dto.setRequestId(entity.getRequest().getId());
        }

        dto.setCreatedAt(entity.getCreatedAt());

        return dto;
    }

    private HodResourceAllocationDetailDto mapToDetailDto(ResourceAllocation entity) {
        HodResourceAllocationDetailDto dto = new HodResourceAllocationDetailDto();
        dto.setId(entity.getId());

        if (entity.getResource() != null) {
            Resource r = entity.getResource();
            dto.setResourceId(r.getId());
            dto.setResourceName(r.getName());
            dto.setResourceCode(r.getCode());
            dto.setResourceLocation(r.getLocation());
            dto.setResourceCapacity(r.getCapacity());
            if (r.getCategory() != null) {
                dto.setCategoryName(r.getCategory().getName());
            }
        }

        if (entity.getAllocatedToUser() != null) {
            User u = entity.getAllocatedToUser();
            dto.setAllocatedToUserId(u.getId());
            dto.setAllocatedToName((u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "")).trim());
            dto.setAllocatedToEmail(u.getEmail());
            if (u.getRoles() != null && !u.getRoles().isEmpty()) {
                dto.setAllocatedToRole(u.getRoles().stream().map(Role::getName).collect(Collectors.joining(", ")));
            }
        }

        if (entity.getDepartment() != null) {
            dto.setDepartmentId(entity.getDepartment().getId());
            dto.setDepartmentName(entity.getDepartment().getName());
        }

        if (entity.getAcademicYear() != null) {
            dto.setAcademicYearId(entity.getAcademicYear().getId());
            dto.setAcademicYearName(entity.getAcademicYear().getName());
        }

        if (entity.getSemester() != null) {
            dto.setSemesterId(entity.getSemester().getId());
            dto.setSemesterName(entity.getSemester().getName());
        }

        if (entity.getTimeSlot() != null) {
            dto.setTimeSlotId(entity.getTimeSlot().getId());
            dto.setTimeSlotName(entity.getTimeSlot().getName() + " (" + entity.getTimeSlot().getStartTime() + "-" + entity.getTimeSlot().getEndTime() + ")");
        }

        dto.setStartDatetime(entity.getStartDatetime());
        dto.setEndDatetime(entity.getEndDatetime());
        dto.setQuantity(entity.getQuantity());
        dto.setPurpose(entity.getPurpose());
        dto.setStatus(entity.getStatus());

        if (entity.getAllocatedBy() != null) {
            User b = entity.getAllocatedBy();
            dto.setAllocatedByUserId(b.getId());
            dto.setAllocatedByName((b.getFirstName() + " " + (b.getLastName() != null ? b.getLastName() : "")).trim());
        }

        if (entity.getRequest() != null) {
            dto.setRequestId(entity.getRequest().getId());
            dto.setRequestPurpose(entity.getRequest().getPurpose());
        }

        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        return dto;
    }
}
