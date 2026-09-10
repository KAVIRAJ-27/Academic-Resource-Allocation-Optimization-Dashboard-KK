package com.ahrao.repository.allocation;

import com.ahrao.entity.allocation.HostelAllocation;
import com.ahrao.entity.enums.AllocationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HostelAllocationRepository extends JpaRepository<HostelAllocation, Long>, JpaSpecificationExecutor<HostelAllocation> {
    List<HostelAllocation> findByStudentId(Long studentId);
    List<HostelAllocation> findByHostelBedId(Long hostelBedId);
    List<HostelAllocation> findByStatus(AllocationStatus status);
    Optional<HostelAllocation> findByStudentIdAndStatus(Long studentId, AllocationStatus status);
    Optional<HostelAllocation> findByHostelBedIdAndStatus(Long hostelBedId, AllocationStatus status);
    List<HostelAllocation> findByAcademicYearId(Long academicYearId);
    long countByStatus(AllocationStatus status);
    boolean existsByHostelBedId(Long hostelBedId);
    boolean existsByHostelBedRoomId(Long roomId);
    boolean existsByHostelBedIdAndStatus(Long hostelBedId, AllocationStatus status);
    boolean existsByStudentIdAndStatus(Long studentId, AllocationStatus status);
    long countByHostelBedRoomIdAndStatus(Long roomId, AllocationStatus status);
    long countByHostelBedRoomFloorBlockHostelIdAndStatus(Long hostelId, AllocationStatus status);
    long countByHostelBedRoomFloorBlockHostelIdInAndStatus(java.util.Collection<Long> hostelIds, AllocationStatus status);
    List<HostelAllocation> findByHostelBedRoomIdAndStatus(Long roomId, AllocationStatus status);
    List<HostelAllocation> findByHostelBedRoomFloorBlockHostelIdAndStatus(Long hostelId, AllocationStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT ha FROM HostelAllocation ha " +
           "WHERE ha.bed.id = :bedId " +
           "AND ha.status = :status " +
           "AND (ha.endDate IS NULL OR :startDate IS NULL OR ha.endDate >= :startDate) " +
           "AND (:endDate IS NULL OR ha.startDate <= :endDate) " +
           "AND (:excludeId IS NULL OR ha.id != :excludeId)")
    List<HostelAllocation> findOverlappingBedAllocations(
            @org.springframework.data.repository.query.Param("bedId") Long bedId,
            @org.springframework.data.repository.query.Param("status") AllocationStatus status,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate,
            @org.springframework.data.repository.query.Param("excludeId") Long excludeId
    );

    @org.springframework.data.jpa.repository.Query("SELECT ha FROM HostelAllocation ha " +
           "WHERE ha.student.id = :studentId " +
           "AND ha.status = :status " +
           "AND (ha.endDate IS NULL OR :startDate IS NULL OR ha.endDate >= :startDate) " +
           "AND (:endDate IS NULL OR ha.startDate <= :endDate) " +
           "AND (:excludeId IS NULL OR ha.id != :excludeId)")
    List<HostelAllocation> findOverlappingStudentAllocations(
            @org.springframework.data.repository.query.Param("studentId") Long studentId,
            @org.springframework.data.repository.query.Param("status") AllocationStatus status,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate,
            @org.springframework.data.repository.query.Param("excludeId") Long excludeId
    );
}
