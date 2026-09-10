package com.ahrao.service.faculty;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.faculty.academic.FacultySubjectDetailsDto;
import com.ahrao.dto.faculty.academic.FacultySubjectDto;
import com.ahrao.dto.faculty.academic.FacultyTimetableEntryDto;
import com.ahrao.entity.academic.*;
import com.ahrao.entity.resource.Resource;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.FacultySubjectAssignmentRepository;
import com.ahrao.repository.academic.TimetableEntryRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacultySubjectServiceImpl implements FacultySubjectService {

    private final FacultyRepository facultyRepository;
    private final FacultySubjectAssignmentRepository facultySubjectAssignmentRepository;
    private final TimetableEntryRepository timetableEntryRepository;

    public FacultySubjectServiceImpl(
            FacultyRepository facultyRepository,
            FacultySubjectAssignmentRepository facultySubjectAssignmentRepository,
            TimetableEntryRepository timetableEntryRepository) {
        this.facultyRepository = facultyRepository;
        this.facultySubjectAssignmentRepository = facultySubjectAssignmentRepository;
        this.timetableEntryRepository = timetableEntryRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<FacultySubjectDto> getAssignedSubjects(
            Long userId,
            String search,
            Long programId,
            Integer semesterNumber,
            Pageable pageable) {

        Faculty faculty = getFacultyByUserId(userId);
        List<FacultySubjectAssignment> assignments =
                facultySubjectAssignmentRepository.findActiveByFacultyIdWithDetails(faculty.getId());

        String searchLower = (search != null && !search.trim().isEmpty()) ? search.trim().toLowerCase() : null;

        List<FacultySubjectAssignment> filtered = assignments.stream()
                .filter(fsa -> {
                    Subject s = fsa.getSubject();
                    if (s == null) return false;

                    if (searchLower != null) {
                        boolean codeMatches = s.getCode() != null && s.getCode().toLowerCase().contains(searchLower);
                        boolean nameMatches = s.getName() != null && s.getName().toLowerCase().contains(searchLower);
                        if (!codeMatches && !nameMatches) {
                            return false;
                        }
                    }

                    if (programId != null) {
                        if (s.getProgram() == null || !programId.equals(s.getProgram().getId())) {
                            return false;
                        }
                    }

                    if (semesterNumber != null) {
                        Semester sem = fsa.getSemester() != null ? fsa.getSemester() : s.getSemester();
                        if (sem == null || !semesterNumber.equals(sem.getNumber())) {
                            return false;
                        }
                    }

                    return true;
                })
                .collect(Collectors.toList());

        int totalElements = filtered.size();
        int pageSize = pageable.getPageSize();
        int pageNumber = pageable.getPageNumber();
        int fromIndex = (int) Math.min((long) pageNumber * pageSize, totalElements);
        int toIndex = Math.min(fromIndex + pageSize, totalElements);

        List<FacultySubjectAssignment> pagedContent = (fromIndex <= toIndex)
                ? filtered.subList(fromIndex, toIndex)
                : Collections.emptyList();

        List<FacultySubjectDto> dtoList = pagedContent.stream()
                .map(this::mapToSubjectDto)
                .collect(Collectors.toList());

        int totalPages = pageSize > 0 ? (int) Math.ceil((double) totalElements / pageSize) : 0;
        boolean first = pageNumber == 0;
        boolean last = pageNumber >= totalPages - 1 || totalPages == 0;

        return new PagedResponse<>(dtoList, pageNumber, pageSize, totalElements, totalPages, first, last);
    }

    @Override
    @Transactional(readOnly = true)
    public FacultySubjectDetailsDto getSubjectDetails(Long userId, Long subjectId) {
        Faculty faculty = getFacultyByUserId(userId);

        boolean exists = facultySubjectAssignmentRepository.existsByFacultyIdAndSubjectId(faculty.getId(), subjectId);
        if (!exists) {
            throw new ResourceNotFoundException("Subject with ID " + subjectId + " is not assigned to authenticated faculty member");
        }

        List<FacultySubjectAssignment> assignments =
                facultySubjectAssignmentRepository.findActiveByFacultyIdAndSubjectIdWithDetails(faculty.getId(), subjectId);
        if (assignments.isEmpty()) {
            throw new ResourceNotFoundException("No active assignments found for subject ID " + subjectId);
        }

        FacultySubjectAssignment primary = assignments.get(0);
        Subject subject = primary.getSubject();

        FacultySubjectDetailsDto details = new FacultySubjectDetailsDto();
        details.setSubjectId(subject.getId());
        details.setSubjectCode(subject.getCode());
        details.setSubjectName(subject.getName());
        details.setCredits(subject.getCredits());
        details.setSubjectType(subject.getSubjectType() != null ? subject.getSubjectType().name() : null);
        details.setStatus(subject.getStatus());

        Program program = subject.getProgram();
        if (program != null) {
            details.setProgramId(program.getId());
            details.setProgramCode(program.getCode());
            details.setProgramName(program.getName());
            details.setDegreeType(program.getDegreeType() != null ? program.getDegreeType().name() : null);
            if (program.getDepartment() != null) {
                details.setDepartmentId(program.getDepartment().getId());
                details.setDepartmentName(program.getDepartment().getName());
                details.setDepartmentCode(program.getDepartment().getCode());
            }
        }

        Semester sem = primary.getSemester() != null ? primary.getSemester() : subject.getSemester();
        if (sem != null) {
            details.setSemesterId(sem.getId());
            details.setSemesterNumber(sem.getNumber());
            details.setSemesterName(sem.getName());
        }

        if (primary.getAcademicYear() != null) {
            details.setAcademicYearName(primary.getAcademicYear().getName());
        }

        int totalHours = 0;
        List<FacultySubjectDetailsDto.AssignedSectionDto> sectionDtos = new ArrayList<>();
        for (FacultySubjectAssignment fsa : assignments) {
            FacultySubjectDetailsDto.AssignedSectionDto secDto = new FacultySubjectDetailsDto.AssignedSectionDto();
            secDto.setAssignmentId(fsa.getId());
            secDto.setHoursPerWeek(fsa.getHoursPerWeek());
            secDto.setStatus(fsa.getStatus());
            if (fsa.getHoursPerWeek() != null) {
                totalHours += fsa.getHoursPerWeek();
            }
            if (fsa.getSection() != null) {
                secDto.setSectionId(fsa.getSection().getId());
                secDto.setSectionName(fsa.getSection().getName());
                secDto.setCapacity(fsa.getSection().getCapacity());
            }
            sectionDtos.add(secDto);
        }
        details.setAssignedSections(sectionDtos);
        details.setTotalHoursPerWeek(totalHours);

        List<TimetableEntry> entries = timetableEntryRepository.findActiveByFacultyIdAndSubjectIdWithDetails(faculty.getId(), subjectId);
        List<FacultyTimetableEntryDto> timetableDtos = entries.stream()
                .map(this::mapToTimetableEntryDto)
                .collect(Collectors.toList());
        details.setTimetableSlots(timetableDtos);

        return details;
    }

    private Faculty getFacultyByUserId(Long userId) {
        return facultyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for authenticated user ID: " + userId));
    }

    private FacultySubjectDto mapToSubjectDto(FacultySubjectAssignment fsa) {
        FacultySubjectDto dto = new FacultySubjectDto();
        dto.setAssignmentId(fsa.getId());
        dto.setHoursPerWeek(fsa.getHoursPerWeek());
        dto.setStatus(fsa.getStatus());

        Subject s = fsa.getSubject();
        if (s != null) {
            dto.setSubjectId(s.getId());
            dto.setSubjectCode(s.getCode());
            dto.setSubjectName(s.getName());
            dto.setCredits(s.getCredits());
            dto.setSubjectType(s.getSubjectType() != null ? s.getSubjectType().name() : null);

            Program p = s.getProgram();
            if (p != null) {
                dto.setProgramId(p.getId());
                dto.setProgramCode(p.getCode());
                dto.setProgramName(p.getName());
            }
        }

        if (fsa.getSection() != null) {
            dto.setSectionId(fsa.getSection().getId());
            dto.setSectionName(fsa.getSection().getName());
        }

        if (fsa.getSemester() != null) {
            dto.setSemesterId(fsa.getSemester().getId());
            dto.setSemesterNumber(fsa.getSemester().getNumber());
            dto.setSemesterName(fsa.getSemester().getName());
        }

        if (fsa.getAcademicYear() != null) {
            dto.setAcademicYearId(fsa.getAcademicYear().getId());
            dto.setAcademicYearName(fsa.getAcademicYear().getName());
        }

        return dto;
    }

    private FacultyTimetableEntryDto mapToTimetableEntryDto(TimetableEntry te) {
        FacultyTimetableEntryDto dto = new FacultyTimetableEntryDto();
        dto.setId(te.getId());
        dto.setStatus(te.getStatus());

        TimeSlot ts = te.getTimeSlot();
        if (ts != null) {
            dto.setDayOfWeek(ts.getDayOfWeek());
            dto.setStartTime(ts.getStartTime());
            dto.setEndTime(ts.getEndTime());
            dto.setTimeSlotName(ts.getName());
        }

        Subject s = te.getSubject();
        if (s != null) {
            dto.setSubjectId(s.getId());
            dto.setSubjectCode(s.getCode());
            dto.setSubjectName(s.getName());
            dto.setSubjectType(s.getSubjectType() != null ? s.getSubjectType().name() : null);

            if (s.getProgram() != null) {
                dto.setProgramId(s.getProgram().getId());
                dto.setProgramCode(s.getProgram().getCode());
                dto.setProgramName(s.getProgram().getName());
            }
        }

        if (te.getSection() != null) {
            dto.setSectionId(te.getSection().getId());
            dto.setSectionName(te.getSection().getName());
        }

        if (te.getAcademicYear() != null) {
            dto.setAcademicYearName(te.getAcademicYear().getName());
        }

        if (te.getSemester() != null) {
            dto.setSemesterNumber(te.getSemester().getNumber());
            dto.setSemesterName(te.getSemester().getName());
        }

        Resource r = te.getResource();
        if (r != null) {
            dto.setResourceId(r.getId());
            dto.setResourceName(r.getName());
            dto.setResourceCode(r.getCode());
            dto.setResourceLocation(r.getLocation());
            dto.setResourceCapacity(r.getCapacity());
            if (r.getCategory() != null) {
                dto.setResourceCategory(r.getCategory().getName());
            }
        }

        return dto;
    }
}
