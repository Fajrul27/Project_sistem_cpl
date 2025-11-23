-- ============================================
-- SISTEM CPL - MySQL Database Schema
-- ============================================
-- Created: November 4, 2024
-- Database: sistem_cpl
-- Charset: utf8mb4
-- Collation: utf8mb4_unicode_ci
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS sistem_cpl 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE sistem_cpl;

-- ============================================
-- 1. USERS TABLE
-- ============================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    INDEX idx_email (email),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. USER ROLES TABLE
-- ============================================
DROP TABLE IF EXISTS user_roles;
CREATE TABLE user_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('admin', 'dosen', 'mahasiswa') NOT NULL DEFAULT 'mahasiswa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id),
    INDEX idx_role (role),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. PROFILES TABLE
-- ============================================
DROP TABLE IF EXISTS profiles;
CREATE TABLE profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    nama_lengkap VARCHAR(255) DEFAULT NULL,
    nim VARCHAR(20) DEFAULT NULL UNIQUE,
    nip VARCHAR(20) DEFAULT NULL UNIQUE,
    program_studi VARCHAR(100) DEFAULT NULL,
    semester INT DEFAULT NULL CHECK (semester BETWEEN 1 AND 8),
    tahun_masuk INT DEFAULT NULL,
    alamat TEXT DEFAULT NULL,
    no_telepon VARCHAR(20) DEFAULT NULL,
    foto_profile VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_nim (nim),
    INDEX idx_nip (nip),
    INDEX idx_prodi (program_studi),
    INDEX idx_semester (semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MAHASISWA TABLE (physical table)
-- ============================================
DROP TABLE IF EXISTS mahasiswa;
CREATE TABLE mahasiswa (
    id            VARCHAR(36) PRIMARY KEY,
    user_id       VARCHAR(36) NOT NULL UNIQUE,
    nama_lengkap  VARCHAR(255) NOT NULL,
    nim           VARCHAR(20)  NOT NULL UNIQUE,
    program_studi VARCHAR(100) DEFAULT NULL,
    semester      INT          DEFAULT NULL CHECK (semester BETWEEN 1 AND 8),
    tahun_masuk   INT          DEFAULT NULL,
    alamat        TEXT         DEFAULT NULL,
    no_telepon    VARCHAR(20)  DEFAULT NULL,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_mahasiswa_user
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_mahasiswa_nim      (nim),
    INDEX idx_mahasiswa_prodi    (program_studi),
    INDEX idx_mahasiswa_semester (semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. CPL TABLE (Capaian Pembelajaran Lulusan)
-- ============================================
DROP TABLE IF EXISTS cpl;
CREATE TABLE cpl (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    kode_cpl VARCHAR(20) NOT NULL UNIQUE,
    deskripsi TEXT NOT NULL,
    kategori VARCHAR(50) DEFAULT NULL,
    bobot DECIMAL(3,2) DEFAULT 1.00 CHECK (bobot >= 0 AND bobot <= 5),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36) DEFAULT NULL,
    INDEX idx_kode_cpl (kode_cpl),
    INDEX idx_kategori (kategori),
    INDEX idx_active (is_active),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. MATA KULIAH TABLE
-- ============================================
DROP TABLE IF EXISTS mata_kuliah;
CREATE TABLE mata_kuliah (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    kode_mk VARCHAR(20) NOT NULL UNIQUE,
    nama_mk VARCHAR(255) NOT NULL,
    sks INT NOT NULL CHECK (sks BETWEEN 1 AND 6),
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    deskripsi TEXT DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36) DEFAULT NULL,
    INDEX idx_kode_mk (kode_mk),
    INDEX idx_semester (semester),
    INDEX idx_active (is_active),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. CPL - MATA KULIAH MAPPING TABLE
-- ============================================
DROP TABLE IF EXISTS cpl_mata_kuliah;
CREATE TABLE cpl_mata_kuliah (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    cpl_id VARCHAR(36) NOT NULL,
    mata_kuliah_id VARCHAR(36) NOT NULL,
    bobot_kontribusi DECIMAL(3,2) DEFAULT 1.00 CHECK (bobot_kontribusi >= 0 AND bobot_kontribusi <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cpl_id) REFERENCES cpl(id) ON DELETE CASCADE,
    FOREIGN KEY (mata_kuliah_id) REFERENCES mata_kuliah(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cpl_mk (cpl_id, mata_kuliah_id),
    INDEX idx_cpl_id (cpl_id),
    INDEX idx_mk_id (mata_kuliah_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. NILAI CPL TABLE
-- ============================================
DROP TABLE IF EXISTS nilai_cpl;
CREATE TABLE nilai_cpl (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    mahasiswa_id VARCHAR(36) NOT NULL,
    cpl_id VARCHAR(36) NOT NULL,
    mata_kuliah_id VARCHAR(36) NOT NULL,
    nilai DECIMAL(5,2) NOT NULL CHECK (nilai BETWEEN 0 AND 100),
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    tahun_ajaran VARCHAR(10) NOT NULL,
    catatan TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36) DEFAULT NULL,
    FOREIGN KEY (mahasiswa_id) REFERENCES profiles(user_id) ON DELETE CASCADE,
    FOREIGN KEY (cpl_id) REFERENCES cpl(id) ON DELETE CASCADE,
    FOREIGN KEY (mata_kuliah_id) REFERENCES mata_kuliah(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_mahasiswa_id (mahasiswa_id),
    INDEX idx_cpl_id (cpl_id),
    INDEX idx_mk_id (mata_kuliah_id),
    INDEX idx_semester (semester),
    INDEX idx_tahun_ajaran (tahun_ajaran)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. SESSIONS TABLE (untuk authentication)
-- ============================================
DROP TABLE IF EXISTS sessions;
CREATE TABLE sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. AUDIT LOG TABLE
-- ============================================
DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) DEFAULT NULL,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(36) DEFAULT NULL,
    old_data JSON DEFAULT NULL,
    new_data JSON DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE DATA / SEED DATA
-- ============================================

-- Insert Admin User (password: admin123)
-- Note: In production, use proper password hashing (bcrypt)
INSERT INTO users (id, email, password_hash, email_verified) VALUES
('admin-001', 'admin@sistem-cpl.ac.id', '$2a$10$rKLVJKmDjKDXJKjL5xYHZu.wYH7I9qk8xQWJ0NuJ3aJXYZWJKmDjK', TRUE);

INSERT INTO user_roles (user_id, role) VALUES
('admin-001', 'admin');

INSERT INTO profiles (id, user_id, nama_lengkap, nip) VALUES
('admin-001', 'admin-001', 'Administrator System', '198800000001');

-- Insert Sample Dosen
INSERT INTO users (id, email, password_hash, email_verified) VALUES
('dosen-001', 'dosen1@sistem-cpl.ac.id', '$2a$10$rKLVJKmDjKDXJKjL5xYHZu.wYH7I9qk8xQWJ0NuJ3aJXYZWJKmDjK', TRUE),
('dosen-002', 'dosen2@sistem-cpl.ac.id', '$2a$10$rKLVJKmDjKDXJKjL5xYHZu.wYH7I9qk8xQWJ0NuJ3aJXYZWJKmDjK', TRUE);

INSERT INTO user_roles (user_id, role) VALUES
('dosen-001', 'dosen'),
('dosen-002', 'dosen');

INSERT INTO profiles (id, user_id, nama_lengkap, nip, program_studi) VALUES
('dosen-001', 'dosen-001', 'Dr. Budi Santoso, M.Kom', '198801010001', 'Teknik Informatika'),
('dosen-002', 'dosen-002', 'Dr. Siti Aisyah, M.T', '198802020002', 'Teknik Informatika');

-- Insert Sample Mahasiswa
INSERT INTO users (id, email, password_hash, email_verified) VALUES
('mhs-001', 'mahasiswa1@student.ac.id', '$2a$10$rKLVJKmDjKDXJKjL5xYHZu.wYH7I9qk8xQWJ0NuJ3aJXYZWJKmDjK', TRUE),
('mhs-002', 'mahasiswa2@student.ac.id', '$2a$10$rKLVJKmDjKDXJKjL5xYHZu.wYH7I9qk8xQWJ0NuJ3aJXYZWJKmDjK', TRUE),
('mhs-003', 'mahasiswa3@student.ac.id', '$2a$10$rKLVJKmDjKDXJKjL5xYHZu.wYH7I9qk8xQWJ0NuJ3aJXYZWJKmDjK', TRUE);

INSERT INTO user_roles (user_id, role) VALUES
('mhs-001', 'mahasiswa'),
('mhs-002', 'mahasiswa'),
('mhs-003', 'mahasiswa');

INSERT INTO profiles (id, user_id, nama_lengkap, nim, program_studi, semester, tahun_masuk) VALUES
('mhs-001', 'mhs-001', 'Ahmad Rizki Wijaya', '2101010001', 'Teknik Informatika', 5, 2021),
('mhs-002', 'mhs-002', 'Siti Nurhaliza', '2101010002', 'Teknik Informatika', 5, 2021),
('mhs-003', 'mhs-003', 'Budi Hartono', '2101010003', 'Teknik Informatika', 5, 2021);

-- Isi tabel mahasiswa dari data profiles + user_roles (role = 'mahasiswa')
INSERT INTO mahasiswa (
    id,
    user_id,
    nama_lengkap,
    nim,
    program_studi,
    semester,
    tahun_masuk,
    alamat,
    no_telepon
)
SELECT
    p.id,
    p.user_id,
    p.nama_lengkap,
    p.nim,
    p.program_studi,
    p.semester,
    p.tahun_masuk,
    p.alamat,
    p.no_telepon
FROM profiles p
JOIN user_roles ur ON ur.user_id = p.user_id AND ur.role = 'mahasiswa';

-- Insert Sample CPL
INSERT INTO cpl (id, kode_cpl, deskripsi, kategori, bobot) VALUES
('cpl-001', 'CPL-01', 'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan atau implementasi ilmu pengetahuan dan teknologi', 'Sikap', 1.0),
('cpl-002', 'CPL-02', 'Menguasai konsep teoretis dan prinsip rekayasa perangkat lunak', 'Pengetahuan', 1.0),
('cpl-003', 'CPL-03', 'Mampu merancang dan mengimplementasikan sistem informasi', 'Keterampilan Umum', 1.0),
('cpl-004', 'CPL-04', 'Mampu bekerja sama dalam tim multidisiplin', 'Keterampilan Khusus', 1.0),
('cpl-005', 'CPL-05', 'Mampu mengidentifikasi, menganalisis, dan merumuskan solusi permasalahan', 'Keterampilan Umum', 1.0);

-- Insert Sample Mata Kuliah
INSERT INTO mata_kuliah (id, kode_mk, nama_mk, sks, semester) VALUES
('mk-001', 'IF-101', 'Pemrograman Dasar', 3, 1),
('mk-002', 'IF-102', 'Algoritma dan Struktur Data', 3, 2),
('mk-003', 'IF-201', 'Basis Data', 3, 3),
('mk-004', 'IF-202', 'Pemrograman Web', 3, 4),
('mk-005', 'IF-301', 'Rekayasa Perangkat Lunak', 3, 5),
('mk-006', 'IF-302', 'Sistem Informasi', 3, 5),
('mk-007', 'IF-401', 'Machine Learning', 3, 7);

-- Insert CPL - Mata Kuliah Mapping
INSERT INTO cpl_mata_kuliah (cpl_id, mata_kuliah_id, bobot_kontribusi) VALUES
-- IF-101: Pemrograman Dasar
('cpl-001', 'mk-001', 1.0),
('cpl-003', 'mk-001', 1.0),
-- IF-102: Algoritma
('cpl-001', 'mk-002', 1.0),
('cpl-002', 'mk-002', 1.0),
('cpl-005', 'mk-002', 1.0),
-- IF-201: Basis Data
('cpl-002', 'mk-003', 1.0),
('cpl-003', 'mk-003', 1.0),
-- IF-202: Web
('cpl-002', 'mk-004', 1.0),
('cpl-003', 'mk-004', 1.0),
('cpl-004', 'mk-004', 1.0),
-- IF-301: RPL
('cpl-002', 'mk-005', 1.5),
('cpl-003', 'mk-005', 1.5),
('cpl-004', 'mk-005', 1.0),
('cpl-005', 'mk-005', 1.0),
-- IF-302: SI
('cpl-003', 'mk-006', 1.0),
('cpl-004', 'mk-006', 1.0),
-- IF-401: ML
('cpl-002', 'mk-007', 1.0),
('cpl-005', 'mk-007', 1.5);

-- Insert Sample Nilai CPL
INSERT INTO nilai_cpl (mahasiswa_id, cpl_id, mata_kuliah_id, nilai, semester, tahun_ajaran, created_by) VALUES
-- Mahasiswa 1 - Semester 1-5
('mhs-001', 'cpl-001', 'mk-001', 85.00, 1, '2021/2022', 'dosen-001'),
('mhs-001', 'cpl-003', 'mk-001', 82.00, 1, '2021/2022', 'dosen-001'),
('mhs-001', 'cpl-001', 'mk-002', 88.00, 2, '2021/2022', 'dosen-001'),
('mhs-001', 'cpl-002', 'mk-002', 85.00, 2, '2021/2022', 'dosen-001'),
('mhs-001', 'cpl-005', 'mk-002', 87.00, 2, '2021/2022', 'dosen-001'),
('mhs-001', 'cpl-002', 'mk-003', 90.00, 3, '2022/2023', 'dosen-002'),
('mhs-001', 'cpl-003', 'mk-003', 88.00, 3, '2022/2023', 'dosen-002'),
('mhs-001', 'cpl-002', 'mk-004', 85.00, 4, '2022/2023', 'dosen-002'),
('mhs-001', 'cpl-003', 'mk-004', 87.00, 4, '2022/2023', 'dosen-002'),
('mhs-001', 'cpl-004', 'mk-004', 90.00, 4, '2022/2023', 'dosen-002'),
('mhs-001', 'cpl-002', 'mk-005', 92.00, 5, '2023/2024', 'dosen-001'),
('mhs-001', 'cpl-003', 'mk-005', 90.00, 5, '2023/2024', 'dosen-001'),
('mhs-001', 'cpl-004', 'mk-005', 88.00, 5, '2023/2024', 'dosen-001'),
('mhs-001', 'cpl-005', 'mk-005', 89.00, 5, '2023/2024', 'dosen-001'),

-- Mahasiswa 2 - Semester 1-5
('mhs-002', 'cpl-001', 'mk-001', 78.00, 1, '2021/2022', 'dosen-001'),
('mhs-002', 'cpl-003', 'mk-001', 80.00, 1, '2021/2022', 'dosen-001'),
('mhs-002', 'cpl-001', 'mk-002', 82.00, 2, '2021/2022', 'dosen-001'),
('mhs-002', 'cpl-002', 'mk-002', 79.00, 2, '2021/2022', 'dosen-001'),
('mhs-002', 'cpl-005', 'mk-002', 81.00, 2, '2021/2022', 'dosen-001'),
('mhs-002', 'cpl-002', 'mk-003', 85.00, 3, '2022/2023', 'dosen-002'),
('mhs-002', 'cpl-003', 'mk-003', 83.00, 3, '2022/2023', 'dosen-002'),
('mhs-002', 'cpl-002', 'mk-004', 80.00, 4, '2022/2023', 'dosen-002'),
('mhs-002', 'cpl-003', 'mk-004', 82.00, 4, '2022/2023', 'dosen-002'),
('mhs-002', 'cpl-004', 'mk-004', 85.00, 4, '2022/2023', 'dosen-002'),
('mhs-002', 'cpl-002', 'mk-005', 87.00, 5, '2023/2024', 'dosen-001'),
('mhs-002', 'cpl-003', 'mk-005', 85.00, 5, '2023/2024', 'dosen-001'),
('mhs-002', 'cpl-004', 'mk-005', 83.00, 5, '2023/2024', 'dosen-001'),
('mhs-002', 'cpl-005', 'mk-005', 84.00, 5, '2023/2024', 'dosen-001'),

-- Mahasiswa 3 - Semester 1-5
('mhs-003', 'cpl-001', 'mk-001', 92.00, 1, '2021/2022', 'dosen-001'),
('mhs-003', 'cpl-003', 'mk-001', 90.00, 1, '2021/2022', 'dosen-001'),
('mhs-003', 'cpl-001', 'mk-002', 95.00, 2, '2021/2022', 'dosen-001'),
('mhs-003', 'cpl-002', 'mk-002', 93.00, 2, '2021/2022', 'dosen-001'),
('mhs-003', 'cpl-005', 'mk-002', 94.00, 2, '2021/2022', 'dosen-001'),
('mhs-003', 'cpl-002', 'mk-003', 96.00, 3, '2022/2023', 'dosen-002'),
('mhs-003', 'cpl-003', 'mk-003', 94.00, 3, '2022/2023', 'dosen-002'),
('mhs-003', 'cpl-002', 'mk-004', 92.00, 4, '2022/2023', 'dosen-002'),
('mhs-003', 'cpl-003', 'mk-004', 93.00, 4, '2022/2023', 'dosen-002'),
('mhs-003', 'cpl-004', 'mk-004', 95.00, 4, '2022/2023', 'dosen-002'),
('mhs-003', 'cpl-002', 'mk-005', 97.00, 5, '2023/2024', 'dosen-001'),
('mhs-003', 'cpl-003', 'mk-005', 95.00, 5, '2023/2024', 'dosen-001'),
('mhs-003', 'cpl-004', 'mk-005', 93.00, 5, '2023/2024', 'dosen-001'),
('mhs-003', 'cpl-005', 'mk-005', 94.00, 5, '2023/2024', 'dosen-001');

-- ============================================
-- USEFUL VIEWS
-- ============================================

-- View: User dengan Role dan Profile
CREATE OR REPLACE VIEW v_user_details AS
SELECT 
    u.id AS user_id,
    u.email,
    u.is_active,
    u.last_login,
    ur.role,
    p.nama_lengkap,
    p.nim,
    p.nip,
    p.program_studi,
    p.semester
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN profiles p ON u.id = p.user_id;

-- View: Daftar Mahasiswa (tabel mahasiswa virtual)
CREATE OR REPLACE VIEW v_mahasiswa AS
SELECT
    u.id           AS user_id,
    u.email,
    u.is_active,
    u.last_login,
    p.nama_lengkap,
    p.nim,
    p.program_studi,
    p.semester,
    p.tahun_masuk,
    p.alamat,
    p.no_telepon
FROM users u
INNER JOIN user_roles ur ON u.id = ur.user_id AND ur.role = 'mahasiswa'
INNER JOIN profiles   p  ON p.user_id = u.id;

-- View: Summary Nilai per Mahasiswa
CREATE OR REPLACE VIEW v_mahasiswa_summary AS
SELECT 
    p.user_id,
    p.nama_lengkap,
    p.nim,
    p.program_studi,
    p.semester,
    COUNT(DISTINCT nc.cpl_id) AS total_cpl_assessed,
    AVG(nc.nilai) AS rata_rata_nilai,
    MIN(nc.nilai) AS nilai_terendah,
    MAX(nc.nilai) AS nilai_tertinggi
FROM profiles p
LEFT JOIN nilai_cpl nc ON p.user_id = nc.mahasiswa_id
WHERE p.nim IS NOT NULL
GROUP BY p.user_id, p.nama_lengkap, p.nim, p.program_studi, p.semester;

-- View: Summary Nilai per CPL
CREATE OR REPLACE VIEW v_cpl_summary AS
SELECT 
    c.id AS cpl_id,
    c.kode_cpl,
    c.deskripsi,
    c.kategori,
    COUNT(DISTINCT nc.mahasiswa_id) AS total_mahasiswa,
    AVG(nc.nilai) AS rata_rata_nilai,
    MIN(nc.nilai) AS nilai_terendah,
    MAX(nc.nilai) AS nilai_tertinggi,
    COUNT(*) AS total_assessments
FROM cpl c
LEFT JOIN nilai_cpl nc ON c.id = nc.cpl_id
GROUP BY c.id, c.kode_cpl, c.deskripsi, c.kategori;

-- View: CPL per Mata Kuliah
CREATE OR REPLACE VIEW v_mk_cpl_mapping AS
SELECT 
    mk.id AS mk_id,
    mk.kode_mk,
    mk.nama_mk,
    mk.semester,
    c.id AS cpl_id,
    c.kode_cpl,
    c.deskripsi AS cpl_deskripsi,
    cm.bobot_kontribusi
FROM mata_kuliah mk
INNER JOIN cpl_mata_kuliah cm ON mk.id = cm.mata_kuliah_id
INNER JOIN cpl c ON cm.cpl_id = c.id;

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Procedure: Calculate Average CPL for a Student
DELIMITER $$

CREATE PROCEDURE sp_get_mahasiswa_cpl_average(
    IN p_mahasiswa_id VARCHAR(36)
)
BEGIN
    SELECT 
        c.kode_cpl,
        c.deskripsi,
        AVG(nc.nilai) AS rata_rata_nilai,
        COUNT(*) AS jumlah_assessment
    FROM nilai_cpl nc
    INNER JOIN cpl c ON nc.cpl_id = c.id
    WHERE nc.mahasiswa_id = p_mahasiswa_id
    GROUP BY c.id, c.kode_cpl, c.deskripsi
    ORDER BY c.kode_cpl;
END$$

-- Procedure: Get CPL Achievement by Semester
CREATE PROCEDURE sp_get_cpl_by_semester(
    IN p_semester INT
)
BEGIN
    SELECT 
        c.kode_cpl,
        c.deskripsi,
        AVG(nc.nilai) AS rata_rata_nilai,
        COUNT(DISTINCT nc.mahasiswa_id) AS jumlah_mahasiswa
    FROM nilai_cpl nc
    INNER JOIN cpl c ON nc.cpl_id = c.id
    WHERE nc.semester = p_semester
    GROUP BY c.id, c.kode_cpl, c.deskripsi
    ORDER BY c.kode_cpl;
END$$

DELIMITER ;

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Additional composite indexes
CREATE INDEX idx_nilai_mahasiswa_semester ON nilai_cpl(mahasiswa_id, semester);
CREATE INDEX idx_nilai_cpl_semester ON nilai_cpl(cpl_id, semester);
CREATE INDEX idx_nilai_mk_semester ON nilai_cpl(mata_kuliah_id, semester);

-- ============================================
-- DEFAULT CREDENTIALS
-- ============================================
-- Email: admin@sistem-cpl.ac.id
-- Password: admin123
-- 
-- Email: dosen1@sistem-cpl.ac.id
-- Password: admin123
-- 
-- Email: mahasiswa1@student.ac.id
-- Password: admin123
-- ============================================

-- End of Schema
