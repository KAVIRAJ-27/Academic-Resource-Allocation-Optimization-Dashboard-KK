package com.ahrao.service.faculty;

import com.ahrao.dto.faculty.academic.FacultyAcademicOverviewDto;
import com.ahrao.dto.faculty.academic.FacultyCourseDto;

import java.util.List;

public interface FacultyAcademicService {

    FacultyAcademicOverviewDto getAcademicOverview(Long userId);

    List<FacultyCourseDto> getAssignedCourses(Long userId);
}
