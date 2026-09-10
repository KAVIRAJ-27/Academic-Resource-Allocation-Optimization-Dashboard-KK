package com.ahrao.service.academic;

import com.ahrao.dto.academic.InstitutionResponse;
import com.ahrao.dto.academic.UpdateInstitutionRequest;

public interface InstitutionManagementService {
    InstitutionResponse getInstitution();
    InstitutionResponse updateInstitution(Long id, UpdateInstitutionRequest request, String adminUsername, String ipAddress, String userAgent);
}
