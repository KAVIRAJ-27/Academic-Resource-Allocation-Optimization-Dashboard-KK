package com.ahrao.repository.academic;

import com.ahrao.entity.academic.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long>, JpaSpecificationExecutor<Student> {
    Optional<Student> findByRegisterNumber(String registerNumber);
    Optional<Student> findByUserId(Long userId);
    List<Student> findByDepartmentId(Long departmentId);
    List<Student> findByProgramId(Long programId);
    List<Student> findBySectionId(Long sectionId);
    boolean existsByRegisterNumber(String registerNumber);
    boolean existsByRegisterNumberAndIdNot(String registerNumber, Long id);
    boolean existsByRollNumber(String rollNumber);
    boolean existsByUserId(Long userId);
    boolean existsByUserIdAndIdNot(Long userId, Long id);
    long countByDepartmentId(Long departmentId);
    long countByProgramId(Long programId);
    long countBySectionId(Long sectionId);
    long countByStatus(String status);

    @org.springframework.data.jpa.repository.Query("SELECT s.program.id, s.program.code, s.program.name, s.program.degreeType, COUNT(s) " +
            "FROM Student s WHERE s.department.id = :departmentId GROUP BY s.program.id, s.program.code, s.program.name, s.program.degreeType")
    List<Object[]> countStudentsGroupedByProgramInDepartment(@org.springframework.data.repository.query.Param("departmentId") Long departmentId);

    long countByDepartmentInstitutionId(Long institutionId);
    long countByDepartmentInstitutionIdAndStatus(Long institutionId, String status);

    @org.springframework.data.jpa.repository.Query("SELECT s.department.id, s.department.name, s.department.code, COUNT(s) " +
            "FROM Student s WHERE s.department.institution.id = :institutionId GROUP BY s.department.id, s.department.name, s.department.code")
    List<Object[]> countStudentsGroupedByDepartmentInInstitution(@org.springframework.data.repository.query.Param("institutionId") Long institutionId);

    @org.springframework.data.jpa.repository.Query("SELECT s.program.id, s.program.name, s.program.code, COUNT(s) " +
            "FROM Student s WHERE s.department.institution.id = :institutionId GROUP BY s.program.id, s.program.name, s.program.code")
    List<Object[]> countStudentsGroupedByProgramInInstitution(@org.springframework.data.repository.query.Param("institutionId") Long institutionId);
}
