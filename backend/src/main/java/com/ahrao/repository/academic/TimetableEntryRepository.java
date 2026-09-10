package com.ahrao.repository.academic;

import com.ahrao.entity.academic.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableEntryRepository extends JpaRepository<TimetableEntry, Long> {
    List<TimetableEntry> findBySectionId(Long sectionId);
    List<TimetableEntry> findBySectionIdAndStatus(Long sectionId, String status);
    List<TimetableEntry> findBySectionIdAndSemesterId(Long sectionId, Long semesterId);
    List<TimetableEntry> findByFacultyId(Long facultyId);
    List<TimetableEntry> findByResourceId(Long resourceId);
    List<TimetableEntry> findByTimeSlotId(Long timeSlotId);
    List<TimetableEntry> findByAcademicYearIdAndSemesterId(Long academicYearId, Long semesterId);
    boolean existsByResourceId(Long resourceId);
    boolean existsByTimeSlotId(Long timeSlotId);
    long countByFacultyId(Long facultyId);
    long countByFacultyIdAndStatus(Long facultyId, String status);

    List<TimetableEntry> findByFacultyIdAndSubjectId(Long facultyId, Long subjectId);

    @org.springframework.data.jpa.repository.Query("SELECT te FROM TimetableEntry te " +
            "JOIN FETCH te.timeSlot ts " +
            "JOIN FETCH te.subject s " +
            "JOIN FETCH s.program p " +
            "LEFT JOIN FETCH te.section sec " +
            "LEFT JOIN FETCH te.resource r " +
            "LEFT JOIN FETCH r.category " +
            "LEFT JOIN FETCH te.academicYear ay " +
            "LEFT JOIN FETCH te.semester sem " +
            "WHERE te.faculty.id = :facultyId AND te.status = 'ACTIVE' " +
            "ORDER BY ts.startTime ASC")
    List<TimetableEntry> findActiveByFacultyIdWithDetails(
            @org.springframework.data.repository.query.Param("facultyId") Long facultyId);

    @org.springframework.data.jpa.repository.Query("SELECT te FROM TimetableEntry te " +
            "JOIN FETCH te.timeSlot ts " +
            "JOIN FETCH te.subject s " +
            "JOIN FETCH s.program p " +
            "LEFT JOIN FETCH te.section sec " +
            "LEFT JOIN FETCH te.resource r " +
            "LEFT JOIN FETCH r.category " +
            "LEFT JOIN FETCH te.academicYear ay " +
            "LEFT JOIN FETCH te.semester sem " +
            "WHERE te.faculty.id = :facultyId AND te.subject.id = :subjectId AND te.status = 'ACTIVE' " +
            "ORDER BY ts.startTime ASC")
    List<TimetableEntry> findActiveByFacultyIdAndSubjectIdWithDetails(
            @org.springframework.data.repository.query.Param("facultyId") Long facultyId,
            @org.springframework.data.repository.query.Param("subjectId") Long subjectId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(te) > 0 FROM TimetableEntry te " +
            "WHERE te.resource.id = :resourceId " +
            "AND te.status = 'ACTIVE' " +
            "AND UPPER(te.timeSlot.dayOfWeek) = UPPER(:dayOfWeek) " +
            "AND te.timeSlot.startTime < :endTime " +
            "AND te.timeSlot.endTime > :startTime")
    boolean existsOverlappingTimetableEntry(
            @org.springframework.data.repository.query.Param("resourceId") Long resourceId,
            @org.springframework.data.repository.query.Param("dayOfWeek") String dayOfWeek,
            @org.springframework.data.repository.query.Param("startTime") java.time.LocalTime startTime,
            @org.springframework.data.repository.query.Param("endTime") java.time.LocalTime endTime);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(te) > 0 FROM TimetableEntry te " +
            "WHERE te.section.id = :sectionId " +
            "AND te.status = 'ACTIVE' " +
            "AND UPPER(te.timeSlot.dayOfWeek) = UPPER(:dayOfWeek) " +
            "AND te.timeSlot.startTime < :endTime " +
            "AND te.timeSlot.endTime > :startTime")
    boolean existsOverlappingSectionTimetable(
            @org.springframework.data.repository.query.Param("sectionId") Long sectionId,
            @org.springframework.data.repository.query.Param("dayOfWeek") String dayOfWeek,
            @org.springframework.data.repository.query.Param("startTime") java.time.LocalTime startTime,
            @org.springframework.data.repository.query.Param("endTime") java.time.LocalTime endTime);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(te) > 0 FROM TimetableEntry te " +
            "WHERE te.faculty.id = :facultyId " +
            "AND te.status = 'ACTIVE' " +
            "AND UPPER(te.timeSlot.dayOfWeek) = UPPER(:dayOfWeek) " +
            "AND te.timeSlot.startTime < :endTime " +
            "AND te.timeSlot.endTime > :startTime")
    boolean existsOverlappingFacultyTimetable(
            @org.springframework.data.repository.query.Param("facultyId") Long facultyId,
            @org.springframework.data.repository.query.Param("dayOfWeek") String dayOfWeek,
            @org.springframework.data.repository.query.Param("startTime") java.time.LocalTime startTime,
            @org.springframework.data.repository.query.Param("endTime") java.time.LocalTime endTime);

    @org.springframework.data.jpa.repository.Query("SELECT te FROM TimetableEntry te " +
            "JOIN FETCH te.timeSlot ts " +
            "WHERE te.resource.id = :resourceId " +
            "AND te.status = 'ACTIVE' " +
            "AND UPPER(ts.dayOfWeek) = UPPER(:dayOfWeek) " +
            "AND ts.startTime < :endTime " +
            "AND ts.endTime > :startTime")
    List<TimetableEntry> findOverlappingTimetableEntries(
            @org.springframework.data.repository.query.Param("resourceId") Long resourceId,
            @org.springframework.data.repository.query.Param("dayOfWeek") String dayOfWeek,
            @org.springframework.data.repository.query.Param("startTime") java.time.LocalTime startTime,
            @org.springframework.data.repository.query.Param("endTime") java.time.LocalTime endTime);

    @org.springframework.data.jpa.repository.Query("SELECT te FROM TimetableEntry te " +
            "JOIN FETCH te.timeSlot ts " +
            "WHERE te.section.id = :sectionId " +
            "AND te.status = 'ACTIVE' " +
            "AND UPPER(ts.dayOfWeek) = UPPER(:dayOfWeek) " +
            "AND ts.startTime < :endTime " +
            "AND ts.endTime > :startTime")
    List<TimetableEntry> findOverlappingSectionTimetableEntries(
            @org.springframework.data.repository.query.Param("sectionId") Long sectionId,
            @org.springframework.data.repository.query.Param("dayOfWeek") String dayOfWeek,
            @org.springframework.data.repository.query.Param("startTime") java.time.LocalTime startTime,
            @org.springframework.data.repository.query.Param("endTime") java.time.LocalTime endTime);

    @org.springframework.data.jpa.repository.Query("SELECT te FROM TimetableEntry te " +
            "JOIN FETCH te.timeSlot ts " +
            "WHERE te.faculty.id = :facultyId " +
            "AND te.status = 'ACTIVE' " +
            "AND UPPER(ts.dayOfWeek) = UPPER(:dayOfWeek) " +
            "AND ts.startTime < :endTime " +
            "AND ts.endTime > :startTime")
    List<TimetableEntry> findOverlappingFacultyTimetableEntries(
            @org.springframework.data.repository.query.Param("facultyId") Long facultyId,
            @org.springframework.data.repository.query.Param("dayOfWeek") String dayOfWeek,
            @org.springframework.data.repository.query.Param("startTime") java.time.LocalTime startTime,
            @org.springframework.data.repository.query.Param("endTime") java.time.LocalTime endTime);
}

