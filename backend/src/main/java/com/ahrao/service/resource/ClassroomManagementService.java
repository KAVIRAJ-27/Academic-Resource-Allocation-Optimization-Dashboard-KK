package com.ahrao.service.resource;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.resource.ClassroomDetailsResponse;
import com.ahrao.dto.resource.ClassroomSummaryResponse;
import com.ahrao.dto.resource.CreateClassroomRequest;
import com.ahrao.dto.resource.UpdateClassroomRequest;
import org.springframework.data.domain.Pageable;

public interface ClassroomManagementService {
    PagedResponse<ClassroomSummaryResponse> getClassrooms(String search, String building, String roomType, String status, Pageable pageable);
    ClassroomDetailsResponse getClassroomById(Long id);
    ClassroomDetailsResponse createClassroom(CreateClassroomRequest request, String adminUsername, String ip, String userAgent);
    ClassroomDetailsResponse updateClassroom(Long id, UpdateClassroomRequest request, String adminUsername, String ip, String userAgent);
    ClassroomSummaryResponse changeStatus(Long id, String status, String adminUsername, String ip, String userAgent);
    void deleteClassroom(Long id, String adminUsername, String ip, String userAgent);
}
