package com.ahrao.service.student;

import com.ahrao.dto.student.StudentDashboardDto;
import com.ahrao.dto.student.StudentDashboardDto.AcademicSummary;
import com.ahrao.dto.student.StudentDashboardDto.HostelSummary;
import com.ahrao.dto.student.StudentDashboardDto.MetricsSummary;
import com.ahrao.dto.student.StudentDashboardDto.RecentActivityItem;
import com.ahrao.dto.student.StudentDashboardDto.StudentSummary;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Program;
import com.ahrao.entity.academic.Section;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.academic.Subject;
import com.ahrao.entity.academic.TimetableEntry;
import com.ahrao.entity.allocation.HostelAllocation;
import com.ahrao.entity.audit.AuditLog;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.academic.SubjectRepository;
import com.ahrao.repository.academic.TimetableEntryRepository;
import com.ahrao.repository.allocation.HostelAllocationRepository;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.request.HostelRequestRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class StudentDashboardServiceImpl implements StudentDashboardService {

    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final HostelAllocationRepository hostelAllocationRepository;
    private final ResourceAllocationRepository resourceAllocationRepository;
    private final AuditLogRepository auditLogRepository;
    private final AcademicResourceRequestRepository academicResourceRequestRepository;
    private final HostelRequestRepository hostelRequestRepository;

    public StudentDashboardServiceImpl(
            StudentRepository studentRepository,
            SubjectRepository subjectRepository,
            TimetableEntryRepository timetableEntryRepository,
            HostelAllocationRepository hostelAllocationRepository,
            ResourceAllocationRepository resourceAllocationRepository,
            AuditLogRepository auditLogRepository,
            AcademicResourceRequestRepository academicResourceRequestRepository,
            HostelRequestRepository hostelRequestRepository) {
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.timetableEntryRepository = timetableEntryRepository;
        this.hostelAllocationRepository = hostelAllocationRepository;
        this.resourceAllocationRepository = resourceAllocationRepository;
        this.auditLogRepository = auditLogRepository;
        this.academicResourceRequestRepository = academicResourceRequestRepository;
        this.hostelRequestRepository = hostelRequestRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public StudentDashboardDto getDashboard(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student record not found for authenticated user ID: " + userId));

        User user = student.getUser();
        StudentDashboardDto dashboard = new StudentDashboardDto();

        // 1. Student Summary
        StudentSummary studentSummary = new StudentSummary();
        studentSummary.setId(student.getId());
        studentSummary.setName(user.getFirstName() + " " + user.getLastName());
        studentSummary.setRegisterNumber(student.getRegisterNumber());
        studentSummary.setRollNumber(student.getRollNumber());
        studentSummary.setEmail(user.getEmail());
        studentSummary.setPhone(user.getPhone());
        studentSummary.setStatus(student.getStatus());
        dashboard.setStudent(studentSummary);

        // 2. Academic Summary
        AcademicSummary academicSummary = new AcademicSummary();
        Department dept = student.getDepartment();
        if (dept != null) {
            academicSummary.setDepartmentName(dept.getName());
            academicSummary.setDepartmentCode(dept.getCode());
        }
        Program prog = student.getProgram();
        if (prog != null) {
            academicSummary.setProgramName(prog.getName());
            academicSummary.setProgramCode(prog.getCode());
        }
        academicSummary.setCurrentSemester(student.getCurrentSemester());
        Section sec = student.getSection();
        if (sec != null) {
            academicSummary.setSectionName(sec.getName());
            if (sec.getAcademicYear() != null) {
                academicSummary.setAcademicYearName(sec.getAcademicYear().getName());
            }
        }
        dashboard.setAcademic(academicSummary);

        // 3. Hostel Summary
        HostelSummary hostelSummary = new HostelSummary();
        Optional<HostelAllocation> allocationOpt = hostelAllocationRepository
                .findByStudentIdAndStatus(student.getId(), AllocationStatus.ACTIVE);

        if (allocationOpt.isPresent()) {
            HostelAllocation allocation = allocationOpt.get();
            hostelSummary.setAllocated(true);
            hostelSummary.setAllocationStatus(allocation.getStatus() != null ? allocation.getStatus().name() : "ACTIVE");

            if (allocation.getBed() != null) {
                hostelSummary.setBedNumber(allocation.getBed().getBedNumber());
                if (allocation.getBed().getRoom() != null) {
                    hostelSummary.setRoomNumber(allocation.getBed().getRoom().getRoomNumber());
                    if (allocation.getBed().getRoom().getFloor() != null) {
                        hostelSummary.setFloorNumber(allocation.getBed().getRoom().getFloor().getFloorNumber());
                        if (allocation.getBed().getRoom().getFloor().getBlock() != null) {
                            hostelSummary.setBlockName(allocation.getBed().getRoom().getFloor().getBlock().getName());
                            if (allocation.getBed().getRoom().getFloor().getBlock().getHostel() != null) {
                                hostelSummary.setHostelName(allocation.getBed().getRoom().getFloor().getBlock().getHostel().getName());
                            }
                        }
                    }
                }
            }
        } else {
            hostelSummary.setAllocated(false);
        }
        dashboard.setHostel(hostelSummary);

        // 4. Metrics Summary
        MetricsSummary metrics = new MetricsSummary();

        // Enrolled courses count (courses in student's program and semester)
        int courseCount = 0;
        if (student.getProgram() != null) {
            Specification<Subject> spec = (root, query, cb) -> {
                List<Predicate> predicates = new ArrayList<>();
                predicates.add(cb.equal(root.get("program").get("id"), student.getProgram().getId()));
                if (student.getCurrentSemester() != null) {
                    predicates.add(cb.equal(root.get("semester").get("number"), student.getCurrentSemester()));
                }
                return cb.and(predicates.toArray(new Predicate[0]));
            };
            courseCount = (int) subjectRepository.count(spec);
        }
        metrics.setEnrolledCoursesCount(courseCount);

        // Weekly class hours (from timetable entries for student's section)
        int weeklyHours = 0;
        if (student.getSection() != null) {
            List<TimetableEntry> entries = timetableEntryRepository.findBySectionId(student.getSection().getId());
            long totalMinutes = 0;
            for (TimetableEntry entry : entries) {
                if (entry.getTimeSlot() != null && entry.getTimeSlot().getStartTime() != null && entry.getTimeSlot().getEndTime() != null) {
                    long mins = Duration.between(entry.getTimeSlot().getStartTime(), entry.getTimeSlot().getEndTime()).toMinutes();
                    totalMinutes += (mins > 0 ? mins : 60);
                } else {
                    totalMinutes += 60; // 1 standard lecture period default
                }
            }
            weeklyHours = (int) Math.round((double) totalMinutes / 60.0);
        }
        metrics.setWeeklyClassHours(weeklyHours);

        metrics.setHostelAllocated(hostelSummary.isAllocated());

        // Active allocations count
        int activeAllocations = resourceAllocationRepository.findByAllocatedToUserId(userId).size();
        metrics.setActiveAllocationsCount(activeAllocations);

        long academicPending = academicResourceRequestRepository.countByRequesterUserIdAndStatus(userId, RequestStatus.PENDING);
        long hostelPending = hostelRequestRepository.countByStudentIdAndStatus(student.getId(), RequestStatus.PENDING);
        metrics.setPendingRequestsCount((int) (academicPending + hostelPending));

        dashboard.setMetrics(metrics);

        // 5. Recent Activity
        List<AuditLog> recentLogs = auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 5));
        List<RecentActivityItem> activities = new ArrayList<>();
        for (AuditLog log : recentLogs) {
            String desc = formatActionDescription(log.getAction(), log.getEntityType());
            activities.add(new RecentActivityItem(log.getId(), log.getAction(), desc, log.getCreatedAt()));
        }
        dashboard.setRecentActivities(activities);

        return dashboard;
    }

    private String formatActionDescription(String action, String entityType) {
        if (action == null) return "System activity recorded";
        switch (action) {
            case "STUDENT_PROFILE_UPDATED":
                return "Student profile information updated successfully";
            case "USER_LOGIN":
                return "Secure session authenticated via JWT";
            case "STUDENT_REGISTERED":
                return "Academic registration confirmed";
            case "HOSTEL_ALLOCATED":
                return "Residential bed space allocation assigned";
            case "STUDENT_HOSTEL_REQUEST_CREATED":
                return "Hostel request submitted";
            case "STUDENT_HOSTEL_REQUEST_CANCELLED":
                return "Hostel request cancelled";
            case "STUDENT_HOSTEL_COMPLAINT_CREATED":
                return "Hostel complaint registered";
            case "STUDENT_RESOURCE_REQUEST_CREATED":
                return "Academic resource request submitted";
            case "STUDENT_RESOURCE_REQUEST_CANCELLED":
                return "Academic resource request cancelled";
            default:
                return action.replace('_', ' ').toLowerCase();
        }
    }
}
