package com.ahrao.repository.academic;

import com.ahrao.entity.academic.FacultySubjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacultySubjectAssignmentRepository extends JpaRepository<FacultySubjectAssignment, Long> {
    List<FacultySubjectAssignment> findByFacultyId(Long facultyId);
    List<FacultySubjectAssignment> findBySubjectId(Long subjectId);
    List<FacultySubjectAssignment> findBySectionId(Long sectionId);
    List<FacultySubjectAssignment> findBySubjectIdAndSectionId(Long subjectId, Long sectionId);
    java.util.Optional<FacultySubjectAssignment> findFirstBySubjectIdAndSectionId(Long subjectId, Long sectionId);
    java.util.Optional<FacultySubjectAssignment> findFirstBySubjectId(Long subjectId);
    List<FacultySubjectAssignment> findByAcademicYearIdAndSemesterId(Long academicYearId, Long semesterId);
    List<FacultySubjectAssignment> findByFacultyIdAndAcademicYearIdAndSemesterId(
            Long facultyId, Long academicYearId, Long semesterId);
    long countByFacultyId(Long facultyId);
    long countByFacultyIdAndStatus(Long facultyId, String status);

    boolean existsByFacultyIdAndSubjectId(Long facultyId, Long subjectId);
    List<FacultySubjectAssignment> findByFacultyIdAndSubjectId(Long facultyId, Long subjectId);

    @org.springframework.data.jpa.repository.Query("SELECT fsa FROM FacultySubjectAssignment fsa " +
            "JOIN FETCH fsa.subject s " +
            "JOIN FETCH s.program p " +
            "LEFT JOIN FETCH p.department d " +
            "LEFT JOIN FETCH fsa.section sec " +
            "LEFT JOIN FETCH fsa.academicYear ay " +
            "LEFT JOIN FETCH fsa.semester sem " +
            "WHERE fsa.faculty.id = :facultyId AND fsa.status = 'ACTIVE'")
    List<FacultySubjectAssignment> findActiveByFacultyIdWithDetails(
            @org.springframework.data.repository.query.Param("facultyId") Long facultyId);

    @org.springframework.data.jpa.repository.Query("SELECT fsa FROM FacultySubjectAssignment fsa " +
            "JOIN FETCH fsa.subject s " +
            "JOIN FETCH s.program p " +
            "LEFT JOIN FETCH p.department d " +
            "LEFT JOIN FETCH fsa.section sec " +
            "LEFT JOIN FETCH fsa.academicYear ay " +
            "LEFT JOIN FETCH fsa.semester sem " +
            "WHERE fsa.faculty.id = :facultyId AND fsa.subject.id = :subjectId AND fsa.status = 'ACTIVE'")
    List<FacultySubjectAssignment> findActiveByFacultyIdAndSubjectIdWithDetails(
            @org.springframework.data.repository.query.Param("facultyId") Long facultyId,
            @org.springframework.data.repository.query.Param("subjectId") Long subjectId);

    @org.springframework.data.jpa.repository.Query("SELECT fsa FROM FacultySubjectAssignment fsa " +
            "JOIN FETCH fsa.faculty f " +
            "JOIN FETCH f.user u " +
            "JOIN FETCH fsa.subject s " +
            "JOIN FETCH s.program p " +
            "LEFT JOIN FETCH p.department d " +
            "LEFT JOIN FETCH fsa.section sec " +
            "LEFT JOIN FETCH fsa.academicYear ay " +
            "LEFT JOIN FETCH fsa.semester sem " +
            "WHERE f.department.id = :departmentId AND fsa.status = 'ACTIVE' " +
            "ORDER BY f.id, s.code")
    List<FacultySubjectAssignment> findActiveByDepartmentIdWithDetails(
            @org.springframework.data.repository.query.Param("departmentId") Long departmentId);
}

