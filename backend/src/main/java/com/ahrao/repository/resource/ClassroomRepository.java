package com.ahrao.repository.resource;

import com.ahrao.entity.resource.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Long>, JpaSpecificationExecutor<Classroom> {
    Optional<Classroom> findByResourceId(Long resourceId);
    boolean existsByResourceId(Long resourceId);
    List<Classroom> findByBuilding(String building);
    Optional<Classroom> findByBuildingAndRoomNumber(String building, String roomNumber);
    boolean existsByBuildingAndRoomNumber(String building, String roomNumber);
    boolean existsByBuildingAndRoomNumberAndIdNot(String building, String roomNumber, Long id);
}
