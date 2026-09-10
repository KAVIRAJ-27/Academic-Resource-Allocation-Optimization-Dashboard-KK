package com.ahrao.service.hostel;

import com.ahrao.dto.hostel.allocation.HostelAllocationConflictDto;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.hostel.HostelBed;
import com.ahrao.entity.hostel.HostelRoom;
import com.ahrao.entity.request.HostelRequest;
import com.ahrao.entity.user.User;

import java.util.List;

public interface HostelAllocationValidationService {

    Student validateStudentEligibility(Long studentId);

    void validateHostelScope(Long hostelId, User actor);

    void validateHierarchy(HostelBed bed, Long roomId, Long hostelId);

    void validateBedAvailability(HostelBed bed);

    void validateRoomCapacity(HostelRoom room);

    void validateHostelCapacity(com.ahrao.entity.hostel.Hostel hostel);

    HostelRequest validateHostelRequest(Long hostelRequestId, Long expectedStudentId);

    List<HostelAllocationConflictDto> collectConflicts(Student student, HostelBed bed, Long hostelId, User actor);
}
