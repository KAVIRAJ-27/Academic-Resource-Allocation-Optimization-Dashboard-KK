package com.ahrao.service.optimization;

import com.ahrao.config.optimization.AcademicOptimizationWeights;
import com.ahrao.dto.conflict.ConflictCheckRequestDto;
import com.ahrao.dto.conflict.ConflictItemDto;
import com.ahrao.dto.conflict.ConflictResultDto;
import com.ahrao.dto.optimization.AcademicOptimizationRequestDto;
import com.ahrao.dto.optimization.OptimizationRecommendationDto;
import com.ahrao.dto.optimization.OptimizationResultDto;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Faculty;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.ConflictCode;
import com.ahrao.entity.enums.ConflictDomain;
import com.ahrao.entity.enums.ConflictSeverity;
import com.ahrao.entity.enums.ResourceStatus;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.resource.Classroom;
import com.ahrao.entity.resource.Resource;
import com.ahrao.entity.resource.ResourceCategory;
import com.ahrao.entity.user.User;
import com.ahrao.repository.academic.FacultyWorkloadRepository;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.resource.ClassroomRepository;
import com.ahrao.repository.resource.LaboratoryRepository;
import com.ahrao.repository.resource.ResourceRepository;
import com.ahrao.service.conflict.ConflictDetectionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AcademicAllocationOptimizerTest {

    @Mock
    private AcademicResourceRequestRepository requestRepository;
    @Mock
    private ResourceRepository resourceRepository;
    @Mock
    private ConflictDetectionService conflictDetectionService;
    @Mock
    private ClassroomRepository classroomRepository;
    @Mock
    private LaboratoryRepository laboratoryRepository;
    @Mock
    private ResourceAllocationRepository allocationRepository;
    @Mock
    private FacultyWorkloadRepository workloadRepository;
    @Mock
    private AuditLogRepository auditLogRepository;

    private AcademicOptimizationWeights weights;
    private AcademicAllocationOptimizerImpl optimizer;

    private User actor;
    private AcademicResourceRequest request;
    private ResourceCategory category;
    private Department department;
    private Institution institution;

    @BeforeEach
    void setUp() {
        weights = new AcademicOptimizationWeights();
        optimizer = new AcademicAllocationOptimizerImpl(
                requestRepository,
                resourceRepository,
                conflictDetectionService,
                classroomRepository,
                laboratoryRepository,
                allocationRepository,
                workloadRepository,
                weights,
                auditLogRepository
        );

        actor = new User();
        actor.setId(1L);
        actor.setUsername("hod_user");

        institution = new Institution();
        institution.setId(1L);
        institution.setName("Test University");

        department = new Department();
        department.setId(10L);
        department.setName("Computer Science");
        department.setInstitution(institution);

        category = new ResourceCategory();
        category.setId(5L);
        category.setName("Classroom");

        Faculty faculty = new Faculty();
        faculty.setId(99L);
        faculty.setUser(actor);

        request = new AcademicResourceRequest();
        request.setId(101L);
        request.setQuantity(40);
        request.setRequestedDate(LocalDate.now().plusDays(1));
        request.setStartTime(LocalTime.of(10, 0));
        request.setEndTime(LocalTime.of(11, 0));
        request.setCategory(category);
        request.setDepartment(department);
        request.setRequester(faculty.getUser());
    }

    @Test
    @DisplayName("Should recommend best candidate based on capacity efficiency and hard constraints")
    void testOptimizeAcademicAllocation_Success() {
        when(requestRepository.findById(101L)).thenReturn(Optional.of(request));

        // Room A: 45 seats (tight fit, higher capacity efficiency)
        Resource roomA = new Resource();
        roomA.setId(1L);
        roomA.setName("CSE-201");
        roomA.setCode("CSE-201");
        roomA.setStatus(ResourceStatus.AVAILABLE);
        roomA.setCapacity(45);
        roomA.setCategory(category);
        roomA.setDepartment(department);

        // Room B: 100 seats (excessive capacity waste, lower efficiency)
        Resource roomB = new Resource();
        roomB.setId(2L);
        roomB.setName("CSE-Auditorium");
        roomB.setCode("CSE-AUD");
        roomB.setStatus(ResourceStatus.AVAILABLE);
        roomB.setCapacity(100);
        roomB.setCategory(category);
        roomB.setDepartment(department);

        when(resourceRepository.findCandidatesForAllocation(eq(1L), eq(5L), eq(10L)))
                .thenReturn(List.of(roomA, roomB));

        // Both rooms pass Phase 30 conflict detection
        ConflictResultDto validResult = ConflictResultDto.valid();
        when(conflictDetectionService.detectAcademicConflicts(any(ConflictCheckRequestDto.class), any()))
                .thenReturn(validResult);

        when(classroomRepository.findByResourceId(anyLong())).thenReturn(Optional.of(new Classroom()));
        when(allocationRepository.findByResourceIdAndStatus(anyLong(), eq(AllocationStatus.ACTIVE)))
                .thenReturn(Collections.emptyList());

        AcademicOptimizationRequestDto reqDto = new AcademicOptimizationRequestDto(101L);
        OptimizationResultDto result = optimizer.optimizeAcademicAllocation(reqDto, actor);

        assertTrue(result.isSuccess());
        assertEquals(2, result.getValidCandidates());
        assertEquals(2, result.getRecommendations().size());

        OptimizationRecommendationDto topRec = result.getRecommendations().get(0);
        assertEquals(1L, topRec.getCandidateId());
        assertEquals(1, topRec.getRank());
        assertTrue(topRec.isValid());
        assertTrue(topRec.getScore() > result.getRecommendations().get(1).getScore(),
                "Room A (45 capacity) should score higher than Room B (100 capacity) due to capacity efficiency");

        assertNotNull(topRec.getScoreBreakdown());
        assertTrue(topRec.getScoreBreakdown().containsKey("capacityEfficiency"));
        assertTrue(topRec.getReasons().size() > 0);
    }

    @Test
    @DisplayName("Should disqualify candidate violating Phase 30 Hard Constraints")
    void testOptimizeAcademicAllocation_DisqualifyConflictingCandidate() {
        when(requestRepository.findById(101L)).thenReturn(Optional.of(request));

        Resource roomA = new Resource();
        roomA.setId(1L);
        roomA.setName("CSE-201");
        roomA.setStatus(ResourceStatus.AVAILABLE);
        roomA.setCapacity(45);
        roomA.setCategory(category);
        roomA.setDepartment(department);

        Resource roomB = new Resource();
        roomB.setId(2L);
        roomB.setName("CSE-202");
        roomB.setStatus(ResourceStatus.AVAILABLE);
        roomB.setCapacity(50);
        roomB.setCategory(category);
        roomB.setDepartment(department);

        when(resourceRepository.findCandidatesForAllocation(eq(1L), eq(5L), eq(10L)))
                .thenReturn(List.of(roomA, roomB));

        // Room A has a hard double booking conflict
        ConflictResultDto conflictResultA = new ConflictResultDto();
        conflictResultA.setCanAllocate(false);
        conflictResultA.setHasConflict(true);
        conflictResultA.addConflict(new ConflictItemDto(ConflictCode.RESOURCE_DOUBLE_BOOKED, ConflictDomain.ACADEMIC, ConflictSeverity.ERROR, "Resource", 1L, "Room is double booked"));

        // Room B is completely valid
        ConflictResultDto validResultB = ConflictResultDto.valid();

        when(conflictDetectionService.detectAcademicConflicts(argThat(req -> req != null && Long.valueOf(1L).equals(req.getResourceId())), any()))
                .thenReturn(conflictResultA);
        when(conflictDetectionService.detectAcademicConflicts(argThat(req -> req != null && Long.valueOf(2L).equals(req.getResourceId())), any()))
                .thenReturn(validResultB);

        when(classroomRepository.findByResourceId(anyLong())).thenReturn(Optional.empty());
        when(laboratoryRepository.findByResourceId(anyLong())).thenReturn(Optional.empty());

        AcademicOptimizationRequestDto reqDto = new AcademicOptimizationRequestDto(101L);
        OptimizationResultDto result = optimizer.optimizeAcademicAllocation(reqDto, actor);

        assertTrue(result.isSuccess());
        assertEquals(1, result.getValidCandidates(), "Only Room B should pass hard constraints");
        assertEquals(2L, result.getRecommendations().get(0).getCandidateId());
        assertEquals(1, result.getRecommendations().get(0).getRank());
    }

    @Test
    @DisplayName("Should handle scenario where no candidate passes hard constraints")
    void testOptimizeAcademicAllocation_NoValidCandidates() {
        when(requestRepository.findById(101L)).thenReturn(Optional.of(request));

        Resource roomA = new Resource();
        roomA.setId(1L);
        roomA.setStatus(ResourceStatus.AVAILABLE);
        roomA.setCapacity(45);

        when(resourceRepository.findCandidatesForAllocation(anyLong(), anyLong(), anyLong()))
                .thenReturn(List.of(roomA));

        ConflictResultDto conflictResult = new ConflictResultDto();
        conflictResult.setCanAllocate(false);
        conflictResult.addConflict(new ConflictItemDto(ConflictCode.RESOURCE_DOUBLE_BOOKED, ConflictDomain.ACADEMIC, ConflictSeverity.ERROR, "Resource", 1L, "Double booking"));

        when(conflictDetectionService.detectAcademicConflicts(any(), any()))
                .thenReturn(conflictResult);

        AcademicOptimizationRequestDto reqDto = new AcademicOptimizationRequestDto(101L);
        OptimizationResultDto result = optimizer.optimizeAcademicAllocation(reqDto, actor);

        assertFalse(result.isSuccess());
        assertEquals(0, result.getValidCandidates());
        assertTrue(result.getRecommendations().isEmpty());
        assertNotNull(result.getMessage());
    }

    @Test
    @DisplayName("Should break ties deterministically by lowest Resource ID")
    void testOptimizeAcademicAllocation_DeterministicTieBreaker() {
        when(requestRepository.findById(101L)).thenReturn(Optional.of(request));

        // Two identical rooms in terms of capacity and department
        Resource room10 = new Resource();
        room10.setId(10L);
        room10.setName("Room 10");
        room10.setStatus(ResourceStatus.AVAILABLE);
        room10.setCapacity(50);
        room10.setCategory(category);
        room10.setDepartment(department);

        Resource room5 = new Resource();
        room5.setId(5L);
        room5.setName("Room 5");
        room5.setStatus(ResourceStatus.AVAILABLE);
        room5.setCapacity(50);
        room5.setCategory(category);
        room5.setDepartment(department);

        when(resourceRepository.findCandidatesForAllocation(anyLong(), anyLong(), anyLong()))
                .thenReturn(List.of(room10, room5));

        when(conflictDetectionService.detectAcademicConflicts(any(), any()))
                .thenReturn(ConflictResultDto.valid());

        AcademicOptimizationRequestDto reqDto = new AcademicOptimizationRequestDto(101L);
        OptimizationResultDto result = optimizer.optimizeAcademicAllocation(reqDto, actor);

        assertTrue(result.isSuccess());
        assertEquals(2, result.getRecommendations().size());
        // Scores are equal, so Room 5 (ID 5) must rank ahead of Room 10 (ID 10)
        assertEquals(5L, result.getRecommendations().get(0).getCandidateId());
        assertEquals(10L, result.getRecommendations().get(1).getCandidateId());
    }
}
