package com.ahrao.service.faculty;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.faculty.academic.FacultySubjectDetailsDto;
import com.ahrao.dto.faculty.academic.FacultySubjectDto;
import org.springframework.data.domain.Pageable;

public interface FacultySubjectService {

    PagedResponse<FacultySubjectDto> getAssignedSubjects(
            Long userId,
            String search,
            Long programId,
            Integer semesterNumber,
            Pageable pageable);

    FacultySubjectDetailsDto getSubjectDetails(Long userId, Long subjectId);
}
