package com.ahrao.service;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AcademicServiceImpl implements AcademicService {

    @Override
    public Map<String, Object> getAcademicDomainOverview() {
        Map<String, Object> overview = new LinkedHashMap<>();
        overview.put("domain", "Academic Resource Management");
        overview.put("status", "Foundation Ready (Phase 1)");
        overview.put("modules", List.of(
                "Students", "Faculty", "HOD", "Principal", "Departments",
                "Courses", "Classrooms", "Laboratories", "Academic Resources",
                "Time Slots", "Timetables", "Faculty Workload", "Academic Allocations",
                "Academic Requests", "Academic Analytics"
        ));
        return overview;
    }
}
