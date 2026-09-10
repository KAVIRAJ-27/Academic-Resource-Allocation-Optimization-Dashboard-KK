package com.ahrao.service.student;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.student.academic.*;
import com.ahrao.entity.academic.*;
import com.ahrao.entity.enums.SubjectType;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.FacultySubjectAssignmentRepository;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.academic.SubjectRepository;
import com.ahrao.repository.academic.TimetableEntryRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class StudentAcademicServiceImpl implements StudentAcademicService {

    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final FacultySubjectAssignmentRepository assignmentRepository;
    private final TimetableEntryRepository timetableEntryRepository;

    private static final List<String> DAYS_ORDER = List.of(
            "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
    );

    public StudentAcademicServiceImpl(StudentRepository studentRepository,
                                     SubjectRepository subjectRepository,
                                     FacultySubjectAssignmentRepository assignmentRepository,
                                     TimetableEntryRepository timetableEntryRepository) {
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.assignmentRepository = assignmentRepository;
        this.timetableEntryRepository = timetableEntryRepository;
    }

    @Override
    public StudentAcademicResponse getAcademicOverview(Long userId) {
        Student student = resolveStudent(userId);

        StudentAcademicOverviewDto overview = mapToOverview(student);

        // Calculate available semesters for the student's program (durationYears * 2)
        List<Integer> availableSemesters = new ArrayList<>();
        int maxSem = (student.getProgram() != null && student.getProgram().getDurationYears() != null)
                ? student.getProgram().getDurationYears() * 2 : 8;
        for (int i = 1; i <= maxSem; i++) {
            availableSemesters.add(i);
        }

        // Get subjects for the student's program and current semester
        List<StudentSubjectDto> subjects = new ArrayList<>();
        if (student.getProgram() != null) {
            Specification<Subject> spec = (root, query, cb) -> {
                List<Predicate> predicates = new ArrayList<>();
                predicates.add(cb.equal(root.get("program").get("id"), student.getProgram().getId()));
                if (student.getCurrentSemester() != null) {
                    predicates.add(cb.equal(root.get("semester").get("number"), student.getCurrentSemester()));
                }
                return cb.and(predicates.toArray(new Predicate[0]));
            };

            List<Subject> currentSubjects = subjectRepository.findAll(spec);
            Long sectionId = student.getSection() != null ? student.getSection().getId() : null;
            subjects = currentSubjects.stream()
                    .map(sub -> mapSubjectToDto(sub, sectionId))
                    .collect(Collectors.toList());
        }

        // Calculate total credits
        int totalCredits = subjects.stream()
                .mapToInt(s -> s.getCredits() != null ? s.getCredits() : 0)
                .sum();

        // Get timetable entries
        List<StudentTimetableEntryDto> timetable = getStudentTimetable(userId);

        return new StudentAcademicResponse(overview, subjects, timetable, availableSemesters, totalCredits);
    }

    @Override
    public PagedResponse<StudentSubjectDto> getStudentSubjects(Long userId,
                                                              String search,
                                                              Integer semesterNumber,
                                                              SubjectType type,
                                                              String status,
                                                              Pageable pageable) {
        Student student = resolveStudent(userId);

        if (student.getProgram() == null) {
            return new PagedResponse<>(Collections.emptyList(), pageable.getPageNumber(), pageable.getPageSize(), 0, 0, true, true);
        }

        Specification<Subject> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Scope restriction: strictly the student's enrolled program
            predicates.add(cb.equal(root.get("program").get("id"), student.getProgram().getId()));

            if (semesterNumber != null) {
                predicates.add(cb.equal(root.get("semester").get("number"), semesterNumber));
            }

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate codeMatch = cb.like(cb.lower(root.get("code")), pattern);
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                predicates.add(cb.or(codeMatch, nameMatch));
            }

            if (type != null) {
                predicates.add(cb.equal(root.get("subjectType"), type));
            }

            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Subject> page = subjectRepository.findAll(spec, pageable);
        Long sectionId = student.getSection() != null ? student.getSection().getId() : null;
        List<StudentSubjectDto> content = page.getContent().stream()
                .map(sub -> mapSubjectToDto(sub, sectionId))
                .collect(Collectors.toList());

        return new PagedResponse<>(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isFirst(), page.isLast());
    }

    @Override
    public StudentSubjectDetailsDto getSubjectDetails(Long userId, Long subjectId) {
        Student student = resolveStudent(userId);

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + subjectId));

        // Enforce student academic scope
        if (student.getProgram() == null || !subject.getProgram().getId().equals(student.getProgram().getId())) {
            throw new ForbiddenException("Access denied: You are not authorized to view subject details outside your registered program.");
        }

        StudentSubjectDetailsDto dto = new StudentSubjectDetailsDto();
        dto.setId(subject.getId());
        dto.setCode(subject.getCode());
        dto.setName(subject.getName());
        dto.setCredits(subject.getCredits());
        dto.setSubjectType(subject.getSubjectType());
        dto.setStatus(subject.getStatus());

        if (subject.getProgram() != null) {
            dto.setProgramId(subject.getProgram().getId());
            dto.setProgramName(subject.getProgram().getName());
            dto.setProgramCode(subject.getProgram().getCode());

            if (subject.getProgram().getDepartment() != null) {
                dto.setDepartmentId(subject.getProgram().getDepartment().getId());
                dto.setDepartmentName(subject.getProgram().getDepartment().getName());
                dto.setDepartmentCode(subject.getProgram().getDepartment().getCode());
            }
        }

        if (subject.getSemester() != null) {
            dto.setSemesterId(subject.getSemester().getId());
            dto.setSemesterName(subject.getSemester().getName());
            dto.setSemesterNumber(subject.getSemester().getNumber());
        }

        if (student.getSection() != null) {
            dto.setSectionId(student.getSection().getId());
            dto.setSectionName(student.getSection().getName());

            // Look for section-specific assignment first
            assignmentRepository.findFirstBySubjectIdAndSectionId(subject.getId(), student.getSection().getId())
                    .ifPresent(assignment -> populateFacultyDetails(dto, assignment));
        }

        if (dto.getFacultyName() == null) {
            // Fallback to any assignment for this subject
            assignmentRepository.findFirstBySubjectId(subject.getId())
                    .ifPresent(assignment -> populateFacultyDetails(dto, assignment));
        }

        return dto;
    }

    @Override
    public List<StudentTimetableEntryDto> getStudentTimetable(Long userId) {
        Student student = resolveStudent(userId);

        if (student.getSection() == null) {
            return Collections.emptyList();
        }

        List<TimetableEntry> entries = timetableEntryRepository.findBySectionId(student.getSection().getId());

        return entries.stream()
                .map(this::mapTimetableEntryToDto)
                .sorted(Comparator.comparingInt((StudentTimetableEntryDto e) -> {
                    int dayIdx = DAYS_ORDER.indexOf(e.getDayOfWeek() != null ? e.getDayOfWeek().toUpperCase() : "");
                    return dayIdx >= 0 ? dayIdx : 99;
                }).thenComparing(e -> e.getStartTime() != null ? e.getStartTime().toString() : ""))
                .collect(Collectors.toList());
    }

    private Student resolveStudent(Long userId) {
        return studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student record not linked to authenticated user"));
    }

    private StudentAcademicOverviewDto mapToOverview(Student student) {
        StudentAcademicOverviewDto dto = new StudentAcademicOverviewDto();
        dto.setStudentId(student.getId());
        if (student.getUser() != null) {
            String firstName = student.getUser().getFirstName() != null ? student.getUser().getFirstName() : "";
            String lastName = student.getUser().getLastName() != null ? student.getUser().getLastName() : "";
            dto.setStudentName((firstName + " " + lastName).trim());
        }
        dto.setRegisterNumber(student.getRegisterNumber());
        dto.setRollNumber(student.getRollNumber());
        dto.setAdmissionYear(student.getAdmissionYear());
        dto.setCurrentSemester(student.getCurrentSemester());
        dto.setStatus(student.getStatus());

        if (student.getDepartment() != null) {
            dto.setDepartmentId(student.getDepartment().getId());
            dto.setDepartmentName(student.getDepartment().getName());
            dto.setDepartmentCode(student.getDepartment().getCode());

            if (student.getDepartment().getInstitution() != null) {
                dto.setInstitutionId(student.getDepartment().getInstitution().getId());
                dto.setInstitutionName(student.getDepartment().getInstitution().getName());
                dto.setInstitutionCode(student.getDepartment().getInstitution().getCode());
            }
        }

        if (student.getProgram() != null) {
            dto.setProgramId(student.getProgram().getId());
            dto.setProgramName(student.getProgram().getName());
            dto.setProgramCode(student.getProgram().getCode());
            dto.setDegreeLevel(student.getProgram().getDegreeType() != null ? student.getProgram().getDegreeType().name() : null);
            dto.setDurationYears(student.getProgram().getDurationYears());
            dto.setTotalSemesters(student.getProgram().getDurationYears() != null ? student.getProgram().getDurationYears() * 2 : 8);
        }

        if (student.getSection() != null) {
            dto.setSectionId(student.getSection().getId());
            dto.setSectionName(student.getSection().getName());
            dto.setSectionCapacity(student.getSection().getCapacity());

            if (student.getSection().getAcademicYear() != null) {
                dto.setAcademicYearId(student.getSection().getAcademicYear().getId());
                dto.setAcademicYearName(student.getSection().getAcademicYear().getName());
            }

            if (student.getSection().getSemester() != null) {
                dto.setSemesterId(student.getSection().getSemester().getId());
                dto.setSemesterName(student.getSection().getSemester().getName());
                dto.setSemesterNumber(student.getSection().getSemester().getNumber());
            }
        }

        return dto;
    }

    private StudentSubjectDto mapSubjectToDto(Subject subject, Long sectionId) {
        StudentSubjectDto dto = new StudentSubjectDto();
        dto.setId(subject.getId());
        dto.setCode(subject.getCode());
        dto.setName(subject.getName());
        dto.setCredits(subject.getCredits());
        dto.setSubjectType(subject.getSubjectType());
        dto.setStatus(subject.getStatus());

        if (subject.getSemester() != null) {
            dto.setSemesterId(subject.getSemester().getId());
            dto.setSemesterName(subject.getSemester().getName());
            dto.setSemesterNumber(subject.getSemester().getNumber());
        }

        if (subject.getProgram() != null) {
            dto.setProgramId(subject.getProgram().getId());
            dto.setProgramName(subject.getProgram().getName());
        }

        // Check faculty assignment
        Optional<FacultySubjectAssignment> assignment = Optional.empty();
        if (sectionId != null) {
            assignment = assignmentRepository.findFirstBySubjectIdAndSectionId(subject.getId(), sectionId);
        }
        if (assignment.isEmpty()) {
            assignment = assignmentRepository.findFirstBySubjectId(subject.getId());
        }

        assignment.ifPresent(a -> {
            if (a.getFaculty() != null) {
                dto.setFacultyId(a.getFaculty().getId());
                dto.setFacultyEmployeeId(a.getFaculty().getEmployeeId());
                dto.setFacultyDesignation(a.getFaculty().getDesignation());
                if (a.getFaculty().getUser() != null) {
                    User u = a.getFaculty().getUser();
                    dto.setFacultyName((u.getFirstName() + " " + u.getLastName()).trim());
                    dto.setFacultyEmail(u.getEmail());
                }
                if (a.getFaculty().getDepartment() != null) {
                    dto.setFacultyDepartment(a.getFaculty().getDepartment().getName());
                }
            }
            dto.setHoursPerWeek(a.getHoursPerWeek());
        });

        return dto;
    }

    private void populateFacultyDetails(StudentSubjectDetailsDto dto, FacultySubjectAssignment assignment) {
        if (assignment.getFaculty() != null) {
            Faculty f = assignment.getFaculty();
            dto.setFacultyId(f.getId());
            dto.setFacultyEmployeeId(f.getEmployeeId());
            dto.setFacultyDesignation(f.getDesignation());
            dto.setFacultyQualification(f.getQualification());
            if (f.getUser() != null) {
                dto.setFacultyName((f.getUser().getFirstName() + " " + f.getUser().getLastName()).trim());
                dto.setFacultyEmail(f.getUser().getEmail());
            }
            if (f.getDepartment() != null) {
                dto.setFacultyDepartment(f.getDepartment().getName());
            }
        }
        dto.setHoursPerWeek(assignment.getHoursPerWeek());
    }

    private StudentTimetableEntryDto mapTimetableEntryToDto(TimetableEntry entry) {
        StudentTimetableEntryDto dto = new StudentTimetableEntryDto();
        dto.setId(entry.getId());
        dto.setStatus(entry.getStatus());

        if (entry.getTimeSlot() != null) {
            dto.setDayOfWeek(entry.getTimeSlot().getDayOfWeek());
            dto.setStartTime(entry.getTimeSlot().getStartTime());
            dto.setEndTime(entry.getTimeSlot().getEndTime());
            dto.setTimeSlotName(entry.getTimeSlot().getName());
        }

        if (entry.getSubject() != null) {
            dto.setSubjectId(entry.getSubject().getId());
            dto.setSubjectCode(entry.getSubject().getCode());
            dto.setSubjectName(entry.getSubject().getName());
            dto.setSubjectType(entry.getSubject().getSubjectType());
        }

        if (entry.getFaculty() != null) {
            dto.setFacultyId(entry.getFaculty().getId());
            dto.setFacultyDesignation(entry.getFaculty().getDesignation());
            if (entry.getFaculty().getUser() != null) {
                dto.setFacultyName((entry.getFaculty().getUser().getFirstName() + " " + entry.getFaculty().getUser().getLastName()).trim());
            }
        }

        if (entry.getResource() != null) {
            dto.setResourceId(entry.getResource().getId());
            dto.setResourceName(entry.getResource().getName());
            dto.setResourceCode(entry.getResource().getCode());
            if (entry.getResource().getCategory() != null) {
                dto.setResourceCategory(entry.getResource().getCategory().getName());
            }
        }

        return dto;
    }
}
