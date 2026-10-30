-- ==============================================================================
-- AHRAO Database Migration: V7__seed_role_profiles.sql
-- Domain: Seed Domain Relational Profiles for Quick-Fill Demo Users
-- (HOD: hod_cs, Faculty: faculty_john, Student: student_alex, Warden: warden_smith)
-- ==============================================================================

-- 1. Faculty profile for hod_cs (user_id = 3)
INSERT INTO faculty (user_id, department_id, employee_id, designation, qualification, joining_date, status)
SELECT u.id, d.id, 'EMP-HOD-CSE', 'Professor & Head of Department', 'Ph.D in Computer Science & Engineering', '2018-06-01', 'ACTIVE'
FROM users u
CROSS JOIN (SELECT id FROM departments WHERE code = 'CSE' LIMIT 1) d
WHERE u.id = 3
  AND NOT EXISTS (SELECT 1 FROM faculty WHERE user_id = 3);

-- 2. Faculty profile for faculty_john (user_id = 4)
INSERT INTO faculty (user_id, department_id, employee_id, designation, qualification, joining_date, status)
SELECT u.id, d.id, 'EMP-FAC-001', 'Assistant Professor', 'M.Tech, Ph.D in Computer Science', '2020-08-15', 'ACTIVE'
FROM users u
CROSS JOIN (SELECT id FROM departments WHERE code = 'CSE' LIMIT 1) d
WHERE u.id = 4
  AND NOT EXISTS (SELECT 1 FROM faculty WHERE user_id = 4);

-- 3. Department HOD mapping for hod_cs
INSERT INTO department_hods (department_id, faculty_id, start_date, status)
SELECT f.department_id, f.id, '2022-01-01', 'ACTIVE'
FROM faculty f
WHERE f.user_id = 3
  AND NOT EXISTS (SELECT 1 FROM department_hods dh WHERE dh.faculty_id = f.id);

-- 4. Student profile for student_alex (user_id = 5)
INSERT INTO students (user_id, department_id, program_id, section_id, register_number, roll_number, admission_year, current_semester, status)
SELECT u.id, d.id, p.id, s.id, 'REG2023CSE001', 'CS2023-001', 2023, 5, 'ACTIVE'
FROM users u
CROSS JOIN (SELECT id FROM departments WHERE code = 'CSE' LIMIT 1) d
CROSS JOIN (SELECT id FROM programs WHERE code = 'B01' LIMIT 1) p
CROSS JOIN (SELECT id FROM sections LIMIT 1) s
WHERE u.id = 5
  AND NOT EXISTS (SELECT 1 FROM students WHERE user_id = 5);

-- 5. Warden profile for warden_smith (user_id = 6)
INSERT INTO wardens (user_id, employee_id, contact_number, status)
SELECT u.id, 'EMP-WRD-001', '+91-9876543210', 'ACTIVE'
FROM users u
WHERE u.id = 6
  AND NOT EXISTS (SELECT 1 FROM wardens WHERE user_id = 6);

-- 6. Warden hostel assignment for warden_smith to Hostel 1
INSERT INTO warden_hostels (warden_id, hostel_id, assigned_at)
SELECT w.id, h.id, CURRENT_TIMESTAMP(6)
FROM wardens w
CROSS JOIN (SELECT id FROM hostels LIMIT 1) h
WHERE w.user_id = 6
  AND NOT EXISTS (SELECT 1 FROM warden_hostels wh WHERE wh.warden_id = w.id AND wh.hostel_id = h.id);
