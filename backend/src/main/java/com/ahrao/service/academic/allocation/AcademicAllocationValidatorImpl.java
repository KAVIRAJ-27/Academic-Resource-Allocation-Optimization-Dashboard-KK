package com.ahrao.service.academic.allocation;

import com.ahrao.entity.academic.Faculty;
import com.ahrao.entity.academic.Section;
import com.ahrao.entity.academic.TimeSlot;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.enums.ResourceStatus;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.resource.Resource;
import com.ahrao.entity.user.Role;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.SectionRepository;
import com.ahrao.repository.academic.TimetableEntryRepository;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class AcademicAllocationValidatorImpl implements AcademicAllocationValidator {

    private static final Set<AllocationStatus> ACTIVE_ALLOCATION_STATUSES = Set.of(
            AllocationStatus.ACTIVE,
            AllocationStatus.PENDING
    );

    private static final Pattern SECTION_PATTERN = Pattern.compile(
            ".*Section:\\s*([^,\\]]+).*",
            Pattern.DOTALL
    );

    private final ResourceAllocationRepository allocationRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final FacultyRepository facultyRepository;
    private final SectionRepository sectionRepository;
    private final com.ahrao.service.hod.HodDepartmentResolver hodDepartmentResolver;

    public AcademicAllocationValidatorImpl(
            ResourceAllocationRepository allocationRepository,
            TimetableEntryRepository timetableEntryRepository,
            FacultyRepository facultyRepository,
            SectionRepository sectionRepository,
            com.ahrao.service.hod.HodDepartmentResolver hodDepartmentResolver
    ) {
        this.allocationRepository = allocationRepository;
        this.timetableEntryRepository = timetableEntryRepository;
        this.facultyRepository = facultyRepository;
        this.sectionRepository = sectionRepository;
        this.hodDepartmentResolver = hodDepartmentResolver;
    }

    @Override
    public void validateRequestEligibility(AcademicResourceRequest request) {
        if (request == null) {
            throw new BadRequestException("Academic resource request must not be null.");
        }

        // Status must be PENDING or APPROVED
        if (request.getStatus() == RequestStatus.CANCELLED) {
            throw new ConflictException("Cannot allocate cancelled request #" + request.getId() + ".");
        }
        if (request.getStatus() == RequestStatus.REJECTED) {
            throw new ConflictException("Cannot allocate rejected request #" + request.getId() + ".");
        }

        // Duplicate check: Request must not already be allocated
        if (allocationRepository.existsActiveByRequestId(request.getId(), ACTIVE_ALLOCATION_STATUSES)) {
            throw new ConflictException("Request #" + request.getId() + " has already been allocated.");
        }

        if (request.getRequestedDate() == null) {
            throw new BadRequestException("Requested date is required.");
        }
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new BadRequestException("Start time and end time are required.");
        }
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new BadRequestException("Start time must be strictly before end time.");
        }
        if (request.getCategory() == null) {
            throw new BadRequestException("Requested resource category is required.");
        }
    }

    @Override
    public void validateUserScope(User currentUser, AcademicResourceRequest request, Resource resource) {
        if (currentUser == null) {
            throw new ForbiddenException("Authentication required to perform allocation.");
        }

        Set<Role> roles = currentUser.getRoles();
        boolean isAdmin = roles.stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()) || "ADMIN".equals(r.getName()));
        boolean isPrincipal = roles.stream().anyMatch(r -> "ROLE_PRINCIPAL".equals(r.getName()) || "PRINCIPAL".equals(r.getName()));
        boolean isHod = roles.stream().anyMatch(r -> "ROLE_HOD".equals(r.getName()) || "HOD".equals(r.getName()));
        boolean isFaculty = roles.stream().anyMatch(r -> "ROLE_FACULTY".equals(r.getName()) || "FACULTY".equals(r.getName()));
        boolean isStudent = roles.stream().anyMatch(r -> "ROLE_STUDENT".equals(r.getName()) || "STUDENT".equals(r.getName()));

        if (isStudent && !isAdmin && !isPrincipal && !isHod && !isFaculty) {
            throw new ForbiddenException("Students cannot directly allocate academic resources.");
        }

        // Institutional Scoping
        if (resource != null && request.getDepartment() != null) {
            if (resource.getInstitution() != null && request.getDepartment().getInstitution() != null) {
                if (!resource.getInstitution().getId().equals(request.getDepartment().getInstitution().getId())) {
                    throw new ConflictException("Resource belongs to a different institution than the request.");
                }
            }
        }

        // Departmental restriction check: If a resource is assigned to a specific department,
        // it must match the request's department
        if (resource != null && resource.getDepartment() != null && request.getDepartment() != null) {
            if (!resource.getDepartment().getId().equals(request.getDepartment().getId())) {
                throw new ConflictException("Resource is restricted to department '" +
                        resource.getDepartment().getName() + "' and cannot be allocated to '" +
                        request.getDepartment().getName() + "'.");
            }
        }

        // HOD Scoping: HOD can only allocate within their assigned department
        if (isHod && !isAdmin && !isPrincipal) {
            try {
                com.ahrao.entity.academic.Department hodDept = hodDepartmentResolver.resolveHodDepartment(currentUser.getId());
                if (hodDept != null && request.getDepartment() != null) {
                    if (!hodDept.getId().equals(request.getDepartment().getId())) {
                        throw new ForbiddenException("HOD can only allocate resources within their own department.");
                    }
                }
            } catch (ForbiddenException fe) {
                throw fe;
            } catch (Exception e) {
                // If not assigned to a department, cannot allocate
                throw new ForbiddenException("No authorized department found for HOD.");
            }
        }
    }

    @Override
    public List<String> checkResourceConflicts(AcademicResourceRequest request, Resource resource, TimeSlot timeSlot) {
        List<String> conflicts = new ArrayList<>();
        if (resource == null) {
            conflicts.add("Resource not found");
            return conflicts;
        }

        // 1. Category / Type match
        if (request.getCategory() != null && resource.getCategory() != null) {
            if (!request.getCategory().getId().equals(resource.getCategory().getId())) {
                conflicts.add("Resource category (" + resource.getCategory().getName() +
                        ") does not match requested category (" + request.getCategory().getName() + ")");
            }
        }

        // 2. Operational Status
        if (resource.getStatus() != ResourceStatus.AVAILABLE) {
            conflicts.add("Resource is currently " + resource.getStatus() + " and not available for allocation");
        }

        // 3. Capacity Check
        int requestedCapacity = (request.getQuantity() != null && request.getQuantity() > 0) ? request.getQuantity() : 1;
        if (resource.getCapacity() != null && resource.getCapacity() < requestedCapacity) {
            conflicts.add("Resource capacity (" + resource.getCapacity() +
                    ") is insufficient for requested capacity (" + requestedCapacity + ")");
        }

        // 4. Department Scoping Constraint
        if (resource.getDepartment() != null && request.getDepartment() != null) {
            if (!resource.getDepartment().getId().equals(request.getDepartment().getId())) {
                conflicts.add("Resource is restricted to department: " + resource.getDepartment().getName());
            }
        }

        // Time window calculation
        LocalDate requestedDate = request.getRequestedDate();
        LocalTime startTime = request.getStartTime();
        LocalTime endTime = request.getEndTime();

        if (requestedDate != null && startTime != null && endTime != null) {
            Instant startInstant = requestedDate.atTime(startTime).atZone(ZoneId.systemDefault()).toInstant();
            Instant endInstant = requestedDate.atTime(endTime).atZone(ZoneId.systemDefault()).toInstant();

            // 5. Existing Resource Allocation Conflict
            boolean hasAllocationOverlap = allocationRepository.existsOverlappingAllocation(
                    resource.getId(),
                    ACTIVE_ALLOCATION_STATUSES,
                    startInstant,
                    endInstant
            );
            if (hasAllocationOverlap) {
                conflicts.add("Resource is already allocated during the requested time window (" +
                        startTime + " - " + endTime + ")");
            }

            // 6. Timetable Entry Collision
            String dayOfWeek = requestedDate.getDayOfWeek().name();
            boolean hasTimetableOverlap = timetableEntryRepository.existsOverlappingTimetableEntry(
                    resource.getId(),
                    dayOfWeek,
                    startTime,
                    endTime
            );
            if (hasTimetableOverlap) {
                conflicts.add("Resource has a conflicting recurring academic class on " + dayOfWeek +
                        " between " + startTime + " and " + endTime);
            }

            // 7. Faculty Schedule Conflict
            if (request.getRequester() != null) {
                Long requesterUserId = request.getRequester().getId();
                boolean hasUserAllocationOverlap = allocationRepository.existsOverlappingUserAllocation(
                        requesterUserId,
                        ACTIVE_ALLOCATION_STATUSES,
                        startInstant,
                        endInstant
                );
                if (hasUserAllocationOverlap) {
                    conflicts.add("Requester already has another active resource allocation during this time window");
                }

                Optional<Faculty> facultyOpt = facultyRepository.findByUserId(requesterUserId);
                if (facultyOpt.isPresent()) {
                    boolean hasFacultyTimetableOverlap = timetableEntryRepository.existsOverlappingFacultyTimetable(
                            facultyOpt.get().getId(),
                            dayOfWeek,
                            startTime,
                            endTime
                    );
                    if (hasFacultyTimetableOverlap) {
                        conflicts.add("Faculty member has a scheduled lecture/lab on " + dayOfWeek +
                                " during this time window");
                    }
                }
            }

            // 8. Section Conflict (parsed from request description if present)
            if (request.getDescription() != null) {
                Matcher matcher = SECTION_PATTERN.matcher(request.getDescription());
                if (matcher.matches()) {
                    String sectionName = matcher.group(1).trim();
                    if (request.getDepartment() != null) {
                        List<Section> sections = sectionRepository.findByProgramDepartmentId(request.getDepartment().getId());
                        Optional<Section> targetSection = sections.stream()
                                .filter(s -> s.getName().equalsIgnoreCase(sectionName))
                                .findFirst();
                        if (targetSection.isPresent()) {
                            boolean hasSectionTimetableOverlap = timetableEntryRepository.existsOverlappingSectionTimetable(
                                    targetSection.get().getId(),
                                    dayOfWeek,
                                    startTime,
                                    endTime
                            );
                            if (hasSectionTimetableOverlap) {
                                conflicts.add("Section '" + sectionName + "' is scheduled for another class on " +
                                        dayOfWeek + " during this time window");
                            }
                        }
                    }
                }
            }
        }

        return conflicts;
    }

    @Override
    public void assertResourceEligible(AcademicResourceRequest request, Resource resource, TimeSlot timeSlot) {
        List<String> conflicts = checkResourceConflicts(request, resource, timeSlot);
        if (!conflicts.isEmpty()) {
            throw new ConflictException(String.join("; ", conflicts));
        }
    }
}
