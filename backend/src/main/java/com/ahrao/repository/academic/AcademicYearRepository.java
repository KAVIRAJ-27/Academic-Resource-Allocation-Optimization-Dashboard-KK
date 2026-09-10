package com.ahrao.repository.academic;

import com.ahrao.entity.academic.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicYearRepository extends JpaRepository<AcademicYear, Long>, JpaSpecificationExecutor<AcademicYear> {
    List<AcademicYear> findByInstitutionId(Long institutionId);
    Optional<AcademicYear> findByInstitutionIdAndStatus(Long institutionId, String status);
    Optional<AcademicYear> findByInstitutionIdAndName(Long institutionId, String name);
    boolean existsByInstitutionIdAndName(Long institutionId, String name);
    boolean existsByInstitutionIdAndNameAndIdNot(Long institutionId, String name, Long id);
    List<AcademicYear> findByStatus(String status);
    long countByStatus(String status);
}
