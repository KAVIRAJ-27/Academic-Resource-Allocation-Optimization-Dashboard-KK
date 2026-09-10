package com.ahrao.repository.hostel;

import com.ahrao.entity.hostel.HostelFloor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HostelFloorRepository extends JpaRepository<HostelFloor, Long>, JpaSpecificationExecutor<HostelFloor> {
    List<HostelFloor> findByBlockId(Long blockId);
    List<HostelFloor> findByBlockIdOrderByFloorNumberAsc(Long blockId);
    Optional<HostelFloor> findByBlockIdAndFloorNumber(Long blockId, Integer floorNumber);
    boolean existsByBlockIdAndFloorNumber(Long blockId, Integer floorNumber);
    boolean existsByBlockIdAndFloorNumberAndIdNot(Long blockId, Integer floorNumber, Long id);
    long countByBlockId(Long blockId);
    long countByBlockHostelId(Long hostelId);
    long countByStatus(String status);
}
