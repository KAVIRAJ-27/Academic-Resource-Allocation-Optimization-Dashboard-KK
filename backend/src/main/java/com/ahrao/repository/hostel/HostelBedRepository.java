package com.ahrao.repository.hostel;

import com.ahrao.entity.enums.HostelBedStatus;
import com.ahrao.entity.hostel.HostelBed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HostelBedRepository extends JpaRepository<HostelBed, Long>, JpaSpecificationExecutor<HostelBed> {
    List<HostelBed> findByRoomId(Long roomId);
    List<HostelBed> findByStatus(HostelBedStatus status);
    List<HostelBed> findByRoomIdAndStatus(Long roomId, HostelBedStatus status);
    Optional<HostelBed> findByRoomIdAndBedNumber(Long roomId, String bedNumber);
    boolean existsByRoomIdAndBedNumber(Long roomId, String bedNumber);
    boolean existsByRoomIdAndBedNumberAndIdNot(Long roomId, String bedNumber, Long id);
    long countByRoomId(Long roomId);
    long countByRoomIdAndStatus(Long roomId, HostelBedStatus status);
    long countByRoomFloorId(Long floorId);
    long countByRoomFloorIdAndStatus(Long floorId, HostelBedStatus status);
    long countByRoomFloorBlockId(Long blockId);
    long countByRoomFloorBlockIdAndStatus(Long blockId, HostelBedStatus status);
    long countByRoomFloorBlockHostelId(Long hostelId);
    long countByRoomFloorBlockHostelIdAndStatus(Long hostelId, HostelBedStatus status);
    long countByRoomFloorBlockHostelIdIn(java.util.Collection<Long> hostelIds);
    long countByRoomFloorBlockHostelIdInAndStatus(java.util.Collection<Long> hostelIds, HostelBedStatus status);
    long countByRoomFloorBlockHostelInstitutionId(Long institutionId);
    long countByRoomFloorBlockHostelInstitutionIdAndStatus(Long institutionId, HostelBedStatus status);
    long countByStatus(HostelBedStatus status);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT b FROM HostelBed b WHERE b.id = :id")
    Optional<HostelBed> findByIdWithLock(@org.springframework.data.repository.query.Param("id") Long id);

    @org.springframework.data.jpa.repository.Query("SELECT b FROM HostelBed b " +
           "JOIN FETCH b.room r " +
           "JOIN FETCH r.floor f " +
           "JOIN FETCH f.block bl " +
           "JOIN FETCH bl.hostel h " +
           "WHERE h.id IN :hostelIds " +
           "AND b.status = :status " +
           "AND (r.status IS NULL OR r.status = 'AVAILABLE') " +
           "ORDER BY h.id ASC, bl.id ASC, f.floorNumber ASC, r.id ASC, b.id ASC")
    List<HostelBed> findCandidateBedsByHostelIds(
            @org.springframework.data.repository.query.Param("hostelIds") java.util.Collection<Long> hostelIds,
            @org.springframework.data.repository.query.Param("status") HostelBedStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT b FROM HostelBed b " +
           "JOIN FETCH b.room r " +
           "JOIN FETCH r.floor f " +
           "JOIN FETCH f.block bl " +
           "JOIN FETCH bl.hostel h " +
           "WHERE h.id = :hostelId " +
           "AND b.status = :status " +
           "AND (r.status IS NULL OR r.status = 'AVAILABLE') " +
           "ORDER BY bl.id ASC, f.floorNumber ASC, r.id ASC, b.id ASC")
    List<HostelBed> findCandidateBedsByHostelId(
            @org.springframework.data.repository.query.Param("hostelId") Long hostelId,
            @org.springframework.data.repository.query.Param("status") HostelBedStatus status);
}

