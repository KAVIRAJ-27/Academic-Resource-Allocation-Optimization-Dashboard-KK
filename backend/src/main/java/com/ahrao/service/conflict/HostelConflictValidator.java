package com.ahrao.service.conflict;

import com.ahrao.dto.conflict.ConflictCheckRequestDto;
import com.ahrao.dto.conflict.ConflictItemDto;
import com.ahrao.dto.conflict.ConflictResultDto;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.allocation.HostelAllocation;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.ConflictCode;
import com.ahrao.entity.enums.ConflictDomain;
import com.ahrao.entity.enums.ConflictSeverity;
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
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
import com.ahrao.repository.hostel.HostelRepository;
import com.ahrao.repository.request.HostelRequestRepository;
import com.ahrao.service.warden.WardenScopeService;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Component
public class HostelConflictValidator {

    private final StudentRepository studentRepository;
    private final HostelRepository hostelRepository;
    private final HostelBedRepository hostelBedRepository;
    private final HostelAllocationRepository hostelAllocationRepository;
    private final HostelRequestRepository hostelRequestRepository;
    private final WardenScopeService wardenScopeService;

    public HostelConflictValidator(
            StudentRepository studentRepository,
            HostelRepository hostelRepository,
            HostelBedRepository hostelBedRepository,
            HostelAllocationRepository hostelAllocationRepository,
            HostelRequestRepository hostelRequestRepository,
            WardenScopeService wardenScopeService) {
        this.studentRepository = studentRepository;
        this.hostelRepository = hostelRepository;
        this.hostelBedRepository = hostelBedRepository;
        this.hostelAllocationRepository = hostelAllocationRepository;
        this.hostelRequestRepository = hostelRequestRepository;
        this.wardenScopeService = wardenScopeService;
    }

    public ConflictResultDto validate(ConflictCheckRequestDto checkRequest, User actor) {
        ConflictResultDto result = new ConflictResultDto();

        if (checkRequest == null) {
            result.addConflict(new ConflictItemDto(
                    ConflictCode.HOSTEL_REQUEST_INVALID,
                    ConflictDomain.HOSTEL,
                    ConflictSeverity.ERROR,
                    "HostelAllocationRequest",
                    null,
                    "Conflict check request payload must not be null.",
                    "Missing request payload"
            ));
            return result;
        }

        // 1. Resolve Hostel Request (if hostelRequestId provided)
        HostelRequest hostelRequest = null;
        if (checkRequest.getHostelRequestId() != null) {
            Optional<HostelRequest> reqOpt = hostelRequestRepository.findById(checkRequest.getHostelRequestId());
            if (reqOpt.isEmpty()) {
                result.addConflict(new ConflictItemDto(
                        ConflictCode.HOSTEL_REQUEST_INVALID,
                        ConflictDomain.HOSTEL,
                        ConflictSeverity.ERROR,
                        "HostelRequest",
                        checkRequest.getHostelRequestId(),
                        "Hostel request with ID " + checkRequest.getHostelRequestId() + " not found.",
                        "Non-existent hostel request ID"
                ));
            } else {
                hostelRequest = reqOpt.get();
                if (hostelRequest.getStatus() == RequestStatus.REJECTED || hostelRequest.getStatus() == RequestStatus.CANCELLED) {
                    result.addConflict(new ConflictItemDto(
                            ConflictCode.HOSTEL_REQUEST_INVALID,
                            ConflictDomain.HOSTEL,
                            ConflictSeverity.ERROR,
                            "HostelRequest",
                            hostelRequest.getId(),
                            "Cannot allocate bed for hostel request with status: " + hostelRequest.getStatus(),
                            "Request status: " + hostelRequest.getStatus()
                    ));
                }
            }
        }

        // 2. Resolve and Validate Student
        Long studentId = checkRequest.getStudentId();
        if (studentId == null && hostelRequest != null && hostelRequest.getStudent() != null) {
            studentId = hostelRequest.getStudent().getId();
        }

        if (studentId != null) {
            Optional<Student> studentOpt = studentRepository.findById(studentId);
            if (studentOpt.isEmpty()) {
                result.addConflict(new ConflictItemDto(
                        ConflictCode.HOSTEL_REQUEST_INVALID,
                        ConflictDomain.HOSTEL,
                        ConflictSeverity.ERROR,
                        "Student",
                        studentId,
                        "Student not found with ID: " + studentId,
                        "Non-existent student ID"
                ));
            } else {
                Student student = studentOpt.get();
                if (student.getStatus() != null && !"ACTIVE".equalsIgnoreCase(student.getStatus())) {
                    result.addConflict(new ConflictItemDto(
                            ConflictCode.HOSTEL_REQUEST_INVALID,
                            ConflictDomain.HOSTEL,
                            ConflictSeverity.ERROR,
                            "Student",
                            student.getId(),
                            "Student status is '" + student.getStatus() + "' and cannot receive a hostel allocation.",
                            "Student account inactive"
                    ));
                }

                // Check student duplicate active allocation
                List<HostelAllocation> activeStudentAllocations = hostelAllocationRepository.findOverlappingStudentAllocations(
                        student.getId(),
                        AllocationStatus.ACTIVE,
                        checkRequest.getStartDate(),
                        checkRequest.getEndDate(),
                        checkRequest.getExistingAllocationId()
                );
                if (!activeStudentAllocations.isEmpty() ||
                        (checkRequest.getExistingAllocationId() == null &&
                                hostelAllocationRepository.existsByStudentIdAndStatus(student.getId(), AllocationStatus.ACTIVE))) {
                    result.addConflict(new ConflictItemDto(
                            ConflictCode.STUDENT_ALREADY_ALLOCATED,
                            ConflictDomain.HOSTEL,
                            ConflictSeverity.ERROR,
                            "Student",
                            student.getId(),
                            "Student already has an active hostel allocation.",
                            "Student ID: " + student.getId() + " is currently allocated"
                    ));
                }

                // Verify request ownership if hostelRequest provided
                if (hostelRequest != null && hostelRequest.getStudent() != null
                        && !hostelRequest.getStudent().getId().equals(student.getId())) {
                    result.addConflict(new ConflictItemDto(
                            ConflictCode.HOSTEL_REQUEST_INVALID,
                            ConflictDomain.HOSTEL,
                            ConflictSeverity.ERROR,
                            "HostelRequest",
                            hostelRequest.getId(),
                            "Hostel request does not belong to the specified student.",
                            "Student ID mismatch"
                    ));
                }
            }
        }

        // 3. Resolve Target Bed
        Long bedId = checkRequest.getBedId();
        HostelBed bed = null;
        if (checkRequest.getTargetBed() instanceof HostelBed b) {
            bed = b;
            if (bedId == null) {
                bedId = bed.getId();
            }
        } else if (bedId != null) {
            Optional<HostelBed> bedOpt = hostelBedRepository.findById(bedId);
            if (bedOpt.isEmpty()) {
                bedOpt = hostelBedRepository.findByIdWithLock(bedId);
            }
            if (bedOpt.isEmpty()) {
                result.addConflict(new ConflictItemDto(
                        ConflictCode.BED_UNAVAILABLE,
                        ConflictDomain.HOSTEL,
                        ConflictSeverity.ERROR,
                        "HostelBed",
                        bedId,
                        "Hostel bed not found with ID: " + bedId,
                        "Non-existent bed ID"
                ));
            } else {
                bed = bedOpt.get();
            }
        }


        // If bed was resolved, perform comprehensive bed, room, hierarchy, and capacity checks
        Hostel resolvedHostel = null;
        if (bed != null) {
            // 3a. Bed Duplicate Allocation Check
            List<HostelAllocation> activeBedAllocations = hostelAllocationRepository.findOverlappingBedAllocations(
                    bed.getId(),
                    AllocationStatus.ACTIVE,
                    checkRequest.getStartDate(),
                    checkRequest.getEndDate(),
                    checkRequest.getExistingAllocationId()
            );
            if (!activeBedAllocations.isEmpty() ||
                    (checkRequest.getExistingAllocationId() == null &&
                            hostelAllocationRepository.existsByHostelBedIdAndStatus(bed.getId(), AllocationStatus.ACTIVE))) {
                result.addConflict(new ConflictItemDto(
                        ConflictCode.BED_ALREADY_ALLOCATED,
                        ConflictDomain.HOSTEL,
                        ConflictSeverity.ERROR,
                        "HostelBed",
                        bed.getId(),
                        "The selected bed already has an active allocation.",
                        "Bed " + bed.getBedNumber() + " is currently occupied"
                ));
            }

            // 3b. Bed Status / Availability Check
            if (bed.getStatus() == HostelBedStatus.INACTIVE) {
                result.addConflict(new ConflictItemDto(
                        ConflictCode.BED_INACTIVE,
                        ConflictDomain.HOSTEL,
                        ConflictSeverity.ERROR,
                        "HostelBed",
                        bed.getId(),
                        "Bed " + bed.getBedNumber() + " is currently inactive.",
                        "Bed status: INACTIVE"
                ));
            } else if (bed.getStatus() != HostelBedStatus.AVAILABLE) {
                result.addConflict(new ConflictItemDto(
                        ConflictCode.BED_UNAVAILABLE,
                        ConflictDomain.HOSTEL,
                        ConflictSeverity.ERROR,
                        "HostelBed",
                        bed.getId(),
                        "Bed " + bed.getBedNumber() + " is currently " + bed.getStatus() + " and unavailable.",
                        "Bed status: " + bed.getStatus()
                ));
            }

            // 3c. Hierarchy and Room Integrity Check
            HostelRoom room = bed.getRoom();
            if (room == null) {
                result.addConflict(new ConflictItemDto(
                        ConflictCode.INVALID_HOSTEL_HIERARCHY,
                        ConflictDomain.HOSTEL,
                        ConflictSeverity.ERROR,
                        "HostelBed",
                        bed.getId(),
                        "Bed " + bed.getBedNumber() + " is not associated with any room.",
                        "Missing room reference"
                ));
            } else {
                // Room hierarchy mismatch check
                if (checkRequest.getRoomId() != null && !room.getId().equals(checkRequest.getRoomId())) {
                    result.addConflict(new ConflictItemDto(
                            ConflictCode.INVALID_HOSTEL_HIERARCHY,
                            ConflictDomain.HOSTEL,
                            ConflictSeverity.ERROR,
                            "HostelRoom",
                            checkRequest.getRoomId(),
                            "Invalid hostel hierarchy: Bed belongs to room #" + room.getId() + " but request specified room #" + checkRequest.getRoomId() + ".",
                            "Room hierarchy mismatch"
                    ));
                }

                // Room status check
                if (room.getStatus() != null && ("MAINTENANCE".equalsIgnoreCase(room.getStatus()) || "INACTIVE".equalsIgnoreCase(room.getStatus()))) {
                    result.addConflict(new ConflictItemDto(
                            ConflictCode.ROOM_INACTIVE,
                            ConflictDomain.HOSTEL,
                            ConflictSeverity.ERROR,
                            "HostelRoom",
                            room.getId(),
                            "Room " + room.getRoomNumber() + " is currently under " + room.getStatus() + " and cannot receive allocations.",
                            "Room status: " + room.getStatus()
                    ));
                }

                // Room capacity check
                long activeRoomAllocations = hostelAllocationRepository.countByHostelBedRoomIdAndStatus(room.getId(), AllocationStatus.ACTIVE);
                if (room.getCapacity() != null && activeRoomAllocations >= room.getCapacity()) {
                    result.addConflict(new ConflictItemDto(
                            ConflictCode.ROOM_CAPACITY_EXCEEDED,
                            ConflictDomain.HOSTEL,
                            ConflictSeverity.ERROR,
                            "HostelRoom",
                            room.getId(),
                            "Room " + room.getRoomNumber() + " capacity (" + room.getCapacity() + ") has been reached.",
                            "Active room occupancy: " + activeRoomAllocations + "/" + room.getCapacity()
                    ));
                }

                // Floor check
                HostelFloor floor = room.getFloor();
                if (floor == null) {
                    result.addConflict(new ConflictItemDto(
                            ConflictCode.INVALID_HOSTEL_HIERARCHY,
                            ConflictDomain.HOSTEL,
                            ConflictSeverity.ERROR,
                            "HostelFloor",
                            null,
                            "Room " + room.getRoomNumber() + " is not associated with any floor.",
                            "Missing floor reference"
                    ));
                } else {
                    if (floor.getStatus() != null && !"ACTIVE".equalsIgnoreCase(floor.getStatus())) {
                        result.addConflict(new ConflictItemDto(
                                ConflictCode.INVALID_HOSTEL_HIERARCHY,
                                ConflictDomain.HOSTEL,
                                ConflictSeverity.ERROR,
                                "HostelFloor",
                                floor.getId(),
                                "Hostel floor is currently inactive.",
                                "Floor status: " + floor.getStatus()
                        ));
                    }

                    // Block check
                    HostelBlock block = floor.getBlock();
                    if (block == null) {
                        result.addConflict(new ConflictItemDto(
                                ConflictCode.INVALID_HOSTEL_HIERARCHY,
                                ConflictDomain.HOSTEL,
                                ConflictSeverity.ERROR,
                                "HostelBlock",
                                null,
                                "Floor is not associated with any block.",
                                "Missing block reference"
                        ));
                    } else {
                        if (block.getStatus() != null && !"ACTIVE".equalsIgnoreCase(block.getStatus())) {
                            result.addConflict(new ConflictItemDto(
                                    ConflictCode.INVALID_HOSTEL_HIERARCHY,
                                    ConflictDomain.HOSTEL,
                                    ConflictSeverity.ERROR,
                                    "HostelBlock",
                                    block.getId(),
                                    "Hostel block is currently inactive.",
                                    "Block status: " + block.getStatus()
                            ));
                        }
                        resolvedHostel = block.getHostel();
                    }
                }
            }
        }

        // 4. Resolve Hostel and Validate Capacity & Status
        Long targetHostelId = checkRequest.getHostelId();
        if (resolvedHostel != null) {
            if (targetHostelId != null && !resolvedHostel.getId().equals(targetHostelId)) {
                result.addConflict(new ConflictItemDto(
                        ConflictCode.INVALID_HOSTEL_HIERARCHY,
                        ConflictDomain.HOSTEL,
                        ConflictSeverity.ERROR,
                        "Hostel",
                        targetHostelId,
                        "Invalid hostel hierarchy: Bed belongs to hostel #" + resolvedHostel.getId() + " but request specified hostel #" + targetHostelId + ".",
                        "Hostel hierarchy mismatch"
                ));
            }
        } else if (targetHostelId != null) {
            resolvedHostel = hostelRepository.findById(targetHostelId).orElse(null);
        }

        if (resolvedHostel != null) {
            if (resolvedHostel.getStatus() != null && !"ACTIVE".equalsIgnoreCase(resolvedHostel.getStatus())) {
                result.addConflict(new ConflictItemDto(
                        ConflictCode.HOSTEL_INACTIVE,
                        ConflictDomain.HOSTEL,
                        ConflictSeverity.ERROR,
                        "Hostel",
                        resolvedHostel.getId(),
                        "Hostel '" + resolvedHostel.getName() + "' is currently inactive.",
                        "Hostel status: " + resolvedHostel.getStatus()
                ));
            }

            long activeHostelAllocations = hostelAllocationRepository.countByHostelBedRoomFloorBlockHostelIdAndStatus(
                    resolvedHostel.getId(), AllocationStatus.ACTIVE);
            if (resolvedHostel.getCapacity() != null && activeHostelAllocations >= resolvedHostel.getCapacity()) {
                result.addConflict(new ConflictItemDto(
                        ConflictCode.HOSTEL_CAPACITY_EXCEEDED,
                        ConflictDomain.HOSTEL,
                        ConflictSeverity.ERROR,
                        "Hostel",
                        resolvedHostel.getId(),
                        "Hostel '" + resolvedHostel.getName() + "' capacity (" + resolvedHostel.getCapacity() + ") reached.",
                        "Active hostel occupancy: " + activeHostelAllocations + "/" + resolvedHostel.getCapacity()
                ));
            }
        }

        // 5. Warden Scope Validation
        Long effectiveHostelId = resolvedHostel != null ? resolvedHostel.getId() : targetHostelId;
        if (effectiveHostelId != null && actor != null && isWarden(actor) && !isAdminOrPrincipal(actor)) {
            Set<Long> authorizedHostelIds = wardenScopeService.getAuthorizedHostelIds();
            if (!authorizedHostelIds.contains(effectiveHostelId)) {
                result.addConflict(new ConflictItemDto(
                        ConflictCode.WARDEN_SCOPE_VIOLATION,
                        ConflictDomain.HOSTEL,
                        ConflictSeverity.ERROR,
                        "Hostel",
                        effectiveHostelId,
                        "Target hostel is outside your authorized warden scope.",
                        "Warden not assigned to hostel #" + effectiveHostelId
                ));
            }
        }

        return result;
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
