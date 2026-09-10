package com.ahrao.repository.allocation;

import com.ahrao.entity.allocation.ResourceAllocation;
import com.ahrao.entity.enums.AllocationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResourceAllocationRepository extends JpaRepository<ResourceAllocation, Long>, JpaSpecificationExecutor<ResourceAllocation> {
    List<ResourceAllocation> findByResourceId(Long resourceId);
    List<ResourceAllocation> findByAllocatedToUserId(Long userId);
    List<ResourceAllocation> findByDepartmentId(Long departmentId);
    List<ResourceAllocation> findByStatus(AllocationStatus status);
    List<ResourceAllocation> findByResourceIdAndStatus(Long resourceId, AllocationStatus status);
    long countByStatus(AllocationStatus status);
    long countByDepartmentId(Long departmentId);
    long countByDepartmentIdAndStatus(Long departmentId, AllocationStatus status);
    List<ResourceAllocation> findTop5ByDepartmentIdAndStatusOrderByCreatedAtDesc(Long departmentId, AllocationStatus status);
    List<ResourceAllocation> findTop5ByDepartmentIdOrderByCreatedAtDesc(Long departmentId);
    boolean existsByResourceId(Long resourceId);
    boolean existsByTimeSlotId(Long timeSlotId);
    Optional<ResourceAllocation> findFirstByRequestId(Long requestId);
    List<ResourceAllocation> findByRequestId(Long requestId);
    long countByDepartmentInstitutionId(Long institutionId);
    long countByDepartmentInstitutionIdAndStatus(Long institutionId, AllocationStatus status);

    @Query("SELECT COUNT(ra) > 0 FROM ResourceAllocation ra " +
           "WHERE ra.resource.id = :resourceId " +
           "AND ra.status IN (:activeStatuses) " +
           "AND ra.startDatetime < :endDatetime " +
           "AND ra.endDatetime > :startDatetime")
    boolean existsOverlappingAllocation(
            @Param("resourceId") Long resourceId,
            @Param("activeStatuses") Collection<AllocationStatus> activeStatuses,
            @Param("startDatetime") Instant startDatetime,
            @Param("endDatetime") Instant endDatetime
    );

    @Query("SELECT COUNT(ra) > 0 FROM ResourceAllocation ra " +
           "WHERE ra.allocatedToUser.id = :userId " +
           "AND ra.status IN (:activeStatuses) " +
           "AND ra.startDatetime < :endDatetime " +
           "AND ra.endDatetime > :startDatetime")
    boolean existsOverlappingUserAllocation(
            @Param("userId") Long userId,
            @Param("activeStatuses") Collection<AllocationStatus> activeStatuses,
            @Param("startDatetime") Instant startDatetime,
            @Param("endDatetime") Instant endDatetime
    );

    @Query("SELECT COUNT(ra) > 0 FROM ResourceAllocation ra " +
           "WHERE ra.request.id = :requestId " +
           "AND ra.status IN (:activeStatuses)")
    boolean existsActiveByRequestId(
            @Param("requestId") Long requestId,
            @Param("activeStatuses") Collection<AllocationStatus> activeStatuses
    );

    @Query("SELECT ra FROM ResourceAllocation ra " +
           "WHERE ra.resource.id = :resourceId " +
           "AND ra.status IN (:activeStatuses) " +
           "AND ra.startDatetime < :endDatetime " +
           "AND ra.endDatetime > :startDatetime " +
           "AND (:excludeId IS NULL OR ra.id != :excludeId)")
    List<ResourceAllocation> findOverlappingAllocations(
            @Param("resourceId") Long resourceId,
            @Param("activeStatuses") Collection<AllocationStatus> activeStatuses,
            @Param("startDatetime") Instant startDatetime,
            @Param("endDatetime") Instant endDatetime,
            @Param("excludeId") Long excludeId
    );

    @Query("SELECT ra FROM ResourceAllocation ra " +
           "WHERE ra.allocatedToUser.id = :userId " +
           "AND ra.status IN (:activeStatuses) " +
           "AND ra.startDatetime < :endDatetime " +
           "AND ra.endDatetime > :startDatetime " +
           "AND (:excludeId IS NULL OR ra.id != :excludeId)")
    List<ResourceAllocation> findOverlappingUserAllocations(
            @Param("userId") Long userId,
            @Param("activeStatuses") Collection<AllocationStatus> activeStatuses,
            @Param("startDatetime") Instant startDatetime,
            @Param("endDatetime") Instant endDatetime,
            @Param("excludeId") Long excludeId
    );
}
