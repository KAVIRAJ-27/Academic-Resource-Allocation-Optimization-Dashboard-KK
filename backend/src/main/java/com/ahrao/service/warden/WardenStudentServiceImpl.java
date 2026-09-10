package com.ahrao.service.warden;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.WardenStudentSearchDto;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Program;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.allocation.HostelAllocation;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.hostel.HostelBed;
import com.ahrao.entity.hostel.HostelBlock;
import com.ahrao.entity.hostel.HostelFloor;
import com.ahrao.entity.hostel.HostelRoom;
import com.ahrao.entity.user.User;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class WardenStudentServiceImpl implements WardenStudentService {

    private final StudentRepository studentRepository;
    private final HostelAllocationRepository hostelAllocationRepository;
    private final WardenScopeService wardenScopeService;

    public WardenStudentServiceImpl(
            StudentRepository studentRepository,
            HostelAllocationRepository hostelAllocationRepository,
            WardenScopeService wardenScopeService) {
        this.studentRepository = studentRepository;
        this.hostelAllocationRepository = hostelAllocationRepository;
        this.wardenScopeService = wardenScopeService;
    }

    @Override
    public PagedResponse<WardenStudentSearchDto> searchStudents(
            String search,
            Long departmentId,
            Long programId,
            Pageable pageable) {

        // Validate that caller is authorized active Warden
        wardenScopeService.resolveWarden();

        Specification<Student> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            Join<Student, User> userJoin = root.join("user");

            // Eligible students must be active
            predicates.add(cb.equal(cb.upper(root.get("status")), "ACTIVE"));
            predicates.add(cb.equal(userJoin.get("status"), UserStatus.ACTIVE));

            if (departmentId != null) {
                predicates.add(cb.equal(root.get("department").get("id"), departmentId));
            }

            if (programId != null) {
                predicates.add(cb.equal(root.get("program").get("id"), programId));
            }

            if (search != null && !search.trim().isEmpty()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                Predicate regMatch = cb.like(cb.lower(root.get("registerNumber")), term);
                Predicate rollMatch = cb.like(cb.lower(root.get("rollNumber")), term);
                Predicate firstNameMatch = cb.like(cb.lower(userJoin.get("firstName")), term);
                Predicate lastNameMatch = cb.like(cb.lower(userJoin.get("lastName")), term);
                Predicate emailMatch = cb.like(cb.lower(userJoin.get("email")), term);
                predicates.add(cb.or(regMatch, rollMatch, firstNameMatch, lastNameMatch, emailMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Student> page = studentRepository.findAll(spec, pageable);

        List<WardenStudentSearchDto> content = page.getContent().stream()
                .map(this::mapToSearchDto)
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

    private WardenStudentSearchDto mapToSearchDto(Student student) {
        WardenStudentSearchDto dto = new WardenStudentSearchDto();
        dto.setId(student.getId());
        dto.setRegisterNumber(student.getRegisterNumber());
        dto.setRollNumber(student.getRollNumber());
        dto.setAdmissionYear(student.getAdmissionYear());
        dto.setCurrentSemester(student.getCurrentSemester());
        dto.setStudentStatus(student.getStatus());

        User user = student.getUser();
        if (user != null) {
            dto.setName(user.getFirstName() + " " + user.getLastName());
            dto.setEmail(user.getEmail());
            dto.setPhone(user.getPhone());
        }

        Department dept = student.getDepartment();
        if (dept != null) {
            dto.setDepartmentId(dept.getId());
            dto.setDepartmentName(dept.getName());
            dto.setDepartmentCode(dept.getCode());
        }

        Program prog = student.getProgram();
        if (prog != null) {
            dto.setProgramId(prog.getId());
            dto.setProgramName(prog.getName());
            dto.setProgramCode(prog.getCode());
        }

        if (student.getSection() != null) {
            dto.setSectionName(student.getSection().getName());
        }

        Optional<HostelAllocation> activeAllocOpt = hostelAllocationRepository
                .findByStudentIdAndStatus(student.getId(), AllocationStatus.ACTIVE);

        if (activeAllocOpt.isPresent()) {
            dto.setHasActiveAllocation(true);
            HostelAllocation alloc = activeAllocOpt.get();
            WardenStudentSearchDto.ActiveAllocationInfoDto allocInfo = new WardenStudentSearchDto.ActiveAllocationInfoDto();
            allocInfo.setAllocationId(alloc.getId());
            allocInfo.setStatus(alloc.getStatus() != null ? alloc.getStatus().name() : "ACTIVE");
            allocInfo.setStartDate(alloc.getStartDate() != null ? alloc.getStartDate().toString() : null);

            HostelBed bed = alloc.getBed();
            if (bed != null) {
                allocInfo.setBedNumber(bed.getBedNumber());
                HostelRoom room = bed.getRoom();
                if (room != null) {
                    allocInfo.setRoomNumber(room.getRoomNumber());
                    HostelFloor floor = room.getFloor();
                    if (floor != null && floor.getBlock() != null) {
                        HostelBlock block = floor.getBlock();
                        allocInfo.setBlockName(block.getName());
                        if (block.getHostel() != null) {
                            allocInfo.setHostelId(block.getHostel().getId());
                            allocInfo.setHostelName(block.getHostel().getName());
                        }
                    }
                }
            }

            dto.setActiveAllocation(allocInfo);
        } else {
            dto.setHasActiveAllocation(false);
        }

        return dto;
    }
}
