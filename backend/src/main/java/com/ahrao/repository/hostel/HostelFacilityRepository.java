package com.ahrao.repository.hostel;

import com.ahrao.entity.hostel.HostelFacility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HostelFacilityRepository extends JpaRepository<HostelFacility, Long>, JpaSpecificationExecutor<HostelFacility> {
    List<HostelFacility> findByHostelId(Long hostelId);
    Optional<HostelFacility> findByHostelIdAndName(Long hostelId, String name);
    boolean existsByHostelIdAndName(Long hostelId, String name);
    boolean existsByHostelIdAndNameAndIdNot(Long hostelId, String name, Long id);
    long countByHostelId(Long hostelId);
    long countByStatus(String status);
    long countByHostelIdIn(java.util.Collection<Long> hostelIds);
    long countByHostelIdInAndStatus(java.util.Collection<Long> hostelIds, String status);
}
