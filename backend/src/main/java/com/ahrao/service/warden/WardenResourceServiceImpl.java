package com.ahrao.service.warden;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.UpdateFacilityRequest;
import com.ahrao.dto.warden.WardenFacilityDetailDto;
import com.ahrao.dto.warden.WardenFacilitySummaryDto;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.hostel.HostelFacility;
import com.ahrao.entity.hostel.Warden;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.hostel.HostelFacilityRepository;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class WardenResourceServiceImpl implements WardenResourceService {

    private static final Logger log = LoggerFactory.getLogger(WardenResourceServiceImpl.class);

    private final HostelFacilityRepository hostelFacilityRepository;
    private final WardenScopeService wardenScopeService;
    private final AuditLogRepository auditLogRepository;

    public WardenResourceServiceImpl(
            HostelFacilityRepository hostelFacilityRepository,
            WardenScopeService wardenScopeService,
            AuditLogRepository auditLogRepository) {
        this.hostelFacilityRepository = hostelFacilityRepository;
        this.wardenScopeService = wardenScopeService;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public PagedResponse<WardenFacilitySummaryDto> getFacilities(
            Long hostelId,
            String status,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir) {

        Set<Long> authorizedHostelIds = wardenScopeService.getAuthorizedHostelIds();
        if (authorizedHostelIds.isEmpty()) {
            return PagedResponse.fromPage(new PageImpl<>(
                    List.of(), PageRequest.of(page, size), 0));
        }

        if (hostelId != null && !authorizedHostelIds.contains(hostelId)) {
            throw new ForbiddenException("Requested hostel is outside your authorized warden scope.");
        }

        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String sortProperty = (sortBy == null || sortBy.isBlank()) ? "name" : sortBy;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortProperty));

        Specification<HostelFacility> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (hostelId != null) {
                predicates.add(cb.equal(root.get("hostel").get("id"), hostelId));
            } else {
                predicates.add(root.get("hostel").get("id").in(authorizedHostelIds));
            }

            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }

            if (search != null && !search.isBlank()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), term);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), term);
                predicates.add(cb.or(nameMatch, descMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<HostelFacility> resultPage = hostelFacilityRepository.findAll(spec, pageable);
        List<WardenFacilitySummaryDto> dtos = resultPage.getContent().stream()
                .map(this::mapToSummary)
                .collect(Collectors.toList());

        return PagedResponse.fromPage(new PageImpl<>(
                dtos, pageable, resultPage.getTotalElements()));
    }

    @Override
    public WardenFacilityDetailDto getFacilityById(Long id) {
        HostelFacility facility = wardenScopeService.validateFacilityAccess(id);
        return mapToDetail(facility);
    }

    @Override
    @Transactional
    public WardenFacilityDetailDto updateFacility(
            Long id,
            UpdateFacilityRequest request,
            String ipAddress,
            String userAgent) {

        HostelFacility facility = wardenScopeService.validateFacilityAccess(id);
        Warden warden = wardenScopeService.resolveWarden();

        String oldStatus = facility.getStatus();
        String oldDesc = facility.getDescription();

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            String newStatus = request.getStatus().trim().toUpperCase();
            if (!newStatus.equals("ACTIVE") && !newStatus.equals("INACTIVE") && !newStatus.equals("MAINTENANCE")) {
                throw new BadRequestException("Invalid facility status. Allowed: ACTIVE, INACTIVE, MAINTENANCE");
            }
            facility.setStatus(newStatus);
        }

        if (request.getDescription() != null) {
            facility.setDescription(request.getDescription().trim());
        }

        if (request.getQuantity() != null && request.getQuantity() >= 0) {
            facility.setQuantity(request.getQuantity());
        }

        HostelFacility saved = hostelFacilityRepository.save(facility);

        // Audit Log
        AuditLog auditLog = new AuditLog();
        auditLog.setUser(warden.getUser());
        auditLog.setAction("WARDEN_HOSTEL_RESOURCE_UPDATED");
        auditLog.setEntityType("HostelFacility");
        auditLog.setEntityId(saved.getId());
        auditLog.setOldValue(String.format("{\"status\":\"%s\",\"description\":\"%s\"}", oldStatus, oldDesc));
        auditLog.setNewValue(String.format("{\"status\":\"%s\",\"description\":\"%s\"}", saved.getStatus(), saved.getDescription()));
        auditLog.setIpAddress(ipAddress);
        auditLog.setUserAgent(userAgent);
        auditLog.setCreatedAt(Instant.now());
        auditLogRepository.save(auditLog);

        log.info("Hostel facility updated: id={}, status={}, wardenId={}", saved.getId(), saved.getStatus(), warden.getId());
        return mapToDetail(saved);
    }

    private WardenFacilitySummaryDto mapToSummary(HostelFacility facility) {
        WardenFacilitySummaryDto dto = new WardenFacilitySummaryDto();
        dto.setId(facility.getId());
        dto.setName(facility.getName());
        dto.setDescription(facility.getDescription());
        dto.setQuantity(facility.getQuantity());
        dto.setStatus(facility.getStatus());

        Hostel hostel = facility.getHostel();
        if (hostel != null) {
            dto.setHostelId(hostel.getId());
            dto.setHostelName(hostel.getName());
            dto.setHostelCode(hostel.getCode());
        }
        return dto;
    }

    private WardenFacilityDetailDto mapToDetail(HostelFacility facility) {
        WardenFacilityDetailDto dto = new WardenFacilityDetailDto();
        dto.setId(facility.getId());
        dto.setName(facility.getName());
        dto.setDescription(facility.getDescription());
        dto.setQuantity(facility.getQuantity());
        dto.setStatus(facility.getStatus());

        Hostel hostel = facility.getHostel();
        if (hostel != null) {
            dto.setHostelId(hostel.getId());
            dto.setHostelName(hostel.getName());
            dto.setHostelCode(hostel.getCode());
            dto.setHostelAddress(hostel.getAddress());
            dto.setHostelCapacity(hostel.getCapacity());
        }
        return dto;
    }
}
