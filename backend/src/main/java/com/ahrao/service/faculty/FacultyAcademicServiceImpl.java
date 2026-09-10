package com.ahrao.service.faculty;

import com.ahrao.dto.faculty.academic.FacultyAcademicOverviewDto;
import com.ahrao.dto.faculty.academic.FacultyCourseDto;
import com.ahrao.dto.faculty.academic.FacultySubjectDto;
import com.ahrao.entity.academic.Faculty;
import com.ahrao.entity.academic.FacultySubjectAssignment;
import com.ahrao.entity.academic.Program;
import com.ahrao.entity.academic.Subject;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.FacultySubjectAssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class FacultyAcademicServiceImpl implements FacultyAcademicService {

    private final FacultyRepository facultyRepository;
    private final FacultySubjectAssignmentRepository facultySubjectAssignmentRepository;

    public FacultyAcademicServiceImpl(
            FacultyRepository facultyRepository,
            FacultySubjectAssignmentRepository facultySubjectAssignmentRepository) {
        this.facultyRepository = facultyRepository;
        this.facultySubjectAssignmentRepository = facultySubjectAssignmentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyAcademicOverviewDto getAcademicOverview(Long userId) {
        Faculty faculty = getFacultyByUserId(userId);
        List<FacultySubjectAssignment> assignments =
                facultySubjectAssignmentRepository.findActiveByFacultyIdWithDetails(faculty.getId());

        FacultyAcademicOverviewDto dto = new FacultyAcademicOverviewDto();
        if (faculty.getDepartment() != null) {
            dto.setDepartmentId(faculty.getDepartment().getId());
            dto.setDepartmentName(faculty.getDepartment().getName());
            dto.setDepartmentCode(faculty.getDepartment().getCode());
            if (faculty.getDepartment().getInstitution() != null) {
                dto.setInstitutionName(faculty.getDepartment().getInstitution().getName());
            }
        }

        Set<Long> uniqueProgramIds = new HashSet<>();
        Set<Long> uniqueSubjectIds = new HashSet<>();
        Set<Long> uniqueSectionIds = new HashSet<>();
        int totalHours = 0;

        Map<Long, Integer> programSubjectCountMap = new HashMap<>();
        Map<Long, Program> programMap = new LinkedHashMap<>();
        List<FacultySubjectDto> subjectDtos = new ArrayList<>();

        for (FacultySubjectAssignment fsa : assignments) {
            Subject s = fsa.getSubject();
            if (s != null) {
                uniqueSubjectIds.add(s.getId());
                Program p = s.getProgram();
                if (p != null) {
                    uniqueProgramIds.add(p.getId());
                    programMap.putIfAbsent(p.getId(), p);
                    programSubjectCountMap.merge(p.getId(), 1, Integer::sum);
                }
            }
            if (fsa.getSection() != null) {
                uniqueSectionIds.add(fsa.getSection().getId());
            }
            if (fsa.getHoursPerWeek() != null) {
                totalHours += fsa.getHoursPerWeek();
            }

            subjectDtos.add(mapToSubjectDto(fsa));
        }

        List<FacultyCourseDto> courseDtos = new ArrayList<>();
        for (Map.Entry<Long, Program> entry : programMap.entrySet()) {
            Program p = entry.getValue();
            FacultyCourseDto cDto = new FacultyCourseDto();
            cDto.setProgramId(p.getId());
            cDto.setProgramCode(p.getCode());
            cDto.setProgramName(p.getName());
            cDto.setDegreeType(p.getDegreeType() != null ? p.getDegreeType().name() : null);
            cDto.setDurationYears(p.getDurationYears());
            cDto.setStatus(p.getStatus());
            if (p.getDepartment() != null) {
                cDto.setDepartmentName(p.getDepartment().getName());
                cDto.setDepartmentCode(p.getDepartment().getCode());
            }
            cDto.setAssignedSubjectsCount(programSubjectCountMap.getOrDefault(p.getId(), 0));
            courseDtos.add(cDto);
        }

        dto.setAssignedCoursesCount(uniqueProgramIds.size());
        dto.setAssignedSubjectsCount(uniqueSubjectIds.size());
        dto.setAssignedSectionsCount(uniqueSectionIds.size());
        dto.setTotalWeeklyInstructionHours(totalHours);
        dto.setAssignedPrograms(courseDtos);
        dto.setAssignedSubjects(subjectDtos);

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacultyCourseDto> getAssignedCourses(Long userId) {
        Faculty faculty = getFacultyByUserId(userId);
        List<FacultySubjectAssignment> assignments =
                facultySubjectAssignmentRepository.findActiveByFacultyIdWithDetails(faculty.getId());

        Map<Long, Integer> programSubjectCountMap = new HashMap<>();
        Map<Long, Program> programMap = new LinkedHashMap<>();

        for (FacultySubjectAssignment fsa : assignments) {
            Subject s = fsa.getSubject();
            if (s != null && s.getProgram() != null) {
                Program p = s.getProgram();
                programMap.putIfAbsent(p.getId(), p);
                programSubjectCountMap.merge(p.getId(), 1, Integer::sum);
            }
        }

        List<FacultyCourseDto> courseDtos = new ArrayList<>();
        for (Map.Entry<Long, Program> entry : programMap.entrySet()) {
            Program p = entry.getValue();
            FacultyCourseDto cDto = new FacultyCourseDto();
            cDto.setProgramId(p.getId());
            cDto.setProgramCode(p.getCode());
            cDto.setProgramName(p.getName());
            cDto.setDegreeType(p.getDegreeType() != null ? p.getDegreeType().name() : null);
            cDto.setDurationYears(p.getDurationYears());
            cDto.setStatus(p.getStatus());
            if (p.getDepartment() != null) {
                cDto.setDepartmentName(p.getDepartment().getName());
                cDto.setDepartmentCode(p.getDepartment().getCode());
            }
            cDto.setAssignedSubjectsCount(programSubjectCountMap.getOrDefault(p.getId(), 0));
            courseDtos.add(cDto);
        }

        return courseDtos;
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
}
