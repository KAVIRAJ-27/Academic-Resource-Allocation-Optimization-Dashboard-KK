package com.ahrao.service;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class HostelServiceImpl implements HostelService {

    @Override
    public Map<String, Object> getHostelDomainOverview() {
        Map<String, Object> overview = new LinkedHashMap<>();
        overview.put("domain", "Hostel Resource Management");
        overview.put("status", "Foundation Ready (Phase 1)");
        overview.put("modules", List.of(
                "Hostels", "Hostel Blocks", "Floors", "Rooms", "Beds",
                "Hostel Facilities", "Hostel Resources", "Student Hostel Allocation",
                "Occupancy Telemetry", "Hostel Requests", "Complaints",
                "Maintenance", "Mess", "Hostel Analytics"
        ));
        return overview;
    }
}
