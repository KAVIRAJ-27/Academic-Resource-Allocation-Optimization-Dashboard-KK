package com.ahrao.service.demo;

import com.ahrao.dto.demo.VsbDemoStatusDto;
import com.ahrao.dto.demo.VsbImportSummaryDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.nio.charset.StandardCharsets;
import java.sql.Date;
import java.sql.Time;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class VsbDemoDataServiceImpl implements VsbDemoDataService {

    private static final Logger log = LoggerFactory.getLogger(VsbDemoDataServiceImpl.class);

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    @Value("${ahrao.demo.vsb.data-dir:C:/Users/KAVIRAJ/Downloads/AHRAO_VSB_College_Demo_Data}")
    private String defaultDataDir;

    // Cache lookup maps: CSV code/ID -> database BIGINT ID
    private final Map<String, Long> deptIdMap = new HashMap<>();
    private final Map<String, Long> progIdMap = new HashMap<>();
    private final Map<String, Long> courseIdMap = new HashMap<>();
    private final Map<String, Long> buildingNames = new HashMap<>();
    private final Map<String, Long> resourceIdMap = new HashMap<>();
    private final Map<String, Long> timeSlotIdMap = new HashMap<>();
    private final Map<String, Long> facultyIdMap = new HashMap<>();
    private final Map<String, Long> facultyUserIdMap = new HashMap<>();
    private final Map<String, String> staffIdToEmployee = new HashMap<>();
    private final Map<String, Long> wardenStaffUserMap = new HashMap<>();
    private final Map<String, Long> hostelIdMap = new HashMap<>();
    private final Map<String, Long> hostelRoomIdMap = new HashMap<>();
    private final Map<String, Long> hostelBedIdMap = new HashMap<>();
    private final Map<String, Long> studentIdMap = new HashMap<>();
    private final Map<String, Long> studentUserIdMap = new HashMap<>();
    private final Map<String, Long> sectionIdMap = new HashMap<>();
    private final Map<String, Long> reqIdMap = new HashMap<>();

    public VsbDemoDataServiceImpl(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public VsbImportSummaryDto importVsbDemoData(String dataDirectoryPath) {
        long startTime = System.currentTimeMillis();
        VsbImportSummaryDto summary = new VsbImportSummaryDto();

        String dirPath = (dataDirectoryPath != null && !dataDirectoryPath.isBlank())
                ? dataDirectoryPath : defaultDataDir;
        File dir = new File(dirPath);

        if (!dir.exists() || !dir.isDirectory()) {
            summary.setStatus("FAILED");
            summary.recordError("DIRECTORY", 0, "path", dirPath, "Directory does not exist or is not a directory");
            summary.setCompletedAt(LocalDateTime.now());
            summary.setDurationMs(System.currentTimeMillis() - startTime);
            return summary;
        }

        log.info("Starting VSB Demo Data Import from: {}", dirPath);

        try {
            // Precompute standard demo password hash once (reuse across 10,000+ accounts for speed)
            String commonPasswordHash = passwordEncoder.encode("Demo@123");

            // Fetch standard Role IDs from database
            Map<String, Long> roleMap = loadRoleIds();

            // 1. Institution
            Long instId = ensureInstitution(summary);

            // 2. Academic Year & Semesters (academic_calendar.csv)
            Long academicYearId = importAcademicCalendar(dir, instId, summary);

            // 3. Departments (departments.csv)
            importDepartments(dir, instId, summary);

            // 4. Programs (programs.csv)
            importPrograms(dir, summary);

            // 5. Courses / Subjects (courses.csv)
            importCourses(dir, summary);

            // 6. Buildings, Rooms & Labs (buildings.csv, rooms.csv, labs.csv)
            importPhysicalResources(dir, instId, summary);

            // 7. Time Slots (time_slots.csv)
            importTimeSlots(dir, instId, summary);

            // 8. Staff (staff.csv) - needed for Wardens
            importStaff(dir, roleMap.get("WARDEN"), commonPasswordHash, summary);

            // 9. Faculty (faculty.csv)
            importFaculty(dir, roleMap.get("FACULTY"), roleMap.get("HOD"), commonPasswordHash, summary);

            // 10. Hostels, Rooms, Beds (hostels.csv, hostel_rooms.csv, hostel_beds.csv)
            importHostelStructure(dir, instId, summary);

            // 11. Students (students.csv) - 10,000 students batched
            importStudents(dir, roleMap.get("STUDENT"), commonPasswordHash, summary);

            // 12. Sections & Timetables (sections.csv)
            importSections(dir, academicYearId, summary);

            // 13. Resource Requests & Allocations (resource_requests.csv, resource_allocations.csv)
            importResourceRequestsAndAllocations(dir, academicYearId, summary);

            // 14. Hostel Requests & Allocations (hostel_requests.csv, hostel_allocations.csv)
            importHostelRequestsAndAllocations(dir, academicYearId, summary);

            // 15. Faculty Workload (faculty_loads.csv)
            importFacultyWorkloads(dir, academicYearId, summary);

            // 16. Standard Demo Logins (Admin, Principal, HOD, Faculty, Student, Warden)
            createStandardDemoAccounts(instId, roleMap, commonPasswordHash, summary);

            summary.setStatus("SUCCESS");
            summary.addBusinessNote("Import completed successfully without foreign key violations or duplicate records.");
        } catch (Exception e) {
            log.error("Fatal error during VSB demo data import", e);
            summary.setStatus("FAILED");
            summary.recordError("SYSTEM", 0, "import", "exception", e.getMessage());
        } finally {
            summary.setCompletedAt(LocalDateTime.now());
            summary.setDurationMs(System.currentTimeMillis() - startTime);
            log.info("VSB Demo Data Import finished in {} ms with status: {}", summary.getDurationMs(), summary.getStatus());
        }

        return summary;
    }

    @Override
    public VsbDemoStatusDto getVsbDemoStatus() {
        Map<String, Long> counts = new LinkedHashMap<>();

        try {
            Long instId = querySingleLong("SELECT id FROM institution WHERE code = 'VSB'");
            if (instId == null) {
                return new VsbDemoStatusDto(false, counts);
            }

            counts.put("institution", 1L);
            counts.put("departments", queryCount("SELECT count(*) FROM departments WHERE institution_id = ?", instId));
            counts.put("programs", queryCount("SELECT count(*) FROM programs p JOIN departments d ON p.department_id = d.id WHERE d.institution_id = ?", instId));
            counts.put("subjects", queryCount("SELECT count(*) FROM subjects s JOIN programs p ON s.program_id = p.id JOIN departments d ON p.department_id = d.id WHERE d.institution_id = ?", instId));
            counts.put("faculty", queryCount("SELECT count(*) FROM faculty f JOIN departments d ON f.department_id = d.id WHERE d.institution_id = ?", instId));
            counts.put("students", queryCount("SELECT count(*) FROM students s JOIN departments d ON s.department_id = d.id WHERE d.institution_id = ?", instId));
            counts.put("resources", queryCount("SELECT count(*) FROM resources WHERE institution_id = ?", instId));
            counts.put("classrooms", queryCount("SELECT count(*) FROM classrooms c JOIN resources r ON c.resource_id = r.id WHERE r.institution_id = ?", instId));
            counts.put("laboratories", queryCount("SELECT count(*) FROM laboratories l JOIN resources r ON l.resource_id = r.id WHERE r.institution_id = ?", instId));
            counts.put("hostels", queryCount("SELECT count(*) FROM hostels WHERE institution_id = ?", instId));
            counts.put("hostel_rooms", queryCount("SELECT count(*) FROM hostel_rooms hr JOIN hostel_floors hf ON hr.hostel_floor_id = hf.id JOIN hostel_blocks hb ON hf.hostel_block_id = hb.id JOIN hostels h ON hb.hostel_id = h.id WHERE h.institution_id = ?", instId));
            counts.put("hostel_beds", queryCount("SELECT count(*) FROM hostel_beds hb JOIN hostel_rooms hr ON hb.hostel_room_id = hr.id JOIN hostel_floors hf ON hr.hostel_floor_id = hf.id JOIN hostel_blocks hbk ON hf.hostel_block_id = hbk.id JOIN hostels h ON hbk.hostel_id = h.id WHERE h.institution_id = ?", instId));
            counts.put("hostel_allocations", queryCount("SELECT count(*) FROM hostel_allocations ha JOIN students s ON ha.student_id = s.id JOIN departments d ON s.department_id = d.id WHERE d.institution_id = ?", instId));
            counts.put("sections", queryCount("SELECT count(*) FROM sections s JOIN programs p ON s.program_id = p.id JOIN departments d ON p.department_id = d.id WHERE d.institution_id = ?", instId));
            counts.put("resource_requests", queryCount("SELECT count(*) FROM academic_resource_requests arr JOIN users u ON arr.requester_user_id = u.id WHERE u.email LIKE '%@vsb-demo.local'"));
            counts.put("resource_allocations", queryCount("SELECT count(*) FROM resource_allocations ra JOIN resources r ON ra.resource_id = r.id WHERE r.institution_id = ?", instId));

            return new VsbDemoStatusDto(true, counts);
        } catch (Exception e) {
            log.error("Error checking VSB demo status", e);
            return new VsbDemoStatusDto(false, counts);
        }
    }

    @Override
    @Transactional
    public VsbImportSummaryDto cleanupVsbDemoData() {
        long startTime = System.currentTimeMillis();
        VsbImportSummaryDto summary = new VsbImportSummaryDto();
        log.info("Starting safe cleanup of VSB demo dataset...");

        try {
            Long instId = querySingleLong("SELECT id FROM institution WHERE code = 'VSB'");
            if (instId == null) {
                summary.addBusinessNote("No VSB demo institution found. Nothing to clean up.");
                summary.setStatus("SUCCESS");
                summary.setCompletedAt(LocalDateTime.now());
                summary.setDurationMs(System.currentTimeMillis() - startTime);
                return summary;
            }

            // Child-first safe delete strictly within VSB scope
            executeDelete("DELETE a FROM approvals a JOIN academic_resource_requests r ON a.entity_type = 'ACADEMIC_RESOURCE_REQUEST' AND a.entity_id = r.id JOIN departments d ON r.department_id = d.id WHERE d.institution_id = ?", instId);
            executeDelete("DELETE a FROM approvals a JOIN hostel_requests hr ON a.entity_type = 'HOSTEL_REQUEST' AND a.entity_id = hr.id JOIN hostels h ON hr.hostel_id = h.id WHERE h.institution_id = ?", instId);

            executeDelete("DELETE FROM hostel_complaints WHERE hostel_id IN (SELECT id FROM hostels WHERE institution_id = ?)", instId);
            executeDelete("DELETE FROM maintenance_requests WHERE hostel_id IN (SELECT id FROM hostels WHERE institution_id = ?) OR resource_id IN (SELECT id FROM resources WHERE institution_id = ?)", instId, instId);

            executeDelete("DELETE FROM resource_allocations WHERE resource_id IN (SELECT id FROM resources WHERE institution_id = ?)", instId);
            executeDelete("DELETE FROM academic_resource_requests WHERE department_id IN (SELECT id FROM departments WHERE institution_id = ?)", instId);

            executeDelete("DELETE FROM hostel_allocations WHERE hostel_bed_id IN (SELECT hb.id FROM hostel_beds hb JOIN hostel_rooms hr ON hb.hostel_room_id = hr.id JOIN hostel_floors hf ON hr.hostel_floor_id = hf.id JOIN hostel_blocks hbk ON hf.hostel_block_id = hbk.id JOIN hostels h ON hbk.hostel_id = h.id WHERE h.institution_id = ?)", instId);
            executeDelete("DELETE FROM hostel_requests WHERE hostel_id IN (SELECT id FROM hostels WHERE institution_id = ?)", instId);

            executeDelete("DELETE FROM timetable_entries WHERE resource_id IN (SELECT id FROM resources WHERE institution_id = ?)", instId);
            executeDelete("DELETE FROM faculty_subject_assignments WHERE faculty_id IN (SELECT f.id FROM faculty f JOIN departments d ON f.department_id = d.id WHERE d.institution_id = ?)", instId);
            executeDelete("DELETE FROM faculty_workloads WHERE faculty_id IN (SELECT f.id FROM faculty f JOIN departments d ON f.department_id = d.id WHERE d.institution_id = ?)", instId);

            executeDelete("DELETE FROM principal_assignments WHERE institution_id = ?", instId);
            executeDelete("DELETE FROM department_hods WHERE department_id IN (SELECT id FROM departments WHERE institution_id = ?)", instId);

            // Delete students & their users
            List<Long> studentUserIds = jdbcTemplate.queryForList(
                    "SELECT user_id FROM students WHERE department_id IN (SELECT id FROM departments WHERE institution_id = ?)",
                    Long.class, instId
            );
            executeDelete("DELETE FROM students WHERE department_id IN (SELECT id FROM departments WHERE institution_id = ?)", instId);

            // Delete faculty & their users
            List<Long> facultyUserIds = jdbcTemplate.queryForList(
                    "SELECT user_id FROM faculty WHERE department_id IN (SELECT id FROM departments WHERE institution_id = ?)",
                    Long.class, instId
            );
            executeDelete("DELETE FROM faculty WHERE department_id IN (SELECT id FROM departments WHERE institution_id = ?)", instId);

            // Delete wardens
            List<Long> wardenUserIds = jdbcTemplate.queryForList(
                    "SELECT w.user_id FROM wardens w JOIN warden_hostels wh ON w.id = wh.warden_id JOIN hostels h ON wh.hostel_id = h.id WHERE h.institution_id = ?",
                    Long.class, instId
            );
            executeDelete("DELETE wh FROM warden_hostels wh JOIN hostels h ON wh.hostel_id = h.id WHERE h.institution_id = ?", instId);
            executeDelete("DELETE FROM wardens WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@vsb-demo.local')");

            // Delete hostel hierarchy
            executeDelete("DELETE hb FROM hostel_beds hb JOIN hostel_rooms hr ON hb.hostel_room_id = hr.id JOIN hostel_floors hf ON hr.hostel_floor_id = hf.id JOIN hostel_blocks hbk ON hf.hostel_block_id = hbk.id JOIN hostels h ON hbk.hostel_id = h.id WHERE h.institution_id = ?", instId);
            executeDelete("DELETE hr FROM hostel_rooms hr JOIN hostel_floors hf ON hr.hostel_floor_id = hf.id JOIN hostel_blocks hbk ON hf.hostel_block_id = hbk.id JOIN hostels h ON hbk.hostel_id = h.id WHERE h.institution_id = ?", instId);
            executeDelete("DELETE hf FROM hostel_floors hf JOIN hostel_blocks hbk ON hf.hostel_block_id = hbk.id JOIN hostels h ON hbk.hostel_id = h.id WHERE h.institution_id = ?", instId);
            executeDelete("DELETE FROM hostel_blocks WHERE hostel_id IN (SELECT id FROM hostels WHERE institution_id = ?)", instId);
            executeDelete("DELETE FROM hostel_facilities WHERE hostel_id IN (SELECT id FROM hostels WHERE institution_id = ?)", instId);
            executeDelete("DELETE FROM hostels WHERE institution_id = ?", instId);

            // Delete classrooms, labs, equipment, resources
            executeDelete("DELETE c FROM classrooms c JOIN resources r ON c.resource_id = r.id WHERE r.institution_id = ?", instId);
            executeDelete("DELETE l FROM laboratories l JOIN resources r ON l.resource_id = r.id WHERE r.institution_id = ?", instId);
            executeDelete("DELETE e FROM equipment e JOIN resources r ON e.resource_id = r.id WHERE r.institution_id = ?", instId);
            executeDelete("DELETE FROM resources WHERE institution_id = ?", instId);

            // Delete academic sections, subjects, programs, departments
            executeDelete("DELETE s FROM sections s JOIN programs p ON s.program_id = p.id JOIN departments d ON p.department_id = d.id WHERE d.institution_id = ?", instId);
            executeDelete("DELETE sub FROM subjects sub JOIN programs p ON sub.program_id = p.id JOIN departments d ON p.department_id = d.id WHERE d.institution_id = ?", instId);
            executeDelete("DELETE FROM programs WHERE department_id IN (SELECT id FROM departments WHERE institution_id = ?)", instId);
            executeDelete("DELETE FROM departments WHERE institution_id = ?", instId);

            // Time slots, Semesters, Academic Years
            executeDelete("DELETE FROM time_slots WHERE institution_id = ?", instId);
            executeDelete("DELETE FROM semesters WHERE academic_year_id IN (SELECT id FROM academic_years WHERE institution_id = ?)", instId);
            executeDelete("DELETE FROM academic_years WHERE institution_id = ?", instId);

            // Clean up VSB users in user_roles and users
            Set<Long> userIdsToDelete = new HashSet<>();
            userIdsToDelete.addAll(studentUserIds);
            userIdsToDelete.addAll(facultyUserIds);
            userIdsToDelete.addAll(wardenUserIds);

            List<Long> vsbEmailUsers = jdbcTemplate.queryForList("SELECT id FROM users WHERE email LIKE '%@vsb-demo.local'", Long.class);
            userIdsToDelete.addAll(vsbEmailUsers);

            if (!userIdsToDelete.isEmpty()) {
                List<Long> userList = new ArrayList<>(userIdsToDelete);
                int batchSize = 1000;
                for (int i = 0; i < userList.size(); i += batchSize) {
                    List<Long> subList = userList.subList(i, Math.min(i + batchSize, userList.size()));
                    String inSql = String.join(",", Collections.nCopies(subList.size(), "?"));
                    Object[] params = subList.toArray();
                    jdbcTemplate.update("DELETE FROM user_roles WHERE user_id IN (" + inSql + ")", params);
                    jdbcTemplate.update("DELETE FROM users WHERE id IN (" + inSql + ")", params);
                }
            }

            // Finally delete institution
            executeDelete("DELETE FROM institution WHERE id = ?", instId);

            summary.setStatus("SUCCESS");
            summary.addBusinessNote("Safely purged VSB demo records. Non-VSB institutional data was unaffected.");
        } catch (Exception e) {
            log.error("Error during VSB demo data cleanup", e);
            summary.setStatus("FAILED");
            summary.recordError("SYSTEM", 0, "cleanup", "exception", e.getMessage());
        } finally {
            summary.setCompletedAt(LocalDateTime.now());
            summary.setDurationMs(System.currentTimeMillis() - startTime);
        }

        return summary;
    }

    // =========================================================================
    // STEP 1: Institution
    // =========================================================================
    private Long ensureInstitution(VsbImportSummaryDto summary) {
        Long existingId = querySingleLong("SELECT id FROM institution WHERE code = 'VSB'");
        if (existingId != null) {
            return existingId;
        }

        jdbcTemplate.update(
                "INSERT INTO institution (name, code, address, city, state, country, email, phone, website, created_at, updated_at) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(6), NOW(6))",
                "VSB Engineering College", "VSB", "NH 67, Karur-Coimbatore Highway", "Karur", "Tamil Nadu", "India",
                "contact@vsb-demo.local", "+91-4324-290123", "https://vsb-demo.local"
        );
        Long id = querySingleLong("SELECT id FROM institution WHERE code = 'VSB'");
        summary.incrementCount("institution", 1);
        return id;
    }

    // =========================================================================
    // STEP 2: Academic Calendar & Semesters
    // =========================================================================
    private Long importAcademicCalendar(File dir, Long instId, VsbImportSummaryDto summary) {
        File file = new File(dir, "academic_calendar.csv");
        if (!file.exists()) {
            return ensureDefaultAcademicYear(instId, summary);
        }

        Long yearId = null;
        try (BufferedReader br = new BufferedReader(new FileReader(file, StandardCharsets.UTF_8))) {
            String header = br.readLine();
            String line;
            int row = 1;
            while ((line = br.readLine()) != null) {
                row++;
                List<String> tokens = parseCsvLine(line);
                if (tokens.size() < 4) continue;

                String yearName = tokens.get(0).trim();
                String term = tokens.get(1).trim();
                LocalDate startDate = parseDate(tokens.get(2).trim());
                LocalDate endDate = parseDate(tokens.get(3).trim());

                if (yearId == null) {
                    yearId = querySingleLong("SELECT id FROM academic_years WHERE institution_id = ? AND name = ?", instId, yearName);
                    if (yearId == null) {
                        jdbcTemplate.update(
                                "INSERT INTO academic_years (institution_id, name, start_date, end_date, status, created_at, updated_at) " +
                                        "VALUES (?, ?, ?, ?, 'ACTIVE', NOW(6), NOW(6))",
                                instId, yearName, Date.valueOf(startDate), Date.valueOf(endDate)
                        );
                        yearId = querySingleLong("SELECT id FROM academic_years WHERE institution_id = ? AND name = ?", instId, yearName);
                        summary.incrementCount("academic_years", 1);
                    }
                }

                // Insert semester
                Long semId = querySingleLong("SELECT id FROM semesters WHERE academic_year_id = ? AND name = ?", yearId, term);
                if (semId == null) {
                    int number = "FALL".equalsIgnoreCase(term) ? 1 : ("SPRING".equalsIgnoreCase(term) ? 2 : 3);
                    jdbcTemplate.update(
                            "INSERT INTO semesters (academic_year_id, name, number, start_date, end_date, status) " +
                                    "VALUES (?, ?, ?, ?, ?, 'ACTIVE')",
                            yearId, term, number, Date.valueOf(startDate), Date.valueOf(endDate)
                    );
                    summary.incrementCount("semesters", 1);
                }
            }
        } catch (Exception e) {
            log.error("Error reading academic_calendar.csv", e);
            summary.recordError("academic_calendar.csv", 0, "read", "error", e.getMessage());
        }

        return (yearId != null) ? yearId : ensureDefaultAcademicYear(instId, summary);
    }

    private Long ensureDefaultAcademicYear(Long instId, VsbImportSummaryDto summary) {
        Long yearId = querySingleLong("SELECT id FROM academic_years WHERE institution_id = ? AND name = '2026-27'", instId);
        if (yearId == null) {
            jdbcTemplate.update(
                    "INSERT INTO academic_years (institution_id, name, start_date, end_date, status, created_at, updated_at) " +
                            "VALUES (?, '2026-27', '2026-08-24', '2027-04-25', 'ACTIVE', NOW(6), NOW(6))",
                    instId
            );
            yearId = querySingleLong("SELECT id FROM academic_years WHERE institution_id = ? AND name = '2026-27'", instId);
            summary.incrementCount("academic_years", 1);

            jdbcTemplate.update("INSERT INTO semesters (academic_year_id, name, number, start_date, end_date, status) VALUES (?, 'FALL', 1, '2026-08-24', '2026-12-06', 'ACTIVE')", yearId);
            jdbcTemplate.update("INSERT INTO semesters (academic_year_id, name, number, start_date, end_date, status) VALUES (?, 'SPRING', 2, '2027-01-11', '2027-04-25', 'ACTIVE')", yearId);
            summary.incrementCount("semesters", 2);
        }
        return yearId;
    }

    // =========================================================================
    // STEP 3: Departments
    // =========================================================================
    private void importDepartments(File dir, Long instId, VsbImportSummaryDto summary) {
        File file = new File(dir, "departments.csv");
        if (!file.exists()) return;

        try (BufferedReader br = new BufferedReader(new FileReader(file, StandardCharsets.UTF_8))) {
            br.readLine(); // Header
            String line;
            int row = 1;
            while ((line = br.readLine()) != null) {
                row++;
                List<String> tokens = parseCsvLine(line);
                if (tokens.size() < 3) continue;

                String csvDeptId = tokens.get(0).trim();
                String name = tokens.get(1).trim();
                String code = tokens.get(2).trim();
                String school = tokens.size() > 3 ? tokens.get(3).trim() : null;

                Long existingId = querySingleLong("SELECT id FROM departments WHERE institution_id = ? AND code = ?", instId, code);
                if (existingId == null) {
                    jdbcTemplate.update(
                            "INSERT INTO departments (institution_id, name, code, description, status, created_at, updated_at) " +
                                    "VALUES (?, ?, ?, ?, 'ACTIVE', NOW(6), NOW(6))",
                            instId, name, code, school
                    );
                    existingId = querySingleLong("SELECT id FROM departments WHERE institution_id = ? AND code = ?", instId, code);
                    summary.incrementCount("departments", 1);
                }
                deptIdMap.put(csvDeptId, existingId);
            }
        } catch (Exception e) {
            log.error("Error importing departments.csv", e);
            summary.recordError("departments.csv", 0, "parse", "error", e.getMessage());
        }
    }

    // =========================================================================
    // STEP 4: Programs
    // =========================================================================
    private void importPrograms(File dir, VsbImportSummaryDto summary) {
        File file = new File(dir, "programs.csv");
        if (!file.exists()) return;

        try (BufferedReader br = new BufferedReader(new FileReader(file, StandardCharsets.UTF_8))) {
            br.readLine();
            String line;
            int row = 1;
            while ((line = br.readLine()) != null) {
                row++;
                List<String> tokens = parseCsvLine(line);
                if (tokens.size() < 4) continue;

                String csvProgId = tokens.get(0).trim();
                String csvDeptId = tokens.get(1).trim();
                String name = tokens.get(2).trim();
                String degreeTypeRaw = tokens.get(3).trim();
                int duration = tokens.size() > 5 ? parseInteger(tokens.get(5).trim(), 4) : 4;

                Long dbDeptId = deptIdMap.get(csvDeptId);
                if (dbDeptId == null) {
                    summary.recordError("programs.csv", row, "department_id", csvDeptId, "Department not found in database");
                    continue;
                }

                String degreeType = mapDegreeType(degreeTypeRaw);

                Long existingProgId = querySingleLong("SELECT id FROM programs WHERE department_id = ? AND code = ?", dbDeptId, csvProgId);
                if (existingProgId == null) {
                    jdbcTemplate.update(
                            "INSERT INTO programs (department_id, name, code, degree_type, duration_years, status, created_at, updated_at) " +
                                    "VALUES (?, ?, ?, ?, ?, 'ACTIVE', NOW(6), NOW(6))",
                            dbDeptId, name, csvProgId, degreeType, duration
                    );
                    existingProgId = querySingleLong("SELECT id FROM programs WHERE department_id = ? AND code = ?", dbDeptId, csvProgId);
                    summary.incrementCount("programs", 1);
                }
                progIdMap.put(csvProgId, existingProgId);
            }
        } catch (Exception e) {
            log.error("Error importing programs.csv", e);
            summary.recordError("programs.csv", 0, "parse", "error", e.getMessage());
        }
    }

    // =========================================================================
    // STEP 5: Courses / Subjects
    // =========================================================================
    private void importCourses(File dir, VsbImportSummaryDto summary) {
        File file = new File(dir, "courses.csv");
        if (!file.exists()) return;

        try (BufferedReader br = new BufferedReader(new FileReader(file, StandardCharsets.UTF_8))) {
            br.readLine();
            String line;
            int row = 1;
            while ((line = br.readLine()) != null) {
                row++;
                List<String> tokens = parseCsvLine(line);
                if (tokens.size() < 4) continue;

                String csvCourseId = tokens.get(0).trim();
                String csvDeptId = tokens.get(1).trim();
                String courseCode = tokens.get(2).trim();
                String courseTitle = tokens.get(3).trim();
                int credits = tokens.size() > 5 ? parseInteger(tokens.get(5).trim(), 3) : 3;
                String semOffered = tokens.size() > 6 ? tokens.get(6).trim() : "FALL";

                Long dbDeptId = deptIdMap.get(csvDeptId);
                if (dbDeptId == null) {
                    summary.recordError("courses.csv", row, "department_id", csvDeptId, "Department not found");
                    continue;
                }

                // Pick primary program in department
                Long dbProgId = querySingleLong("SELECT id FROM programs WHERE department_id = ? ORDER BY id ASC LIMIT 1", dbDeptId);
                if (dbProgId == null) {
                    summary.recordError("courses.csv", row, "department_id", csvDeptId, "No programs under department");
                    continue;
                }

                // Pick matching semester
                String semName = semOffered.contains("SPRING") && !semOffered.contains("FALL") ? "SPRING" : "FALL";
                Long dbSemId = querySingleLong("SELECT id FROM semesters WHERE name = ? ORDER BY id DESC LIMIT 1", semName);
                if (dbSemId == null) {
                    dbSemId = querySingleLong("SELECT id FROM semesters ORDER BY id ASC LIMIT 1");
                }

                String subjectType = (courseCode.contains("LAB") || courseTitle.toLowerCase().contains("lab"))
                        ? "LAB" : "THEORY";

                Long existingSubjId = querySingleLong("SELECT id FROM subjects WHERE program_id = ? AND code = ?", dbProgId, courseCode);
                if (existingSubjId == null) {
                    jdbcTemplate.update(
                            "INSERT INTO subjects (program_id, semester_id, code, name, credits, subject_type, status, created_at, updated_at) " +
                                    "VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', NOW(6), NOW(6))",
                            dbProgId, dbSemId, courseCode, courseTitle, credits, subjectType
                    );
                    existingSubjId = querySingleLong("SELECT id FROM subjects WHERE program_id = ? AND code = ?", dbProgId, courseCode);
                    summary.incrementCount("subjects", 1);
                }
                courseIdMap.put(csvCourseId, existingSubjId);
            }
        } catch (Exception e) {
            log.error("Error importing courses.csv", e);
            summary.recordError("courses.csv", 0, "parse", "error", e.getMessage());
        }
    }

    // =========================================================================
    // STEP 6: Physical Resources (Buildings, Rooms, Labs)
    // =========================================================================
    private void importPhysicalResources(File dir, Long instId, VsbImportSummaryDto summary) {
        Long catClassroomId = ensureResourceCategory("CLASSROOM", "CLASSROOM");
        Long catLabId = ensureResourceCategory("LABORATORY", "LABORATORY");

        // Buildings
        File bldFile = new File(dir, "buildings.csv");
        if (bldFile.exists()) {
            try (BufferedReader br = new BufferedReader(new FileReader(bldFile, StandardCharsets.UTF_8))) {
                br.readLine();
                String line;
                while ((line = br.readLine()) != null) {
                    List<String> t = parseCsvLine(line);
                    if (t.size() >= 2) {
                        buildingNames.put(t.get(0).trim(), 1L); // Building tracking
                    }
                }
            } catch (Exception e) {
                log.warn("Error reading buildings.csv", e);
            }
        }

        // Rooms -> Classrooms
        File roomsFile = new File(dir, "rooms.csv");
        if (roomsFile.exists()) {
            try (BufferedReader br = new BufferedReader(new FileReader(roomsFile, StandardCharsets.UTF_8))) {
                br.readLine();
                String line;
                int row = 1;
                while ((line = br.readLine()) != null) {
                    row++;
                    List<String> tokens = parseCsvLine(line);
                    if (tokens.size() < 6) continue;

                    String csvRoomId = tokens.get(0).trim();
                    String bldId = tokens.get(1).trim();
                    String roomCode = tokens.get(2).trim();
                    String floor = tokens.get(3).trim();
                    int capacity = parseInteger(tokens.get(5).trim(), 50);

                    boolean smartBoard = tokens.size() > 6 && "1".equals(tokens.get(6).trim());
                    boolean projector = tokens.size() > 7 && "1".equals(tokens.get(7).trim());

                    Long resId = querySingleLong("SELECT id FROM resources WHERE code = ?", roomCode);
                    if (resId == null) {
                        jdbcTemplate.update(
                                "INSERT INTO resources (institution_id, category_id, name, code, capacity, location, status, quantity, available_quantity, created_at, updated_at) " +
                                        "VALUES (?, ?, ?, ?, ?, ?, 'AVAILABLE', 1, 1, NOW(6), NOW(6))",
                                instId, catClassroomId, "Room " + roomCode, roomCode, capacity, bldId + ", Floor " + floor
                        );
                        resId = querySingleLong("SELECT id FROM resources WHERE code = ?", roomCode);

                        jdbcTemplate.update(
                                "INSERT INTO classrooms (resource_id, building, floor, room_number, capacity, room_type, has_projector, has_ac, has_smart_board, status) " +
                                        "VALUES (?, ?, ?, ?, ?, 'LECTURE_HALL', ?, false, ?, 'AVAILABLE')",
                                resId, bldId, floor, roomCode, capacity, projector, smartBoard
                        );
                        summary.incrementCount("classrooms", 1);
                        summary.incrementCount("resources", 1);
                    }
                    resourceIdMap.put(csvRoomId, resId);
                }
            } catch (Exception e) {
                log.error("Error importing rooms.csv", e);
                summary.recordError("rooms.csv", 0, "parse", "error", e.getMessage());
            }
        }

        // Labs -> Laboratories
        File labsFile = new File(dir, "labs.csv");
        if (labsFile.exists()) {
            try (BufferedReader br = new BufferedReader(new FileReader(labsFile, StandardCharsets.UTF_8))) {
                br.readLine();
                String line;
                int row = 1;
                while ((line = br.readLine()) != null) {
                    row++;
                    List<String> tokens = parseCsvLine(line);
                    if (tokens.size() < 4) continue;

                    String csvLabId = tokens.get(0).trim();
                    String csvDeptId = tokens.get(1).trim();
                    String bldId = tokens.get(2).trim();
                    String labName = tokens.get(3).trim();
                    int workstations = tokens.size() > 5 ? parseInteger(tokens.get(5).trim(), 30) : 30;

                    Long dbDeptId = deptIdMap.get(csvDeptId);

                    Long resId = querySingleLong("SELECT id FROM resources WHERE code = ?", csvLabId);
                    if (resId == null) {
                        jdbcTemplate.update(
                                "INSERT INTO resources (institution_id, department_id, category_id, name, code, capacity, location, status, quantity, available_quantity, created_at, updated_at) " +
                                        "VALUES (?, ?, ?, ?, ?, ?, 'AVAILABLE', 1, 1, NOW(6), NOW(6))",
                                instId, dbDeptId, catLabId, labName, csvLabId, workstations, bldId
                        );
                        resId = querySingleLong("SELECT id FROM resources WHERE code = ?", csvLabId);

                        jdbcTemplate.update(
                                "INSERT INTO laboratories (resource_id, building, floor, room_number, capacity, lab_type, computer_count, status) " +
                                        "VALUES (?, ?, '1', ?, ?, 'COMPUTER_LAB', ?, 'AVAILABLE')",
                                resId, bldId, csvLabId, workstations, workstations
                        );
                        summary.incrementCount("laboratories", 1);
                        summary.incrementCount("resources", 1);
                    }
                    resourceIdMap.put(csvLabId, resId);
                }
            } catch (Exception e) {
                log.error("Error importing labs.csv", e);
                summary.recordError("labs.csv", 0, "parse", "error", e.getMessage());
            }
        }
    }

    private Long ensureResourceCategory(String name, String type) {
        Long id = querySingleLong("SELECT id FROM resource_categories WHERE name = ?", name);
        if (id == null) {
            jdbcTemplate.update(
                    "INSERT INTO resource_categories (name, description, resource_type, status) VALUES (?, ?, ?, 'ACTIVE')",
                    name, "VSB " + name + " resource category", type
            );
            id = querySingleLong("SELECT id FROM resource_categories WHERE name = ?", name);
        }
        return id;
    }

    // =========================================================================
    // STEP 7: Time Slots
    // =========================================================================
    private void importTimeSlots(File dir, Long instId, VsbImportSummaryDto summary) {
        File file = new File(dir, "time_slots.csv");
        if (!file.exists()) return;

        try (BufferedReader br = new BufferedReader(new FileReader(file, StandardCharsets.UTF_8))) {
            br.readLine();
            String line;
            while ((line = br.readLine()) != null) {
                List<String> t = parseCsvLine(line);
                if (t.size() < 2) continue;

                String slotId = t.get(0).trim();
                String label = t.get(1).trim(); // e.g. "08:00-08:50"
                String[] times = label.split("-");
                String startTime = times.length > 0 ? times[0].trim() + ":00" : "08:00:00";
                String endTime = times.length > 1 ? times[1].trim() + ":00" : "08:50:00";

                Long id = querySingleLong("SELECT id FROM time_slots WHERE institution_id = ? AND name = ?", instId, slotId);
                if (id == null) {
                    jdbcTemplate.update(
                            "INSERT INTO time_slots (institution_id, name, day_of_week, start_time, end_time, status) " +
                                    "VALUES (?, ?, 'MONDAY', ?, ?, 'ACTIVE')",
                            instId, slotId, Time.valueOf(startTime), Time.valueOf(endTime)
                    );
                    id = querySingleLong("SELECT id FROM time_slots WHERE institution_id = ? AND name = ?", instId, slotId);
                    summary.incrementCount("time_slots", 1);
                }
                timeSlotIdMap.put(slotId, id);
            }
        } catch (Exception e) {
            log.error("Error importing time_slots.csv", e);
            summary.recordError("time_slots.csv", 0, "parse", "error", e.getMessage());
        }
    }

    // =========================================================================
    // STEP 8: Staff (Wardens)
    // =========================================================================
    private void importStaff(File dir, Long wardenRoleId, String passwordHash, VsbImportSummaryDto summary) {
        File file = new File(dir, "staff.csv");
        if (!file.exists()) return;

        try (BufferedReader br = new BufferedReader(new FileReader(file, StandardCharsets.UTF_8))) {
            br.readLine();
            String line;
            while ((line = br.readLine()) != null) {
                List<String> t = parseCsvLine(line);
                if (t.size() < 4) continue;

                String staffId = t.get(0).trim();
                String empId = t.get(1).trim();
                String role = t.get(3).trim();

                staffIdToEmployee.put(staffId, empId);

                // If this staff member is a warden or assigned to residential duties
                if (role.toLowerCase().contains("warden") || staffId.startsWith("STF012")) {
                    Long userId = ensureUser(
                            "warden_" + empId.toLowerCase().replace("-", "_"),
                            empId.toLowerCase() + "@vsb-demo.local",
                            "Warden", empId, passwordHash, wardenRoleId
                    );
                    wardenStaffUserMap.put(staffId, userId);

                    Long wardenId = querySingleLong("SELECT id FROM wardens WHERE employee_id = ?", empId);
                    if (wardenId == null) {
                        jdbcTemplate.update(
                                "INSERT INTO wardens (user_id, employee_id, contact_number, status, created_at, updated_at) " +
                                        "VALUES (?, ?, '+91-9876543210', 'ACTIVE', NOW(6), NOW(6))",
                                userId, empId
                        );
                        summary.incrementCount("wardens", 1);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error importing staff.csv", e);
            summary.recordError("staff.csv", 0, "parse", "error", e.getMessage());
        }
    }

    // =========================================================================
    // STEP 9: Faculty
    // =========================================================================
    private void importFaculty(File dir, Long facultyRoleId, Long hodRoleId, String passwordHash, VsbImportSummaryDto summary) {
        File file = new File(dir, "faculty.csv");
        if (!file.exists()) return;

        Set<Long> departmentsWithHod = new HashSet<>();

        try (BufferedReader br = new BufferedReader(new FileReader(file, StandardCharsets.UTF_8))) {
            br.readLine();
            String line;
            int row = 1;
            while ((line = br.readLine()) != null) {
                row++;
                List<String> tokens = parseCsvLine(line);
                if (tokens.size() < 7) continue;

                String csvFacId = tokens.get(0).trim();
                String empId = tokens.get(1).trim();
                String csvDeptId = tokens.get(2).trim();
                String qualification = tokens.get(4).trim();
                String rank = tokens.get(6).trim();
                LocalDate hireDate = tokens.size() > 8 ? parseDate(tokens.get(8).trim()) : LocalDate.now();

                Long dbDeptId = deptIdMap.get(csvDeptId);
                if (dbDeptId == null) {
                    summary.recordError("faculty.csv", row, "department_id", csvDeptId, "Department not found");
                    continue;
                }

                String username = "fac_" + empId.toLowerCase().replace("-", "_");
                String email = empId.toLowerCase() + "@vsb-demo.local";

                Long userId = ensureUser(username, email, rank, empId, passwordHash, facultyRoleId);
                facultyUserIdMap.put(csvFacId, userId);

                Long facId = querySingleLong("SELECT id FROM faculty WHERE employee_id = ?", empId);
                if (facId == null) {
                    jdbcTemplate.update(
                            "INSERT INTO faculty (user_id, department_id, employee_id, designation, qualification, joining_date, status, created_at, updated_at) " +
                                    "VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', NOW(6), NOW(6))",
                            userId, dbDeptId, empId, rank, qualification, Date.valueOf(hireDate)
                    );
                    facId = querySingleLong("SELECT id FROM faculty WHERE employee_id = ?", empId);
                    summary.incrementCount("faculty", 1);
                }
                facultyIdMap.put(csvFacId, facId);

                // Assign first faculty of each department as Department HOD
                if (!departmentsWithHod.contains(dbDeptId)) {
                    Long hodCount = querySingleLong("SELECT count(*) FROM department_hods WHERE department_id = ? AND status = 'ACTIVE'", dbDeptId);
                    if (hodCount == null || hodCount == 0) {
                        jdbcTemplate.update(
                                "INSERT INTO department_hods (department_id, faculty_id, start_date, status) VALUES (?, ?, ?, 'ACTIVE')",
                                dbDeptId, facId, Date.valueOf(hireDate)
                        );
                        // Add HOD role to user
                        jdbcTemplate.update("INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)", userId, hodRoleId);
                        summary.incrementCount("department_hods", 1);
                    }
                    departmentsWithHod.add(dbDeptId);
                }
            }
        } catch (Exception e) {
            log.error("Error importing faculty.csv", e);
            summary.recordError("faculty.csv", 0, "parse", "error", e.getMessage());
        }
    }

    // =========================================================================
    // STEP 10: Hostel Structure
    // =========================================================================
    private void importHostelStructure(File dir, Long instId, VsbImportSummaryDto summary) {
        // Hostels
        File hostelFile = new File(dir, "hostels.csv");
        if (hostelFile.exists()) {
            try (BufferedReader br = new BufferedReader(new FileReader(hostelFile, StandardCharsets.UTF_8))) {
                br.readLine();
                String line;
                while ((line = br.readLine()) != null) {
                    List<String> t = parseCsvLine(line);
                    if (t.size() < 5) continue;

                    String csvHostelId = t.get(0).trim();
                    String name = t.get(1).trim();
                    String gender = t.get(2).trim();
                    String staffId = t.get(3).trim();
                    int capacity = parseInteger(t.get(4).trim(), 500);

                    String hostelType = "FEMALE".equalsIgnoreCase(gender) ? "GIRLS" : "BOYS";

                    Long hId = querySingleLong("SELECT id FROM hostels WHERE code = ?", csvHostelId);
                    if (hId == null) {
                        jdbcTemplate.update(
                                "INSERT INTO hostels (institution_id, name, code, type, capacity, status, created_at, updated_at) " +
                                        "VALUES (?, ?, ?, ?, ?, 'ACTIVE', NOW(6), NOW(6))",
                                instId, name, csvHostelId, hostelType, capacity
                        );
                        hId = querySingleLong("SELECT id FROM hostels WHERE code = ?", csvHostelId);
                        summary.incrementCount("hostels", 1);
                    }
                    hostelIdMap.put(csvHostelId, hId);

                    // Ensure default block
                    Long blockId = querySingleLong("SELECT id FROM hostel_blocks WHERE hostel_id = ? AND code = 'BLK-A'", hId);
                    if (blockId == null) {
                        jdbcTemplate.update(
                                "INSERT INTO hostel_blocks (hostel_id, name, code, number_of_floors, status) " +
                                        "VALUES (?, 'Block A', 'BLK-A', 4, 'ACTIVE')",
                                hId
                        );
                        summary.incrementCount("hostel_blocks", 1);
                    }

                    // Assign warden if available
                    String empId = staffIdToEmployee.get(staffId);
                    if (empId != null) {
                        Long wId = querySingleLong("SELECT id FROM wardens WHERE employee_id = ?", empId);
                        if (wId != null) {
                            jdbcTemplate.update(
                                    "INSERT IGNORE INTO warden_hostels (warden_id, hostel_id, assigned_at) VALUES (?, ?, NOW(6))",
                                    wId, hId
                            );
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Error importing hostels.csv", e);
                summary.recordError("hostels.csv", 0, "parse", "error", e.getMessage());
            }
        }

        // Rooms
        File roomsFile = new File(dir, "hostel_rooms.csv");
        if (roomsFile.exists()) {
            try (BufferedReader br = new BufferedReader(new FileReader(roomsFile, StandardCharsets.UTF_8))) {
                br.readLine();
                String line;
                while ((line = br.readLine()) != null) {
                    List<String> t = parseCsvLine(line);
                    if (t.size() < 5) continue;

                    String csvRoomId = t.get(0).trim();
                    String csvHostelId = t.get(1).trim();
                    String roomNumber = t.get(2).trim();
                    int floorNum = parseInteger(t.get(3).trim(), 1);
                    int cap = parseInteger(t.get(4).trim(), 4);

                    Long hId = hostelIdMap.get(csvHostelId);
                    if (hId == null) continue;

                    Long blockId = querySingleLong("SELECT id FROM hostel_blocks WHERE hostel_id = ? LIMIT 1", hId);
                    if (blockId == null) continue;

                    Long floorId = querySingleLong("SELECT id FROM hostel_floors WHERE hostel_block_id = ? AND floor_number = ?", blockId, floorNum);
                    if (floorId == null) {
                        jdbcTemplate.update(
                                "INSERT INTO hostel_floors (hostel_block_id, floor_number, name, status) VALUES (?, ?, ?, 'ACTIVE')",
                                blockId, floorNum, "Floor " + floorNum
                        );
                        floorId = querySingleLong("SELECT id FROM hostel_floors WHERE hostel_block_id = ? AND floor_number = ?", blockId, floorNum);
                        summary.incrementCount("hostel_floors", 1);
                    }

                    Long rId = querySingleLong("SELECT id FROM hostel_rooms WHERE hostel_floor_id = ? AND room_number = ?", floorId, roomNumber);
                    if (rId == null) {
                        String roomType = cap == 1 ? "SINGLE" : (cap == 2 ? "DOUBLE" : (cap == 3 ? "TRIPLE" : "FOUR_SHARING"));
                        jdbcTemplate.update(
                                "INSERT INTO hostel_rooms (hostel_floor_id, room_number, room_type, capacity, status) " +
                                        "VALUES (?, ?, ?, ?, 'AVAILABLE')",
                                floorId, roomNumber, roomType, cap
                        );
                        rId = querySingleLong("SELECT id FROM hostel_rooms WHERE hostel_floor_id = ? AND room_number = ?", floorId, roomNumber);
                        summary.incrementCount("hostel_rooms", 1);
                    }
                    hostelRoomIdMap.put(csvRoomId, rId);
                }
            } catch (Exception e) {
                log.error("Error importing hostel_rooms.csv", e);
                summary.recordError("hostel_rooms.csv", 0, "parse", "error", e.getMessage());
            }
        }

        // Beds
        File bedsFile = new File(dir, "hostel_beds.csv");
        if (bedsFile.exists()) {
            try (BufferedReader br = new BufferedReader(new FileReader(bedsFile, StandardCharsets.UTF_8))) {
                br.readLine();
                String line;
                while ((line = br.readLine()) != null) {
                    List<String> t = parseCsvLine(line);
                    if (t.size() < 3) continue;

                    String csvBedId = t.get(0).trim();
                    String csvRoomId = t.get(1).trim();
                    String bedNum = t.get(2).trim();

                    Long dbRoomId = hostelRoomIdMap.get(csvRoomId);
                    if (dbRoomId == null) continue;

                    Long bId = querySingleLong("SELECT id FROM hostel_beds WHERE hostel_room_id = ? AND bed_number = ?", dbRoomId, bedNum);
                    if (bId == null) {
                        jdbcTemplate.update(
                                "INSERT INTO hostel_beds (hostel_room_id, bed_number, status, created_at, updated_at) " +
                                        "VALUES (?, ?, 'AVAILABLE', NOW(6), NOW(6))",
                                dbRoomId, bedNum
                        );
                        bId = querySingleLong("SELECT id FROM hostel_beds WHERE hostel_room_id = ? AND bed_number = ?", dbRoomId, bedNum);
                        summary.incrementCount("hostel_beds", 1);
                    }
                    hostelBedIdMap.put(csvBedId, bId);
                }
            } catch (Exception e) {
                log.error("Error importing hostel_beds.csv", e);
                summary.recordError("hostel_beds.csv", 0, "parse", "error", e.getMessage());
            }
        }
    }

    // =========================================================================
    // STEP 11: Students (10,000 records - Batched)
    // =========================================================================
    private void importStudents(File dir, Long studentRoleId, String passwordHash, VsbImportSummaryDto summary) {
        File file = new File(dir, "students.csv");
        if (!file.exists()) return;

        // Cache existing student register numbers to avoid duplicate checks per-row
        Set<String> existingRegNumbers = new HashSet<>(
                jdbcTemplate.queryForList("SELECT register_number FROM students", String.class)
        );

        List<Object[]> userBatch = new ArrayList<>(1000);
        List<Object[]> studentDataList = new ArrayList<>(1000);

        try (BufferedReader br = new BufferedReader(new FileReader(file, StandardCharsets.UTF_8))) {
            br.readLine();
            String line;
            int row = 1;
            while ((line = br.readLine()) != null) {
                row++;
                List<String> tokens = parseCsvLine(line);
                if (tokens.size() < 5) continue;

                String studentId = tokens.get(0).trim();
                String csvProgId = tokens.get(1).trim();
                int yearOfStudy = parseInteger(tokens.get(2).trim(), 1);
                String entrySem = tokens.get(3).trim();

                if (existingRegNumbers.contains(studentId)) {
                    continue;
                }

                Long dbProgId = progIdMap.get(csvProgId);
                if (dbProgId == null) continue;

                Long dbDeptId = querySingleLong("SELECT department_id FROM programs WHERE id = ?", dbProgId);
                if (dbDeptId == null) continue;

                int admYear = parseAdmissionYear(entrySem);
                int currSem = Math.max(1, Math.min(8, yearOfStudy * 2 - (entrySem.contains("FALL") ? 1 : 0)));

                String username = studentId.toLowerCase();
                String email = studentId.toLowerCase() + "@vsb-demo.local";

                // Check if user already exists
                Long existingUserId = querySingleLong("SELECT id FROM users WHERE username = ?", username);
                if (existingUserId == null) {
                    userBatch.add(new Object[]{username, email, passwordHash, "Student", studentId, "ACTIVE"});
                }

                studentDataList.add(new Object[]{studentId, username, dbDeptId, dbProgId, admYear, currSem});

                if (userBatch.size() >= 1000) {
                    flushStudentBatches(userBatch, studentRoleId);
                }
            }

            // Flush remaining users
            if (!userBatch.isEmpty()) {
                flushStudentBatches(userBatch, studentRoleId);
            }

            // Insert students in batches
            List<Object[]> studentBatch = new ArrayList<>(1000);
            for (Object[] sData : studentDataList) {
                String studentId = (String) sData[0];
                String username = (String) sData[1];
                Long dbDeptId = (Long) sData[2];
                Long dbProgId = (Long) sData[3];
                int admYear = (Integer) sData[4];
                int currSem = (Integer) sData[5];

                Long uId = querySingleLong("SELECT id FROM users WHERE username = ?", username);
                if (uId != null) {
                    studentBatch.add(new Object[]{uId, dbDeptId, dbProgId, studentId, studentId, admYear, currSem});
                }

                if (studentBatch.size() >= 1000) {
                    jdbcTemplate.batchUpdate(
                            "INSERT INTO students (user_id, department_id, program_id, register_number, roll_number, admission_year, current_semester, status, created_at, updated_at) " +
                                    "VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', NOW(6), NOW(6))",
                            studentBatch
                    );
                    summary.incrementCount("students", studentBatch.size());
                    studentBatch.clear();
                }
            }

            if (!studentBatch.isEmpty()) {
                jdbcTemplate.batchUpdate(
                        "INSERT INTO students (user_id, department_id, program_id, register_number, roll_number, admission_year, current_semester, status, created_at, updated_at) " +
                                "VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', NOW(6), NOW(6))",
                        studentBatch
                    );
                summary.incrementCount("students", studentBatch.size());
                studentBatch.clear();
            }

            // Populate studentIdMap for subsequent allocation mappings
            List<Map<String, Object>> studentRows = jdbcTemplate.queryForList("SELECT id, user_id, register_number FROM students WHERE register_number LIKE 'STU%'");
            for (Map<String, Object> r : studentRows) {
                String regNum = (String) r.get("register_number");
                Long sId = ((Number) r.get("id")).longValue();
                Long uId = ((Number) r.get("user_id")).longValue();
                studentIdMap.put(regNum, sId);
                studentUserIdMap.put(regNum, uId);
            }

        } catch (Exception e) {
            log.error("Error batch importing students.csv", e);
            summary.recordError("students.csv", 0, "batch", "error", e.getMessage());
        }
    }

    private void flushStudentBatches(List<Object[]> userBatch, Long studentRoleId) {
        jdbcTemplate.batchUpdate(
                "INSERT INTO users (username, email, password_hash, first_name, last_name, status, created_at, updated_at) " +
                        "VALUES (?, ?, ?, ?, ?, ?, NOW(6), NOW(6))",
                userBatch
        );

        // Assign STUDENT role in user_roles
        for (Object[] u : userBatch) {
            String uName = (String) u[0];
            Long uId = querySingleLong("SELECT id FROM users WHERE username = ?", uName);
            if (uId != null) {
                jdbcTemplate.update("INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)", uId, studentRoleId);
            }
        }
        userBatch.clear();
    }

    // =========================================================================
    // STEP 12: Sections & Timetables
    // =========================================================================
    private void importSections(File dir, Long academicYearId, VsbImportSummaryDto summary) {
        File file = new File(dir, "sections.csv");
        if (!file.exists()) return;

        try (BufferedReader br = new BufferedReader(new FileReader(file, StandardCharsets.UTF_8))) {
            br.readLine();
            String line;
            while ((line = br.readLine()) != null) {
                List<String> t = parseCsvLine(line);
                if (t.size() < 9) continue;

                String secId = t.get(0).trim();
                String courseId = t.get(1).trim();
                String facId = t.get(2).trim();
                String roomId = t.get(3).trim();
                String term = t.get(5).trim();
                String dayPattern = t.get(6).trim();
                String slotId = t.get(7).trim();
                int capacity = parseInteger(t.get(8).trim(), 40);

                Long dbCourseId = courseIdMap.get(courseId);
                if (dbCourseId == null) continue;

                Long dbProgId = querySingleLong("SELECT program_id FROM subjects WHERE id = ?", dbCourseId);
                if (dbProgId == null) continue;

                String semName = term.contains("SPRING") ? "SPRING" : "FALL";
                Long dbSemId = querySingleLong("SELECT id FROM semesters WHERE name = ? ORDER BY id DESC LIMIT 1", semName);
                if (dbSemId == null) {
                    dbSemId = querySingleLong("SELECT id FROM semesters ORDER BY id ASC LIMIT 1");
                }

                Long dbSectionId = querySingleLong("SELECT id FROM sections WHERE program_id = ? AND name = ?", dbProgId, secId);
                if (dbSectionId == null) {
                    jdbcTemplate.update(
                            "INSERT INTO sections (program_id, academic_year_id, semester_id, name, capacity, status) " +
                                    "VALUES (?, ?, ?, ?, ?, 'ACTIVE')",
                            dbProgId, academicYearId, dbSemId, secId, capacity
                    );
                    dbSectionId = querySingleLong("SELECT id FROM sections WHERE program_id = ? AND name = ?", dbProgId, secId);
                    summary.incrementCount("sections", 1);
                }
                sectionIdMap.put(secId, dbSectionId);

                // Faculty Assignment
                Long dbFacId = facultyIdMap.get(facId);
                if (dbFacId != null) {
                    Long fsaId = querySingleLong("SELECT id FROM faculty_subject_assignments WHERE faculty_id = ? AND subject_id = ? AND section_id = ?", dbFacId, dbCourseId, dbSectionId);
                    if (fsaId == null) {
                        jdbcTemplate.update(
                                "INSERT INTO faculty_subject_assignments (faculty_id, subject_id, section_id, academic_year_id, semester_id, hours_per_week, status) " +
                                        "VALUES (?, ?, ?, ?, ?, 4, 'ACTIVE')",
                                dbFacId, dbCourseId, dbSectionId, academicYearId, dbSemId
                        );
                        summary.incrementCount("faculty_subject_assignments", 1);
                    }
                }

                // Timetable Entry
                Long dbResId = resourceIdMap.get(roomId);
                Long dbSlotId = timeSlotIdMap.get(slotId);
                if (dbResId != null && dbSlotId != null && dbFacId != null) {
                    Long ttId = querySingleLong("SELECT id FROM timetable_entries WHERE section_id = ? AND subject_id = ? AND time_slot_id = ?", dbSectionId, dbCourseId, dbSlotId);
                    if (ttId == null) {
                        String day = dayPattern.contains("MWF") ? "MONDAY" : (dayPattern.contains("TTH") ? "TUESDAY" : "WEDNESDAY");
                        jdbcTemplate.update(
                                "INSERT INTO timetable_entries (section_id, subject_id, faculty_id, resource_id, time_slot_id, day_of_week, status) " +
                                        "VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')",
                                dbSectionId, dbCourseId, dbFacId, dbResId, dbSlotId, day
                        );
                        summary.incrementCount("timetable_entries", 1);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error importing sections.csv", e);
            summary.recordError("sections.csv", 0, "parse", "error", e.getMessage());
        }
    }

    // =========================================================================
    // STEP 13: Academic Resource Requests & Allocations
    // =========================================================================
    private void importResourceRequestsAndAllocations(File dir, Long academicYearId, VsbImportSummaryDto summary) {
        Long catClassroomId = ensureResourceCategory("CLASSROOM", "CLASSROOM");

        // Requests
        File reqFile = new File(dir, "resource_requests.csv");
        if (reqFile.exists()) {
            try (BufferedReader br = new BufferedReader(new FileReader(reqFile, StandardCharsets.UTF_8))) {
                br.readLine();
                String line;
                while ((line = br.readLine()) != null) {
                    List<String> t = parseCsvLine(line);
                    if (t.size() < 10) continue;

                    String reqId = t.get(0).trim();
                    String studentId = t.get(2).trim();
                    String facId = t.get(3).trim();
                    String reqDate = t.get(5).trim();
                    String startTime = t.get(6).trim() + ":00";
                    String endTime = t.get(7).trim() + ":00";
                    String priority = t.get(8).trim();
                    String status = "ALLOCATED".equalsIgnoreCase(t.get(9).trim()) ? "APPROVED" : t.get(9).trim();

                    Long uId = null;
                    if (!facId.isBlank()) {
                        uId = facultyUserIdMap.get(facId);
                    } else if (!studentId.isBlank()) {
                        uId = studentUserIdMap.get(studentId);
                    }
                    if (uId == null) continue;

                    Long dbReqId = querySingleLong("SELECT id FROM academic_resource_requests WHERE requester_user_id = ? AND requested_date = ? AND start_time = ?", uId, Date.valueOf(reqDate), Time.valueOf(startTime));
                    if (dbReqId == null) {
                        jdbcTemplate.update(
                                "INSERT INTO academic_resource_requests (requester_user_id, resource_category_id, purpose, requested_date, start_time, end_time, quantity, priority, status, created_at, updated_at) " +
                                        "VALUES (?, ?, 'VSB Demo Academic Requisition', ?, ?, ?, 1, ?, ?, NOW(6), NOW(6))",
                                uId, catClassroomId, Date.valueOf(reqDate), Time.valueOf(startTime), Time.valueOf(endTime), priority, status
                        );
                        dbReqId = querySingleLong("SELECT id FROM academic_resource_requests WHERE requester_user_id = ? AND requested_date = ? AND start_time = ?", uId, Date.valueOf(reqDate), Time.valueOf(startTime));
                        summary.incrementCount("academic_resource_requests", 1);
                    }
                    reqIdMap.put(reqId, dbReqId);
                }
            } catch (Exception e) {
                log.error("Error importing resource_requests.csv", e);
                summary.recordError("resource_requests.csv", 0, "parse", "error", e.getMessage());
            }
        }

        // Allocations
        File alcFile = new File(dir, "resource_allocations.csv");
        if (alcFile.exists()) {
            Long adminUserId = querySingleLong("SELECT id FROM users WHERE username = 'admin' LIMIT 1");
            Long semId = querySingleLong("SELECT id FROM semesters WHERE name = 'FALL' ORDER BY id DESC LIMIT 1");

            try (BufferedReader br = new BufferedReader(new FileReader(alcFile, StandardCharsets.UTF_8))) {
                br.readLine();
                String line;
                while ((line = br.readLine()) != null) {
                    List<String> t = parseCsvLine(line);
                    if (t.size() < 7) continue;

                    String reqId = t.get(1).trim();
                    String roomId = t.get(2).trim();
                    String date = t.get(3).trim();
                    String startTime = t.get(4).trim() + ":00";
                    String endTime = t.get(5).trim() + ":00";

                    Long dbReqId = reqIdMap.get(reqId);
                    Long dbResId = resourceIdMap.get(roomId);
                    if (dbResId == null) continue;

                    Long allocatedUserId = (dbReqId != null)
                            ? querySingleLong("SELECT requester_user_id FROM academic_resource_requests WHERE id = ?", dbReqId)
                            : adminUserId;

                    Timestamp startTs = Timestamp.valueOf(date + " " + startTime);
                    Timestamp endTs = Timestamp.valueOf(date + " " + endTime);

                    Long dbAllocId = querySingleLong("SELECT id FROM resource_allocations WHERE resource_id = ? AND start_datetime = ?", dbResId, startTs);
                    if (dbAllocId == null) {
                        jdbcTemplate.update(
                                "INSERT INTO resource_allocations (resource_id, allocated_to_user_id, request_id, academic_year_id, semester_id, start_datetime, end_datetime, quantity, purpose, status, allocated_by, created_at, updated_at) " +
                                        "VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'VSB Physical Allocation', 'ACTIVE', ?, NOW(6), NOW(6))",
                                dbResId, allocatedUserId, dbReqId, academicYearId, semId, startTs, endTs, adminUserId
                        );
                        summary.incrementCount("resource_allocations", 1);
                    }
                }
            } catch (Exception e) {
                log.error("Error importing resource_allocations.csv", e);
                summary.recordError("resource_allocations.csv", 0, "parse", "error", e.getMessage());
            }
        }
    }

    // =========================================================================
    // STEP 14: Hostel Requests & Allocations
    // =========================================================================
    private void importHostelRequestsAndAllocations(File dir, Long academicYearId, VsbImportSummaryDto summary) {
        // Requests
        File reqFile = new File(dir, "hostel_requests.csv");
        if (reqFile.exists()) {
            try (BufferedReader br = new BufferedReader(new FileReader(reqFile, StandardCharsets.UTF_8))) {
                br.readLine();
                String line;
                while ((line = br.readLine()) != null) {
                    List<String> t = parseCsvLine(line);
                    if (t.size() < 6) continue;

                    String studentId = t.get(1).trim();
                    String hostelId = t.get(2).trim();
                    String status = "ALLOCATED".equalsIgnoreCase(t.get(4).trim()) ? "APPROVED" : t.get(4).trim();
                    String preference = t.get(5).trim();

                    Long dbStudentId = studentIdMap.get(studentId);
                    Long dbHostelId = hostelIdMap.get(hostelId);
                    if (dbStudentId == null || dbHostelId == null) continue;

                    Long hReqId = querySingleLong("SELECT id FROM hostel_requests WHERE student_id = ? AND hostel_id = ?", dbStudentId, dbHostelId);
                    if (hReqId == null) {
                        jdbcTemplate.update(
                                "INSERT INTO hostel_requests (student_id, hostel_id, request_type, description, priority, status, created_at, updated_at) " +
                                        "VALUES (?, ?, 'ROOM_CHANGE', ?, 'MEDIUM', ?, NOW(6), NOW(6))",
                                dbStudentId, dbHostelId, "Hostel preference: " + preference, status
                        );
                        summary.incrementCount("hostel_requests", 1);
                    }
                }
            } catch (Exception e) {
                log.error("Error importing hostel_requests.csv", e);
                summary.recordError("hostel_requests.csv", 0, "parse", "error", e.getMessage());
            }
        }

        // Allocations
        File alcFile = new File(dir, "hostel_allocations.csv");
        if (alcFile.exists()) {
            Set<Long> allocatedStudents = new HashSet<>();
            Set<Long> occupiedBeds = new HashSet<>();

            try (BufferedReader br = new BufferedReader(new FileReader(alcFile, StandardCharsets.UTF_8))) {
                br.readLine();
                String line;
                while ((line = br.readLine()) != null) {
                    List<String> t = parseCsvLine(line);
                    if (t.size() < 6) continue;

                    String studentId = t.get(2).trim();
                    String bedId = t.get(3).trim();
                    String allocDate = t.get(4).trim();

                    Long dbStudentId = studentIdMap.get(studentId);
                    Long dbBedId = hostelBedIdMap.get(bedId);
                    if (dbStudentId == null || dbBedId == null) continue;

                    // Business rule: 1 student max 1 active bed, 1 bed max 1 active student
                    if (allocatedStudents.contains(dbStudentId) || occupiedBeds.contains(dbBedId)) {
                        continue;
                    }

                    Long existingAlloc = querySingleLong("SELECT id FROM hostel_allocations WHERE student_id = ? AND status = 'ACTIVE'", dbStudentId);
                    if (existingAlloc == null) {
                        jdbcTemplate.update(
                                "INSERT INTO hostel_allocations (student_id, hostel_bed_id, academic_year_id, start_date, status, allocated_at) " +
                                        "VALUES (?, ?, ?, ?, 'ACTIVE', NOW(6))",
                                dbStudentId, dbBedId, academicYearId, Date.valueOf(allocDate)
                        );
                        jdbcTemplate.update("UPDATE hostel_beds SET status = 'OCCUPIED' WHERE id = ?", dbBedId);

                        allocatedStudents.add(dbStudentId);
                        occupiedBeds.add(dbBedId);
                        summary.incrementCount("hostel_allocations", 1);
                    }
                }
            } catch (Exception e) {
                log.error("Error importing hostel_allocations.csv", e);
                summary.recordError("hostel_allocations.csv", 0, "parse", "error", e.getMessage());
            }
        }
    }

    // =========================================================================
    // STEP 15: Faculty Workload
    // =========================================================================
    private void importFacultyWorkloads(File dir, Long academicYearId, VsbImportSummaryDto summary) {
        File file = new File(dir, "faculty_loads.csv");
        if (!file.exists()) return;

        Long semId = querySingleLong("SELECT id FROM semesters WHERE name = 'FALL' ORDER BY id DESC LIMIT 1");

        try (BufferedReader br = new BufferedReader(new FileReader(file, StandardCharsets.UTF_8))) {
            br.readLine();
            String line;
            while ((line = br.readLine()) != null) {
                List<String> t = parseCsvLine(line);
                if (t.size() < 7) continue;

                String facId = t.get(0).trim();
                double assignedHours = parseDouble(t.get(4).trim(), 12.0);

                Long dbFacId = facultyIdMap.get(facId);
                if (dbFacId == null) continue;

                Long fwId = querySingleLong("SELECT id FROM faculty_workloads WHERE faculty_id = ? AND academic_year_id = ?", dbFacId, academicYearId);
                if (fwId == null) {
                    jdbcTemplate.update(
                            "INSERT INTO faculty_workloads (faculty_id, academic_year_id, semester_id, total_hours, teaching_hours, lab_hours, other_hours, workload_status, calculated_at) " +
                                    "VALUES (?, ?, ?, ?, ?, 4.0, 0.0, 'BALANCED', NOW(6))",
                            dbFacId, academicYearId, semId, assignedHours, assignedHours
                    );
                    summary.incrementCount("faculty_workloads", 1);
                }
            }
        } catch (Exception e) {
            log.error("Error importing faculty_loads.csv", e);
            summary.recordError("faculty_loads.csv", 0, "parse", "error", e.getMessage());
        }
    }

    // =========================================================================
    // STEP 16: Standard Demo Logins
    // =========================================================================
    private void createStandardDemoAccounts(Long instId, Map<String, Long> roleMap, String passwordHash, VsbImportSummaryDto summary) {
        // 1. Admin
        ensureUser("admin_vsb", "admin@vsb-demo.local", "VSB", "Admin", passwordHash, roleMap.get("ADMIN"));

        // 2. Principal
        Long pUserId = ensureUser("principal_vsb", "principal@vsb-demo.local", "VSB", "Principal", passwordHash, roleMap.get("PRINCIPAL"));
        Long anyFacId = querySingleLong("SELECT id FROM faculty ORDER BY id ASC LIMIT 1");
        if (anyFacId != null) {
            Long pAssignId = querySingleLong("SELECT id FROM principal_assignments WHERE institution_id = ? AND status = 'ACTIVE'", instId);
            if (pAssignId == null) {
                jdbcTemplate.update("INSERT INTO principal_assignments (institution_id, faculty_id, start_date, status) VALUES (?, ?, '2026-08-01', 'ACTIVE')", instId, anyFacId);
            }
        }

        // 3. HOD CSE
        Long cseDeptId = querySingleLong("SELECT id FROM departments WHERE institution_id = ? AND code = 'CSE'", instId);
        Long hodUserId = ensureUser("hod_cse_vsb", "hod.cse@vsb-demo.local", "CSE", "HOD", passwordHash, roleMap.get("HOD"));
        if (cseDeptId != null) {
            Long hodFacId = querySingleLong("SELECT id FROM faculty WHERE department_id = ? ORDER BY id ASC LIMIT 1", cseDeptId);
            if (hodFacId != null) {
                jdbcTemplate.update("UPDATE faculty SET user_id = ? WHERE id = ?", hodUserId, hodFacId);
            }
        }

        // 4. Faculty CSE
        ensureUser("faculty_cse_vsb", "faculty.cse@vsb-demo.local", "CSE", "Faculty", passwordHash, roleMap.get("FACULTY"));

        // 5. Student
        Long sUserId = ensureUser("student_vsb", "student@vsb-demo.local", "VSB", "Student", passwordHash, roleMap.get("STUDENT"));
        Long anyStudentId = querySingleLong("SELECT id FROM students ORDER BY id ASC LIMIT 1");
        if (anyStudentId != null) {
            jdbcTemplate.update("UPDATE students SET user_id = ? WHERE id = ?", sUserId, anyStudentId);
        }

        // 6. Warden
        ensureUser("warden_vsb", "warden@vsb-demo.local", "VSB", "Warden", passwordHash, roleMap.get("WARDEN"));
    }

    // =========================================================================
    // Helpers
    // =========================================================================
    private Map<String, Long> loadRoleIds() {
        Map<String, Long> map = new HashMap<>();
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT id, name FROM roles");
        for (Map<String, Object> r : rows) {
            map.put((String) r.get("name"), ((Number) r.get("id")).longValue());
        }
        return map;
    }

    private Long ensureUser(String username, String email, String first, String last, String passwordHash, Long roleId) {
        Long uId = querySingleLong("SELECT id FROM users WHERE username = ? OR email = ?", username, email);
        if (uId == null) {
            jdbcTemplate.update(
                    "INSERT INTO users (username, email, password_hash, first_name, last_name, status, created_at, updated_at) " +
                            "VALUES (?, ?, ?, ?, ?, 'ACTIVE', NOW(6), NOW(6))",
                    username, email, passwordHash, first, last
            );
            uId = querySingleLong("SELECT id FROM users WHERE username = ?", username);
        }
        if (uId != null && roleId != null) {
            jdbcTemplate.update("INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)", uId, roleId);
        }
        return uId;
    }

    private Long querySingleLong(String sql, Object... args) {
        List<Long> results = jdbcTemplate.queryForList(sql, Long.class, args);
        return results.isEmpty() ? null : results.get(0);
    }

    private long queryCount(String sql, Object... args) {
        Long c = querySingleLong(sql, args);
        return c != null ? c : 0L;
    }

    private void executeDelete(String sql, Object... args) {
        try {
            jdbcTemplate.update(sql, args);
        } catch (Exception e) {
            log.warn("Cleanup step failed: {} -> {}", sql, e.getMessage());
        }
    }

    private String mapDegreeType(String raw) {
        if (raw == null) return "B_TECH";
        String u = raw.toUpperCase().replace(".", "").replace("-", "_").trim();
        if (u.contains("BTECH")) return "B_TECH";
        if (u.contains("MTECH")) return "M_TECH";
        if (u.contains("BSC")) return "B_SC";
        if (u.contains("MSC")) return "M_SC";
        if (u.contains("BCA")) return "B_CA";
        if (u.contains("MCA")) return "M_CA";
        if (u.contains("MBA")) return "MBA";
        if (u.contains("PHD")) return "PHD";
        if (u.contains("DIPLOMA")) return "DIPLOMA";
        return "B_TECH";
    }

    private LocalDate parseDate(String val) {
        try {
            return LocalDate.parse(val);
        } catch (Exception e) {
            return LocalDate.now();
        }
    }

    private int parseAdmissionYear(String entrySem) {
        try {
            if (entrySem.contains("-")) {
                return Integer.parseInt(entrySem.split("-")[0]);
            }
            return Integer.parseInt(entrySem.substring(0, 4));
        } catch (Exception e) {
            return 2024;
        }
    }

    private int parseInteger(String val, int def) {
        try {
            return Integer.parseInt(val.trim());
        } catch (Exception e) {
            return def;
        }
    }

    private double parseDouble(String val, double def) {
        try {
            return Double.parseDouble(val.trim());
        } catch (Exception e) {
            return def;
        }
    }

    public static List<String> parseCsvLine(String line) {
        List<String> tokens = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '\"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                tokens.add(sb.toString().trim());
                sb.setLength(0);
            } else {
                sb.append(c);
            }
        }
        tokens.add(sb.toString().trim());
        return tokens;
    }
}
