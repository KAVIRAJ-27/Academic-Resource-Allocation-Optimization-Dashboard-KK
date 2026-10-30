-- ==============================================================================
-- AHRAO Database Migration: V8__seed_demo_judge_accounts.sql
-- Domain: Seed Dedicated Judge-Ready Demo Accounts with Complete Relational Profiles
-- ==============================================================================

-- 1. Create Demo Users (Passwords matching role conventions)
INSERT INTO users (username, email, password_hash, first_name, last_name, status, created_at, updated_at)
SELECT 'demo_admin', 'demo.admin@ahrao.edu', '$2a$10$l0p5uzzzGOH414kKWS/AqujMmK8uYYUIvqMVcwIevLLKLaVtO5XGG', 'Demo', 'Administrator', 'ACTIVE', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'demo_admin');

INSERT INTO users (username, email, password_hash, first_name, last_name, status, created_at, updated_at)
SELECT 'demo_principal', 'demo.principal@ahrao.edu', '$2a$10$nRvATcp0Tqk.qDWrFkUzWu.rm7rwPERJ2SowygoJV9.YlzWHw5GIe', 'Demo', 'Principal', 'ACTIVE', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'demo_principal');

INSERT INTO users (username, email, password_hash, first_name, last_name, status, created_at, updated_at)
SELECT 'demo_hod', 'demo.hod@ahrao.edu', '$2a$10$XkWuGXcOu8FVCjB5xeYQK.JKZb7ocg4p1aNRjD7f8h226RM2P9GCO', 'Demo', 'HOD', 'ACTIVE', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'demo_hod');

INSERT INTO users (username, email, password_hash, first_name, last_name, status, created_at, updated_at)
SELECT 'demo_faculty', 'demo.faculty@ahrao.edu', '$2a$10$7blNAcXb1lDI51taeh3SiefF.efk8v7jTlIPN1UCDlNT.lU4nNxVK', 'Demo', 'Faculty', 'ACTIVE', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'demo_faculty');

INSERT INTO users (username, email, password_hash, first_name, last_name, status, created_at, updated_at)
SELECT 'demo_student', 'demo.student@ahrao.edu', '$2a$10$6QQ3n4DqG2JVik8CQpcgaelIvzvcs/SLEYRL7rz/6fr5hWBmIJ5MC', 'Demo', 'Student', 'ACTIVE', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'demo_student');

INSERT INTO users (username, email, password_hash, first_name, last_name, status, created_at, updated_at)
SELECT 'demo_warden', 'demo.warden@ahrao.edu', '$2a$10$VMkKsMpnI2hHAy68QXPx8OxCdLnwSKWYehp5i1qVFMt9rgLKyBzFu', 'Demo', 'Warden', 'ACTIVE', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'demo_warden');

-- 2. User Roles Mapping
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'demo_admin' AND r.name = 'ADMIN'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'demo_principal' AND r.name = 'PRINCIPAL'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'demo_hod' AND r.name = 'HOD'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'demo_faculty' AND r.name = 'FACULTY'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'demo_student' AND r.name = 'STUDENT'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'demo_warden' AND r.name = 'WARDEN'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- 3. Faculty Profile for demo_principal & Principal Assignment
INSERT INTO faculty (user_id, department_id, employee_id, designation, qualification, joining_date, status)
SELECT u.id, d.id, 'EMP-DEMO-PRIN', 'Principal & Professor', 'Ph.D in Systems Engineering', '2016-01-01', 'ACTIVE'
FROM users u
CROSS JOIN (SELECT id FROM departments WHERE code = 'CSE' LIMIT 1) d
WHERE u.username = 'demo_principal'
  AND NOT EXISTS (SELECT 1 FROM faculty f WHERE f.user_id = u.id);

INSERT INTO principal_assignments (institution_id, faculty_id, start_date, status)
SELECT inst.id, f.id, '2020-01-01', 'ACTIVE'
FROM users u
JOIN faculty f ON f.user_id = u.id
CROSS JOIN (SELECT id FROM institution LIMIT 1) inst
WHERE u.username = 'demo_principal'
  AND NOT EXISTS (SELECT 1 FROM principal_assignments pa WHERE pa.faculty_id = f.id);

-- 4. Faculty Profile for demo_hod & HOD Assignment
INSERT INTO faculty (user_id, department_id, employee_id, designation, qualification, joining_date, status)
SELECT u.id, d.id, 'EMP-DEMO-HOD', 'Professor & Department Head', 'Ph.D in Computer Science', '2018-06-01', 'ACTIVE'
FROM users u
CROSS JOIN (SELECT id FROM departments WHERE code = 'CSE' LIMIT 1) d
WHERE u.username = 'demo_hod'
  AND NOT EXISTS (SELECT 1 FROM faculty f WHERE f.user_id = u.id);

INSERT INTO department_hods (department_id, faculty_id, start_date, status)
SELECT f.department_id, f.id, '2022-01-01', 'ACTIVE'
FROM users u
JOIN faculty f ON f.user_id = u.id
WHERE u.username = 'demo_hod'
  AND NOT EXISTS (SELECT 1 FROM department_hods dh WHERE dh.faculty_id = f.id);

-- 5. Faculty Profile for demo_faculty
INSERT INTO faculty (user_id, department_id, employee_id, designation, qualification, joining_date, status)
SELECT u.id, d.id, 'EMP-DEMO-FAC', 'Assistant Professor', 'M.Tech, Ph.D in Computer Science', '2021-08-01', 'ACTIVE'
FROM users u
CROSS JOIN (SELECT id FROM departments WHERE code = 'CSE' LIMIT 1) d
WHERE u.username = 'demo_faculty'
  AND NOT EXISTS (SELECT 1 FROM faculty f WHERE f.user_id = u.id);

-- 6. Student Profile for demo_student
INSERT INTO students (user_id, department_id, program_id, section_id, register_number, roll_number, admission_year, current_semester, status)
SELECT u.id, d.id, p.id, s.id, 'REG-DEMO-001', 'DEMO-CS-001', 2023, 5, 'ACTIVE'
FROM users u
CROSS JOIN (SELECT id FROM departments WHERE code = 'CSE' LIMIT 1) d
CROSS JOIN (SELECT id FROM programs WHERE code = 'B01' LIMIT 1) p
CROSS JOIN (SELECT id FROM sections LIMIT 1) s
WHERE u.username = 'demo_student'
  AND NOT EXISTS (SELECT 1 FROM students st WHERE st.user_id = u.id);

-- 7. Warden Profile for demo_warden & Hostel Assignment
INSERT INTO wardens (user_id, employee_id, contact_number, status)
SELECT u.id, 'EMP-DEMO-WRD', '+91-9876543299', 'ACTIVE'
FROM users u
WHERE u.username = 'demo_warden'
  AND NOT EXISTS (SELECT 1 FROM wardens w WHERE w.user_id = u.id);

INSERT INTO warden_hostels (warden_id, hostel_id, assigned_at)
SELECT w.id, h.id, CURRENT_TIMESTAMP(6)
FROM users u
JOIN wardens w ON w.user_id = u.id
CROSS JOIN (SELECT id FROM hostels LIMIT 1) h
WHERE u.username = 'demo_warden'
  AND NOT EXISTS (SELECT 1 FROM warden_hostels wh WHERE wh.warden_id = w.id AND wh.hostel_id = h.id);

-- 8. Backfill department_id on academic_resource_requests where missing
UPDATE academic_resource_requests arr 
LEFT JOIN faculty f ON f.user_id = arr.requester_user_id 
LEFT JOIN resources r ON r.id = arr.requested_resource_id 
SET arr.department_id = COALESCE(f.department_id, r.department_id, 1) 
WHERE arr.department_id IS NULL;

-- 9. Backfill approvals table for existing requests
INSERT INTO approvals (entity_type, entity_id, requested_by, approved_by, approval_level, status, comments, created_at, updated_at)
SELECT 'AcademicResourceRequest', arr.id, arr.requester_user_id, CASE WHEN arr.status = 'APPROVED' THEN 2 ELSE NULL END, 'HOD', arr.status, 
CASE WHEN arr.status = 'APPROVED' THEN 'Approved for academic curriculum delivery' 
     WHEN arr.status = 'REJECTED' THEN 'Resource scheduling conflict / Capacity constraint' 
     ELSE 'Awaiting HOD review' END, arr.created_at, arr.updated_at 
FROM academic_resource_requests arr 
WHERE NOT EXISTS (SELECT 1 FROM approvals a WHERE a.entity_type = 'AcademicResourceRequest' AND a.entity_id = arr.id);

INSERT INTO approvals (entity_type, entity_id, requested_by, approved_by, approval_level, status, comments, created_at, updated_at)
SELECT 'HostelRequest', hr.id, s.user_id, CASE WHEN hr.status = 'APPROVED' THEN 6 ELSE NULL END, 'WARDEN', hr.status, 
CASE WHEN hr.status = 'APPROVED' THEN 'Eligible for residential accommodation' 
     WHEN hr.status = 'REJECTED' THEN 'Room capacity fully occupied for selected preference' 
     ELSE 'Awaiting Warden verification' END, hr.created_at, hr.updated_at 
FROM hostel_requests hr 
JOIN students s ON hr.student_id = s.id 
WHERE NOT EXISTS (SELECT 1 FROM approvals a WHERE a.entity_type = 'HostelRequest' AND a.entity_id = hr.id);
