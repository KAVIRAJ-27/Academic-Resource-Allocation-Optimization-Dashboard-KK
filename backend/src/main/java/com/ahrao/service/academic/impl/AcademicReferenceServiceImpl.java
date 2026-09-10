package com.ahrao.service.academic.impl;

import com.ahrao.dto.academic.AcademicReferenceDataResponse;
import com.ahrao.dto.academic.InstitutionResponse;
import com.ahrao.entity.enums.DegreeType;
import com.ahrao.entity.enums.SubjectType;
import com.ahrao.repository.academic.AcademicYearRepository;
import com.ahrao.repository.academic.DepartmentRepository;
import com.ahrao.repository.academic.InstitutionRepository;
import com.ahrao.repository.academic.ProgramRepository;
import com.ahrao.repository.academic.SemesterRepository;
import com.ahrao.service.academic.AcademicReferenceService;
import com.ahrao.service.academic.InstitutionManagementService;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AcademicReferenceServiceImpl implements AcademicReferenceService {

    private final InstitutionManagementService institutionManagementService;
    private final DepartmentRepository departmentRepository;
    private final ProgramRepository programRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SemesterRepository semesterRepository;

    public AcademicReferenceServiceImpl(
            InstitutionManagementService institutionManagementService,
            DepartmentRepository departmentRepository,
            ProgramRepository programRepository,
            AcademicYearRepository academicYearRepository,
            SemesterRepository semesterRepository) {
        this.institutionManagementService = institutionManagementService;
        this.departmentRepository = departmentRepository;
        this.programRepository = programRepository;
        this.academicYearRepository = academicYearRepository;
        this.semesterRepository = semesterRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AcademicReferenceDataResponse getReferenceData() {
        AcademicReferenceDataResponse response = new AcademicReferenceDataResponse();

        // 1. Institution
        InstitutionResponse inst = institutionManagementService.getInstitution();
        response.setInstitution(inst);

        // 2. Departments
        List<AcademicReferenceDataResponse.DepartmentLookup> departments = departmentRepository.findAll(Sort.by("name")).stream()
                .map(d -> new AcademicReferenceDataResponse.DepartmentLookup(d.getId(), d.getName(), d.getCode(), d.getStatus()))
                .collect(Collectors.toList());
        response.setDepartments(departments);

        // 3. Programs
        List<AcademicReferenceDataResponse.ProgramLookup> programs = programRepository.findAll(Sort.by("name")).stream()
                .map(p -> new AcademicReferenceDataResponse.ProgramLookup(
                        p.getId(), p.getDepartment().getId(), p.getName(), p.getCode(), p.getDegreeType().name(), p.getStatus()))
                .collect(Collectors.toList());
        response.setPrograms(programs);

        // 4. Academic Years
        List<AcademicReferenceDataResponse.AcademicYearLookup> academicYears = academicYearRepository.findAll(Sort.by(Sort.Direction.DESC, "name")).stream()
                .map(ay -> new AcademicReferenceDataResponse.AcademicYearLookup(ay.getId(), ay.getName(), ay.getStatus()))
                .collect(Collectors.toList());
        response.setAcademicYears(academicYears);

        // 5. Semesters
        List<AcademicReferenceDataResponse.SemesterLookup> semesters = semesterRepository.findAll(Sort.by("number")).stream()
                .map(s -> new AcademicReferenceDataResponse.SemesterLookup(
                        s.getId(), s.getAcademicYear().getId(), s.getName(), s.getNumber(), s.getStatus()))
                .collect(Collectors.toList());
        response.setSemesters(semesters);

        // 6. DegreeTypes
        List<String> degreeTypes = Arrays.stream(DegreeType.values())
                .map(Enum::name)
                .collect(Collectors.toList());
        response.setDegreeTypes(degreeTypes);

        // 7. SubjectTypes
        List<String> subjectTypes = Arrays.stream(SubjectType.values())
                .map(Enum::name)
                .collect(Collectors.toList());
        response.setSubjectTypes(subjectTypes);

        // 8. Statuses
        response.setStatuses(List.of("ACTIVE", "INACTIVE", "ARCHIVED"));

        return response;
    }
}
