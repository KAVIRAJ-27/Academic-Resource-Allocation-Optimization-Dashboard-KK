package com.ahrao.service.faculty;

import com.ahrao.dto.faculty.workload.FacultyWorkloadBreakdownDto;
import com.ahrao.dto.faculty.workload.FacultyWorkloadHistoryDto;
import com.ahrao.dto.faculty.workload.FacultyWorkloadResponseDto;
import com.ahrao.dto.faculty.workload.FacultyWorkloadSummaryDto;
import com.ahrao.entity.academic.Faculty;
import com.ahrao.entity.academic.FacultySubjectAssignment;
import com.ahrao.entity.academic.FacultyWorkload;
import com.ahrao.entity.academic.Subject;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.FacultySubjectAssignmentRepository;
import com.ahrao.repository.academic.FacultyWorkloadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FacultyWorkloadServiceImpl implements FacultyWorkloadService {

    private final FacultyRepository facultyRepository;
    private final FacultyWorkloadRepository facultyWorkloadRepository;
    private final FacultySubjectAssignmentRepository facultySubjectAssignmentRepository;

    public FacultyWorkloadServiceImpl(
            FacultyRepository facultyRepository,
            FacultyWorkloadRepository facultyWorkloadRepository,
            FacultySubjectAssignmentRepository facultySubjectAssignmentRepository) {
        this.facultyRepository = facultyRepository;
        this.facultyWorkloadRepository = facultyWorkloadRepository;
        this.facultySubjectAssignmentRepository = facultySubjectAssignmentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyWorkloadResponseDto getWorkload(Long userId) {
        Faculty faculty = facultyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for user ID: " + userId));

        // 1. Fetch latest recorded workload calculation
        Optional<FacultyWorkload> latestWorkloadOpt =
                facultyWorkloadRepository.findFirstByFacultyIdOrderByCalculatedAtDesc(faculty.getId());

        // 2. Fetch all active teaching assignments for breakdown and baseline hours
        List<FacultySubjectAssignment> assignments =
                facultySubjectAssignmentRepository.findActiveByFacultyIdWithDetails(faculty.getId());

        Set<Long> uniqueSubjects = new HashSet<>();
        Set<Long> uniqueSections = new HashSet<>();
        int weeklyHoursSum = 0;

        List<FacultyWorkloadBreakdownDto> breakdownList = new ArrayList<>();
        for (FacultySubjectAssignment fsa : assignments) {
            Subject s = fsa.getSubject();
            if (s != null) {
                uniqueSubjects.add(s.getId());
            }
            if (fsa.getSection() != null) {
                uniqueSections.add(fsa.getSection().getId());
            }
            if (fsa.getHoursPerWeek() != null) {
                weeklyHoursSum += fsa.getHoursPerWeek();
            }
            breakdownList.add(mapToBreakdownDto(fsa));
        }

        // 3. Build Summary DTO
        FacultyWorkloadSummaryDto summaryDto = new FacultyWorkloadSummaryDto();
        summaryDto.setFacultyId(faculty.getId());
        if (faculty.getUser() != null) {
            summaryDto.setFacultyName(faculty.getUser().getFirstName() + " " + faculty.getUser().getLastName());
        }
        summaryDto.setEmployeeId(faculty.getEmployeeId());
        if (faculty.getDepartment() != null) {
            summaryDto.setDepartmentName(faculty.getDepartment().getName());
        }

        summaryDto.setAssignedSubjectsCount(uniqueSubjects.size());
        summaryDto.setAssignedSectionsCount(uniqueSections.size());
        summaryDto.setWeeklyInstructionHours(weeklyHoursSum);

        if (latestWorkloadOpt.isPresent()) {
            FacultyWorkload fw = latestWorkloadOpt.get();
            summaryDto.setTotalHours(fw.getTotalHours());
            summaryDto.setTeachingHours(fw.getTeachingHours());
            summaryDto.setLabHours(fw.getLabHours());
            summaryDto.setOtherHours(fw.getOtherHours());
            summaryDto.setWorkloadStatus(fw.getWorkloadStatus());
            summaryDto.setCalculatedAt(fw.getCalculatedAt());

            if (fw.getAcademicYear() != null) {
                summaryDto.setAcademicYearName(fw.getAcademicYear().getName());
            }
            if (fw.getSemester() != null) {
                summaryDto.setSemesterName(fw.getSemester().getName());
            }
        } else {
            // Baseline when background calculation job has not yet generated a FacultyWorkload record
            BigDecimal baselineHours = BigDecimal.valueOf(weeklyHoursSum);
            summaryDto.setTotalHours(baselineHours);
            summaryDto.setTeachingHours(baselineHours);
            summaryDto.setLabHours(BigDecimal.ZERO);
            summaryDto.setOtherHours(BigDecimal.ZERO);
            summaryDto.setWorkloadStatus("PENDING_CALCULATION");
            summaryDto.setCalculatedAt(null);
        }

        // 4. Fetch Workload History
        List<FacultyWorkload> allWorkloads = facultyWorkloadRepository.findByFacultyId(faculty.getId());
        List<FacultyWorkloadHistoryDto> historyList = allWorkloads.stream()
                .sorted(Comparator.comparing(FacultyWorkload::getCalculatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapToHistoryDto)
                .collect(Collectors.toList());

        FacultyWorkloadResponseDto response = new FacultyWorkloadResponseDto();
        response.setSummary(summaryDto);
        response.setBreakdown(breakdownList);
        response.setHistory(historyList);

        return response;
    }

    private FacultyWorkloadBreakdownDto mapToBreakdownDto(FacultySubjectAssignment fsa) {
        FacultyWorkloadBreakdownDto dto = new FacultyWorkloadBreakdownDto();
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

            if (s.getProgram() != null) {
                dto.setProgramId(s.getProgram().getId());
                dto.setProgramCode(s.getProgram().getCode());
                dto.setProgramName(s.getProgram().getName());
            }
        }

        if (fsa.getSection() != null) {
            dto.setSectionId(fsa.getSection().getId());
            dto.setSectionName(fsa.getSection().getName());
        }

        if (fsa.getSemester() != null) {
            dto.setSemesterNumber(fsa.getSemester().getNumber());
            dto.setSemesterName(fsa.getSemester().getName());
        }

        if (fsa.getAcademicYear() != null) {
            dto.setAcademicYearName(fsa.getAcademicYear().getName());
        }

        return dto;
    }

    private FacultyWorkloadHistoryDto mapToHistoryDto(FacultyWorkload fw) {
        FacultyWorkloadHistoryDto dto = new FacultyWorkloadHistoryDto();
        dto.setId(fw.getId());
        dto.setTotalHours(fw.getTotalHours());
        dto.setTeachingHours(fw.getTeachingHours());
        dto.setLabHours(fw.getLabHours());
        dto.setOtherHours(fw.getOtherHours());
        dto.setWorkloadStatus(fw.getWorkloadStatus());
        dto.setCalculatedAt(fw.getCalculatedAt());

        if (fw.getAcademicYear() != null) {
            dto.setAcademicYearName(fw.getAcademicYear().getName());
        }
        if (fw.getSemester() != null) {
            dto.setSemesterName(fw.getSemester().getName());
        }

        return dto;
    }
}
