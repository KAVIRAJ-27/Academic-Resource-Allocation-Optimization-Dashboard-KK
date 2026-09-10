package com.ahrao.service.student;

import com.ahrao.dto.student.hostel.StudentHostelAllocationHistoryDto;
import com.ahrao.dto.student.hostel.StudentHostelResponse;

import java.util.List;

public interface StudentHostelService {
    StudentHostelResponse getStudentHostel(Long userId);
    List<StudentHostelAllocationHistoryDto> getStudentHostelHistory(Long userId);
}
