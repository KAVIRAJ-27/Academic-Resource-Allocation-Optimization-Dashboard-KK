package com.ahrao.service.optimization;

import com.ahrao.config.optimization.HostelOptimizationWeights;
import com.ahrao.dto.conflict.ConflictCheckRequestDto;
import com.ahrao.dto.conflict.ConflictResultDto;
import com.ahrao.dto.optimization.HostelOptimizationRequestDto;
import com.ahrao.dto.optimization.OptimizationRecommendationDto;
import com.ahrao.dto.optimization.OptimizationResultDto;
import com.ahrao.dto.optimization.ScoreBreakdownDto;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.ConflictDomain;
import com.ahrao.entity.enums.ConflictSeverity;
import com.ahrao.entity.enums.HostelBedStatus;
import com.ahrao.entity.hostel.Hostel;
import com.ahrao.entity.hostel.HostelBed;
import com.ahrao.entity.hostel.HostelBlock;
import com.ahrao.entity.hostel.HostelFloor;
import com.ahrao.entity.hostel.HostelRoom;
import com.ahrao.entity.request.HostelRequest;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
import com.ahrao.repository.request.HostelRequestRepository;
import com.ahrao.service.conflict.ConflictDetectionService;
import com.ahrao.service.warden.WardenScopeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class HostelAllocationOptimizerImpl implements HostelAllocationOptimizer {

    private static final Logger log = LoggerFactory.getLogger(HostelAllocationOptimizerImpl.class);

    private final HostelRequestRepository hostelRequestRepository;
    private final StudentRepository studentRepository;
    private final HostelBedRepository hostelBedRepository;
    private final HostelAllocationRepository hostelAllocationRepository;
    private final ConflictDetectionService conflictDetectionService;
    private final WardenScopeService wardenScopeService;
    private final HostelOptimizationWeights weights;
    private final AuditLogRepository auditLogRepository;

    public HostelAllocationOptimizerImpl(
            HostelRequestRepository hostelRequestRepository,
            StudentRepository studentRepository,
            HostelBedRepository hostelBedRepository,
            HostelAllocationRepository hostelAllocationRepository,
            ConflictDetectionService conflictDetectionService,
            WardenScopeService wardenScopeService,
            HostelOptimizationWeights weights,
            AuditLogRepository auditLogRepository) {
        this.hostelRequestRepository = hostelRequestRepository;
        this.studentRepository = studentRepository;
        this.hostelBedRepository = hostelBedRepository;
        this.hostelAllocationRepository = hostelAllocationRepository;
        this.conflictDetectionService = conflictDetectionService;
        this.wardenScopeService = wardenScopeService;
        this.weights = weights;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public OptimizationResultDto optimizeHostelAllocation(HostelOptimizationRequestDto requestDto, User actor) {
        if (requestDto == null) {
            throw new BadRequestException("Optimization request parameters cannot be null.");
        }

        HostelRequest hostelRequest = null;
        if (requestDto.getHostelRequestId() != null) {
            hostelRequest = hostelRequestRepository.findById(requestDto.getHostelRequestId())
                    .orElseThrow(() -> new ResourceNotFoundException("Hostel request not found with ID: " + requestDto.getHostelRequestId()));
        }

        Student student = null;
        if (requestDto.getStudentId() != null) {
            student = studentRepository.findById(requestDto.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + requestDto.getStudentId()));
        } else if (hostelRequest != null) {
            student = hostelRequest.getStudent();
        }

        if (student == null) {
            throw new BadRequestException("A valid student must be specified directly or via a hostel request.");
        }

        Long targetHostelId = requestDto.getHostelId() != null ? requestDto.getHostelId()
                : (hostelRequest != null && hostelRequest.getHostel() != null ? hostelRequest.getHostel().getId() : null);

        // Scope validation for Warden
        Set<Long> authorizedHostelIds = null;
        if (actor != null && isWarden(actor) && !isAdminOrPrincipal(actor)) {
            authorizedHostelIds = wardenScopeService.getAuthorizedHostelIds();
            if (targetHostelId != null && !authorizedHostelIds.contains(targetHostelId)) {
                throw new UnauthorizedException("Access denied: You are not authorized to optimize allocations for hostel ID: " + targetHostelId);
            }
        }

        // 1. Candidate Bed Generation
        List<HostelBed> candidateBeds = fetchRawCandidateBeds(targetHostelId, authorizedHostelIds);
        int totalEvaluated = candidateBeds.size();

        if (candidateBeds.isEmpty()) {
            return OptimizationResultDto.failure(requestDto.getHostelRequestId(), 0, "No available candidate beds found in authorized scope.");
        }

        Long preferredHostelId = hostelRequest != null && hostelRequest.getHostel() != null
                ? hostelRequest.getHostel().getId() : targetHostelId;

        // 2. Filter candidates against Phase 30 Hard Constraints
        List<OptimizationRecommendationDto> recommendations = new ArrayList<>();

        for (HostelBed bed : candidateBeds) {
            HostelRoom room = bed.getRoom();
            HostelFloor floor = room != null ? room.getFloor() : null;
            HostelBlock block = floor != null ? floor.getBlock() : null;
            Hostel hostel = block != null ? block.getHostel() : null;

            // Basic integrity check
            if (hostel == null || room == null) {
                continue;
            }

            // Hard constraints: Bed must be AVAILABLE, Room must not be INACTIVE or MAINTENANCE, Hostel must be ACTIVE
            if (bed.getStatus() != HostelBedStatus.AVAILABLE) {
                continue;
            }
            if (room.getStatus() != null && ("MAINTENANCE".equalsIgnoreCase(room.getStatus()) || "INACTIVE".equalsIgnoreCase(room.getStatus()))) {
                continue;
            }
            if (hostel.getStatus() != null && !"ACTIVE".equalsIgnoreCase(hostel.getStatus())) {
                continue;
            }

            // Run Phase 30 Conflict Detection
            ConflictCheckRequestDto checkReq = new ConflictCheckRequestDto();
            checkReq.setDomain(ConflictDomain.HOSTEL);
            checkReq.setStudentId(student.getId());
            checkReq.setHostelId(hostel.getId());
            checkReq.setRoomId(room.getId());
            checkReq.setBedId(bed.getId());
            checkReq.setHostelRequestId(hostelRequest != null ? hostelRequest.getId() : null);
            checkReq.setStartDate(requestDto.getStartDate());
            checkReq.setEndDate(requestDto.getEndDate());
            checkReq.setTargetBed(bed);

            ConflictResultDto conflictResult = conflictDetectionService.detectHostelConflicts(checkReq, actor);

            // Hard constraint violation: if canAllocate is false or any conflict has ERROR severity, disqualify
            if (!conflictResult.isCanAllocate() || conflictResult.isHasConflict()) {
                boolean hasBlockingError = conflictResult.getConflicts().stream()
                        .anyMatch(c -> ConflictSeverity.ERROR.equals(c.getSeverity()));
                if (hasBlockingError || !conflictResult.isCanAllocate()) {
                    continue;
                }
            }

            // Candidate passed all hard constraints! Calculate soft scores
            OptimizationRecommendationDto rec = scoreCandidateBed(bed, room, hostel, preferredHostelId, conflictResult);
            recommendations.add(rec);
        }

        if (recommendations.isEmpty()) {
            return OptimizationResultDto.failure(requestDto.getHostelRequestId(), totalEvaluated, "All evaluated candidate beds violated hard constraints or capacity limits.");
        }

        // 3. Deterministic Ranking: Score DESC, then Bed ID ASC
        recommendations.sort(Comparator
                .comparingDouble(OptimizationRecommendationDto::getScore).reversed()
                .thenComparingLong(OptimizationRecommendationDto::getCandidateId));

        // Assign ranks 1..N
        for (int i = 0; i < recommendations.size(); i++) {
            recommendations.get(i).setRank(i + 1);
        }

        // Audit tracking
        if (actor != null && auditLogRepository != null) {
            try {
                AuditLog logEntry = new AuditLog();
                logEntry.setUser(actor);
                logEntry.setAction("HOSTEL_OPTIMIZATION_REQUESTED");
                logEntry.setEntityType("HostelRequest");
                logEntry.setEntityId(hostelRequest != null ? hostelRequest.getId() : null);
                logEntry.setNewValue(String.format("{\"evaluated\":%d,\"recommended\":%d,\"topScore\":%.1f}",
                        totalEvaluated, recommendations.size(), recommendations.get(0).getScore()));
                auditLogRepository.save(logEntry);
            } catch (Exception e) {
                log.warn("Failed to persist audit log for hostel optimization: {}", e.getMessage());
            }
        }

        String msg = String.format("%d optimal hostel bed %s found.",
                recommendations.size(), recommendations.size() == 1 ? "candidate" : "candidates");
        return OptimizationResultDto.success(requestDto.getHostelRequestId(), totalEvaluated, recommendations, msg);
    }

    private List<HostelBed> fetchRawCandidateBeds(Long targetHostelId, Set<Long> authorizedHostelIds) {
        if (targetHostelId != null) {
            if (authorizedHostelIds != null && !authorizedHostelIds.isEmpty() && !authorizedHostelIds.contains(targetHostelId)) {
                return Collections.emptyList();
            }
            return hostelBedRepository.findCandidateBedsByHostelId(targetHostelId, HostelBedStatus.AVAILABLE);
        }

        if (authorizedHostelIds != null && !authorizedHostelIds.isEmpty()) {
            return hostelBedRepository.findCandidateBedsByHostelIds(authorizedHostelIds, HostelBedStatus.AVAILABLE);
        }

        return hostelBedRepository.findByStatus(HostelBedStatus.AVAILABLE);
    }

    private OptimizationRecommendationDto scoreCandidateBed(
            HostelBed bed,
            HostelRoom room,
            Hostel hostel,
            Long preferredHostelId,
            ConflictResultDto conflictResult) {

        OptimizationRecommendationDto rec = new OptimizationRecommendationDto();
        rec.setCandidateId(bed.getId());
        rec.setCandidateName("Bed #" + bed.getBedNumber() + " (" + room.getRoomNumber() + ")");
        rec.setCandidateCode(hostel.getName() + "-" + room.getRoomNumber() + "-" + bed.getBedNumber());
        rec.setValid(true);
        rec.setConflicts(conflictResult != null ? conflictResult.getConflicts() : new ArrayList<>());

        List<ScoreBreakdownDto> factors = new ArrayList<>();
        Map<String, Double> breakdownMap = new HashMap<>();
        List<String> reasons = new ArrayList<>();

        // Factor 1: Hostel Preference (Weight default: 30)
        double prefWeight = weights.getHostelPreferenceWeight();
        double prefRaw = 80.0;
        if (preferredHostelId != null) {
            if (preferredHostelId.equals(hostel.getId())) {
                prefRaw = 100.0;
                reasons.add("Matches student's preferred hostel (" + hostel.getName() + ")");
            } else {
                prefRaw = 35.0;
                reasons.add("Alternative hostel (" + hostel.getName() + ")");
            }
        } else {
            prefRaw = 80.0;
            reasons.add("Eligible campus hostel facility");
        }
        double prefWeighted = (prefRaw * prefWeight) / 100.0;
        factors.add(new ScoreBreakdownDto("HOSTEL_PREFERENCE", prefWeight, prefRaw, prefWeighted, "Preference match for " + hostel.getName()));
        breakdownMap.put("hostelPreference", round(prefWeighted));

        // Factor 2: Occupancy Balance (Weight default: 25)
        double occWeight = weights.getOccupancyBalanceWeight();
        long activeInHostel = hostelAllocationRepository.countByHostelBedRoomFloorBlockHostelIdAndStatus(hostel.getId(), AllocationStatus.ACTIVE);
        long totalBedsInHostel = hostelBedRepository.countByRoomFloorBlockHostelId(hostel.getId());
        double occupancyRate = totalBedsInHostel > 0 ? (double) activeInHostel / totalBedsInHostel : 0.0;
        // Hostels with lower occupancy receive higher balance scores to prevent concentration
        double occBalanceRaw = Math.max(0.0, (1.0 - occupancyRate) * 100.0);
        double occWeighted = (occBalanceRaw * occWeight) / 100.0;
        factors.add(new ScoreBreakdownDto("OCCUPANCY_BALANCE", occWeight, occBalanceRaw, occWeighted,
                String.format("Hostel occupancy rate: %.1f%% (%d / %d beds)", occupancyRate * 100.0, activeInHostel, totalBedsInHostel)));
        breakdownMap.put("occupancyBalance", round(occWeighted));
        reasons.add(String.format("Balanced campus occupancy: Hostel is %.0f%% occupied", occupancyRate * 100.0));

        // Factor 3: Room Suitability (Weight default: 20)
        double roomWeight = weights.getRoomSuitabilityWeight();
        double roomRaw = 90.0;
        if (room.getStatus() == null || "AVAILABLE".equalsIgnoreCase(room.getStatus())) {
            roomRaw = 100.0;
            reasons.add("Room " + room.getRoomNumber() + " is active and in good condition");
        } else {
            roomRaw = 70.0;
        }
        double roomWeighted = (roomRaw * roomWeight) / 100.0;
        factors.add(new ScoreBreakdownDto("ROOM_SUITABILITY", roomWeight, roomRaw, roomWeighted, "Room status and structural suitability"));
        breakdownMap.put("roomSuitability", round(roomWeighted));

        // Factor 4: Bed Availability (Weight default: 15)
        double bedWeight = weights.getBedAvailabilityWeight();
        double bedRaw = 100.0;
        double bedWeighted = (bedRaw * bedWeight) / 100.0;
        factors.add(new ScoreBreakdownDto("BED_AVAILABILITY", bedWeight, bedRaw, bedWeighted, "Bed is verified available with zero active allocations"));
        breakdownMap.put("bedAvailability", round(bedWeighted));
        reasons.add("Bed #" + bed.getBedNumber() + " is ready for immediate allocation");

        // Factor 5: Capacity Efficiency (Weight default: 10)
        double capWeight = weights.getCapacityEfficiencyWeight();
        long occupiedInRoom = hostelAllocationRepository.countByHostelBedRoomIdAndStatus(room.getId(), AllocationStatus.ACTIVE);
        int roomCap = room.getCapacity() != null ? room.getCapacity() : 1;
        // Prefer filling partially occupied rooms first to consolidate space efficiently
        double capDensityRaw = roomCap > 0 ? Math.min(100.0, ((double) (occupiedInRoom + 1) / roomCap) * 100.0) : 50.0;
        double capWeighted = (capDensityRaw * capWeight) / 100.0;
        factors.add(new ScoreBreakdownDto("CAPACITY_EFFICIENCY", capWeight, capDensityRaw, capWeighted,
                String.format("Room filling density: %d / %d occupied", occupiedInRoom + 1, roomCap)));
        breakdownMap.put("capacityEfficiency", round(capWeighted));
        reasons.add(String.format("Room has %d remaining open beds out of %d", Math.max(0, roomCap - (occupiedInRoom + 1)), roomCap));

        double totalScore = prefWeighted + occWeighted + roomWeighted + bedWeighted + capWeighted;
        rec.setScore(round(totalScore));
        rec.setFactors(factors);
        rec.setScoreBreakdown(breakdownMap);
        rec.setReasons(reasons);

        // Enrich details for UI
        Map<String, Object> details = new HashMap<>();
        details.put("hostelId", hostel.getId());
        details.put("hostelName", hostel.getName());
        details.put("blockName", room.getFloor() != null && room.getFloor().getBlock() != null ? room.getFloor().getBlock().getName() : "Block");
        details.put("floorNumber", room.getFloor() != null ? room.getFloor().getFloorNumber() : 1);
        details.put("roomId", room.getId());
        details.put("roomNumber", room.getRoomNumber());
        details.put("bedId", bed.getId());
        details.put("bedNumber", bed.getBedNumber());
        details.put("roomCapacity", roomCap);
        details.put("occupiedBeds", occupiedInRoom);
        rec.setDetails(details);

        return rec;
    }

    private double round(double val) {
        return Math.round(val * 10.0) / 10.0;
    }

    private boolean isWarden(User user) {
        if (user == null || user.getRoles() == null) return false;
        for (Role role : user.getRoles()) {
            if ("ROLE_WARDEN".equalsIgnoreCase(role.getName()) || "WARDEN".equalsIgnoreCase(role.getName())) {
                return true;
            }
        }
        return false;
    }

    private boolean isAdminOrPrincipal(User user) {
        if (user == null || user.getRoles() == null) return false;
        for (Role role : user.getRoles()) {
            String name = role.getName();
            if ("ROLE_ADMIN".equalsIgnoreCase(name) || "ADMIN".equalsIgnoreCase(name)
                    || "ROLE_PRINCIPAL".equalsIgnoreCase(name) || "PRINCIPAL".equalsIgnoreCase(name)) {
                return true;
            }
        }
        return false;
    }
}
