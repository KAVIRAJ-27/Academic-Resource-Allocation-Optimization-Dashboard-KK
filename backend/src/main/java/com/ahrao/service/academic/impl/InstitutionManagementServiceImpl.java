package com.ahrao.service.academic.impl;

import com.ahrao.dto.academic.InstitutionResponse;
import com.ahrao.dto.academic.UpdateInstitutionRequest;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.InstitutionRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.academic.InstitutionManagementService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class InstitutionManagementServiceImpl implements InstitutionManagementService {

    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public InstitutionManagementServiceImpl(
            InstitutionRepository institutionRepository,
            UserRepository userRepository,
            AuditLogRepository auditLogRepository) {
        this.institutionRepository = institutionRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public InstitutionResponse getInstitution() {
        Institution institution = getOrCreatePrimaryInstitution();
        return toResponse(institution);
    }

    @Override
    @Transactional
    public InstitutionResponse updateInstitution(
            Long id,
            UpdateInstitutionRequest request,
            String adminUsername,
            String ipAddress,
            String userAgent) {

        Institution institution = institutionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found with ID: " + id));

        // Check code uniqueness if changing
        if (!institution.getCode().equalsIgnoreCase(request.getCode())) {
            institutionRepository.findByCode(request.getCode().trim().toUpperCase())
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(id)) {
                            throw new ConflictException("Institution code '" + request.getCode() + "' is already in use.");
                        }
                    });
        }

        String oldValue = "{\"name\":\"" + institution.getName() + "\",\"code\":\"" + institution.getCode() + "\"}";

        institution.setName(request.getName().trim());
        institution.setCode(request.getCode().trim().toUpperCase());
        institution.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);
        institution.setCity(request.getCity() != null ? request.getCity().trim() : null);
        institution.setState(request.getState() != null ? request.getState().trim() : null);
        institution.setCountry(request.getCountry() != null ? request.getCountry().trim() : "India");
        institution.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        institution.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        institution.setWebsite(request.getWebsite() != null ? request.getWebsite().trim() : null);

        Institution saved = institutionRepository.save(institution);
        String newValue = "{\"name\":\"" + saved.getName() + "\",\"code\":\"" + saved.getCode() + "\"}";

        logAudit(adminUsername, "INSTITUTION_UPDATED", "Institution", saved.getId(), oldValue, newValue, ipAddress, userAgent);

        return toResponse(saved);
    }

    private Institution getOrCreatePrimaryInstitution() {
        List<Institution> list = institutionRepository.findAll();
        if (!list.isEmpty()) {
            return list.get(0);
        }
        Institution defaultInst = new Institution();
        defaultInst.setName("AHRAO Institute of Engineering & Technology");
        defaultInst.setCode("AHRAO-TECH");
        defaultInst.setAddress("Academic Campus, Innovation Valley");
        defaultInst.setCity("Bengaluru");
        defaultInst.setState("Karnataka");
        defaultInst.setCountry("India");
        defaultInst.setEmail("admin@ahrao.edu");
        defaultInst.setPhone("+91 80 1234 5678");
        defaultInst.setWebsite("https://ahrao.edu");
        return institutionRepository.save(defaultInst);
    }

    private void logAudit(String adminUsername, String action, String entityType, Long entityId,
                          String oldValue, String newValue, String ipAddress, String userAgent) {
        AuditLog log = new AuditLog();
        userRepository.findByUsername(adminUsername).ifPresent(log::setUser);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        log.setCreatedAt(Instant.now());
        auditLogRepository.save(log);
    }

    private InstitutionResponse toResponse(Institution entity) {
        InstitutionResponse res = new InstitutionResponse();
        res.setId(entity.getId());
        res.setName(entity.getName());
        res.setCode(entity.getCode());
        res.setAddress(entity.getAddress());
        res.setCity(entity.getCity());
        res.setState(entity.getState());
        res.setCountry(entity.getCountry());
        res.setEmail(entity.getEmail());
        res.setPhone(entity.getPhone());
        res.setWebsite(entity.getWebsite());
        res.setCreatedAt(entity.getCreatedAt());
        res.setUpdatedAt(entity.getUpdatedAt());
        return res;
    }
}
