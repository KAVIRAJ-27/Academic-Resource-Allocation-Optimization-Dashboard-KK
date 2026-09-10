package com.ahrao.service.faculty;

import com.ahrao.dto.faculty.academic.FacultyTimetableEntryDto;
import com.ahrao.dto.faculty.academic.FacultyTimetableResponseDto;

import java.util.List;

public interface FacultyTimetableService {

    FacultyTimetableResponseDto getTimetable(
            Long userId,
            String dayOfWeek,
            Long subjectId,
            Long sectionId,
            Boolean todayOnly);

    List<FacultyTimetableEntryDto> getTodayClasses(Long userId);
}
