package com.ahrao.service;

import com.ahrao.dto.common.PagedResponse;
import com.ahrao.dto.faculty.resource.*;
import com.ahrao.entity.academic.Department;
import com.ahrao.entity.academic.Faculty;
import com.ahrao.entity.academic.Subject;
import com.ahrao.entity.audit.AuditLog;
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
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.FacultySubjectAssignmentRepository;
import com.ahrao.repository.academic.SectionRepository;
import com.ahrao.repository.academic.SubjectRepository;
import com.ahrao.repository.audit.AuditLogRepository;
import com.ahrao.repository.request.AcademicResourceRequestRepository;
import com.ahrao.repository.resource.ResourceCategoryRepository;
import com.ahrao.repository.resource.ResourceRepository;
import com.ahrao.service.faculty.FacultyResourceRequestServiceImpl;
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
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FacultyResourceRequestServiceTest {

    @Mock
    private AcademicResourceRequestRepository requestRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private ResourceCategoryRepository categoryRepository;

    @Mock
    private FacultyRepository facultyRepository;

    @Mock
    private FacultySubjectAssignmentRepository assignmentRepository;

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private SectionRepository sectionRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private FacultyResourceRequestServiceImpl service;

    private User mockUser;
    private User otherUser;
    private Faculty mockFaculty;
    private Department mockDept;
    private ResourceCategory mockCategory;
    private Resource mockResource;
    private AcademicResourceRequest mockRequest;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(10L);
        mockUser.setFirstName("Barbara");
        mockUser.setLastName("Liskov");
        mockUser.setEmail("barbara.liskov@univ.edu");

        otherUser = new User();
        otherUser.setId(99L);

        mockDept = new Department();
        mockDept.setId(1L);
        mockDept.setName("Computer Science");

        mockFaculty = new Faculty();
        mockFaculty.setId(5L);
        mockFaculty.setUser(mockUser);
        mockFaculty.setDepartment(mockDept);
        mockFaculty.setEmployeeId("FAC-005");
        mockFaculty.setStatus("ACTIVE");

        mockCategory = new ResourceCategory();
        mockCategory.setId(2L);
        mockCategory.setName("Laboratories");

        mockResource = new Resource();
        mockResource.setId(50L);
        mockResource.setName("Advanced Computing Lab");
        mockResource.setCode("LAB-401");
        mockResource.setCategory(mockCategory);
        mockResource.setDepartment(mockDept);
        mockResource.setStatus(ResourceStatus.AVAILABLE);
        mockResource.setCapacity(60);

        mockRequest = new AcademicResourceRequest();
        mockRequest.setId(201L);
        mockRequest.setRequester(mockUser);
        mockRequest.setRequestedResource(mockResource);
        mockRequest.setCategory(mockCategory);
        mockRequest.setDepartment(mockDept);
        mockRequest.setPurpose("High Performance Computing Demo");
        mockRequest.setRequestedDate(LocalDate.now().plusDays(2));
        mockRequest.setStartTime(LocalTime.of(14, 0));
        mockRequest.setEndTime(LocalTime.of(16, 0));
        mockRequest.setQuantity(1);
        mockRequest.setPriority(PriorityLevel.HIGH);
        mockRequest.setStatus(RequestStatus.PENDING);
    }

    @Test
    @DisplayName("getMyRequests returns paged requests for authenticated faculty")
    void testGetMyRequests_Success() {
        Page<AcademicResourceRequest> page = new PageImpl<>(List.of(mockRequest));
        when(requestRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        PagedResponse<FacultyResourceRequestDto> response = service.getMyRequests(
                10L, null, null, null, null, 0, 10, "createdAt", "desc");

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals(201L, response.getContent().get(0).getId());
        assertEquals("Advanced Computing Lab", response.getContent().get(0).getResourceName());
    }

    @Test
    @DisplayName("getRequestById returns details when owned by authenticated faculty")
    void testGetRequestById_Owned_Success() {
        when(requestRepository.findById(201L)).thenReturn(Optional.of(mockRequest));
        when(facultyRepository.findByUserId(10L)).thenReturn(Optional.of(mockFaculty));

        FacultyResourceRequestDetailsDto details = service.getRequestById(10L, 201L);

        assertNotNull(details);
        assertEquals(201L, details.getId());
        assertTrue(details.isCancellable());
        assertEquals("FAC-005", details.getRequesterEmployeeId());
    }

    @Test
    @DisplayName("getRequestById throws ForbiddenException when accessed by another faculty")
    void testGetRequestById_NotOwner_ThrowsForbidden() {
        when(requestRepository.findById(201L)).thenReturn(Optional.of(mockRequest));

        assertThrows(ForbiddenException.class, () -> service.getRequestById(99L, 201L));
    }

    @Test
    @DisplayName("createRequest creates request successfully and logs audit event")
    void testCreateRequest_Success() {
        when(facultyRepository.findByUserId(10L)).thenReturn(Optional.of(mockFaculty));
        when(resourceRepository.findById(50L)).thenReturn(Optional.of(mockResource));
        when(requestRepository.existsByRequesterUserIdAndRequestedResourceIdAndRequestedDateAndStatus(
                10L, 50L, LocalDate.now().plusDays(2), RequestStatus.PENDING)).thenReturn(false);
        when(requestRepository.save(any(AcademicResourceRequest.class))).thenAnswer(invocation -> {
            AcademicResourceRequest entity = invocation.getArgument(0);
            entity.setId(301L);
            return entity;
        });

        CreateFacultyResourceRequest req = new CreateFacultyResourceRequest();
        req.setResourceId(50L);
        req.setPurpose("Algorithms Seminar");
        req.setRequestedDate(LocalDate.now().plusDays(2));
        req.setStartTime(LocalTime.of(9, 0));
        req.setEndTime(LocalTime.of(11, 0));
        req.setPriority(PriorityLevel.MEDIUM);

        FacultyResourceRequestDto result = service.createRequest(10L, req, "10.0.0.1", "Chrome");

        assertNotNull(result);
        assertEquals(301L, result.getId());
        assertEquals("Algorithms Seminar", result.getPurpose());
        assertEquals("PENDING", result.getStatus());

        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    @DisplayName("createRequest rejects request for inactive or maintenance resource")
    void testCreateRequest_ResourceInactive_ThrowsBadRequest() {
        mockResource.setStatus(ResourceStatus.MAINTENANCE);
        when(facultyRepository.findByUserId(10L)).thenReturn(Optional.of(mockFaculty));
        when(resourceRepository.findById(50L)).thenReturn(Optional.of(mockResource));

        CreateFacultyResourceRequest req = new CreateFacultyResourceRequest();
        req.setResourceId(50L);
        req.setPurpose("Test Purpose");
        req.setRequestedDate(LocalDate.now().plusDays(2));
        req.setStartTime(LocalTime.of(9, 0));
        req.setEndTime(LocalTime.of(11, 0));

        assertThrows(BadRequestException.class, () -> service.createRequest(10L, req, "10.0.0.1", "Chrome"));
        verify(requestRepository, never()).save(any());
    }

    @Test
    @DisplayName("createRequest rejects start time after end time")
    void testCreateRequest_InvalidTimeWindow_ThrowsBadRequest() {
        when(facultyRepository.findByUserId(10L)).thenReturn(Optional.of(mockFaculty));
        when(resourceRepository.findById(50L)).thenReturn(Optional.of(mockResource));

        CreateFacultyResourceRequest req = new CreateFacultyResourceRequest();
        req.setResourceId(50L);
        req.setPurpose("Test Purpose");
        req.setRequestedDate(LocalDate.now().plusDays(2));
        req.setStartTime(LocalTime.of(15, 0));
        req.setEndTime(LocalTime.of(14, 0)); // invalid: end before start

        assertThrows(BadRequestException.class, () -> service.createRequest(10L, req, "10.0.0.1", "Chrome"));
        verify(requestRepository, never()).save(any());
    }

    @Test
    @DisplayName("createRequest rejects duplicate pending request on same date")
    void testCreateRequest_DuplicatePending_ThrowsConflict() {
        when(facultyRepository.findByUserId(10L)).thenReturn(Optional.of(mockFaculty));
        when(resourceRepository.findById(50L)).thenReturn(Optional.of(mockResource));
        when(requestRepository.existsByRequesterUserIdAndRequestedResourceIdAndRequestedDateAndStatus(
                10L, 50L, LocalDate.now().plusDays(2), RequestStatus.PENDING)).thenReturn(true);

        CreateFacultyResourceRequest req = new CreateFacultyResourceRequest();
        req.setResourceId(50L);
        req.setPurpose("Test Purpose");
        req.setRequestedDate(LocalDate.now().plusDays(2));
        req.setStartTime(LocalTime.of(9, 0));
        req.setEndTime(LocalTime.of(11, 0));

        assertThrows(ConflictException.class, () -> service.createRequest(10L, req, "10.0.0.1", "Chrome"));
        verify(requestRepository, never()).save(any());
    }

    @Test
    @DisplayName("createRequest rejects subject if faculty is not assigned to it")
    void testCreateRequest_UnauthorizedSubject_ThrowsForbidden() {
        when(facultyRepository.findByUserId(10L)).thenReturn(Optional.of(mockFaculty));
        when(resourceRepository.findById(50L)).thenReturn(Optional.of(mockResource));

        Subject subject = new Subject();
        subject.setId(77L);
        subject.setCode("EE201");
        subject.setName("Circuits");

        when(subjectRepository.findById(77L)).thenReturn(Optional.of(subject));
        when(assignmentRepository.existsByFacultyIdAndSubjectId(mockFaculty.getId(), 77L)).thenReturn(false);

        CreateFacultyResourceRequest req = new CreateFacultyResourceRequest();
        req.setResourceId(50L);
        req.setPurpose("Circuits Lab");
        req.setRequestedDate(LocalDate.now().plusDays(2));
        req.setStartTime(LocalTime.of(9, 0));
        req.setEndTime(LocalTime.of(11, 0));
        req.setSubjectId(77L);

        assertThrows(ForbiddenException.class, () -> service.createRequest(10L, req, "10.0.0.1", "Chrome"));
        verify(requestRepository, never()).save(any());
    }

    @Test
    @DisplayName("cancelRequest successfully cancels PENDING request and logs audit event")
    void testCancelRequest_Pending_Success() {
        when(requestRepository.findById(201L)).thenReturn(Optional.of(mockRequest));
        when(requestRepository.save(any(AcademicResourceRequest.class))).thenAnswer(i -> i.getArgument(0));

        FacultyResourceRequestDto cancelled = service.cancelRequest(10L, 201L, "10.0.0.1", "Chrome");

        assertNotNull(cancelled);
        assertEquals("CANCELLED", cancelled.getStatus());
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    @DisplayName("cancelRequest throws BadRequestException when request is already APPROVED")
    void testCancelRequest_AlreadyApproved_ThrowsBadRequest() {
        mockRequest.setStatus(RequestStatus.APPROVED);
        when(requestRepository.findById(201L)).thenReturn(Optional.of(mockRequest));

        assertThrows(BadRequestException.class, () -> service.cancelRequest(10L, 201L, "10.0.0.1", "Chrome"));
        verify(requestRepository, never()).save(any());
    }

    @Test
    @DisplayName("cancelRequest throws ForbiddenException when non-owner attempts cancellation")
    void testCancelRequest_NotOwner_ThrowsForbidden() {
        when(requestRepository.findById(201L)).thenReturn(Optional.of(mockRequest));

        assertThrows(ForbiddenException.class, () -> service.cancelRequest(99L, 201L, "10.0.0.1", "Chrome"));
        verify(requestRepository, never()).save(any());
    }
}
