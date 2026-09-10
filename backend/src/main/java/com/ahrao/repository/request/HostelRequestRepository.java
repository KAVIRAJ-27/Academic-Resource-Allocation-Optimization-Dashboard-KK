package com.ahrao.repository.request;

import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.request.HostelRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HostelRequestRepository extends JpaRepository<HostelRequest, Long>, JpaSpecificationExecutor<HostelRequest> {
    List<HostelRequest> findByStudentId(Long studentId);
    List<HostelRequest> findByHostelId(Long hostelId);
    List<HostelRequest> findByStatus(RequestStatus status);
    List<HostelRequest> findByStudentIdAndStatus(Long studentId, RequestStatus status);
    long countByStatus(RequestStatus status);
    long countByStudentId(Long studentId);
    long countByStudentIdAndStatus(Long studentId, RequestStatus status);
    boolean existsByStudentIdAndHostelIdAndRequestTypeAndStatus(Long studentId, Long hostelId, String requestType, RequestStatus status);
}
