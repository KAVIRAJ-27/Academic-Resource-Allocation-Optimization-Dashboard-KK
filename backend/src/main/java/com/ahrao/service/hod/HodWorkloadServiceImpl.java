package com.ahrao.service.hod;

import com.ahrao.dto.hod.HodDepartmentAssignmentItemDto;
import com.ahrao.dto.hod.HodDepartmentWorkloadOverviewDto;
import com.ahrao.dto.hod.HodFacultySummaryDto;
import com.ahrao.dto.hod.HodFacultyWorkloadDetailDto;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Faculty;
import com.ahrao.entity.academic.FacultySubjectAssignment;
import com.ahrao.entity.academic.FacultyWorkload;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.FacultySubjectAssignmentRepository;
import com.ahrao.repository.academic.FacultyWorkloadRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class HodWorkloadServiceImpl implements HodWorkloadService {

    private static final Logger log = LoggerFactory.getLogger(HodWorkloadServiceImpl.class);

    private final HodDepartmentResolver hodDepartmentResolver;
    private final FacultyRepository facultyRepository;
    private final FacultySubjectAssignmentRepository facultySubjectAssignmentRepository;
    private final FacultyWorkloadRepository facultyWorkloadRepository;

    public HodWorkloadServiceImpl(
            HodDepartmentResolver hodDepartmentResolver,
            FacultyRepository facultyRepository,
            FacultySubjectAssignmentRepository facultySubjectAssignmentRepository,
            FacultyWorkloadRepository facultyWorkloadRepository) {
        this.hodDepartmentResolver = hodDepartmentResolver;
        this.facultyRepository = facultyRepository;
        this.facultySubjectAssignmentRepository = facultySubjectAssignmentRepository;
        this.facultyWorkloadRepository = facultyWorkloadRepository;
    }

    @Override
    public HodDepartmentWorkloadOverviewDto getWorkloadOverview(Long userId) {
        Department department = hodDepartmentResolver.resolveHodDepartment(userId);
        Long departmentId = department.getId();

        List<Faculty> facultyList = facultyRepository.findByDepartmentId(departmentId);

        HodDepartmentWorkloadOverviewDto overview = new HodDepartmentWorkloadOverviewDto();
        overview.setTotalFaculty(facultyList.size());

        long withWorkload = 0;
        long balanced = 0;
        long overload = 0;
        long underload = 0;
        long pending = 0;
        BigDecimal totalHours = BigDecimal.ZERO;

        List<HodFacultySummaryDto> facultyWorkloads = new ArrayList<>();

        for (Faculty f : facultyList) {
            HodFacultySummaryDto item = new HodFacultySummaryDto();
            item.setId(f.getId());
            User u = f.getUser();
            if (u != null) {
                item.setUserId(u.getId());
                item.setFullName((u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "")).trim());
                item.setEmail(u.getEmail());
                item.setPhone(u.getPhone());
            } else {
                item.setFullName("Faculty #" + f.getId());
                item.setEmail("N/A");
            }
            item.setEmployeeId(f.getEmployeeId());
            item.setDesignation(f.getDesignation());
            item.setQualification(f.getQualification());
            item.setStatus(f.getStatus());

            long activeAssignments = facultySubjectAssignmentRepository.countByFacultyIdAndStatus(f.getId(), "ACTIVE");
            item.setAssignedSubjectsCount((int) activeAssignments);

            Optional<FacultyWorkload> wlOpt = facultyWorkloadRepository.findFirstByFacultyIdOrderByCalculatedAtDesc(f.getId());
            if (wlOpt.isPresent()) {
                FacultyWorkload wl = wlOpt.get();
                BigDecimal hours = wl.getTotalHours() != null ? wl.getTotalHours() : BigDecimal.ZERO;
                item.setTotalWorkloadHours(hours);
                String status = wl.getWorkloadStatus() != null ? wl.getWorkloadStatus() : "BALANCED";
                item.setWorkloadStatus(status);

                withWorkload++;
                totalHours = totalHours.add(hours);

                if ("OVERLOAD".equalsIgnoreCase(status)) {
                    overload++;
                } else if ("UNDERLOAD".equalsIgnoreCase(status)) {
                    underload++;
                } else {
                    balanced++;
                }
            } else {
                item.setTotalWorkloadHours(BigDecimal.ZERO);
                item.setWorkloadStatus("PENDING_CALCULATION");
                pending++;
            }

            facultyWorkloads.add(item);
        }

        overview.setFacultyWithWorkloadCount(withWorkload);
        overview.setBalancedCount(balanced);
        overview.setOverloadCount(overload);
        overview.setUnderloadCount(underload);
        overview.setPendingCalculationCount(pending);
        overview.setTotalDepartmentHours(totalHours);

        if (withWorkload > 0) {
            overview.setAverageWeeklyHours(totalHours.divide(BigDecimal.valueOf(withWorkload), 1, RoundingMode.HALF_UP));
        } else {
            overview.setAverageWeeklyHours(BigDecimal.ZERO);
        }

        overview.setFacultyWorkloads(facultyWorkloads);
        return overview;
    }

    @Override
    public HodFacultyWorkloadDetailDto getFacultyWorkloadDetail(Long userId, Long facultyId) {
        Department department = hodDepartmentResolver.resolveHodDepartment(userId);
        Long departmentId = department.getId();

        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + facultyId));

        if (faculty.getDepartment() == null || !faculty.getDepartment().getId().equals(departmentId)) {
            log.warn("Security Alert: User {} attempted cross-department workload access for facultyId={}", userId, facultyId);
            throw new ForbiddenException("Access denied: Faculty does not belong to your authorized department.");
        }

        HodFacultyWorkloadDetailDto dto = new HodFacultyWorkloadDetailDto();
        dto.setFacultyId(faculty.getId());
        User u = faculty.getUser();
        dto.setFacultyName(u != null ? (u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "")).trim() : "Faculty #" + faculty.getId());
        dto.setEmployeeId(faculty.getEmployeeId());
        dto.setDesignation(faculty.getDesignation());
        dto.setDepartmentId(department.getId());
        dto.setDepartmentName(department.getName());

        // Latest calculated workload
        Optional<FacultyWorkload> latestWorkloadOpt = facultyWorkloadRepository.findFirstByFacultyIdOrderByCalculatedAtDesc(faculty.getId());
        if (latestWorkloadOpt.isPresent()) {
            FacultyWorkload wl = latestWorkloadOpt.get();
            dto.setTotalHours(wl.getTotalHours() != null ? wl.getTotalHours() : BigDecimal.ZERO);
            dto.setTeachingHours(wl.getTeachingHours() != null ? wl.getTeachingHours() : BigDecimal.ZERO);
            dto.setLabHours(wl.getLabHours() != null ? wl.getLabHours() : BigDecimal.ZERO);
            dto.setOtherHours(wl.getOtherHours() != null ? wl.getOtherHours() : BigDecimal.ZERO);
            dto.setWorkloadStatus(wl.getWorkloadStatus() != null ? wl.getWorkloadStatus() : "BALANCED");
            dto.setCalculatedAt(wl.getCalculatedAt());
            dto.setAcademicYear(wl.getAcademicYear() != null ? wl.getAcademicYear().getName() : "Current Term");
            dto.setSemesterName(wl.getSemester() != null ? wl.getSemester().getName() : "Current Semester");
        } else {
            dto.setTotalHours(BigDecimal.ZERO);
            dto.setTeachingHours(BigDecimal.ZERO);
            dto.setLabHours(BigDecimal.ZERO);
            dto.setOtherHours(BigDecimal.ZERO);
            dto.setWorkloadStatus("PENDING_CALCULATION");
        }

        // Active Course Assignments Breakdown
        List<FacultySubjectAssignment> assignments = facultySubjectAssignmentRepository.findActiveByFacultyIdWithDetails(faculty.getId());
        List<HodFacultyWorkloadDetailDto.WorkloadCourseItem> courseItems = new ArrayList<>();
        for (FacultySubjectAssignment a : assignments) {
            HodFacultyWorkloadDetailDto.WorkloadCourseItem item = new HodFacultyWorkloadDetailDto.WorkloadCourseItem();
            item.setAssignmentId(a.getId());
            if (a.getSubject() != null) {
                item.setSubjectId(a.getSubject().getId());
                item.setSubjectCode(a.getSubject().getCode());
                item.setSubjectName(a.getSubject().getName());
                item.setCredits(a.getSubject().getCredits());
                if (a.getSubject().getProgram() != null) {
                    item.setProgramCode(a.getSubject().getProgram().getCode());
                    item.setProgramName(a.getSubject().getProgram().getName());
                }
            }
            if (a.getSection() != null) {
                item.setSectionName(a.getSection().getName());
            }
            item.setHoursPerWeek(a.getHoursPerWeek());
            item.setStatus(a.getStatus());
            courseItems.add(item);
        }
        dto.setAssignments(courseItems);

        // Historical Workload Calculations
        List<FacultyWorkload> allWorkloads = facultyWorkloadRepository.findByFacultyId(faculty.getId());
        List<HodFacultyWorkloadDetailDto.WorkloadHistoryItem> historyItems = allWorkloads.stream()
                .sorted(Comparator.comparing(FacultyWorkload::getCalculatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(hw -> {
                    HodFacultyWorkloadDetailDto.WorkloadHistoryItem hi = new HodFacultyWorkloadDetailDto.WorkloadHistoryItem();
                    hi.setWorkloadId(hw.getId());
                    hi.setAcademicYear(hw.getAcademicYear() != null ? hw.getAcademicYear().getName() : "N/A");
                    hi.setSemesterName(hw.getSemester() != null ? hw.getSemester().getName() : "N/A");
                    hi.setTotalHours(hw.getTotalHours() != null ? hw.getTotalHours() : BigDecimal.ZERO);
                    hi.setTeachingHours(hw.getTeachingHours() != null ? hw.getTeachingHours() : BigDecimal.ZERO);
                    hi.setLabHours(hw.getLabHours() != null ? hw.getLabHours() : BigDecimal.ZERO);
                    hi.setOtherHours(hw.getOtherHours() != null ? hw.getOtherHours() : BigDecimal.ZERO);
                    hi.setWorkloadStatus(hw.getWorkloadStatus() != null ? hw.getWorkloadStatus() : "BALANCED");
                    hi.setCalculatedAt(hw.getCalculatedAt());
                    return hi;
                })
                .toList();
        dto.setHistory(historyItems);

        return dto;
    }

    @Override
    public List<HodDepartmentAssignmentItemDto> getDepartmentAssignments(Long userId) {
        Department department = hodDepartmentResolver.resolveHodDepartment(userId);
        Long departmentId = department.getId();

        List<FacultySubjectAssignment> assignments = facultySubjectAssignmentRepository.findActiveByDepartmentIdWithDetails(departmentId);

        return assignments.stream().map(a -> {
            HodDepartmentAssignmentItemDto item = new HodDepartmentAssignmentItemDto();
            item.setAssignmentId(a.getId());
            if (a.getFaculty() != null) {
                item.setFacultyId(a.getFaculty().getId());
                item.setEmployeeId(a.getFaculty().getEmployeeId());
                User u = a.getFaculty().getUser();
                item.setFacultyName(u != null ? (u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "")).trim() : "Faculty #" + a.getFaculty().getId());
            }
            if (a.getSubject() != null) {
                item.setSubjectId(a.getSubject().getId());
                item.setSubjectCode(a.getSubject().getCode());
                item.setSubjectName(a.getSubject().getName());
                item.setCredits(a.getSubject().getCredits());
                if (a.getSubject().getProgram() != null) {
                    item.setProgramId(a.getSubject().getProgram().getId());
                    item.setProgramCode(a.getSubject().getProgram().getCode());
                    item.setProgramName(a.getSubject().getProgram().getName());
                }
            }
            if (a.getSection() != null) {
                item.setSectionId(a.getSection().getId());
                item.setSectionName(a.getSection().getName());
            }
            item.setHoursPerWeek(a.getHoursPerWeek());
            item.setAcademicYear(a.getAcademicYear() != null ? a.getAcademicYear().getName() : "N/A");
            item.setSemesterName(a.getSemester() != null ? a.getSemester().getName() : "N/A");
            item.setStatus(a.getStatus());
            return item;
        }).toList();
    }
}
