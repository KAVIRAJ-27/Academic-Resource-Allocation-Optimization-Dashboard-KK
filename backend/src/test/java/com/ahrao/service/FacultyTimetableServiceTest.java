package com.ahrao.service;

import com.ahrao.dto.faculty.academic.FacultyTimetableEntryDto;
import com.ahrao.dto.faculty.academic.FacultyTimetableResponseDto;
import com.ahrao.entity.academic.*;
import com.ahrao.entity.enums.SubjectType;
import com.ahrao.entity.resource.Resource;
import com.ahrao.entity.resource.ResourceCategory;
import com.ahrao.exception.ResourceNotFoundException;
import com.ahrao.repository.academic.FacultyRepository;
import com.ahrao.repository.academic.TimetableEntryRepository;
import com.ahrao.service.faculty.FacultyTimetableServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FacultyTimetableServiceTest {

    @Mock
    private FacultyRepository facultyRepository;

    @Mock
    private TimetableEntryRepository timetableEntryRepository;

    @InjectMocks
    private FacultyTimetableServiceImpl facultyTimetableService;

    private Faculty testFaculty;
    private TimetableEntry todayEntry;
    private TimetableEntry otherEntry;

    @BeforeEach
    void setUp() {
        testFaculty = new Faculty();
        testFaculty.setId(50L);

        Subject subject = new Subject();
        subject.setId(301L);
        subject.setName("Computer Networks");
        subject.setCode("CS401");
        subject.setSubjectType(SubjectType.THEORY);

        Section section = new Section();
        section.setId(401L);
        section.setName("Section B");

        ResourceCategory category = new ResourceCategory();
        category.setId(10L);
        category.setName("Lecture Hall");

        Resource resource = new Resource();
        resource.setId(801L);
        resource.setName("Hall 201");
        resource.setCode("LH-201");
        resource.setLocation("Academic Block");
        resource.setCapacity(70);
        resource.setCategory(category);

        String currentDay = LocalDate.now().getDayOfWeek().name();
        String nextDay = LocalDate.now().getDayOfWeek().plus(1).name();

        TimeSlot slot1 = new TimeSlot();
        slot1.setId(901L);
        slot1.setDayOfWeek(currentDay);
        slot1.setStartTime(LocalTime.of(10, 0));
        slot1.setEndTime(LocalTime.of(11, 0));
        slot1.setName("Period 2");

        TimeSlot slot2 = new TimeSlot();
        slot2.setId(902L);
        slot2.setDayOfWeek(nextDay);
        slot2.setStartTime(LocalTime.of(14, 0));
        slot2.setEndTime(LocalTime.of(15, 0));
        slot2.setName("Period 5");

        todayEntry = new TimetableEntry();
        todayEntry.setId(701L);
        todayEntry.setFaculty(testFaculty);
        todayEntry.setSubject(subject);
        todayEntry.setSection(section);
        todayEntry.setResource(resource);
        todayEntry.setTimeSlot(slot1);
        todayEntry.setStatus("ACTIVE");

        otherEntry = new TimetableEntry();
        otherEntry.setId(702L);
        otherEntry.setFaculty(testFaculty);
        otherEntry.setSubject(subject);
        otherEntry.setSection(section);
        otherEntry.setResource(resource);
        otherEntry.setTimeSlot(slot2);
        otherEntry.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("getTimetable: Correctly separates today's entries and returns filtered timetable")
    void testGetTimetable_Success() {
        when(facultyRepository.findByUserId(101L)).thenReturn(Optional.of(testFaculty));
        when(timetableEntryRepository.findActiveByFacultyIdWithDetails(50L))
                .thenReturn(List.of(todayEntry, otherEntry));

        FacultyTimetableResponseDto response = facultyTimetableService.getTimetable(
                101L, null, null, null, false);

        assertNotNull(response);
        assertEquals(2, response.getTotalEntriesCount());
        assertEquals(1, response.getTodayEntriesCount());
        assertEquals(1, response.getTodayEntries().size());
        assertEquals("CS401", response.getTodayEntries().get(0).getSubjectCode());
        assertEquals(2, response.getEntries().size());
    }

    @Test
    @DisplayName("getTimetable: Filters by dayOfWeek accurately")
    void testGetTimetable_FilterByDay() {
        when(facultyRepository.findByUserId(101L)).thenReturn(Optional.of(testFaculty));
        when(timetableEntryRepository.findActiveByFacultyIdWithDetails(50L))
                .thenReturn(List.of(todayEntry, otherEntry));

        String currentDay = LocalDate.now().getDayOfWeek().name();
        FacultyTimetableResponseDto response = facultyTimetableService.getTimetable(
                101L, currentDay, null, null, false);

        assertNotNull(response);
        assertEquals(1, response.getEntries().size());
        assertEquals(currentDay, response.getEntries().get(0).getDayOfWeek());
    }

    @Test
    @DisplayName("getTodayClasses: Returns only classes scheduled for the current system date")
    void testGetTodayClasses_Success() {
        when(facultyRepository.findByUserId(101L)).thenReturn(Optional.of(testFaculty));
        when(timetableEntryRepository.findActiveByFacultyIdWithDetails(50L))
                .thenReturn(List.of(todayEntry, otherEntry));

        List<FacultyTimetableEntryDto> todayClasses = facultyTimetableService.getTodayClasses(101L);

        assertNotNull(todayClasses);
        assertEquals(1, todayClasses.size());
        assertEquals("CS401", todayClasses.get(0).getSubjectCode());
        assertEquals("Hall 201", todayClasses.get(0).getResourceName());
    }

    @Test
    @DisplayName("getTimetable: Returns clean empty schedule without NPE")
    void testGetTimetable_EmptySchedule() {
        when(facultyRepository.findByUserId(101L)).thenReturn(Optional.of(testFaculty));
        when(timetableEntryRepository.findActiveByFacultyIdWithDetails(50L))
                .thenReturn(Collections.emptyList());

        FacultyTimetableResponseDto response = facultyTimetableService.getTimetable(
                101L, null, null, null, false);

        assertNotNull(response);
        assertEquals(0, response.getTotalEntriesCount());
        assertEquals(0, response.getTodayEntriesCount());
        assertTrue(response.getTodayEntries().isEmpty());
        assertTrue(response.getEntries().isEmpty());
    }

    @Test
    @DisplayName("getTimetable: Throws ResourceNotFoundException when faculty profile is not found")
    void testGetTimetable_FacultyNotFound() {
        when(facultyRepository.findByUserId(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> facultyTimetableService.getTimetable(999L, null, null, null, false));
    }
}
