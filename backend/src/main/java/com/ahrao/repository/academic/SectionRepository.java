package com.ahrao.repository.academic;

import com.ahrao.entity.academic.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long>, JpaSpecificationExecutor<Section> {
    List<Section> findByProgramId(Long programId);
    List<Section> findByAcademicYearId(Long academicYearId);
    List<Section> findBySemesterId(Long semesterId);
    Optional<Section> findByProgramIdAndAcademicYearIdAndSemesterIdAndName(
            Long programId, Long academicYearId, Long semesterId, String name);
    boolean existsByProgramIdAndAcademicYearIdAndSemesterIdAndName(
            Long programId, Long academicYearId, Long semesterId, String name);
    boolean existsByProgramIdAndAcademicYearIdAndSemesterIdAndNameAndIdNot(
            Long programId, Long academicYearId, Long semesterId, String name, Long id);
    long countByProgramId(Long programId);
    long countByAcademicYearId(Long academicYearId);
    long countBySemesterId(Long semesterId);
    long countByProgramIdAndStatus(Long programId, String status);
    long countByAcademicYearIdAndStatus(Long academicYearId, String status);
    long countBySemesterIdAndStatus(Long semesterId, String status);
    long countByStatus(String status);
    long countByProgramDepartmentIdAndStatus(Long departmentId, String status);
    long countByProgramDepartmentInstitutionId(Long institutionId);
    long countByProgramDepartmentInstitutionIdAndStatus(Long institutionId, String status);
    List<Section> findByProgramDepartmentId(Long departmentId);
}
