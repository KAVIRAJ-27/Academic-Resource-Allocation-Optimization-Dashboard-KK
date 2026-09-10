package com.ahrao.repository.hostel;

import com.ahrao.entity.hostel.Warden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WardenRepository extends JpaRepository<Warden, Long>, JpaSpecificationExecutor<Warden> {
    Optional<Warden> findByEmployeeId(String employeeId);
    Optional<Warden> findByUserId(Long userId);
    boolean existsByEmployeeId(String employeeId);
    boolean existsByEmployeeIdAndIdNot(String employeeId, Long id);
    boolean existsByUserId(Long userId);
    boolean existsByUserIdAndIdNot(Long userId, Long id);
    long countByStatus(String status);

    @Query("SELECT w FROM Warden w JOIN w.assignedHostels h WHERE h.id = :hostelId")
    List<Warden> findByAssignedHostelsId(@Param("hostelId") Long hostelId);

    @Query("SELECT COUNT(w) > 0 FROM Warden w JOIN w.assignedHostels h WHERE h.id = :hostelId")
    boolean existsByAssignedHostelsId(@Param("hostelId") Long hostelId);
}
