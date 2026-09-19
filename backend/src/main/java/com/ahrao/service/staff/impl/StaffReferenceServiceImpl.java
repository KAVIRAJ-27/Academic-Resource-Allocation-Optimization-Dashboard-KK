package com.ahrao.service.staff.impl;

import com.ahrao.dto.staff.StaffReferenceDataResponse;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.user.User;
import com.ahrao.repository.academic.DepartmentRepository;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.InstitutionRepository;
import com.ahrao.repository.hostel.HostelRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.staff.StaffReferenceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StaffReferenceServiceImpl implements StaffReferenceService {

    private final DepartmentRepository departmentRepository;
    private final HostelRepository hostelRepository;
    private final InstitutionRepository institutionRepository;
    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;

    public StaffReferenceServiceImpl(
            DepartmentRepository departmentRepository,
            HostelRepository hostelRepository,
            InstitutionRepository institutionRepository,
            FacultyRepository facultyRepository,
            UserRepository userRepository) {
        this.departmentRepository = departmentRepository;
        this.hostelRepository = hostelRepository;
        this.institutionRepository = institutionRepository;
        this.facultyRepository = facultyRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public StaffReferenceDataResponse getReferenceData() {
        List<StaffReferenceDataResponse.DepartmentOption> departments = departmentRepository.findAll().stream()
                .map(d -> new StaffReferenceDataResponse.DepartmentOption(d.getId(), d.getName(), d.getCode()))
                .collect(Collectors.toList());

        List<StaffReferenceDataResponse.HostelOption> hostels = hostelRepository.findAll().stream()
                .map(h -> new StaffReferenceDataResponse.HostelOption(
                        h.getId(),
                        h.getName(),
                        h.getCode(),
                        h.getType() != null ? h.getType().name() : "N/A",
                        h.getCapacity()
                ))
                .collect(Collectors.toList());

        List<StaffReferenceDataResponse.InstitutionOption> institutions = institutionRepository.findAll().stream()
                .map(i -> new StaffReferenceDataResponse.InstitutionOption(i.getId(), i.getName(), i.getCode()))
                .collect(Collectors.toList());

        List<StaffReferenceDataResponse.FacultyOption> facultyOptions = facultyRepository.findAll().stream()
                .map(f -> {
                    User u = f.getUser();
                    Department d = f.getDepartment();
                    String name = u != null ? u.getFirstName() + " " + u.getLastName() : f.getEmployeeId();
                    return new StaffReferenceDataResponse.FacultyOption(
                            f.getId(),
                            f.getEmployeeId(),
                            name,
                            d != null ? d.getId() : null,
                            d != null ? d.getName() : "N/A",
                            f.getDesignation()
                    );
                })
                .collect(Collectors.toList());

        List<StaffReferenceDataResponse.UserOption> unassignedUsers = userRepository.findUnassignedFacultyUsers().stream()
                .map(u -> new StaffReferenceDataResponse.UserOption(
                        u.getId(),
                        u.getUsername(),
                        u.getEmail(),
                        u.getFirstName(),
                        u.getLastName()
                ))
                .collect(Collectors.toList());

        return new StaffReferenceDataResponse(departments, hostels, institutions, facultyOptions, unassignedUsers);
    }
}
