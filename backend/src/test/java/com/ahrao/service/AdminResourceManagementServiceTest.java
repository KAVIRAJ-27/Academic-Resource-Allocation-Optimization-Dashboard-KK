package com.ahrao.service;

import com.ahrao.dto.resource.*;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Institution;
import com.ahrao.entity.academic.TimeSlot;
import com.ahrao.entity.enums.ResourceType;
import com.ahrao.entity.resource.*;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.DepartmentRepository;
import com.ahrao.repository.academic.InstitutionRepository;
import com.ahrao.repository.academic.TimeSlotRepository;
import com.ahrao.repository.academic.TimetableEntryRepository;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.resource.*;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.resource.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminResourceManagementServiceTest {

    @Mock
    private ResourceCategoryRepository categoryRepository;
    @Mock
    private ResourceRepository resourceRepository;
    @Mock
    private ClassroomRepository classroomRepository;
    @Mock
    private LaboratoryRepository laboratoryRepository;
    @Mock
    private EquipmentRepository equipmentRepository;
    @Mock
    private TimeSlotRepository timeSlotRepository;
    @Mock
    private DepartmentRepository departmentRepository;
    @Mock
    private InstitutionRepository institutionRepository;
    @Mock
    private ResourceAllocationRepository allocationRepository;
    @Mock
    private TimetableEntryRepository timetableEntryRepository;
    @Mock
    private AuditLogRepository auditLogRepository;
    @Mock
    private UserRepository userRepository;

    private ResourceCategoryManagementService categoryService;
    private ResourceManagementService resourceService;
    private ClassroomManagementService classroomService;
    private LaboratoryManagementService laboratoryService;
    private EquipmentManagementService equipmentService;
    private TimeSlotManagementService timeSlotService;

    private Institution sampleInstitution;
    private ResourceCategory sampleCategory;
    private Department sampleDepartment;

    @BeforeEach
    void setUp() {
        categoryService = new ResourceCategoryManagementServiceImpl(
                categoryRepository, resourceRepository, auditLogRepository, userRepository);

        resourceService = new ResourceManagementServiceImpl(
                resourceRepository, categoryRepository, departmentRepository, institutionRepository,
                classroomRepository, laboratoryRepository, equipmentRepository, allocationRepository,
                timetableEntryRepository, auditLogRepository, userRepository);

        classroomService = new ClassroomManagementServiceImpl(
                classroomRepository, resourceRepository, categoryRepository, departmentRepository,
                institutionRepository, allocationRepository, timetableEntryRepository, auditLogRepository, userRepository);

        laboratoryService = new LaboratoryManagementServiceImpl(
                laboratoryRepository, resourceRepository, categoryRepository, departmentRepository,
                institutionRepository, allocationRepository, timetableEntryRepository, auditLogRepository, userRepository);

        equipmentService = new EquipmentManagementServiceImpl(
                equipmentRepository, resourceRepository, categoryRepository, departmentRepository,
                institutionRepository, allocationRepository, auditLogRepository, userRepository);

        timeSlotService = new TimeSlotManagementServiceImpl(
                timeSlotRepository, institutionRepository, timetableEntryRepository,
                allocationRepository, auditLogRepository, userRepository);

        sampleInstitution = new Institution();
        sampleInstitution.setId(1L);
        sampleInstitution.setName("Apex Institute");
        sampleInstitution.setCode("AIT");

        sampleCategory = new ResourceCategory();
        sampleCategory.setId(1L);
        sampleCategory.setName("Classrooms");
        sampleCategory.setResourceType(ResourceType.CLASSROOM);
        sampleCategory.setStatus("ACTIVE");

        sampleDepartment = new Department();
        sampleDepartment.setId(1L);
        sampleDepartment.setName("Computer Science");
        sampleDepartment.setCode("CSE");
    }

    // =========================================================================
    // 1. RESOURCE CATEGORY TESTS
    // =========================================================================

    @Test
    @DisplayName("Create Category with duplicate name throws ConflictException")
    void testCreateCategory_DuplicateName_ThrowsConflict() {
        CreateResourceCategoryRequest req = new CreateResourceCategoryRequest();
        req.setName("Classrooms");
        req.setResourceType(ResourceType.CLASSROOM);

        when(categoryRepository.existsByName("Classrooms")).thenReturn(true);

        assertThrows(ConflictException.class, () ->
                categoryService.createCategory(req, "admin", "127.0.0.1", "TestAgent"));
    }

    @Test
    @DisplayName("Delete Category with active resources throws ConflictException")
    void testDeleteCategory_WithResources_ThrowsConflict() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sampleCategory));
        when(resourceRepository.countByCategoryId(1L)).thenReturn(5L);

        assertThrows(ConflictException.class, () ->
                categoryService.deleteCategory(1L, "admin", "127.0.0.1", "TestAgent"));
    }

    // =========================================================================
    // 2. RESOURCE TESTS
    // =========================================================================

    @Test
    @DisplayName("Create Resource with duplicate code throws ConflictException")
    void testCreateResource_DuplicateCode_ThrowsConflict() {
        CreateResourceRequest req = new CreateResourceRequest();
        req.setCode("RES-001");
        req.setName("Lecture Hall 1");
        req.setCategoryId(1L);

        when(resourceRepository.existsByCode("RES-001")).thenReturn(true);

        assertThrows(ConflictException.class, () ->
                resourceService.createResource(req, "admin", "127.0.0.1", "TestAgent"));
    }

    @Test
    @DisplayName("Create Resource with non-positive capacity throws BadRequestException")
    void testCreateResource_InvalidCapacity_ThrowsBadRequest() {
        CreateResourceRequest req = new CreateResourceRequest();
        req.setCode("RES-001");
        req.setName("Lecture Hall 1");
        req.setCategoryId(1L);
        req.setCapacity(0);

        when(resourceRepository.existsByCode("RES-001")).thenReturn(false);

        assertThrows(BadRequestException.class, () ->
                resourceService.createResource(req, "admin", "127.0.0.1", "TestAgent"));
    }

    @Test
    @DisplayName("Delete Resource with active allocations throws ConflictException")
    void testDeleteResource_WithAllocations_ThrowsConflict() {
        Resource r = new Resource();
        r.setId(10L);
        r.setCode("RES-010");
        r.setName("Auditorium");

        when(resourceRepository.findById(10L)).thenReturn(Optional.of(r));
        when(allocationRepository.existsByResourceId(10L)).thenReturn(true);

        assertThrows(ConflictException.class, () ->
                resourceService.deleteResource(10L, "admin", "127.0.0.1", "TestAgent"));
    }

    // =========================================================================
    // 3. CLASSROOM TESTS
    // =========================================================================

    @Test
    @DisplayName("Create Classroom with duplicate room in building throws ConflictException")
    void testCreateClassroom_DuplicateRoom_ThrowsConflict() {
        CreateClassroomRequest req = new CreateClassroomRequest();
        req.setBuilding("Academic Block A");
        req.setRoomNumber("301");
        req.setCapacity(60);

        when(classroomRepository.existsByBuildingAndRoomNumber("Academic Block A", "301")).thenReturn(true);

        assertThrows(ConflictException.class, () ->
                classroomService.createClassroom(req, "admin", "127.0.0.1", "TestAgent"));
    }

    @Test
    @DisplayName("Create Classroom with capacity <= 0 throws BadRequestException")
    void testCreateClassroom_InvalidCapacity_ThrowsBadRequest() {
        CreateClassroomRequest req = new CreateClassroomRequest();
        req.setBuilding("Academic Block A");
        req.setRoomNumber("301");
        req.setCapacity(-5);

        assertThrows(BadRequestException.class, () ->
                classroomService.createClassroom(req, "admin", "127.0.0.1", "TestAgent"));
    }

    // =========================================================================
    // 4. LABORATORY TESTS
    // =========================================================================

    @Test
    @DisplayName("Create Laboratory referencing nonexistent department throws ResourceNotFoundException")
    void testCreateLaboratory_InvalidDepartment_ThrowsNotFound() {
        CreateLaboratoryRequest req = new CreateLaboratoryRequest();
        req.setBuilding("Science Wing");
        req.setRoomNumber("101");
        req.setCapacity(30);
        req.setDepartmentId(999L);

        when(laboratoryRepository.existsByBuildingAndRoomNumber("Science Wing", "101")).thenReturn(false);
        when(departmentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                laboratoryService.createLaboratory(req, "admin", "127.0.0.1", "TestAgent"));
    }

    // =========================================================================
    // 5. EQUIPMENT TESTS
    // =========================================================================

    @Test
    @DisplayName("Create Equipment with duplicate serial number throws ConflictException")
    void testCreateEquipment_DuplicateSerial_ThrowsConflict() {
        CreateEquipmentRequest req = new CreateEquipmentRequest();
        req.setSerialNumber("SN-98765");
        req.setQuantity(1);

        when(equipmentRepository.existsBySerialNumber("SN-98765")).thenReturn(true);

        assertThrows(ConflictException.class, () ->
                equipmentService.createEquipment(req, "admin", "127.0.0.1", "TestAgent"));
    }

    @Test
    @DisplayName("Create Equipment with quantity < 1 throws BadRequestException")
    void testCreateEquipment_InvalidQuantity_ThrowsBadRequest() {
        CreateEquipmentRequest req = new CreateEquipmentRequest();
        req.setSerialNumber("SN-12345");
        req.setQuantity(0);

        when(equipmentRepository.existsBySerialNumber("SN-12345")).thenReturn(false);

        assertThrows(BadRequestException.class, () ->
                equipmentService.createEquipment(req, "admin", "127.0.0.1", "TestAgent"));
    }

    // =========================================================================
    // 6. TIME SLOT TESTS
    // =========================================================================

    @Test
    @DisplayName("Create TimeSlot where start time >= end time throws BadRequestException")
    void testCreateTimeSlot_StartTimeAfterEndTime_ThrowsBadRequest() {
        CreateTimeSlotRequest req = new CreateTimeSlotRequest();
        req.setName("Invalid Slot");
        req.setDayOfWeek("MONDAY");
        req.setStartTime(LocalTime.of(10, 0));
        req.setEndTime(LocalTime.of(9, 0));

        assertThrows(BadRequestException.class, () ->
                timeSlotService.createTimeSlot(req, "admin", "127.0.0.1", "TestAgent"));
    }

    @Test
    @DisplayName("Delete TimeSlot with active timetable entries throws ConflictException")
    void testDeleteTimeSlot_WithTimetableEntries_ThrowsConflict() {
        TimeSlot slot = new TimeSlot();
        slot.setId(5L);
        slot.setName("Period 1");

        when(timeSlotRepository.findById(5L)).thenReturn(Optional.of(slot));
        when(timetableEntryRepository.existsByTimeSlotId(5L)).thenReturn(true);

        assertThrows(ConflictException.class, () ->
                timeSlotService.deleteTimeSlot(5L, "admin", "127.0.0.1", "TestAgent"));
    }
}
