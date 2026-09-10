package com.ahrao.service.hod;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.hod.HodStudentDetailDto;
import com.ahrao.dto.hod.HodStudentReferenceDataDto;
import com.ahrao.dto.hod.HodStudentSummaryDto;
import com.ahrao.dto.hod.HodUpdateStatusRequest;
import com.ahrao.dto.hod.HodUpdateStudentRequest;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Faculty;
import com.ahrao.entity.academic.Program;
import com.ahrao.entity.academic.Section;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.UserStatus;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.ProgramRepository;
import com.ahrao.repository.academic.SectionRepository;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.user.UserRepository;
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
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class HodStudentServiceImpl implements HodStudentService {

    private static final Logger log = LoggerFactory.getLogger(HodStudentServiceImpl.class);

    private final HodDepartmentResolver hodDepartmentResolver;
    private final StudentRepository studentRepository;
    private final ProgramRepository programRepository;
    private final SectionRepository sectionRepository;
    private final UserRepository userRepository;
    private final AcademicResourceRequestRepository academicResourceRequestRepository;
    private final AuditLogRepository auditLogRepository;

    public HodStudentServiceImpl(
            HodDepartmentResolver hodDepartmentResolver,
            StudentRepository studentRepository,
            ProgramRepository programRepository,
            SectionRepository sectionRepository,
            UserRepository userRepository,
            AcademicResourceRequestRepository academicResourceRequestRepository,
            AuditLogRepository auditLogRepository) {
        this.hodDepartmentResolver = hodDepartmentResolver;
        this.studentRepository = studentRepository;
        this.programRepository = programRepository;
        this.sectionRepository = sectionRepository;
        this.userRepository = userRepository;
        this.academicResourceRequestRepository = academicResourceRequestRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public PagedResponse<HodStudentSummaryDto> getStudents(
            Long userId, String search, Long programId, Long sectionId, Integer semester, String status, Pageable pageable) {

        Department department = hodDepartmentResolver.resolveHodDepartment(userId);
        Long departmentId = department.getId();

        // Validate programId if provided
        if (programId != null) {
            Program prog = programRepository.findById(programId)
                    .orElseThrow(() -> new ResourceNotFoundException("Program not found with ID: " + programId));
            if (prog.getDepartment() == null || !prog.getDepartment().getId().equals(departmentId)) {
                throw new ForbiddenException("Requested program does not belong to your authorized department.");
            }
        }

        // Validate sectionId if provided
        if (sectionId != null) {
            Section sec = sectionRepository.findById(sectionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Section not found with ID: " + sectionId));
            if (sec.getProgram() == null || sec.getProgram().getDepartment() == null ||
                    !sec.getProgram().getDepartment().getId().equals(departmentId)) {
                throw new ForbiddenException("Requested section does not belong to your authorized department.");
            }
        }

        Specification<Student> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            // Department scope constraint (MANDATORY)
            predicates.add(cb.equal(root.get("department").get("id"), departmentId));

            if (programId != null) {
                predicates.add(cb.equal(root.get("program").get("id"), programId));
            }

            if (sectionId != null) {
                predicates.add(cb.equal(root.get("section").get("id"), sectionId));
            }

            if (semester != null) {
                predicates.add(cb.equal(root.get("currentSemester"), semester));
            }

            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Join<Student, User> userJoin = root.join("user");
                Predicate regMatch = cb.like(cb.lower(root.get("registerNumber")), pattern);
                Predicate rollMatch = cb.like(cb.lower(root.get("rollNumber")), pattern);
                Predicate firstNameMatch = cb.like(cb.lower(userJoin.get("firstName")), pattern);
                Predicate lastNameMatch = cb.like(cb.lower(userJoin.get("lastName")), pattern);
                Predicate emailMatch = cb.like(cb.lower(userJoin.get("email")), pattern);
                predicates.add(cb.or(regMatch, rollMatch, firstNameMatch, lastNameMatch, emailMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Student> page = studentRepository.findAll(spec, pageable);

        List<HodStudentSummaryDto> dtoList = page.getContent().stream()
                .map(this::mapToSummaryDto)
                .toList();

        return new PagedResponse<>(
                dtoList,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    @Override
    public HodStudentDetailDto getStudentById(Long userId, Long studentId) {
        Department department = hodDepartmentResolver.resolveHodDepartment(userId);
        Long departmentId = department.getId();

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        // Strict department scope verification
        if (student.getDepartment() == null || !student.getDepartment().getId().equals(departmentId)) {
            log.warn("Security Alert: User {} attempted cross-department student access for studentId={}", userId, studentId);
            throw new ForbiddenException("Access denied: Student does not belong to your authorized department.");
        }

        HodStudentDetailDto dto = new HodStudentDetailDto();
        dto.setId(student.getId());
        User u = student.getUser();
        if (u != null) {
            dto.setUserId(u.getId());
            dto.setFirstName(u.getFirstName());
            dto.setLastName(u.getLastName());
            dto.setFullName((u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "")).trim());
            dto.setEmail(u.getEmail());
            dto.setPhone(u.getPhone());
        }
        dto.setRegisterNumber(student.getRegisterNumber());
        dto.setRollNumber(student.getRollNumber());
        dto.setAdmissionYear(student.getAdmissionYear());
        dto.setCurrentSemester(student.getCurrentSemester());
        dto.setStatus(student.getStatus());
        dto.setDepartmentId(department.getId());
        dto.setDepartmentName(department.getName());
        dto.setDepartmentCode(department.getCode());

        if (student.getProgram() != null) {
            dto.setProgramId(student.getProgram().getId());
            dto.setProgramCode(student.getProgram().getCode());
            dto.setProgramName(student.getProgram().getName());
            dto.setDegreeType(student.getProgram().getDegreeType() != null ? student.getProgram().getDegreeType().name() : "N/A");
        }

        if (student.getSection() != null) {
            dto.setSectionId(student.getSection().getId());
            dto.setSectionName(student.getSection().getName());
        }

        // Recent resource requests made by student
        if (u != null) {
            List<AcademicResourceRequest> requests = academicResourceRequestRepository.findByRequesterUserId(u.getId());
            List<HodStudentDetailDto.StudentRequestItem> reqItems = requests.stream()
                    .sorted((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()))
                    .limit(5)
                    .map(r -> {
                        HodStudentDetailDto.StudentRequestItem ri = new HodStudentDetailDto.StudentRequestItem();
                        ri.setRequestId(r.getId());
                        if (r.getRequestedResource() != null) {
                            ri.setResourceName(r.getRequestedResource().getName());
                            ri.setResourceCode(r.getRequestedResource().getCode());
                        } else {
                            ri.setResourceName("Academic Resource");
                            ri.setResourceCode("N/A");
                        }
                        ri.setPurpose(r.getPurpose());
                        ri.setRequestedDate(r.getRequestedDate());
                        ri.setPriority(r.getPriority() != null ? r.getPriority().name() : "NORMAL");
                        ri.setStatus(r.getStatus() != null ? r.getStatus().name() : "PENDING");
                        ri.setCreatedAt(r.getCreatedAt());
                        return ri;
                    })
                    .toList();
            dto.setRecentRequests(reqItems);
        }

        return dto;
    }

    @Override
    public HodStudentReferenceDataDto getReferenceData(Long userId) {
        Department department = hodDepartmentResolver.resolveHodDepartment(userId);
        Long departmentId = department.getId();

        List<Program> programs = programRepository.findByDepartmentId(departmentId);
        List<Section> sections = sectionRepository.findByProgramDepartmentId(departmentId);

        HodStudentReferenceDataDto refData = new HodStudentReferenceDataDto();
        refData.setPrograms(programs.stream()
                .map(p -> new HodStudentReferenceDataDto.ProgramOption(
                        p.getId(),
                        p.getCode(),
                        p.getName(),
                        p.getDegreeType() != null ? p.getDegreeType().name() : "N/A"))
                .toList());

        refData.setSections(sections.stream()
                .map(s -> new HodStudentReferenceDataDto.SectionOption(
                        s.getId(),
                        s.getName(),
                        s.getProgram() != null ? s.getProgram().getId() : null,
                        s.getProgram() != null ? s.getProgram().getCode() : null))
                .toList());

        return refData;
    }

    @Override
    @Transactional
    public HodStudentSummaryDto updateStudentStatus(Long userId, Long studentId, HodUpdateStatusRequest request) {
        Department department = hodDepartmentResolver.resolveHodDepartment(userId);
        Long departmentId = department.getId();
        Faculty hodFaculty = hodDepartmentResolver.resolveHodFaculty(userId);

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        if (student.getDepartment() == null || !student.getDepartment().getId().equals(departmentId)) {
            log.warn("Security Alert: User {} attempted cross-department student status change for studentId={}", userId, studentId);
            throw new ForbiddenException("Access denied: Student does not belong to your authorized department.");
        }

        String oldStatus = student.getStatus();
        String newStatus = request.getStatus().toUpperCase();

        student.setStatus(newStatus);
        User u = student.getUser();
        if (u != null) {
            u.setStatus(UserStatus.valueOf(newStatus));
            userRepository.save(u);
        }
        studentRepository.save(student);

        // Audit Event
        AuditLog auditLog = new AuditLog();
        auditLog.setUser(hodFaculty.getUser());
        auditLog.setAction("HOD_STUDENT_STATUS_CHANGED");
        auditLog.setEntityType("Student");
        auditLog.setEntityId(student.getId());
        auditLog.setOldValue(oldStatus);
        auditLog.setNewValue(newStatus);
        auditLog.setCreatedAt(Instant.now());
        auditLogRepository.save(auditLog);

        log.info("HOD (userId={}) updated status of studentId={} from {} to {}", userId, studentId, oldStatus, newStatus);
        return mapToSummaryDto(student);
    }

    @Override
    @Transactional
    public HodStudentDetailDto updateStudentProfile(Long userId, Long studentId, HodUpdateStudentRequest request) {
        Department department = hodDepartmentResolver.resolveHodDepartment(userId);
        Long departmentId = department.getId();
        Faculty hodFaculty = hodDepartmentResolver.resolveHodFaculty(userId);

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        if (student.getDepartment() == null || !student.getDepartment().getId().equals(departmentId)) {
            log.warn("Security Alert: User {} attempted cross-department student update for studentId={}", userId, studentId);
            throw new ForbiddenException("Access denied: Student does not belong to your authorized department.");
        }

        if (request.getRollNumber() != null) {
            student.setRollNumber(request.getRollNumber().trim());
        }

        if (request.getCurrentSemester() != null) {
            student.setCurrentSemester(request.getCurrentSemester());
        }

        if (request.getSectionId() != null) {
            Section section = sectionRepository.findById(request.getSectionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Section not found with ID: " + request.getSectionId()));
            if (section.getProgram() == null || section.getProgram().getDepartment() == null ||
                    !section.getProgram().getDepartment().getId().equals(departmentId)) {
                throw new ForbiddenException("Selected section does not belong to a program in your authorized department.");
            }
            student.setSection(section);
        }

        studentRepository.save(student);

        // Audit Event
        AuditLog auditLog = new AuditLog();
        auditLog.setUser(hodFaculty.getUser());
        auditLog.setAction("HOD_STUDENT_UPDATED");
        auditLog.setEntityType("Student");
        auditLog.setEntityId(student.getId());
        auditLog.setNewValue(String.format("rollNumber=%s, semester=%s", student.getRollNumber(), student.getCurrentSemester()));
        auditLog.setCreatedAt(Instant.now());
        auditLogRepository.save(auditLog);

        log.info("HOD (userId={}) updated permitted student fields for studentId={}", userId, studentId);
        return getStudentById(userId, studentId);
    }

    private HodStudentSummaryDto mapToSummaryDto(Student student) {
        HodStudentSummaryDto dto = new HodStudentSummaryDto();
        dto.setId(student.getId());
        User u = student.getUser();
        if (u != null) {
            dto.setUserId(u.getId());
            dto.setFullName((u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "")).trim());
            dto.setEmail(u.getEmail());
            dto.setPhone(u.getPhone());
        } else {
            dto.setFullName("Student #" + student.getId());
            dto.setEmail("N/A");
        }
        dto.setRegisterNumber(student.getRegisterNumber());
        dto.setRollNumber(student.getRollNumber());
        dto.setCurrentSemester(student.getCurrentSemester());
        dto.setAdmissionYear(student.getAdmissionYear());
        dto.setStatus(student.getStatus());

        if (student.getProgram() != null) {
            dto.setProgramId(student.getProgram().getId());
            dto.setProgramCode(student.getProgram().getCode());
            dto.setProgramName(student.getProgram().getName());
            dto.setDegreeType(student.getProgram().getDegreeType() != null ? student.getProgram().getDegreeType().name() : "N/A");
        }

        if (student.getSection() != null) {
            dto.setSectionId(student.getSection().getId());
            dto.setSectionName(student.getSection().getName());
        }

        return dto;
    }
}
