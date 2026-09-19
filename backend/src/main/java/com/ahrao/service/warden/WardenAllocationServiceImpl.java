package com.ahrao.service.warden;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.CreateHostelAllocationRequest;
import com.ahrao.dto.warden.WardenAllocationDetailDto;
import com.ahrao.dto.warden.WardenAllocationSummaryDto;
import com.ahrao.entity.academic.AcademicYear;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Program;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.allocation.HostelAllocation;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.HostelBedStatus;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.hostel.HostelBed;
import com.ahrao.entity.hostel.HostelBlock;
import com.ahrao.entity.hostel.HostelFloor;
import com.ahrao.entity.hostel.HostelRoom;
import com.ahrao.entity.hostel.Warden;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.AcademicYearRepository;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
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
public class WardenAllocationServiceImpl implements WardenAllocationService {

    private static final Logger log = LoggerFactory.getLogger(WardenAllocationServiceImpl.class);

    private final HostelAllocationRepository hostelAllocationRepository;
    private final HostelBedRepository hostelBedRepository;
    private final StudentRepository studentRepository;
    private final AcademicYearRepository academicYearRepository;
    private final AuditLogRepository auditLogRepository;
    private final WardenScopeService wardenScopeService;

    public WardenAllocationServiceImpl(
            HostelAllocationRepository hostelAllocationRepository,
            HostelBedRepository hostelBedRepository,
            StudentRepository studentRepository,
            AcademicYearRepository academicYearRepository,
            AuditLogRepository auditLogRepository,
            WardenScopeService wardenScopeService) {
        this.hostelAllocationRepository = hostelAllocationRepository;
        this.hostelBedRepository = hostelBedRepository;
        this.studentRepository = studentRepository;
        this.academicYearRepository = academicYearRepository;
        this.auditLogRepository = auditLogRepository;
        this.wardenScopeService = wardenScopeService;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<WardenAllocationSummaryDto> getAllocations(
            Long hostelId,
            Long blockId,
            Integer floorNumber,
            Long roomId,
            AllocationStatus status,
            String search,
            Pageable pageable) {

        Set<Long> authorizedHostelIds = wardenScopeService.getAuthorizedHostelIds();
        if (authorizedHostelIds.isEmpty()) {
            return new PagedResponse<>(Collections.emptyList(), 0, pageable.getPageSize(), 0, 0, true, true);
        }

        Long effectiveHostelId = wardenScopeService.validateHostelAccess(hostelId);

        Specification<HostelAllocation> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            Join<HostelAllocation, HostelBed> bedJoin = root.join("bed");
            Join<HostelBed, HostelRoom> roomJoin = bedJoin.join("room");
            Join<HostelRoom, HostelFloor> floorJoin = roomJoin.join("floor");
            Join<HostelFloor, HostelBlock> blockJoin = floorJoin.join("block");
            Join<HostelBlock, Hostel> hostelJoin = blockJoin.join("hostel");
            Join<HostelAllocation, Student> studentJoin = root.join("student");
            Join<Student, User> userJoin = studentJoin.join("user");

            if (effectiveHostelId != null) {
                predicates.add(cb.equal(hostelJoin.get("id"), effectiveHostelId));
            } else {
                predicates.add(hostelJoin.get("id").in(authorizedHostelIds));
            }

            if (blockId != null) {
                predicates.add(cb.equal(blockJoin.get("id"), blockId));
            }

            if (floorNumber != null) {
                predicates.add(cb.equal(floorJoin.get("floorNumber"), floorNumber));
            }

            if (roomId != null) {
                predicates.add(cb.equal(roomJoin.get("id"), roomId));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (search != null && !search.trim().isEmpty()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                Predicate regMatch = cb.like(cb.lower(studentJoin.get("registerNumber")), term);
                Predicate rollMatch = cb.like(cb.lower(studentJoin.get("rollNumber")), term);
                Predicate firstNameMatch = cb.like(cb.lower(userJoin.get("firstName")), term);
                Predicate lastNameMatch = cb.like(cb.lower(userJoin.get("lastName")), term);
                Predicate roomMatch = cb.like(cb.lower(roomJoin.get("roomNumber")), term);
                Predicate bedMatch = cb.like(cb.lower(bedJoin.get("bedNumber")), term);
                predicates.add(cb.or(regMatch, rollMatch, firstNameMatch, lastNameMatch, roomMatch, bedMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<HostelAllocation> page = hostelAllocationRepository.findAll(spec, pageable);

        List<WardenAllocationSummaryDto> content = page.getContent().stream()
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
    public WardenAllocationDetailDto getAllocationById(Long allocationId) {
        HostelAllocation allocation = wardenScopeService.validateAllocationAccess(allocationId);
        return mapToDetail(allocation);
    }

    @Override
    @Transactional
    public WardenAllocationSummaryDto createAllocation(
            CreateHostelAllocationRequest request,
            String ipAddress,
            String userAgent) {

        log.info("Processing bed allocation request: studentId={}, bedId={}", request.getStudentId(), request.getBedId());

        // 1. Resolve authenticated Warden and scope
        Warden warden = wardenScopeService.resolveWarden();
        Set<Long> authorizedHostelIds = wardenScopeService.getAuthorizedHostelIds();
        if (authorizedHostelIds.isEmpty()) {
            throw new ForbiddenException("No hostels assigned to your account.");
        }

        // 2. Validate student
        if (request.getStudentId() == null) {
            throw new BadRequestException("Student ID is required.");
        }

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + request.getStudentId()));

        if (student.getStatus() != null && !"ACTIVE".equalsIgnoreCase(student.getStatus())) {
            throw new ConflictException("Student status is '" + student.getStatus() + "' and cannot receive a hostel allocation.");
        }

        if (student.getUser() != null && student.getUser().getStatus() != UserStatus.ACTIVE) {
            throw new ConflictException("Student user account is not active.");
        }

        // Concurrency / duplicate check: Student must not have an existing active allocation
        if (hostelAllocationRepository.existsByStudentIdAndStatus(student.getId(), AllocationStatus.ACTIVE)) {
            throw new ConflictException("This student already has an active hostel allocation.");
        }

        // 3. Load bed with PESSIMISTIC_WRITE lock
        if (request.getBedId() == null) {
            throw new BadRequestException("Bed ID is required.");
        }

        HostelBed bed = hostelBedRepository.findByIdWithLock(request.getBedId())
                .orElseThrow(() -> new ResourceNotFoundException("Hostel bed not found with ID: " + request.getBedId()));

        // 4. Validate hierarchy & hostel authorization
        HostelRoom room = bed.getRoom();
        if (room == null) {
            throw new BadRequestException("Bed is not associated with any room.");
        }

        HostelFloor floor = room.getFloor();
        if (floor == null) {
            throw new BadRequestException("Room is not associated with any floor.");
        }

        HostelBlock block = floor.getBlock();
        if (block == null) {
            throw new BadRequestException("Floor is not associated with any block.");
        }

        Hostel hostel = block.getHostel();
        if (hostel == null) {
            throw new BadRequestException("Block is not associated with any hostel.");
        }

        if (!authorizedHostelIds.contains(hostel.getId())) {
            throw new ForbiddenException("Target bed belongs to hostel '" + hostel.getName() + "' which is outside your authorized scope.");
        }

        if (hostel.getStatus() != null && !"ACTIVE".equalsIgnoreCase(hostel.getStatus())) {
            throw new ConflictException("Hostel is currently inactive.");
        }

        // 5. Validate bed status and concurrency
        if (bed.getStatus() != HostelBedStatus.AVAILABLE) {
            throw new ConflictException("Bed is no longer available. Current status: " + bed.getStatus());
        }

        if (hostelAllocationRepository.existsByHostelBedIdAndStatus(bed.getId(), AllocationStatus.ACTIVE)) {
            throw new ConflictException("Bed is no longer available.");
        }

        // 6. Validate room operational status and capacity
        if (room.getStatus() != null && ("MAINTENANCE".equalsIgnoreCase(room.getStatus()) || "INACTIVE".equalsIgnoreCase(room.getStatus()))) {
            throw new ConflictException("Room " + room.getRoomNumber() + " is currently under " + room.getStatus() + " and cannot receive allocations.");
        }

        long activeRoomAllocations = hostelAllocationRepository.countByHostelBedRoomIdAndStatus(room.getId(), AllocationStatus.ACTIVE);
        if (activeRoomAllocations >= room.getCapacity()) {
            throw new ConflictException("Room has no available bed. Room capacity (" + room.getCapacity() + ") has been reached.");
        }

        // 7. Validate dates
        LocalDate startDate = request.getStartDate();
        if (startDate == null) {
            throw new BadRequestException("Start date is required.");
        }

        LocalDate endDate = request.getEndDate();
        if (endDate != null && endDate.isBefore(startDate)) {
            throw new BadRequestException("End date cannot be earlier than start date.");
        }

        // 8. Resolve AcademicYear
        AcademicYear academicYear = null;
        if (request.getAcademicYearId() != null) {
            academicYear = academicYearRepository.findById(request.getAcademicYearId())
                    .orElseThrow(() -> new ResourceNotFoundException("Academic year not found with ID: " + request.getAcademicYearId()));
        } else if (hostel.getInstitution() != null) {
            academicYear = academicYearRepository.findByInstitutionIdAndStatus(hostel.getInstitution().getId(), "ACTIVE")
                    .orElse(null);
        }

        if (academicYear == null) {
            List<AcademicYear> activeYears = academicYearRepository.findByStatus("ACTIVE");
            if (!activeYears.isEmpty()) {
                academicYear = activeYears.get(0);
            } else {
                throw new ConflictException("No active academic year found in the system for allocation.");
            }
        }

        // 9. Create HostelAllocation
        HostelAllocation allocation = new HostelAllocation();
        allocation.setStudent(student);
        allocation.setBed(bed);
        allocation.setAcademicYear(academicYear);
        allocation.setStartDate(startDate);
        allocation.setEndDate(endDate);
        allocation.setStatus(AllocationStatus.ACTIVE);
        allocation.setAllocatedAt(Instant.now());

        HostelAllocation saved = hostelAllocationRepository.save(allocation);

        // 10. Synchronize Bed status: AVAILABLE -> OCCUPIED
        bed.setStatus(HostelBedStatus.OCCUPIED);
        hostelBedRepository.save(bed);

        // 11. Audit log
        logAudit(
                warden.getUser(),
                "WARDEN_HOSTEL_ALLOCATION_CREATED",
                "HostelAllocation",
                saved.getId(),
                null,
                String.format("{\"studentId\":%d,\"bedId\":%d,\"roomId\":%d,\"hostelId\":%d,\"status\":\"ACTIVE\"}",
                        student.getId(), bed.getId(), room.getId(), hostel.getId()),
                ipAddress,
                userAgent
        );

        log.info("Bed allocation created successfully: allocationId={}, studentId={}, bedId={}", saved.getId(), student.getId(), bed.getId());
        return mapToSummary(saved);
    }

    @Override
    @Transactional
    public WardenAllocationSummaryDto releaseAllocation(
            Long allocationId,
            String ipAddress,
            String userAgent) {

        log.info("Processing allocation release request: allocationId={}", allocationId);

        Warden warden = wardenScopeService.resolveWarden();
        HostelAllocation allocation = wardenScopeService.validateAllocationAccess(allocationId);

        if (allocation.getStatus() != AllocationStatus.ACTIVE) {
            throw new ConflictException("Only ACTIVE allocations can be released. Current status: " + allocation.getStatus());
        }

        // Safely end the allocation without deleting record
        allocation.setStatus(AllocationStatus.COMPLETED);
        allocation.setReleasedAt(Instant.now());
        HostelAllocation updated = hostelAllocationRepository.save(allocation);

        // Synchronize Bed status: OCCUPIED -> AVAILABLE
        HostelBed bed = allocation.getBed();
        if (bed != null) {
            bed.setStatus(HostelBedStatus.AVAILABLE);
            hostelBedRepository.save(bed);
        }

        // Audit log
        logAudit(
                warden.getUser(),
                "WARDEN_HOSTEL_ALLOCATION_RELEASED",
                "HostelAllocation",
                updated.getId(),
                "{\"status\":\"ACTIVE\"}",
                "{\"status\":\"COMPLETED\"}",
                ipAddress,
                userAgent
        );

        log.info("Allocation successfully released: allocationId={}", allocationId);
        return mapToSummary(updated);
    }

    private WardenAllocationSummaryDto mapToSummary(HostelAllocation alloc) {
        WardenAllocationSummaryDto dto = new WardenAllocationSummaryDto();
        populateSummaryFields(dto, alloc);
        return dto;
    }

    private WardenAllocationDetailDto mapToDetail(HostelAllocation alloc) {
        WardenAllocationDetailDto dto = new WardenAllocationDetailDto();
        populateSummaryFields(dto, alloc);

        Student student = alloc.getStudent();
        if (student != null) {
            dto.setAdmissionYear(student.getAdmissionYear() != null ? student.getAdmissionYear().toString() : null);
            dto.setCurrentSemester(student.getCurrentSemester());

            if (student.getUser() != null) {
                dto.setStudentEmail(student.getUser().getEmail());
                dto.setStudentPhone(student.getUser().getPhone());
            }
        }

        HostelBed bed = alloc.getBed();
        if (bed != null && bed.getRoom() != null) {
            HostelRoom room = bed.getRoom();
            dto.setRoomCapacity(room.getCapacity());
            dto.setRoomType(room.getRoomType() != null ? room.getRoomType().name() : null);

            if (room.getFloor() != null && room.getFloor().getBlock() != null && room.getFloor().getBlock().getHostel() != null) {
                dto.setHostelAddress(room.getFloor().getBlock().getHostel().getAddress());
            }
        }

        return dto;
    }

    private void populateSummaryFields(WardenAllocationSummaryDto dto, HostelAllocation alloc) {
        dto.setId(alloc.getId());
        dto.setStartDate(alloc.getStartDate());
        dto.setEndDate(alloc.getEndDate());
        dto.setStatus(alloc.getStatus());
        dto.setAllocatedAt(alloc.getAllocatedAt());
        dto.setReleasedAt(alloc.getReleasedAt());

        if (alloc.getAcademicYear() != null) {
            dto.setAcademicYearName(alloc.getAcademicYear().getName());
        }

        Student student = alloc.getStudent();
        if (student != null) {
            dto.setStudentId(student.getId());
            dto.setRegisterNumber(student.getRegisterNumber());
            dto.setRollNumber(student.getRollNumber());

            if (student.getUser() != null) {
                dto.setStudentName(student.getUser().getFirstName() + " " + student.getUser().getLastName());
            }

            Department dept = student.getDepartment();
            if (dept != null) {
                dto.setDepartmentName(dept.getName());
            }

            Program prog = student.getProgram();
            if (prog != null) {
                dto.setProgramName(prog.getName());
            }
        }

        HostelBed bed = alloc.getBed();
        if (bed != null) {
            dto.setBedId(bed.getId());
            dto.setBedNumber(bed.getBedNumber());

            HostelRoom room = bed.getRoom();
            if (room != null) {
                dto.setRoomId(room.getId());
                dto.setRoomNumber(room.getRoomNumber());

                HostelFloor floor = room.getFloor();
                if (floor != null) {
                    dto.setFloorNumber(floor.getFloorNumber());
                    dto.setFloorName(floor.getName());

                    HostelBlock block = floor.getBlock();
                    if (block != null) {
                        dto.setBlockId(block.getId());
                        dto.setBlockName(block.getName());

                        Hostel hostel = block.getHostel();
                        if (hostel != null) {
                            dto.setHostelId(hostel.getId());
                            dto.setHostelName(hostel.getName());
                            dto.setHostelCode(hostel.getCode());
                        }
                    }
                }
            }
        }
    }

    private void logAudit(User user, String action, String entityType, Long entityId,
                          String oldValue, String newValue, String ipAddress, String userAgent) {
        AuditLog log = new AuditLog();
        log.setUser(user);
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
