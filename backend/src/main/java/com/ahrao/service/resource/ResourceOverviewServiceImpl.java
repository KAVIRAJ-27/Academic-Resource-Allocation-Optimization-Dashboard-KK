package com.ahrao.service.resource;

import com.ahrao.dto.resource.ResourceOverviewResponse;
import com.ahrao.dto.resource.ResourceReferenceDataResponse;
import com.ahrao.entity.enums.ResourceStatus;
import com.ahrao.entity.resource.ResourceCategory;
import com.ahrao.repository.academic.DepartmentRepository;
import com.ahrao.repository.academic.TimeSlotRepository;
import com.ahrao.repository.resource.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ResourceOverviewServiceImpl implements ResourceOverviewService {

    private final ResourceRepository resourceRepository;
    private final ResourceCategoryRepository categoryRepository;
    private final ClassroomRepository classroomRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final EquipmentRepository equipmentRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final DepartmentRepository departmentRepository;

    public ResourceOverviewServiceImpl(ResourceRepository resourceRepository,
                                       ResourceCategoryRepository categoryRepository,
                                       ClassroomRepository classroomRepository,
                                       LaboratoryRepository laboratoryRepository,
                                       EquipmentRepository equipmentRepository,
                                       TimeSlotRepository timeSlotRepository,
                                       DepartmentRepository departmentRepository) {
        this.resourceRepository = resourceRepository;
        this.categoryRepository = categoryRepository;
        this.classroomRepository = classroomRepository;
        this.laboratoryRepository = laboratoryRepository;
        this.equipmentRepository = equipmentRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.departmentRepository = departmentRepository;
    }

    @Override
    public ResourceOverviewResponse getOverview() {
        ResourceOverviewResponse res = new ResourceOverviewResponse();

        long total = resourceRepository.count();
        long available = resourceRepository.countByStatus(ResourceStatus.AVAILABLE);
        long maintenance = resourceRepository.countByStatus(ResourceStatus.MAINTENANCE);
        long inactive = resourceRepository.countByStatus(ResourceStatus.INACTIVE);
        long allocated = resourceRepository.countByStatus(ResourceStatus.ALLOCATED);

        res.setTotalResources(total);
        res.setAvailableResources(available);
        res.setMaintenanceResources(maintenance);
        res.setInactiveResources(inactive);
        res.setAllocatedResources(allocated);

        res.setTotalClassrooms(classroomRepository.count());
        res.setTotalLaboratories(laboratoryRepository.count());
        res.setTotalEquipment(equipmentRepository.count());
        res.setTotalTimeSlots(timeSlotRepository.count());
        res.setTotalCategories(categoryRepository.count());

        Map<String, Long> byStatus = new LinkedHashMap<>();
        byStatus.put("AVAILABLE", available);
        byStatus.put("MAINTENANCE", maintenance);
        byStatus.put("INACTIVE", inactive);
        byStatus.put("ALLOCATED", allocated);
        res.setResourcesByStatus(byStatus);

        Map<String, Long> byCategory = new LinkedHashMap<>();
        List<ResourceCategory> categories = categoryRepository.findAll();
        for (ResourceCategory cat : categories) {
            long count = resourceRepository.countByCategoryId(cat.getId());
            byCategory.put(cat.getName(), count);
        }
        res.setResourcesByCategory(byCategory);

        return res;
    }

    @Override
    public ResourceReferenceDataResponse getReferenceData() {
        ResourceReferenceDataResponse res = new ResourceReferenceDataResponse();

        List<ResourceReferenceDataResponse.ReferenceOption> cats = categoryRepository.findAll().stream()
                .map(c -> new ResourceReferenceDataResponse.ReferenceOption(c.getId(), c.getResourceType().name(), c.getName(), c.getResourceType().name(), c.getStatus()))
                .collect(Collectors.toList());
        res.setCategories(cats);

        List<ResourceReferenceDataResponse.ReferenceOption> depts = departmentRepository.findAll().stream()
                .filter(d -> "ACTIVE".equalsIgnoreCase(d.getStatus()))
                .map(d -> new ResourceReferenceDataResponse.ReferenceOption(d.getId(), d.getCode(), d.getName()))
                .collect(Collectors.toList());
        res.setDepartments(depts);

        res.setResourceStatuses(Arrays.asList("AVAILABLE", "ALLOCATED", "MAINTENANCE", "INACTIVE"));
        res.setResourceTypes(Arrays.asList("CLASSROOM", "LABORATORY", "EQUIPMENT", "SOFTWARE", "OTHER"));
        res.setRoomTypes(Arrays.asList("LECTURE_HALL", "SEMINAR_HALL", "SMART_CLASSROOM", "AUDITORIUM", "TUTORIAL_ROOM"));
        res.setLabTypes(Arrays.asList("COMPUTER_LAB", "PHYSICS_LAB", "CHEMISTRY_LAB", "ELECTRONICS_LAB", "MECHANICAL_WORKSHOP", "RESEARCH_LAB"));
        res.setConditionStatuses(Arrays.asList("NEW", "GOOD", "FAIR", "NEEDS_REPAIR", "DAMAGED"));
        res.setDaysOfWeek(Arrays.asList("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"));

        return res;
    }
}
