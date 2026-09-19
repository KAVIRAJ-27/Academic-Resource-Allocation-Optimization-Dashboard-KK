package com.ahrao.service.student;

import com.ahrao.dto.student.hostel.*;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.allocation.HostelAllocation;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.HostelBedStatus;
import com.ahrao.entity.hostel.*;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
import com.ahrao.repository.hostel.HostelFacilityRepository;
import com.ahrao.repository.hostel.WardenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudentHostelServiceImpl implements StudentHostelService {

    private final StudentRepository studentRepository;
    private final HostelAllocationRepository hostelAllocationRepository;
    private final HostelBedRepository hostelBedRepository;
    private final HostelFacilityRepository hostelFacilityRepository;
    private final WardenRepository wardenRepository;

    public StudentHostelServiceImpl(
            StudentRepository studentRepository,
            HostelAllocationRepository hostelAllocationRepository,
            HostelBedRepository hostelBedRepository,
            HostelFacilityRepository hostelFacilityRepository,
            WardenRepository wardenRepository) {
        this.studentRepository = studentRepository;
        this.hostelAllocationRepository = hostelAllocationRepository;
        this.hostelBedRepository = hostelBedRepository;
        this.hostelFacilityRepository = hostelFacilityRepository;
        this.wardenRepository = wardenRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public StudentHostelResponse getStudentHostel(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for authenticated user ID: " + userId));

        StudentHostelResponse response = new StudentHostelResponse();

        // 1. Fetch historical allocations
        List<HostelAllocation> allAllocations = hostelAllocationRepository.findByStudentId(student.getId());
        List<StudentHostelAllocationHistoryDto> historyList = allAllocations.stream()
                .sorted(Comparator.comparing(HostelAllocation::getStartDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapToHistoryDto)
                .collect(Collectors.toList());
        response.setHistory(historyList);

        // 2. Fetch active allocation
        Optional<HostelAllocation> activeAllocOpt = hostelAllocationRepository
                .findByStudentIdAndStatus(student.getId(), AllocationStatus.ACTIVE);

        if (activeAllocOpt.isEmpty()) {
            response.setAllocated(false);
            return response;
        }

        HostelAllocation allocation = activeAllocOpt.get();
        response.setAllocated(true);

        // 3. Map allocation metadata
        StudentHostelAllocationDto allocDto = new StudentHostelAllocationDto();
        allocDto.setId(allocation.getId());
        allocDto.setStatus(allocation.getStatus() != null ? allocation.getStatus().name() : "ACTIVE");
        allocDto.setStartDate(allocation.getStartDate());
        allocDto.setEndDate(allocation.getEndDate());
        allocDto.setAllocatedAt(allocation.getAllocatedAt());
        allocDto.setReleasedAt(allocation.getReleasedAt());
        if (allocation.getAcademicYear() != null) {
            allocDto.setAcademicYearName(allocation.getAcademicYear().getName());
        }
        response.setCurrentAllocation(allocDto);

        // 4. Map hierarchy: Bed -> Room -> Floor -> Block -> Hostel
        HostelBed bed = allocation.getBed();
        if (bed != null) {
            StudentHostelBedDto bedDto = new StudentHostelBedDto();
            bedDto.setId(bed.getId());
            bedDto.setBedNumber(bed.getBedNumber());
            bedDto.setStatus(bed.getStatus() != null ? bed.getStatus().name() : "OCCUPIED");
            response.setBed(bedDto);

            HostelRoom room = bed.getRoom();
            if (room != null) {
                StudentHostelRoomDto roomDto = new StudentHostelRoomDto();
                roomDto.setId(room.getId());
                roomDto.setRoomNumber(room.getRoomNumber());
                roomDto.setRoomType(room.getRoomType() != null ? room.getRoomType().name() : "STANDARD");
                roomDto.setCapacity(room.getCapacity());
                roomDto.setStatus(room.getStatus());

                // Efficient room occupancy query without loading all students
                long occupiedBeds = hostelBedRepository.countByRoomIdAndStatus(room.getId(), HostelBedStatus.OCCUPIED);
                roomDto.setCurrentOccupancy((int) occupiedBeds);
                response.setRoom(roomDto);

                HostelFloor floor = room.getFloor();
                if (floor != null) {
                    StudentHostelFloorDto floorDto = new StudentHostelFloorDto();
                    floorDto.setId(floor.getId());
                    floorDto.setName(floor.getName());
                    floorDto.setFloorNumber(floor.getFloorNumber());
                    floorDto.setStatus(floor.getStatus());
                    response.setFloor(floorDto);

                    HostelBlock block = floor.getBlock();
                    if (block != null) {
                        StudentHostelBlockDto blockDto = new StudentHostelBlockDto();
                        blockDto.setId(block.getId());
                        blockDto.setName(block.getName());
                        blockDto.setCode(block.getCode());
                        blockDto.setNumberOfFloors(block.getNumberOfFloors());
                        blockDto.setStatus(block.getStatus());
                        response.setBlock(blockDto);

                        Hostel hostel = block.getHostel();
                        if (hostel != null) {
                            StudentHostelDetailsDto hostelDto = new StudentHostelDetailsDto();
                            hostelDto.setId(hostel.getId());
                            hostelDto.setName(hostel.getName());
                            hostelDto.setCode(hostel.getCode());
                            hostelDto.setType(hostel.getType() != null ? hostel.getType().name() : "GENERAL");
                            hostelDto.setAddress(hostel.getAddress());
                            hostelDto.setCapacity(hostel.getCapacity());
                            hostelDto.setStatus(hostel.getStatus());
                            response.setHostel(hostelDto);

                            // 5. Facilities for this specific allocated hostel
                            List<HostelFacility> facilities = hostelFacilityRepository.findByHostelId(hostel.getId());
                            List<StudentHostelFacilityDto> facilityDtos = facilities.stream()
                                    .filter(f -> !"INACTIVE".equalsIgnoreCase(f.getStatus()))
                                    .map(f -> {
                                        StudentHostelFacilityDto fd = new StudentHostelFacilityDto();
                                        fd.setId(f.getId());
                                        fd.setName(f.getName());
                                        fd.setDescription(f.getDescription());
                                        fd.setQuantity(f.getQuantity());
                                        fd.setStatus(f.getStatus());
                                        return fd;
                                    })
                                    .collect(Collectors.toList());
                            response.setFacilities(facilityDtos);

                            // 6. Wardens assigned to this hostel (student-safe fields only)
                            List<Warden> wardens = wardenRepository.findByAssignedHostelsId(hostel.getId());
                            List<StudentHostelWardenDto> wardenDtos = wardens.stream()
                                    .filter(w -> "ACTIVE".equalsIgnoreCase(w.getStatus()))
                                    .map(w -> {
                                        StudentHostelWardenDto wd = new StudentHostelWardenDto();
                                        wd.setId(w.getId());
                                        if (w.getUser() != null) {
                                            wd.setName(w.getUser().getFirstName() + " " + w.getUser().getLastName());
                                            wd.setEmail(w.getUser().getEmail());
                                        } else {
                                            wd.setName("Hostel Warden");
                                        }
                                        wd.setEmployeeId(w.getEmployeeId());
                                        wd.setContactNumber(w.getContactNumber());
                                        return wd;
                                    })
                                    .collect(Collectors.toList());
                            response.setWardens(wardenDtos);
                        }
                    }
                }
            }
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentHostelAllocationHistoryDto> getStudentHostelHistory(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for authenticated user ID: " + userId));

        List<HostelAllocation> allocations = hostelAllocationRepository.findByStudentId(student.getId());
        return allocations.stream()
                .sorted(Comparator.comparing(HostelAllocation::getStartDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapToHistoryDto)
                .collect(Collectors.toList());
    }

    private StudentHostelAllocationHistoryDto mapToHistoryDto(HostelAllocation alloc) {
        StudentHostelAllocationHistoryDto dto = new StudentHostelAllocationHistoryDto();
        dto.setId(alloc.getId());
        dto.setStartDate(alloc.getStartDate());
        dto.setEndDate(alloc.getEndDate());
        dto.setStatus(alloc.getStatus() != null ? alloc.getStatus().name() : "UNKNOWN");
        if (alloc.getAcademicYear() != null) {
            dto.setAcademicYearName(alloc.getAcademicYear().getName());
        }

        if (alloc.getBed() != null) {
            dto.setBedNumber(alloc.getBed().getBedNumber());
            if (alloc.getBed().getRoom() != null) {
                dto.setRoomNumber(alloc.getBed().getRoom().getRoomNumber());
                if (alloc.getBed().getRoom().getFloor() != null &&
                    alloc.getBed().getRoom().getFloor().getBlock() != null) {
                    dto.setBlockName(alloc.getBed().getRoom().getFloor().getBlock().getName());
                    if (alloc.getBed().getRoom().getFloor().getBlock().getHostel() != null) {
                        dto.setHostelName(alloc.getBed().getRoom().getFloor().getBlock().getHostel().getName());
                    }
                }
            }
        }
        return dto;
    }
}
