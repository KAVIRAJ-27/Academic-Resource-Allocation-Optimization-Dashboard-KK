package com.ahrao.repository.hostel;

import com.ahrao.entity.hostel.HostelRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HostelRoomRepository extends JpaRepository<HostelRoom, Long>, JpaSpecificationExecutor<HostelRoom> {
    List<HostelRoom> findByFloorId(Long floorId);
    List<HostelRoom> findByFloorIdOrderByRoomNumberAsc(Long floorId);
    Optional<HostelRoom> findByFloorIdAndRoomNumber(Long floorId, String roomNumber);
    boolean existsByFloorIdAndRoomNumber(Long floorId, String roomNumber);
    boolean existsByFloorIdAndRoomNumberAndIdNot(Long floorId, String roomNumber, Long id);
    List<HostelRoom> findByRoomNumber(String roomNumber);
    long countByFloorId(Long floorId);
    long countByFloorBlockId(Long blockId);
    long countByFloorBlockHostelId(Long hostelId);
    long countByFloorBlockHostelInstitutionId(Long institutionId);
    long countByStatus(String status);
}
