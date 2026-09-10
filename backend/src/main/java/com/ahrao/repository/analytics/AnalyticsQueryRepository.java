package com.ahrao.repository.analytics;

import com.ahrao.dto.analytics.*;

import java.util.List;
import java.util.Map;

public interface AnalyticsQueryRepository {

    // Academic Resource Analytics
    Map<String, Long> getResourceCountsByStatus(Long departmentId);

    Map<String, Long> getResourceCountsByCategory(Long departmentId);

    List<RankedResourceDto> getTopAndBottomUtilizedResources(Long departmentId, String resourceType, int limit, boolean descending);

    long countResourcesByTypeAndStatus(String resourceType, String status, Long departmentId);

    long countTotalResourcesByType(String resourceType, Long departmentId);

    long sumEquipmentQuantities(String quantityField, Long departmentId);

    double calculateAverageClassroomCapacityUtilization(Long departmentId);

    // Allocation Analytics
    Map<String, Long> getAllocationCountsByStatus(Long departmentId, AnalyticsFilterParams params);

    Map<String, Long> getAllocationCountsByCategory(Long departmentId, AnalyticsFilterParams params);

    Map<String, Long> getAllocationCountsByDepartment(AnalyticsFilterParams params);

    List<TimeSeriesPointDto> getAllocationsTimeSeries(Long departmentId, AnalyticsFilterParams params);

    // Request Analytics
    Map<String, Long> getAcademicRequestCountsByStatus(Long departmentId, AnalyticsFilterParams params);

    Map<String, Long> getAcademicRequestCountsByPriority(Long departmentId, AnalyticsFilterParams params);

    Map<String, Long> getAcademicRequestCountsByDepartment(AnalyticsFilterParams params);

    List<TimeSeriesPointDto> getAcademicRequestsTimeSeries(Long departmentId, AnalyticsFilterParams params);

    // Hostel Analytics
    long countTotalHostels(List<Long> allowedHostelIds);

    long countTotalHostelBlocks(List<Long> allowedHostelIds);

    long countTotalHostelRooms(List<Long> allowedHostelIds);

    long countTotalHostelBeds(List<Long> allowedHostelIds);

    Map<String, Long> getHostelBedCountsByStatus(List<Long> allowedHostelIds);

    List<HostelOccupancyAnalyticsDto.HostelOccupancyItemDto> getHostelOccupancies(List<Long> allowedHostelIds);

    List<HostelOccupancyAnalyticsDto.BlockOccupancyItemDto> getBlockOccupancies(List<Long> allowedHostelIds);

    List<RoomUtilizationDto.RoomOccupancyDetailDto> getRoomOccupancies(List<Long> allowedHostelIds, AnalyticsFilterParams params);

    // Hostel Requests, Complaints & Maintenance
    Map<String, Long> getHostelRequestCountsByStatus(List<Long> allowedHostelIds, AnalyticsFilterParams params);

    Map<String, Long> getHostelRequestCountsByType(List<Long> allowedHostelIds, AnalyticsFilterParams params);

    Map<String, Long> getHostelComplaintCountsByStatus(List<Long> allowedHostelIds, AnalyticsFilterParams params);

    Map<String, Long> getHostelComplaintCountsByCategory(List<Long> allowedHostelIds, AnalyticsFilterParams params);

    Map<String, Long> getHostelComplaintCountsByPriority(List<Long> allowedHostelIds, AnalyticsFilterParams params);

    Map<String, Long> getMaintenanceCountsByStatus(List<Long> allowedHostelIds, Long departmentId, AnalyticsFilterParams params);

    Map<String, Long> getMaintenanceCountsByPriority(List<Long> allowedHostelIds, Long departmentId, AnalyticsFilterParams params);

    List<TimeSeriesPointDto> getHostelRequestsTimeSeries(List<Long> allowedHostelIds, AnalyticsFilterParams params);

    List<TimeSeriesPointDto> getHostelComplaintsTimeSeries(List<Long> allowedHostelIds, AnalyticsFilterParams params);

    List<TimeSeriesPointDto> getMaintenanceTimeSeries(List<Long> allowedHostelIds, Long departmentId, AnalyticsFilterParams params);

    // Faculty & Department Analytics
    FacultyWorkloadAnalyticsDto getFacultyWorkloadAnalytics(Long departmentId);

    List<DepartmentAnalyticsDto.DepartmentMetricsDto> getDepartmentMetrics(Long departmentId);
}
