package com.ahrao.repository.audit;

import com.ahrao.entity.audit.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserId(Long userId);
    List<AuditLog> findByEntityTypeAndEntityId(String entityType, Long entityId);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM AuditLog a LEFT JOIN FETCH a.user u ORDER BY a.createdAt DESC")
    java.util.List<AuditLog> findRecentAuditLogs(org.springframework.data.domain.Pageable pageable);

    java.util.List<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId, org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM AuditLog a LEFT JOIN FETCH a.user u WHERE a.user.id IN (SELECT f.user.id FROM Faculty f WHERE f.department.id = :departmentId) ORDER BY a.createdAt DESC")
    java.util.List<AuditLog> findRecentDepartmentAuditLogs(@org.springframework.data.repository.query.Param("departmentId") Long departmentId, org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM AuditLog a LEFT JOIN FETCH a.user u WHERE a.user.id IN (SELECT f.user.id FROM Faculty f WHERE f.department.institution.id = :institutionId) OR a.user.id IN (SELECT s.user.id FROM Student s WHERE s.department.institution.id = :institutionId) ORDER BY a.createdAt DESC")
    java.util.List<AuditLog> findRecentInstitutionAuditLogs(@org.springframework.data.repository.query.Param("institutionId") Long institutionId, org.springframework.data.domain.Pageable pageable);
}
