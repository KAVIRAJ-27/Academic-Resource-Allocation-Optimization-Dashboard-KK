package com.ahrao.repository.hostel;

import com.ahrao.entity.hostel.Hostel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HostelRepository extends JpaRepository<Hostel, Long>, JpaSpecificationExecutor<Hostel> {
    List<Hostel> findByInstitutionId(Long institutionId);
    Optional<Hostel> findByCode(String code);
    boolean existsByCode(String code);
    boolean existsByCodeAndIdNot(String code, Long id);
    long countByStatus(String status);
    long countByInstitutionId(Long institutionId);
}
