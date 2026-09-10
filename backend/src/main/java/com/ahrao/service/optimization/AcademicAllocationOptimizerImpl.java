package com.ahrao.service.optimization;

import com.ahrao.config.optimization.AcademicOptimizationWeights;
import com.ahrao.dto.conflict.ConflictCheckRequestDto;
import com.ahrao.dto.conflict.ConflictResultDto;
import com.ahrao.dto.optimization.AcademicOptimizationRequestDto;
import com.ahrao.dto.optimization.OptimizationRecommendationDto;
import com.ahrao.dto.optimization.OptimizationResultDto;
import com.ahrao.dto.optimization.ScoreBreakdownDto;
import com.ahrao.entity.academic.FacultyWorkload;
import com.ahrao.entity.allocation.ResourceAllocation;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.ConflictDomain;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.resource.Classroom;
import com.ahrao.entity.resource.Laboratory;
import com.ahrao.entity.resource.Resource;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.FacultyWorkloadRepository;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.resource.ClassroomRepository;
import com.ahrao.repository.resource.LaboratoryRepository;
import com.ahrao.repository.resource.ResourceRepository;
import com.ahrao.service.conflict.ConflictDetectionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class AcademicAllocationOptimizerImpl implements AcademicAllocationOptimizer {

    private static final Logger log = LoggerFactory.getLogger(AcademicAllocationOptimizerImpl.class);

    private final AcademicResourceRequestRepository requestRepository;
    private final ResourceRepository resourceRepository;
    private final ConflictDetectionService conflictDetectionService;
    private final ClassroomRepository classroomRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final ResourceAllocationRepository allocationRepository;
    private final FacultyWorkloadRepository workloadRepository;
    private final AcademicOptimizationWeights weights;
    private final AuditLogRepository auditLogRepository;

    public AcademicAllocationOptimizerImpl(
            AcademicResourceRequestRepository requestRepository,
            ResourceRepository resourceRepository,
            ConflictDetectionService conflictDetectionService,
            ClassroomRepository classroomRepository,
            LaboratoryRepository laboratoryRepository,
            ResourceAllocationRepository allocationRepository,
            FacultyWorkloadRepository workloadRepository,
            AcademicOptimizationWeights weights,
            AuditLogRepository auditLogRepository) {
        this.requestRepository = requestRepository;
        this.resourceRepository = resourceRepository;
        this.conflictDetectionService = conflictDetectionService;
        this.classroomRepository = classroomRepository;
        this.laboratoryRepository = laboratoryRepository;
        this.allocationRepository = allocationRepository;
        this.workloadRepository = workloadRepository;
        this.weights = weights;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public OptimizationResultDto optimizeAcademicAllocation(AcademicOptimizationRequestDto requestDto, User actor) {
        if (requestDto == null) {
            throw new BadRequestException("Optimization request parameters cannot be null.");
        }

        AcademicResourceRequest academicRequest = null;
        if (requestDto.getRequestId() != null) {
            academicRequest = requestRepository.findById(requestDto.getRequestId())
                    .orElseThrow(() -> new ResourceNotFoundException("Academic resource request not found with ID: " + requestDto.getRequestId()));
        }

        // Resolve parameters with fallback to entity values
        int requestedCapacity = requestDto.getRequestedCapacity() != null ? requestDto.getRequestedCapacity()
                : (academicRequest != null && academicRequest.getQuantity() != null && academicRequest.getQuantity() > 0
                ? academicRequest.getQuantity() : 1);

        LocalDate requestedDate = requestDto.getRequestedDate() != null ? requestDto.getRequestedDate()
                : (academicRequest != null ? academicRequest.getRequestedDate() : LocalDate.now());

        LocalTime startTime = requestDto.getStartTime() != null ? requestDto.getStartTime()
                : (academicRequest != null ? academicRequest.getStartTime() : LocalTime.of(9, 0));

        LocalTime endTime = requestDto.getEndTime() != null ? requestDto.getEndTime()
                : (academicRequest != null ? academicRequest.getEndTime() : LocalTime.of(10, 0));

        Long categoryId = requestDto.getCategoryId() != null ? requestDto.getCategoryId()
                : (academicRequest != null && academicRequest.getCategory() != null ? academicRequest.getCategory().getId() : null);

        Long departmentId = requestDto.getDepartmentId() != null ? requestDto.getDepartmentId()
                : (academicRequest != null && academicRequest.getDepartment() != null ? academicRequest.getDepartment().getId() : null);

        Long facultyId = academicRequest != null && academicRequest.getRequester() != null
                ? academicRequest.getRequester().getId() : null;

        Long timeSlotId = requestDto.getTimeSlotId();

        // 1. Generate realistic candidate resources
        List<Resource> rawCandidates = fetchCandidateResources(academicRequest, categoryId, departmentId);
        int totalEvaluated = rawCandidates.size();

        if (rawCandidates.isEmpty()) {
            return OptimizationResultDto.failure(requestDto.getRequestId(), 0, "No candidate resources match requested category and scope.");
        }

        // 2. Filter candidates against Phase 30 Hard Constraints
        List<OptimizationRecommendationDto> recommendations = new ArrayList<>();

        for (Resource candidate : rawCandidates) {
            // Hard constraint: Resource must not be INACTIVE or MAINTENANCE, and must have sufficient capacity
            if (candidate.getStatus() == com.ahrao.entity.enums.ResourceStatus.INACTIVE
                    || candidate.getStatus() == com.ahrao.entity.enums.ResourceStatus.MAINTENANCE) {
                continue;
            }
            if (candidate.getCapacity() != null && candidate.getCapacity() < requestedCapacity) {
                continue;
            }

            // Phase 30 Hard Constraint check
            ConflictCheckRequestDto checkReq = new ConflictCheckRequestDto();
            checkReq.setDomain(ConflictDomain.ACADEMIC);
            checkReq.setResourceId(candidate.getId());
            checkReq.setRequestId(academicRequest != null ? academicRequest.getId() : null);
            checkReq.setFacultyId(facultyId);
            checkReq.setTimeSlotId(timeSlotId);
            checkReq.setRequestedDate(requestedDate);
            checkReq.setStartTime(startTime);
            checkReq.setEndTime(endTime);
            checkReq.setRequestedCapacity(requestedCapacity);
            checkReq.setDepartmentId(departmentId);
            checkReq.setTargetResource(candidate);

            ConflictResultDto conflictResult = conflictDetectionService.detectAcademicConflicts(checkReq, actor);

            // Hard constraint violation: if canAllocate is false or any conflict has ERROR severity, disqualify
            if (!conflictResult.isCanAllocate() || conflictResult.isHasConflict()) {
                boolean hasBlockingError = conflictResult.getConflicts().stream()
                        .anyMatch(c -> com.ahrao.entity.enums.ConflictSeverity.ERROR.equals(c.getSeverity()));
                if (hasBlockingError || !conflictResult.isCanAllocate()) {
                    continue;
                }
            }

            // Candidate passed all hard constraints! Calculate soft scores
            OptimizationRecommendationDto rec = scoreCandidate(candidate, academicRequest, requestedCapacity, departmentId, facultyId, conflictResult);
            recommendations.add(rec);
        }

        if (recommendations.isEmpty()) {
            return OptimizationResultDto.failure(requestDto.getRequestId(), totalEvaluated, "All evaluated candidates violated hard scheduling or capacity constraints.");
        }

        // 3. Deterministic Ranking: Score DESC, then Resource ID ASC
        recommendations.sort(Comparator
                .comparingDouble(OptimizationRecommendationDto::getScore).reversed()
                .thenComparingLong(OptimizationRecommendationDto::getCandidateId));

        // Assign ranks 1..N
        for (int i = 0; i < recommendations.size(); i++) {
            recommendations.get(i).setRank(i + 1);
        }

        // Audit tracking (read-only action log)
        if (actor != null && auditLogRepository != null) {
            try {
                AuditLog logEntry = new AuditLog();
                logEntry.setUser(actor);
                logEntry.setAction("ACADEMIC_OPTIMIZATION_REQUESTED");
                logEntry.setEntityType("AcademicResourceRequest");
                logEntry.setEntityId(academicRequest != null ? academicRequest.getId() : null);
                logEntry.setNewValue(String.format("{\"evaluated\":%d,\"recommended\":%d,\"topScore\":%.1f}",
                        totalEvaluated, recommendations.size(), recommendations.get(0).getScore()));
                auditLogRepository.save(logEntry);
            } catch (Exception e) {
                log.warn("Failed to persist audit log for academic optimization: {}", e.getMessage());
            }
        }

        String msg = String.format("%d optimal academic allocation %s found.",
                recommendations.size(), recommendations.size() == 1 ? "candidate" : "candidates");
        return OptimizationResultDto.success(requestDto.getRequestId(), totalEvaluated, recommendations, msg);
    }

    private List<Resource> fetchCandidateResources(AcademicResourceRequest request, Long categoryId, Long departmentId) {
        Long institutionId = null;
        if (request != null && request.getDepartment() != null && request.getDepartment().getInstitution() != null) {
            institutionId = request.getDepartment().getInstitution().getId();
        }

        if (institutionId != null && categoryId != null) {
            List<Resource> scoped = resourceRepository.findCandidatesForAllocation(institutionId, categoryId, departmentId);
            if (!scoped.isEmpty()) {
                return scoped;
            }
        }

        if (categoryId != null) {
            return resourceRepository.findByCategoryId(categoryId);
        }

        return resourceRepository.findAll();
    }

    private OptimizationRecommendationDto scoreCandidate(
            Resource resource,
            AcademicResourceRequest request,
            int requestedCapacity,
            Long requestedDeptId,
            Long facultyId,
            ConflictResultDto conflictResult) {

        OptimizationRecommendationDto rec = new OptimizationRecommendationDto();
        rec.setCandidateId(resource.getId());
        rec.setCandidateName(resource.getName());
        rec.setCandidateCode(resource.getCode());
        rec.setValid(true);
        rec.setConflicts(conflictResult != null ? conflictResult.getConflicts() : new ArrayList<>());

        List<ScoreBreakdownDto> factors = new ArrayList<>();
        Map<String, Double> breakdownMap = new HashMap<>();
        List<String> reasons = new ArrayList<>();

        // Factor 1: Resource Suitability (Weight default: 30)
        double suitabilityWeight = weights.getResourceSuitabilityWeight();
        double suitabilityRaw = 100.0;
        if (request != null && request.getCategory() != null && resource.getCategory() != null) {
            if (request.getCategory().getId().equals(resource.getCategory().getId())) {
                suitabilityRaw = 100.0;
                reasons.add("Resource matches requested category: " + resource.getCategory().getName() + " (100% suitability)");
            } else {
                suitabilityRaw = 50.0;
                reasons.add("Compatible alternative category: " + resource.getCategory().getName());
            }
        } else {
            suitabilityRaw = 80.0;
            reasons.add("Standard resource suitability verified");
        }
        double suitabilityWeighted = (suitabilityRaw * suitabilityWeight) / 100.0;
        factors.add(new ScoreBreakdownDto("RESOURCE_SUITABILITY", suitabilityWeight, suitabilityRaw, suitabilityWeighted, "Measures category & resource type suitability"));
        breakdownMap.put("resourceSuitability", round(suitabilityWeighted));

        // Factor 2: Capacity Efficiency (Weight default: 25)
        double capacityWeight = weights.getCapacityEfficiencyWeight();
        int cap = resource.getCapacity() != null ? resource.getCapacity() : requestedCapacity;
        double capacityEfficiencyRaw = 100.0;
        if (cap > 0) {
            capacityEfficiencyRaw = Math.min(100.0, ((double) requestedCapacity / cap) * 100.0);
        }
        double capacityWeighted = (capacityEfficiencyRaw * capacityWeight) / 100.0;
        factors.add(new ScoreBreakdownDto("CAPACITY_EFFICIENCY", capacityWeight, capacityEfficiencyRaw, capacityWeighted, "Minimizes unused space (requested " + requestedCapacity + " / " + cap + " seats)"));
        breakdownMap.put("capacityEfficiency", round(capacityWeighted));
        reasons.add(String.format("Capacity efficiency: %.0f%% (Allocating %d seats into %d room capacity)",
                capacityEfficiencyRaw, requestedCapacity, cap));

        // Factor 3: Utilization Benefit (Weight default: 20)
        double utilWeight = weights.getUtilizationBenefitWeight();
        List<ResourceAllocation> existing = allocationRepository.findByResourceIdAndStatus(resource.getId(), AllocationStatus.ACTIVE);
        int activeCount = existing != null ? existing.size() : 0;
        // Moderate utilization is preferred over dormant rooms
        double utilRaw = activeCount == 0 ? 60.0 : Math.min(100.0, 60.0 + (activeCount * 10.0));
        double utilWeighted = (utilRaw * utilWeight) / 100.0;
        factors.add(new ScoreBreakdownDto("UTILIZATION_BENEFIT", utilWeight, utilRaw, utilWeighted, "Supports balanced resource utilization (" + activeCount + " active bookings)"));
        breakdownMap.put("utilizationBenefit", round(utilWeighted));
        if (activeCount > 0) {
            reasons.add("Well-utilized facility with proven timetable operational readiness");
        } else {
            reasons.add("Available facility with minimal contention");
        }

        // Factor 4: Preference Match (Weight default: 15)
        double prefWeight = weights.getPreferenceMatchWeight();
        double prefRaw = 70.0;
        if (requestedDeptId != null && resource.getDepartment() != null) {
            if (requestedDeptId.equals(resource.getDepartment().getId())) {
                prefRaw = 100.0;
                reasons.add("Resource belongs to requested department (" + resource.getDepartment().getName() + ")");
            } else {
                prefRaw = 40.0;
            }
        } else if (resource.getDepartment() == null) {
            prefRaw = 80.0;
            reasons.add("General campus-wide shared facility");
        }
        double prefWeighted = (prefRaw * prefWeight) / 100.0;
        factors.add(new ScoreBreakdownDto("PREFERENCE_MATCH", prefWeight, prefRaw, prefWeighted, "Alignment with department or facility preferences"));
        breakdownMap.put("preferenceMatch", round(prefWeighted));

        // Factor 5: Workload Balance (Weight default: 10)
        double workloadWeight = weights.getWorkloadBalanceWeight();
        double workloadRaw = 75.0; // neutral default
        if (facultyId != null && workloadRepository != null) {
            Optional<FacultyWorkload> fwOpt = workloadRepository.findFirstByFacultyIdOrderByCalculatedAtDesc(facultyId);
            if (fwOpt.isPresent()) {
                FacultyWorkload fw = fwOpt.get();
                if ("BALANCED".equalsIgnoreCase(fw.getWorkloadStatus())) {
                    workloadRaw = 95.0;
                    reasons.add("Faculty workload is balanced (" + fw.getTotalHours() + " hrs)");
                } else if ("UNDERLOADED".equalsIgnoreCase(fw.getWorkloadStatus())) {
                    workloadRaw = 85.0;
                    reasons.add("Helps optimize faculty utilization");
                } else {
                    workloadRaw = 45.0;
                }
            }
        }
        double workloadWeighted = (workloadRaw * workloadWeight) / 100.0;
        factors.add(new ScoreBreakdownDto("WORKLOAD_BALANCE", workloadWeight, workloadRaw, workloadWeighted, "Faculty workload distribution impact"));
        breakdownMap.put("workloadBalance", round(workloadWeighted));

        double totalScore = suitabilityWeighted + capacityWeighted + utilWeighted + prefWeighted + workloadWeighted;
        rec.setScore(round(totalScore));
        rec.setFactors(factors);
        rec.setScoreBreakdown(breakdownMap);
        rec.setReasons(reasons);

        // Enrich details for UI
        Map<String, Object> details = new HashMap<>();
        details.put("capacity", cap);
        details.put("wastedCapacity", Math.max(0, cap - requestedCapacity));
        details.put("location", resource.getLocation());
        details.put("categoryName", resource.getCategory() != null ? resource.getCategory().getName() : "General");
        details.put("departmentName", resource.getDepartment() != null ? resource.getDepartment().getName() : "Campus");

        Optional<Classroom> classroomOpt = classroomRepository.findByResourceId(resource.getId());
        if (classroomOpt.isPresent()) {
            details.put("building", classroomOpt.get().getBuilding());
            details.put("roomNumber", classroomOpt.get().getRoomNumber());
        } else {
            Optional<Laboratory> labOpt = laboratoryRepository.findByResourceId(resource.getId());
            if (labOpt.isPresent()) {
                details.put("building", labOpt.get().getBuilding());
                details.put("roomNumber", labOpt.get().getRoomNumber());
            }
        }
        rec.setDetails(details);

        return rec;
    }

    private double round(double val) {
        return Math.round(val * 10.0) / 10.0;
    }
}
