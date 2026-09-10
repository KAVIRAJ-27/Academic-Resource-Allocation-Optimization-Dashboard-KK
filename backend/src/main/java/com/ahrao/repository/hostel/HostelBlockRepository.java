package com.ahrao.repository.hostel;

import com.ahrao.entity.hostel.HostelBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HostelBlockRepository extends JpaRepository<HostelBlock, Long>, JpaSpecificationExecutor<HostelBlock> {
    List<HostelBlock> findByHostelId(Long hostelId);
    Optional<HostelBlock> findByHostelIdAndCode(Long hostelId, String code);
    boolean existsByHostelIdAndCode(Long hostelId, String code);
    boolean existsByHostelIdAndCodeAndIdNot(Long hostelId, String code, Long id);
    long countByHostelId(Long hostelId);
    long countByStatus(String status);
}
