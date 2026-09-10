package com.ahrao.repository.resource;

import com.ahrao.entity.resource.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long>, JpaSpecificationExecutor<Equipment> {
    Optional<Equipment> findByResourceId(Long resourceId);
    boolean existsByResourceId(Long resourceId);
    Optional<Equipment> findBySerialNumber(String serialNumber);
    List<Equipment> findByManufacturer(String manufacturer);
    boolean existsBySerialNumber(String serialNumber);
    boolean existsBySerialNumberAndIdNot(String serialNumber, Long id);
}
