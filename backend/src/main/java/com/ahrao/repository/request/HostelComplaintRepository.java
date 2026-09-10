package com.ahrao.repository.request;

import com.ahrao.entity.enums.ComplaintStatus;
import com.ahrao.entity.request.HostelComplaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HostelComplaintRepository extends JpaRepository<HostelComplaint, Long>, JpaSpecificationExecutor<HostelComplaint> {
    List<HostelComplaint> findByStudentId(Long studentId);
    List<HostelComplaint> findByHostelId(Long hostelId);
    List<HostelComplaint> findByStatus(ComplaintStatus status);
    List<HostelComplaint> findByHostelIdAndStatus(Long hostelId, ComplaintStatus status);
    List<HostelComplaint> findByAssignedToId(Long assignedToId);
    long countByStatus(ComplaintStatus status);
    long countByStatusIn(java.util.Collection<ComplaintStatus> statuses);
    long countByHostelIdAndStatusIn(Long hostelId, java.util.Collection<ComplaintStatus> statuses);
    long countByHostelIdInAndStatusIn(java.util.Collection<Long> hostelIds, java.util.Collection<ComplaintStatus> statuses);
    long countByHostelIdIn(java.util.Collection<Long> hostelIds);
    long countByStudentId(Long studentId);
    long countByStudentIdAndStatus(Long studentId, ComplaintStatus status);
}
