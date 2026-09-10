package com.ahrao.repository.resource;

import com.ahrao.entity.enums.ResourceStatus;
import com.ahrao.entity.resource.Resource;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long>, JpaSpecificationExecutor<Resource> {
    Optional<Resource> findByCode(String code);
    boolean existsByCode(String code);
    boolean existsByCodeAndIdNot(String code, Long id);
    List<Resource> findByDepartmentId(Long departmentId);
    List<Resource> findByInstitutionId(Long institutionId);
    List<Resource> findByCategoryId(Long categoryId);
    List<Resource> findByStatus(ResourceStatus status);
    List<Resource> findByDepartmentIdAndStatus(Long departmentId, ResourceStatus status);
    long countByStatus(ResourceStatus status);
    long countByCategoryId(Long categoryId);
    long countByDepartmentId(Long departmentId);
    long countByDepartmentIdAndStatus(Long departmentId, ResourceStatus status);
    long countByInstitutionId(Long institutionId);
    long countByInstitutionIdAndStatus(Long institutionId, ResourceStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Resource r WHERE r.id = :id")
    Optional<Resource> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT r FROM Resource r WHERE r.institution.id = :institutionId " +
           "AND r.category.id = :categoryId " +
           "AND (:departmentId IS NULL OR r.department IS NULL OR r.department.id = :departmentId)")
    List<Resource> findCandidatesForAllocation(
            @Param("institutionId") Long institutionId,
            @Param("categoryId") Long categoryId,
            @Param("departmentId") Long departmentId
    );
}
