package com.ahrao.service.academic.allocation;

import com.ahrao.dto.academic.allocation.AcademicAllocationPreviewDto;
import com.ahrao.dto.academic.allocation.AcademicResourceCandidateDto;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.academic.TimeSlot;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.resource.Classroom;
import com.ahrao.entity.resource.Laboratory;
import com.ahrao.entity.resource.Resource;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.resource.ClassroomRepository;
import com.ahrao.repository.resource.LaboratoryRepository;
import com.ahrao.repository.resource.ResourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class AcademicResourceCandidateServiceImpl implements AcademicResourceCandidateService {

    private final ResourceRepository resourceRepository;
    private final ClassroomRepository classroomRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final AcademicAllocationValidator validator;

    public AcademicResourceCandidateServiceImpl(
            ResourceRepository resourceRepository,
            ClassroomRepository classroomRepository,
            LaboratoryRepository laboratoryRepository,
            AcademicAllocationValidator validator
    ) {
        this.resourceRepository = resourceRepository;
        this.classroomRepository = classroomRepository;
        this.laboratoryRepository = laboratoryRepository;
        this.validator = validator;
    }

    @Override
    public AcademicAllocationPreviewDto previewCandidates(
            AcademicResourceRequest request,
            Long specificResourceId,
            TimeSlot timeSlot
    ) {
        int requestedCapacity = (request.getQuantity() != null && request.getQuantity() > 0)
                ? request.getQuantity() : 1;

        AcademicAllocationPreviewDto preview = new AcademicAllocationPreviewDto();
        preview.setRequestId(request.getId());
        preview.setRequestPurpose(request.getPurpose());
        preview.setRequestedDate(request.getRequestedDate());
        preview.setStartTime(request.getStartTime());
        preview.setEndTime(request.getEndTime());
        preview.setQuantity(request.getQuantity());
        preview.setRequestedCapacity(requestedCapacity);

        if (request.getRequester() != null) {
            String name = (request.getRequester().getFirstName() + " " +
                    (request.getRequester().getLastName() != null ? request.getRequester().getLastName() : "")).trim();
            preview.setRequesterName(name);
        }
        if (request.getCategory() != null) {
            preview.setCategoryId(request.getCategory().getId());
            preview.setCategoryName(request.getCategory().getName());
        }
        if (request.getDepartment() != null) {
            preview.setDepartmentName(request.getDepartment().getName());
        }

        List<Resource> rawCandidates;
        if (specificResourceId != null) {
            Resource specific = resourceRepository.findById(specificResourceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + specificResourceId));
            rawCandidates = List.of(specific);
        } else {
            rawCandidates = fetchRawCandidates(request);
        }

        List<AcademicResourceCandidateDto> eligibleList = new ArrayList<>();
        List<AcademicResourceCandidateDto> unavailableList = new ArrayList<>();

        for (Resource resource : rawCandidates) {
            AcademicResourceCandidateDto candidateDto = mapToCandidateDto(resource, requestedCapacity);
            List<String> conflicts = validator.checkResourceConflicts(request, resource, timeSlot);

            if (conflicts.isEmpty()) {
                candidateDto.setEligible(true);
                eligibleList.add(candidateDto);
            } else {
                candidateDto.setEligible(false);
                candidateDto.setConflictReasons(conflicts);
                unavailableList.add(candidateDto);
            }
        }

        // Deterministic Ranking on Eligible Resources:
        // 1. Least wasted capacity (capacity - requestedCapacity) ASC
        // 2. ResourceId ASC (tie-breaker)
        eligibleList.sort(Comparator
                .comparing(AcademicResourceCandidateDto::getWastedCapacity)
                .thenComparing(AcademicResourceCandidateDto::getResourceId));

        preview.setEligibleResources(eligibleList);
        preview.setUnavailableResources(unavailableList);
        preview.setRecommendedResource(eligibleList.isEmpty() ? null : eligibleList.get(0));
        preview.setCanAllocate(!eligibleList.isEmpty());

        return preview;
    }

    @Override
    public Resource findBestCandidate(AcademicResourceRequest request, TimeSlot timeSlot) {
        int requestedCapacity = (request.getQuantity() != null && request.getQuantity() > 0)
                ? request.getQuantity() : 1;

        List<Resource> rawCandidates = fetchRawCandidates(request);
        List<ScoredResource> eligible = new ArrayList<>();

        for (Resource resource : rawCandidates) {
            List<String> conflicts = validator.checkResourceConflicts(request, resource, timeSlot);
            if (conflicts.isEmpty()) {
                int wastedCapacity = (resource.getCapacity() != null ? resource.getCapacity() : 0) - requestedCapacity;
                eligible.add(new ScoredResource(resource, wastedCapacity));
            }
        }

        if (eligible.isEmpty()) {
            throw new ConflictException("No suitable academic resource is available for this request.");
        }

        // Deterministic selection
        eligible.sort(Comparator
                .comparingInt(ScoredResource::wastedCapacity)
                .thenComparing(sr -> sr.resource().getId()));

        return eligible.get(0).resource();
    }

    private List<Resource> fetchRawCandidates(AcademicResourceRequest request) {
        Long institutionId = null;
        if (request.getDepartment() != null && request.getDepartment().getInstitution() != null) {
            institutionId = request.getDepartment().getInstitution().getId();
        }

        Long departmentId = request.getDepartment() != null ? request.getDepartment().getId() : null;
        Long categoryId = request.getCategory() != null ? request.getCategory().getId() : null;

        if (institutionId != null && categoryId != null) {
            List<Resource> scoped = resourceRepository.findCandidatesForAllocation(institutionId, categoryId, departmentId);
            if (!scoped.isEmpty()) {
                return scoped;
            }
        }

        // Fallback to category resources if scoped query returned nothing or institution is unlinked
        if (categoryId != null) {
            return resourceRepository.findByCategoryId(categoryId);
        }

        return resourceRepository.findAll();
    }

    private AcademicResourceCandidateDto mapToCandidateDto(Resource resource, int requestedCapacity) {
        AcademicResourceCandidateDto dto = new AcademicResourceCandidateDto();
        dto.setResourceId(resource.getId());
        dto.setResourceName(resource.getName());
        dto.setResourceCode(resource.getCode());
        dto.setLocation(resource.getLocation());
        dto.setStatus(resource.getStatus());
        dto.setCapacity(resource.getCapacity());

        if (resource.getCategory() != null) {
            dto.setCategoryId(resource.getCategory().getId());
            dto.setCategoryName(resource.getCategory().getName());
        }

        int capacity = resource.getCapacity() != null ? resource.getCapacity() : 0;
        dto.setWastedCapacity(Math.max(0, capacity - requestedCapacity));

        // Enrich with Classroom / Lab physical layout details
        Optional<Classroom> classroomOpt = classroomRepository.findByResourceId(resource.getId());
        if (classroomOpt.isPresent()) {
            dto.setBuilding(classroomOpt.get().getBuilding());
            dto.setRoomNumber(classroomOpt.get().getRoomNumber());
        } else {
            Optional<Laboratory> labOpt = laboratoryRepository.findByResourceId(resource.getId());
            if (labOpt.isPresent()) {
                dto.setBuilding(labOpt.get().getBuilding());
                dto.setRoomNumber(labOpt.get().getRoomNumber());
            }
        }

        return dto;
    }

    private record ScoredResource(Resource resource, int wastedCapacity) {
    }
}
