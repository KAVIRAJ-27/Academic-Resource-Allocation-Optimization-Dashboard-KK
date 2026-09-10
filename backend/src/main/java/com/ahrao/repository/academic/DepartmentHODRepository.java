package com.ahrao.repository.academic;

import com.ahrao.entity.academic.DepartmentHOD;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentHODRepository extends JpaRepository<DepartmentHOD, Long>, JpaSpecificationExecutor<DepartmentHOD> {
    List<DepartmentHOD> findByDepartmentId(Long departmentId);
    Optional<DepartmentHOD> findByDepartmentIdAndStatus(Long departmentId, String status);
    List<DepartmentHOD> findByFacultyId(Long facultyId);
    Optional<DepartmentHOD> findFirstByFacultyUserIdAndStatus(Long userId, String status);
    boolean existsByDepartmentIdAndStatus(Long departmentId, String status);
    boolean existsByDepartmentIdAndStatusAndIdNot(Long departmentId, String status, Long id);
    long countByStatus(String status);
}
