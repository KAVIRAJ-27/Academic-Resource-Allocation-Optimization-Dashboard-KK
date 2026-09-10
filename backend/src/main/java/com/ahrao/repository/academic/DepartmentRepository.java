package com.ahrao.repository.academic;

import com.ahrao.entity.academic.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long>, JpaSpecificationExecutor<Department> {
    List<Department> findByInstitutionId(Long institutionId);
    Optional<Department> findByInstitutionIdAndCode(Long institutionId, String code);
    Optional<Department> findByCode(String code);
    boolean existsByInstitutionIdAndCode(Long institutionId, String code);
    boolean existsByInstitutionIdAndCodeAndIdNot(Long institutionId, String code, Long id);
    boolean existsByInstitutionIdAndName(Long institutionId, String name);
    boolean existsByInstitutionIdAndNameAndIdNot(Long institutionId, String name, Long id);
    long countByStatus(String status);
    long countByInstitutionId(Long institutionId);
    long countByInstitutionIdAndStatus(Long institutionId, String status);
}
