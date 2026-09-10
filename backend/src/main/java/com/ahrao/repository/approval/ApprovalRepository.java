package com.ahrao.repository.approval;

import com.ahrao.entity.approval.Approval;
import com.ahrao.entity.enums.ApprovalLevel;
import com.ahrao.entity.enums.ApprovalStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalRepository extends JpaRepository<Approval, Long>, JpaSpecificationExecutor<Approval> {
    List<Approval> findByEntityTypeAndEntityId(String entityType, Long entityId);
    List<Approval> findByEntityTypeAndEntityIdOrderByCreatedAtAsc(String entityType, Long entityId);
    List<Approval> findByStatus(ApprovalStatus status);
    List<Approval> findByApprovedById(Long userId);
    List<Approval> findByRequestedById(Long userId);
    long countByStatus(ApprovalStatus status);
    long countByApprovalLevelAndStatus(ApprovalLevel approvalLevel, ApprovalStatus status);
    List<Approval> findByStatusOrderByCreatedAtDesc(ApprovalStatus status, Pageable pageable);
    List<Approval> findByApprovalLevelAndStatusOrderByCreatedAtDesc(ApprovalLevel approvalLevel, ApprovalStatus status, Pageable pageable);
}
