package com.ahrao.service.faculty;

import com.ahrao.dto.faculty.dashboard.FacultyDashboardDto;
import com.ahrao.dto.faculty.dashboard.FacultyDashboardDto.*;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Faculty;
import com.ahrao.entity.academic.FacultySubjectAssignment;
import com.ahrao.entity.academic.FacultyWorkload;
import com.ahrao.entity.academic.TimetableEntry;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.FacultySubjectAssignmentRepository;
import com.ahrao.repository.academic.FacultyWorkloadRepository;
import com.ahrao.repository.academic.TimetableEntryRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FacultyDashboardServiceImpl implements FacultyDashboardService {

    private final FacultyRepository facultyRepository;
    private final FacultySubjectAssignmentRepository facultySubjectAssignmentRepository;
    private final FacultyWorkloadRepository facultyWorkloadRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final AcademicResourceRequestRepository academicResourceRequestRepository;
    private final AuditLogRepository auditLogRepository;

    public FacultyDashboardServiceImpl(
            FacultyRepository facultyRepository,
            FacultySubjectAssignmentRepository facultySubjectAssignmentRepository,
            FacultyWorkloadRepository facultyWorkloadRepository,
            TimetableEntryRepository timetableEntryRepository,
            AcademicResourceRequestRepository academicResourceRequestRepository,
            AuditLogRepository auditLogRepository) {
        this.facultyRepository = facultyRepository;
        this.facultySubjectAssignmentRepository = facultySubjectAssignmentRepository;
        this.facultyWorkloadRepository = facultyWorkloadRepository;
        this.timetableEntryRepository = timetableEntryRepository;
        this.academicResourceRequestRepository = academicResourceRequestRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyDashboardDto getDashboard(Long userId) {
        Faculty faculty = facultyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for authenticated user ID: " + userId));

        User user = faculty.getUser();
        FacultyDashboardDto dashboard = new FacultyDashboardDto();

        // 1. Faculty Profile Summary
        FacultySummaryDto profile = new FacultySummaryDto();
        profile.setFacultyId(faculty.getId());
        profile.setUserId(user.getId());
        profile.setFullName(user.getFirstName() + " " + user.getLastName());
        profile.setEmployeeId(faculty.getEmployeeId());
        profile.setDesignation(faculty.getDesignation());
        profile.setQualification(faculty.getQualification());
        profile.setEmail(user.getEmail());
        profile.setPhone(user.getPhone());
        profile.setStatus(faculty.getStatus());
        profile.setJoiningDate(faculty.getJoiningDate());

        Department dept = faculty.getDepartment();
        if (dept != null) {
            profile.setDepartmentName(dept.getName());
            profile.setDepartmentCode(dept.getCode());

            FacultyDepartmentDto deptDto = new FacultyDepartmentDto();
            deptDto.setDepartmentId(dept.getId());
            deptDto.setDepartmentName(dept.getName());
            deptDto.setDepartmentCode(dept.getCode());
            if (dept.getInstitution() != null) {
                deptDto.setInstitutionName(dept.getInstitution().getName());
            }
            dashboard.setDepartment(deptDto);
        }
        dashboard.setProfile(profile);

        // 2. Assigned Subjects
        List<FacultySubjectAssignment> assignments = facultySubjectAssignmentRepository.findByFacultyId(faculty.getId());
        List<FacultyAssignedSubjectDto> assignedSubjects = new ArrayList<>();
        int computedWeeklyHours = 0;

        for (FacultySubjectAssignment fa : assignments) {
            FacultyAssignedSubjectDto subjDto = new FacultyAssignedSubjectDto();
            subjDto.setId(fa.getId());
            if (fa.getSubject() != null) {
                subjDto.setSubjectId(fa.getSubject().getId());
                subjDto.setSubjectCode(fa.getSubject().getCode());
                subjDto.setSubjectName(fa.getSubject().getName());
                if (fa.getSubject().getProgram() != null) {
                    subjDto.setProgramName(fa.getSubject().getProgram().getName());
                }
            }
            if (fa.getSection() != null) {
                subjDto.setSectionName(fa.getSection().getName());
            }
            if (fa.getAcademicYear() != null) {
                subjDto.setAcademicYearName(fa.getAcademicYear().getName());
            }
            if (fa.getSemester() != null) {
                subjDto.setSemesterName(fa.getSemester().getName());
            }
            subjDto.setHoursPerWeek(fa.getHoursPerWeek());
            subjDto.setStatus(fa.getStatus());
            assignedSubjects.add(subjDto);

            if ("ACTIVE".equalsIgnoreCase(fa.getStatus()) && fa.getHoursPerWeek() != null) {
                computedWeeklyHours += fa.getHoursPerWeek();
            }
        }
        dashboard.setAssignedSubjects(assignedSubjects);

        // 3. Workload Summary
        Optional<FacultyWorkload> workloadOpt = facultyWorkloadRepository
                .findFirstByFacultyIdOrderByCalculatedAtDesc(faculty.getId());

        if (workloadOpt.isPresent()) {
            FacultyWorkload wl = workloadOpt.get();
            FacultyWorkloadDto wlDto = new FacultyWorkloadDto();
            wlDto.setId(wl.getId());
            wlDto.setTotalHours(wl.getTotalHours());
            wlDto.setTeachingHours(wl.getTeachingHours());
            wlDto.setLabHours(wl.getLabHours());
            wlDto.setOtherHours(wl.getOtherHours());
            wlDto.setWorkloadStatus(wl.getWorkloadStatus());
            if (wl.getAcademicYear() != null) {
                wlDto.setAcademicYearName(wl.getAcademicYear().getName());
            }
            if (wl.getSemester() != null) {
                wlDto.setSemesterName(wl.getSemester().getName());
            }
            wlDto.setCalculatedAt(wl.getCalculatedAt());
            dashboard.setWorkloadSummary(wlDto);

            if (wl.getTotalHours() != null && wl.getTotalHours().intValue() > 0) {
                computedWeeklyHours = wl.getTotalHours().intValue();
            }
        }

        // 4. Timetable Summary
        List<TimetableEntry> entries = timetableEntryRepository.findByFacultyId(faculty.getId());
        List<FacultyTimetableItemDto> timetableItems = new ArrayList<>();

        for (TimetableEntry te : entries) {
            FacultyTimetableItemDto ttDto = new FacultyTimetableItemDto();
            ttDto.setId(te.getId());
            if (te.getSubject() != null) {
                ttDto.setSubjectCode(te.getSubject().getCode());
                ttDto.setSubjectName(te.getSubject().getName());
            }
            if (te.getResource() != null) {
                ttDto.setRoomNumber(te.getResource().getCode());
                ttDto.setRoomName(te.getResource().getName());
            }
            if (te.getTimeSlot() != null) {
                ttDto.setDayOfWeek(te.getTimeSlot().getDayOfWeek());
                ttDto.setStartTime(te.getTimeSlot().getStartTime());
                ttDto.setEndTime(te.getTimeSlot().getEndTime());
            }
            if (te.getSection() != null) {
                ttDto.setSectionName(te.getSection().getName());
            }
            timetableItems.add(ttDto);
        }
        dashboard.setTimetableSummary(timetableItems);

        // 5. Requisitions Summary
        List<AcademicResourceRequest> requests = academicResourceRequestRepository.findByRequesterUserId(userId);
        FacultyRequisitionSummaryDto reqSummary = new FacultyRequisitionSummaryDto();
        int pendingReqs = (int) academicResourceRequestRepository.countByRequesterUserIdAndStatus(userId, RequestStatus.PENDING);
        int approvedReqs = (int) academicResourceRequestRepository.countByRequesterUserIdAndStatus(userId, RequestStatus.APPROVED);

        reqSummary.setPendingCount(pendingReqs);
        reqSummary.setApprovedCount(approvedReqs);
        reqSummary.setTotalCount(requests.size());

        List<FacultyRequisitionItemDto> recentReqs = requests.stream()
                .sorted(Comparator.comparing(AcademicResourceRequest::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(r -> {
                    FacultyRequisitionItemDto item = new FacultyRequisitionItemDto();
                    item.setId(r.getId());
                    if (r.getRequestedResource() != null) {
                        item.setResourceName(r.getRequestedResource().getName());
                    } else if (r.getCategory() != null) {
                        item.setResourceName(r.getCategory().getName());
                    } else {
                        item.setResourceName("Academic Resource");
                    }
                    if (r.getCategory() != null) {
                        item.setCategoryName(r.getCategory().getName());
                    }
                    item.setPurpose(r.getPurpose());
                    item.setRequestedDate(r.getRequestedDate());
                    item.setStartTime(r.getStartTime());
                    item.setEndTime(r.getEndTime());
                    item.setPriority(r.getPriority() != null ? r.getPriority().name() : "MEDIUM");
                    item.setStatus(r.getStatus() != null ? r.getStatus().name() : "PENDING");
                    return item;
                })
                .collect(Collectors.toList());
        reqSummary.setRecentRequisitions(recentReqs);
        dashboard.setRequisitionSummary(reqSummary);

        // 6. Metrics Summary
        FacultyMetricsDto metrics = new FacultyMetricsDto();
        metrics.setAssignedSubjectsCount(assignments.size());
        metrics.setWeeklyInstructionHours(computedWeeklyHours);
        metrics.setUpcomingClassesCount(entries.size());
        metrics.setPendingRequisitionsCount(pendingReqs);
        dashboard.setMetrics(metrics);

        // 7. Recent Activity
        List<AuditLog> recentLogs = auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 5));
        List<FacultyActivityDto> activities = recentLogs.stream()
                .map(log -> new FacultyActivityDto(
                        log.getId(),
                        log.getAction(),
                        formatActionDescription(log.getAction()),
                        log.getCreatedAt()))
                .collect(Collectors.toList());
        dashboard.setRecentActivities(activities);

        return dashboard;
    }

    private String formatActionDescription(String action) {
        if (action == null) return "Faculty activity recorded";
        switch (action) {
            case "FACULTY_PROFILE_UPDATED":
                return "Profile contact information updated successfully";
            case "USER_LOGIN":
                return "Secure session authenticated via JWT";
            case "ACADEMIC_RESOURCE_REQUEST_CREATED":
                return "Resource requisition submitted for departmental review";
            case "ACADEMIC_RESOURCE_REQUEST_CANCELLED":
                return "Resource requisition cancelled";
            case "PASSWORD_CHANGED":
                return "Account security credentials updated";
            default:
                return action.replace('_', ' ').toLowerCase();
        }
    }
}
