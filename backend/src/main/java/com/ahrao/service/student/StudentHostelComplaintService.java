package com.ahrao.service.student;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.student.hostel.complaint.CreateStudentHostelComplaint;
import com.ahrao.dto.student.hostel.complaint.StudentHostelComplaintDto;
import com.ahrao.dto.student.hostel.complaint.StudentHostelComplaintSummaryCountsDto;
import com.ahrao.entity.enums.ComplaintStatus;

public interface StudentHostelComplaintService {
    PagedResponse<StudentHostelComplaintDto> getMyComplaints(
            Long userId,
            ComplaintStatus status,
            String category,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDirection);

    StudentHostelComplaintDto getComplaintById(Long userId, Long complaintId);

    StudentHostelComplaintDto createComplaint(
            Long userId,
            CreateStudentHostelComplaint req,
            String ipAddress,
            String userAgent);

    StudentHostelComplaintSummaryCountsDto getComplaintCounts(Long userId);
}
