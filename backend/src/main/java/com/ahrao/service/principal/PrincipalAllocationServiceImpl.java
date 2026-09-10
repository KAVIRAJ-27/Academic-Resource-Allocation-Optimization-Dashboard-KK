package com.ahrao.service.principal;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.principal.allocation.PrincipalAllocationDetailDto;
import com.ahrao.dto.principal.allocation.PrincipalAllocationSummaryDto;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.allocation.ResourceAllocation;
import com.ahrao.entity.enums.AllocationStatus;
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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PrincipalAllocationServiceImpl implements PrincipalAllocationService {

    private static final Logger log = LoggerFactory.getLogger(PrincipalAllocationServiceImpl.class);

    private final PrincipalInstitutionResolver institutionResolver;
    private final ResourceAllocationRepository allocationRepository;

    public PrincipalAllocationServiceImpl(
            PrincipalInstitutionResolver institutionResolver,
            ResourceAllocationRepository allocationRepository
    ) {
        this.institutionResolver = institutionResolver;
        this.allocationRepository = allocationRepository;
    }

    @Override
    public PagedResponse<PrincipalAllocationSummaryDto> getInstitutionAllocations(
            Long userId,
            Long departmentId,
            Long resourceId,
            Long facultyId,
            Long subjectId,
            Long sectionId,
            AllocationStatus status,
            LocalDate date,
            Pageable pageable
    ) {
        Institution institution = institutionResolver.resolvePrincipalInstitution(userId);
        if (institution == null) {
            throw new AccessDeniedException("No authorized institution found for current principal");
        }

        Specification<ResourceAllocation> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Mandatory Institution Scope: either department or resource department must belong to this institution
            Predicate deptInstMatch = cb.equal(root.get("department").get("institution").get("id"), institution.getId());
            Predicate resInstMatch = cb.equal(root.get("resource").get("department").get("institution").get("id"), institution.getId());
            predicates.add(cb.or(deptInstMatch, resInstMatch));

            // 2. Department filter
            if (departmentId != null) {
                predicates.add(cb.or(
                        cb.equal(root.get("department").get("id"), departmentId),
                        cb.equal(root.get("resource").get("department").get("id"), departmentId)
                ));
            }

            // 3. Resource filter
            if (resourceId != null) {
                predicates.add(cb.equal(root.get("resource").get("id"), resourceId));
            }

            // 4. Faculty / User filter
            if (facultyId != null) {
                predicates.add(cb.equal(root.get("allocatedToUser").get("id"), facultyId));
            }

            // 5. Status filter
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // 6. Date filter (overlapping active day window)
            if (date != null) {
                Instant startOfDay = date.atStartOfDay(ZoneId.systemDefault()).toInstant();
                Instant endOfDay = date.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
                predicates.add(cb.lessThan(root.get("startDatetime"), endOfDay));
                predicates.add(cb.greaterThanOrEqualTo(root.get("endDatetime"), startOfDay));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ResourceAllocation> page = allocationRepository.findAll(spec, pageable);

        List<PrincipalAllocationSummaryDto> content = page.getContent().stream()
                .map(this::mapToSummaryDto)
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
    public PrincipalAllocationDetailDto getAllocationById(Long userId, Long allocationId) {
        Institution institution = institutionResolver.resolvePrincipalInstitution(userId);
        if (institution == null) {
            throw new AccessDeniedException("No authorized institution found for current principal");
        }

        ResourceAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("ResourceAllocation not found with id: " + allocationId));

        boolean inInst = (allocation.getDepartment() != null && allocation.getDepartment().getInstitution() != null &&
                allocation.getDepartment().getInstitution().getId().equals(institution.getId())) ||
                (allocation.getResource() != null && allocation.getResource().getDepartment() != null &&
                        allocation.getResource().getDepartment().getInstitution() != null &&
                        allocation.getResource().getDepartment().getInstitution().getId().equals(institution.getId()));

        if (!inInst) {
            log.warn("Security Alert: Principal userId={} attempted unauthorized access to allocationId={}", userId, allocationId);
            throw new ForbiddenException("Access denied: Allocation belongs to another institution.");
        }

        return mapToDetailDto(allocation);
    }

    private PrincipalAllocationSummaryDto mapToSummaryDto(ResourceAllocation a) {
        PrincipalAllocationSummaryDto dto = new PrincipalAllocationSummaryDto();
        dto.setId(a.getId());

        if (a.getResource() != null) {
            dto.setResourceId(a.getResource().getId());
            dto.setResourceName(a.getResource().getName());
            dto.setResourceCode(a.getResource().getCode());
        }

        if (a.getDepartment() != null) {
            dto.setDepartmentName(a.getDepartment().getName());
            dto.setDepartmentCode(a.getDepartment().getCode());
        } else if (a.getResource() != null && a.getResource().getDepartment() != null) {
            dto.setDepartmentName(a.getResource().getDepartment().getName());
            dto.setDepartmentCode(a.getResource().getDepartment().getCode());
        }

        if (a.getAllocatedToUser() != null) {
            User u = a.getAllocatedToUser();
            dto.setAllocatedToName((u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "")).trim());
            dto.setAllocatedToEmail(u.getEmail());
        }

        dto.setPurpose(a.getPurpose());
        dto.setStartDatetime(a.getStartDatetime());
        dto.setEndDatetime(a.getEndDatetime());
        dto.setStatus(a.getStatus() != null ? a.getStatus().name() : null);
        dto.setCreatedAt(a.getCreatedAt());

        return dto;
    }

    private PrincipalAllocationDetailDto mapToDetailDto(ResourceAllocation a) {
        PrincipalAllocationDetailDto dto = new PrincipalAllocationDetailDto();
        dto.setId(a.getId());

        if (a.getResource() != null) {
            dto.setResourceId(a.getResource().getId());
            dto.setResourceName(a.getResource().getName());
            dto.setResourceCode(a.getResource().getCode());
            if (a.getResource().getCategory() != null) {
                dto.setResourceCategory(a.getResource().getCategory().getName());
            }
            dto.setResourceCapacity(a.getResource().getCapacity());
            dto.setResourceLocation(a.getResource().getLocation());
        }

        if (a.getDepartment() != null) {
            dto.setDepartmentName(a.getDepartment().getName());
            dto.setDepartmentCode(a.getDepartment().getCode());
        } else if (a.getResource() != null && a.getResource().getDepartment() != null) {
            dto.setDepartmentName(a.getResource().getDepartment().getName());
            dto.setDepartmentCode(a.getResource().getDepartment().getCode());
        }

        if (a.getAllocatedToUser() != null) {
            User u = a.getAllocatedToUser();
            dto.setAllocatedToName((u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "")).trim());
            dto.setAllocatedToEmail(u.getEmail());
        }

        if (a.getAcademicYear() != null) {
            dto.setAcademicYearName(a.getAcademicYear().getName());
        }

        if (a.getSemester() != null) {
            dto.setSemesterName(a.getSemester().getName());
        }

        if (a.getAllocatedBy() != null) {
            User b = a.getAllocatedBy();
            dto.setAllocatedByName((b.getFirstName() + " " + (b.getLastName() != null ? b.getLastName() : "")).trim());
        }

        if (a.getRequest() != null) {
            dto.setRequestId(a.getRequest().getId());
        }

        dto.setQuantity(a.getQuantity());
        dto.setPurpose(a.getPurpose());
        dto.setStartDatetime(a.getStartDatetime());
        dto.setEndDatetime(a.getEndDatetime());
        dto.setStatus(a.getStatus() != null ? a.getStatus().name() : null);
        dto.setCreatedAt(a.getCreatedAt());

        return dto;
    }
}
