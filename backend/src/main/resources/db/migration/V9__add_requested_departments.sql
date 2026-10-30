-- ==============================================================================
-- AHRAO Database Migration: V9__add_requested_departments.sql
-- Domain: Add requested departments (ECE, AIML, CCE, IT), align ME to MECH, and seed programs, faculty & HODs
-- ==============================================================================

-- 1. Align Mechanical Engineering department code to MECH
UPDATE departments SET code = 'MECH' WHERE code = 'ME' AND institution_id = 1;

-- 2. Clean up legacy duplicate active HOD for department 1
UPDATE department_hods SET status = 'INACTIVE' WHERE id = 1;

-- 3. Insert Requested Academic Departments (ECE, AIML, CCE, IT)
INSERT INTO departments (institution_id, name, code, description, status, created_at, updated_at)
SELECT 1, 'Electronics & Communication Engineering', 'ECE', 'Department of Electronics & Communication Engineering', 'ACTIVE', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code = 'ECE' AND institution_id = 1);

INSERT INTO departments (institution_id, name, code, description, status, created_at, updated_at)
SELECT 1, 'Artificial Intelligence & Machine Learning', 'AIML', 'Department of Artificial Intelligence & Machine Learning', 'ACTIVE', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code = 'AIML' AND institution_id = 1);

INSERT INTO departments (institution_id, name, code, description, status, created_at, updated_at)
SELECT 1, 'Computer & Communication Engineering', 'CCE', 'Department of Computer & Communication Engineering', 'ACTIVE', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code = 'CCE' AND institution_id = 1);

INSERT INTO departments (institution_id, name, code, description, status, created_at, updated_at)
SELECT 1, 'Information Technology', 'IT', 'Department of Information Technology', 'ACTIVE', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code = 'IT' AND institution_id = 1);

-- 4. Degree Programs for the new departments
-- ECE Programs
INSERT INTO programs (department_id, name, code, degree_type, duration_years, status, created_at, updated_at)
SELECT d.id, 'B.E Electronics & Communication Engineering', 'B31', 'B_TECH', 4, 'ACTIVE', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
FROM departments d WHERE d.code = 'ECE' AND d.institution_id = 1
AND NOT EXISTS (SELECT 1 FROM programs p WHERE p.department_id = d.id AND p.code = 'B31');

INSERT INTO programs (department_id, name, code, degree_type, duration_years, status, created_at, updated_at)
SELECT d.id, 'M.E VLSI Design & Embedded Systems', 'G11', 'M_TECH', 2, 'ACTIVE', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
FROM departments d WHERE d.code = 'ECE' AND d.institution_id = 1
AND NOT EXISTS (SELECT 1 FROM programs p WHERE p.department_id = d.id AND p.code = 'G11');

-- AIML Programs
INSERT INTO programs (department_id, name, code, degree_type, duration_years, status, created_at, updated_at)
SELECT d.id, 'B.Tech Artificial Intelligence & Machine Learning', 'B32', 'B_TECH', 4, 'ACTIVE', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
FROM departments d WHERE d.code = 'AIML' AND d.institution_id = 1
AND NOT EXISTS (SELECT 1 FROM programs p WHERE p.department_id = d.id AND p.code = 'B32');

INSERT INTO programs (department_id, name, code, degree_type, duration_years, status, created_at, updated_at)
SELECT d.id, 'M.Tech Cognitive Systems & Deep Learning', 'G12', 'M_TECH', 2, 'ACTIVE', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
FROM departments d WHERE d.code = 'AIML' AND d.institution_id = 1
AND NOT EXISTS (SELECT 1 FROM programs p WHERE p.department_id = d.id AND p.code = 'G12');

-- CCE Programs
INSERT INTO programs (department_id, name, code, degree_type, duration_years, status, created_at, updated_at)
SELECT d.id, 'B.E Computer & Communication Engineering', 'B33', 'B_TECH', 4, 'ACTIVE', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
FROM departments d WHERE d.code = 'CCE' AND d.institution_id = 1
AND NOT EXISTS (SELECT 1 FROM programs p WHERE p.department_id = d.id AND p.code = 'B33');

INSERT INTO programs (department_id, name, code, degree_type, duration_years, status, created_at, updated_at)
SELECT d.id, 'M.Tech Networks & Communication Engineering', 'G13', 'M_TECH', 2, 'ACTIVE', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
FROM departments d WHERE d.code = 'CCE' AND d.institution_id = 1
AND NOT EXISTS (SELECT 1 FROM programs p WHERE p.department_id = d.id AND p.code = 'G13');

-- IT Programs
INSERT INTO programs (department_id, name, code, degree_type, duration_years, status, created_at, updated_at)
SELECT d.id, 'B.Tech Information Technology', 'B34', 'B_TECH', 4, 'ACTIVE', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
FROM departments d WHERE d.code = 'IT' AND d.institution_id = 1
AND NOT EXISTS (SELECT 1 FROM programs p WHERE p.department_id = d.id AND p.code = 'B34');

INSERT INTO programs (department_id, name, code, degree_type, duration_years, status, created_at, updated_at)
SELECT d.id, 'M.Tech Cloud Computing & Big Data Analytics', 'G14', 'M_TECH', 2, 'ACTIVE', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
FROM departments d WHERE d.code = 'IT' AND d.institution_id = 1
AND NOT EXISTS (SELECT 1 FROM programs p WHERE p.department_id = d.id AND p.code = 'G14');

-- 5. Academic Resources for the new departments
-- ECE Resources
INSERT INTO resources (institution_id, department_id, category_id, name, code, description, capacity, location, status, quantity, available_quantity)
SELECT 1, d.id, 2, 'Digital Signal Processing & VLSI Lab', 'RES-ECE-LAB-01', 'High-end DSP kits, FPGA development boards, and cadence tools', 60, 'Tech Block C - Room 204', 'AVAILABLE', 1, 1
FROM departments d WHERE d.code = 'ECE' AND d.institution_id = 1
AND NOT EXISTS (SELECT 1 FROM resources WHERE code = 'RES-ECE-LAB-01');

INSERT INTO resources (institution_id, department_id, category_id, name, code, description, capacity, location, status, quantity, available_quantity)
SELECT 1, d.id, 1, 'ECE Smart Lecture Hall 301', 'RES-ECE-CR-01', 'Tiered lecture theater with interactive projection and lecture capture', 70, 'Tech Block C - Room 301', 'AVAILABLE', 1, 1
FROM departments d WHERE d.code = 'ECE' AND d.institution_id = 1
AND NOT EXISTS (SELECT 1 FROM resources WHERE code = 'RES-ECE-CR-01');

-- AIML Resources
INSERT INTO resources (institution_id, department_id, category_id, name, code, description, capacity, location, status, quantity, available_quantity)
SELECT 1, d.id, 2, 'AI & Deep Learning GPU Research Lab', 'RES-AIML-LAB-01', 'NVIDIA GPU clusters, PyTorch/TensorFlow environments, and edge AI kits', 60, 'Innovation Center - Level 3', 'AVAILABLE', 1, 1
FROM departments d WHERE d.code = 'AIML' AND d.institution_id = 1
AND NOT EXISTS (SELECT 1 FROM resources WHERE code = 'RES-AIML-LAB-01');

INSERT INTO resources (institution_id, department_id, category_id, name, code, description, capacity, location, status, quantity, available_quantity)
SELECT 1, d.id, 1, 'AIML Smart Interactive Studio', 'RES-AIML-CR-01', 'Collaborative learning classroom with dual digital displays', 65, 'Innovation Center - Level 2', 'AVAILABLE', 1, 1
FROM departments d WHERE d.code = 'AIML' AND d.institution_id = 1
AND NOT EXISTS (SELECT 1 FROM resources WHERE code = 'RES-AIML-CR-01');

-- CCE Resources
INSERT INTO resources (institution_id, department_id, category_id, name, code, description, capacity, location, status, quantity, available_quantity)
SELECT 1, d.id, 2, 'Computer & Communication Networking Lab', 'RES-CCE-LAB-01', 'Cisco networking racks, SDR transceivers, and optical communication rigs', 60, 'Tech Block B - Room 108', 'AVAILABLE', 1, 1
FROM departments d WHERE d.code = 'CCE' AND d.institution_id = 1
AND NOT EXISTS (SELECT 1 FROM resources WHERE code = 'RES-CCE-LAB-01');

INSERT INTO resources (institution_id, department_id, category_id, name, code, description, capacity, location, status, quantity, available_quantity)
SELECT 1, d.id, 1, 'CCE Lecture Theater 202', 'RES-CCE-CR-01', 'Multimedia enabled interactive smart hall', 65, 'Tech Block B - Room 202', 'AVAILABLE', 1, 1
FROM departments d WHERE d.code = 'CCE' AND d.institution_id = 1
AND NOT EXISTS (SELECT 1 FROM resources WHERE code = 'RES-CCE-CR-01');

-- IT Resources
INSERT INTO resources (institution_id, department_id, category_id, name, code, description, capacity, location, status, quantity, available_quantity)
SELECT 1, d.id, 2, 'Cloud Infrastructure & Enterprise Systems Lab', 'RES-IT-LAB-01', 'Private cloud testbed, container orchestration rigs, and enterprise blade nodes', 60, 'IT Tower - Room 401', 'AVAILABLE', 1, 1
FROM departments d WHERE d.code = 'IT' AND d.institution_id = 1
AND NOT EXISTS (SELECT 1 FROM resources WHERE code = 'RES-IT-LAB-01');

INSERT INTO resources (institution_id, department_id, category_id, name, code, description, capacity, location, status, quantity, available_quantity)
SELECT 1, d.id, 1, 'Information Technology Smart Hall 405', 'RES-IT-CR-01', 'Acoustically tuned smart hall with modern podium and presentation gear', 70, 'IT Tower - Room 405', 'AVAILABLE', 1, 1
FROM departments d WHERE d.code = 'IT' AND d.institution_id = 1
AND NOT EXISTS (SELECT 1 FROM resources WHERE code = 'RES-IT-CR-01');

-- 6. HOD and Faculty Users for the new departments
INSERT INTO users (username, email, password_hash, first_name, last_name, status, created_at, updated_at)
SELECT 'hod_ece', 'hod.ece@ahrao.edu', '$2a$10$XkWuGXcOu8FVCjB5xeYQK.JKZb7ocg4p1aNRjD7f8h226RM2P9GCO', 'Dr. Senthil', 'Kumar', 'ACTIVE', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'hod_ece');

INSERT INTO users (username, email, password_hash, first_name, last_name, status, created_at, updated_at)
SELECT 'hod_aiml', 'hod.aiml@ahrao.edu', '$2a$10$XkWuGXcOu8FVCjB5xeYQK.JKZb7ocg4p1aNRjD7f8h226RM2P9GCO', 'Dr. Ananya', 'Sharma', 'ACTIVE', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'hod_aiml');

INSERT INTO users (username, email, password_hash, first_name, last_name, status, created_at, updated_at)
SELECT 'hod_cce', 'hod.cce@ahrao.edu', '$2a$10$XkWuGXcOu8FVCjB5xeYQK.JKZb7ocg4p1aNRjD7f8h226RM2P9GCO', 'Dr. Rajesh', 'Kannan', 'ACTIVE', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'hod_cce');

INSERT INTO users (username, email, password_hash, first_name, last_name, status, created_at, updated_at)
SELECT 'hod_it', 'hod.it@ahrao.edu', '$2a$10$XkWuGXcOu8FVCjB5xeYQK.JKZb7ocg4p1aNRjD7f8h226RM2P9GCO', 'Dr. Meenakshi', 'Sundaram', 'ACTIVE', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'hod_it');

-- User roles for new HODs
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, 3 FROM users u WHERE u.username IN ('hod_ece', 'hod_aiml', 'hod_cce', 'hod_it')
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = 3);

-- Faculty profiles for new HODs
INSERT INTO faculty (user_id, department_id, employee_id, designation, qualification, joining_date, status)
SELECT u.id, d.id, 'EMP-HOD-ECE', 'Professor & Head of Department', 'Ph.D in Electronics & Embedded Systems', '2017-06-01', 'ACTIVE'
FROM users u CROSS JOIN (SELECT id FROM departments WHERE code = 'ECE' AND institution_id = 1 LIMIT 1) d
WHERE u.username = 'hod_ece' AND NOT EXISTS (SELECT 1 FROM faculty f WHERE f.user_id = u.id);

INSERT INTO faculty (user_id, department_id, employee_id, designation, qualification, joining_date, status)
SELECT u.id, d.id, 'EMP-HOD-AIML', 'Professor & Head of Department', 'Ph.D in Artificial Intelligence & Deep Learning', '2019-01-15', 'ACTIVE'
FROM users u CROSS JOIN (SELECT id FROM departments WHERE code = 'AIML' AND institution_id = 1 LIMIT 1) d
WHERE u.username = 'hod_aiml' AND NOT EXISTS (SELECT 1 FROM faculty f WHERE f.user_id = u.id);

INSERT INTO faculty (user_id, department_id, employee_id, designation, qualification, joining_date, status)
SELECT u.id, d.id, 'EMP-HOD-CCE', 'Professor & Head of Department', 'Ph.D in Computer Networks & Wireless Comm', '2018-07-01', 'ACTIVE'
FROM users u CROSS JOIN (SELECT id FROM departments WHERE code = 'CCE' AND institution_id = 1 LIMIT 1) d
WHERE u.username = 'hod_cce' AND NOT EXISTS (SELECT 1 FROM faculty f WHERE f.user_id = u.id);

INSERT INTO faculty (user_id, department_id, employee_id, designation, qualification, joining_date, status)
SELECT u.id, d.id, 'EMP-HOD-IT', 'Professor & Head of Department', 'Ph.D in Cloud Computing & Distributed Systems', '2016-11-01', 'ACTIVE'
FROM users u CROSS JOIN (SELECT id FROM departments WHERE code = 'IT' AND institution_id = 1 LIMIT 1) d
WHERE u.username = 'hod_it' AND NOT EXISTS (SELECT 1 FROM faculty f WHERE f.user_id = u.id);

-- Department HOD assignments
INSERT INTO department_hods (department_id, faculty_id, start_date, status)
SELECT f.department_id, f.id, '2023-01-01', 'ACTIVE'
FROM users u JOIN faculty f ON f.user_id = u.id
WHERE u.username IN ('hod_ece', 'hod_aiml', 'hod_cce', 'hod_it')
AND NOT EXISTS (SELECT 1 FROM department_hods dh WHERE dh.faculty_id = f.id);
