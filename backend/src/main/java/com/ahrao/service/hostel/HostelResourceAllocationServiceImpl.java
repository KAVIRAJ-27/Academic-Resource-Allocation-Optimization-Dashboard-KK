package com.ahrao.service.hostel;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hostel.allocation.*;
import com.ahrao.entity.academic.AcademicYear;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.allocation.HostelAllocation;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.HostelBedStatus;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.hostel.HostelBed;
import com.ahrao.entity.hostel.HostelBlock;
import com.ahrao.entity.hostel.HostelFloor;
import com.ahrao.entity.hostel.HostelRoom;
import com.ahrao.entity.request.HostelRequest;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.AcademicYearRepository;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
import com.ahrao.repository.request.HostelRequestRepository;
import com.ahrao.service.warden.WardenScopeService;
import jakarta.persistence.criteria.Join;
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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class HostelResourceAllocationServiceImpl implements HostelResourceAllocationService {

    private static final Logger log = LoggerFactory.getLogger(HostelResourceAllocationServiceImpl.class);

    private final HostelAllocationRepository hostelAllocationRepository;
    private final HostelBedRepository hostelBedRepository;
    private final StudentRepository studentRepository;
    private final HostelRequestRepository hostelRequestRepository;
    private final AcademicYearRepository academicYearRepository;
    private final AuditLogRepository auditLogRepository;
    private final WardenScopeService wardenScopeService;
    private final HostelAllocationValidationService validationService;
    private final HostelCandidateService candidateService;
    private final com.ahrao.service.conflict.ConflictDetectionService conflictDetectionService;

    public HostelResourceAllocationServiceImpl(
            HostelAllocationRepository hostelAllocationRepository,
            HostelBedRepository hostelBedRepository,
            StudentRepository studentRepository,
            HostelRequestRepository hostelRequestRepository,
            AcademicYearRepository academicYearRepository,
            AuditLogRepository auditLogRepository,
            WardenScopeService wardenScopeService,
            HostelAllocationValidationService validationService,
            HostelCandidateService candidateService,
            com.ahrao.service.conflict.ConflictDetectionService conflictDetectionService) {
        this.hostelAllocationRepository = hostelAllocationRepository;
        this.hostelBedRepository = hostelBedRepository;
        this.studentRepository = studentRepository;
        this.hostelRequestRepository = hostelRequestRepository;
        this.academicYearRepository = academicYearRepository;
        this.auditLogRepository = auditLogRepository;
        this.wardenScopeService = wardenScopeService;
        this.validationService = validationService;
        this.candidateService = candidateService;
        this.conflictDetectionService = conflictDetectionService;
    }


    @Override
    @Transactional(readOnly = true)
    public HostelAllocationPreviewDto previewAllocation(HostelAllocationPreviewRequestDto request, User actor) {
        HostelAllocationPreviewDto preview = new HostelAllocationPreviewDto();
        Long studentId = request.getStudentId();
        Long hostelId = request.getHostelId();
        HostelRequest hostelRequest = null;

        if (request.getHostelRequestId() != null) {
            hostelRequest = hostelRequestRepository.findById(request.getHostelRequestId())
                    .orElseThrow(() -> new ResourceNotFoundException("Hostel request not found with ID: " + request.getHostelRequestId()));
            if (studentId == null && hostelRequest.getStudent() != null) {
                studentId = hostelRequest.getStudent().getId();
            }
            if (hostelId == null && hostelRequest.getHostel() != null) {
                hostelId = hostelRequest.getHostel().getId();
            }
        }

        Student student = null;
        if (studentId != null) {
            student = studentRepository.findById(studentId).orElse(null);
            if (student != null) {
                List<HostelAllocationConflictDto> studentConflicts = validationService.collectConflicts(student, null, hostelId, actor);
                preview.getConflicts().addAll(studentConflicts);
            }
        }

        Set<Long> authorizedHostelIds = resolveAuthorizedHostelIds(actor);
        if (hostelId != null && !authorizedHostelIds.isEmpty() && !authorizedHostelIds.contains(hostelId)) {
            preview.getConflicts().add(new HostelAllocationConflictDto(
                    "UNAUTHORIZED_HOSTEL_SCOPE", "HOSTEL", hostelId, "Requested hostel is outside your authorized scope."));
        }

        List<HostelCandidateDto> allCandidates = candidateService.evaluateCandidates(hostelId, authorizedHostelIds);
        List<HostelCandidateDto> eligible = new ArrayList<>();
        List<HostelCandidateDto> unavailable = new ArrayList<>();

        for (HostelCandidateDto candidate : allCandidates) {
            if (candidate.isAvailable()) {
                eligible.add(candidate);
            } else {
                unavailable.add(candidate);
            }
        }

        preview.setEligibleCandidates(eligible);
        preview.setUnavailableCandidates(unavailable);
        preview.setCandidateCount(eligible.size());

        if (!eligible.isEmpty()) {
            preview.setRecommendedBed(eligible.get(0));
            preview.setEligible(true);
            preview.setReason("First available eligible bed in the authorized hostel scope (" + eligible.get(0).getHostelName() + ", Room " + eligible.get(0).getRoomNumber() + ").");
        } else {
            preview.setEligible(false);
            preview.setReason("No available beds found in the authorized scope for this request.");
        }

        // Shared Conflict Detection Framework Evaluation
        com.ahrao.dto.conflict.ConflictCheckRequestDto checkReq = new com.ahrao.dto.conflict.ConflictCheckRequestDto();
        checkReq.setDomain(com.ahrao.entity.enums.ConflictDomain.HOSTEL);
        checkReq.setStudentId(studentId);
        checkReq.setHostelId(hostelId);
        checkReq.setHostelRequestId(request.getHostelRequestId());

        com.ahrao.dto.conflict.ConflictResultDto conflictResult = conflictDetectionService.detectHostelConflicts(checkReq, actor);
        preview.setConflictResult(conflictResult);

        if (conflictResult.getConflicts() != null) {
            for (com.ahrao.dto.conflict.ConflictItemDto item : conflictResult.getConflicts()) {
                boolean alreadyPresent = preview.getConflicts().stream()
                        .anyMatch(c -> c.getCode() != null && c.getCode().equalsIgnoreCase(item.getConflictType()));
                if (!alreadyPresent) {
                    preview.getConflicts().add(new HostelAllocationConflictDto(
                            item.getConflictType(),
                            item.getEntityType(),
                            item.getEntityId(),
                            item.getMessage(),
                            item.getSeverity() != null ? item.getSeverity().name() : "ERROR",
                            item.getDetails()
                    ));
                }
            }
        }

        if (!conflictResult.isValid()) {
            preview.setEligible(false);
            preview.setReason("Allocation blocked: conflicts detected.");
        }

        return preview;
    }


    @Override
    @Transactional
    public HostelAllocationResponseDto autoAllocate(
            AutoHostelAllocationRequestDto request,
            User actor,
            String ipAddress,
            String userAgent) {

        log.info("Processing auto-allocation: hostelRequestId={}, actor={}", request.getHostelRequestId(), actor != null ? actor.getUsername() : "system");

        if (request.getHostelRequestId() == null) {
            throw new BadRequestException("Hostel request ID is required for auto-allocation.");
        }

        HostelRequest hostelRequest = hostelRequestRepository.findById(request.getHostelRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Hostel request not found with ID: " + request.getHostelRequestId()));

        if (hostelRequest.getStatus() == RequestStatus.REJECTED || hostelRequest.getStatus() == RequestStatus.CANCELLED) {
            throw new ConflictException("Cannot auto-allocate bed for request with status: " + hostelRequest.getStatus());
        }

        Student student = hostelRequest.getStudent();
        if (student == null) {
            throw new BadRequestException("Hostel request is missing associated student.");
        }

        // 1. Validate student eligibility
        validationService.validateStudentEligibility(student.getId());

        // 2. Validate scope
        Long targetHostelId = request.getHostelId() != null ? request.getHostelId() : (hostelRequest.getHostel() != null ? hostelRequest.getHostel().getId() : null);
        if (targetHostelId != null) {
            validationService.validateHostelScope(targetHostelId, actor);
        }

        Set<Long> authorizedHostelIds = resolveAuthorizedHostelIds(actor);

        // 3. Find best candidate bed
        HostelBed candidateBed = candidateService.selectBestCandidateBed(targetHostelId, authorizedHostelIds);
        if (candidateBed == null) {
            throw new ConflictException("No available beds found matching criteria for hostel request ID: " + hostelRequest.getId());
        }

        // 4. Acquire PESSIMISTIC_WRITE lock on the bed to prevent concurrency race conditions
        HostelBed lockedBed = hostelBedRepository.findByIdWithLock(candidateBed.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate bed no longer exists: " + candidateBed.getId()));

        // 5. Re-validate under lock
        validationService.validateBedAvailability(lockedBed);
        validationService.validateRoomCapacity(lockedBed.getRoom());
        validationService.validateStudentEligibility(student.getId());

        Hostel hostel = lockedBed.getRoom() != null && lockedBed.getRoom().getFloor() != null
                && lockedBed.getRoom().getFloor().getBlock() != null
                ? lockedBed.getRoom().getFloor().getBlock().getHostel()
                : null;
        validationService.validateHostelCapacity(hostel);

        // 5b. Transactional Conflict Detection Recheck under Pessimistic Lock
        com.ahrao.dto.conflict.ConflictCheckRequestDto checkReq = new com.ahrao.dto.conflict.ConflictCheckRequestDto();
        checkReq.setDomain(com.ahrao.entity.enums.ConflictDomain.HOSTEL);
        checkReq.setStudentId(student.getId());
        checkReq.setHostelId(targetHostelId != null ? targetHostelId : (hostel != null ? hostel.getId() : null));
        checkReq.setRoomId(lockedBed.getRoom() != null ? lockedBed.getRoom().getId() : null);
        checkReq.setBedId(lockedBed.getId());
        checkReq.setTargetBed(lockedBed);
        checkReq.setHostelRequestId(hostelRequest.getId());
        checkReq.setStartDate(request.getStartDate());
        checkReq.setEndDate(request.getEndDate());

        com.ahrao.dto.conflict.ConflictResultDto conflictResult = conflictDetectionService.detectHostelConflicts(checkReq, actor);
        if (!conflictResult.isValid()) {
            String errorMsg = conflictResult.getConflicts().stream()
                    .map(com.ahrao.dto.conflict.ConflictItemDto::getMessage)
                    .collect(java.util.stream.Collectors.joining("; "));
            throw new ConflictException("Allocation cannot be completed because conflicts were detected: " + errorMsg, conflictResult);
        }


        // 6. Dates and academic year
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();
        LocalDate endDate = request.getEndDate();
        if (endDate != null && endDate.isBefore(startDate)) {
            throw new BadRequestException("End date cannot be earlier than start date.");
        }

        AcademicYear academicYear = resolveAcademicYear(request.getAcademicYearId(), lockedBed.getRoom().getFloor().getBlock().getHostel());

        // 7. Create HostelAllocation
        HostelAllocation allocation = new HostelAllocation();
        allocation.setStudent(student);
        allocation.setBed(lockedBed);
        allocation.setAcademicYear(academicYear);
        allocation.setStartDate(startDate);
        allocation.setEndDate(endDate);
        allocation.setStatus(AllocationStatus.ACTIVE);
        allocation.setAllocatedAt(Instant.now());

        HostelAllocation saved = hostelAllocationRepository.save(allocation);

        // 8. Update bed status
        lockedBed.setStatus(HostelBedStatus.OCCUPIED);
        hostelBedRepository.save(lockedBed);

        // 9. Update request status if PENDING
        if (hostelRequest.getStatus() == RequestStatus.PENDING) {
            hostelRequest.setStatus(RequestStatus.APPROVED);
            hostelRequestRepository.save(hostelRequest);
        }

        // 10. Audit log
        logAudit(
                actor,
                "AUTO_HOSTEL_ALLOCATION",
                "HostelAllocation",
                saved.getId(),
                null,
                String.format("{\"studentId\":%d,\"bedId\":%d,\"roomId\":%d,\"hostelRequestId\":%d,\"method\":\"AUTO\"}",
                        student.getId(), lockedBed.getId(), lockedBed.getRoom().getId(), hostelRequest.getId()),
                ipAddress,
                userAgent
        );

        log.info("Auto-allocation complete: allocationId={}, studentId={}, bedId={}", saved.getId(), student.getId(), lockedBed.getId());
        return mapToResponseDto(saved, "AUTO", hostelRequest.getId());
    }

    @Override
    @Transactional
    public HostelAllocationResponseDto allocate(
            HostelAllocationRequestDto request,
            User actor,
            String ipAddress,
            String userAgent) {

        log.info("Processing manual allocation: studentId={}, bedId={}, actor={}",
                request.getStudentId(), request.getBedId(), actor != null ? actor.getUsername() : "system");

        // 1. Validate scope
        validationService.validateHostelScope(request.getHostelId(), actor);

        // 2. Validate student
        Student student = validationService.validateStudentEligibility(request.getStudentId());

        // 3. Optional hostel request verification
        HostelRequest hostelRequest = null;
        if (request.getHostelRequestId() != null) {
            hostelRequest = validationService.validateHostelRequest(request.getHostelRequestId(), student.getId());
        }

        // 4. Acquire PESSIMISTIC_WRITE lock on target bed
        HostelBed lockedBed = hostelBedRepository.findByIdWithLock(request.getBedId())
                .orElseThrow(() -> new ResourceNotFoundException("Hostel bed not found with ID: " + request.getBedId()));

        // 5. Validate hierarchy
        validationService.validateHierarchy(lockedBed, request.getRoomId(), request.getHostelId());

        // 6. Re-validate bed availability, room capacity, and hostel capacity under lock
        validationService.validateBedAvailability(lockedBed);
        validationService.validateRoomCapacity(lockedBed.getRoom());
        validationService.validateStudentEligibility(student.getId());

        Hostel hostel = lockedBed.getRoom() != null && lockedBed.getRoom().getFloor() != null
                && lockedBed.getRoom().getFloor().getBlock() != null
                ? lockedBed.getRoom().getFloor().getBlock().getHostel()
                : null;
        validationService.validateHostelCapacity(hostel);

        // 6b. Transactional Conflict Detection Recheck under Pessimistic Lock
        com.ahrao.dto.conflict.ConflictCheckRequestDto checkReq = new com.ahrao.dto.conflict.ConflictCheckRequestDto();
        checkReq.setDomain(com.ahrao.entity.enums.ConflictDomain.HOSTEL);
        checkReq.setStudentId(student.getId());
        checkReq.setHostelId(request.getHostelId());
        checkReq.setRoomId(request.getRoomId());
        checkReq.setBedId(lockedBed.getId());
        checkReq.setTargetBed(lockedBed);
        checkReq.setHostelRequestId(request.getHostelRequestId());
        checkReq.setStartDate(request.getStartDate());
        checkReq.setEndDate(request.getEndDate());

        com.ahrao.dto.conflict.ConflictResultDto conflictResult = conflictDetectionService.detectHostelConflicts(checkReq, actor);
        if (!conflictResult.isValid()) {
            String errorMsg = conflictResult.getConflicts().stream()
                    .map(com.ahrao.dto.conflict.ConflictItemDto::getMessage)
                    .collect(java.util.stream.Collectors.joining("; "));
            throw new ConflictException("Allocation cannot be completed because conflicts were detected: " + errorMsg, conflictResult);
        }


        // 7. Validate dates
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();
        LocalDate endDate = request.getEndDate();
        if (endDate != null && endDate.isBefore(startDate)) {
            throw new BadRequestException("End date cannot be earlier than start date.");
        }

        AcademicYear academicYear = resolveAcademicYear(request.getAcademicYearId(), lockedBed.getRoom().getFloor().getBlock().getHostel());

        // 8. Create HostelAllocation
        HostelAllocation allocation = new HostelAllocation();
        allocation.setStudent(student);
        allocation.setBed(lockedBed);
        allocation.setAcademicYear(academicYear);
        allocation.setStartDate(startDate);
        allocation.setEndDate(endDate);
        allocation.setStatus(AllocationStatus.ACTIVE);
        allocation.setAllocatedAt(Instant.now());

        HostelAllocation saved = hostelAllocationRepository.save(allocation);

        // 9. Update Bed status
        lockedBed.setStatus(HostelBedStatus.OCCUPIED);
        hostelBedRepository.save(lockedBed);

        // 10. Update request status if linked and PENDING
        if (hostelRequest != null && hostelRequest.getStatus() == RequestStatus.PENDING) {
            hostelRequest.setStatus(RequestStatus.APPROVED);
            hostelRequestRepository.save(hostelRequest);
        }

        // 11. Audit log
        logAudit(
                actor,
                "MANUAL_HOSTEL_ALLOCATION",
                "HostelAllocation",
                saved.getId(),
                null,
                String.format("{\"studentId\":%d,\"bedId\":%d,\"roomId\":%d,\"hostelId\":%d,\"method\":\"MANUAL\"}",
                        student.getId(), lockedBed.getId(), lockedBed.getRoom().getId(), request.getHostelId()),
                ipAddress,
                userAgent
        );

        log.info("Manual allocation complete: allocationId={}, studentId={}, bedId={}", saved.getId(), student.getId(), lockedBed.getId());
        return mapToResponseDto(saved, "MANUAL", hostelRequest != null ? hostelRequest.getId() : null);
    }

    @Override
    @Transactional
    public HostelAllocationResponseDto releaseAllocation(
            Long id,
            User actor,
            String ipAddress,
            String userAgent) {

        log.info("Processing allocation release: allocationId={}, actor={}", id, actor != null ? actor.getUsername() : "system");

        HostelAllocation allocation = hostelAllocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel allocation not found with ID: " + id));

        HostelBed bed = allocation.getBed();
        Long hostelId = bed != null && bed.getRoom() != null && bed.getRoom().getFloor() != null
                && bed.getRoom().getFloor().getBlock() != null && bed.getRoom().getFloor().getBlock().getHostel() != null
                ? bed.getRoom().getFloor().getBlock().getHostel().getId()
                : null;

        if (hostelId != null) {
            validationService.validateHostelScope(hostelId, actor);
        }

        if (allocation.getStatus() != AllocationStatus.ACTIVE) {
            throw new ConflictException("ALLOCATION_ALREADY_RELEASED: Only ACTIVE allocations can be released. Current status: " + allocation.getStatus());
        }

        // 1. Mark COMPLETED, preserve history
        allocation.setStatus(AllocationStatus.COMPLETED);
        allocation.setReleasedAt(Instant.now());
        HostelAllocation updated = hostelAllocationRepository.save(allocation);

        // 2. Mark Bed AVAILABLE
        if (bed != null) {
            bed.setStatus(HostelBedStatus.AVAILABLE);
            hostelBedRepository.save(bed);
        }

        // 3. Audit log
        logAudit(
                actor,
                "HOSTEL_ALLOCATION_RELEASED",
                "HostelAllocation",
                updated.getId(),
                "{\"status\":\"ACTIVE\"}",
                "{\"status\":\"COMPLETED\"}",
                ipAddress,
                userAgent
        );

        log.info("Allocation released successfully: allocationId={}", updated.getId());
        return mapToResponseDto(updated, "MANUAL", null);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<HostelAllocationResponseDto> getAllocations(
            HostelAllocationFilterParams params,
            Pageable pageable,
            User actor) {

        Set<Long> authorizedHostelIds = resolveAuthorizedHostelIds(actor);

        Specification<HostelAllocation> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            Join<HostelAllocation, HostelBed> bedJoin = root.join("bed");
            Join<HostelBed, HostelRoom> roomJoin = bedJoin.join("room");
            Join<HostelRoom, HostelFloor> floorJoin = roomJoin.join("floor");
            Join<HostelFloor, HostelBlock> blockJoin = floorJoin.join("block");
            Join<HostelBlock, Hostel> hostelJoin = blockJoin.join("hostel");
            Join<HostelAllocation, Student> studentJoin = root.join("student");

            if (!authorizedHostelIds.isEmpty()) {
                predicates.add(hostelJoin.get("id").in(authorizedHostelIds));
            }

            if (params != null) {
                if (params.getHostelId() != null) {
                    predicates.add(cb.equal(hostelJoin.get("id"), params.getHostelId()));
                }
                if (params.getBlockId() != null) {
                    predicates.add(cb.equal(blockJoin.get("id"), params.getBlockId()));
                }
                if (params.getRoomId() != null) {
                    predicates.add(cb.equal(roomJoin.get("id"), params.getRoomId()));
                }
                if (params.getStudentId() != null) {
                    predicates.add(cb.equal(studentJoin.get("id"), params.getStudentId()));
                }
                if (params.getStatus() != null) {
                    predicates.add(cb.equal(root.get("status"), params.getStatus()));
                }
                if (params.getSearch() != null && !params.getSearch().trim().isEmpty()) {
                    String pattern = "%" + params.getSearch().trim().toLowerCase() + "%";
                    predicates.add(cb.or(
                            cb.like(cb.lower(studentJoin.get("rollNumber")), pattern),
                            cb.like(cb.lower(bedJoin.get("bedNumber")), pattern),
                            cb.like(cb.lower(roomJoin.get("roomNumber")), pattern),
                            cb.like(cb.lower(hostelJoin.get("name")), pattern)
                    ));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<HostelAllocation> page = hostelAllocationRepository.findAll(spec, pageable);
        List<HostelAllocationResponseDto> content = page.getContent().stream()
                .map(a -> mapToResponseDto(a, "MANUAL", null))
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
    public HostelAllocationResponseDto getAllocationById(Long id, User actor) {
        HostelAllocation allocation = hostelAllocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel allocation not found with ID: " + id));

        HostelBed bed = allocation.getBed();
        Long hostelId = bed != null && bed.getRoom() != null && bed.getRoom().getFloor() != null
                && bed.getRoom().getFloor().getBlock() != null && bed.getRoom().getFloor().getBlock().getHostel() != null
                ? bed.getRoom().getFloor().getBlock().getHostel().getId()
                : null;

        if (hostelId != null) {
            validationService.validateHostelScope(hostelId, actor);
        }

        return mapToResponseDto(allocation, "MANUAL", null);
    }

    private Set<Long> resolveAuthorizedHostelIds(User actor) {
        if (actor != null && isWarden(actor) && !isAdminOrPrincipal(actor)) {
            return wardenScopeService.getAuthorizedHostelIds();
        }
        return Collections.emptySet();
    }

    private AcademicYear resolveAcademicYear(Long requestedAcademicYearId, Hostel hostel) {
        if (requestedAcademicYearId != null) {
            return academicYearRepository.findById(requestedAcademicYearId)
                    .orElseThrow(() -> new ResourceNotFoundException("Academic year not found with ID: " + requestedAcademicYearId));
        }

        if (hostel != null && hostel.getInstitution() != null) {
            AcademicYear year = academicYearRepository.findByInstitutionIdAndStatus(hostel.getInstitution().getId(), "ACTIVE")
                    .orElse(null);
            if (year != null) return year;
        }

        List<AcademicYear> activeYears = academicYearRepository.findByStatus("ACTIVE");
        if (!activeYears.isEmpty()) {
            return activeYears.get(0);
        }

        throw new ConflictException("No active academic year found in the system for allocation.");
    }

    private HostelAllocationResponseDto mapToResponseDto(HostelAllocation allocation, String method, Long hostelRequestId) {
        HostelAllocationResponseDto dto = new HostelAllocationResponseDto();
        dto.setId(allocation.getId());
        dto.setStatus(allocation.getStatus());
        dto.setStartDate(allocation.getStartDate());
        dto.setEndDate(allocation.getEndDate());
        dto.setAllocatedAt(allocation.getAllocatedAt());
        dto.setReleasedAt(allocation.getReleasedAt());
        dto.setAllocationMethod(method);
        dto.setHostelRequestId(hostelRequestId);

        Student s = allocation.getStudent();
        if (s != null) {
            dto.setStudentId(s.getId());
            dto.setRollNumber(s.getRollNumber());
            if (s.getUser() != null) {
                dto.setStudentName(s.getUser().getFirstName() + " " + s.getUser().getLastName());
                dto.setEmail(s.getUser().getEmail());
            }
            if (s.getDepartment() != null) {
                dto.setDepartmentName(s.getDepartment().getName());
            }
        }

        HostelBed b = allocation.getBed();
        if (b != null) {
            dto.setBedId(b.getId());
            dto.setBedNumber(b.getBedNumber());

            HostelRoom r = b.getRoom();
            if (r != null) {
                dto.setRoomId(r.getId());
                dto.setRoomNumber(r.getRoomNumber());
                dto.setRoomType(r.getRoomType() != null ? r.getRoomType().name() : "STANDARD");
                dto.setCapacity(r.getCapacity());

                HostelFloor f = r.getFloor();
                if (f != null) {
                    dto.setFloorId(f.getId());
                    dto.setFloorNumber(f.getFloorNumber());

                    HostelBlock bl = f.getBlock();
                    if (bl != null) {
                        dto.setBlockId(bl.getId());
                        dto.setBlockName(bl.getName());

                        Hostel h = bl.getHostel();
                        if (h != null) {
                            dto.setHostelId(h.getId());
                            dto.setHostelName(h.getName());
                            dto.setHostelCode(h.getCode());
                        }
                    }
                }
            }
        }

        return dto;
    }

    private void logAudit(User actor, String action, String entityType, Long entityId,
                          String oldValue, String newValue, String ipAddress, String userAgent) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setUser(actor);
            auditLog.setAction(action);
            auditLog.setEntityType(entityType);
            auditLog.setEntityId(entityId);
            auditLog.setOldValue(oldValue);
            auditLog.setNewValue(newValue);
            auditLog.setIpAddress(ipAddress != null ? ipAddress : "127.0.0.1");
            auditLog.setUserAgent(userAgent != null ? userAgent : "AHRAO-Hostel-Engine");
            auditLog.setCreatedAt(Instant.now());
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.warn("Failed to write audit log for action: {}", action, e);
        }
    }

    private boolean isWarden(User user) {
        if (user == null || user.getRoles() == null) return false;
        for (Role role : user.getRoles()) {
            if ("ROLE_WARDEN".equalsIgnoreCase(role.getName()) || "WARDEN".equalsIgnoreCase(role.getName())) {
                return true;
            }
        }
        return false;
    }

    private boolean isAdminOrPrincipal(User user) {
        if (user == null || user.getRoles() == null) return false;
        for (Role role : user.getRoles()) {
            String name = role.getName();
            if ("ROLE_ADMIN".equalsIgnoreCase(name) || "ADMIN".equalsIgnoreCase(name)
                    || "ROLE_PRINCIPAL".equalsIgnoreCase(name) || "PRINCIPAL".equalsIgnoreCase(name)) {
                return true;
            }
        }
        return false;
    }
}
