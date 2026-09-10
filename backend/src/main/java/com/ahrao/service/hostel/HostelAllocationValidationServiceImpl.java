package com.ahrao.service.hostel;

import com.ahrao.dto.hostel.allocation.HostelAllocationConflictDto;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.allocation.HostelAllocation;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.HostelBedStatus;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.enums.UserStatus;
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
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
import com.ahrao.repository.hostel.HostelRepository;
import com.ahrao.repository.request.HostelRequestRepository;
import com.ahrao.service.warden.WardenScopeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class HostelAllocationValidationServiceImpl implements HostelAllocationValidationService {

    private static final Logger log = LoggerFactory.getLogger(HostelAllocationValidationServiceImpl.class);

    private final StudentRepository studentRepository;
    private final HostelRepository hostelRepository;
    private final HostelBedRepository hostelBedRepository;
    private final HostelAllocationRepository hostelAllocationRepository;
    private final HostelRequestRepository hostelRequestRepository;
    private final WardenScopeService wardenScopeService;

    public HostelAllocationValidationServiceImpl(
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

    @Override
    public Student validateStudentEligibility(Long studentId) {
        if (studentId == null) {
            throw new BadRequestException("Student ID is required.");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        if (student.getStatus() != null && !"ACTIVE".equalsIgnoreCase(student.getStatus())) {
            throw new ConflictException("STUDENT_INACTIVE: Student status is '" + student.getStatus() + "' and cannot receive a hostel allocation.");
        }

        if (student.getUser() != null && student.getUser().getStatus() != UserStatus.ACTIVE) {
            throw new ConflictException("STUDENT_INACTIVE: Student user account is not active.");
        }

        if (hostelAllocationRepository.existsByStudentIdAndStatus(student.getId(), AllocationStatus.ACTIVE)) {
            throw new ConflictException("STUDENT_ALREADY_ALLOCATED: Student already has an active hostel allocation.");
        }

        return student;
    }

    @Override
    public void validateHostelScope(Long hostelId, User actor) {
        if (hostelId == null) {
            throw new BadRequestException("Hostel ID is required.");
        }

        Hostel hostel = hostelRepository.findById(hostelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel not found with ID: " + hostelId));

        if (hostel.getStatus() != null && !"ACTIVE".equalsIgnoreCase(hostel.getStatus())) {
            throw new ConflictException("HOSTEL_INACTIVE: Hostel is currently inactive.");
        }

        if (actor != null && isWarden(actor) && !isAdminOrPrincipal(actor)) {
            Set<Long> authorizedHostelIds = wardenScopeService.getAuthorizedHostelIds();
            if (!authorizedHostelIds.contains(hostelId)) {
                throw new ForbiddenException("UNAUTHORIZED_HOSTEL_SCOPE: Target hostel '" + hostel.getName() + "' is outside your authorized warden scope.");
            }
        }
    }

    @Override
    public void validateHierarchy(HostelBed bed, Long roomId, Long hostelId) {
        if (bed == null) {
            throw new BadRequestException("Bed cannot be null.");
        }

        if (bed.getStatus() == null || bed.getStatus() != HostelBedStatus.AVAILABLE) {
            throw new ConflictException("BED_NOT_AVAILABLE: Bed is currently " + bed.getStatus() + ".");
        }

        HostelRoom room = bed.getRoom();
        if (room == null) {
            throw new BadRequestException("Bed is not associated with any room.");
        }

        if (room.getStatus() != null && ("MAINTENANCE".equalsIgnoreCase(room.getStatus()) || "INACTIVE".equalsIgnoreCase(room.getStatus()))) {
            throw new ConflictException("ROOM_INACTIVE: Room " + room.getRoomNumber() + " is currently " + room.getStatus() + ".");
        }

        if (roomId != null && !room.getId().equals(roomId)) {
            throw new BadRequestException("Invalid hostel hierarchy: Bed belongs to room " + room.getId() + " but request specified room " + roomId + ".");
        }

        HostelFloor floor = room.getFloor();
        if (floor == null) {
            throw new BadRequestException("Room is not associated with any floor.");
        }

        if (floor.getStatus() != null && !"ACTIVE".equalsIgnoreCase(floor.getStatus())) {
            throw new ConflictException("HOSTEL_FLOOR_INACTIVE: Hostel floor is currently inactive.");
        }

        HostelBlock block = floor.getBlock();
        if (block == null) {
            throw new BadRequestException("Floor is not associated with any block.");
        }

        if (block.getStatus() != null && !"ACTIVE".equalsIgnoreCase(block.getStatus())) {
            throw new ConflictException("HOSTEL_BLOCK_INACTIVE: Hostel block is currently inactive.");
        }

        Hostel hostel = block.getHostel();
        if (hostel == null) {
            throw new BadRequestException("Block is not associated with any hostel.");
        }

        if (hostel.getStatus() != null && !"ACTIVE".equalsIgnoreCase(hostel.getStatus())) {
            throw new ConflictException("HOSTEL_INACTIVE: Hostel is currently inactive.");
        }

        if (hostelId != null && !hostel.getId().equals(hostelId)) {
            throw new BadRequestException("Invalid hostel hierarchy: Bed belongs to hostel " + hostel.getId() + " but request specified hostel " + hostelId + ".");
        }
    }

    @Override
    public void validateBedAvailability(HostelBed bed) {
        if (bed == null) {
            throw new BadRequestException("Bed cannot be null.");
        }

        if (bed.getStatus() != HostelBedStatus.AVAILABLE) {
            throw new ConflictException("BED_NOT_AVAILABLE: Bed is no longer available. Current status: " + bed.getStatus());
        }

        if (hostelAllocationRepository.existsByHostelBedIdAndStatus(bed.getId(), AllocationStatus.ACTIVE)) {
            throw new ConflictException("BED_ALREADY_ALLOCATED: Bed is already allocated.");
        }
    }

    @Override
    public void validateRoomCapacity(HostelRoom room) {
        if (room == null) {
            throw new BadRequestException("Room cannot be null.");
        }

        if (room.getStatus() != null && ("MAINTENANCE".equalsIgnoreCase(room.getStatus()) || "INACTIVE".equalsIgnoreCase(room.getStatus()))) {
            throw new ConflictException("ROOM_INACTIVE: Room " + room.getRoomNumber() + " is currently under " + room.getStatus() + " and cannot receive allocations.");
        }

        long activeRoomAllocations = hostelAllocationRepository.countByHostelBedRoomIdAndStatus(room.getId(), AllocationStatus.ACTIVE);
        if (activeRoomAllocations >= room.getCapacity()) {
            throw new ConflictException("ROOM_CAPACITY_EXCEEDED: Room has no available bed. Room capacity (" + room.getCapacity() + ") has been reached.");
        }
    }

    @Override
    public void validateHostelCapacity(Hostel hostel) {
        if (hostel == null) {
            return;
        }

        if (hostel.getStatus() != null && !"ACTIVE".equalsIgnoreCase(hostel.getStatus())) {
            throw new ConflictException("HOSTEL_INACTIVE: Hostel is currently inactive.");
        }

        long activeHostelAllocations = hostelAllocationRepository.countByHostelBedRoomFloorBlockHostelIdAndStatus(
                hostel.getId(), AllocationStatus.ACTIVE);

        if (hostel.getCapacity() != null && activeHostelAllocations >= hostel.getCapacity()) {
            throw new ConflictException("HOSTEL_CAPACITY_EXCEEDED: Hostel capacity (" + hostel.getCapacity() + ") has been reached. No vacancy remaining.");
        }
    }

    @Override
    public HostelRequest validateHostelRequest(Long hostelRequestId, Long expectedStudentId) {
        if (hostelRequestId == null) {
            return null;
        }

        HostelRequest request = hostelRequestRepository.findById(hostelRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel request not found with ID: " + hostelRequestId));

        if (request.getStatus() == RequestStatus.REJECTED || request.getStatus() == RequestStatus.CANCELLED) {
            throw new ConflictException("Cannot allocate bed for request with status: " + request.getStatus());
        }

        if (expectedStudentId != null && request.getStudent() != null && !request.getStudent().getId().equals(expectedStudentId)) {
            throw new BadRequestException("Hostel request does not belong to the specified student.");
        }

        return request;
    }

    @Override
    public List<HostelAllocationConflictDto> collectConflicts(Student student, HostelBed bed, Long hostelId, User actor) {
        List<HostelAllocationConflictDto> conflicts = new ArrayList<>();

        if (student != null) {
            if (student.getStatus() != null && !"ACTIVE".equalsIgnoreCase(student.getStatus())) {
                conflicts.add(new HostelAllocationConflictDto("STUDENT_INACTIVE", "STUDENT", student.getId(), "Student is not active."));
            }
            if (hostelAllocationRepository.existsByStudentIdAndStatus(student.getId(), AllocationStatus.ACTIVE)) {
                conflicts.add(new HostelAllocationConflictDto("STUDENT_ALREADY_ALLOCATED", "STUDENT", student.getId(), "Student already has an active hostel allocation."));
            }
        }

        if (hostelId != null) {
            Hostel h = hostelRepository.findById(hostelId).orElse(null);
            if (h != null) {
                if (h.getStatus() != null && !"ACTIVE".equalsIgnoreCase(h.getStatus())) {
                    conflicts.add(new HostelAllocationConflictDto("HOSTEL_INACTIVE", "HOSTEL", h.getId(), "Hostel is currently inactive."));
                }
                long activeHostelAllocations = hostelAllocationRepository.countByHostelBedRoomFloorBlockHostelIdAndStatus(h.getId(), AllocationStatus.ACTIVE);
                if (h.getCapacity() != null && activeHostelAllocations >= h.getCapacity()) {
                    conflicts.add(new HostelAllocationConflictDto("HOSTEL_CAPACITY_EXCEEDED", "HOSTEL", h.getId(), "Hostel capacity (" + h.getCapacity() + ") reached."));
                }
            }

            if (actor != null && isWarden(actor) && !isAdminOrPrincipal(actor)) {
                Set<Long> authorizedHostelIds = wardenScopeService.getAuthorizedHostelIds();
                if (!authorizedHostelIds.contains(hostelId)) {
                    conflicts.add(new HostelAllocationConflictDto("UNAUTHORIZED_HOSTEL_SCOPE", "HOSTEL", hostelId, "Hostel is outside your authorized scope."));
                }
            }
        }

        if (bed != null) {
            if (bed.getStatus() != HostelBedStatus.AVAILABLE) {
                conflicts.add(new HostelAllocationConflictDto("BED_UNAVAILABLE", "HOSTEL_BED", bed.getId(), "Bed is currently " + bed.getStatus() + "."));
            }
            if (hostelAllocationRepository.existsByHostelBedIdAndStatus(bed.getId(), AllocationStatus.ACTIVE)) {
                conflicts.add(new HostelAllocationConflictDto("BED_ALREADY_ALLOCATED", "HOSTEL_BED", bed.getId(), "Bed already has an active allocation."));
            }

            HostelRoom room = bed.getRoom();
            if (room != null) {
                if (room.getStatus() != null && ("MAINTENANCE".equalsIgnoreCase(room.getStatus()) || "INACTIVE".equalsIgnoreCase(room.getStatus()))) {
                    conflicts.add(new HostelAllocationConflictDto("ROOM_INACTIVE", "HOSTEL_ROOM", room.getId(), "Room is currently under " + room.getStatus() + "."));
                }
                long activeRoomAllocations = hostelAllocationRepository.countByHostelBedRoomIdAndStatus(room.getId(), AllocationStatus.ACTIVE);
                if (activeRoomAllocations >= room.getCapacity()) {
                    conflicts.add(new HostelAllocationConflictDto("ROOM_CAPACITY_EXCEEDED", "HOSTEL_ROOM", room.getId(), "Room capacity (" + room.getCapacity() + ") reached."));
                }
            }
        }

        return conflicts;
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
