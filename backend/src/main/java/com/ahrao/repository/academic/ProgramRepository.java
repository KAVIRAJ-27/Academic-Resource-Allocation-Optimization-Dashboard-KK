package com.ahrao.repository.academic;

import com.ahrao.entity.academic.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgramRepository extends JpaRepository<Program, Long>, JpaSpecificationExecutor<Program> {
    List<Program> findByDepartmentId(Long departmentId);
    Optional<Program> findByDepartmentIdAndCode(Long departmentId, String code);
    Optional<Program> findByCode(String code);
    boolean existsByDepartmentIdAndCode(Long departmentId, String code);
    boolean existsByDepartmentIdAndCodeAndIdNot(Long departmentId, String code, Long id);
    boolean existsByDepartmentIdAndName(Long departmentId, String name);
    boolean existsByDepartmentIdAndNameAndIdNot(Long departmentId, String name, Long id);
    long countByDepartmentId(Long departmentId);
    long countByDepartmentIdAndStatus(Long departmentId, String status);
    long countByStatus(String status);
    long countByDepartmentInstitutionId(Long institutionId);
    long countByDepartmentInstitutionIdAndStatus(Long institutionId, String status);
    List<Program> findByDepartmentInstitutionId(Long institutionId);
}
