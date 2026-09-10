package com.ahrao.service.principal;

import com.ahrao.entity.academic.Faculty;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.academic.PrincipalAssignment;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.InstitutionRepository;
import com.ahrao.repository.academic.PrincipalAssignmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class PrincipalInstitutionResolver {

    private static final Logger log = LoggerFactory.getLogger(PrincipalInstitutionResolver.class);

    private final PrincipalAssignmentRepository principalAssignmentRepository;
    private final FacultyRepository facultyRepository;
    private final InstitutionRepository institutionRepository;

    public PrincipalInstitutionResolver(
            PrincipalAssignmentRepository principalAssignmentRepository,
            FacultyRepository facultyRepository,
            InstitutionRepository institutionRepository) {
        this.principalAssignmentRepository = principalAssignmentRepository;
        this.facultyRepository = facultyRepository;
        this.institutionRepository = institutionRepository;
    }

    /**
     * Resolves the authorized Institution for the authenticated Principal user.
     * Throws ForbiddenException if no valid institution assignment exists.
     */
    public Institution resolvePrincipalInstitution(Long userId) {
        // Priority 1: Active PrincipalAssignment for the user's faculty record
        Optional<PrincipalAssignment> activeAssignment = principalAssignmentRepository
                .findFirstByFacultyUserIdAndStatus(userId, "ACTIVE");
        if (activeAssignment.isPresent() && activeAssignment.get().getInstitution() != null) {
            return activeAssignment.get().getInstitution();
        }

        // Priority 2: Any PrincipalAssignment record for the user's faculty
        Optional<PrincipalAssignment> anyAssignment = principalAssignmentRepository
                .findFirstByFacultyUserId(userId);
        if (anyAssignment.isPresent() && anyAssignment.get().getInstitution() != null) {
            return anyAssignment.get().getInstitution();
        }

        // Priority 3: Faculty department institution link
        Optional<Faculty> facultyOpt = facultyRepository.findByUserId(userId);
        if (facultyOpt.isPresent() && facultyOpt.get().getDepartment() != null
                && facultyOpt.get().getDepartment().getInstitution() != null) {
            return facultyOpt.get().getDepartment().getInstitution();
        }

        // Priority 4: If single primary institution exists
        var allInstitutions = institutionRepository.findAll();
        if (allInstitutions.size() == 1) {
            return allInstitutions.get(0);
        }

        log.warn("Security Alert: User {} attempted Principal access without authorized Institution assignment", userId);
        throw new ForbiddenException("Access denied: No authorized institution assignment found for authenticated Principal.");
    }

    /**
     * Resolves the Faculty entity for the authenticated Principal, if available.
     */
    public Optional<Faculty> resolvePrincipalFaculty(Long userId) {
        return facultyRepository.findByUserId(userId);
    }

    /**
     * Resolves the active PrincipalAssignment for the user, if available.
     */
    public Optional<PrincipalAssignment> resolvePrincipalAssignment(Long userId) {
        return principalAssignmentRepository.findFirstByFacultyUserIdAndStatus(userId, "ACTIVE");
    }
}
