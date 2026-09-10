package com.ahrao.repository.request;

import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.request.AcademicResourceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AcademicResourceRequestRepository extends JpaRepository<AcademicResourceRequest, Long>, JpaSpecificationExecutor<AcademicResourceRequest> {
    List<AcademicResourceRequest> findByRequesterUserId(Long userId);
    List<AcademicResourceRequest> findByDepartmentId(Long departmentId);
    List<AcademicResourceRequest> findByStatus(RequestStatus status);
    List<AcademicResourceRequest> findByRequestedResourceId(Long resourceId);
    List<AcademicResourceRequest> findByDepartmentIdAndStatus(Long departmentId, RequestStatus status);
    long countByStatus(RequestStatus status);
    long countByRequesterUserId(Long userId);
    long countByRequesterUserIdAndStatus(Long userId, RequestStatus status);
    long countByDepartmentId(Long departmentId);
    long countByDepartmentIdAndStatus(Long departmentId, RequestStatus status);
    List<AcademicResourceRequest> findTop5ByDepartmentIdAndStatusOrderByCreatedAtDesc(Long departmentId, RequestStatus status);
    List<AcademicResourceRequest> findTop5ByDepartmentIdOrderByCreatedAtDesc(Long departmentId);
    boolean existsByRequesterUserIdAndRequestedResourceIdAndRequestedDateAndStatus(
            Long userId, Long resourceId, LocalDate requestedDate, RequestStatus status);
    long countByDepartmentInstitutionId(Long institutionId);
    long countByDepartmentInstitutionIdAndStatus(Long institutionId, RequestStatus status);
}
