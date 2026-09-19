package com.ahrao.repository.analytics;

import com.ahrao.dto.analytics.*;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.enums.HostelBedStatus;
import com.ahrao.entity.enums.ResourceStatus;
import com.ahrao.entity.enums.ResourceType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class AnalyticsQueryRepositoryImpl implements AnalyticsQueryRepository {

    @PersistenceContext
    private EntityManager em;

    // ==========================================
    // 1. ACADEMIC RESOURCE ANALYTICS
    // ==========================================

    @Override
    public Map<String, Long> getResourceCountsByStatus(Long departmentId) {
        StringBuilder jpql = new StringBuilder("SELECT r.status, COUNT(r) FROM Resource r WHERE 1=1 ");
        if (departmentId != null) {
            jpql.append("AND (r.department.id = :deptId OR r.department IS NULL) ");
        }
        jpql.append("GROUP BY r.status");

        Query query = em.createQuery(jpql.toString());
        if (departmentId != null) {
            query.setParameter("deptId", departmentId);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();
        Map<String, Long> map = new LinkedHashMap<>();
        for (ResourceStatus status : ResourceStatus.values()) {
            map.put(status.name(), 0L);
        }
        for (Object[] row : results) {
            if (row[0] != null) {
                map.put(row[0].toString(), ((Number) row[1]).longValue());
            }
        }
        return map;
    }

    @Override
    public Map<String, Long> getResourceCountsByCategory(Long departmentId) {
        StringBuilder jpql = new StringBuilder("SELECT r.category.name, COUNT(r) FROM Resource r WHERE 1=1 ");
        if (departmentId != null) {
            jpql.append("AND (r.department.id = :deptId OR r.department IS NULL) ");
        }
        jpql.append("GROUP BY r.category.name ORDER BY COUNT(r) DESC");

        Query query = em.createQuery(jpql.toString());
        if (departmentId != null) {
            query.setParameter("deptId", departmentId);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] row : results) {
            if (row[0] != null) {
                map.put(row[0].toString(), ((Number) row[1]).longValue());
            }
        }
        return map;
    }

    @Override
    public List<RankedResourceDto> getTopAndBottomUtilizedResources(Long departmentId, String resourceType, int limit, boolean descending) {
        StringBuilder jpql = new StringBuilder(
                "SELECT r.id, r.name, r.code, r.category.name, r.category.resourceType, " +
                "d.name, r.capacity, COUNT(a.id) " +
                "FROM Resource r " +
                "LEFT JOIN r.department d " +
                "LEFT JOIN ResourceAllocation a ON a.resource.id = r.id AND a.status = :activeStatus " +
                "WHERE 1=1 "
        );

        if (departmentId != null) {
            jpql.append("AND (r.department.id = :deptId OR r.department IS NULL) ");
        }
        if (resourceType != null && !resourceType.isBlank()) {
            jpql.append("AND r.category.resourceType = :resType ");
        }

        jpql.append("GROUP BY r.id, r.name, r.code, r.category.name, r.category.resourceType, d.name, r.capacity ");
        jpql.append("ORDER BY COUNT(a.id) ").append(descending ? "DESC" : "ASC").append(", r.id ASC");

        Query query = em.createQuery(jpql.toString());
        query.setParameter("activeStatus", AllocationStatus.ACTIVE);
        if (departmentId != null) {
            query.setParameter("deptId", departmentId);
        }
        if (resourceType != null && !resourceType.isBlank()) {
            try {
                query.setParameter("resType", ResourceType.valueOf(resourceType.toUpperCase()));
            } catch (Exception e) {
                // Ignore invalid type
            }
        }
        query.setMaxResults(limit);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        List<RankedResourceDto> list = new ArrayList<>();
        for (Object[] r : rows) {
            RankedResourceDto dto = new RankedResourceDto();
            dto.setResourceId(((Number) r[0]).longValue());
            dto.setResourceName((String) r[1]);
            dto.setResourceCode((String) r[2]);
            dto.setCategoryName((String) r[3]);
            dto.setResourceType(r[4] != null ? r[4].toString() : "OTHER");
            dto.setDepartmentName(r[5] != null ? (String) r[5] : "General / Campus-Wide");
            dto.setCapacity(r[6] != null ? ((Number) r[6]).intValue() : 0);
            long allocations = r[7] != null ? ((Number) r[7]).longValue() : 0L;
            dto.setTotalAllocations(allocations);
            // Approximate utilization based on active allocation count normalized over 10 active slots scale
            double util = Math.min(100.0, allocations * 20.0);
            dto.setUtilizationPercentage(Math.round(util * 100.0) / 100.0);
            list.add(dto);
        }
        return list;
    }

    @Override
    public long countResourcesByTypeAndStatus(String resourceType, String status, Long departmentId) {
        StringBuilder jpql = new StringBuilder(
                "SELECT COUNT(r) FROM Resource r WHERE r.category.resourceType = :resType AND r.status = :status "
        );
        if (departmentId != null) {
            jpql.append("AND (r.department.id = :deptId OR r.department IS NULL) ");
        }

        Query query = em.createQuery(jpql.toString());
        query.setParameter("resType", ResourceType.valueOf(resourceType));
        query.setParameter("status", ResourceStatus.valueOf(status));
        if (departmentId != null) {
            query.setParameter("deptId", departmentId);
        }

        Number count = (Number) query.getSingleResult();
        return count != null ? count.longValue() : 0L;
    }

    @Override
    public long countTotalResourcesByType(String resourceType, Long departmentId) {
        StringBuilder jpql = new StringBuilder(
                "SELECT COUNT(r) FROM Resource r WHERE r.category.resourceType = :resType "
        );
        if (departmentId != null) {
            jpql.append("AND (r.department.id = :deptId OR r.department IS NULL) ");
        }

        Query query = em.createQuery(jpql.toString());
        query.setParameter("resType", ResourceType.valueOf(resourceType));
        if (departmentId != null) {
            query.setParameter("deptId", departmentId);
        }

        Number count = (Number) query.getSingleResult();
        return count != null ? count.longValue() : 0L;
    }

    @Override
    public long sumEquipmentQuantities(String quantityField, Long departmentId) {
        String column = "availableQuantity".equalsIgnoreCase(quantityField) ? "r.availableQuantity" : "r.quantity";
        StringBuilder jpql = new StringBuilder(
                "SELECT COALESCE(SUM(" + column + "), 0) FROM Resource r WHERE r.category.resourceType = :resType "
        );
        if (departmentId != null) {
            jpql.append("AND (r.department.id = :deptId OR r.department IS NULL) ");
        }

        Query query = em.createQuery(jpql.toString());
        query.setParameter("resType", ResourceType.EQUIPMENT);
        if (departmentId != null) {
            query.setParameter("deptId", departmentId);
        }

        Number sum = (Number) query.getSingleResult();
        return sum != null ? sum.longValue() : 0L;
    }

    @Override
    public double calculateAverageClassroomCapacityUtilization(Long departmentId) {
        StringBuilder jpql = new StringBuilder(
                "SELECT AVG(CAST(a.quantity AS double) / CAST(r.capacity AS double)) * 100.0 " +
                "FROM ResourceAllocation a JOIN a.resource r " +
                "WHERE r.category.resourceType = :resType AND a.status = :activeStatus AND r.capacity > 0 "
        );
        if (departmentId != null) {
            jpql.append("AND (r.department.id = :deptId OR r.department IS NULL) ");
        }

        Query query = em.createQuery(jpql.toString());
        query.setParameter("resType", ResourceType.CLASSROOM);
        query.setParameter("activeStatus", AllocationStatus.ACTIVE);
        if (departmentId != null) {
            query.setParameter("deptId", departmentId);
        }

        Object result = query.getSingleResult();
        if (result instanceof Number) {
            double val = ((Number) result).doubleValue();
            return Math.min(100.0, Math.round(val * 100.0) / 100.0);
        }
        return 0.0;
    }

    // ==========================================
    // 2. ALLOCATION ANALYTICS
    // ==========================================

    @Override
    public Map<String, Long> getAllocationCountsByStatus(Long departmentId, AnalyticsFilterParams params) {
        StringBuilder jpql = new StringBuilder("SELECT a.status, COUNT(a) FROM ResourceAllocation a WHERE 1=1 ");
        if (departmentId != null) {
            jpql.append("AND a.department.id = :deptId ");
        }
        jpql.append("GROUP BY a.status");

        Query query = em.createQuery(jpql.toString());
        if (departmentId != null) {
            query.setParameter("deptId", departmentId);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        Map<String, Long> map = new LinkedHashMap<>();
        for (AllocationStatus status : AllocationStatus.values()) {
            map.put(status.name(), 0L);
        }
        for (Object[] r : rows) {
            if (r[0] != null) {
                map.put(r[0].toString(), ((Number) r[1]).longValue());
            }
        }
        return map;
    }

    @Override
    public Map<String, Long> getAllocationCountsByCategory(Long departmentId, AnalyticsFilterParams params) {
        StringBuilder jpql = new StringBuilder(
                "SELECT a.resource.category.name, COUNT(a) FROM ResourceAllocation a WHERE 1=1 "
        );
        if (departmentId != null) {
            jpql.append("AND a.department.id = :deptId ");
        }
        jpql.append("GROUP BY a.resource.category.name ORDER BY COUNT(a) DESC");

        Query query = em.createQuery(jpql.toString());
        if (departmentId != null) {
            query.setParameter("deptId", departmentId);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] r : rows) {
            if (r[0] != null) {
                map.put(r[0].toString(), ((Number) r[1]).longValue());
            }
        }
        return map;
    }

    @Override
    public Map<String, Long> getAllocationCountsByDepartment(AnalyticsFilterParams params) {
        String jpql = "SELECT COALESCE(d.name, 'General'), COUNT(a) FROM ResourceAllocation a " +
                "LEFT JOIN a.department d GROUP BY d.name ORDER BY COUNT(a) DESC";

        Query query = em.createQuery(jpql);
        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] r : rows) {
            if (r[0] != null) {
                map.put(r[0].toString(), ((Number) r[1]).longValue());
            }
        }
        return map;
    }

    @Override
    public List<TimeSeriesPointDto> getAllocationsTimeSeries(Long departmentId, AnalyticsFilterParams params) {
        StringBuilder jpql = new StringBuilder(
                "SELECT FUNCTION('DATE_FORMAT', a.startDatetime, '%Y-%m'), COUNT(a) " +
                "FROM ResourceAllocation a WHERE 1=1 "
        );
        if (departmentId != null) {
            jpql.append("AND a.department.id = :deptId ");
        }
        jpql.append("GROUP BY FUNCTION('DATE_FORMAT', a.startDatetime, '%Y-%m') ");
        jpql.append("ORDER BY FUNCTION('DATE_FORMAT', a.startDatetime, '%Y-%m') ASC");

        Query query = em.createQuery(jpql.toString());
        if (departmentId != null) {
            query.setParameter("deptId", departmentId);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        List<TimeSeriesPointDto> points = new ArrayList<>();
        for (Object[] r : rows) {
            if (r[0] != null) {
                String month = r[0].toString();
                long count = ((Number) r[1]).longValue();
                points.add(new TimeSeriesPointDto(month, month, count, (double) count));
            }
        }
        return points;
    }

    // ==========================================
    // 3. REQUEST ANALYTICS
    // ==========================================

    @Override
    public Map<String, Long> getAcademicRequestCountsByStatus(Long departmentId, AnalyticsFilterParams params) {
        StringBuilder jpql = new StringBuilder("SELECT r.status, COUNT(r) FROM AcademicResourceRequest r WHERE 1=1 ");
        if (departmentId != null) {
            jpql.append("AND r.department.id = :deptId ");
        }
        jpql.append("GROUP BY r.status");

        Query query = em.createQuery(jpql.toString());
        if (departmentId != null) {
            query.setParameter("deptId", departmentId);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] r : rows) {
            if (r[0] != null) {
                map.put(r[0].toString(), ((Number) r[1]).longValue());
            }
        }
        return map;
    }

    @Override
    public Map<String, Long> getAcademicRequestCountsByPriority(Long departmentId, AnalyticsFilterParams params) {
        StringBuilder jpql = new StringBuilder("SELECT r.priority, COUNT(r) FROM AcademicResourceRequest r WHERE 1=1 ");
        if (departmentId != null) {
            jpql.append("AND r.department.id = :deptId ");
        }
        jpql.append("GROUP BY r.priority");

        Query query = em.createQuery(jpql.toString());
        if (departmentId != null) {
            query.setParameter("deptId", departmentId);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] r : rows) {
            if (r[0] != null) {
                map.put(r[0].toString(), ((Number) r[1]).longValue());
            }
        }
        return map;
    }

    @Override
    public Map<String, Long> getAcademicRequestCountsByDepartment(AnalyticsFilterParams params) {
        String jpql = "SELECT COALESCE(d.name, 'General'), COUNT(r) FROM AcademicResourceRequest r " +
                "LEFT JOIN r.department d GROUP BY d.name ORDER BY COUNT(r) DESC";

        Query query = em.createQuery(jpql);
        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] r : rows) {
            if (r[0] != null) {
                map.put(r[0].toString(), ((Number) r[1]).longValue());
            }
        }
        return map;
    }

    @Override
    public List<TimeSeriesPointDto> getAcademicRequestsTimeSeries(Long departmentId, AnalyticsFilterParams params) {
        StringBuilder jpql = new StringBuilder(
                "SELECT FUNCTION('DATE_FORMAT', r.createdAt, '%Y-%m'), COUNT(r) " +
                "FROM AcademicResourceRequest r WHERE 1=1 "
        );
        if (departmentId != null) {
            jpql.append("AND r.department.id = :deptId ");
        }
        jpql.append("GROUP BY FUNCTION('DATE_FORMAT', r.createdAt, '%Y-%m') ");
        jpql.append("ORDER BY FUNCTION('DATE_FORMAT', r.createdAt, '%Y-%m') ASC");

        Query query = em.createQuery(jpql.toString());
        if (departmentId != null) {
            query.setParameter("deptId", departmentId);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        List<TimeSeriesPointDto> points = new ArrayList<>();
        for (Object[] r : rows) {
            if (r[0] != null) {
                String month = r[0].toString();
                long count = ((Number) r[1]).longValue();
                points.add(new TimeSeriesPointDto(month, month, count, (double) count));
            }
        }
        return points;
    }

    // ==========================================
    // 4. HOSTEL ANALYTICS
    // ==========================================

    @Override
    public long countTotalHostels(List<Long> allowedHostelIds) {
        if (allowedHostelIds != null && allowedHostelIds.isEmpty()) return 0L;
        StringBuilder jpql = new StringBuilder("SELECT COUNT(h) FROM Hostel h WHERE h.status = 'ACTIVE' ");
        if (allowedHostelIds != null) {
            jpql.append("AND h.id IN (:hIds) ");
        }
        Query query = em.createQuery(jpql.toString());
        if (allowedHostelIds != null) {
            query.setParameter("hIds", allowedHostelIds);
        }
        Number n = (Number) query.getSingleResult();
        return n != null ? n.longValue() : 0L;
    }

    @Override
    public long countTotalHostelBlocks(List<Long> allowedHostelIds) {
        if (allowedHostelIds != null && allowedHostelIds.isEmpty()) return 0L;
        StringBuilder jpql = new StringBuilder("SELECT COUNT(b) FROM HostelBlock b WHERE b.status = 'ACTIVE' ");
        if (allowedHostelIds != null) {
            jpql.append("AND b.hostel.id IN (:hIds) ");
        }
        Query query = em.createQuery(jpql.toString());
        if (allowedHostelIds != null) {
            query.setParameter("hIds", allowedHostelIds);
        }
        Number n = (Number) query.getSingleResult();
        return n != null ? n.longValue() : 0L;
    }

    @Override
    public long countTotalHostelRooms(List<Long> allowedHostelIds) {
        if (allowedHostelIds != null && allowedHostelIds.isEmpty()) return 0L;
        StringBuilder jpql = new StringBuilder("SELECT COUNT(r) FROM HostelRoom r WHERE 1=1 ");
        if (allowedHostelIds != null) {
            jpql.append("AND r.floor.block.hostel.id IN (:hIds) ");
        }
        Query query = em.createQuery(jpql.toString());
        if (allowedHostelIds != null) {
            query.setParameter("hIds", allowedHostelIds);
        }
        Number n = (Number) query.getSingleResult();
        return n != null ? n.longValue() : 0L;
    }

    @Override
    public long countTotalHostelBeds(List<Long> allowedHostelIds) {
        if (allowedHostelIds != null && allowedHostelIds.isEmpty()) return 0L;
        StringBuilder jpql = new StringBuilder("SELECT COUNT(b) FROM HostelBed b WHERE 1=1 ");
        if (allowedHostelIds != null) {
            jpql.append("AND b.room.floor.block.hostel.id IN (:hIds) ");
        }
        Query query = em.createQuery(jpql.toString());
        if (allowedHostelIds != null) {
            query.setParameter("hIds", allowedHostelIds);
        }
        Number n = (Number) query.getSingleResult();
        return n != null ? n.longValue() : 0L;
    }

    @Override
    public Map<String, Long> getHostelBedCountsByStatus(List<Long> allowedHostelIds) {
        Map<String, Long> map = new LinkedHashMap<>();
        for (HostelBedStatus s : HostelBedStatus.values()) {
            map.put(s.name(), 0L);
        }
        if (allowedHostelIds != null && allowedHostelIds.isEmpty()) return map;

        StringBuilder jpql = new StringBuilder("SELECT b.status, COUNT(b) FROM HostelBed b WHERE 1=1 ");
        if (allowedHostelIds != null) {
            jpql.append("AND b.room.floor.block.hostel.id IN (:hIds) ");
        }
        jpql.append("GROUP BY b.status");

        Query query = em.createQuery(jpql.toString());
        if (allowedHostelIds != null) {
            query.setParameter("hIds", allowedHostelIds);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        for (Object[] r : rows) {
            if (r[0] != null) {
                map.put(r[0].toString(), ((Number) r[1]).longValue());
            }
        }
        return map;
    }

    @Override
    public List<HostelOccupancyAnalyticsDto.HostelOccupancyItemDto> getHostelOccupancies(List<Long> allowedHostelIds) {
        if (allowedHostelIds != null && allowedHostelIds.isEmpty()) return Collections.emptyList();

        StringBuilder jpql = new StringBuilder(
                "SELECT h.id, h.name, h.hostelType, " +
                "COUNT(DISTINCT r.id), COUNT(b.id), " +
                "SUM(CASE WHEN b.status = :occStatus THEN 1 ELSE 0 END), " +
                "SUM(CASE WHEN b.status = :availStatus THEN 1 ELSE 0 END) " +
                "FROM Hostel h " +
                "LEFT JOIN HostelBlock blk ON blk.hostel.id = h.id AND blk.status = 'ACTIVE' " +
                "LEFT JOIN HostelFloor flr ON flr.block.id = blk.id " +
                "LEFT JOIN HostelRoom r ON r.floor.id = flr.id " +
                "LEFT JOIN HostelBed b ON b.room.id = r.id " +
                "WHERE h.status = 'ACTIVE' "
        );

        if (allowedHostelIds != null) {
            jpql.append("AND h.id IN (:hIds) ");
        }
        jpql.append("GROUP BY h.id, h.name, h.hostelType ORDER BY h.name ASC");

        Query query = em.createQuery(jpql.toString());
        query.setParameter("occStatus", HostelBedStatus.OCCUPIED);
        query.setParameter("availStatus", HostelBedStatus.AVAILABLE);
        if (allowedHostelIds != null) {
            query.setParameter("hIds", allowedHostelIds);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        List<HostelOccupancyAnalyticsDto.HostelOccupancyItemDto> list = new ArrayList<>();
        for (Object[] r : rows) {
            HostelOccupancyAnalyticsDto.HostelOccupancyItemDto dto = new HostelOccupancyAnalyticsDto.HostelOccupancyItemDto();
            dto.setHostelId(((Number) r[0]).longValue());
            dto.setHostelName((String) r[1]);
            dto.setHostelType(r[2] != null ? r[2].toString() : "MIXED");
            dto.setTotalRooms(r[3] != null ? ((Number) r[3]).longValue() : 0L);
            long beds = r[4] != null ? ((Number) r[4]).longValue() : 0L;
            long occupied = r[5] != null ? ((Number) r[5]).longValue() : 0L;
            long available = r[6] != null ? ((Number) r[6]).longValue() : 0L;
            dto.setTotalBeds(beds);
            dto.setOccupiedBeds(occupied);
            dto.setAvailableBeds(available);
            double pct = beds > 0 ? (occupied * 100.0) / beds : 0.0;
            dto.setOccupancyPercentage(Math.round(pct * 100.0) / 100.0);
            list.add(dto);
        }
        return list;
    }

    @Override
    public List<HostelOccupancyAnalyticsDto.BlockOccupancyItemDto> getBlockOccupancies(List<Long> allowedHostelIds) {
        if (allowedHostelIds != null && allowedHostelIds.isEmpty()) return Collections.emptyList();

        StringBuilder jpql = new StringBuilder(
                "SELECT blk.id, blk.name, blk.hostel.name, " +
                "COUNT(DISTINCT r.id), COUNT(b.id), " +
                "SUM(CASE WHEN b.status = :occStatus THEN 1 ELSE 0 END), " +
                "SUM(CASE WHEN b.status = :availStatus THEN 1 ELSE 0 END) " +
                "FROM HostelBlock blk " +
                "LEFT JOIN HostelFloor flr ON flr.block.id = blk.id " +
                "LEFT JOIN HostelRoom r ON r.floor.id = flr.id " +
                "LEFT JOIN HostelBed b ON b.room.id = r.id " +
                "WHERE blk.status = 'ACTIVE' "
        );

        if (allowedHostelIds != null) {
            jpql.append("AND blk.hostel.id IN (:hIds) ");
        }
        jpql.append("GROUP BY blk.id, blk.name, blk.hostel.name ORDER BY blk.hostel.name ASC, blk.name ASC");

        Query query = em.createQuery(jpql.toString());
        query.setParameter("occStatus", HostelBedStatus.OCCUPIED);
        query.setParameter("availStatus", HostelBedStatus.AVAILABLE);
        if (allowedHostelIds != null) {
            query.setParameter("hIds", allowedHostelIds);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        List<HostelOccupancyAnalyticsDto.BlockOccupancyItemDto> list = new ArrayList<>();
        for (Object[] r : rows) {
            HostelOccupancyAnalyticsDto.BlockOccupancyItemDto dto = new HostelOccupancyAnalyticsDto.BlockOccupancyItemDto();
            dto.setBlockId(((Number) r[0]).longValue());
            dto.setBlockName((String) r[1]);
            dto.setHostelName((String) r[2]);
            dto.setTotalRooms(r[3] != null ? ((Number) r[3]).longValue() : 0L);
            long beds = r[4] != null ? ((Number) r[4]).longValue() : 0L;
            long occupied = r[5] != null ? ((Number) r[5]).longValue() : 0L;
            long available = r[6] != null ? ((Number) r[6]).longValue() : 0L;
            dto.setTotalBeds(beds);
            dto.setOccupiedBeds(occupied);
            dto.setAvailableBeds(available);
            double pct = beds > 0 ? (occupied * 100.0) / beds : 0.0;
            dto.setOccupancyPercentage(Math.round(pct * 100.0) / 100.0);
            list.add(dto);
        }
        return list;
    }

    @Override
    public List<RoomUtilizationDto.RoomOccupancyDetailDto> getRoomOccupancies(List<Long> allowedHostelIds, AnalyticsFilterParams params) {
        if (allowedHostelIds != null && allowedHostelIds.isEmpty()) return Collections.emptyList();

        StringBuilder jpql = new StringBuilder(
                "SELECT r.id, r.roomNumber, r.roomType, h.name, blk.name, flr.floorNumber, r.capacity, " +
                "SUM(CASE WHEN b.status = :occStatus THEN 1 ELSE 0 END), " +
                "SUM(CASE WHEN b.status = :availStatus THEN 1 ELSE 0 END), r.status " +
                "FROM HostelRoom r " +
                "JOIN r.floor flr " +
                "JOIN flr.block blk " +
                "JOIN blk.hostel h " +
                "LEFT JOIN HostelBed b ON b.room.id = r.id " +
                "WHERE 1=1 "
        );

        if (allowedHostelIds != null) {
            jpql.append("AND h.id IN (:hIds) ");
        }
        if (params != null && params.getHostelId() != null) {
            jpql.append("AND h.id = :hostelId ");
        }
        if (params != null && params.getBlockId() != null) {
            jpql.append("AND blk.id = :blockId ");
        }
        if (params != null && params.getRoomId() != null) {
            jpql.append("AND r.id = :roomId ");
        }

        jpql.append("GROUP BY r.id, r.roomNumber, r.roomType, h.name, blk.name, flr.floorNumber, r.capacity, r.status ");
        jpql.append("ORDER BY h.name ASC, blk.name ASC, r.roomNumber ASC");

        Query query = em.createQuery(jpql.toString());
        query.setParameter("occStatus", HostelBedStatus.OCCUPIED);
        query.setParameter("availStatus", HostelBedStatus.AVAILABLE);
        if (allowedHostelIds != null) {
            query.setParameter("hIds", allowedHostelIds);
        }
        if (params != null && params.getHostelId() != null) {
            query.setParameter("hostelId", params.getHostelId());
        }
        if (params != null && params.getBlockId() != null) {
            query.setParameter("blockId", params.getBlockId());
        }
        if (params != null && params.getRoomId() != null) {
            query.setParameter("roomId", params.getRoomId());
        }
        query.setMaxResults(100);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        List<RoomUtilizationDto.RoomOccupancyDetailDto> list = new ArrayList<>();
        for (Object[] r : rows) {
            RoomUtilizationDto.RoomOccupancyDetailDto dto = new RoomUtilizationDto.RoomOccupancyDetailDto();
            dto.setRoomId(((Number) r[0]).longValue());
            dto.setRoomNumber((String) r[1]);
            dto.setRoomType(r[2] != null ? r[2].toString() : "STANDARD");
            dto.setHostelName((String) r[3]);
            dto.setBlockName((String) r[4]);
            dto.setFloorNumber(r[5] != null ? ((Number) r[5]).intValue() : 1);
            int capacity = r[6] != null ? ((Number) r[6]).intValue() : 2;
            int occupied = r[7] != null ? ((Number) r[7]).intValue() : 0;
            int available = r[8] != null ? ((Number) r[8]).intValue() : 0;
            dto.setCapacity(capacity);
            dto.setOccupiedBeds(occupied);
            dto.setAvailableBeds(available);
            double pct = capacity > 0 ? (occupied * 100.0) / capacity : 0.0;
            dto.setUtilizationPercentage(Math.round(pct * 100.0) / 100.0);
            dto.setStatus(r[9] != null ? r[9].toString() : "AVAILABLE");
            list.add(dto);
        }
        return list;
    }

    // ==========================================
    // 5. HOSTEL REQUESTS, COMPLAINTS, MAINTENANCE
    // ==========================================

    @Override
    public Map<String, Long> getHostelRequestCountsByStatus(List<Long> allowedHostelIds, AnalyticsFilterParams params) {
        if (allowedHostelIds != null && allowedHostelIds.isEmpty()) return Collections.emptyMap();
        StringBuilder jpql = new StringBuilder("SELECT r.status, COUNT(r) FROM HostelRequest r WHERE 1=1 ");
        if (allowedHostelIds != null) {
            jpql.append("AND r.hostel.id IN (:hIds) ");
        }
        jpql.append("GROUP BY r.status");

        Query query = em.createQuery(jpql.toString());
        if (allowedHostelIds != null) {
            query.setParameter("hIds", allowedHostelIds);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] r : rows) {
            if (r[0] != null) {
                map.put(r[0].toString(), ((Number) r[1]).longValue());
            }
        }
        return map;
    }

    @Override
    public Map<String, Long> getHostelRequestCountsByType(List<Long> allowedHostelIds, AnalyticsFilterParams params) {
        if (allowedHostelIds != null && allowedHostelIds.isEmpty()) return Collections.emptyMap();
        StringBuilder jpql = new StringBuilder("SELECT r.requestType, COUNT(r) FROM HostelRequest r WHERE 1=1 ");
        if (allowedHostelIds != null) {
            jpql.append("AND r.hostel.id IN (:hIds) ");
        }
        jpql.append("GROUP BY r.requestType");

        Query query = em.createQuery(jpql.toString());
        if (allowedHostelIds != null) {
            query.setParameter("hIds", allowedHostelIds);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] r : rows) {
            if (r[0] != null) {
                map.put(r[0].toString(), ((Number) r[1]).longValue());
            }
        }
        return map;
    }

    @Override
    public Map<String, Long> getHostelComplaintCountsByStatus(List<Long> allowedHostelIds, AnalyticsFilterParams params) {
        if (allowedHostelIds != null && allowedHostelIds.isEmpty()) return Collections.emptyMap();
        StringBuilder jpql = new StringBuilder("SELECT c.status, COUNT(c) FROM HostelComplaint c WHERE 1=1 ");
        if (allowedHostelIds != null) {
            jpql.append("AND c.hostel.id IN (:hIds) ");
        }
        jpql.append("GROUP BY c.status");

        Query query = em.createQuery(jpql.toString());
        if (allowedHostelIds != null) {
            query.setParameter("hIds", allowedHostelIds);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] r : rows) {
            if (r[0] != null) {
                map.put(r[0].toString(), ((Number) r[1]).longValue());
            }
        }
        return map;
    }

    @Override
    public Map<String, Long> getHostelComplaintCountsByCategory(List<Long> allowedHostelIds, AnalyticsFilterParams params) {
        if (allowedHostelIds != null && allowedHostelIds.isEmpty()) return Collections.emptyMap();
        StringBuilder jpql = new StringBuilder("SELECT c.category, COUNT(c) FROM HostelComplaint c WHERE 1=1 ");
        if (allowedHostelIds != null) {
            jpql.append("AND c.hostel.id IN (:hIds) ");
        }
        jpql.append("GROUP BY c.category");

        Query query = em.createQuery(jpql.toString());
        if (allowedHostelIds != null) {
            query.setParameter("hIds", allowedHostelIds);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] r : rows) {
            if (r[0] != null) {
                map.put(r[0].toString(), ((Number) r[1]).longValue());
            }
        }
        return map;
    }

    @Override
    public Map<String, Long> getHostelComplaintCountsByPriority(List<Long> allowedHostelIds, AnalyticsFilterParams params) {
        if (allowedHostelIds != null && allowedHostelIds.isEmpty()) return Collections.emptyMap();
        StringBuilder jpql = new StringBuilder("SELECT c.priority, COUNT(c) FROM HostelComplaint c WHERE 1=1 ");
        if (allowedHostelIds != null) {
            jpql.append("AND c.hostel.id IN (:hIds) ");
        }
        jpql.append("GROUP BY c.priority");

        Query query = em.createQuery(jpql.toString());
        if (allowedHostelIds != null) {
            query.setParameter("hIds", allowedHostelIds);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] r : rows) {
            if (r[0] != null) {
                map.put(r[0].toString(), ((Number) r[1]).longValue());
            }
        }
        return map;
    }

    @Override
    public Map<String, Long> getMaintenanceCountsByStatus(List<Long> allowedHostelIds, Long departmentId, AnalyticsFilterParams params) {
        StringBuilder jpql = new StringBuilder("SELECT m.status, COUNT(m) FROM MaintenanceRequest m WHERE 1=1 ");
        if (allowedHostelIds != null && !allowedHostelIds.isEmpty()) {
            jpql.append("AND (m.hostel IS NULL OR m.hostel.id IN (:hIds)) ");
        }
        if (departmentId != null) {
            jpql.append("AND (m.resource IS NULL OR m.resource.department.id = :deptId) ");
        }
        jpql.append("GROUP BY m.status");

        Query query = em.createQuery(jpql.toString());
        if (allowedHostelIds != null && !allowedHostelIds.isEmpty()) {
            query.setParameter("hIds", allowedHostelIds);
        }
        if (departmentId != null) {
            query.setParameter("deptId", departmentId);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] r : rows) {
            if (r[0] != null) {
                map.put(r[0].toString(), ((Number) r[1]).longValue());
            }
        }
        return map;
    }

    @Override
    public Map<String, Long> getMaintenanceCountsByPriority(List<Long> allowedHostelIds, Long departmentId, AnalyticsFilterParams params) {
        StringBuilder jpql = new StringBuilder("SELECT m.priority, COUNT(m) FROM MaintenanceRequest m WHERE 1=1 ");
        if (allowedHostelIds != null && !allowedHostelIds.isEmpty()) {
            jpql.append("AND (m.hostel IS NULL OR m.hostel.id IN (:hIds)) ");
        }
        if (departmentId != null) {
            jpql.append("AND (m.resource IS NULL OR m.resource.department.id = :deptId) ");
        }
        jpql.append("GROUP BY m.priority");

        Query query = em.createQuery(jpql.toString());
        if (allowedHostelIds != null && !allowedHostelIds.isEmpty()) {
            query.setParameter("hIds", allowedHostelIds);
        }
        if (departmentId != null) {
            query.setParameter("deptId", departmentId);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] r : rows) {
            if (r[0] != null) {
                map.put(r[0].toString(), ((Number) r[1]).longValue());
            }
        }
        return map;
    }

    @Override
    public List<TimeSeriesPointDto> getHostelRequestsTimeSeries(List<Long> allowedHostelIds, AnalyticsFilterParams params) {
        if (allowedHostelIds != null && allowedHostelIds.isEmpty()) return Collections.emptyList();
        StringBuilder jpql = new StringBuilder(
                "SELECT FUNCTION('DATE_FORMAT', r.createdAt, '%Y-%m'), COUNT(r) FROM HostelRequest r WHERE 1=1 "
        );
        if (allowedHostelIds != null) {
            jpql.append("AND r.hostel.id IN (:hIds) ");
        }
        jpql.append("GROUP BY FUNCTION('DATE_FORMAT', r.createdAt, '%Y-%m') ");
        jpql.append("ORDER BY FUNCTION('DATE_FORMAT', r.createdAt, '%Y-%m') ASC");

        Query query = em.createQuery(jpql.toString());
        if (allowedHostelIds != null) {
            query.setParameter("hIds", allowedHostelIds);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        List<TimeSeriesPointDto> points = new ArrayList<>();
        for (Object[] r : rows) {
            if (r[0] != null) {
                String month = r[0].toString();
                long count = ((Number) r[1]).longValue();
                points.add(new TimeSeriesPointDto(month, month, count, (double) count));
            }
        }
        return points;
    }

    @Override
    public List<TimeSeriesPointDto> getHostelComplaintsTimeSeries(List<Long> allowedHostelIds, AnalyticsFilterParams params) {
        if (allowedHostelIds != null && allowedHostelIds.isEmpty()) return Collections.emptyList();
        StringBuilder jpql = new StringBuilder(
                "SELECT FUNCTION('DATE_FORMAT', c.createdAt, '%Y-%m'), COUNT(c) FROM HostelComplaint c WHERE 1=1 "
        );
        if (allowedHostelIds != null) {
            jpql.append("AND c.hostel.id IN (:hIds) ");
        }
        jpql.append("GROUP BY FUNCTION('DATE_FORMAT', c.createdAt, '%Y-%m') ");
        jpql.append("ORDER BY FUNCTION('DATE_FORMAT', c.createdAt, '%Y-%m') ASC");

        Query query = em.createQuery(jpql.toString());
        if (allowedHostelIds != null) {
            query.setParameter("hIds", allowedHostelIds);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        List<TimeSeriesPointDto> points = new ArrayList<>();
        for (Object[] r : rows) {
            if (r[0] != null) {
                String month = r[0].toString();
                long count = ((Number) r[1]).longValue();
                points.add(new TimeSeriesPointDto(month, month, count, (double) count));
            }
        }
        return points;
    }

    @Override
    public List<TimeSeriesPointDto> getMaintenanceTimeSeries(List<Long> allowedHostelIds, Long departmentId, AnalyticsFilterParams params) {
        StringBuilder jpql = new StringBuilder(
                "SELECT FUNCTION('DATE_FORMAT', m.createdAt, '%Y-%m'), COUNT(m) FROM MaintenanceRequest m WHERE 1=1 "
        );
        if (allowedHostelIds != null && !allowedHostelIds.isEmpty()) {
            jpql.append("AND (m.hostel IS NULL OR m.hostel.id IN (:hIds)) ");
        }
        if (departmentId != null) {
            jpql.append("AND (m.resource IS NULL OR m.resource.department.id = :deptId) ");
        }
        jpql.append("GROUP BY FUNCTION('DATE_FORMAT', m.createdAt, '%Y-%m') ");
        jpql.append("ORDER BY FUNCTION('DATE_FORMAT', m.createdAt, '%Y-%m') ASC");

        Query query = em.createQuery(jpql.toString());
        if (allowedHostelIds != null && !allowedHostelIds.isEmpty()) {
            query.setParameter("hIds", allowedHostelIds);
        }
        if (departmentId != null) {
            query.setParameter("deptId", departmentId);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        List<TimeSeriesPointDto> points = new ArrayList<>();
        for (Object[] r : rows) {
            if (r[0] != null) {
                String month = r[0].toString();
                long count = ((Number) r[1]).longValue();
                points.add(new TimeSeriesPointDto(month, month, count, (double) count));
            }
        }
        return points;
    }

    // ==========================================
    // 6. FACULTY & DEPARTMENT ANALYTICS
    // ==========================================

    @Override
    public FacultyWorkloadAnalyticsDto getFacultyWorkloadAnalytics(Long departmentId) {
        FacultyWorkloadAnalyticsDto dto = new FacultyWorkloadAnalyticsDto();

        // 1. Aggregates from FacultyWorkload
        StringBuilder aggJpql = new StringBuilder(
                "SELECT COUNT(w), COALESCE(AVG(w.totalHours), 0), COALESCE(MAX(w.totalHours), 0), COALESCE(MIN(w.totalHours), 0) " +
                "FROM FacultyWorkload w WHERE 1=1 "
        );
        if (departmentId != null) {
            aggJpql.append("AND w.faculty.department.id = :deptId ");
        }

        Query aggQuery = em.createQuery(aggJpql.toString());
        if (departmentId != null) {
            aggQuery.setParameter("deptId", departmentId);
        }

        Object[] aggRow = (Object[]) aggQuery.getSingleResult();
        long totalFaculty = ((Number) aggRow[0]).longValue();
        double avgHours = ((Number) aggRow[1]).doubleValue();
        double maxHours = ((Number) aggRow[2]).doubleValue();
        double minHours = ((Number) aggRow[3]).doubleValue();

        dto.setTotalFaculty(totalFaculty);
        dto.setAverageWorkloadHours(Math.round(avgHours * 100.0) / 100.0);
        dto.setMaxWorkloadHours(Math.round(maxHours * 100.0) / 100.0);
        dto.setMinWorkloadHours(Math.round(minHours * 100.0) / 100.0);

        // 2. Status distribution
        StringBuilder statusJpql = new StringBuilder(
                "SELECT w.workloadStatus, COUNT(w) FROM FacultyWorkload w WHERE 1=1 "
        );
        if (departmentId != null) {
            statusJpql.append("AND w.faculty.department.id = :deptId ");
        }
        statusJpql.append("GROUP BY w.workloadStatus");

        Query statusQuery = em.createQuery(statusJpql.toString());
        if (departmentId != null) {
            statusQuery.setParameter("deptId", departmentId);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> statusRows = statusQuery.getResultList();
        Map<String, Long> statusMap = new LinkedHashMap<>();
        long overloaded = 0;
        long balanced = 0;
        long underutilized = 0;

        for (Object[] r : statusRows) {
            if (r[0] != null) {
                String st = r[0].toString();
                long count = ((Number) r[1]).longValue();
                statusMap.put(st, count);
                if (st.toUpperCase().contains("OVER")) overloaded += count;
                else if (st.toUpperCase().contains("UNDER") || st.toUpperCase().contains("LOW")) underutilized += count;
                else balanced += count;
            }
        }
        dto.setWorkloadStatusDistribution(statusMap);
        dto.setOverloadedFacultyCount(overloaded);
        dto.setBalancedFacultyCount(balanced);
        dto.setUnderutilizedFacultyCount(underutilized);

        // 3. Faculty workload list
        StringBuilder listJpql = new StringBuilder(
                "SELECT w.faculty.id, w.faculty.user.name, w.faculty.employeeId, " +
                "w.faculty.department.name, w.totalHours, w.teachingHours, w.labHours, w.workloadStatus " +
                "FROM FacultyWorkload w WHERE 1=1 "
        );
        if (departmentId != null) {
            listJpql.append("AND w.faculty.department.id = :deptId ");
        }
        listJpql.append("ORDER BY w.totalHours DESC");

        Query listQuery = em.createQuery(listJpql.toString());
        if (departmentId != null) {
            listQuery.setParameter("deptId", departmentId);
        }
        listQuery.setMaxResults(100);

        @SuppressWarnings("unchecked")
        List<Object[]> listRows = listQuery.getResultList();
        List<FacultyWorkloadAnalyticsDto.FacultyWorkloadSummaryItemDto> items = new ArrayList<>();
        for (Object[] r : listRows) {
            FacultyWorkloadAnalyticsDto.FacultyWorkloadSummaryItemDto item = new FacultyWorkloadAnalyticsDto.FacultyWorkloadSummaryItemDto();
            item.setFacultyId(((Number) r[0]).longValue());
            item.setFacultyName((String) r[1]);
            item.setEmployeeId((String) r[2]);
            item.setDepartmentName((String) r[3]);
            item.setTotalHours(r[4] != null ? ((Number) r[4]).doubleValue() : 0.0);
            item.setTeachingHours(r[5] != null ? ((Number) r[5]).doubleValue() : 0.0);
            item.setLabHours(r[6] != null ? ((Number) r[6]).doubleValue() : 0.0);
            item.setWorkloadStatus(r[7] != null ? r[7].toString() : "NORMAL");
            items.add(item);
        }
        dto.setFacultyWorkloads(items);
        return dto;
    }

    @Override
    public List<DepartmentAnalyticsDto.DepartmentMetricsDto> getDepartmentMetrics(Long departmentId) {
        StringBuilder jpql = new StringBuilder(
                "SELECT d.id, d.name, d.code, " +
                "(SELECT COUNT(s) FROM Student s WHERE s.department.id = d.id AND s.status = 'ACTIVE'), " +
                "(SELECT COUNT(f) FROM Faculty f WHERE f.department.id = d.id AND f.status = 'ACTIVE'), " +
                "(SELECT COUNT(sub) FROM Subject sub WHERE sub.department.id = d.id), " +
                "(SELECT COUNT(res) FROM Resource res WHERE res.department.id = d.id AND res.status = 'AVAILABLE'), " +
                "(SELECT COUNT(req) FROM AcademicResourceRequest req WHERE req.department.id = d.id), " +
                "(SELECT COUNT(alloc) FROM ResourceAllocation alloc WHERE alloc.department.id = d.id AND alloc.status = 'ACTIVE'), " +
                "(SELECT COALESCE(AVG(w.totalHours), 0) FROM FacultyWorkload w WHERE w.faculty.department.id = d.id) " +
                "FROM Department d WHERE d.status = 'ACTIVE' "
        );

        if (departmentId != null) {
            jpql.append("AND d.id = :deptId ");
        }
        jpql.append("ORDER BY d.name ASC");

        Query query = em.createQuery(jpql.toString());
        if (departmentId != null) {
            query.setParameter("deptId", departmentId);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        List<DepartmentAnalyticsDto.DepartmentMetricsDto> list = new ArrayList<>();
        for (Object[] r : rows) {
            DepartmentAnalyticsDto.DepartmentMetricsDto dto = new DepartmentAnalyticsDto.DepartmentMetricsDto();
            dto.setDepartmentId(((Number) r[0]).longValue());
            dto.setDepartmentName((String) r[1]);
            dto.setDepartmentCode((String) r[2]);
            dto.setStudentCount(((Number) r[3]).longValue());
            dto.setFacultyCount(((Number) r[4]).longValue());
            dto.setSubjectCount(((Number) r[5]).longValue());
            long resources = ((Number) r[6]).longValue();
            dto.setResourceCount(resources);
            dto.setRequestCount(((Number) r[7]).longValue());
            long allocations = ((Number) r[8]).longValue();
            dto.setAllocationCount(allocations);
            double avgWorkload = ((Number) r[9]).doubleValue();
            dto.setAverageFacultyWorkload(Math.round(avgWorkload * 100.0) / 100.0);

            double util = resources > 0 ? Math.min(100.0, (allocations * 100.0) / resources) : 0.0;
            dto.setResourceUtilizationPercentage(Math.round(util * 100.0) / 100.0);
            list.add(dto);
        }
        return list;
    }
}
