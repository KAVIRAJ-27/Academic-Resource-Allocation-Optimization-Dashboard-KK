package com.ahrao.service.optimization;

import com.ahrao.config.optimization.HostelOptimizationWeights;
import com.ahrao.dto.conflict.ConflictCheckRequestDto;
import com.ahrao.dto.conflict.ConflictItemDto;
import com.ahrao.dto.conflict.ConflictResultDto;
import com.ahrao.dto.optimization.HostelOptimizationRequestDto;
import com.ahrao.dto.optimization.OptimizationRecommendationDto;
import com.ahrao.dto.optimization.OptimizationResultDto;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.ConflictCode;
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
import com.ahrao.exception.UnauthorizedException;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.hostel.HostelBedRepository;
import com.ahrao.repository.request.HostelRequestRepository;
import com.ahrao.service.conflict.ConflictDetectionService;
import com.ahrao.service.warden.WardenScopeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HostelAllocationOptimizerTest {

    @Mock
    private HostelRequestRepository hostelRequestRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private HostelBedRepository hostelBedRepository;
    @Mock
    private HostelAllocationRepository hostelAllocationRepository;
    @Mock
    private ConflictDetectionService conflictDetectionService;
    @Mock
    private WardenScopeService wardenScopeService;
    @Mock
    private AuditLogRepository auditLogRepository;

    private HostelOptimizationWeights weights;
    private HostelAllocationOptimizerImpl optimizer;

    private User adminActor;
    private User wardenActor;
    private Student student;
    private HostelRequest request;
    private Hostel hostelA;
    private Hostel hostelB;

    @BeforeEach
    void setUp() {
        weights = new HostelOptimizationWeights();
        optimizer = new HostelAllocationOptimizerImpl(
                hostelRequestRepository,
                studentRepository,
                hostelBedRepository,
                hostelAllocationRepository,
                conflictDetectionService,
                wardenScopeService,
                weights,
                auditLogRepository
        );

        adminActor = new User();
        adminActor.setId(1L);
        Role adminRole = new Role();
        adminRole.setName("ROLE_ADMIN");
        adminActor.setRoles(Set.of(adminRole));

        wardenActor = new User();
        wardenActor.setId(2L);
        Role wardenRole = new Role();
        wardenRole.setName("ROLE_WARDEN");
        wardenActor.setRoles(Set.of(wardenRole));

        student = new Student();
        student.setId(50L);

        hostelA = new Hostel();
        hostelA.setId(10L);
        hostelA.setName("Hostel Alpha");
        hostelA.setStatus("ACTIVE");

        hostelB = new Hostel();
        hostelB.setId(20L);
        hostelB.setName("Hostel Beta");
        hostelB.setStatus("ACTIVE");

        request = new HostelRequest();
        request.setId(201L);
        request.setStudent(student);
        request.setHostel(hostelA); // Preferred hostel is Hostel Alpha
    }

    private HostelBed createBed(Long bedId, String bedNum, Hostel hostel, int roomNumber, int roomCap) {
        HostelBlock block = new HostelBlock();
        block.setId(100L);
        block.setName("Block A");
        block.setHostel(hostel);

        HostelFloor floor = new HostelFloor();
        floor.setId(200L);
        floor.setFloorNumber(2);
        floor.setBlock(block);

        HostelRoom room = new HostelRoom();
        room.setId(300L + bedId);
        room.setRoomNumber(String.valueOf(roomNumber));
        room.setStatus("AVAILABLE");
        room.setCapacity(roomCap);
        room.setFloor(floor);

        HostelBed bed = new HostelBed();
        bed.setId(bedId);
        bed.setBedNumber(bedNum);
        bed.setStatus(HostelBedStatus.AVAILABLE);
        bed.setRoom(room);

        return bed;
    }

    @Test
    @DisplayName("Should prefer bed in preferred hostel when constraints are satisfied")
    void testOptimizeHostelAllocation_HostelPreferenceBoost() {
        when(hostelRequestRepository.findById(201L)).thenReturn(Optional.of(request));

        HostelBed bedAlpha = createBed(1L, "1", hostelA, 101, 2);
        HostelBed bedBeta = createBed(2L, "1", hostelB, 201, 2);

        when(hostelBedRepository.findCandidateBedsByHostelId(eq(10L), eq(HostelBedStatus.AVAILABLE)))
                .thenReturn(List.of(bedAlpha));

        when(conflictDetectionService.detectHostelConflicts(any(ConflictCheckRequestDto.class), any()))
                .thenReturn(ConflictResultDto.valid());

        when(hostelAllocationRepository.countByHostelBedRoomFloorBlockHostelIdAndStatus(eq(10L), eq(AllocationStatus.ACTIVE)))
                .thenReturn(50L);
        when(hostelBedRepository.countByRoomFloorBlockHostelId(eq(10L)))
                .thenReturn(100L);

        HostelOptimizationRequestDto reqDto = new HostelOptimizationRequestDto(201L);
        OptimizationResultDto result = optimizer.optimizeHostelAllocation(reqDto, adminActor);

        assertTrue(result.isSuccess());
        assertEquals(1, result.getValidCandidates());
        OptimizationRecommendationDto rec = result.getRecommendations().get(0);
        assertEquals(1L, rec.getCandidateId());
        assertEquals(1, rec.getRank());
        assertTrue(rec.getScoreBreakdown().get("hostelPreference") >= 25.0,
                "Preferred hostel should achieve high preference score");
    }

    @Test
    @DisplayName("Should balance occupancy favoring less saturated hostel")
    void testOptimizeHostelAllocation_OccupancyBalancing() {
        // Request with NO preferred hostel
        HostelRequest neutralReq = new HostelRequest();
        neutralReq.setId(202L);
        neutralReq.setStudent(student);
        neutralReq.setHostel(null);

        when(hostelRequestRepository.findById(202L)).thenReturn(Optional.of(neutralReq));

        // Bed 1 in Hostel Alpha (90% occupied)
        HostelBed bedAlpha = createBed(1L, "1", hostelA, 101, 2);
        // Bed 2 in Hostel Beta (30% occupied)
        HostelBed bedBeta = createBed(2L, "1", hostelB, 201, 2);

        when(hostelBedRepository.findByStatus(HostelBedStatus.AVAILABLE))
                .thenReturn(List.of(bedAlpha, bedBeta));

        when(conflictDetectionService.detectHostelConflicts(any(), any()))
                .thenReturn(ConflictResultDto.valid());

        // Hostel Alpha: 90/100 beds occupied (90%)
        when(hostelAllocationRepository.countByHostelBedRoomFloorBlockHostelIdAndStatus(eq(10L), eq(AllocationStatus.ACTIVE)))
                .thenReturn(90L);
        when(hostelBedRepository.countByRoomFloorBlockHostelId(eq(10L)))
                .thenReturn(100L);

        // Hostel Beta: 30/100 beds occupied (30%)
        when(hostelAllocationRepository.countByHostelBedRoomFloorBlockHostelIdAndStatus(eq(20L), eq(AllocationStatus.ACTIVE)))
                .thenReturn(30L);
        when(hostelBedRepository.countByRoomFloorBlockHostelId(eq(20L)))
                .thenReturn(100L);

        HostelOptimizationRequestDto reqDto = new HostelOptimizationRequestDto(202L);
        OptimizationResultDto result = optimizer.optimizeHostelAllocation(reqDto, adminActor);

        assertTrue(result.isSuccess());
        assertEquals(2, result.getRecommendations().size());

        // Bed 2 (Hostel Beta) has lower occupancy -> should get higher occupancy balance score and win
        OptimizationRecommendationDto topRec = result.getRecommendations().get(0);
        assertEquals(2L, topRec.getCandidateId(), "Less saturated Hostel Beta bed should rank first");
    }

    @Test
    @DisplayName("Should disqualify bed with Phase 30 Conflict")
    void testOptimizeHostelAllocation_DisqualifyConflictedBed() {
        when(hostelRequestRepository.findById(201L)).thenReturn(Optional.of(request));

        HostelBed bedAlpha = createBed(1L, "1", hostelA, 101, 2);
        when(hostelBedRepository.findCandidateBedsByHostelId(eq(10L), eq(HostelBedStatus.AVAILABLE)))
                .thenReturn(List.of(bedAlpha));

        ConflictResultDto conflictResult = new ConflictResultDto();
        conflictResult.setCanAllocate(false);
        conflictResult.addConflict(new ConflictItemDto(ConflictCode.BED_ALREADY_ALLOCATED, ConflictDomain.HOSTEL, ConflictSeverity.ERROR, "HostelBed", 1L, "Bed is already allocated"));

        when(conflictDetectionService.detectHostelConflicts(any(), any()))
                .thenReturn(conflictResult);

        HostelOptimizationRequestDto reqDto = new HostelOptimizationRequestDto(201L);
        OptimizationResultDto result = optimizer.optimizeHostelAllocation(reqDto, adminActor);

        assertFalse(result.isSuccess());
        assertEquals(0, result.getValidCandidates());
        assertTrue(result.getRecommendations().isEmpty());
    }

    @Test
    @DisplayName("Should enforce Warden hostel authorization scope")
    void testOptimizeHostelAllocation_WardenScopeEnforcement() {
        when(hostelRequestRepository.findById(201L)).thenReturn(Optional.of(request));

        // Warden is authorized ONLY for Hostel 99, but request targets Hostel 10
        when(wardenScopeService.getAuthorizedHostelIds()).thenReturn(Set.of(99L));

        HostelOptimizationRequestDto reqDto = new HostelOptimizationRequestDto(201L);
        assertThrows(UnauthorizedException.class, () -> {
            optimizer.optimizeHostelAllocation(reqDto, wardenActor);
        });
    }

    @Test
    @DisplayName("Should handle empty candidate beds gracefully")
    void testOptimizeHostelAllocation_EmptyBeds() {
        when(hostelRequestRepository.findById(201L)).thenReturn(Optional.of(request));
        when(hostelBedRepository.findCandidateBedsByHostelId(eq(10L), eq(HostelBedStatus.AVAILABLE)))
                .thenReturn(Collections.emptyList());

        HostelOptimizationRequestDto reqDto = new HostelOptimizationRequestDto(201L);
        OptimizationResultDto result = optimizer.optimizeHostelAllocation(reqDto, adminActor);

        assertFalse(result.isSuccess());
        assertEquals(0, result.getValidCandidates());
        assertTrue(result.getRecommendations().isEmpty());
    }
}
