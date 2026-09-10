package com.ahrao.service.conflict;

import com.ahrao.dto.conflict.ConflictCheckRequestDto;
import com.ahrao.dto.conflict.ConflictItemDto;
import com.ahrao.dto.conflict.ConflictResultDto;
import com.ahrao.entity.academic.Faculty;
import com.ahrao.entity.academic.Section;
import com.ahrao.entity.academic.TimeSlot;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.ConflictCode;
import com.ahrao.entity.enums.ConflictDomain;
import com.ahrao.entity.enums.ConflictSeverity;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.enums.ResourceStatus;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.resource.Resource;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.SectionRepository;
import com.ahrao.repository.academic.TimeSlotRepository;
import com.ahrao.repository.academic.TimetableEntryRepository;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.resource.ResourceRepository;
import com.ahrao.service.hod.HodDepartmentResolver;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class AcademicConflictValidator {

    private static final Collection<AllocationStatus> ACTIVE_ALLOCATION_STATUSES = Set.of(
            AllocationStatus.ACTIVE,
            AllocationStatus.PENDING
    );

    private static final Pattern SECTION_PATTERN = Pattern.compile(
            ".*Section:\\s*([^,\\]]+).*",
            Pattern.DOTALL
    );

    private final ResourceRepository resourceRepository;
    private final ResourceAllocationRepository allocationRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final AcademicResourceRequestRepository requestRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final FacultyRepository facultyRepository;
    private final SectionRepository sectionRepository;
    private final HodDepartmentResolver hodDepartmentResolver;

    public AcademicConflictValidator(
            ResourceRepository resourceRepository,
            ResourceAllocationRepository allocationRepository,
            TimetableEntryRepository timetableEntryRepository,
            AcademicResourceRequestRepository requestRepository,
            TimeSlotRepository timeSlotRepository,
            FacultyRepository facultyRepository,
            SectionRepository sectionRepository,
            HodDepartmentResolver hodDepartmentResolver) {
        this.resourceRepository = resourceRepository;
        this.allocationRepository = allocationRepository;
        this.timetableEntryRepository = timetableEntryRepository;
        this.requestRepository = requestRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.facultyRepository = facultyRepository;
        this.sectionRepository = sectionRepository;
        this.hodDepartmentResolver = hodDepartmentResolver;
    }

    public ConflictResultDto validate(ConflictCheckRequestDto checkRequest, User actor) {
        ConflictResultDto result = new ConflictResultDto();

        if (checkRequest == null) {
            result.addConflict(new ConflictItemDto(
                    ConflictCode.INVALID_RESOURCE,
                    ConflictDomain.ACADEMIC,
                    ConflictSeverity.ERROR,
                    "AcademicResource",
                    null,
                    "Conflict check request payload must not be null.",
                    "Missing request payload"
            ));
            return result;
        }

        // 1. Resolve Academic Resource Request (if requestId provided)
        AcademicResourceRequest request = null;
        if (checkRequest.getRequestId() != null) {
            Optional<AcademicResourceRequest> reqOpt = requestRepository.findById(checkRequest.getRequestId());
            if (reqOpt.isEmpty()) {
                result.addConflict(new ConflictItemDto(
                        ConflictCode.REQUEST_ALREADY_ALLOCATED,
                        ConflictDomain.ACADEMIC,
                        ConflictSeverity.ERROR,
                        "AcademicResourceRequest",
                        checkRequest.getRequestId(),
                        "Academic request with ID " + checkRequest.getRequestId() + " not found.",
                        "Non-existent request ID"
                ));
                return result;
            }
            request = reqOpt.get();

            // Request status validation
            if (request.getStatus() == RequestStatus.CANCELLED) {
                result.addConflict(new ConflictItemDto(
                        ConflictCode.REQUEST_ALREADY_ALLOCATED,
                        ConflictDomain.ACADEMIC,
                        ConflictSeverity.ERROR,
                        "AcademicResourceRequest",
                        request.getId(),
                        "Cannot allocate cancelled academic request #" + request.getId() + ".",
                        "Request status: CANCELLED"
                ));
            } else if (request.getStatus() == RequestStatus.REJECTED) {
                result.addConflict(new ConflictItemDto(
                        ConflictCode.REQUEST_ALREADY_ALLOCATED,
                        ConflictDomain.ACADEMIC,
                        ConflictSeverity.ERROR,
                        "AcademicResourceRequest",
                        request.getId(),
                        "Cannot allocate rejected academic request #" + request.getId() + ".",
                        "Request status: REJECTED"
                ));
            }

            // Check if request is already allocated
            if (allocationRepository.existsActiveByRequestId(request.getId(), ACTIVE_ALLOCATION_STATUSES)) {
                result.addConflict(new ConflictItemDto(
                        ConflictCode.RESOURCE_ALREADY_ALLOCATED,
                        ConflictDomain.ACADEMIC,
                        ConflictSeverity.ERROR,
                        "AcademicResourceRequest",
                        request.getId(),
                        "Academic request #" + request.getId() + " already has an active allocation.",
                        "Duplicate allocation for request"
                ));
            }
        }

        // 2. Resolve Target Resource
        Long resourceId = checkRequest.getResourceId();
        Resource resource = null;
        if (checkRequest.getTargetResource() instanceof Resource r) {
            resource = r;
            if (resourceId == null) {
                resourceId = resource.getId();
            }
        } else if (resourceId == null) {
            result.addConflict(new ConflictItemDto(
                    ConflictCode.INVALID_RESOURCE,
                    ConflictDomain.ACADEMIC,
                    ConflictSeverity.ERROR,
                    "AcademicResource",
                    null,
                    "Resource ID is required for academic allocation evaluation.",
                    "Target resource ID is null"
            ));
            return result;
        } else {
            Optional<Resource> resOpt = resourceRepository.findById(resourceId);
            if (resOpt.isEmpty()) {
                resOpt = resourceRepository.findByIdWithLock(resourceId);
            }
            if (resOpt.isEmpty()) {
                result.addConflict(new ConflictItemDto(
                        ConflictCode.INVALID_RESOURCE,
                        ConflictDomain.ACADEMIC,
                        ConflictSeverity.ERROR,
                        "AcademicResource",
                        resourceId,
                        "Resource not found with ID: " + resourceId,
                        "Non-existent resource ID"
                ));
                return result;
            }
            resource = resOpt.get();
        }


        // 3. Operational Status Check
        if (resource.getStatus() != null && resource.getStatus() != ResourceStatus.AVAILABLE) {
            result.addConflict(new ConflictItemDto(
                    ConflictCode.RESOURCE_UNAVAILABLE,
                    ConflictDomain.ACADEMIC,
                    ConflictSeverity.ERROR,
                    "AcademicResource",
                    resource.getId(),
                    "Resource '" + resource.getName() + "' is currently " + resource.getStatus() + " and unavailable.",
                    "Current status: " + resource.getStatus()
            ));
        }

        // 4. Resolve Date and Time Windows
        LocalDate requestedDate = checkRequest.getRequestedDate() != null ? checkRequest.getRequestedDate()
                : (request != null ? request.getRequestedDate() : null);
        LocalTime startTime = checkRequest.getStartTime() != null ? checkRequest.getStartTime()
                : (request != null ? request.getStartTime() : null);
        LocalTime endTime = checkRequest.getEndTime() != null ? checkRequest.getEndTime()
                : (request != null ? request.getEndTime() : null);

        // Check if TimeSlot is provided
        if (checkRequest.getTimeSlotId() != null) {
            Optional<TimeSlot> tsOpt = timeSlotRepository.findById(checkRequest.getTimeSlotId());
            if (tsOpt.isPresent()) {
                TimeSlot ts = tsOpt.get();
                if (startTime == null) startTime = ts.getStartTime();
                if (endTime == null) endTime = ts.getEndTime();
            } else {
                result.addConflict(new ConflictItemDto(
                        ConflictCode.INVALID_TIME_SLOT,
                        ConflictDomain.ACADEMIC,
                        ConflictSeverity.ERROR,
                        "TimeSlot",
                        checkRequest.getTimeSlotId(),
                        "TimeSlot not found with ID: " + checkRequest.getTimeSlotId(),
                        "Non-existent timeSlot ID"
                ));
            }
        }

        if (requestedDate == null || startTime == null || endTime == null) {
            result.addConflict(new ConflictItemDto(
                    ConflictCode.INVALID_TIME_SLOT,
                    ConflictDomain.ACADEMIC,
                    ConflictSeverity.ERROR,
                    "AcademicTimeWindow",
                    null,
                    "Requested date, start time, and end time are required.",
                    "Incomplete time slot specification"
            ));
            return result;
        }

        if (!startTime.isBefore(endTime)) {
            result.addConflict(new ConflictItemDto(
                    ConflictCode.INVALID_TIME_SLOT,
                    ConflictDomain.ACADEMIC,
                    ConflictSeverity.ERROR,
                    "AcademicTimeWindow",
                    null,
                    "Start time (" + startTime + ") must be strictly before end time (" + endTime + ").",
                    "Invalid temporal range"
            ));
            return result;
        }

        // 5. Capacity Check
        int requestedCapacity = checkRequest.getRequestedCapacity() != null && checkRequest.getRequestedCapacity() > 0
                ? checkRequest.getRequestedCapacity()
                : (request != null && request.getQuantity() != null && request.getQuantity() > 0 ? request.getQuantity() : 1);

        if (resource.getCapacity() != null && resource.getCapacity() < requestedCapacity) {
            result.addConflict(new ConflictItemDto(
                    ConflictCode.CAPACITY_EXCEEDED,
                    ConflictDomain.ACADEMIC,
                    ConflictSeverity.ERROR,
                    "AcademicResource",
                    resource.getId(),
                    "Resource capacity (" + resource.getCapacity() + ") is insufficient for requested capacity (" + requestedCapacity + ").",
                    "Requested: " + requestedCapacity + ", Available: " + resource.getCapacity()
            ));
        }

        // 6. Security and Scope Constraints
        validateScope(actor, request, resource, result);

        // 7. Time Window Overlaps
        Instant startInstant = requestedDate.atTime(startTime).atZone(ZoneId.systemDefault()).toInstant();
        Instant endInstant = requestedDate.atTime(endTime).atZone(ZoneId.systemDefault()).toInstant();

        // 7a. Resource Double Booking Check (Active Allocations)
        boolean hasAllocationOverlap;
        if (checkRequest.getExistingAllocationId() != null) {
            List<com.ahrao.entity.allocation.ResourceAllocation> overlappingAllocations = allocationRepository.findOverlappingAllocations(
                    resource.getId(),
                    ACTIVE_ALLOCATION_STATUSES,
                    startInstant,
                    endInstant,
                    checkRequest.getExistingAllocationId()
            );
            hasAllocationOverlap = !overlappingAllocations.isEmpty();
        } else {
            hasAllocationOverlap = allocationRepository.existsOverlappingAllocation(
                    resource.getId(),
                    ACTIVE_ALLOCATION_STATUSES,
                    startInstant,
                    endInstant
            );
        }
        if (hasAllocationOverlap) {
            result.addConflict(new ConflictItemDto(
                    ConflictCode.RESOURCE_DOUBLE_BOOKED,
                    ConflictDomain.ACADEMIC,
                    ConflictSeverity.ERROR,
                    "AcademicResource",
                    resource.getId(),
                    "Resource '" + resource.getName() + "' is already allocated during the requested time window (" + startTime + " - " + endTime + ").",
                    "Overlapping active resource allocation"
            ));
        }


        // 7b. Recurring Academic Timetable Clash
        String dayOfWeek = requestedDate.getDayOfWeek().name();
        boolean hasTimetableOverlap = timetableEntryRepository.existsOverlappingTimetableEntry(
                resource.getId(),
                dayOfWeek,
                startTime,
                endTime
        );
        if (hasTimetableOverlap) {
            result.addConflict(new ConflictItemDto(
                    ConflictCode.RESOURCE_DOUBLE_BOOKED,
                    ConflictDomain.ACADEMIC,
                    ConflictSeverity.ERROR,
                    "AcademicResource",
                    resource.getId(),
                    "Resource '" + resource.getName() + "' has a conflicting recurring academic class on " + dayOfWeek + " (" + startTime + " - " + endTime + ").",
                    "Timetable entry clash"
            ));

        }

        // 8. Faculty Schedule Conflict
        Long facultyUserId = null;
        if (checkRequest.getFacultyId() != null) {
            Optional<Faculty> facOpt = facultyRepository.findById(checkRequest.getFacultyId());
            if (facOpt.isPresent() && facOpt.get().getUser() != null) {
                facultyUserId = facOpt.get().getUser().getId();
            }
        } else if (request != null && request.getRequester() != null) {
            facultyUserId = request.getRequester().getId();
        }

        if (facultyUserId != null) {
            boolean hasFacultyAllocOverlap = allocationRepository.existsOverlappingUserAllocation(
                    facultyUserId,
                    ACTIVE_ALLOCATION_STATUSES,
                    startInstant,
                    endInstant
            );
            if (hasFacultyAllocOverlap) {
                result.addConflict(new ConflictItemDto(
                        ConflictCode.FACULTY_TIME_CONFLICT,
                        ConflictDomain.ACADEMIC,
                        ConflictSeverity.ERROR,
                        "FacultyUser",
                        facultyUserId,
                        "Faculty member already has another active resource allocation during this time window (" + startTime + " - " + endTime + ").",
                        "Faculty allocation overlap"
                ));
            }

            Optional<Faculty> fOpt = facultyRepository.findByUserId(facultyUserId);
            if (fOpt.isPresent()) {
                boolean hasFacultyTimetableOverlap = timetableEntryRepository.existsOverlappingFacultyTimetable(
                        fOpt.get().getId(),
                        dayOfWeek,
                        startTime,
                        endTime
                );
                if (hasFacultyTimetableOverlap) {
                    result.addConflict(new ConflictItemDto(
                        ConflictCode.FACULTY_TIME_CONFLICT,
                        ConflictDomain.ACADEMIC,
                        ConflictSeverity.ERROR,
                        "Faculty",
                        fOpt.get().getId(),
                        "Faculty member has a scheduled lecture/lab on " + dayOfWeek + " during this time window (" + startTime + " - " + endTime + ").",
                        "Faculty timetable conflict"
                    ));
                }
            }
        }

        // 9. Section Schedule Conflict
        Long sectionId = checkRequest.getSectionId();
        if (sectionId == null && request != null && request.getDescription() != null) {
            Matcher matcher = SECTION_PATTERN.matcher(request.getDescription());
            if (matcher.matches() && request.getDepartment() != null) {
                String sectionName = matcher.group(1).trim();
                List<Section> sections = sectionRepository.findByProgramDepartmentId(request.getDepartment().getId());
                for (Section sec : sections) {
                    if (sec.getName() != null && sec.getName().equalsIgnoreCase(sectionName)) {
                        sectionId = sec.getId();
                        break;
                    }
                }
            }
        }

        if (sectionId != null) {
            boolean hasSectionTimetableOverlap = timetableEntryRepository.existsOverlappingSectionTimetable(
                    sectionId,
                    dayOfWeek,
                    startTime,
                    endTime
            );
            if (hasSectionTimetableOverlap) {
                result.addConflict(new ConflictItemDto(
                        ConflictCode.SECTION_TIME_CONFLICT,
                        ConflictDomain.ACADEMIC,
                        ConflictSeverity.ERROR,
                        "Section",
                        sectionId,
                        "Section has a scheduled academic class on " + dayOfWeek + " during this time window (" + startTime + " - " + endTime + ").",
                        "Section timetable overlap"
                ));
            }
        }

        return result;
    }

    private void validateScope(User actor, AcademicResourceRequest request, Resource resource, ConflictResultDto result) {
        if (actor != null && actor.getRoles() != null) {
            Set<Role> roles = actor.getRoles();
            boolean isAdmin = roles.stream().anyMatch(r -> "ROLE_ADMIN".equalsIgnoreCase(r.getName()) || "ADMIN".equalsIgnoreCase(r.getName()));
            boolean isPrincipal = roles.stream().anyMatch(r -> "ROLE_PRINCIPAL".equalsIgnoreCase(r.getName()) || "PRINCIPAL".equalsIgnoreCase(r.getName()));
            boolean isHod = roles.stream().anyMatch(r -> "ROLE_HOD".equalsIgnoreCase(r.getName()) || "HOD".equalsIgnoreCase(r.getName()));
            boolean isStudent = roles.stream().anyMatch(r -> "ROLE_STUDENT".equalsIgnoreCase(r.getName()) || "STUDENT".equalsIgnoreCase(r.getName()));

            if (isStudent && !isAdmin && !isPrincipal && !isHod) {
                result.addConflict(new ConflictItemDto(
                        ConflictCode.RESOURCE_SCOPE_VIOLATION,
                        ConflictDomain.ACADEMIC,
                        ConflictSeverity.ERROR,
                        "User",
                        actor.getId(),
                        "Students are not authorized to directly allocate academic resources.",
                        "Role: STUDENT unauthorized"
                ));
            }

            if (isHod && !isAdmin && !isPrincipal) {
                try {
                    com.ahrao.entity.academic.Department hodDept = hodDepartmentResolver.resolveHodDepartment(actor.getId());
                    if (hodDept != null && request != null && request.getDepartment() != null) {
                        if (!hodDept.getId().equals(request.getDepartment().getId())) {
                            result.addConflict(new ConflictItemDto(
                                    ConflictCode.RESOURCE_SCOPE_VIOLATION,
                                    ConflictDomain.ACADEMIC,
                                    ConflictSeverity.ERROR,
                                    "Department",
                                    request.getDepartment().getId(),
                                    "HOD can only allocate resources within their assigned department.",
                                    "HOD department mismatch"
                            ));
                        }
                    }
                } catch (Exception e) {
                    result.addConflict(new ConflictItemDto(
                            ConflictCode.RESOURCE_SCOPE_VIOLATION,
                            ConflictDomain.ACADEMIC,
                            ConflictSeverity.ERROR,
                            "User",
                            actor.getId(),
                            "No authorized department found for HOD.",
                            "Unresolved HOD department"
                    ));
                }
            }
        }

        // Institutional Scoping Constraint
        if (resource != null && request != null && request.getDepartment() != null) {
            if (resource.getInstitution() != null && request.getDepartment().getInstitution() != null) {
                if (!resource.getInstitution().getId().equals(request.getDepartment().getInstitution().getId())) {
                    result.addConflict(new ConflictItemDto(
                            ConflictCode.RESOURCE_SCOPE_VIOLATION,
                            ConflictDomain.ACADEMIC,
                            ConflictSeverity.ERROR,
                            "Institution",
                            resource.getInstitution().getId(),
                            "Resource belongs to a different institution than the academic request.",
                            "Institution ID mismatch"
                    ));
                }
            }

            // Departmental Scoping Restriction
            if (resource.getDepartment() != null && !resource.getDepartment().getId().equals(request.getDepartment().getId())) {
                result.addConflict(new ConflictItemDto(
                        ConflictCode.RESOURCE_SCOPE_VIOLATION,
                        ConflictDomain.ACADEMIC,
                        ConflictSeverity.ERROR,
                        "Department",
                        resource.getDepartment().getId(),
                        "Resource is restricted to department '" + resource.getDepartment().getName() + "' and cannot be allocated to '" + request.getDepartment().getName() + "'.",
                        "Department restriction mismatch"
                ));
            }
        }
    }
}
