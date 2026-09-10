package com.ahrao.service.analytics;

import com.ahrao.dto.analytics.*;

public interface AnalyticsService {

    AnalyticsOverviewDto getOverview(AnalyticsFilterParams params);

    AcademicUtilizationAnalyticsDto getAcademicUtilization(AnalyticsFilterParams params);

    ClassroomAnalyticsDto getClassroomAnalytics(AnalyticsFilterParams params);

    LaboratoryAnalyticsDto getLaboratoryAnalytics(AnalyticsFilterParams params);

    EquipmentAnalyticsDto getEquipmentAnalytics(AnalyticsFilterParams params);

    AllocationAnalyticsDto getAllocationAnalytics(AnalyticsFilterParams params);

    RequestAnalyticsDto getRequestAnalytics(AnalyticsFilterParams params);

    ConflictAnalyticsDto getConflictAnalytics(AnalyticsFilterParams params);

    FacultyWorkloadAnalyticsDto getFacultyWorkloadAnalytics(AnalyticsFilterParams params);

    DepartmentAnalyticsDto getDepartmentAnalytics(AnalyticsFilterParams params);

    HostelOccupancyAnalyticsDto getHostelOccupancyAnalytics(AnalyticsFilterParams params);

    RoomUtilizationDto getRoomUtilization(AnalyticsFilterParams params);

    HostelRequestAnalyticsDto getHostelRequestAnalytics(AnalyticsFilterParams params);

    HostelComplaintAnalyticsDto getHostelComplaintAnalytics(AnalyticsFilterParams params);

    MaintenanceAnalyticsDto getMaintenanceAnalytics(AnalyticsFilterParams params);
}
