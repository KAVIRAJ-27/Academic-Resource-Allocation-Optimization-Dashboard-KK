package com.ahrao.repository.academic;

import com.ahrao.entity.academic.PrincipalAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrincipalAssignmentRepository extends JpaRepository<PrincipalAssignment, Long>, JpaSpecificationExecutor<PrincipalAssignment> {
    List<PrincipalAssignment> findByInstitutionId(Long institutionId);
    Optional<PrincipalAssignment> findByInstitutionIdAndStatus(Long institutionId, String status);
    List<PrincipalAssignment> findByFacultyId(Long facultyId);
    Optional<PrincipalAssignment> findFirstByFacultyUserIdAndStatus(Long userId, String status);
    Optional<PrincipalAssignment> findFirstByFacultyUserId(Long userId);
    boolean existsByInstitutionIdAndStatus(Long institutionId, String status);
    boolean existsByInstitutionIdAndStatusAndIdNot(Long institutionId, String status, Long id);
    long countByStatus(String status);
}
