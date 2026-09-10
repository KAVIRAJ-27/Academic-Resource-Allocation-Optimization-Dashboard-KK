package com.ahrao.service.resource;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.resource.CreateTimeSlotRequest;
import com.ahrao.dto.resource.TimeSlotDetailsResponse;
import com.ahrao.dto.resource.TimeSlotSummaryResponse;
import com.ahrao.dto.resource.UpdateTimeSlotRequest;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.academic.TimeSlot;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.InstitutionRepository;
import com.ahrao.repository.academic.TimeSlotRepository;
import com.ahrao.repository.academic.TimetableEntryRepository;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
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
public class TimeSlotManagementServiceImpl implements TimeSlotManagementService {

    private final TimeSlotRepository timeSlotRepository;
    private final InstitutionRepository institutionRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final ResourceAllocationRepository allocationRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public TimeSlotManagementServiceImpl(TimeSlotRepository timeSlotRepository,
                                         InstitutionRepository institutionRepository,
                                         TimetableEntryRepository timetableEntryRepository,
                                         ResourceAllocationRepository allocationRepository,
                                         AuditLogRepository auditLogRepository,
                                         UserRepository userRepository) {
        this.timeSlotRepository = timeSlotRepository;
        this.institutionRepository = institutionRepository;
        this.timetableEntryRepository = timetableEntryRepository;
        this.allocationRepository = allocationRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<TimeSlotSummaryResponse> getTimeSlots(String search, String dayOfWeek, String status, Pageable pageable) {
        Specification<TimeSlot> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                Predicate dayMatch = cb.like(cb.lower(root.get("dayOfWeek")), pattern);
                predicates.add(cb.or(nameMatch, dayMatch));
            }
            if (dayOfWeek != null && !dayOfWeek.trim().isEmpty() && !"ALL".equalsIgnoreCase(dayOfWeek.trim())) {
                predicates.add(cb.equal(cb.upper(root.get("dayOfWeek")), dayOfWeek.trim().toUpperCase()));
            }
            if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status.trim())) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<TimeSlot> page = timeSlotRepository.findAll(spec, pageable);
        List<TimeSlotSummaryResponse> content = page.getContent().stream()
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
    public TimeSlotDetailsResponse getTimeSlotById(Long id) {
        TimeSlot slot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Time slot not found with ID: " + id));
        return mapToDetails(slot);
    }

    @Override
    public TimeSlotDetailsResponse createTimeSlot(CreateTimeSlotRequest request, String adminUsername, String ip, String userAgent) {
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new BadRequestException("Start time (" + request.getStartTime() + ") must be before end time (" + request.getEndTime() + ")");
        }

        if (timeSlotRepository.existsByName(request.getName().trim())) {
            throw new ConflictException("A time slot with name '" + request.getName().trim() + "' already exists");
        }

        Institution institution = institutionRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Institution not configured"));

        TimeSlot slot = new TimeSlot();
        slot.setInstitution(institution);
        slot.setName(request.getName().trim());
        slot.setDayOfWeek(request.getDayOfWeek().trim().toUpperCase());
        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        slot.setStatus(request.getStatus() != null ? request.getStatus().trim().toUpperCase() : "ACTIVE");

        TimeSlot saved = timeSlotRepository.save(slot);

        logAudit(adminUsername, "TIME_SLOT_CREATED", "TimeSlot", saved.getId(),
                null, "Created slot: " + saved.getName() + " (" + saved.getDayOfWeek() + " " + saved.getStartTime() + "-" + saved.getEndTime() + ")", ip, userAgent);

        return mapToDetails(saved);
    }

    @Override
    public TimeSlotDetailsResponse updateTimeSlot(Long id, UpdateTimeSlotRequest request, String adminUsername, String ip, String userAgent) {
        TimeSlot slot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Time slot not found with ID: " + id));

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new BadRequestException("Start time (" + request.getStartTime() + ") must be before end time (" + request.getEndTime() + ")");
        }

        if (timeSlotRepository.existsByNameAndIdNot(request.getName().trim(), id)) {
            throw new ConflictException("Another time slot with name '" + request.getName().trim() + "' already exists");
        }

        String oldValue = "name=" + slot.getName() + ", day=" + slot.getDayOfWeek() + ", time=" + slot.getStartTime() + "-" + slot.getEndTime() + ", status=" + slot.getStatus();

        slot.setName(request.getName().trim());
        slot.setDayOfWeek(request.getDayOfWeek().trim().toUpperCase());
        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            slot.setStatus(request.getStatus().trim().toUpperCase());
        }

        TimeSlot updated = timeSlotRepository.save(slot);
        String newValue = "name=" + updated.getName() + ", day=" + updated.getDayOfWeek() + ", time=" + updated.getStartTime() + "-" + updated.getEndTime() + ", status=" + updated.getStatus();

        logAudit(adminUsername, "TIME_SLOT_UPDATED", "TimeSlot", updated.getId(),
                oldValue, newValue, ip, userAgent);

        return mapToDetails(updated);
    }

    @Override
    public TimeSlotSummaryResponse changeStatus(Long id, String status, String adminUsername, String ip, String userAgent) {
        TimeSlot slot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Time slot not found with ID: " + id));

        String oldStatus = slot.getStatus();
        String newStatus = status.trim().toUpperCase();
        slot.setStatus(newStatus);
        TimeSlot updated = timeSlotRepository.save(slot);

        logAudit(adminUsername, "TIME_SLOT_STATUS_CHANGED", "TimeSlot", updated.getId(),
                "status=" + oldStatus, "status=" + newStatus, ip, userAgent);

        return mapToSummary(updated);
    }

    @Override
    public void deleteTimeSlot(Long id, String adminUsername, String ip, String userAgent) {
        TimeSlot slot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Time slot not found with ID: " + id));

        if (timetableEntryRepository.existsByTimeSlotId(id)) {
            throw new ConflictException("Cannot delete time slot '" + slot.getName() + "' because active timetable entries are scheduled during it. Deactivate instead.");
        }
        if (allocationRepository.existsByTimeSlotId(id)) {
            throw new ConflictException("Cannot delete time slot '" + slot.getName() + "' because active resource allocations reference it. Deactivate instead.");
        }

        timeSlotRepository.delete(slot);
        logAudit(adminUsername, "TIME_SLOT_DELETED", "TimeSlot", id,
                "name=" + slot.getName(), null, ip, userAgent);
    }

    private TimeSlotSummaryResponse mapToSummary(TimeSlot s) {
        return new TimeSlotSummaryResponse(
                s.getId(),
                s.getName(),
                s.getDayOfWeek(),
                s.getStartTime(),
                s.getEndTime(),
                s.getStatus()
        );
    }

    private TimeSlotDetailsResponse mapToDetails(TimeSlot s) {
        TimeSlotDetailsResponse res = new TimeSlotDetailsResponse();
        res.setId(s.getId());
        if (s.getInstitution() != null) {
            res.setInstitutionId(s.getInstitution().getId());
            res.setInstitutionName(s.getInstitution().getName());
        }
        res.setName(s.getName());
        res.setDayOfWeek(s.getDayOfWeek());
        res.setStartTime(s.getStartTime());
        res.setEndTime(s.getEndTime());
        res.setStatus(s.getStatus());
        res.setTotalTimetableEntries(timetableEntryRepository.findByTimeSlotId(s.getId()).size());
        res.setTotalAllocations(0);
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
