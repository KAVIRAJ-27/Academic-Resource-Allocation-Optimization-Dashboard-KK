package com.ahrao.service.approval;

import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.approval.Approval;
import com.ahrao.entity.enums.ApprovalLevel;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.request.HostelRequest;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.request.HostelRequestRepository;
import com.ahrao.service.hod.HodDepartmentResolver;
import com.ahrao.service.principal.PrincipalInstitutionResolver;
import com.ahrao.service.warden.WardenScopeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class ApprovalRoutingServiceImpl implements ApprovalRoutingService {

    private static final Logger log = LoggerFactory.getLogger(ApprovalRoutingServiceImpl.class);

    private final AcademicResourceRequestRepository academicRequestRepository;
    private final HostelRequestRepository hostelRequestRepository;
    private final HodDepartmentResolver hodDepartmentResolver;
    private final WardenScopeService wardenScopeService;
    private final PrincipalInstitutionResolver principalInstitutionResolver;

    public ApprovalRoutingServiceImpl(
            AcademicResourceRequestRepository academicRequestRepository,
            HostelRequestRepository hostelRequestRepository,
            HodDepartmentResolver hodDepartmentResolver,
            WardenScopeService wardenScopeService,
            PrincipalInstitutionResolver principalInstitutionResolver) {
        this.academicRequestRepository = academicRequestRepository;
        this.hostelRequestRepository = hostelRequestRepository;
        this.hodDepartmentResolver = hodDepartmentResolver;
        this.wardenScopeService = wardenScopeService;
        this.principalInstitutionResolver = principalInstitutionResolver;
    }

    @Override
    public ApprovalLevel determineApprovalLevel(String entityType, Long entityId, User requester) {
        if (isHostelType(entityType)) {
            return ApprovalLevel.WARDEN;
        }

        // Academic Resource Request routing
        if (requester != null) {
            if (hasRole(requester, "HOD")) {
                return ApprovalLevel.PRINCIPAL;
            }
            if (hasRole(requester, "PRINCIPAL")) {
                return ApprovalLevel.ADMIN;
            }
        }

        return ApprovalLevel.HOD;
    }

    @Override
    public void validateSelfApproval(Approval approval, User approver) {
        if (approval == null || approver == null) {
            return;
        }

        if (approval.getRequestedBy() != null && approver.getId().equals(approval.getRequestedBy().getId())) {
            log.warn("Self-approval attempted: User ID {} tried to approve their own approval ID {}", approver.getId(), approval.getId());
            throw new ForbiddenException("Self-approval is strictly prohibited. Requesters cannot approve their own requests.");
        }
    }

    @Override
    public void validateApproverScope(Approval approval, User approver) {
        if (approval == null || approver == null) {
            throw new ForbiddenException("Approval and approver context must not be null.");
        }

        // 1. Enforce strict anti-self-approval rule
        validateSelfApproval(approval, approver);

        // 2. Administrators have institution-wide authority
        if (hasRole(approver, "ADMIN")) {
            return;
        }

        // Students and regular Faculty cannot approve requests
        if (!hasRole(approver, "HOD") && !hasRole(approver, "WARDEN") && !hasRole(approver, "PRINCIPAL")) {
            throw new ForbiddenException("Access denied: You do not possess an authorized approver role.");
        }

        String entityType = approval.getEntityType();

        // 3. Hostel Request Scope Verification (Warden)
        if (isHostelType(entityType)) {
            if (!hasRole(approver, "WARDEN")) {
                throw new ForbiddenException("Access denied: Only assigned Wardens or Admins can review hostel requests.");
            }

            HostelRequest hostelRequest = hostelRequestRepository.findById(approval.getEntityId())
                    .orElseThrow(() -> new ResourceNotFoundException("HostelRequest not found with id: " + approval.getEntityId()));

            if (hostelRequest.getHostel() != null) {
                Set<Long> authorizedHostels = wardenScopeService.getAuthorizedHostelIds();
                if (!authorizedHostels.contains(hostelRequest.getHostel().getId())) {
                    log.warn("Warden scope violation: Warden ID {} attempted to approve hostel ID {}", approver.getId(), hostelRequest.getHostel().getId());
                    throw new ForbiddenException("Access denied: You are not authorized to review requests for hostel: " + hostelRequest.getHostel().getName());
                }
            }
            return;
        }

        // 4. Academic Request Scope Verification (HOD & Principal)
        if (isAcademicType(entityType)) {
            AcademicResourceRequest academicRequest = academicRequestRepository.findById(approval.getEntityId())
                    .orElseThrow(() -> new ResourceNotFoundException("AcademicResourceRequest not found with id: " + approval.getEntityId()));

            // Principal check
            if (approval.getApprovalLevel() == ApprovalLevel.PRINCIPAL || hasRole(approver, "PRINCIPAL")) {
                if (!hasRole(approver, "PRINCIPAL")) {
                    throw new ForbiddenException("Access denied: This request requires Principal approval.");
                }

                Institution institution = principalInstitutionResolver.resolvePrincipalInstitution(approver.getId());
                if (institution != null && academicRequest.getDepartment() != null && academicRequest.getDepartment().getInstitution() != null) {
                    if (!institution.getId().equals(academicRequest.getDepartment().getInstitution().getId())) {
                        throw new ForbiddenException("Access denied: Request belongs to another institution.");
                    }
                }
                return;
            }

            // HOD check
            if (hasRole(approver, "HOD")) {
                Department hodDept = hodDepartmentResolver.resolveHodDepartment(approver.getId());
                if (academicRequest.getDepartment() != null && !academicRequest.getDepartment().getId().equals(hodDept.getId())) {
                    log.warn("HOD department scope violation: HOD ID {} (dept {}) attempted to approve request in dept {}",
                            approver.getId(), hodDept.getId(), academicRequest.getDepartment().getId());
                    throw new ForbiddenException("Access denied: You can only approve requests belonging to your department (" + hodDept.getName() + ").");
                }
                return;
            }

            throw new ForbiddenException("Access denied: Insufficient authority to approve this academic resource request.");
        }
    }

    @Override
    public boolean isAuthorizedApprover(Approval approval, User user) {
        try {
            validateApproverScope(approval, user);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isAcademicType(String type) {
        return "AcademicResourceRequest".equalsIgnoreCase(type) || "ACADEMIC_RESOURCE".equalsIgnoreCase(type);
    }

    private boolean isHostelType(String type) {
        return "HostelRequest".equalsIgnoreCase(type) || "HOSTEL_RESOURCE".equalsIgnoreCase(type);
    }

    private boolean hasRole(User user, String roleName) {
        if (user == null || user.getRoles() == null) {
            return false;
        }
        return user.getRoles().stream()
                .anyMatch(r -> r.getName().equalsIgnoreCase(roleName) || r.getName().equalsIgnoreCase("ROLE_" + roleName));
    }
}
