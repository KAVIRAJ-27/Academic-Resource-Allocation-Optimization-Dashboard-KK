package com.ahrao.repository.resource;

import com.ahrao.entity.resource.Laboratory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LaboratoryRepository extends JpaRepository<Laboratory, Long>, JpaSpecificationExecutor<Laboratory> {
    Optional<Laboratory> findByResourceId(Long resourceId);
    boolean existsByResourceId(Long resourceId);
    List<Laboratory> findByBuilding(String building);
    Optional<Laboratory> findByBuildingAndRoomNumber(String building, String roomNumber);
    boolean existsByBuildingAndRoomNumber(String building, String roomNumber);
    boolean existsByBuildingAndRoomNumberAndIdNot(String building, String roomNumber, Long id);
}
