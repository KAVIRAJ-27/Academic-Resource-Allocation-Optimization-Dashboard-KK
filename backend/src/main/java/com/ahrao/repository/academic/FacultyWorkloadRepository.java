package com.ahrao.repository.academic;

import com.ahrao.entity.academic.FacultyWorkload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyWorkloadRepository extends JpaRepository<FacultyWorkload, Long> {
    List<FacultyWorkload> findByFacultyId(Long facultyId);
    Optional<FacultyWorkload> findByFacultyIdAndAcademicYearIdAndSemesterId(
            Long facultyId, Long academicYearId, Long semesterId);
    Optional<FacultyWorkload> findFirstByFacultyIdOrderByCalculatedAtDesc(Long facultyId);

    @org.springframework.data.jpa.repository.Query("SELECT fw.workloadStatus, COUNT(fw) FROM FacultyWorkload fw WHERE fw.faculty.department.institution.id = :institutionId GROUP BY fw.workloadStatus")
    List<Object[]> countWorkloadsGroupedByStatusInInstitution(@org.springframework.data.repository.query.Param("institutionId") Long institutionId);

    @org.springframework.data.jpa.repository.Query("SELECT AVG(fw.totalHours) FROM FacultyWorkload fw WHERE fw.faculty.department.institution.id = :institutionId")
    Double findAverageHoursInInstitution(@org.springframework.data.repository.query.Param("institutionId") Long institutionId);
}
