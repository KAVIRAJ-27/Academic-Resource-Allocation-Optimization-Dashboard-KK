package com.ahrao.service.warden;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.warden.WardenStudentSearchDto;
import org.springframework.data.domain.Pageable;

public interface WardenStudentService {
    PagedResponse<WardenStudentSearchDto> searchStudents(
            String search,
            Long departmentId,
            Long programId,
            Pageable pageable);
}
