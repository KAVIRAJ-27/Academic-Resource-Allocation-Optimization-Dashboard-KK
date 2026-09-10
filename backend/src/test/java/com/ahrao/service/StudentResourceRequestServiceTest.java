package com.ahrao.service;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.student.resource.CreateStudentResourceRequest;
import com.ahrao.dto.student.resource.StudentResourceRequestDto;
import com.ahrao.dto.student.resource.StudentResourceRequestSummaryCountsDto;
import com.ahrao.dto.student.resource.StudentResourceSummaryDto;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Student;
import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.enums.RequestStatus;
import com.ahrao.entity.enums.ResourceStatus;
import com.ahrao.entity.request.AcademicResourceRequest;
import com.ahrao.entity.resource.Resource;
import com.ahrao.entity.resource.ResourceCategory;
import com.ahrao.entity.user.User;
import com.ahrao.exception.BadRequestException;
import com.ahrao.exception.ConflictException;
import com.ahrao.exception.ForbiddenException;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.StudentRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.resource.ResourceCategoryRepository;
import com.ahrao.repository.resource.ResourceRepository;
import com.ahrao.repository.user.UserRepository;
import com.ahrao.service.student.StudentResourceRequestServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentResourceRequestServiceTest {

    @Mock
    private AcademicResourceRequestRepository requestRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private ResourceCategoryRepository categoryRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private StudentResourceRequestServiceImpl service;

    private User mockUser;
    private User otherUser;
    private Student mockStudent;
    private Department mockDept;
    private ResourceCategory mockCategory;
    private Resource mockResource;
    private AcademicResourceRequest mockRequest;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(10L);
        mockUser.setUsername("alex_student");
        mockUser.setFirstName("Alex");
        mockUser.setLastName("Mercer");
        mockUser.setEmail("alex@univ.edu");

        otherUser = new User();
        otherUser.setId(20L);
        otherUser.setUsername("bob_student");
        otherUser.setFirstName("Bob");
        otherUser.setLastName("Smith");

        mockDept = new Department();
        mockDept.setId(1L);
        mockDept.setName("Computer Science and Engineering");
        mockDept.setCode("CSE");

        mockCategory = new ResourceCategory();
        mockCategory.setId(5L);
        mockCategory.setName("Laboratory");

        mockResource = new Resource();
        mockResource.setId(100L);
        mockResource.setName("AI Computing Lab");
        mockResource.setCode("LAB-AI-01");
        mockResource.setCategory(mockCategory);
        mockResource.setDepartment(mockDept);
        mockResource.setStatus(ResourceStatus.AVAILABLE);
        mockResource.setCapacity(40);
        mockResource.setLocation("Tech Block 3rd Floor");

        mockStudent = new Student();
        mockStudent.setId(1L);
        mockStudent.setUser(mockUser);
        mockStudent.setDepartment(mockDept);
        mockStudent.setStatus("ACTIVE");

        mockRequest = new AcademicResourceRequest();
        mockRequest.setId(500L);
        mockRequest.setRequester(mockUser);
        mockRequest.setRequestedResource(mockResource);
        mockRequest.setCategory(mockCategory);
        mockRequest.setDepartment(mockDept);
        mockRequest.setRequestedDate(LocalDate.now().plusDays(2));
        mockRequest.setStartTime(LocalTime.of(10, 0));
        mockRequest.setEndTime(LocalTime.of(12, 0));
        mockRequest.setPurpose("Machine Learning project benchmark");
        mockRequest.setPriority(PriorityLevel.HIGH);
        mockRequest.setStatus(RequestStatus.PENDING);
    }

    @Test
    @DisplayName("getMyRequests should return paged student requests")
    void testGetMyRequests() {
        Page<AcademicResourceRequest> page = new PageImpl<>(List.of(mockRequest));
        when(requestRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        PagedResponse<StudentResourceRequestDto> response = service.getMyRequests(
                10L, null, null, null, null, 0, 10, "createdAt", "desc");

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals(500L, response.getContent().get(0).getId());
        assertEquals("AI Computing Lab", response.getContent().get(0).getResourceName());
        assertEquals(RequestStatus.PENDING, response.getContent().get(0).getStatus());
    }

    @Test
    @DisplayName("getRequestById should return DTO when student owns the request")
    void testGetRequestByIdSuccess() {
        when(requestRepository.findById(500L)).thenReturn(Optional.of(mockRequest));

        StudentResourceRequestDto dto = service.getRequestById(10L, 500L);

        assertNotNull(dto);
        assertEquals(500L, dto.getId());
        assertEquals(10L, dto.getRequesterUserId());
        assertEquals("Alex Mercer", dto.getRequesterName());
        assertEquals("AI Computing Lab", dto.getResourceName());
    }

    @Test
    @DisplayName("getRequestById should throw ForbiddenException when request belongs to another student")
    void testGetRequestByIdForbidden() {
        when(requestRepository.findById(500L)).thenReturn(Optional.of(mockRequest));

        assertThrows(ForbiddenException.class, () -> service.getRequestById(20L, 500L));
    }

    @Test
    @DisplayName("getRequestById should throw ResourceNotFoundException when request not found")
    void testGetRequestByIdNotFound() {
        when(requestRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getRequestById(10L, 999L));
    }

    @Test
    @DisplayName("createRequest should successfully save request and record audit log")
    void testCreateRequestSuccess() {
        CreateStudentResourceRequest createReq = new CreateStudentResourceRequest();
        createReq.setResourceId(100L);
        createReq.setRequestedDate(LocalDate.now().plusDays(3));
        createReq.setStartTime(LocalTime.of(14, 0));
        createReq.setEndTime(LocalTime.of(16, 0));
        createReq.setPurpose("Capstone team testing session");
        createReq.setPriority(PriorityLevel.MEDIUM);

        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));
        when(resourceRepository.findById(100L)).thenReturn(Optional.of(mockResource));
        when(requestRepository.existsByRequesterUserIdAndRequestedResourceIdAndRequestedDateAndStatus(
                10L, 100L, createReq.getRequestedDate(), RequestStatus.PENDING)).thenReturn(false);

        when(requestRepository.save(any(AcademicResourceRequest.class))).thenAnswer(invocation -> {
            AcademicResourceRequest entity = invocation.getArgument(0);
            entity.setId(501L);
            return entity;
        });

        StudentResourceRequestDto result = service.createRequest(10L, createReq, "127.0.0.1", "TestAgent");

        assertNotNull(result);
        assertEquals(501L, result.getId());
        assertEquals(RequestStatus.PENDING, result.getStatus());
        assertEquals("AI Computing Lab", result.getResourceName());
        verify(requestRepository, times(1)).save(any(AcademicResourceRequest.class));
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("createRequest should throw ConflictException if duplicate pending request exists")
    void testCreateRequestDuplicateConflict() {
        CreateStudentResourceRequest createReq = new CreateStudentResourceRequest();
        createReq.setResourceId(100L);
        createReq.setRequestedDate(LocalDate.now().plusDays(3));
        createReq.setStartTime(LocalTime.of(14, 0));
        createReq.setEndTime(LocalTime.of(16, 0));
        createReq.setPurpose("Capstone team testing session");

        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));
        when(resourceRepository.findById(100L)).thenReturn(Optional.of(mockResource));
        when(requestRepository.existsByRequesterUserIdAndRequestedResourceIdAndRequestedDateAndStatus(
                10L, 100L, createReq.getRequestedDate(), RequestStatus.PENDING)).thenReturn(true);

        assertThrows(ConflictException.class, () -> service.createRequest(10L, createReq, "127.0.0.1", "TestAgent"));
        verify(requestRepository, never()).save(any());
    }

    @Test
    @DisplayName("createRequest should throw BadRequestException if date is in the past")
    void testCreateRequestPastDate() {
        CreateStudentResourceRequest createReq = new CreateStudentResourceRequest();
        createReq.setResourceId(100L);
        createReq.setRequestedDate(LocalDate.now().minusDays(1));
        createReq.setStartTime(LocalTime.of(14, 0));
        createReq.setEndTime(LocalTime.of(16, 0));
        createReq.setPurpose("Past date test");

        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));
        when(resourceRepository.findById(100L)).thenReturn(Optional.of(mockResource));

        assertThrows(BadRequestException.class, () -> service.createRequest(10L, createReq, "127.0.0.1", "TestAgent"));
    }

    @Test
    @DisplayName("createRequest should throw BadRequestException if endTime is before or equal to startTime")
    void testCreateRequestInvalidTimeRange() {
        CreateStudentResourceRequest createReq = new CreateStudentResourceRequest();
        createReq.setResourceId(100L);
        createReq.setRequestedDate(LocalDate.now().plusDays(1));
        createReq.setStartTime(LocalTime.of(16, 0));
        createReq.setEndTime(LocalTime.of(14, 0));
        createReq.setPurpose("Invalid time test");

        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));
        when(resourceRepository.findById(100L)).thenReturn(Optional.of(mockResource));

        assertThrows(BadRequestException.class, () -> service.createRequest(10L, createReq, "127.0.0.1", "TestAgent"));
    }

    @Test
    @DisplayName("createRequest should throw BadRequestException if resource is INACTIVE")
    void testCreateRequestInactiveResource() {
        mockResource.setStatus(ResourceStatus.INACTIVE);

        CreateStudentResourceRequest createReq = new CreateStudentResourceRequest();
        createReq.setResourceId(100L);
        createReq.setRequestedDate(LocalDate.now().plusDays(1));
        createReq.setStartTime(LocalTime.of(10, 0));
        createReq.setEndTime(LocalTime.of(12, 0));
        createReq.setPurpose("Inactive resource test");

        when(studentRepository.findByUserId(10L)).thenReturn(Optional.of(mockStudent));
        when(resourceRepository.findById(100L)).thenReturn(Optional.of(mockResource));

        assertThrows(BadRequestException.class, () -> service.createRequest(10L, createReq, "127.0.0.1", "TestAgent"));
    }

    @Test
    @DisplayName("cancelRequest should succeed for PENDING request owned by student")
    void testCancelRequestSuccess() {
        when(requestRepository.findById(500L)).thenReturn(Optional.of(mockRequest));
        when(requestRepository.save(any(AcademicResourceRequest.class))).thenAnswer(i -> i.getArgument(0));

        StudentResourceRequestDto result = service.cancelRequest(10L, 500L, "127.0.0.1", "TestAgent");

        assertNotNull(result);
        assertEquals(RequestStatus.CANCELLED, result.getStatus());
        verify(requestRepository, times(1)).save(mockRequest);
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("cancelRequest should throw ForbiddenException when cancelling another student's request")
    void testCancelRequestForbidden() {
        when(requestRepository.findById(500L)).thenReturn(Optional.of(mockRequest));

        assertThrows(ForbiddenException.class, () -> service.cancelRequest(20L, 500L, "127.0.0.1", "TestAgent"));
        verify(requestRepository, never()).save(any());
    }

    @Test
    @DisplayName("cancelRequest should throw BadRequestException when request is not PENDING")
    void testCancelRequestNonPending() {
        mockRequest.setStatus(RequestStatus.APPROVED);
        when(requestRepository.findById(500L)).thenReturn(Optional.of(mockRequest));

        assertThrows(BadRequestException.class, () -> service.cancelRequest(10L, 500L, "127.0.0.1", "TestAgent"));
        verify(requestRepository, never()).save(any());
    }

    @Test
    @DisplayName("getRequestCounts should return accurate counts from repository")
    void testGetRequestCounts() {
        when(requestRepository.countByRequesterUserId(10L)).thenReturn(10L);
        when(requestRepository.countByRequesterUserIdAndStatus(10L, RequestStatus.PENDING)).thenReturn(4L);
        when(requestRepository.countByRequesterUserIdAndStatus(10L, RequestStatus.APPROVED)).thenReturn(3L);
        when(requestRepository.countByRequesterUserIdAndStatus(10L, RequestStatus.REJECTED)).thenReturn(1L);
        when(requestRepository.countByRequesterUserIdAndStatus(10L, RequestStatus.CANCELLED)).thenReturn(2L);
        when(requestRepository.countByRequesterUserIdAndStatus(10L, RequestStatus.COMPLETED)).thenReturn(0L);

        StudentResourceRequestSummaryCountsDto counts = service.getRequestCounts(10L);

        assertNotNull(counts);
        assertEquals(10L, counts.getTotal());
        assertEquals(4L, counts.getPending());
        assertEquals(3L, counts.getApproved());
        assertEquals(1L, counts.getRejected());
        assertEquals(2L, counts.getCancelled());
        assertEquals(0L, counts.getCompleted());
    }

    @Test
    @DisplayName("getAvailableResources should return resources eligible for requests")
    void testGetAvailableResources() {
        when(resourceRepository.findAll(any(Specification.class), any(Sort.class))).thenReturn(List.of(mockResource));

        List<StudentResourceSummaryDto> resources = service.getAvailableResources(10L, null);

        assertNotNull(resources);
        assertEquals(1, resources.size());
        assertEquals("AI Computing Lab", resources.get(0).getName());
        assertEquals("Laboratory", resources.get(0).getCategoryName());
    }
}
