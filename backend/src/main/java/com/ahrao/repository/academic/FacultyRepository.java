package com.ahrao.repository.academic;

import com.ahrao.entity.academic.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long>, JpaSpecificationExecutor<Faculty> {
    Optional<Faculty> findByEmployeeId(String employeeId);
    Optional<Faculty> findByUserId(Long userId);
    List<Faculty> findByDepartmentId(Long departmentId);
    boolean existsByEmployeeId(String employeeId);
    boolean existsByEmployeeIdAndIdNot(String employeeId, Long id);
    boolean existsByUserId(Long userId);
    boolean existsByUserIdAndIdNot(Long userId, Long id);
    long countByDepartmentId(Long departmentId);
    long countByStatus(String status);
    long countByDepartmentInstitutionId(Long institutionId);
    long countByDepartmentInstitutionIdAndStatus(Long institutionId, String status);
    List<Faculty> findByDepartmentInstitutionId(Long institutionId);

    @org.springframework.data.jpa.repository.Query("SELECT f.department.id, f.department.name, COUNT(f) FROM Faculty f WHERE f.department.institution.id = :institutionId GROUP BY f.department.id, f.department.name")
    List<Object[]> countFacultyGroupedByDepartmentInInstitution(@org.springframework.data.repository.query.Param("institutionId") Long institutionId);
}
