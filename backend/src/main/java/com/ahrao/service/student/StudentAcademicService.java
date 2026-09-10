package com.ahrao.service.student;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.student.academic.StudentAcademicResponse;
import com.ahrao.dto.student.academic.StudentSubjectDetailsDto;
import com.ahrao.dto.student.academic.StudentSubjectDto;
import com.ahrao.dto.student.academic.StudentTimetableEntryDto;
import com.ahrao.entity.enums.SubjectType;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface StudentAcademicService {
    StudentAcademicResponse getAcademicOverview(Long userId);
    PagedResponse<StudentSubjectDto> getStudentSubjects(Long userId, String search, Integer semesterNumber, SubjectType type, String status, Pageable pageable);
    StudentSubjectDetailsDto getSubjectDetails(Long userId, Long subjectId);
    List<StudentTimetableEntryDto> getStudentTimetable(Long userId);
}
