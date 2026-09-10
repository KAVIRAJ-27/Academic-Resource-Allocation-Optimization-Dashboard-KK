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
    @org.springframework.data.jpa.repository.Query("SELECT r FROM AcademicResourceRequest r WHERE r.requester.id = :userId")
    List<AcademicResourceRequest> findByRequesterUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

    List<AcademicResourceRequest> findByDepartmentId(Long departmentId);
    List<AcademicResourceRequest> findByStatus(RequestStatus status);
    List<AcademicResourceRequest> findByRequestedResourceId(Long resourceId);
    List<AcademicResourceRequest> findByDepartmentIdAndStatus(Long departmentId, RequestStatus status);
    long countByStatus(RequestStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(r) FROM AcademicResourceRequest r WHERE r.requester.id = :userId")
    long countByRequesterUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(r) FROM AcademicResourceRequest r WHERE r.requester.id = :userId AND r.status = :status")
    long countByRequesterUserIdAndStatus(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("status") RequestStatus status);

    long countByDepartmentId(Long departmentId);
    long countByDepartmentIdAndStatus(Long departmentId, RequestStatus status);
    List<AcademicResourceRequest> findTop5ByDepartmentIdAndStatusOrderByCreatedAtDesc(Long departmentId, RequestStatus status);
    List<AcademicResourceRequest> findTop5ByDepartmentIdOrderByCreatedAtDesc(Long departmentId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(r) > 0 FROM AcademicResourceRequest r WHERE r.requester.id = :userId AND r.requestedResource.id = :resourceId AND r.requestedDate = :requestedDate AND r.status = :status")
    boolean existsByRequesterUserIdAndRequestedResourceIdAndRequestedDateAndStatus(
            @org.springframework.data.repository.query.Param("userId") Long userId,
            @org.springframework.data.repository.query.Param("resourceId") Long resourceId,
            @org.springframework.data.repository.query.Param("requestedDate") LocalDate requestedDate,
            @org.springframework.data.repository.query.Param("status") RequestStatus status);

    long countByDepartmentInstitutionId(Long institutionId);
    long countByDepartmentInstitutionIdAndStatus(Long institutionId, RequestStatus status);
}
