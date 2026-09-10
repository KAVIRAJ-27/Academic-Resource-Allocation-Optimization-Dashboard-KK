package com.ahrao.repository.academic;

import com.ahrao.entity.academic.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, Long>, JpaSpecificationExecutor<Semester> {
    List<Semester> findByAcademicYearId(Long academicYearId);
    Optional<Semester> findByAcademicYearIdAndNumber(Long academicYearId, Integer number);
    boolean existsByAcademicYearIdAndNumber(Long academicYearId, Integer number);
    boolean existsByAcademicYearIdAndNumberAndIdNot(Long academicYearId, Integer number, Long id);
    long countByAcademicYearId(Long academicYearId);
    long countByAcademicYearIdAndStatus(Long academicYearId, String status);
    long countByStatus(String status);
}
