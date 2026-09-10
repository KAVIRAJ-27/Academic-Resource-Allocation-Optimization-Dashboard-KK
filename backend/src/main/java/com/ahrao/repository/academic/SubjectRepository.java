package com.ahrao.repository.academic;

import com.ahrao.entity.academic.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long>, JpaSpecificationExecutor<Subject> {
    List<Subject> findByProgramId(Long programId);
    List<Subject> findBySemesterId(Long semesterId);
    Optional<Subject> findByCode(String code);
    Optional<Subject> findByProgramIdAndCode(Long programId, String code);
    boolean existsByProgramIdAndCode(Long programId, String code);
    boolean existsByProgramIdAndCodeAndIdNot(Long programId, String code, Long id);
    long countByProgramId(Long programId);
    long countByProgramIdAndStatus(Long programId, String status);
    long countBySemesterId(Long semesterId);
    long countBySemesterIdAndStatus(Long semesterId, String status);
    long countByStatus(String status);
    long countByProgramDepartmentId(Long departmentId);
    long countByProgramDepartmentIdAndStatus(Long departmentId, String status);
    long countByProgramDepartmentInstitutionId(Long institutionId);
    long countByProgramDepartmentInstitutionIdAndStatus(Long institutionId, String status);
}
