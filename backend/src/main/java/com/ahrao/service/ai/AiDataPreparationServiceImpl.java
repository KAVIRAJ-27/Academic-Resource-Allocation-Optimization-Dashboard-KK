package com.ahrao.service.ai;

import com.ahrao.dto.ai.*;
import com.ahrao.dto.analytics.HostelOccupancyAnalyticsDto;
import com.ahrao.entity.academic.FacultyWorkload;
import com.ahrao.entity.allocation.ResourceAllocation;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.user.User;
import com.ahrao.repository.academic.FacultyWorkloadRepository;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.analytics.AnalyticsQueryRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AiDataPreparationServiceImpl implements AiDataPreparationService {

    private final ResourceAllocationRepository allocationRepository;
    private final AcademicResourceRequestRepository requestRepository;
    private final AnalyticsQueryRepository queryRepo;
    private final FacultyWorkloadRepository workloadRepository;

    public AiDataPreparationServiceImpl(
            ResourceAllocationRepository allocationRepository,
            AcademicResourceRequestRepository requestRepository,
            AnalyticsQueryRepository queryRepo,
            FacultyWorkloadRepository workloadRepository) {
        this.allocationRepository = allocationRepository;
        this.requestRepository = requestRepository;
        this.queryRepo = queryRepo;
        this.workloadRepository = workloadRepository;
    }

    @Override
    public AiPredictPayloadDto preparePredictPayload(
            AiFilterParams params,
            Long effectiveDepartmentId,
            List<Long> effectiveHostelIds) {

        AiPredictPayloadDto payload = new AiPredictPayloadDto();
        payload.setDepartmentId(effectiveDepartmentId);
        payload.setPredictionHorizon(params != null && params.getHorizon() != null ? params.getHorizon() : "NEXT_MONTH");
        payload.setResourceCategory(params != null ? params.getResourceCategory() : null);

        // 1. Fetch Real Allocations
        List<ResourceAllocation> allocations;
        if (effectiveDepartmentId != null) {
            allocations = allocationRepository.findByDepartmentId(effectiveDepartmentId);
        } else {
            allocations = allocationRepository.findAll(PageRequest.of(0, 150)).getContent();
        }

        List<AllocationHistoryDto> allocDtos = new ArrayList<>();
        for (ResourceAllocation ra : allocations) {
            AllocationHistoryDto dto = new AllocationHistoryDto();
            dto.setId(ra.getId());
            if (ra.getResource() != null) {
                dto.setResourceId(ra.getResource().getId());
                dto.setResourceName(ra.getResource().getName());
                dto.setCategory(ra.getResource().getCategory() != null ? ra.getResource().getCategory().getName() : "CLASSROOM");
                dto.setCapacity(ra.getResource().getCapacity() != null ? ra.getResource().getCapacity() : 60);
            } else {
                dto.setResourceId(1L);
                dto.setResourceName("General Facility");
                dto.setCategory("CLASSROOM");
                dto.setCapacity(60);
            }
            if (ra.getDepartment() != null) {
                dto.setDepartmentId(ra.getDepartment().getId());
                dto.setDepartmentName(ra.getDepartment().getName());
            }
            dto.setAllocatedStudents(ra.getQuantity() != null ? ra.getQuantity() * 30 : 40);
            dto.setDurationHours(1.5);
            dto.setStatus(ra.getStatus() != null ? ra.getStatus().name() : "COMPLETED");
            allocDtos.add(dto);
        }
        payload.setAllocations(allocDtos);

        // 2. Fetch Real Requests
        List<AcademicResourceRequest> requests;
        if (effectiveDepartmentId != null) {
            requests = requestRepository.findByDepartmentId(effectiveDepartmentId);
        } else {
            requests = requestRepository.findAll(PageRequest.of(0, 100)).getContent();
        }

        List<RequestHistoryDto> reqDtos = new ArrayList<>();
        for (AcademicResourceRequest req : requests) {
            RequestHistoryDto dto = new RequestHistoryDto();
            dto.setId(req.getId());
            if (req.getRequestedResource() != null && req.getRequestedResource().getCategory() != null) {
                dto.setResourceCategory(req.getRequestedResource().getCategory().getName());
            } else {
                dto.setResourceCategory("CLASSROOM");
            }
            if (req.getDepartment() != null) {
                dto.setDepartmentId(req.getDepartment().getId());
            }
            dto.setStatus(req.getStatus() != null ? req.getStatus().name() : "PENDING");
            dto.setRequestedCapacity(req.getQuantity() != null ? req.getQuantity() * 35 : 45);
            reqDtos.add(dto);
        }
        payload.setRequests(reqDtos);

        // 3. Fetch Real Hostels
        List<HostelOccupancyAnalyticsDto.HostelOccupancyItemDto> occupancies = queryRepo.getHostelOccupancies(effectiveHostelIds);
        List<HostelHistoryDto> hostelDtos = new ArrayList<>();
        for (HostelOccupancyAnalyticsDto.HostelOccupancyItemDto h : occupancies) {
            HostelHistoryDto dto = new HostelHistoryDto();
            dto.setHostelId(h.getHostelId());
            dto.setHostelName(h.getHostelName());
            dto.setTotalBeds((int) h.getTotalBeds());
            dto.setOccupiedBeds((int) h.getOccupiedBeds());
            dto.setAvailableBeds((int) h.getAvailableBeds());
            dto.setPendingRequests(5);
            dto.setComplaintCount(2);
            hostelDtos.add(dto);
        }
        payload.setHostels(hostelDtos);

        // 4. Fetch Real Faculty Workloads
        List<FacultyWorkload> workloads = workloadRepository.findAll(PageRequest.of(0, 50)).getContent();
        List<FacultyWorkloadHistoryDto> workloadDtos = new ArrayList<>();
        for (FacultyWorkload fw : workloads) {
            FacultyWorkloadHistoryDto dto = new FacultyWorkloadHistoryDto();
            if (fw.getFaculty() != null) {
                dto.setFacultyId(fw.getFaculty().getId());
                User u = fw.getFaculty().getUser();
                if (u != null) {
                    String name = ((u.getFirstName() != null ? u.getFirstName() : "") + " " +
                                  (u.getLastName() != null ? u.getLastName() : "")).trim();
                    dto.setFacultyName(!name.isEmpty() ? name : "Faculty #" + fw.getFaculty().getId());
                } else {
                    dto.setFacultyName("Faculty #" + fw.getFaculty().getId());
                }
                if (fw.getFaculty().getDepartment() != null) {
                    dto.setDepartmentId(fw.getFaculty().getDepartment().getId());
                    dto.setDepartmentName(fw.getFaculty().getDepartment().getName());
                }
            } else {
                dto.setFacultyId(fw.getId());
                dto.setFacultyName("Faculty #" + fw.getId());
            }
            dto.setAssignedHours(fw.getTotalHours() != null ? fw.getTotalHours().doubleValue() : 16.0);
            dto.setMaxHours(20.0);
            dto.setWorkloadStatus(fw.getWorkloadStatus() != null ? fw.getWorkloadStatus() : "NORMAL");
            workloadDtos.add(dto);
        }
        payload.setWorkloads(workloadDtos);

        return payload;
    }
}
