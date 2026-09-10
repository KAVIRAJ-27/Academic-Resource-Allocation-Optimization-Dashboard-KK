package com.ahrao.service.faculty;

import com.ahrao.dto.faculty.academic.FacultyTimetableEntryDto;
import com.ahrao.dto.faculty.academic.FacultyTimetableResponseDto;
import com.ahrao.entity.academic.*;
import com.ahrao.entity.resource.Resource;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.TimetableEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacultyTimetableServiceImpl implements FacultyTimetableService {

    private final FacultyRepository facultyRepository;
    private final TimetableEntryRepository timetableEntryRepository;

    public FacultyTimetableServiceImpl(
            FacultyRepository facultyRepository,
            TimetableEntryRepository timetableEntryRepository) {
        this.facultyRepository = facultyRepository;
        this.timetableEntryRepository = timetableEntryRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyTimetableResponseDto getTimetable(
            Long userId,
            String dayOfWeek,
            Long subjectId,
            Long sectionId,
            Boolean todayOnly) {

        Faculty faculty = getFacultyByUserId(userId);
        List<TimetableEntry> rawEntries = timetableEntryRepository.findActiveByFacultyIdWithDetails(faculty.getId());

        LocalDate now = LocalDate.now();
        String currentDayName = now.getDayOfWeek().name();

        List<FacultyTimetableEntryDto> allDtos = rawEntries.stream()
                .map(this::mapToTimetableEntryDto)
                .sorted(getEntryComparator())
                .collect(Collectors.toList());

        List<FacultyTimetableEntryDto> todayEntries = allDtos.stream()
                .filter(e -> e.getDayOfWeek() != null && e.getDayOfWeek().equalsIgnoreCase(currentDayName))
                .sorted(Comparator.comparing(e -> e.getStartTime() != null ? e.getStartTime() : java.time.LocalTime.MIN))
                .collect(Collectors.toList());

        List<FacultyTimetableEntryDto> filtered = allDtos.stream()
                .filter(e -> {
                    if (Boolean.TRUE.equals(todayOnly)) {
                        if (e.getDayOfWeek() == null || !e.getDayOfWeek().equalsIgnoreCase(currentDayName)) {
                            return false;
                        }
                    } else if (dayOfWeek != null && !dayOfWeek.trim().isEmpty() && !dayOfWeek.equalsIgnoreCase("ALL")) {
                        if (e.getDayOfWeek() == null || !e.getDayOfWeek().equalsIgnoreCase(dayOfWeek.trim())) {
                            return false;
                        }
                    }

                    if (subjectId != null) {
                        if (e.getSubjectId() == null || !subjectId.equals(e.getSubjectId())) {
                            return false;
                        }
                    }

                    if (sectionId != null) {
                        if (e.getSectionId() == null || !sectionId.equals(e.getSectionId())) {
                            return false;
                        }
                    }

                    return true;
                })
                .sorted(getEntryComparator())
                .collect(Collectors.toList());

        FacultyTimetableResponseDto response = new FacultyTimetableResponseDto();
        response.setTotalEntriesCount(allDtos.size());
        response.setTodayEntriesCount(todayEntries.size());
        response.setTodayDayOfWeek(currentDayName);
        response.setTodayDate(now.toString());
        response.setTodayEntries(todayEntries);
        response.setEntries(filtered);

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacultyTimetableEntryDto> getTodayClasses(Long userId) {
        Faculty faculty = getFacultyByUserId(userId);
        List<TimetableEntry> rawEntries = timetableEntryRepository.findActiveByFacultyIdWithDetails(faculty.getId());

        String currentDayName = LocalDate.now().getDayOfWeek().name();

        return rawEntries.stream()
                .map(this::mapToTimetableEntryDto)
                .filter(e -> e.getDayOfWeek() != null && e.getDayOfWeek().equalsIgnoreCase(currentDayName))
                .sorted(Comparator.comparing(e -> e.getStartTime() != null ? e.getStartTime() : java.time.LocalTime.MIN))
                .collect(Collectors.toList());
    }

    private Faculty getFacultyByUserId(Long userId) {
        return facultyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for authenticated user ID: " + userId));
    }

    private Comparator<FacultyTimetableEntryDto> getEntryComparator() {
        return Comparator.comparingInt(this::getDayOrder)
                .thenComparing(e -> e.getStartTime() != null ? e.getStartTime() : java.time.LocalTime.MIN);
    }

    private int getDayOrder(FacultyTimetableEntryDto dto) {
        if (dto.getDayOfWeek() == null) return 99;
        try {
            return DayOfWeek.valueOf(dto.getDayOfWeek().toUpperCase()).getValue();
        } catch (IllegalArgumentException e) {
            return 99;
        }
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
