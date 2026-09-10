package com.ahrao.service;

import com.ahrao.dto.hod.resource.HodResourceAllocationDetailDto;
import com.ahrao.dto.hod.resource.HodResourceAllocationOverviewKpiDto;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.allocation.ResourceAllocation;
import com.ahrao.entity.enums.AllocationStatus;
import com.ahrao.entity.resource.Resource;
import com.ahrao.entity.user.User;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.repository.allocation.ResourceAllocationRepository;
import com.ahrao.service.hod.HodDepartmentResolver;
import com.ahrao.service.hod.HodResourceAllocationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HodResourceAllocationServiceTest {

    @Mock
    private HodDepartmentResolver departmentResolver;

    @Mock
    private ResourceAllocationRepository allocationRepository;

    @InjectMocks
    private HodResourceAllocationServiceImpl service;

    private static final Long HOD_USER_ID = 101L;

    private Department deptA;
    private Department deptB;
    private User allocatedUser;

    @BeforeEach
    void setUp() {
        deptA = new Department();
        deptA.setId(10L);
        deptA.setName("Computer Science");

        deptB = new Department();
        deptB.setId(20L);
        deptB.setName("Civil Engineering");

        allocatedUser = new User();
        allocatedUser.setId(301L);
        allocatedUser.setFirstName("Grace");
        allocatedUser.setLastName("Hopper");
        allocatedUser.setEmail("hopper@univ.edu");
    }

    @Test
    @DisplayName("HOD can view allocation details for own department")
    void testGetAllocationDetails_OwnDepartment_Success() {
        when(departmentResolver.resolveHodDepartment(HOD_USER_ID)).thenReturn(deptA);

        ResourceAllocation allocation = new ResourceAllocation();
        allocation.setId(45L);
        allocation.setDepartment(deptA);
        allocation.setAllocatedToUser(allocatedUser);
        allocation.setPurpose("Compilers lab session");
        allocation.setStartDatetime(Instant.now());
        allocation.setEndDatetime(Instant.now().plusSeconds(7200));
        allocation.setStatus(AllocationStatus.ACTIVE);

        Resource r = new Resource();
        r.setId(12L);
        r.setName("Advanced Systems Lab");
        r.setCode("LAB-CS-101");
        allocation.setResource(r);

        when(allocationRepository.findById(45L)).thenReturn(Optional.of(allocation));

        HodResourceAllocationDetailDto result = service.getAllocationDetails(HOD_USER_ID, 45L);

        assertNotNull(result);
        assertEquals(45L, result.getId());
        assertEquals("Advanced Systems Lab", result.getResourceName());
        assertEquals("Compilers lab session", result.getPurpose());
        assertEquals("Computer Science", result.getDepartmentName());
    }

    @Test
    @DisplayName("HOD cannot view allocation details belonging to another department (403 Forbidden)")
    void testGetAllocationDetails_ForeignDepartment_Forbidden() {
        when(departmentResolver.resolveHodDepartment(HOD_USER_ID)).thenReturn(deptA);

        ResourceAllocation allocation = new ResourceAllocation();
        allocation.setId(88L);
        allocation.setDepartment(deptB); // Civil Eng

        when(allocationRepository.findById(88L)).thenReturn(Optional.of(allocation));

        assertThrows(ForbiddenException.class, () -> service.getAllocationDetails(HOD_USER_ID, 88L));
    }

    @Test
    @DisplayName("HOD allocation summary returns real database metrics")
    void testGetAllocationSummary_Success() {
        when(departmentResolver.resolveHodDepartment(HOD_USER_ID)).thenReturn(deptA);

        when(allocationRepository.countByDepartmentId(10L)).thenReturn(30L);
        when(allocationRepository.countByDepartmentIdAndStatus(10L, AllocationStatus.ACTIVE)).thenReturn(18L);
        when(allocationRepository.countByDepartmentIdAndStatus(10L, AllocationStatus.PENDING)).thenReturn(4L);
        when(allocationRepository.countByDepartmentIdAndStatus(10L, AllocationStatus.COMPLETED)).thenReturn(8L);

        HodResourceAllocationOverviewKpiDto summary = service.getAllocationSummary(HOD_USER_ID);

        assertNotNull(summary);
        assertEquals(30L, summary.getTotalAllocations());
        assertEquals(18L, summary.getActiveAllocations());
        assertEquals(4L, summary.getPendingAllocations());
        assertEquals(8L, summary.getCompletedAllocations());
    }
}
