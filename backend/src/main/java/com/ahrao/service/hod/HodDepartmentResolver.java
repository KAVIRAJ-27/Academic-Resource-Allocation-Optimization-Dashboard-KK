package com.ahrao.service.hod;

import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.DepartmentHOD;
import com.ahrao.entity.academic.Faculty;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.repository.academic.DepartmentHODRepository;
import com.ahrao.repository.academic.FacultyRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class HodDepartmentResolver {

    private final FacultyRepository facultyRepository;
    private final DepartmentHODRepository departmentHODRepository;

    public HodDepartmentResolver(FacultyRepository facultyRepository, DepartmentHODRepository departmentHODRepository) {
        this.facultyRepository = facultyRepository;
        this.departmentHODRepository = departmentHODRepository;
    }

    /**
     * Resolves the authenticated HOD's faculty entity.
     * Throws ForbiddenException if the user is not faculty.
     */
    public Faculty resolveHodFaculty(Long userId) {
        return facultyRepository.findByUserId(userId)
                .orElseThrow(() -> new ForbiddenException("Authenticated user is not registered as faculty."));
    }

    /**
     * Resolves the authorized Department for the authenticated HOD.
     * Priority:
     * 1. Active DepartmentHOD record
     * 2. Direct faculty.getDepartment() assignment
     * Throws ForbiddenException if no department is found.
     */
    public Department resolveHodDepartment(Long userId) {
        Faculty hodFaculty = resolveHodFaculty(userId);

        Optional<DepartmentHOD> hodAssignmentOpt = departmentHODRepository.findFirstByFacultyUserIdAndStatus(userId, "ACTIVE");
        if (hodAssignmentOpt.isPresent() && hodAssignmentOpt.get().getDepartment() != null) {
            return hodAssignmentOpt.get().getDepartment();
        }

        if (hodFaculty.getDepartment() != null) {
            return hodFaculty.getDepartment();
        }

        throw new ForbiddenException("No active department assignment found for authenticated HOD.");
    }
}
