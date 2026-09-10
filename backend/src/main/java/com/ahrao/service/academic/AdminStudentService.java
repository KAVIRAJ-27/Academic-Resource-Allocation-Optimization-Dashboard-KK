package com.ahrao.service.academic;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.student.CreateStudentRequest;
import com.ahrao.dto.student.StudentDetailsResponse;
import com.ahrao.dto.student.StudentReferenceDataResponse;
import com.ahrao.dto.student.StudentSummaryResponse;
import com.ahrao.dto.student.UpdateStudentRequest;
import org.springframework.data.domain.Pageable;

public interface AdminStudentService {

    PagedResponse<StudentSummaryResponse> getStudents(
            String search,
            Long departmentId,
            Long programId,
            Long sectionId,
            String status,
            Pageable pageable);

    StudentDetailsResponse getStudentById(Long id);

    StudentSummaryResponse createStudent(
            CreateStudentRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent);

    StudentSummaryResponse updateStudent(
            Long id,
            UpdateStudentRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent);

    StudentSummaryResponse updateStudentStatus(
            Long id,
            String status,
            String adminUsername,
            String ipAddress,
            String userAgent);

    StudentReferenceDataResponse getReferenceData();
}
