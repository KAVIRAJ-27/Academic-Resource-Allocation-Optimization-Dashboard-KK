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

    @org.springframework.data.jpa.repository.Query("SELECT ha FROM HostelAllocation ha WHERE ha.bed.id = :hostelBedId")
    List<HostelAllocation> findByHostelBedId(@org.springframework.data.repository.query.Param("hostelBedId") Long hostelBedId);

    List<HostelAllocation> findByStatus(AllocationStatus status);
    Optional<HostelAllocation> findByStudentIdAndStatus(Long studentId, AllocationStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT ha FROM HostelAllocation ha WHERE ha.bed.id = :hostelBedId AND ha.status = :status")
    Optional<HostelAllocation> findByHostelBedIdAndStatus(@org.springframework.data.repository.query.Param("hostelBedId") Long hostelBedId, @org.springframework.data.repository.query.Param("status") AllocationStatus status);

    List<HostelAllocation> findByAcademicYearId(Long academicYearId);
    long countByStatus(AllocationStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(ha) > 0 FROM HostelAllocation ha WHERE ha.bed.id = :hostelBedId")
    boolean existsByHostelBedId(@org.springframework.data.repository.query.Param("hostelBedId") Long hostelBedId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(ha) > 0 FROM HostelAllocation ha WHERE ha.bed.room.id = :roomId")
    boolean existsByHostelBedRoomId(@org.springframework.data.repository.query.Param("roomId") Long roomId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(ha) > 0 FROM HostelAllocation ha WHERE ha.bed.id = :hostelBedId AND ha.status = :status")
    boolean existsByHostelBedIdAndStatus(@org.springframework.data.repository.query.Param("hostelBedId") Long hostelBedId, @org.springframework.data.repository.query.Param("status") AllocationStatus status);

    boolean existsByStudentIdAndStatus(Long studentId, AllocationStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(ha) FROM HostelAllocation ha WHERE ha.bed.room.id = :roomId AND ha.status = :status")
    long countByHostelBedRoomIdAndStatus(@org.springframework.data.repository.query.Param("roomId") Long roomId, @org.springframework.data.repository.query.Param("status") AllocationStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(ha) FROM HostelAllocation ha WHERE ha.bed.room.floor.block.hostel.id = :hostelId AND ha.status = :status")
    long countByHostelBedRoomFloorBlockHostelIdAndStatus(@org.springframework.data.repository.query.Param("hostelId") Long hostelId, @org.springframework.data.repository.query.Param("status") AllocationStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(ha) FROM HostelAllocation ha WHERE ha.bed.room.floor.block.hostel.id IN :hostelIds AND ha.status = :status")
    long countByHostelBedRoomFloorBlockHostelIdInAndStatus(@org.springframework.data.repository.query.Param("hostelIds") java.util.Collection<Long> hostelIds, @org.springframework.data.repository.query.Param("status") AllocationStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT ha FROM HostelAllocation ha WHERE ha.bed.room.id = :roomId AND ha.status = :status")
    List<HostelAllocation> findByHostelBedRoomIdAndStatus(@org.springframework.data.repository.query.Param("roomId") Long roomId, @org.springframework.data.repository.query.Param("status") AllocationStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT ha FROM HostelAllocation ha WHERE ha.bed.room.floor.block.hostel.id = :hostelId AND ha.status = :status")
    List<HostelAllocation> findByHostelBedRoomFloorBlockHostelIdAndStatus(@org.springframework.data.repository.query.Param("hostelId") Long hostelId, @org.springframework.data.repository.query.Param("status") AllocationStatus status);

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
