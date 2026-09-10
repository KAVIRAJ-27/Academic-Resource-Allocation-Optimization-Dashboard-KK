package com.ahrao.repository.request;

import com.ahrao.entity.enums.MaintenanceStatus;
import com.ahrao.entity.request.MaintenanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long>, JpaSpecificationExecutor<MaintenanceRequest> {
    List<MaintenanceRequest> findByHostelId(Long hostelId);
    List<MaintenanceRequest> findByResourceId(Long resourceId);
    List<MaintenanceRequest> findByStatus(MaintenanceStatus status);
    List<MaintenanceRequest> findByReportedById(Long userId);
    List<MaintenanceRequest> findByAssignedToId(Long userId);
    long countByStatus(MaintenanceStatus status);
    long countByStatusIn(Collection<MaintenanceStatus> statuses);
    long countByHostelIdAndStatusIn(Long hostelId, Collection<MaintenanceStatus> statuses);
    long countByHostelIdInAndStatusIn(Collection<Long> hostelIds, Collection<MaintenanceStatus> statuses);
    long countByHostelIdIn(Collection<Long> hostelIds);
}
