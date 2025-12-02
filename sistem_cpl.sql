-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 02, 2025 at 03:55 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sistem_cpl`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) NOT NULL,
  `user_id` varchar(191) DEFAULT NULL,
  `action` varchar(191) NOT NULL,
  `table_name` varchar(191) NOT NULL,
  `record_id` varchar(191) DEFAULT NULL,
  `old_data` longtext DEFAULT NULL,
  `new_data` longtext DEFAULT NULL,
  `ip_address` varchar(191) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cpl`
--

CREATE TABLE `cpl` (
  `id` varchar(191) NOT NULL,
  `kode_cpl` varchar(191) NOT NULL,
  `deskripsi` text NOT NULL,
  `kategori` varchar(191) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `created_by` varchar(191) DEFAULT NULL,
  `kategori_id` varchar(191) DEFAULT NULL,
  `prodi_id` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cpl`
--

INSERT INTO `cpl` (`id`, `kode_cpl`, `deskripsi`, `kategori`, `is_active`, `created_at`, `updated_at`, `created_by`, `kategori_id`, `prodi_id`) VALUES
('386cd3b5-4347-49d3-bcdf-bac2d6570879', 'CPL-10', 'Mampu melakukan pengamanan data dan sistem informasi', NULL, 1, '2025-12-01 16:47:17.865', '2025-12-01 16:47:17.865', '9197693b-0488-4735-96d4-3fcbe6915879', '9efa8000-a5dc-45cb-90c7-256f119d864f', 'a030d74c-45de-4937-ac55-95c0dded211f'),
('51850e8a-0d12-4871-a45c-05b2dc21a671', 'CPL-06', 'Mampu menunjukkan kinerja mandiri, bermutu, dan terukur', NULL, 1, '2025-12-01 16:47:17.853', '2025-12-01 16:47:17.853', '9197693b-0488-4735-96d4-3fcbe6915879', 'a36f0952-2dbe-4c6f-b1c4-7b2b756338b9', 'a030d74c-45de-4937-ac55-95c0dded211f'),
('570a38e7-f5a7-4642-b5cd-2aa01ddb05ba', 'CPL-02', 'Menjunjung tinggi nilai kemanusiaan dalam menjalankan tugas berdasarkan agama, moral, dan etika', NULL, 1, '2025-12-01 16:47:17.837', '2025-12-01 16:47:17.837', '9197693b-0488-4735-96d4-3fcbe6915879', 'd30e2abe-c85d-4091-a55f-8ddf10d9d45f', 'a030d74c-45de-4937-ac55-95c0dded211f'),
('5771505b-640f-4348-ae11-a98a2db91cf2', 'CPL-04', 'Menguasai konsep teoretis arsitektur, organisasi, dan sistem komputer', NULL, 1, '2025-12-01 16:47:17.845', '2025-12-01 16:47:17.845', '9197693b-0488-4735-96d4-3fcbe6915879', 'fd99248b-6936-4c32-822f-c92de970ca30', 'a030d74c-45de-4937-ac55-95c0dded211f'),
('bd76eca3-6732-4b70-999f-282b32d83191', 'CPL-07', 'Mampu merancang dan membangun aplikasi berbasis web', NULL, 1, '2025-12-01 16:47:17.856', '2025-12-01 16:47:17.856', '9197693b-0488-4735-96d4-3fcbe6915879', '9efa8000-a5dc-45cb-90c7-256f119d864f', 'a030d74c-45de-4937-ac55-95c0dded211f'),
('c659c742-f923-4642-8b45-bba455749ef1', 'CPL-03', 'Menguasai konsep teoretis sains alam, aplikasi matematika rekayasa', NULL, 1, '2025-12-01 16:47:17.841', '2025-12-01 16:47:17.841', '9197693b-0488-4735-96d4-3fcbe6915879', 'fd99248b-6936-4c32-822f-c92de970ca30', 'a030d74c-45de-4937-ac55-95c0dded211f'),
('de358d61-5934-4393-8c97-6eda2abd90bb', 'CPL-08', 'Mampu merancang dan membangun aplikasi berbasis mobile', NULL, 1, '2025-12-01 16:47:17.859', '2025-12-01 16:47:17.859', '9197693b-0488-4735-96d4-3fcbe6915879', '9efa8000-a5dc-45cb-90c7-256f119d864f', 'a030d74c-45de-4937-ac55-95c0dded211f'),
('e4e2a8f6-9760-48ef-9eb7-c8302ff7a689', 'CPL-09', 'Mampu menerapkan algoritma cerdas pada sistem komputer', NULL, 1, '2025-12-01 16:47:17.862', '2025-12-01 16:47:17.862', '9197693b-0488-4735-96d4-3fcbe6915879', '9efa8000-a5dc-45cb-90c7-256f119d864f', 'a030d74c-45de-4937-ac55-95c0dded211f'),
('e5063489-6644-43a8-8627-9413d0a694f3', 'CPL-05', 'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif', NULL, 1, '2025-12-01 16:47:17.849', '2025-12-01 16:47:17.849', '9197693b-0488-4735-96d4-3fcbe6915879', 'a36f0952-2dbe-4c6f-b1c4-7b2b756338b9', 'a030d74c-45de-4937-ac55-95c0dded211f'),
('fabca593-59ea-4630-bb28-f679ad0e33a7', 'CPL-01', 'Bertakwa kepada Tuhan Yang Maha Esa dan mampu menunjukkan sikap religius', NULL, 1, '2025-12-01 16:47:17.833', '2025-12-01 16:47:17.833', '9197693b-0488-4735-96d4-3fcbe6915879', 'd30e2abe-c85d-4091-a55f-8ddf10d9d45f', 'a030d74c-45de-4937-ac55-95c0dded211f');

-- --------------------------------------------------------

--
-- Table structure for table `cpl_mata_kuliah`
--

CREATE TABLE `cpl_mata_kuliah` (
  `id` varchar(191) NOT NULL,
  `cpl_id` varchar(191) NOT NULL,
  `mata_kuliah_id` varchar(191) NOT NULL,
  `bobot_kontribusi` decimal(3,2) NOT NULL DEFAULT 1.00,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cpl_mata_kuliah`
--

INSERT INTO `cpl_mata_kuliah` (`id`, `cpl_id`, `mata_kuliah_id`, `bobot_kontribusi`, `created_at`, `updated_at`) VALUES
('0829f438-7af0-4938-ae12-d157a3a69099', 'e4e2a8f6-9760-48ef-9eb7-c8302ff7a689', '72c5b829-056e-4359-9f40-33801feed1e0', 0.50, '2025-12-01 16:47:18.307', '2025-12-01 16:47:18.307'),
('213b7e33-d719-4a55-986e-43cf136dcfa3', 'c659c742-f923-4642-8b45-bba455749ef1', '1936ca45-b910-4787-a2ce-94e25481930f', 0.50, '2025-12-01 16:47:19.038', '2025-12-01 16:47:19.038'),
('26e51d6d-bf26-4798-bd6d-9d03ca70cf74', 'fabca593-59ea-4630-bb28-f679ad0e33a7', '5b36edab-4962-47de-9d27-3d0b379be7dd', 0.50, '2025-12-01 16:47:17.940', '2025-12-01 16:47:17.940'),
('2e748baa-2791-46a3-a41d-9d12d0629f34', 'e5063489-6644-43a8-8627-9413d0a694f3', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 0.50, '2025-12-01 16:47:18.785', '2025-12-01 16:47:18.785'),
('2e7a79c6-def0-46fe-950e-39362d5e1013', 'c659c742-f923-4642-8b45-bba455749ef1', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 0.50, '2025-12-01 16:47:18.566', '2025-12-01 16:47:18.566'),
('2e856a44-922f-4d07-8502-b950ffa43cbf', '5771505b-640f-4348-ae11-a98a2db91cf2', '1936ca45-b910-4787-a2ce-94e25481930f', 0.50, '2025-12-01 16:47:19.038', '2025-12-01 16:47:19.038'),
('890c13ec-f224-4089-b60f-7e8a55135ab0', '5771505b-640f-4348-ae11-a98a2db91cf2', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 0.50, '2025-12-01 16:47:18.566', '2025-12-01 16:47:18.566'),
('99b6393f-4c4b-415d-8b07-a7773f344fc3', '51850e8a-0d12-4871-a45c-05b2dc21a671', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 0.50, '2025-12-01 16:47:18.785', '2025-12-01 16:47:18.785'),
('baf2aafc-cd43-4286-acc3-a1e74eb7410b', 'de358d61-5934-4393-8c97-6eda2abd90bb', '72c5b829-056e-4359-9f40-33801feed1e0', 0.50, '2025-12-01 16:47:18.307', '2025-12-01 16:47:18.307'),
('daf02aa0-f818-4bc3-ad26-dbcb06ed8cd7', '386cd3b5-4347-49d3-bcdf-bac2d6570879', '5b36edab-4962-47de-9d27-3d0b379be7dd', 0.50, '2025-12-01 16:47:17.940', '2025-12-01 16:47:17.940');

-- --------------------------------------------------------

--
-- Table structure for table `cpmk`
--

CREATE TABLE `cpmk` (
  `id` varchar(191) NOT NULL,
  `kode_cpmk` varchar(191) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `mata_kuliah_id` varchar(191) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `created_by` varchar(191) DEFAULT NULL,
  `status_validasi` varchar(191) NOT NULL DEFAULT 'draft',
  `validated_at` datetime(3) DEFAULT NULL,
  `validated_by` varchar(191) DEFAULT NULL,
  `level_taksonomi` varchar(191) DEFAULT NULL,
  `level_taksonomi_id` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cpmk`
--

INSERT INTO `cpmk` (`id`, `kode_cpmk`, `deskripsi`, `mata_kuliah_id`, `is_active`, `created_at`, `updated_at`, `created_by`, `status_validasi`, `validated_at`, `validated_by`, `level_taksonomi`, `level_taksonomi_id`) VALUES
('0914010f-46ad-46ca-8276-6b76a6a60eb4', 'CPMK-INF-301-1', 'Mampu memahami konsep dasar Pemrograman Web Lanjut', '5b36edab-4962-47de-9d27-3d0b379be7dd', 1, '2025-12-01 16:47:17.933', '2025-12-01 16:47:17.933', '9b0c44d1-79e8-4b63-8b43-632f575df3cd', 'validated', NULL, NULL, NULL, 'f465d843-316a-46aa-b505-8be1e61d014a'),
('0cd7ad12-bbc9-4d29-b69f-570c2c6bb2f4', 'CPMK-INF-301-2', 'Mampu mengimplementasikan Pemrograman Web Lanjut dalam proyek', '5b36edab-4962-47de-9d27-3d0b379be7dd', 1, '2025-12-01 16:47:17.937', '2025-12-01 16:47:17.937', '9b0c44d1-79e8-4b63-8b43-632f575df3cd', 'validated', NULL, NULL, NULL, '5bd439af-aec4-4606-9981-caf0441a745c'),
('389a4bd3-f046-4550-a6bb-7e7781187fb9', 'CPMK-INF-305-1', 'Mampu memahami konsep dasar Kecerdasan Buatan', '1936ca45-b910-4787-a2ce-94e25481930f', 1, '2025-12-01 16:47:19.031', '2025-12-01 16:47:19.031', 'ed42925d-924d-4517-b779-6dbf76cf923f', 'validated', NULL, NULL, NULL, 'f465d843-316a-46aa-b505-8be1e61d014a'),
('8d555a09-097a-41e8-89f6-2bc37913b119', 'CPMK-INF-302-1', 'Mampu memahami konsep dasar Basis Data Lanjut', '72c5b829-056e-4359-9f40-33801feed1e0', 1, '2025-12-01 16:47:18.299', '2025-12-01 16:47:18.299', 'ed42925d-924d-4517-b779-6dbf76cf923f', 'validated', NULL, NULL, NULL, 'f465d843-316a-46aa-b505-8be1e61d014a'),
('9db0f830-6309-4c83-a066-15507da1fbe5', 'CPMK-INF-303-1', 'Mampu memahami konsep dasar Rekayasa Perangkat Lunak', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 1, '2025-12-01 16:47:18.560', '2025-12-01 16:47:18.560', '133d79ea-b30f-4183-94ff-d587c99352e2', 'validated', NULL, NULL, NULL, 'f465d843-316a-46aa-b505-8be1e61d014a'),
('b2b18a57-1ef1-4473-882f-e1c7ffb19e60', 'CPMK-INF-302-2', 'Mampu mengimplementasikan Basis Data Lanjut dalam proyek', '72c5b829-056e-4359-9f40-33801feed1e0', 1, '2025-12-01 16:47:18.304', '2025-12-01 16:47:18.304', 'ed42925d-924d-4517-b779-6dbf76cf923f', 'validated', NULL, NULL, NULL, '5bd439af-aec4-4606-9981-caf0441a745c'),
('beb1f9a5-4beb-41fa-a9d4-67e684045396', 'CPMK-INF-304-1', 'Mampu memahami konsep dasar Jaringan Komputer', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 1, '2025-12-01 16:47:18.779', '2025-12-01 16:47:18.779', '9b0c44d1-79e8-4b63-8b43-632f575df3cd', 'validated', NULL, NULL, NULL, 'f465d843-316a-46aa-b505-8be1e61d014a'),
('c93c4535-8abc-480d-b11d-0e511a01ac7f', 'CPMK-INF-305-2', 'Mampu mengimplementasikan Kecerdasan Buatan dalam proyek', '1936ca45-b910-4787-a2ce-94e25481930f', 1, '2025-12-01 16:47:19.035', '2025-12-01 16:47:19.035', 'ed42925d-924d-4517-b779-6dbf76cf923f', 'validated', NULL, NULL, NULL, '5bd439af-aec4-4606-9981-caf0441a745c'),
('d5fa648d-8d70-464b-880b-a3cd45d10272', 'CPMK-INF-304-2', 'Mampu mengimplementasikan Jaringan Komputer dalam proyek', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 1, '2025-12-01 16:47:18.782', '2025-12-02 02:32:09.264', '9b0c44d1-79e8-4b63-8b43-632f575df3cd', 'validated', NULL, NULL, 'C1,C3', '5bd439af-aec4-4606-9981-caf0441a745c'),
('eed272d9-74c3-4e34-9057-ee06f9473c04', 'CPMK-INF-303-2', 'Mampu mengimplementasikan Rekayasa Perangkat Lunak dalam proyek', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 1, '2025-12-01 16:47:18.563', '2025-12-01 16:47:18.563', '133d79ea-b30f-4183-94ff-d587c99352e2', 'validated', NULL, NULL, NULL, '5bd439af-aec4-4606-9981-caf0441a745c');

-- --------------------------------------------------------

--
-- Table structure for table `cpmk_cpl_mapping`
--

CREATE TABLE `cpmk_cpl_mapping` (
  `id` varchar(191) NOT NULL,
  `cpmk_id` varchar(191) NOT NULL,
  `cpl_id` varchar(191) NOT NULL,
  `bobot_persentase` decimal(5,2) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cpmk_cpl_mapping`
--

INSERT INTO `cpmk_cpl_mapping` (`id`, `cpmk_id`, `cpl_id`, `bobot_persentase`, `created_at`, `updated_at`) VALUES
('0549bf99-0b7e-4a6c-87aa-ae64f0aad40d', '389a4bd3-f046-4550-a6bb-7e7781187fb9', 'c659c742-f923-4642-8b45-bba455749ef1', 100.00, '2025-12-01 16:47:19.040', '2025-12-01 16:47:19.040'),
('2419e404-0d20-4bd2-8cdb-73e8037ba667', '0cd7ad12-bbc9-4d29-b69f-570c2c6bb2f4', 'fabca593-59ea-4630-bb28-f679ad0e33a7', 100.00, '2025-12-01 16:47:17.943', '2025-12-01 16:47:17.943'),
('524887f7-e566-4274-a4ab-255a3dec2642', 'c93c4535-8abc-480d-b11d-0e511a01ac7f', '5771505b-640f-4348-ae11-a98a2db91cf2', 100.00, '2025-12-01 16:47:19.040', '2025-12-01 16:47:19.040'),
('6e67d739-55cd-423a-b039-9350c61e3150', 'eed272d9-74c3-4e34-9057-ee06f9473c04', '5771505b-640f-4348-ae11-a98a2db91cf2', 100.00, '2025-12-01 16:47:18.569', '2025-12-01 16:47:18.569'),
('bab0a96e-dd0b-4a1a-bdf4-dcce7e95b1c4', '8d555a09-097a-41e8-89f6-2bc37913b119', 'de358d61-5934-4393-8c97-6eda2abd90bb', 100.00, '2025-12-01 16:47:18.311', '2025-12-01 16:47:18.311'),
('bd57de14-9094-4382-885c-da5c52f3e84a', 'b2b18a57-1ef1-4473-882f-e1c7ffb19e60', 'e4e2a8f6-9760-48ef-9eb7-c8302ff7a689', 100.00, '2025-12-01 16:47:18.311', '2025-12-01 16:47:18.311'),
('ce9436a2-07ac-44da-88b1-ff08ff707035', 'd5fa648d-8d70-464b-880b-a3cd45d10272', '51850e8a-0d12-4871-a45c-05b2dc21a671', 100.00, '2025-12-01 16:47:18.787', '2025-12-01 16:47:18.787'),
('d35f4d57-05b9-4a74-9fe3-e249ccc9a40d', '0914010f-46ad-46ca-8276-6b76a6a60eb4', '386cd3b5-4347-49d3-bcdf-bac2d6570879', 100.00, '2025-12-01 16:47:17.943', '2025-12-01 16:47:17.943'),
('d447542b-bb80-4e02-8bb9-67a1345fb931', '9db0f830-6309-4c83-a066-15507da1fbe5', 'c659c742-f923-4642-8b45-bba455749ef1', 100.00, '2025-12-01 16:47:18.569', '2025-12-01 16:47:18.569'),
('e5f7d5fd-6265-410a-be48-8ec1fe101203', 'beb1f9a5-4beb-41fa-a9d4-67e684045396', 'e5063489-6644-43a8-8627-9413d0a694f3', 100.00, '2025-12-01 16:47:18.787', '2025-12-01 16:47:18.787');

-- --------------------------------------------------------

--
-- Table structure for table `evaluasi_mata_kuliah`
--

CREATE TABLE `evaluasi_mata_kuliah` (
  `id` varchar(191) NOT NULL,
  `mata_kuliah_id` varchar(191) NOT NULL,
  `dosen_id` varchar(191) NOT NULL,
  `semester` int(11) NOT NULL,
  `tahun_ajaran` varchar(191) NOT NULL,
  `kendala` text DEFAULT NULL,
  `rencana_perbaikan` text DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'submitted',
  `feedback_kaprodi` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evaluasi_mata_kuliah`
--

INSERT INTO `evaluasi_mata_kuliah` (`id`, `mata_kuliah_id`, `dosen_id`, `semester`, `tahun_ajaran`, `kendala`, `rencana_perbaikan`, `status`, `feedback_kaprodi`, `created_at`, `updated_at`) VALUES
('160761d7-1494-4bd7-bc92-141af855b85b', '5b36edab-4962-47de-9d27-3d0b379be7dd', '9b0c44d1-79e8-4b63-8b43-632f575df3cd', 5, '2024/2025', 'Mahasiswa kurang paham basic JS', 'Adakan responsi tambahan', 'submitted', NULL, '2025-12-01 16:47:19.311', '2025-12-01 16:47:19.311');

-- --------------------------------------------------------

--
-- Table structure for table `fakultas`
--

CREATE TABLE `fakultas` (
  `id` varchar(191) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `kode` varchar(191) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `fakultas`
--

INSERT INTO `fakultas` (`id`, `nama`, `kode`, `created_at`, `updated_at`) VALUES
('21a9f7cd-cbda-48ac-89ea-56c4e1972729', 'Fakultas Matematika dan Komputer', 'FMIKOM', '2025-12-01 16:47:17.743', '2025-12-01 16:47:17.743'),
('830b1523-915b-4164-9b56-a907c24147a5', 'Fakultas Teknologi Industri', 'FTI', '2025-12-01 16:47:17.756', '2025-12-01 16:47:17.756'),
('edf3ed60-efbb-4aab-a201-64f5d71e8f66', 'Fakultas Keguruan dan Ilmu Pendidikan', 'FKIP', '2025-12-01 16:47:17.732', '2025-12-01 16:47:17.732');

-- --------------------------------------------------------

--
-- Table structure for table `jenis_mata_kuliah`
--

CREATE TABLE `jenis_mata_kuliah` (
  `id` varchar(191) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `jenis_mata_kuliah`
--

INSERT INTO `jenis_mata_kuliah` (`id`, `nama`, `created_at`, `updated_at`) VALUES
('41410fcb-a85d-4f2c-bbf8-2673ed1d056a', 'Pilihan', '2025-12-01 16:47:17.701', '2025-12-01 16:47:17.701'),
('cb13c3ae-f828-4c24-ac48-f379614d4da1', 'Wajib', '2025-12-01 16:47:17.698', '2025-12-01 16:47:17.698');

-- --------------------------------------------------------

--
-- Table structure for table `kaprodi_data`
--

CREATE TABLE `kaprodi_data` (
  `id` varchar(191) NOT NULL,
  `program_studi` varchar(191) NOT NULL,
  `nama_kaprodi` varchar(191) NOT NULL,
  `nidn_kaprodi` varchar(191) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `prodi_id` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kaprodi_data`
--

INSERT INTO `kaprodi_data` (`id`, `program_studi`, `nama_kaprodi`, `nidn_kaprodi`, `created_at`, `updated_at`, `prodi_id`) VALUES
('337990f7-ce72-4427-802b-e6b7b57abdea', 'Informatika', 'Dr. Kaprodi Informatika', '0011223344', '2025-12-01 16:47:17.775', '2025-12-01 16:47:17.775', 'a030d74c-45de-4937-ac55-95c0dded211f');

-- --------------------------------------------------------

--
-- Table structure for table `kategori_cpl`
--

CREATE TABLE `kategori_cpl` (
  `id` varchar(191) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kategori_cpl`
--

INSERT INTO `kategori_cpl` (`id`, `nama`, `created_at`, `updated_at`) VALUES
('9efa8000-a5dc-45cb-90c7-256f119d864f', 'Keterampilan Khusus', '2025-12-01 16:47:17.713', '2025-12-01 16:47:17.713'),
('a36f0952-2dbe-4c6f-b1c4-7b2b756338b9', 'Keterampilan Umum', '2025-12-01 16:47:17.711', '2025-12-01 16:47:17.711'),
('d30e2abe-c85d-4091-a55f-8ddf10d9d45f', 'Sikap', '2025-12-01 16:47:17.704', '2025-12-01 16:47:17.704'),
('fd99248b-6936-4c32-822f-c92de970ca30', 'Pengetahuan', '2025-12-01 16:47:17.707', '2025-12-01 16:47:17.707');

-- --------------------------------------------------------

--
-- Table structure for table `kelas`
--

CREATE TABLE `kelas` (
  `id` varchar(191) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kelas`
--

INSERT INTO `kelas` (`id`, `nama`, `created_at`, `updated_at`) VALUES
('068d4565-6b83-4651-bd9c-401fccd54424', 'TI-B', '2025-12-01 16:47:17.872', '2025-12-01 16:47:17.872'),
('eb620e77-1692-4e63-9370-13b93e63d7ee', 'TI-A', '2025-12-01 16:47:17.868', '2025-12-01 16:47:17.868');

-- --------------------------------------------------------

--
-- Table structure for table `kurikulum`
--

CREATE TABLE `kurikulum` (
  `id` varchar(191) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `tahun_mulai` int(11) NOT NULL,
  `tahun_selesai` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kurikulum`
--

INSERT INTO `kurikulum` (`id`, `nama`, `tahun_mulai`, `tahun_selesai`, `is_active`, `created_at`, `updated_at`) VALUES
('dbaa26fa-a272-45f2-aed2-6b7a71cd607d', 'Kurikulum 2021', 2021, NULL, 1, '2025-12-01 16:47:17.693', '2025-12-01 16:47:17.693');

-- --------------------------------------------------------

--
-- Table structure for table `level_taksonomi`
--

CREATE TABLE `level_taksonomi` (
  `id` varchar(191) NOT NULL,
  `kode` varchar(191) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `kategori` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `level_taksonomi`
--

INSERT INTO `level_taksonomi` (`id`, `kode`, `deskripsi`, `kategori`, `created_at`, `updated_at`) VALUES
('07ccd73f-6eeb-4228-b68e-c0779958cabf', 'K3', 'Menerapkan', 'Kognitif', '2025-12-02 02:51:57.171', '2025-12-02 02:51:57.171'),
('09502eb9-2f33-475a-a58d-3c24b2419b18', 'A3', 'Menghargai', 'Afektif', '2025-12-02 02:51:57.140', '2025-12-02 02:51:57.140'),
('1cd66b0f-1ed4-4f8d-a682-1b09529072c5', 'C4', 'Menganalisis', 'Kognitif', '2025-12-01 16:47:17.716', '2025-12-02 02:51:57.067'),
('2b7a2cb9-ebc9-44a8-829c-574b7f47c2fc', 'P4', 'Organisasi', 'Psikomotorik', '2025-12-02 02:51:57.113', '2025-12-02 02:51:57.113'),
('33ae680b-bdbb-400f-a22c-5d2dc9408c12', 'P1', 'Persepsi', 'Psikomotorik', '2025-12-01 16:47:17.716', '2025-12-02 02:51:57.087'),
('3e0ebc24-dbde-4300-9d6d-adeede9300ef', 'A1', 'Menerima', 'Afektif', '2025-12-01 16:47:17.716', '2025-12-02 02:51:57.128'),
('52853137-aca5-4900-b748-c3256dc0398b', 'P3', 'Penilaian', 'Psikomotorik', '2025-12-02 02:51:57.100', '2025-12-02 02:51:57.100'),
('5bd439af-aec4-4606-9981-caf0441a745c', 'C6', 'Mencipta', 'Kognitif', '2025-12-01 16:47:17.716', '2025-12-02 02:51:57.081'),
('62a8b804-accc-46ff-94ec-e29821480aa2', 'C5', 'Mengevaluasi', 'Kognitif', '2025-12-01 16:47:17.716', '2025-12-02 02:51:57.074'),
('6fa923db-6753-450e-af76-82550728e326', 'K2', 'Memahami', 'Kognitif', '2025-12-02 02:51:57.164', '2025-12-02 02:51:57.164'),
('7af3c702-e835-4b02-9613-a65f50e67f0d', 'C2', 'Memahami', 'Kognitif', '2025-12-01 16:47:17.716', '2025-12-02 02:51:57.055'),
('7c546f8b-3953-4fa1-960a-15e9b339d73d', 'P2', 'Respon', 'Psikomotorik', '2025-12-02 02:51:57.093', '2025-12-02 02:51:57.093'),
('8a289b1e-71d3-4d82-8160-6a336bd37c7a', 'K5', 'Mengevaluasi', 'Kognitif', '2025-12-02 02:51:57.183', '2025-12-02 02:51:57.183'),
('96a0b7c1-c764-4507-a634-e952289d319a', 'A2', 'Merespons', 'Afektif', '2025-12-02 02:51:57.134', '2025-12-02 02:51:57.134'),
('a9f5f562-3683-4e2a-a96f-fe4f5efc0055', 'P5', 'Karakterisasi', 'Psikomotorik', '2025-12-02 02:51:57.121', '2025-12-02 02:51:57.121'),
('b332d6ce-27e6-4bc8-82cd-0c2ace2c9415', 'K4', 'Menganalisis', 'Kognitif', '2025-12-02 02:51:57.177', '2025-12-02 02:51:57.177'),
('b3e8c351-1993-475e-b1fa-d275b5a1c792', 'A5', 'Menginternalisasi', 'Afektif', '2025-12-02 02:51:57.152', '2025-12-02 02:51:57.152'),
('bfe65631-c749-4d4a-abd9-bb38513ffec3', 'K1', 'Mengingat', 'Kognitif', '2025-12-02 02:51:57.157', '2025-12-02 02:51:57.157'),
('c4e7f2a3-e93f-49d3-9766-434a0ae35e29', 'C1', 'Mengingat', 'Kognitif', '2025-12-01 16:47:17.716', '2025-12-02 02:51:57.044'),
('e6db0877-443f-4165-8ddb-544dfae9c0db', 'A4', 'Mengelola', 'Afektif', '2025-12-02 02:51:57.146', '2025-12-02 02:51:57.146'),
('f465d843-316a-46aa-b505-8be1e61d014a', 'C3', 'Menerapkan', 'Kognitif', '2025-12-01 16:47:17.716', '2025-12-02 02:51:57.061'),
('fb1eff84-d369-4ac0-b59f-3fb1d861ce7e', 'K6', 'Mencipta', 'Kognitif', '2025-12-02 02:51:57.190', '2025-12-02 02:51:57.190');

-- --------------------------------------------------------

--
-- Table structure for table `mata_kuliah`
--

CREATE TABLE `mata_kuliah` (
  `id` varchar(191) NOT NULL,
  `kode_mk` varchar(191) NOT NULL,
  `nama_mk` varchar(191) NOT NULL,
  `sks` int(11) NOT NULL,
  `semester` int(11) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `created_by` varchar(191) DEFAULT NULL,
  `program_studi` varchar(191) DEFAULT NULL,
  `jenis_mk_id` varchar(191) DEFAULT NULL,
  `kurikulum_id` varchar(191) DEFAULT NULL,
  `prodi_id` varchar(191) DEFAULT NULL,
  `semester_id` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mata_kuliah`
--

INSERT INTO `mata_kuliah` (`id`, `kode_mk`, `nama_mk`, `sks`, `semester`, `deskripsi`, `is_active`, `created_at`, `updated_at`, `created_by`, `program_studi`, `jenis_mk_id`, `kurikulum_id`, `prodi_id`, `semester_id`) VALUES
('1936ca45-b910-4787-a2ce-94e25481930f', 'INF-305', 'Kecerdasan Buatan', 3, 5, NULL, 1, '2025-12-01 16:47:19.020', '2025-12-01 16:47:19.020', '9197693b-0488-4735-96d4-3fcbe6915879', NULL, 'cb13c3ae-f828-4c24-ac48-f379614d4da1', 'dbaa26fa-a272-45f2-aed2-6b7a71cd607d', 'a030d74c-45de-4937-ac55-95c0dded211f', '63da5a92-77f8-43c7-a230-4db67cdbe97e'),
('5b36edab-4962-47de-9d27-3d0b379be7dd', 'INF-301', 'Pemrograman Web Lanjut', 3, 5, NULL, 1, '2025-12-01 16:47:17.921', '2025-12-01 16:47:17.921', '9197693b-0488-4735-96d4-3fcbe6915879', NULL, 'cb13c3ae-f828-4c24-ac48-f379614d4da1', 'dbaa26fa-a272-45f2-aed2-6b7a71cd607d', 'a030d74c-45de-4937-ac55-95c0dded211f', '63da5a92-77f8-43c7-a230-4db67cdbe97e'),
('72c5b829-056e-4359-9f40-33801feed1e0', 'INF-302', 'Basis Data Lanjut', 3, 5, NULL, 1, '2025-12-01 16:47:18.283', '2025-12-01 16:47:18.283', '9197693b-0488-4735-96d4-3fcbe6915879', NULL, 'cb13c3ae-f828-4c24-ac48-f379614d4da1', 'dbaa26fa-a272-45f2-aed2-6b7a71cd607d', 'a030d74c-45de-4937-ac55-95c0dded211f', '63da5a92-77f8-43c7-a230-4db67cdbe97e'),
('a04d7243-1d02-492a-8deb-3244d8db0e46', 'INF-304', 'Jaringan Komputer', 3, 5, NULL, 1, '2025-12-01 16:47:18.771', '2025-12-01 16:47:18.771', '9197693b-0488-4735-96d4-3fcbe6915879', NULL, 'cb13c3ae-f828-4c24-ac48-f379614d4da1', 'dbaa26fa-a272-45f2-aed2-6b7a71cd607d', 'a030d74c-45de-4937-ac55-95c0dded211f', '63da5a92-77f8-43c7-a230-4db67cdbe97e'),
('cea3583d-77a9-4a8d-ad70-746b25f15065', 'INF-303', 'Rekayasa Perangkat Lunak', 3, 5, NULL, 1, '2025-12-01 16:47:18.549', '2025-12-01 16:47:18.549', '9197693b-0488-4735-96d4-3fcbe6915879', NULL, 'cb13c3ae-f828-4c24-ac48-f379614d4da1', 'dbaa26fa-a272-45f2-aed2-6b7a71cd607d', 'a030d74c-45de-4937-ac55-95c0dded211f', '63da5a92-77f8-43c7-a230-4db67cdbe97e');

-- --------------------------------------------------------

--
-- Table structure for table `mata_kuliah_pengampu`
--

CREATE TABLE `mata_kuliah_pengampu` (
  `id` varchar(191) NOT NULL,
  `mata_kuliah_id` varchar(191) NOT NULL,
  `dosen_id` varchar(191) NOT NULL,
  `kelas_id` varchar(191) DEFAULT NULL,
  `is_pengampu_utama` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mata_kuliah_pengampu`
--

INSERT INTO `mata_kuliah_pengampu` (`id`, `mata_kuliah_id`, `dosen_id`, `kelas_id`, `is_pengampu_utama`, `created_at`, `updated_at`) VALUES
('0e65e0ec-f8ce-46a8-a21e-a4fd39e66660', '72c5b829-056e-4359-9f40-33801feed1e0', 'ed42925d-924d-4517-b779-6dbf76cf923f', '068d4565-6b83-4651-bd9c-401fccd54424', 1, '2025-12-01 16:47:18.295', '2025-12-01 16:47:18.295'),
('22707abf-ac4d-490a-8633-6ecb9f8684cb', 'cea3583d-77a9-4a8d-ad70-746b25f15065', '133d79ea-b30f-4183-94ff-d587c99352e2', '068d4565-6b83-4651-bd9c-401fccd54424', 1, '2025-12-01 16:47:18.556', '2025-12-01 16:47:18.556'),
('293c72d1-81fe-4571-9342-90e6df89ede3', '72c5b829-056e-4359-9f40-33801feed1e0', 'ed42925d-924d-4517-b779-6dbf76cf923f', 'eb620e77-1692-4e63-9370-13b93e63d7ee', 1, '2025-12-01 16:47:18.290', '2025-12-01 16:47:18.290'),
('2c0fb269-1ef3-45a2-b13f-6ec6d42be861', 'a04d7243-1d02-492a-8deb-3244d8db0e46', '9b0c44d1-79e8-4b63-8b43-632f575df3cd', '068d4565-6b83-4651-bd9c-401fccd54424', 1, '2025-12-01 16:47:18.777', '2025-12-01 16:47:18.777'),
('6e0b1028-6cdf-407e-a57b-04c0d76193f1', '5b36edab-4962-47de-9d27-3d0b379be7dd', '9b0c44d1-79e8-4b63-8b43-632f575df3cd', '068d4565-6b83-4651-bd9c-401fccd54424', 1, '2025-12-01 16:47:17.929', '2025-12-01 16:47:17.929'),
('9dc33a4a-fe54-4143-b3d9-8e1b282ca80a', '1936ca45-b910-4787-a2ce-94e25481930f', 'ed42925d-924d-4517-b779-6dbf76cf923f', 'eb620e77-1692-4e63-9370-13b93e63d7ee', 1, '2025-12-01 16:47:19.024', '2025-12-01 16:47:19.024'),
('a1ad7348-f485-41b9-9655-832eaa404a79', '5b36edab-4962-47de-9d27-3d0b379be7dd', '9b0c44d1-79e8-4b63-8b43-632f575df3cd', 'eb620e77-1692-4e63-9370-13b93e63d7ee', 1, '2025-12-01 16:47:17.925', '2025-12-01 16:47:17.925'),
('a5830a65-d3c6-4565-91c9-54050a7312c0', 'cea3583d-77a9-4a8d-ad70-746b25f15065', '133d79ea-b30f-4183-94ff-d587c99352e2', 'eb620e77-1692-4e63-9370-13b93e63d7ee', 1, '2025-12-01 16:47:18.553', '2025-12-01 16:47:18.553'),
('bd868458-6c14-41ba-9e25-a956aad25f86', '1936ca45-b910-4787-a2ce-94e25481930f', 'ed42925d-924d-4517-b779-6dbf76cf923f', '068d4565-6b83-4651-bd9c-401fccd54424', 1, '2025-12-01 16:47:19.028', '2025-12-01 16:47:19.028'),
('f004252d-7437-4693-b1e6-cc40463fc6f3', 'a04d7243-1d02-492a-8deb-3244d8db0e46', '9b0c44d1-79e8-4b63-8b43-632f575df3cd', 'eb620e77-1692-4e63-9370-13b93e63d7ee', 1, '2025-12-01 16:47:18.774', '2025-12-01 16:47:18.774');

-- --------------------------------------------------------

--
-- Table structure for table `nilai_cpl`
--

CREATE TABLE `nilai_cpl` (
  `id` varchar(191) NOT NULL,
  `mahasiswa_id` varchar(191) NOT NULL,
  `cpl_id` varchar(191) NOT NULL,
  `mata_kuliah_id` varchar(191) NOT NULL,
  `nilai` decimal(5,2) NOT NULL,
  `semester` int(11) NOT NULL,
  `semester_id` varchar(191) DEFAULT NULL,
  `tahun_ajaran` varchar(191) NOT NULL,
  `catatan` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `created_by` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `nilai_cpl`
--

INSERT INTO `nilai_cpl` (`id`, `mahasiswa_id`, `cpl_id`, `mata_kuliah_id`, `nilai`, `semester`, `semester_id`, `tahun_ajaran`, `catatan`, `created_at`, `updated_at`, `created_by`) VALUES
('025d6d24-9b29-48ec-8720-31a4ed63ff2e', 'c37f443d-c904-433e-b244-1aa9014d7114', 'de358d61-5934-4393-8c97-6eda2abd90bb', '72c5b829-056e-4359-9f40-33801feed1e0', 61.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.496', '2025-12-01 16:47:18.496', NULL),
('02fde52d-9c37-4a62-b3b6-0f88e47c907f', '07f726a9-13c2-428a-91a5-dc40670a8b3a', 'de358d61-5934-4393-8c97-6eda2abd90bb', '72c5b829-056e-4359-9f40-33801feed1e0', 95.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.363', '2025-12-01 16:47:18.363', NULL),
('07a63a5d-302f-446e-9fff-01698ae46c93', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', 'e5063489-6644-43a8-8627-9413d0a694f3', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 62.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.925', '2025-12-01 16:47:18.925', NULL),
('07cad8ed-0e9f-4fdd-8832-e412c4f8e2ca', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', 'fabca593-59ea-4630-bb28-f679ad0e33a7', '5b36edab-4962-47de-9d27-3d0b379be7dd', 74.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:17.984', '2025-12-01 16:47:17.984', NULL),
('0968d483-07fc-4222-ac0c-989a7f1ed7f9', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', 'fabca593-59ea-4630-bb28-f679ad0e33a7', '5b36edab-4962-47de-9d27-3d0b379be7dd', 80.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.105', '2025-12-01 16:47:18.105', NULL),
('0ef6cb2d-a390-4c21-933d-98a608236e15', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', 'e4e2a8f6-9760-48ef-9eb7-c8302ff7a689', '72c5b829-056e-4359-9f40-33801feed1e0', 67.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.412', '2025-12-01 16:47:18.412', NULL),
('0f00ae66-1ae1-4981-b098-d6a9a1ad0902', 'c37f443d-c904-433e-b244-1aa9014d7114', 'c659c742-f923-4642-8b45-bba455749ef1', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 90.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.728', '2025-12-01 16:47:18.728', NULL),
('0f682b19-4fa2-4692-8dd3-66140c3c2911', '56a45ba1-b6d8-4f76-8864-839825a973e2', 'c659c742-f923-4642-8b45-bba455749ef1', '1936ca45-b910-4787-a2ce-94e25481930f', 75.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.142', '2025-12-01 16:47:19.142', NULL),
('1377624f-f6d0-4aea-a7ae-4bbb2ce6935c', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', '5771505b-640f-4348-ae11-a98a2db91cf2', '1936ca45-b910-4787-a2ce-94e25481930f', 61.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.184', '2025-12-01 16:47:19.184', NULL),
('156d8e06-71c2-4986-a4e9-75d05154b5a2', 'dce817fb-29ac-4b9f-a098-54881d30844d', '51850e8a-0d12-4871-a45c-05b2dc21a671', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 79.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.016', '2025-12-01 16:47:19.016', NULL),
('17a1d80a-c103-4d87-8fed-38c9a0d804cc', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', 'c659c742-f923-4642-8b45-bba455749ef1', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 87.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.706', '2025-12-01 16:47:18.706', NULL),
('198b8f52-34bf-48a6-9864-bfe7bff0aaca', 'a3493848-185f-46fa-93df-d1f7124fabc1', 'e4e2a8f6-9760-48ef-9eb7-c8302ff7a689', '72c5b829-056e-4359-9f40-33801feed1e0', 85.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.390', '2025-12-01 16:47:18.390', NULL),
('19a78261-bc49-446b-8069-23a5bc7e924e', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', '386cd3b5-4347-49d3-bcdf-bac2d6570879', '5b36edab-4962-47de-9d27-3d0b379be7dd', 82.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.102', '2025-12-01 16:47:18.102', NULL),
('2190d28b-2af5-4554-92c3-9140307bde2f', 'a3493848-185f-46fa-93df-d1f7124fabc1', 'e5063489-6644-43a8-8627-9413d0a694f3', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 75.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.854', '2025-12-01 16:47:18.854', NULL),
('262cc326-c27d-45ef-8e4f-da34cd03ae3c', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', 'de358d61-5934-4393-8c97-6eda2abd90bb', '72c5b829-056e-4359-9f40-33801feed1e0', 80.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.452', '2025-12-01 16:47:18.452', NULL),
('2894672d-21b4-4874-a494-d491fd99ff4c', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', '5771505b-640f-4348-ae11-a98a2db91cf2', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 82.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.691', '2025-12-01 16:47:18.691', NULL),
('2d414942-09d5-4c18-abca-f760f5bea0f5', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', 'e5063489-6644-43a8-8627-9413d0a694f3', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 62.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.990', '2025-12-01 16:47:18.990', NULL),
('2d68e924-8265-482a-8604-4230c75f6dd9', 'c37f443d-c904-433e-b244-1aa9014d7114', 'c659c742-f923-4642-8b45-bba455749ef1', '1936ca45-b910-4787-a2ce-94e25481930f', 64.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.202', '2025-12-01 16:47:19.202', NULL),
('319fa872-8968-4b07-a3cf-0fc3645d91da', 'dce817fb-29ac-4b9f-a098-54881d30844d', '386cd3b5-4347-49d3-bcdf-bac2d6570879', '5b36edab-4962-47de-9d27-3d0b379be7dd', 99.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.277', '2025-12-01 16:47:18.277', NULL),
('321fe288-928e-43c7-ab53-899007db7fbc', 'dce817fb-29ac-4b9f-a098-54881d30844d', 'c659c742-f923-4642-8b45-bba455749ef1', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 66.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.765', '2025-12-01 16:47:18.765', NULL),
('3253ade9-5f93-472d-9363-1437aef714dd', 'dce817fb-29ac-4b9f-a098-54881d30844d', '5771505b-640f-4348-ae11-a98a2db91cf2', '1936ca45-b910-4787-a2ce-94e25481930f', 81.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.308', '2025-12-01 16:47:19.308', NULL),
('32e2368b-5323-467e-85ca-56ea35651bbb', 'a3493848-185f-46fa-93df-d1f7124fabc1', '5771505b-640f-4348-ae11-a98a2db91cf2', '1936ca45-b910-4787-a2ce-94e25481930f', 73.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.106', '2025-12-01 16:47:19.106', NULL),
('342452a1-e651-417f-81f6-b7665dc6203a', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', 'e5063489-6644-43a8-8627-9413d0a694f3', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 79.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.946', '2025-12-01 16:47:18.946', NULL),
('364ab14b-a385-429b-9916-81ab2cba87e4', '07f726a9-13c2-428a-91a5-dc40670a8b3a', '51850e8a-0d12-4871-a45c-05b2dc21a671', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 83.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.835', '2025-12-01 16:47:18.835', NULL),
('3922b469-76ef-4ff1-a5af-60f897dd8e21', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', 'e4e2a8f6-9760-48ef-9eb7-c8302ff7a689', '72c5b829-056e-4359-9f40-33801feed1e0', 99.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.477', '2025-12-01 16:47:18.477', NULL),
('3bba9ed2-2ef5-476b-9f3f-c18763543283', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', 'e4e2a8f6-9760-48ef-9eb7-c8302ff7a689', '72c5b829-056e-4359-9f40-33801feed1e0', 65.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.524', '2025-12-01 16:47:18.524', NULL),
('3d4667a0-c2ae-420c-a579-6fe01250284b', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', '51850e8a-0d12-4871-a45c-05b2dc21a671', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 96.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.883', '2025-12-01 16:47:18.883', NULL),
('3d8cc144-caa8-4808-b183-1f08eda440f2', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', 'c659c742-f923-4642-8b45-bba455749ef1', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 100.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.747', '2025-12-01 16:47:18.747', NULL),
('3d94ab02-3185-4c5f-9411-c7010a1c2ad0', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', '5771505b-640f-4348-ae11-a98a2db91cf2', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 65.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.650', '2025-12-01 16:47:18.650', NULL),
('3e327c67-1b3c-4d52-b43b-7b67a838f3d4', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', 'e5063489-6644-43a8-8627-9413d0a694f3', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 80.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.879', '2025-12-01 16:47:18.879', NULL),
('47a53998-133e-4936-98e0-c3dcc977b624', '56a45ba1-b6d8-4f76-8864-839825a973e2', '386cd3b5-4347-49d3-bcdf-bac2d6570879', '5b36edab-4962-47de-9d27-3d0b379be7dd', 64.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.076', '2025-12-01 16:47:18.076', NULL),
('4b9b2df0-19b4-4b2a-8d8f-77b8314cfbf2', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', 'de358d61-5934-4393-8c97-6eda2abd90bb', '72c5b829-056e-4359-9f40-33801feed1e0', 90.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.520', '2025-12-01 16:47:18.520', NULL),
('4fd6c17e-8dae-46a5-b1c8-a86fc351ef54', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', '5771505b-640f-4348-ae11-a98a2db91cf2', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 62.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.750', '2025-12-01 16:47:18.750', NULL),
('52ccc9b1-002d-46e7-ad5f-ec0ed7d3c08f', 'dce817fb-29ac-4b9f-a098-54881d30844d', 'c659c742-f923-4642-8b45-bba455749ef1', '1936ca45-b910-4787-a2ce-94e25481930f', 73.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.304', '2025-12-01 16:47:19.304', NULL),
('5361b38e-72e8-4aa1-90c9-2a269ef7f52e', 'a3493848-185f-46fa-93df-d1f7124fabc1', '5771505b-640f-4348-ae11-a98a2db91cf2', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 77.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.632', '2025-12-01 16:47:18.632', NULL),
('542bbbaf-3412-4301-b93a-8311a78af651', '07f726a9-13c2-428a-91a5-dc40670a8b3a', 'c659c742-f923-4642-8b45-bba455749ef1', '1936ca45-b910-4787-a2ce-94e25481930f', 66.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.082', '2025-12-01 16:47:19.082', NULL),
('57470065-dbcb-43df-aca1-cfe0cf7e398f', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', 'e4e2a8f6-9760-48ef-9eb7-c8302ff7a689', '72c5b829-056e-4359-9f40-33801feed1e0', 85.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.456', '2025-12-01 16:47:18.456', NULL),
('57810411-24cb-406e-9e22-7d9d468b83f0', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', 'de358d61-5934-4393-8c97-6eda2abd90bb', '72c5b829-056e-4359-9f40-33801feed1e0', 94.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.339', '2025-12-01 16:47:18.339', NULL),
('5c62fc25-08d1-4d0e-985c-c9a6decb1759', 'c37f443d-c904-433e-b244-1aa9014d7114', 'e5063489-6644-43a8-8627-9413d0a694f3', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 70.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.967', '2025-12-01 16:47:18.967', NULL),
('5d325ccc-779e-4e17-abb9-8fb66b9316fd', '56a45ba1-b6d8-4f76-8864-839825a973e2', '51850e8a-0d12-4871-a45c-05b2dc21a671', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 96.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.905', '2025-12-01 16:47:18.905', NULL),
('5e5b1f5a-e64a-4ba0-b342-851482b1fa1b', '56a45ba1-b6d8-4f76-8864-839825a973e2', 'c659c742-f923-4642-8b45-bba455749ef1', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 74.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.666', '2025-12-01 16:47:18.666', NULL),
('5fcb5ec0-86e4-4836-866c-3eb9a1d47925', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', '51850e8a-0d12-4871-a45c-05b2dc21a671', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 72.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.994', '2025-12-01 16:47:18.994', NULL),
('60669941-6dde-4c32-89bc-e84d404852c3', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', '386cd3b5-4347-49d3-bcdf-bac2d6570879', '5b36edab-4962-47de-9d27-3d0b379be7dd', 68.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.128', '2025-12-01 16:47:18.128', NULL),
('60a9e1d0-8d00-48f5-b55d-37e45a6a9387', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', '5771505b-640f-4348-ae11-a98a2db91cf2', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 87.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.594', '2025-12-01 16:47:18.594', NULL),
('62bd91c1-6d85-43ce-8b67-6cfbac23175e', '56a45ba1-b6d8-4f76-8864-839825a973e2', 'de358d61-5934-4393-8c97-6eda2abd90bb', '72c5b829-056e-4359-9f40-33801feed1e0', 93.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.430', '2025-12-01 16:47:18.430', NULL),
('64733e13-5427-4ff2-8ffc-39d61f75d950', '07f726a9-13c2-428a-91a5-dc40670a8b3a', 'fabca593-59ea-4630-bb28-f679ad0e33a7', '5b36edab-4962-47de-9d27-3d0b379be7dd', 84.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.007', '2025-12-01 16:47:18.007', NULL),
('66a3205b-05a5-42f8-b145-7f416f7a456b', 'dce817fb-29ac-4b9f-a098-54881d30844d', '5771505b-640f-4348-ae11-a98a2db91cf2', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 70.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.768', '2025-12-01 16:47:18.768', NULL),
('6b4bf292-4594-4c22-a37b-57078819e954', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', 'fabca593-59ea-4630-bb28-f679ad0e33a7', '5b36edab-4962-47de-9d27-3d0b379be7dd', 63.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.251', '2025-12-01 16:47:18.251', NULL),
('6e1f62b0-d424-4796-8f6b-09604cdb3ac8', '07f726a9-13c2-428a-91a5-dc40670a8b3a', 'e5063489-6644-43a8-8627-9413d0a694f3', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 82.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.831', '2025-12-01 16:47:18.831', NULL),
('73f691f9-5dbb-42f4-87b8-bfc2117a73d0', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', 'fabca593-59ea-4630-bb28-f679ad0e33a7', '5b36edab-4962-47de-9d27-3d0b379be7dd', 84.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.053', '2025-12-01 16:47:18.053', NULL),
('7435d25f-a44e-4d10-b2f0-13764c375c7a', 'a3493848-185f-46fa-93df-d1f7124fabc1', 'de358d61-5934-4393-8c97-6eda2abd90bb', '72c5b829-056e-4359-9f40-33801feed1e0', 79.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.386', '2025-12-01 16:47:18.386', NULL),
('74747723-9637-4b7f-8706-d62d3ac45451', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', 'c659c742-f923-4642-8b45-bba455749ef1', '1936ca45-b910-4787-a2ce-94e25481930f', 67.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.122', '2025-12-01 16:47:19.122', NULL),
('76f476a1-91d7-4288-a758-2127cebcc163', 'a3493848-185f-46fa-93df-d1f7124fabc1', '386cd3b5-4347-49d3-bcdf-bac2d6570879', '5b36edab-4962-47de-9d27-3d0b379be7dd', 82.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.026', '2025-12-01 16:47:18.026', NULL),
('7efc37b4-3b58-405d-8613-b62500a91a62', 'c37f443d-c904-433e-b244-1aa9014d7114', '51850e8a-0d12-4871-a45c-05b2dc21a671', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 70.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.971', '2025-12-01 16:47:18.971', NULL),
('833b87d2-2ead-4db7-964b-e71a3de40271', 'dce817fb-29ac-4b9f-a098-54881d30844d', 'fabca593-59ea-4630-bb28-f679ad0e33a7', '5b36edab-4962-47de-9d27-3d0b379be7dd', 78.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.280', '2025-12-01 16:47:18.280', NULL),
('87678aa2-68a9-4942-8c14-a055d926c3a2', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', '386cd3b5-4347-49d3-bcdf-bac2d6570879', '5b36edab-4962-47de-9d27-3d0b379be7dd', 88.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.050', '2025-12-01 16:47:18.050', NULL),
('89942c16-2d7f-48e0-a455-4089cc736d0a', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', 'de358d61-5934-4393-8c97-6eda2abd90bb', '72c5b829-056e-4359-9f40-33801feed1e0', 74.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.473', '2025-12-01 16:47:18.473', NULL),
('8c8f460a-4722-45f5-8daf-17e695678fb5', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', '51850e8a-0d12-4871-a45c-05b2dc21a671', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 97.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.928', '2025-12-01 16:47:18.928', NULL),
('8f0c2df8-c0f4-4ddf-ae39-4b8dd528e497', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', '386cd3b5-4347-49d3-bcdf-bac2d6570879', '5b36edab-4962-47de-9d27-3d0b379be7dd', 88.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.247', '2025-12-01 16:47:18.247', NULL),
('961b87bb-175e-4efc-84e9-84da8b5d9940', '07f726a9-13c2-428a-91a5-dc40670a8b3a', '5771505b-640f-4348-ae11-a98a2db91cf2', '1936ca45-b910-4787-a2ce-94e25481930f', 61.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.086', '2025-12-01 16:47:19.086', NULL),
('9e6b73cf-2dda-4d30-8609-fb7ce4810163', '56a45ba1-b6d8-4f76-8864-839825a973e2', 'e4e2a8f6-9760-48ef-9eb7-c8302ff7a689', '72c5b829-056e-4359-9f40-33801feed1e0', 76.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.434', '2025-12-01 16:47:18.434', NULL),
('9f6ce95e-e052-4c6a-be65-8473e1c69acb', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', '5771505b-640f-4348-ae11-a98a2db91cf2', '1936ca45-b910-4787-a2ce-94e25481930f', 87.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.067', '2025-12-01 16:47:19.067', NULL),
('a2ddc7de-a806-4bfb-b9d9-88d6a6a5d832', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', 'c659c742-f923-4642-8b45-bba455749ef1', '1936ca45-b910-4787-a2ce-94e25481930f', 66.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.181', '2025-12-01 16:47:19.181', NULL),
('a44eaae0-a973-4375-a8ea-7e3db20d03fa', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', 'fabca593-59ea-4630-bb28-f679ad0e33a7', '5b36edab-4962-47de-9d27-3d0b379be7dd', 71.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.132', '2025-12-01 16:47:18.132', NULL),
('a55b193e-4fbc-4478-978d-c6c1854ea3f4', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', 'c659c742-f923-4642-8b45-bba455749ef1', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 64.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.687', '2025-12-01 16:47:18.687', NULL),
('a59f0240-3b4b-4e0f-a082-abd88642c14d', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', '386cd3b5-4347-49d3-bcdf-bac2d6570879', '5b36edab-4962-47de-9d27-3d0b379be7dd', 78.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:17.981', '2025-12-01 16:47:17.981', NULL),
('a76789f5-55c1-4f14-9ce4-6f3bb6a6ccd0', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', 'e4e2a8f6-9760-48ef-9eb7-c8302ff7a689', '72c5b829-056e-4359-9f40-33801feed1e0', 89.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.343', '2025-12-01 16:47:18.343', NULL),
('a7bad457-8228-410a-b5f0-e1cbc5ca17fd', 'a3493848-185f-46fa-93df-d1f7124fabc1', 'fabca593-59ea-4630-bb28-f679ad0e33a7', '5b36edab-4962-47de-9d27-3d0b379be7dd', 70.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.029', '2025-12-01 16:47:18.029', NULL),
('a7c34b3c-dbf5-43c4-b076-d25273af7232', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', 'c659c742-f923-4642-8b45-bba455749ef1', '1936ca45-b910-4787-a2ce-94e25481930f', 92.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.161', '2025-12-01 16:47:19.161', NULL),
('a84ca88e-24d8-4a4b-837e-5a9f169379b1', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', '5771505b-640f-4348-ae11-a98a2db91cf2', '1936ca45-b910-4787-a2ce-94e25481930f', 91.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.284', '2025-12-01 16:47:19.284', NULL),
('b1359e1b-549e-4542-b67b-cc7290d5cdcf', '07f726a9-13c2-428a-91a5-dc40670a8b3a', '386cd3b5-4347-49d3-bcdf-bac2d6570879', '5b36edab-4962-47de-9d27-3d0b379be7dd', 99.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.005', '2025-12-01 16:47:18.005', NULL),
('b34f5abb-97d8-46e0-b91e-c995ef689712', 'dce817fb-29ac-4b9f-a098-54881d30844d', 'de358d61-5934-4393-8c97-6eda2abd90bb', '72c5b829-056e-4359-9f40-33801feed1e0', 71.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.542', '2025-12-01 16:47:18.542', NULL),
('b5753ee4-86b7-4c64-8497-f902657775fc', '07f726a9-13c2-428a-91a5-dc40670a8b3a', 'e4e2a8f6-9760-48ef-9eb7-c8302ff7a689', '72c5b829-056e-4359-9f40-33801feed1e0', 79.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.367', '2025-12-01 16:47:18.367', NULL),
('b6e4b202-79ec-4291-a2ff-6ebb963f676c', '07f726a9-13c2-428a-91a5-dc40670a8b3a', '5771505b-640f-4348-ae11-a98a2db91cf2', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 83.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.614', '2025-12-01 16:47:18.614', NULL),
('ba6d8632-e3a7-43e4-9602-84740cd8e62c', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', '5771505b-640f-4348-ae11-a98a2db91cf2', '1936ca45-b910-4787-a2ce-94e25481930f', 89.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.126', '2025-12-01 16:47:19.126', NULL),
('bcbacd04-a036-4861-afd8-fc71f6e5eb36', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', '51850e8a-0d12-4871-a45c-05b2dc21a671', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 90.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.950', '2025-12-01 16:47:18.950', NULL),
('be9cd1fd-3d59-469e-acbe-d0f27fd0157c', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', 'e5063489-6644-43a8-8627-9413d0a694f3', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 96.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.810', '2025-12-01 16:47:18.810', NULL),
('c6f6f9b5-56d7-44da-87c9-5ab2ddb2484a', '56a45ba1-b6d8-4f76-8864-839825a973e2', '5771505b-640f-4348-ae11-a98a2db91cf2', '1936ca45-b910-4787-a2ce-94e25481930f', 63.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.145', '2025-12-01 16:47:19.145', NULL),
('c74cd3e3-8dd7-4f55-8252-236aeab1946b', 'c37f443d-c904-433e-b244-1aa9014d7114', '386cd3b5-4347-49d3-bcdf-bac2d6570879', '5b36edab-4962-47de-9d27-3d0b379be7dd', 61.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.214', '2025-12-01 16:47:18.214', NULL),
('c764cae7-7b94-4e7a-9749-a77d645bae8e', 'dce817fb-29ac-4b9f-a098-54881d30844d', 'e4e2a8f6-9760-48ef-9eb7-c8302ff7a689', '72c5b829-056e-4359-9f40-33801feed1e0', 66.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.545', '2025-12-01 16:47:18.545', NULL),
('c976538e-273c-4732-8886-da088de441e4', '56a45ba1-b6d8-4f76-8864-839825a973e2', 'fabca593-59ea-4630-bb28-f679ad0e33a7', '5b36edab-4962-47de-9d27-3d0b379be7dd', 73.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.079', '2025-12-01 16:47:18.079', NULL),
('ca749025-98c5-4ff9-bca5-fb6b64ce4972', '56a45ba1-b6d8-4f76-8864-839825a973e2', 'e5063489-6644-43a8-8627-9413d0a694f3', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 90.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.902', '2025-12-01 16:47:18.902', NULL),
('ccefae11-c208-49b9-98e2-c3109abfb4a0', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', 'c659c742-f923-4642-8b45-bba455749ef1', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 96.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.647', '2025-12-01 16:47:18.647', NULL),
('d2708664-ae00-4f02-9ae8-cc6881de7805', 'a3493848-185f-46fa-93df-d1f7124fabc1', '51850e8a-0d12-4871-a45c-05b2dc21a671', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 65.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.858', '2025-12-01 16:47:18.858', NULL),
('de8ea431-3aa7-4dfb-8492-1cdc9f152c3b', 'a3493848-185f-46fa-93df-d1f7124fabc1', 'c659c742-f923-4642-8b45-bba455749ef1', '1936ca45-b910-4787-a2ce-94e25481930f', 82.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.102', '2025-12-01 16:47:19.102', NULL),
('e9d7d292-e340-4acc-abf9-c976695093b1', 'dce817fb-29ac-4b9f-a098-54881d30844d', 'e5063489-6644-43a8-8627-9413d0a694f3', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 82.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.012', '2025-12-01 16:47:19.012', NULL),
('ecbead24-aac0-469c-8d01-d573580749fc', '07f726a9-13c2-428a-91a5-dc40670a8b3a', 'c659c742-f923-4642-8b45-bba455749ef1', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 69.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.611', '2025-12-01 16:47:18.611', NULL),
('ecd307af-1081-4d92-ac02-3dde38fd8e5e', 'c37f443d-c904-433e-b244-1aa9014d7114', 'e4e2a8f6-9760-48ef-9eb7-c8302ff7a689', '72c5b829-056e-4359-9f40-33801feed1e0', 89.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.500', '2025-12-01 16:47:18.500', NULL),
('ed1b256b-0cd7-4506-a52a-a59f78964501', 'a3493848-185f-46fa-93df-d1f7124fabc1', 'c659c742-f923-4642-8b45-bba455749ef1', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 93.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.629', '2025-12-01 16:47:18.629', NULL),
('edbdac28-a418-453d-9b8b-32dec29ff6f2', 'c37f443d-c904-433e-b244-1aa9014d7114', '5771505b-640f-4348-ae11-a98a2db91cf2', '1936ca45-b910-4787-a2ce-94e25481930f', 66.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.206', '2025-12-01 16:47:19.206', NULL),
('eea3f14c-4905-454c-9cd0-06fd31cabd68', 'c37f443d-c904-433e-b244-1aa9014d7114', 'fabca593-59ea-4630-bb28-f679ad0e33a7', '5b36edab-4962-47de-9d27-3d0b379be7dd', 67.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.220', '2025-12-01 16:47:18.220', NULL),
('eec0111a-973d-4cb4-850b-170913aa19d8', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', 'c659c742-f923-4642-8b45-bba455749ef1', '1936ca45-b910-4787-a2ce-94e25481930f', 100.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.278', '2025-12-01 16:47:19.278', NULL),
('efaf2570-5a8e-4d48-a608-69beb587e2f3', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', 'fabca593-59ea-4630-bb28-f679ad0e33a7', '5b36edab-4962-47de-9d27-3d0b379be7dd', 85.00, 5, NULL, '2025/2026', NULL, '2025-12-02 01:21:39.237', '2025-12-02 01:21:39.237', NULL),
('f02c67b5-af7d-4186-b0bb-3c0101e07f08', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', '386cd3b5-4347-49d3-bcdf-bac2d6570879', '5b36edab-4962-47de-9d27-3d0b379be7dd', 100.00, 5, NULL, '2025/2026', NULL, '2025-12-02 01:21:39.180', '2025-12-02 01:21:39.225', NULL),
('f0f9d0a8-e5a4-46c2-8f72-4d754fc16e70', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', '5771505b-640f-4348-ae11-a98a2db91cf2', '1936ca45-b910-4787-a2ce-94e25481930f', 91.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.164', '2025-12-01 16:47:19.164', NULL),
('f112ac15-7fdd-433e-868e-a7c3cc863a3f', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', '51850e8a-0d12-4871-a45c-05b2dc21a671', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 67.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.813', '2025-12-01 16:47:18.813', NULL),
('f374339c-20f6-4446-bef4-340b20a106e2', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', 'c659c742-f923-4642-8b45-bba455749ef1', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 72.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.590', '2025-12-01 16:47:18.590', NULL),
('fb19e870-4e72-4812-9a83-3a9152ead431', '56a45ba1-b6d8-4f76-8864-839825a973e2', '5771505b-640f-4348-ae11-a98a2db91cf2', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 81.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.670', '2025-12-01 16:47:18.670', NULL),
('fb4617b5-fabd-4fed-9d10-d0452f925c0b', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', 'de358d61-5934-4393-8c97-6eda2abd90bb', '72c5b829-056e-4359-9f40-33801feed1e0', 67.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.408', '2025-12-01 16:47:18.408', NULL),
('fbdbf0fd-e01d-495e-a7b8-bd56b10db62e', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', 'c659c742-f923-4642-8b45-bba455749ef1', '1936ca45-b910-4787-a2ce-94e25481930f', 69.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.064', '2025-12-01 16:47:19.064', NULL),
('fe9c0a44-f3d9-4b37-a7bb-7f6e67b858d4', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', '5771505b-640f-4348-ae11-a98a2db91cf2', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 70.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.710', '2025-12-01 16:47:18.710', NULL),
('ff68b701-9957-49ef-ae9b-eaf2091d61cb', 'c37f443d-c904-433e-b244-1aa9014d7114', '5771505b-640f-4348-ae11-a98a2db91cf2', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 69.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.731', '2025-12-01 16:47:18.731', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `nilai_cpmk`
--

CREATE TABLE `nilai_cpmk` (
  `id` varchar(191) NOT NULL,
  `mahasiswa_id` varchar(191) NOT NULL,
  `cpmk_id` varchar(191) NOT NULL,
  `mata_kuliah_id` varchar(191) NOT NULL,
  `nilai_akhir` decimal(5,2) NOT NULL,
  `semester` int(11) NOT NULL,
  `semester_id` varchar(191) DEFAULT NULL,
  `tahun_ajaran` varchar(191) NOT NULL,
  `is_calculated` tinyint(1) NOT NULL DEFAULT 1,
  `calculated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `nilai_cpmk`
--

INSERT INTO `nilai_cpmk` (`id`, `mahasiswa_id`, `cpmk_id`, `mata_kuliah_id`, `nilai_akhir`, `semester`, `semester_id`, `tahun_ajaran`, `is_calculated`, `calculated_at`, `updated_at`) VALUES
('04f10cf6-e98e-46a9-b6d3-ff04e1d3c137', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', 'c93c4535-8abc-480d-b11d-0e511a01ac7f', '1936ca45-b910-4787-a2ce-94e25481930f', 61.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:19.178', '2025-12-01 16:47:19.178'),
('05763641-c311-490f-a961-2c46c03068f3', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', 'd5fa648d-8d70-464b-880b-a3cd45d10272', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 97.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.921', '2025-12-01 16:47:18.921'),
('142ec1fa-4a51-41fb-a66f-705379a7375e', '56a45ba1-b6d8-4f76-8864-839825a973e2', 'eed272d9-74c3-4e34-9057-ee06f9473c04', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 81.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.663', '2025-12-01 16:47:18.663'),
('1498f546-78e9-41f2-806f-9720c59bc6c3', 'c37f443d-c904-433e-b244-1aa9014d7114', '0914010f-46ad-46ca-8276-6b76a6a60eb4', '5b36edab-4962-47de-9d27-3d0b379be7dd', 61.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.189', '2025-12-01 16:47:18.189'),
('195bf009-6cbf-4913-802f-9640fc8b13a4', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', '0914010f-46ad-46ca-8276-6b76a6a60eb4', '5b36edab-4962-47de-9d27-3d0b379be7dd', 100.00, 5, NULL, '2025/2026', 1, '2025-12-02 01:21:39.164', '2025-12-02 01:21:39.164'),
('19a4bb2a-3ecf-4cc9-abe4-7f51f1f96e6e', '07f726a9-13c2-428a-91a5-dc40670a8b3a', 'beb1f9a5-4beb-41fa-a9d4-67e684045396', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 82.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.824', '2025-12-01 16:47:18.824'),
('1c2ae0e3-205d-4931-bef3-f5f6fdc8479f', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', '9db0f830-6309-4c83-a066-15507da1fbe5', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 87.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.700', '2025-12-01 16:47:18.700'),
('2138bc84-b3fb-42ee-ad02-11b9edd3915c', '07f726a9-13c2-428a-91a5-dc40670a8b3a', 'd5fa648d-8d70-464b-880b-a3cd45d10272', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 83.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.828', '2025-12-01 16:47:18.828'),
('221e9c13-ba15-45dd-9039-2a2f42c87cc6', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', 'd5fa648d-8d70-464b-880b-a3cd45d10272', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 67.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.806', '2025-12-01 16:47:18.806'),
('24102c58-9a51-496e-8118-8ad408542620', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', '389a4bd3-f046-4550-a6bb-7e7781187fb9', '1936ca45-b910-4787-a2ce-94e25481930f', 66.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:19.174', '2025-12-01 16:47:19.174'),
('242d359c-e4c5-4d9f-bbfa-e4ad9b9ecccc', 'c37f443d-c904-433e-b244-1aa9014d7114', 'd5fa648d-8d70-464b-880b-a3cd45d10272', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 70.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.964', '2025-12-01 16:47:18.964'),
('24b3c280-a1f8-4895-a2b4-27aa030a0918', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', '0cd7ad12-bbc9-4d29-b69f-570c2c6bb2f4', '5b36edab-4962-47de-9d27-3d0b379be7dd', 84.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.047', '2025-12-01 16:47:18.047'),
('24d2d643-0151-4559-895e-18ba6d797ae9', '07f726a9-13c2-428a-91a5-dc40670a8b3a', '389a4bd3-f046-4550-a6bb-7e7781187fb9', '1936ca45-b910-4787-a2ce-94e25481930f', 66.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:19.076', '2025-12-01 16:47:19.076'),
('2591a63f-6295-40a2-b32e-476624a80563', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', 'd5fa648d-8d70-464b-880b-a3cd45d10272', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 96.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.876', '2025-12-01 16:47:18.876'),
('2a6dccee-3ab7-4ff9-8778-ba9179e08db0', '07f726a9-13c2-428a-91a5-dc40670a8b3a', '9db0f830-6309-4c83-a066-15507da1fbe5', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 69.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.605', '2025-12-01 16:47:18.605'),
('2aea3e2c-68f9-4adb-a0ee-c1506cc5af6b', 'dce817fb-29ac-4b9f-a098-54881d30844d', 'b2b18a57-1ef1-4473-882f-e1c7ffb19e60', '72c5b829-056e-4359-9f40-33801feed1e0', 66.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.538', '2025-12-01 16:47:18.538'),
('2c17e338-3671-40aa-8d13-c65dfc2fe736', '56a45ba1-b6d8-4f76-8864-839825a973e2', 'd5fa648d-8d70-464b-880b-a3cd45d10272', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 96.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.899', '2025-12-01 16:47:18.899'),
('2d3d303d-6327-43f9-9185-9ae9ca100b9b', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', '8d555a09-097a-41e8-89f6-2bc37913b119', '72c5b829-056e-4359-9f40-33801feed1e0', 67.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.401', '2025-12-01 16:47:18.401'),
('37105e92-abc3-4fe0-a33c-55cdc5d1a744', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', '0cd7ad12-bbc9-4d29-b69f-570c2c6bb2f4', '5b36edab-4962-47de-9d27-3d0b379be7dd', 85.00, 5, NULL, '2025/2026', 1, '2025-12-02 01:21:39.214', '2025-12-02 01:21:39.214'),
('3a411eef-c77a-427d-a289-924931c06e1b', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', 'beb1f9a5-4beb-41fa-a9d4-67e684045396', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 96.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.803', '2025-12-01 16:47:18.803'),
('3b8ce3e2-e6a2-4792-bcbb-9a1305b898ad', 'a3493848-185f-46fa-93df-d1f7124fabc1', 'b2b18a57-1ef1-4473-882f-e1c7ffb19e60', '72c5b829-056e-4359-9f40-33801feed1e0', 85.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.382', '2025-12-01 16:47:18.382'),
('3cc23583-9994-4386-b037-b98d1b817315', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', '9db0f830-6309-4c83-a066-15507da1fbe5', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 64.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.681', '2025-12-01 16:47:18.681'),
('3dc108a6-3d84-42bd-96a4-914c0d5754f8', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', 'b2b18a57-1ef1-4473-882f-e1c7ffb19e60', '72c5b829-056e-4359-9f40-33801feed1e0', 67.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.405', '2025-12-01 16:47:18.405'),
('46110e3e-cb5b-4e4c-8409-692a062cfe1f', 'a3493848-185f-46fa-93df-d1f7124fabc1', '9db0f830-6309-4c83-a066-15507da1fbe5', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 93.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.623', '2025-12-01 16:47:18.623'),
('513074dd-1bd2-4904-9933-ca0eab81aabd', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', '8d555a09-097a-41e8-89f6-2bc37913b119', '72c5b829-056e-4359-9f40-33801feed1e0', 74.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.467', '2025-12-01 16:47:18.467'),
('52fc8c9b-42ca-4ee2-ac84-04126e06de25', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', 'b2b18a57-1ef1-4473-882f-e1c7ffb19e60', '72c5b829-056e-4359-9f40-33801feed1e0', 99.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.470', '2025-12-01 16:47:18.470'),
('546fef81-e1cf-4f4f-8c24-0a1bc50d2656', '56a45ba1-b6d8-4f76-8864-839825a973e2', '0cd7ad12-bbc9-4d29-b69f-570c2c6bb2f4', '5b36edab-4962-47de-9d27-3d0b379be7dd', 73.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.073', '2025-12-01 16:47:18.073'),
('570bb576-01cc-405d-a868-275b024c6ee5', 'dce817fb-29ac-4b9f-a098-54881d30844d', 'beb1f9a5-4beb-41fa-a9d4-67e684045396', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 82.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:19.004', '2025-12-01 16:47:19.004'),
('59be3bda-741f-4729-8cf3-f8ea9b45032f', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', '389a4bd3-f046-4550-a6bb-7e7781187fb9', '1936ca45-b910-4787-a2ce-94e25481930f', 100.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:19.257', '2025-12-01 16:47:19.257'),
('5b40ff2a-3eb2-47ca-83a3-529cedf47749', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', '389a4bd3-f046-4550-a6bb-7e7781187fb9', '1936ca45-b910-4787-a2ce-94e25481930f', 92.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:19.155', '2025-12-01 16:47:19.155'),
('6106bb78-a7ec-4dd2-a17e-8f6c71ea2c3e', 'a3493848-185f-46fa-93df-d1f7124fabc1', '0cd7ad12-bbc9-4d29-b69f-570c2c6bb2f4', '5b36edab-4962-47de-9d27-3d0b379be7dd', 70.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.023', '2025-12-01 16:47:18.023'),
('61af596b-ff1b-477b-a0ad-9b1b3a29fee9', '56a45ba1-b6d8-4f76-8864-839825a973e2', '389a4bd3-f046-4550-a6bb-7e7781187fb9', '1936ca45-b910-4787-a2ce-94e25481930f', 75.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:19.136', '2025-12-01 16:47:19.136'),
('61cac4d6-9cae-44c4-a087-77b0105b6e0c', 'a3493848-185f-46fa-93df-d1f7124fabc1', '0914010f-46ad-46ca-8276-6b76a6a60eb4', '5b36edab-4962-47de-9d27-3d0b379be7dd', 82.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.021', '2025-12-01 16:47:18.021'),
('63bc3d69-85bf-4bbb-aa10-83ffc2825669', 'c37f443d-c904-433e-b244-1aa9014d7114', 'b2b18a57-1ef1-4473-882f-e1c7ffb19e60', '72c5b829-056e-4359-9f40-33801feed1e0', 89.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.493', '2025-12-01 16:47:18.493'),
('63f6f04b-6d2f-4858-8da4-1401a8d83abf', '56a45ba1-b6d8-4f76-8864-839825a973e2', '8d555a09-097a-41e8-89f6-2bc37913b119', '72c5b829-056e-4359-9f40-33801feed1e0', 93.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.424', '2025-12-01 16:47:18.424'),
('6bc28af3-905f-4e31-93c5-f6ed2ec6dd2e', '07f726a9-13c2-428a-91a5-dc40670a8b3a', 'b2b18a57-1ef1-4473-882f-e1c7ffb19e60', '72c5b829-056e-4359-9f40-33801feed1e0', 79.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.360', '2025-12-01 16:47:18.360'),
('6e83a7a3-8194-4288-9c69-989a6183a83a', 'a3493848-185f-46fa-93df-d1f7124fabc1', '8d555a09-097a-41e8-89f6-2bc37913b119', '72c5b829-056e-4359-9f40-33801feed1e0', 79.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.379', '2025-12-01 16:47:18.379'),
('784ad8f8-cc34-428e-8ce2-a9939cd711fb', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', 'beb1f9a5-4beb-41fa-a9d4-67e684045396', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 62.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.918', '2025-12-01 16:47:18.918'),
('7c26d7b3-2d27-4780-9d24-1ab777a2675b', '56a45ba1-b6d8-4f76-8864-839825a973e2', '0914010f-46ad-46ca-8276-6b76a6a60eb4', '5b36edab-4962-47de-9d27-3d0b379be7dd', 64.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.068', '2025-12-01 16:47:18.068'),
('7ccc66b8-bcdd-4c57-a4c4-15a39edc2dca', '07f726a9-13c2-428a-91a5-dc40670a8b3a', 'c93c4535-8abc-480d-b11d-0e511a01ac7f', '1936ca45-b910-4787-a2ce-94e25481930f', 61.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:19.079', '2025-12-01 16:47:19.079'),
('7d51048a-5e45-4ccf-b1ca-5718dab2fade', 'c37f443d-c904-433e-b244-1aa9014d7114', 'c93c4535-8abc-480d-b11d-0e511a01ac7f', '1936ca45-b910-4787-a2ce-94e25481930f', 66.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:19.199', '2025-12-01 16:47:19.199'),
('7ff48dc1-bfc0-4af4-80cd-c880012ab51e', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', 'eed272d9-74c3-4e34-9057-ee06f9473c04', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 82.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.684', '2025-12-01 16:47:18.684'),
('7ffce8eb-f2a4-4b69-b84f-30a74c8cbcbe', 'a3493848-185f-46fa-93df-d1f7124fabc1', 'd5fa648d-8d70-464b-880b-a3cd45d10272', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 65.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.849', '2025-12-01 16:47:18.849'),
('8357a1c4-9ce2-4f11-bece-46fe6c5238c4', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', '0cd7ad12-bbc9-4d29-b69f-570c2c6bb2f4', '5b36edab-4962-47de-9d27-3d0b379be7dd', 80.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.098', '2025-12-01 16:47:18.098'),
('845847bb-128a-4a40-a0fc-2f3b296fa31d', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', 'd5fa648d-8d70-464b-880b-a3cd45d10272', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 72.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.986', '2025-12-01 16:47:18.986'),
('8cf18414-5cf0-46eb-9f3c-44ba735d4ece', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', 'b2b18a57-1ef1-4473-882f-e1c7ffb19e60', '72c5b829-056e-4359-9f40-33801feed1e0', 65.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.516', '2025-12-01 16:47:18.516'),
('8cf833fb-7d02-4e8d-ab4e-985ac0e765df', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', '0cd7ad12-bbc9-4d29-b69f-570c2c6bb2f4', '5b36edab-4962-47de-9d27-3d0b379be7dd', 74.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:17.978', '2025-12-01 16:47:17.978'),
('945a8fa1-cd10-43b1-b153-c1be1c467e02', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', '9db0f830-6309-4c83-a066-15507da1fbe5', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 100.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.741', '2025-12-01 16:47:18.741'),
('951f342b-51ee-4be9-b77e-6773c5ef31f5', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', '389a4bd3-f046-4550-a6bb-7e7781187fb9', '1936ca45-b910-4787-a2ce-94e25481930f', 67.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:19.116', '2025-12-01 16:47:19.116'),
('95b2e428-35cb-41ca-9198-c925fb527a12', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', 'beb1f9a5-4beb-41fa-a9d4-67e684045396', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 80.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.873', '2025-12-01 16:47:18.873'),
('9945f27a-269b-4e43-83d4-1e3cbc21f04f', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', 'c93c4535-8abc-480d-b11d-0e511a01ac7f', '1936ca45-b910-4787-a2ce-94e25481930f', 89.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:19.119', '2025-12-01 16:47:19.119'),
('9b6cd44d-feda-4c51-a628-9e75f2d7fefd', '07f726a9-13c2-428a-91a5-dc40670a8b3a', 'eed272d9-74c3-4e34-9057-ee06f9473c04', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 83.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.608', '2025-12-01 16:47:18.608'),
('9daafe5d-8f72-44c3-9990-70330e03b7e9', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', 'd5fa648d-8d70-464b-880b-a3cd45d10272', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 90.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.943', '2025-12-01 16:47:18.943'),
('a0fded6d-0d31-44e8-8b5b-9bdea8007b33', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', 'b2b18a57-1ef1-4473-882f-e1c7ffb19e60', '72c5b829-056e-4359-9f40-33801feed1e0', 85.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.449', '2025-12-01 16:47:18.449'),
('a2273a33-1c8d-4d5f-9130-4b2a83d1056c', '07f726a9-13c2-428a-91a5-dc40670a8b3a', '0cd7ad12-bbc9-4d29-b69f-570c2c6bb2f4', '5b36edab-4962-47de-9d27-3d0b379be7dd', 84.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.002', '2025-12-01 16:47:18.002'),
('a3a82b17-463b-4293-975a-c6c7722b084f', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', '8d555a09-097a-41e8-89f6-2bc37913b119', '72c5b829-056e-4359-9f40-33801feed1e0', 80.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.445', '2025-12-01 16:47:18.445'),
('a3f10264-1087-487f-9bb2-0eba7861f7a7', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', '0cd7ad12-bbc9-4d29-b69f-570c2c6bb2f4', '5b36edab-4962-47de-9d27-3d0b379be7dd', 71.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.125', '2025-12-01 16:47:18.125'),
('a5af4995-3218-48be-a92d-dee29e0ba848', '07f726a9-13c2-428a-91a5-dc40670a8b3a', '0914010f-46ad-46ca-8276-6b76a6a60eb4', '5b36edab-4962-47de-9d27-3d0b379be7dd', 99.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:17.999', '2025-12-01 16:47:17.999'),
('a8e9d627-51d7-49be-bf73-974f6b89cfc8', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', 'c93c4535-8abc-480d-b11d-0e511a01ac7f', '1936ca45-b910-4787-a2ce-94e25481930f', 91.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:19.158', '2025-12-01 16:47:19.158'),
('ac4bcb2f-432d-479c-abfb-6de018f98d84', '56a45ba1-b6d8-4f76-8864-839825a973e2', 'b2b18a57-1ef1-4473-882f-e1c7ffb19e60', '72c5b829-056e-4359-9f40-33801feed1e0', 76.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.427', '2025-12-01 16:47:18.427'),
('aca5d496-eeb3-492c-9555-065912d78e62', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', 'eed272d9-74c3-4e34-9057-ee06f9473c04', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 62.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.744', '2025-12-01 16:47:18.744'),
('ae174093-3233-412b-8f23-8c0e5d12f308', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', '9db0f830-6309-4c83-a066-15507da1fbe5', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 72.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.584', '2025-12-01 16:47:18.584'),
('afec8b9c-a31d-43aa-93ee-36f979bd7372', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', '8d555a09-097a-41e8-89f6-2bc37913b119', '72c5b829-056e-4359-9f40-33801feed1e0', 90.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.512', '2025-12-01 16:47:18.512'),
('b28549b6-646b-4a39-9038-f954e928d558', 'dce817fb-29ac-4b9f-a098-54881d30844d', 'eed272d9-74c3-4e34-9057-ee06f9473c04', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 70.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.762', '2025-12-01 16:47:18.762'),
('b4676137-383e-4985-8106-5067eb20065b', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', 'eed272d9-74c3-4e34-9057-ee06f9473c04', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 65.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.644', '2025-12-01 16:47:18.644'),
('ba73dabd-e7e8-49a7-a6e1-f4a4cac0fb99', 'dce817fb-29ac-4b9f-a098-54881d30844d', '8d555a09-097a-41e8-89f6-2bc37913b119', '72c5b829-056e-4359-9f40-33801feed1e0', 71.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.535', '2025-12-01 16:47:18.535'),
('bb7fed0c-b2e1-4a59-ba34-f11c1c455073', 'dce817fb-29ac-4b9f-a098-54881d30844d', '9db0f830-6309-4c83-a066-15507da1fbe5', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 66.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.759', '2025-12-01 16:47:18.759'),
('bd0b8811-a1b2-482e-9ffa-a87c7efbd9ee', 'dce817fb-29ac-4b9f-a098-54881d30844d', 'd5fa648d-8d70-464b-880b-a3cd45d10272', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 79.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:19.009', '2025-12-01 16:47:19.009'),
('be83bdd3-7677-4314-98f3-c7a2e16aae0c', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', '9db0f830-6309-4c83-a066-15507da1fbe5', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 96.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.640', '2025-12-01 16:47:18.640'),
('bf16cbe7-4b72-44a6-a402-4cf000fbe3f6', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', '0cd7ad12-bbc9-4d29-b69f-570c2c6bb2f4', '5b36edab-4962-47de-9d27-3d0b379be7dd', 63.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.243', '2025-12-01 16:47:18.243'),
('c3ce5ebd-ffec-4efa-83ed-9ed3f04c8e7d', 'c37f443d-c904-433e-b244-1aa9014d7114', '9db0f830-6309-4c83-a066-15507da1fbe5', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 90.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.721', '2025-12-01 16:47:18.721'),
('c47f7eff-6fdd-4fb1-87d3-cd9bdaab58de', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', '0914010f-46ad-46ca-8276-6b76a6a60eb4', '5b36edab-4962-47de-9d27-3d0b379be7dd', 68.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.121', '2025-12-01 16:47:18.121'),
('c5fcbd41-d082-4404-846c-a29ecc97f201', 'dce817fb-29ac-4b9f-a098-54881d30844d', '0914010f-46ad-46ca-8276-6b76a6a60eb4', '5b36edab-4962-47de-9d27-3d0b379be7dd', 99.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.270', '2025-12-01 16:47:18.270'),
('c66222f8-6e35-496d-a96e-49a278ec660a', '56a45ba1-b6d8-4f76-8864-839825a973e2', 'c93c4535-8abc-480d-b11d-0e511a01ac7f', '1936ca45-b910-4787-a2ce-94e25481930f', 63.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:19.139', '2025-12-01 16:47:19.139'),
('c90bd706-54a4-413d-9935-b33937c7e35d', 'dce817fb-29ac-4b9f-a098-54881d30844d', '389a4bd3-f046-4550-a6bb-7e7781187fb9', '1936ca45-b910-4787-a2ce-94e25481930f', 73.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:19.297', '2025-12-01 16:47:19.297'),
('cbedecfb-83fa-4759-9acb-81725387a6ae', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', 'c93c4535-8abc-480d-b11d-0e511a01ac7f', '1936ca45-b910-4787-a2ce-94e25481930f', 91.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:19.275', '2025-12-01 16:47:19.275'),
('ccf571c1-1e66-4704-91a8-9d4e9b33ab13', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', 'eed272d9-74c3-4e34-9057-ee06f9473c04', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 87.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.587', '2025-12-01 16:47:18.587'),
('ceb0acc4-b623-42bb-b08e-c940ee5eae73', '56a45ba1-b6d8-4f76-8864-839825a973e2', '9db0f830-6309-4c83-a066-15507da1fbe5', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 74.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.660', '2025-12-01 16:47:18.660'),
('d12a58c2-ef3d-48fb-baed-fefc0fbbeea1', 'a3493848-185f-46fa-93df-d1f7124fabc1', 'c93c4535-8abc-480d-b11d-0e511a01ac7f', '1936ca45-b910-4787-a2ce-94e25481930f', 73.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:19.099', '2025-12-01 16:47:19.099'),
('d5058013-64be-4a16-9285-1957c735839b', 'a3493848-185f-46fa-93df-d1f7124fabc1', 'beb1f9a5-4beb-41fa-a9d4-67e684045396', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 75.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.845', '2025-12-01 16:47:18.845'),
('d5b64723-94f7-4600-9f33-c32d6f52d67d', 'c37f443d-c904-433e-b244-1aa9014d7114', '8d555a09-097a-41e8-89f6-2bc37913b119', '72c5b829-056e-4359-9f40-33801feed1e0', 61.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.489', '2025-12-01 16:47:18.489'),
('d82d722d-c126-49a2-86a7-2c3a3f57e550', 'c37f443d-c904-433e-b244-1aa9014d7114', 'eed272d9-74c3-4e34-9057-ee06f9473c04', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 69.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.724', '2025-12-01 16:47:18.724'),
('d876db29-9b50-4e88-8cf9-8aedf8e116ba', 'a3493848-185f-46fa-93df-d1f7124fabc1', '389a4bd3-f046-4550-a6bb-7e7781187fb9', '1936ca45-b910-4787-a2ce-94e25481930f', 82.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:19.096', '2025-12-01 16:47:19.096'),
('d98fb63e-64a1-4d81-9f76-5d99d2cdac64', 'c37f443d-c904-433e-b244-1aa9014d7114', '0cd7ad12-bbc9-4d29-b69f-570c2c6bb2f4', '5b36edab-4962-47de-9d27-3d0b379be7dd', 67.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.210', '2025-12-01 16:47:18.210'),
('da13472e-a686-4ac8-b4de-1a1f1b865a1d', '56a45ba1-b6d8-4f76-8864-839825a973e2', 'beb1f9a5-4beb-41fa-a9d4-67e684045396', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 90.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.894', '2025-12-01 16:47:18.894'),
('dd045210-b5ce-40e8-a5d5-281a59a8bdff', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', 'beb1f9a5-4beb-41fa-a9d4-67e684045396', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 62.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.983', '2025-12-01 16:47:18.983'),
('df65bba8-7ab4-4219-a890-860af8a38527', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', 'eed272d9-74c3-4e34-9057-ee06f9473c04', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 70.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.703', '2025-12-01 16:47:18.703'),
('dff7c063-ca21-4516-a563-8f91c1efccec', 'a3493848-185f-46fa-93df-d1f7124fabc1', 'eed272d9-74c3-4e34-9057-ee06f9473c04', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 77.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.626', '2025-12-01 16:47:18.626'),
('e25a4082-2712-4b32-bceb-287ff42112b8', '07f726a9-13c2-428a-91a5-dc40670a8b3a', '8d555a09-097a-41e8-89f6-2bc37913b119', '72c5b829-056e-4359-9f40-33801feed1e0', 95.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.356', '2025-12-01 16:47:18.356'),
('e6074fe5-0b56-45fb-a6a1-bbbd968a15d9', 'dce817fb-29ac-4b9f-a098-54881d30844d', '0cd7ad12-bbc9-4d29-b69f-570c2c6bb2f4', '5b36edab-4962-47de-9d27-3d0b379be7dd', 78.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.274', '2025-12-01 16:47:18.274'),
('e69636b9-0a9e-4efb-826a-1a41c89ca60b', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', 'b2b18a57-1ef1-4473-882f-e1c7ffb19e60', '72c5b829-056e-4359-9f40-33801feed1e0', 89.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.335', '2025-12-01 16:47:18.335'),
('eb6bc06c-c9d0-440e-8367-83bfbf9bdbd9', 'dce817fb-29ac-4b9f-a098-54881d30844d', 'c93c4535-8abc-480d-b11d-0e511a01ac7f', '1936ca45-b910-4787-a2ce-94e25481930f', 81.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:19.300', '2025-12-01 16:47:19.300'),
('ecc0741a-a0e1-43c6-9e9d-669e6a9200b5', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', '0914010f-46ad-46ca-8276-6b76a6a60eb4', '5b36edab-4962-47de-9d27-3d0b379be7dd', 78.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:17.974', '2025-12-01 16:47:17.974'),
('ee9c2e64-42f5-4648-86a6-6dba04934aff', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', '8d555a09-097a-41e8-89f6-2bc37913b119', '72c5b829-056e-4359-9f40-33801feed1e0', 94.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.331', '2025-12-01 16:47:18.331'),
('f577b2b6-21d8-4cb2-bc2e-bc0d3116e023', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', '0914010f-46ad-46ca-8276-6b76a6a60eb4', '5b36edab-4962-47de-9d27-3d0b379be7dd', 82.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.095', '2025-12-01 16:47:18.095'),
('f869452b-7277-4e66-b72a-56ab715ec305', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', '0914010f-46ad-46ca-8276-6b76a6a60eb4', '5b36edab-4962-47de-9d27-3d0b379be7dd', 88.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.240', '2025-12-01 16:47:18.240'),
('f8ed8356-b230-4bee-ac48-87febcaadf48', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', 'c93c4535-8abc-480d-b11d-0e511a01ac7f', '1936ca45-b910-4787-a2ce-94e25481930f', 87.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:19.061', '2025-12-01 16:47:19.061'),
('f9c16b3f-1d71-4801-9ec3-8661b47fb2de', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', 'beb1f9a5-4beb-41fa-a9d4-67e684045396', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 79.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.939', '2025-12-01 16:47:18.939'),
('fad675c0-805c-4bcb-a307-4cbdb546025e', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', '389a4bd3-f046-4550-a6bb-7e7781187fb9', '1936ca45-b910-4787-a2ce-94e25481930f', 69.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:19.058', '2025-12-01 16:47:19.058'),
('fc6a8226-2b9e-4988-8cf4-afcb9d17f497', 'c37f443d-c904-433e-b244-1aa9014d7114', 'beb1f9a5-4beb-41fa-a9d4-67e684045396', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 70.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.961', '2025-12-01 16:47:18.961'),
('fd630232-752f-4b35-936e-05ceaee40747', 'c37f443d-c904-433e-b244-1aa9014d7114', '389a4bd3-f046-4550-a6bb-7e7781187fb9', '1936ca45-b910-4787-a2ce-94e25481930f', 64.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:19.195', '2025-12-01 16:47:19.195'),
('fed6553e-843e-4590-b88b-74f7d103d397', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', '0914010f-46ad-46ca-8276-6b76a6a60eb4', '5b36edab-4962-47de-9d27-3d0b379be7dd', 88.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', 1, '2025-12-01 16:47:18.044', '2025-12-01 16:47:18.044');

-- --------------------------------------------------------

--
-- Table structure for table `nilai_rubrik`
--

CREATE TABLE `nilai_rubrik` (
  `id` varchar(191) NOT NULL,
  `nilai_teknik_id` varchar(191) NOT NULL,
  `rubrik_level_id` varchar(191) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `nilai_rubrik`
--

INSERT INTO `nilai_rubrik` (`id`, `nilai_teknik_id`, `rubrik_level_id`, `created_at`, `updated_at`) VALUES
('05986874-f29b-4b22-9dc4-d338ff8c02b0', '94ff1e54-986f-4168-94c5-52d0bf5c1325', '577d5de8-238c-49d5-9b61-33276147262d', '2025-12-01 16:47:18.039', '2025-12-01 16:47:18.039'),
('0fe34bd0-8016-4c64-9a73-c7aa10921a7e', '408e25f0-ff9b-43ef-a263-54d133a8d903', '577d5de8-238c-49d5-9b61-33276147262d', '2025-12-01 16:47:18.015', '2025-12-01 16:47:18.015'),
('1c70f8f5-b43d-4e67-a615-b5b1b76d146b', '408e25f0-ff9b-43ef-a263-54d133a8d903', '05e66700-6218-4503-8e95-ed1cdc6626f5', '2025-12-01 16:47:18.018', '2025-12-01 16:47:18.018'),
('238b8de2-cf41-45b3-ba5a-1063f14d1450', '0a6cb31f-74dc-4f25-b508-270bce61b78b', '05e66700-6218-4503-8e95-ed1cdc6626f5', '2025-12-01 16:47:17.971', '2025-12-01 16:47:17.971'),
('2751195e-86af-4622-a025-e810a0659b11', 'a4b2ea06-6c30-4035-a041-6f522a6299f5', 'f21c98f1-b4d5-494d-a054-02722851f79b', '2025-12-01 16:47:18.119', '2025-12-01 16:47:18.119'),
('2e3fec14-c1b5-4e21-b0a6-7f66460c285a', '94ff1e54-986f-4168-94c5-52d0bf5c1325', '05e66700-6218-4503-8e95-ed1cdc6626f5', '2025-12-01 16:47:18.041', '2025-12-01 16:47:18.041'),
('3208a2c1-be62-405c-831d-8b29f7625152', 'a4b2ea06-6c30-4035-a041-6f522a6299f5', '14223b2e-f5ae-458b-a60a-8d51f5e602c7', '2025-12-01 16:47:18.116', '2025-12-01 16:47:18.116'),
('3432ed77-20c4-46bf-9e44-b3e5c45a93e3', '9240069f-0a86-4bbc-b325-1f42f50b67df', 'f21c98f1-b4d5-494d-a054-02722851f79b', '2025-12-01 16:47:17.996', '2025-12-01 16:47:17.996'),
('3c4a90d2-1879-4d96-8270-bd0dbbbd1116', '45f326db-6ad9-4dcc-915f-7fa9ff8d3b02', 'f21c98f1-b4d5-494d-a054-02722851f79b', '2025-12-01 16:47:18.236', '2025-12-01 16:47:18.236'),
('40401f62-0e3e-432f-86e0-8b9a2c8246e5', '98e5cb78-0759-4a61-8569-ee0bde8cd1bf', '05e66700-6218-4503-8e95-ed1cdc6626f5', '2025-12-01 16:47:18.267', '2025-12-01 16:47:18.267'),
('4b6dfef0-70a6-4949-8b8b-88054e17a2cd', '0b41aba6-c95c-4887-88f7-90596b2889d3', '577d5de8-238c-49d5-9b61-33276147262d', '2025-12-01 16:47:18.089', '2025-12-01 16:47:18.089'),
('764f9253-34d0-4261-ac2b-37f668baef5c', '9240069f-0a86-4bbc-b325-1f42f50b67df', '577d5de8-238c-49d5-9b61-33276147262d', '2025-12-01 16:47:17.993', '2025-12-01 16:47:17.993'),
('7e1d41db-585e-43b6-a66d-f47bfa32ce37', 'ed8bbe5a-8dc3-4a64-9aeb-c55ff61d6f32', '05e66700-6218-4503-8e95-ed1cdc6626f5', '2025-12-01 16:47:18.065', '2025-12-01 16:47:18.065'),
('98bea9b4-ee62-40e0-ad63-1f9b813dfba9', '0b41aba6-c95c-4887-88f7-90596b2889d3', 'f21c98f1-b4d5-494d-a054-02722851f79b', '2025-12-01 16:47:18.092', '2025-12-01 16:47:18.092'),
('b15e285c-7bad-4b65-b344-f2f9684e3145', '3f1ae62d-81f7-42a9-a26c-37ce5969ba7e', '05e66700-6218-4503-8e95-ed1cdc6626f5', '2025-12-01 16:47:18.184', '2025-12-01 16:47:18.184'),
('b7a5acea-411f-4bea-8233-4c8c063ad5f8', '3f1ae62d-81f7-42a9-a26c-37ce5969ba7e', '14223b2e-f5ae-458b-a60a-8d51f5e602c7', '2025-12-01 16:47:18.142', '2025-12-01 16:47:18.142'),
('c7d18efc-1ce2-4224-9165-3e4045a91a86', '45f326db-6ad9-4dcc-915f-7fa9ff8d3b02', '577d5de8-238c-49d5-9b61-33276147262d', '2025-12-01 16:47:18.233', '2025-12-01 16:47:18.233'),
('d205434a-d2ec-4b0a-bcce-54d5ff832df1', '98e5cb78-0759-4a61-8569-ee0bde8cd1bf', '14223b2e-f5ae-458b-a60a-8d51f5e602c7', '2025-12-01 16:47:18.263', '2025-12-01 16:47:18.263'),
('d9412228-8786-44eb-b20f-122570424bff', '0a6cb31f-74dc-4f25-b508-270bce61b78b', '14223b2e-f5ae-458b-a60a-8d51f5e602c7', '2025-12-01 16:47:17.968', '2025-12-01 16:47:17.968'),
('d9ba9dfb-f98b-425d-ab32-344b488291b1', '35720180-5df7-471e-bb2b-a008ce018619', '14223b2e-f5ae-458b-a60a-8d51f5e602c7', '2025-12-02 01:21:39.202', '2025-12-02 01:21:39.202'),
('ecc3c0f4-77bb-4b98-b8d7-61c663872527', 'ed8bbe5a-8dc3-4a64-9aeb-c55ff61d6f32', '577d5de8-238c-49d5-9b61-33276147262d', '2025-12-01 16:47:18.063', '2025-12-01 16:47:18.063'),
('f8bf4a4a-364c-4d25-aa0b-aaf8119e3c76', '17445a9d-bb19-4dcc-936d-ba21768f6d4f', 'dfaa246b-91cc-408d-b418-1981201033c6', '2025-12-02 01:21:39.143', '2025-12-02 01:21:39.143'),
('f9a6e6ce-8f07-4d49-a455-90a742ce243f', '35720180-5df7-471e-bb2b-a008ce018619', 'f21c98f1-b4d5-494d-a054-02722851f79b', '2025-12-02 01:21:39.202', '2025-12-02 01:21:39.202');

-- --------------------------------------------------------

--
-- Table structure for table `nilai_teknik_penilaian`
--

CREATE TABLE `nilai_teknik_penilaian` (
  `id` varchar(191) NOT NULL,
  `mahasiswa_id` varchar(191) NOT NULL,
  `teknik_penilaian_id` varchar(191) NOT NULL,
  `mata_kuliah_id` varchar(191) NOT NULL,
  `nilai` decimal(5,2) NOT NULL,
  `semester` int(11) NOT NULL,
  `semester_id` varchar(191) DEFAULT NULL,
  `tahun_ajaran` varchar(191) NOT NULL,
  `catatan` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `created_by` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `nilai_teknik_penilaian`
--

INSERT INTO `nilai_teknik_penilaian` (`id`, `mahasiswa_id`, `teknik_penilaian_id`, `mata_kuliah_id`, `nilai`, `semester`, `semester_id`, `tahun_ajaran`, `catatan`, `created_at`, `updated_at`, `created_by`) VALUES
('00166ac5-6b5a-4c2a-963d-45d75c44e318', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', '01037c9b-f021-4ba3-a97b-5e902e758941', '5b36edab-4962-47de-9d27-3d0b379be7dd', 68.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.109', '2025-12-01 16:47:18.109', NULL),
('02ceda03-87d9-448d-879c-a896627c02bd', 'dce817fb-29ac-4b9f-a098-54881d30844d', 'e71827d9-dd1b-4776-a32e-84bbdc261c87', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 79.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.000', '2025-12-01 16:47:19.000', NULL),
('03550f46-970e-4a0f-a4e2-58ea2d0bafae', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', 'e71827d9-dd1b-4776-a32e-84bbdc261c87', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 72.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.979', '2025-12-01 16:47:18.979', NULL),
('0461aa7c-e016-40f2-b4dc-ede627ca43c6', 'c37f443d-c904-433e-b244-1aa9014d7114', 'b08de74d-2a5c-4694-a3fc-803888c13afb', '1936ca45-b910-4787-a2ce-94e25481930f', 64.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.187', '2025-12-01 16:47:19.187', NULL),
('09e5ba9a-244d-4df2-9614-3e517789cca2', 'dce817fb-29ac-4b9f-a098-54881d30844d', '8d1d30ef-dd4d-4cd8-90e2-2dff71dd480c', '1936ca45-b910-4787-a2ce-94e25481930f', 81.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.293', '2025-12-01 16:47:19.293', NULL),
('0a6cb31f-74dc-4f25-b508-270bce61b78b', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', 'afe5ce7b-6efc-47e5-97bc-7feda0911678', '5b36edab-4962-47de-9d27-3d0b379be7dd', 74.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:17.965', '2025-12-01 16:47:17.965', NULL),
('0b41aba6-c95c-4887-88f7-90596b2889d3', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', 'afe5ce7b-6efc-47e5-97bc-7feda0911678', '5b36edab-4962-47de-9d27-3d0b379be7dd', 80.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.085', '2025-12-01 16:47:18.085', NULL),
('0badf30d-7e2f-4a12-a10d-0f3ad5ed4250', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', '8d1d30ef-dd4d-4cd8-90e2-2dff71dd480c', '1936ca45-b910-4787-a2ce-94e25481930f', 89.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.113', '2025-12-01 16:47:19.113', NULL),
('0c034d24-dd21-483f-821d-07b1942d27b7', 'a3493848-185f-46fa-93df-d1f7124fabc1', 'a8b34669-aa7f-4588-8349-9685e92d16b7', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 77.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.620', '2025-12-01 16:47:18.620', NULL),
('11eee31e-218a-42b1-9ebb-d9ff9206d5fb', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', '01037c9b-f021-4ba3-a97b-5e902e758941', '5b36edab-4962-47de-9d27-3d0b379be7dd', 82.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.082', '2025-12-01 16:47:18.082', NULL),
('14fa29b0-a803-4339-973d-f921ae0d511a', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', '01037c9b-f021-4ba3-a97b-5e902e758941', '5b36edab-4962-47de-9d27-3d0b379be7dd', 88.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.224', '2025-12-01 16:47:18.224', NULL),
('17445a9d-bb19-4dcc-936d-ba21768f6d4f', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', '01037c9b-f021-4ba3-a97b-5e902e758941', '5b36edab-4962-47de-9d27-3d0b379be7dd', 100.00, 5, NULL, '2025/2026', NULL, '2025-12-02 01:21:39.125', '2025-12-02 01:21:39.125', '9b0c44d1-79e8-4b63-8b43-632f575df3cd'),
('185c0325-4911-4b7b-a69d-3c724424beeb', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', '2261932e-3bc4-4baa-b7ff-483ad11610b4', '72c5b829-056e-4359-9f40-33801feed1e0', 99.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.463', '2025-12-01 16:47:18.463', NULL),
('192eb3ce-e0ed-4648-88bb-419f6f7c415a', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', 'e71827d9-dd1b-4776-a32e-84bbdc261c87', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 67.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.800', '2025-12-01 16:47:18.800', NULL),
('1af9ef3e-bf5a-45b6-a8a1-d71af9c3087a', 'dce817fb-29ac-4b9f-a098-54881d30844d', 'b08de74d-2a5c-4694-a3fc-803888c13afb', '1936ca45-b910-4787-a2ce-94e25481930f', 73.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.289', '2025-12-01 16:47:19.289', NULL),
('1b1865c0-0546-489a-87cc-573ffd0b44e4', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', 'b08de74d-2a5c-4694-a3fc-803888c13afb', '1936ca45-b910-4787-a2ce-94e25481930f', 69.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.051', '2025-12-01 16:47:19.051', NULL),
('1f99c946-677e-4434-9eb5-b41051f783b5', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', 'cb9faf76-4b07-443b-a911-7216041f8408', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 100.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.734', '2025-12-01 16:47:18.734', NULL),
('22b08d47-a888-4f45-82ca-106238302885', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', '2261932e-3bc4-4baa-b7ff-483ad11610b4', '72c5b829-056e-4359-9f40-33801feed1e0', 89.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.328', '2025-12-01 16:47:18.328', NULL),
('22e1f381-0e79-4600-acbf-dd47b5abb66e', '07f726a9-13c2-428a-91a5-dc40670a8b3a', 'ea2a2dd0-e0b7-4b86-8a6a-c71135cccc62', '72c5b829-056e-4359-9f40-33801feed1e0', 95.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.348', '2025-12-01 16:47:18.348', NULL),
('24bfb8c7-a292-4a0e-8889-ad029ec65f8f', 'c37f443d-c904-433e-b244-1aa9014d7114', '2261932e-3bc4-4baa-b7ff-483ad11610b4', '72c5b829-056e-4359-9f40-33801feed1e0', 89.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.485', '2025-12-01 16:47:18.485', NULL),
('2c5e9bb1-54e9-435c-8eac-9590d27e447f', 'dce817fb-29ac-4b9f-a098-54881d30844d', 'ea2a2dd0-e0b7-4b86-8a6a-c71135cccc62', '72c5b829-056e-4359-9f40-33801feed1e0', 71.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.527', '2025-12-01 16:47:18.527', NULL),
('2c706000-0c14-462d-b1e5-9aaa90f664e6', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', 'e71827d9-dd1b-4776-a32e-84bbdc261c87', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 97.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.915', '2025-12-01 16:47:18.915', NULL),
('2d8f82a6-d425-4f05-acb4-929dbfc23673', 'c37f443d-c904-433e-b244-1aa9014d7114', 'a8b34669-aa7f-4588-8349-9685e92d16b7', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 69.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.717', '2025-12-01 16:47:18.717', NULL),
('3221dadd-02c7-4dfe-9fe4-3f7d2c5ab904', '07f726a9-13c2-428a-91a5-dc40670a8b3a', 'a8b34669-aa7f-4588-8349-9685e92d16b7', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 83.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.601', '2025-12-01 16:47:18.601', NULL),
('35720180-5df7-471e-bb2b-a008ce018619', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', 'afe5ce7b-6efc-47e5-97bc-7feda0911678', '5b36edab-4962-47de-9d27-3d0b379be7dd', 85.00, 5, NULL, '2025/2026', NULL, '2025-12-02 01:21:39.193', '2025-12-02 01:21:39.193', '9b0c44d1-79e8-4b63-8b43-632f575df3cd'),
('37e62579-b878-49f6-8110-586770257d00', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', 'ea2a2dd0-e0b7-4b86-8a6a-c71135cccc62', '72c5b829-056e-4359-9f40-33801feed1e0', 90.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.504', '2025-12-01 16:47:18.504', NULL),
('382d180f-ef8e-4c63-b33b-108207e319cc', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', '01037c9b-f021-4ba3-a97b-5e902e758941', '5b36edab-4962-47de-9d27-3d0b379be7dd', 78.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:17.961', '2025-12-01 16:47:17.961', NULL),
('3951b5a3-fe99-4591-a6f4-33d9b6a286ad', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', '8d1d30ef-dd4d-4cd8-90e2-2dff71dd480c', '1936ca45-b910-4787-a2ce-94e25481930f', 91.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.152', '2025-12-01 16:47:19.152', NULL),
('3d9f14b7-60bb-4427-8540-cbf62f24e302', '56a45ba1-b6d8-4f76-8864-839825a973e2', '2261932e-3bc4-4baa-b7ff-483ad11610b4', '72c5b829-056e-4359-9f40-33801feed1e0', 76.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.420', '2025-12-01 16:47:18.420', NULL),
('3f1ae62d-81f7-42a9-a26c-37ce5969ba7e', 'c37f443d-c904-433e-b244-1aa9014d7114', 'afe5ce7b-6efc-47e5-97bc-7feda0911678', '5b36edab-4962-47de-9d27-3d0b379be7dd', 67.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.139', '2025-12-01 16:47:18.139', NULL),
('408e25f0-ff9b-43ef-a263-54d133a8d903', 'a3493848-185f-46fa-93df-d1f7124fabc1', 'afe5ce7b-6efc-47e5-97bc-7feda0911678', '5b36edab-4962-47de-9d27-3d0b379be7dd', 70.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.013', '2025-12-01 16:47:18.013', NULL),
('41896af0-88c0-4f94-a844-bd0870fa810d', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', '8d1d30ef-dd4d-4cd8-90e2-2dff71dd480c', '1936ca45-b910-4787-a2ce-94e25481930f', 91.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.213', '2025-12-01 16:47:19.213', NULL),
('45f326db-6ad9-4dcc-915f-7fa9ff8d3b02', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', 'afe5ce7b-6efc-47e5-97bc-7feda0911678', '5b36edab-4962-47de-9d27-3d0b379be7dd', 63.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.230', '2025-12-01 16:47:18.230', NULL),
('4617309d-46f4-4259-803b-2a08e78afe5a', '56a45ba1-b6d8-4f76-8864-839825a973e2', 'ea2a2dd0-e0b7-4b86-8a6a-c71135cccc62', '72c5b829-056e-4359-9f40-33801feed1e0', 93.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.416', '2025-12-01 16:47:18.416', NULL),
('48830546-a813-4cb8-8bf2-0fee27eea3ac', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', 'a8b34669-aa7f-4588-8349-9685e92d16b7', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 62.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.738', '2025-12-01 16:47:18.738', NULL),
('4de65974-2757-4c32-a5b6-7b39d3498c23', '07f726a9-13c2-428a-91a5-dc40670a8b3a', '1c32e5c7-2c57-45d1-8809-2504b3fc9427', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 82.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.817', '2025-12-01 16:47:18.817', NULL),
('4e0aeb46-373f-48ad-a8d7-14a9abb43f55', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', 'b08de74d-2a5c-4694-a3fc-803888c13afb', '1936ca45-b910-4787-a2ce-94e25481930f', 92.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.148', '2025-12-01 16:47:19.148', NULL),
('58192914-0d1b-497d-8bc3-493870cd6ca8', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', 'b08de74d-2a5c-4694-a3fc-803888c13afb', '1936ca45-b910-4787-a2ce-94e25481930f', 100.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.209', '2025-12-01 16:47:19.209', NULL),
('59af6410-c181-42d1-94b9-10d22959aa43', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', '1c32e5c7-2c57-45d1-8809-2504b3fc9427', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 62.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.974', '2025-12-01 16:47:18.974', NULL),
('5a91e560-3dca-4d94-8098-9f6fa2eec73d', 'a3493848-185f-46fa-93df-d1f7124fabc1', '1c32e5c7-2c57-45d1-8809-2504b3fc9427', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 75.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.839', '2025-12-01 16:47:18.839', NULL),
('5b3be2e2-10fb-4aa0-abea-cbbbe410772e', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', 'ea2a2dd0-e0b7-4b86-8a6a-c71135cccc62', '72c5b829-056e-4359-9f40-33801feed1e0', 67.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.394', '2025-12-01 16:47:18.394', NULL),
('5fb15617-d510-4c38-bef9-7eaafce95cb4', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', '1c32e5c7-2c57-45d1-8809-2504b3fc9427', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 80.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.862', '2025-12-01 16:47:18.862', NULL),
('63812e8e-1520-4dbe-9cde-819dd1cf94ad', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', 'e71827d9-dd1b-4776-a32e-84bbdc261c87', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 96.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.867', '2025-12-01 16:47:18.867', NULL),
('63f9bd5e-72c2-428a-b41d-0573bd7d4bf6', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', '8d1d30ef-dd4d-4cd8-90e2-2dff71dd480c', '1936ca45-b910-4787-a2ce-94e25481930f', 61.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.171', '2025-12-01 16:47:19.171', NULL),
('67384d9f-b114-4547-a853-e1bec5e4bb96', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', 'e71827d9-dd1b-4776-a32e-84bbdc261c87', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 90.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.935', '2025-12-01 16:47:18.935', NULL),
('6a5bfdf1-a3d2-41c3-9c93-ca024bccb7af', 'dce817fb-29ac-4b9f-a098-54881d30844d', '2261932e-3bc4-4baa-b7ff-483ad11610b4', '72c5b829-056e-4359-9f40-33801feed1e0', 66.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.531', '2025-12-01 16:47:18.531', NULL),
('6c636fd2-ec9b-41b5-a623-6bf283a2a669', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', '2261932e-3bc4-4baa-b7ff-483ad11610b4', '72c5b829-056e-4359-9f40-33801feed1e0', 65.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.508', '2025-12-01 16:47:18.508', NULL),
('6f1332f1-1d9f-484a-a984-22f96bce7a67', '07f726a9-13c2-428a-91a5-dc40670a8b3a', '8d1d30ef-dd4d-4cd8-90e2-2dff71dd480c', '1936ca45-b910-4787-a2ce-94e25481930f', 61.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.073', '2025-12-01 16:47:19.073', NULL),
('70adf9e1-3232-427f-bd8f-86bdec095c82', 'c37f443d-c904-433e-b244-1aa9014d7114', '8d1d30ef-dd4d-4cd8-90e2-2dff71dd480c', '1936ca45-b910-4787-a2ce-94e25481930f', 66.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.191', '2025-12-01 16:47:19.191', NULL),
('70b80ebb-9e54-49ec-aa51-f8da8147cf2b', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', '1c32e5c7-2c57-45d1-8809-2504b3fc9427', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 62.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.911', '2025-12-01 16:47:18.911', NULL),
('7620c954-8b76-466f-a835-a02654adf73a', '56a45ba1-b6d8-4f76-8864-839825a973e2', 'b08de74d-2a5c-4694-a3fc-803888c13afb', '1936ca45-b910-4787-a2ce-94e25481930f', 75.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.129', '2025-12-01 16:47:19.129', NULL),
('7c3a5345-413b-4787-ba20-19be6407e0bb', 'dce817fb-29ac-4b9f-a098-54881d30844d', '01037c9b-f021-4ba3-a97b-5e902e758941', '5b36edab-4962-47de-9d27-3d0b379be7dd', 99.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.255', '2025-12-01 16:47:18.255', NULL),
('7f82a448-39d6-4fc7-9300-9cb00289ae68', '56a45ba1-b6d8-4f76-8864-839825a973e2', 'cb9faf76-4b07-443b-a911-7216041f8408', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 74.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.653', '2025-12-01 16:47:18.653', NULL),
('80b75aab-3c18-42c7-87f5-5aeaa969005e', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', 'ea2a2dd0-e0b7-4b86-8a6a-c71135cccc62', '72c5b829-056e-4359-9f40-33801feed1e0', 94.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.324', '2025-12-01 16:47:18.324', NULL),
('81052344-ae39-4cd2-8b99-7281b4347d4a', '56a45ba1-b6d8-4f76-8864-839825a973e2', 'e71827d9-dd1b-4776-a32e-84bbdc261c87', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 96.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.890', '2025-12-01 16:47:18.890', NULL),
('85f37e38-703b-43c7-8e0c-f9081b8ca1c4', 'c37f443d-c904-433e-b244-1aa9014d7114', '01037c9b-f021-4ba3-a97b-5e902e758941', '5b36edab-4962-47de-9d27-3d0b379be7dd', 61.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.135', '2025-12-01 16:47:18.135', NULL),
('86fc7a0f-0381-45bb-a0ee-f5a5ad7e372d', '07f726a9-13c2-428a-91a5-dc40670a8b3a', '01037c9b-f021-4ba3-a97b-5e902e758941', '5b36edab-4962-47de-9d27-3d0b379be7dd', 99.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:17.987', '2025-12-01 16:47:17.987', NULL),
('8796fd6d-14a6-4a22-a849-d9d0b96c593e', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', 'b08de74d-2a5c-4694-a3fc-803888c13afb', '1936ca45-b910-4787-a2ce-94e25481930f', 67.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.110', '2025-12-01 16:47:19.110', NULL),
('89d46ca0-9730-4453-bd7e-e8efd89da6bb', '56a45ba1-b6d8-4f76-8864-839825a973e2', 'a8b34669-aa7f-4588-8349-9685e92d16b7', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 81.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.657', '2025-12-01 16:47:18.657', NULL),
('8af51d3f-a72a-40f6-ab6e-4f9b0dd0a7dc', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', '8d1d30ef-dd4d-4cd8-90e2-2dff71dd480c', '1936ca45-b910-4787-a2ce-94e25481930f', 87.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.054', '2025-12-01 16:47:19.054', NULL),
('8b0fb7c9-a528-492e-b1a9-b850a286abc6', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', 'ea2a2dd0-e0b7-4b86-8a6a-c71135cccc62', '72c5b829-056e-4359-9f40-33801feed1e0', 74.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.460', '2025-12-01 16:47:18.460', NULL),
('8ea3a29f-a5a0-41cc-bcf1-534bca185f29', '07f726a9-13c2-428a-91a5-dc40670a8b3a', 'e71827d9-dd1b-4776-a32e-84bbdc261c87', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 83.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.820', '2025-12-01 16:47:18.820', NULL),
('8ea533a3-df73-4b3b-88de-29a8f8e59980', 'a3493848-185f-46fa-93df-d1f7124fabc1', '8d1d30ef-dd4d-4cd8-90e2-2dff71dd480c', '1936ca45-b910-4787-a2ce-94e25481930f', 73.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.092', '2025-12-01 16:47:19.092', NULL),
('916a8aec-d1ea-4943-b7af-089da4e1a6fd', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', 'cb9faf76-4b07-443b-a911-7216041f8408', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 64.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.673', '2025-12-01 16:47:18.673', NULL),
('9240069f-0a86-4bbc-b325-1f42f50b67df', '07f726a9-13c2-428a-91a5-dc40670a8b3a', 'afe5ce7b-6efc-47e5-97bc-7feda0911678', '5b36edab-4962-47de-9d27-3d0b379be7dd', 84.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:17.990', '2025-12-01 16:47:17.990', NULL),
('94ff1e54-986f-4168-94c5-52d0bf5c1325', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', 'afe5ce7b-6efc-47e5-97bc-7feda0911678', '5b36edab-4962-47de-9d27-3d0b379be7dd', 84.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.036', '2025-12-01 16:47:18.036', NULL),
('96fade3a-74a3-4c00-bdb9-54c76b96eab4', 'a3493848-185f-46fa-93df-d1f7124fabc1', 'cb9faf76-4b07-443b-a911-7216041f8408', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 93.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.617', '2025-12-01 16:47:18.617', NULL),
('97447a2b-3be8-419c-a905-42489d1d09b0', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', 'a8b34669-aa7f-4588-8349-9685e92d16b7', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 87.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.581', '2025-12-01 16:47:18.581', NULL),
('98e5cb78-0759-4a61-8569-ee0bde8cd1bf', 'dce817fb-29ac-4b9f-a098-54881d30844d', 'afe5ce7b-6efc-47e5-97bc-7feda0911678', '5b36edab-4962-47de-9d27-3d0b379be7dd', 78.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.259', '2025-12-01 16:47:18.259', NULL),
('a3792bd8-03dc-4d77-951f-128a33188a51', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', '01037c9b-f021-4ba3-a97b-5e902e758941', '5b36edab-4962-47de-9d27-3d0b379be7dd', 88.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.033', '2025-12-01 16:47:18.033', NULL),
('a44902a5-5313-4514-93c2-9275a2c25406', 'a3493848-185f-46fa-93df-d1f7124fabc1', 'e71827d9-dd1b-4776-a32e-84bbdc261c87', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 65.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.842', '2025-12-01 16:47:18.842', NULL),
('a4b2ea06-6c30-4035-a041-6f522a6299f5', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', 'afe5ce7b-6efc-47e5-97bc-7feda0911678', '5b36edab-4962-47de-9d27-3d0b379be7dd', 71.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.112', '2025-12-01 16:47:18.112', NULL),
('a74de646-2e60-425d-8d0b-e89fe0f23503', 'a3493848-185f-46fa-93df-d1f7124fabc1', 'ea2a2dd0-e0b7-4b86-8a6a-c71135cccc62', '72c5b829-056e-4359-9f40-33801feed1e0', 79.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.371', '2025-12-01 16:47:18.371', NULL),
('aaeac231-8370-478c-97d3-2926d5df3578', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', 'cb9faf76-4b07-443b-a911-7216041f8408', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 72.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.578', '2025-12-01 16:47:18.578', NULL),
('b05b0f6b-93e0-4e43-ad18-3916bf86e195', 'a3493848-185f-46fa-93df-d1f7124fabc1', 'b08de74d-2a5c-4694-a3fc-803888c13afb', '1936ca45-b910-4787-a2ce-94e25481930f', 82.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.089', '2025-12-01 16:47:19.089', NULL),
('b0e8fec1-9640-40bd-9542-dc716beb8d5d', 'c37f443d-c904-433e-b244-1aa9014d7114', 'cb9faf76-4b07-443b-a911-7216041f8408', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 90.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.714', '2025-12-01 16:47:18.714', NULL),
('b468070c-880f-411e-a634-7b0e5f8dc91a', '56a45ba1-b6d8-4f76-8864-839825a973e2', '1c32e5c7-2c57-45d1-8809-2504b3fc9427', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 90.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.887', '2025-12-01 16:47:18.887', NULL),
('b7f4bd9c-dfac-4c11-90c9-f64d78b666bf', 'a3493848-185f-46fa-93df-d1f7124fabc1', '01037c9b-f021-4ba3-a97b-5e902e758941', '5b36edab-4962-47de-9d27-3d0b379be7dd', 82.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.010', '2025-12-01 16:47:18.010', NULL),
('b84aec4c-b2a0-4354-a16f-5f36c0657cef', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', '2261932e-3bc4-4baa-b7ff-483ad11610b4', '72c5b829-056e-4359-9f40-33801feed1e0', 85.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.441', '2025-12-01 16:47:18.441', NULL),
('b954de84-003d-4daf-9c79-d5e3667b1997', '56a45ba1-b6d8-4f76-8864-839825a973e2', '01037c9b-f021-4ba3-a97b-5e902e758941', '5b36edab-4962-47de-9d27-3d0b379be7dd', 64.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.056', '2025-12-01 16:47:18.056', NULL),
('be6e90ab-6753-498a-af01-3ef6220e906b', 'dce817fb-29ac-4b9f-a098-54881d30844d', '1c32e5c7-2c57-45d1-8809-2504b3fc9427', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 82.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.997', '2025-12-01 16:47:18.997', NULL),
('c6dcbc32-bf23-42a9-8bc4-ffab900cad13', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', 'a8b34669-aa7f-4588-8349-9685e92d16b7', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 65.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.638', '2025-12-01 16:47:18.638', NULL),
('ce523e42-4730-4ebf-ae25-19d802af4080', 'dce817fb-29ac-4b9f-a098-54881d30844d', 'a8b34669-aa7f-4588-8349-9685e92d16b7', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 70.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.756', '2025-12-01 16:47:18.756', NULL),
('d09c8bfb-ee44-453f-9349-004f250f7bac', 'c37f443d-c904-433e-b244-1aa9014d7114', 'e71827d9-dd1b-4776-a32e-84bbdc261c87', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 70.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.957', '2025-12-01 16:47:18.957', NULL),
('d53954d1-1bac-4ddd-ba26-fbf8a3d0a0ec', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', 'a8b34669-aa7f-4588-8349-9685e92d16b7', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 82.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.677', '2025-12-01 16:47:18.677', NULL),
('d6fbf521-2c9a-4481-85a9-5b35fd94d79f', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', 'cb9faf76-4b07-443b-a911-7216041f8408', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 87.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.693', '2025-12-01 16:47:18.693', NULL),
('dc2e2f4d-fdc5-4519-8ae9-287169056e26', '07f726a9-13c2-428a-91a5-dc40670a8b3a', 'cb9faf76-4b07-443b-a911-7216041f8408', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 69.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.598', '2025-12-01 16:47:18.598', NULL),
('dd5fb677-273f-4842-a537-b9ad18741afe', '07f726a9-13c2-428a-91a5-dc40670a8b3a', '2261932e-3bc4-4baa-b7ff-483ad11610b4', '72c5b829-056e-4359-9f40-33801feed1e0', 79.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.352', '2025-12-01 16:47:18.352', NULL),
('e110b0b6-45f1-419d-9771-22b19c8514d7', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', 'cb9faf76-4b07-443b-a911-7216041f8408', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 96.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.635', '2025-12-01 16:47:18.635', NULL),
('e31bd3d3-9a24-4b85-a4cc-abbbb9c7ab11', '56a45ba1-b6d8-4f76-8864-839825a973e2', '8d1d30ef-dd4d-4cd8-90e2-2dff71dd480c', '1936ca45-b910-4787-a2ce-94e25481930f', 63.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.133', '2025-12-01 16:47:19.133', NULL),
('e3f7da2d-a0fa-4e6b-8e55-2362c3cbd4a1', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', 'b08de74d-2a5c-4694-a3fc-803888c13afb', '1936ca45-b910-4787-a2ce-94e25481930f', 66.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.167', '2025-12-01 16:47:19.167', NULL),
('e9a12348-5ebe-4623-8e9a-e79e837c656d', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', '2261932e-3bc4-4baa-b7ff-483ad11610b4', '72c5b829-056e-4359-9f40-33801feed1e0', 67.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.398', '2025-12-01 16:47:18.398', NULL),
('e9ada2a3-8472-41d1-b8ec-845c50471244', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', '1c32e5c7-2c57-45d1-8809-2504b3fc9427', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 96.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.796', '2025-12-01 16:47:18.796', NULL),
('eaf65ca3-884c-4569-89fc-af2e24e8e9a5', 'dce817fb-29ac-4b9f-a098-54881d30844d', 'cb9faf76-4b07-443b-a911-7216041f8408', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 66.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.753', '2025-12-01 16:47:18.753', NULL),
('ecbf22ec-94bb-461f-baa9-a7810afbda3e', 'a3493848-185f-46fa-93df-d1f7124fabc1', '2261932e-3bc4-4baa-b7ff-483ad11610b4', '72c5b829-056e-4359-9f40-33801feed1e0', 85.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.375', '2025-12-01 16:47:18.375', NULL),
('ed8bbe5a-8dc3-4a64-9aeb-c55ff61d6f32', '56a45ba1-b6d8-4f76-8864-839825a973e2', 'afe5ce7b-6efc-47e5-97bc-7feda0911678', '5b36edab-4962-47de-9d27-3d0b379be7dd', 73.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.059', '2025-12-01 16:47:18.059', NULL),
('f0542b14-392a-4c80-8246-b20b35e88ba1', 'c37f443d-c904-433e-b244-1aa9014d7114', 'ea2a2dd0-e0b7-4b86-8a6a-c71135cccc62', '72c5b829-056e-4359-9f40-33801feed1e0', 61.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.481', '2025-12-01 16:47:18.481', NULL),
('f18c7f34-d9d3-4661-af27-9c8046b5d964', '07f726a9-13c2-428a-91a5-dc40670a8b3a', 'b08de74d-2a5c-4694-a3fc-803888c13afb', '1936ca45-b910-4787-a2ce-94e25481930f', 66.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:19.070', '2025-12-01 16:47:19.070', NULL),
('f1e39bda-fa81-413b-a66b-f2ed25ffaa48', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', '1c32e5c7-2c57-45d1-8809-2504b3fc9427', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 79.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.932', '2025-12-01 16:47:18.932', NULL),
('f3e5fb75-a3d5-4786-9619-5ef5d5bddbbf', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', 'a8b34669-aa7f-4588-8349-9685e92d16b7', 'cea3583d-77a9-4a8d-ad70-746b25f15065', 70.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.697', '2025-12-01 16:47:18.697', NULL),
('f64971a7-1cd0-433e-b922-0cbc8425dff2', 'c37f443d-c904-433e-b244-1aa9014d7114', '1c32e5c7-2c57-45d1-8809-2504b3fc9427', 'a04d7243-1d02-492a-8deb-3244d8db0e46', 70.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.953', '2025-12-01 16:47:18.953', NULL),
('fa7c4388-3d85-483d-a58f-875928f44fdc', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', 'ea2a2dd0-e0b7-4b86-8a6a-c71135cccc62', '72c5b829-056e-4359-9f40-33801feed1e0', 80.00, 5, '63da5a92-77f8-43c7-a230-4db67cdbe97e', '2024/2025', NULL, '2025-12-01 16:47:18.438', '2025-12-01 16:47:18.438', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `prodi`
--

CREATE TABLE `prodi` (
  `id` varchar(191) NOT NULL,
  `fakultas_id` varchar(191) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `kode` varchar(191) DEFAULT NULL,
  `jenjang` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `prodi`
--

INSERT INTO `prodi` (`id`, `fakultas_id`, `nama`, `kode`, `jenjang`, `created_at`, `updated_at`) VALUES
('5ba06ab5-a713-474f-8bc3-15beb585ca79', '21a9f7cd-cbda-48ac-89ea-56c4e1972729', 'Matematika', 'MAT', NULL, '2025-12-01 16:47:17.747', '2025-12-01 16:47:17.747'),
('720da698-c2aa-462b-b3db-93ae2a595dc5', 'edf3ed60-efbb-4aab-a201-64f5d71e8f66', 'Pendidikan Guru SD', 'PGSD', NULL, '2025-12-01 16:47:17.739', '2025-12-01 16:47:17.739'),
('7cce7915-2743-434d-9c04-d48268cefef0', 'edf3ed60-efbb-4aab-a201-64f5d71e8f66', 'Bimbingan Konseling', 'BK', NULL, '2025-12-01 16:47:17.736', '2025-12-01 16:47:17.736'),
('a030d74c-45de-4937-ac55-95c0dded211f', '21a9f7cd-cbda-48ac-89ea-56c4e1972729', 'Informatika', 'INF', NULL, '2025-12-01 16:47:17.750', '2025-12-01 16:47:17.750'),
('b47e50a4-2b71-4af3-90b4-87108c328055', '21a9f7cd-cbda-48ac-89ea-56c4e1972729', 'Sistem Informasi', 'SI', NULL, '2025-12-01 16:47:17.753', '2025-12-01 16:47:17.753'),
('df17292a-7498-4c57-a38c-ac7d38b00cdb', '830b1523-915b-4164-9b56-a907c24147a5', 'Teknik Industri', 'TIND', NULL, '2025-12-01 16:47:17.759', '2025-12-01 16:47:17.759');

-- --------------------------------------------------------

--
-- Table structure for table `profiles`
--

CREATE TABLE `profiles` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `nama_lengkap` varchar(191) DEFAULT NULL,
  `nim` varchar(191) DEFAULT NULL,
  `nip` varchar(191) DEFAULT NULL,
  `program_studi` varchar(191) DEFAULT NULL,
  `semester` int(11) DEFAULT NULL,
  `tahun_masuk` int(11) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `no_telepon` varchar(191) DEFAULT NULL,
  `foto_profile` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `nidn` varchar(191) DEFAULT NULL,
  `fakultas_id` varchar(191) DEFAULT NULL,
  `prodi_id` varchar(191) DEFAULT NULL,
  `semester_id` varchar(191) DEFAULT NULL,
  `kelas_id` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `profiles`
--

INSERT INTO `profiles` (`id`, `user_id`, `nama_lengkap`, `nim`, `nip`, `program_studi`, `semester`, `tahun_masuk`, `alamat`, `no_telepon`, `foto_profile`, `created_at`, `updated_at`, `nidn`, `fakultas_id`, `prodi_id`, `semester_id`, `kelas_id`) VALUES
('08e59957-5b2a-4568-bd5e-d41578ba0740', 'a3493848-185f-46fa-93df-d1f7124fabc1', 'Doni Tata', '210003', NULL, NULL, 5, 2021, NULL, NULL, NULL, '2025-12-01 16:47:17.798', '2025-12-01 16:47:17.886', NULL, '21a9f7cd-cbda-48ac-89ea-56c4e1972729', 'a030d74c-45de-4937-ac55-95c0dded211f', '63da5a92-77f8-43c7-a230-4db67cdbe97e', 'eb620e77-1692-4e63-9370-13b93e63d7ee'),
('1d4fb9a6-205b-4f02-959c-3baa6eeca005', 'dce817fb-29ac-4b9f-a098-54881d30844d', 'Kartika Sari', '210010', NULL, NULL, 5, 2021, NULL, NULL, NULL, '2025-12-01 16:47:17.828', '2025-12-01 16:47:17.916', NULL, '21a9f7cd-cbda-48ac-89ea-56c4e1972729', 'a030d74c-45de-4937-ac55-95c0dded211f', '63da5a92-77f8-43c7-a230-4db67cdbe97e', '068d4565-6b83-4651-bd9c-401fccd54424'),
('1e40b0c2-1131-4e66-8bff-08e49ed21603', '07f726a9-13c2-428a-91a5-dc40670a8b3a', 'Rina Wati', '210002', NULL, NULL, 5, 2021, NULL, NULL, NULL, '2025-12-01 16:47:17.794', '2025-12-01 16:47:17.882', NULL, '21a9f7cd-cbda-48ac-89ea-56c4e1972729', 'a030d74c-45de-4937-ac55-95c0dded211f', '63da5a92-77f8-43c7-a230-4db67cdbe97e', 'eb620e77-1692-4e63-9370-13b93e63d7ee'),
('22d27141-01c2-46d8-9bbd-a7ed77af24da', '133d79ea-b30f-4183-94ff-d587c99352e2', 'Rudi Hermawan, Ph.D', NULL, 'DOS003', NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-01 16:47:17.786', '2025-12-01 16:47:17.786', NULL, '21a9f7cd-cbda-48ac-89ea-56c4e1972729', 'a030d74c-45de-4937-ac55-95c0dded211f', NULL, NULL),
('2d7984db-4c88-4869-be40-3462df00b54b', '92a0b9b8-6c70-416e-a9d2-21ab93766e38', 'Hadi Sucipto', '210007', NULL, NULL, 5, 2021, NULL, NULL, NULL, '2025-12-01 16:47:17.816', '2025-12-01 16:47:17.903', NULL, '21a9f7cd-cbda-48ac-89ea-56c4e1972729', 'a030d74c-45de-4937-ac55-95c0dded211f', '63da5a92-77f8-43c7-a230-4db67cdbe97e', '068d4565-6b83-4651-bd9c-401fccd54424'),
('3d7554e4-cd04-49d3-9ff7-edf272c5239a', '6905fdcb-4e17-4183-95ac-7653529c8cab', 'Super Admin', NULL, 'ADM001', NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-01 16:47:17.762', '2025-12-01 16:47:17.762', NULL, NULL, NULL, NULL, NULL),
('55774fd2-cb25-46de-8781-a3d6d9ea4499', '96be31c2-b496-413e-b3f8-7b5dfd584b0e', 'Eka Putri', '210004', NULL, NULL, 5, 2021, NULL, NULL, NULL, '2025-12-01 16:47:17.804', '2025-12-01 16:47:17.891', NULL, '21a9f7cd-cbda-48ac-89ea-56c4e1972729', 'a030d74c-45de-4937-ac55-95c0dded211f', '63da5a92-77f8-43c7-a230-4db67cdbe97e', 'eb620e77-1692-4e63-9370-13b93e63d7ee'),
('86e8a917-3843-4fc4-85fd-1a1f0f896ab5', '0d82d749-e8d8-453a-ab55-4e4a310b94a5', 'Joko Anwar', '210009', NULL, NULL, 5, 2021, NULL, NULL, NULL, '2025-12-01 16:47:17.824', '2025-12-01 16:47:17.912', NULL, '21a9f7cd-cbda-48ac-89ea-56c4e1972729', 'a030d74c-45de-4937-ac55-95c0dded211f', '63da5a92-77f8-43c7-a230-4db67cdbe97e', '068d4565-6b83-4651-bd9c-401fccd54424'),
('91e8c4c3-b7c8-443d-8616-c0108c235313', 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', 'Gita Gutawa', '210006', NULL, NULL, 5, 2021, NULL, NULL, NULL, '2025-12-01 16:47:17.812', '2025-12-01 16:47:17.899', NULL, '21a9f7cd-cbda-48ac-89ea-56c4e1972729', 'a030d74c-45de-4937-ac55-95c0dded211f', '63da5a92-77f8-43c7-a230-4db67cdbe97e', '068d4565-6b83-4651-bd9c-401fccd54424'),
('a067955e-ba67-4ca6-bfb3-ae049cf6c5db', '9ae74e2a-1a03-4e75-a546-ad608df4db5f', 'Ahmad Fajrul', '210001', NULL, NULL, 5, 2021, NULL, NULL, NULL, '2025-12-01 16:47:17.790', '2025-12-01 16:47:17.876', NULL, '21a9f7cd-cbda-48ac-89ea-56c4e1972729', 'a030d74c-45de-4937-ac55-95c0dded211f', '63da5a92-77f8-43c7-a230-4db67cdbe97e', 'eb620e77-1692-4e63-9370-13b93e63d7ee'),
('b41e7a67-b343-498f-9088-d81cb0c87069', '9b0c44d1-79e8-4b63-8b43-632f575df3cd', 'Budi Santoso, M.Kom', NULL, 'DOS001', NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-01 16:47:17.778', '2025-12-01 16:47:17.778', NULL, '21a9f7cd-cbda-48ac-89ea-56c4e1972729', 'a030d74c-45de-4937-ac55-95c0dded211f', NULL, NULL),
('cd823fc2-7774-44bd-913c-657adb90d273', 'c37f443d-c904-433e-b244-1aa9014d7114', 'Indah Permata', '210008', NULL, NULL, 5, 2021, NULL, NULL, NULL, '2025-12-01 16:47:17.820', '2025-12-01 16:47:17.908', NULL, '21a9f7cd-cbda-48ac-89ea-56c4e1972729', 'a030d74c-45de-4937-ac55-95c0dded211f', '63da5a92-77f8-43c7-a230-4db67cdbe97e', '068d4565-6b83-4651-bd9c-401fccd54424'),
('f6b9523d-01c5-4f5d-8faf-a975d456863b', '9197693b-0488-4735-96d4-3fcbe6915879', 'Dr. Kaprodi Informatika', NULL, 'KAP001', NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-01 16:47:17.767', '2025-12-01 16:47:17.767', NULL, '21a9f7cd-cbda-48ac-89ea-56c4e1972729', 'a030d74c-45de-4937-ac55-95c0dded211f', NULL, NULL),
('f6cd4ba5-64ef-409d-af96-adcced27d56a', '56a45ba1-b6d8-4f76-8864-839825a973e2', 'Fajar Nugraha', '210005', NULL, NULL, 5, 2021, NULL, NULL, NULL, '2025-12-01 16:47:17.808', '2025-12-01 16:47:17.895', NULL, '21a9f7cd-cbda-48ac-89ea-56c4e1972729', 'a030d74c-45de-4937-ac55-95c0dded211f', '63da5a92-77f8-43c7-a230-4db67cdbe97e', 'eb620e77-1692-4e63-9370-13b93e63d7ee'),
('fc971611-95c1-496b-b13c-c5c5c6ba87f6', 'ed42925d-924d-4517-b779-6dbf76cf923f', 'Siti Aminah, M.T', NULL, 'DOS002', NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-01 16:47:17.782', '2025-12-01 16:47:17.782', NULL, '21a9f7cd-cbda-48ac-89ea-56c4e1972729', 'a030d74c-45de-4937-ac55-95c0dded211f', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rubrik`
--

CREATE TABLE `rubrik` (
  `id` varchar(191) NOT NULL,
  `cpmk_id` varchar(191) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rubrik`
--

INSERT INTO `rubrik` (`id`, `cpmk_id`, `deskripsi`, `is_active`, `created_at`, `updated_at`) VALUES
('63c82e5c-9518-4454-b286-ef29da0d5cc1', '0914010f-46ad-46ca-8276-6b76a6a60eb4', 'Ada', 1, '2025-12-01 16:57:00.557', '2025-12-01 16:57:00.557'),
('f857fa1e-7cde-4365-af87-20360cd7ee9f', '0cd7ad12-bbc9-4d29-b69f-570c2c6bb2f4', 'Rubrik Proyek Web', 1, '2025-12-01 16:47:17.953', '2025-12-01 16:47:17.953');

-- --------------------------------------------------------

--
-- Table structure for table `rubrik_kriteria`
--

CREATE TABLE `rubrik_kriteria` (
  `id` varchar(191) NOT NULL,
  `rubrik_id` varchar(191) NOT NULL,
  `deskripsi` text NOT NULL,
  `bobot` decimal(5,2) NOT NULL DEFAULT 1.00,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rubrik_kriteria`
--

INSERT INTO `rubrik_kriteria` (`id`, `rubrik_id`, `deskripsi`, `bobot`, `created_at`, `updated_at`) VALUES
('09c5d266-0899-4675-aac4-eb0873cbf2d7', '63c82e5c-9518-4454-b286-ef29da0d5cc1', 'Kriteria 1', 100.00, '2025-12-01 16:57:00.570', '2025-12-01 16:57:00.570'),
('61136a62-e190-41e7-9ad2-38169bc9ed9b', 'f857fa1e-7cde-4365-af87-20360cd7ee9f', 'UI/UX', 50.00, '2025-12-01 16:47:17.953', '2025-12-01 16:47:17.953'),
('d9dd9c43-693f-48a6-a6cf-394b2dfd3f0d', 'f857fa1e-7cde-4365-af87-20360cd7ee9f', 'Fungsionalitas', 50.00, '2025-12-01 16:47:17.953', '2025-12-01 16:47:17.953');

-- --------------------------------------------------------

--
-- Table structure for table `rubrik_level`
--

CREATE TABLE `rubrik_level` (
  `id` varchar(191) NOT NULL,
  `kriteria_id` varchar(191) NOT NULL,
  `deskripsi` text NOT NULL,
  `nilai` decimal(5,2) NOT NULL,
  `label` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rubrik_level`
--

INSERT INTO `rubrik_level` (`id`, `kriteria_id`, `deskripsi`, `nilai`, `label`, `created_at`, `updated_at`) VALUES
('05e66700-6218-4503-8e95-ed1cdc6626f5', 'd9dd9c43-693f-48a6-a6cf-394b2dfd3f0d', 'Semua fitur jalan', 100.00, 'Sangat Baik', '2025-12-01 16:47:17.953', '2025-12-01 16:47:17.953'),
('14223b2e-f5ae-458b-a60a-8d51f5e602c7', '61136a62-e190-41e7-9ad2-38169bc9ed9b', 'Desain menarik & responsif', 100.00, 'Sangat Baik', '2025-12-01 16:47:17.953', '2025-12-01 16:47:17.953'),
('577d5de8-238c-49d5-9b61-33276147262d', '61136a62-e190-41e7-9ad2-38169bc9ed9b', 'Desain standar', 75.00, 'Baik', '2025-12-01 16:47:17.953', '2025-12-01 16:47:17.953'),
('86a62808-acd2-4303-b38d-1ba4dd25c853', '09c5d266-0899-4675-aac4-eb0873cbf2d7', 'Cukup', 60.00, 'Cukup', '2025-12-01 16:57:00.573', '2025-12-01 16:57:00.573'),
('ae3e26f2-dee1-4227-afd6-6876c83ac8b5', '09c5d266-0899-4675-aac4-eb0873cbf2d7', 'Baik', 80.00, 'Baik', '2025-12-01 16:57:00.573', '2025-12-01 16:57:00.573'),
('dfaa246b-91cc-408d-b418-1981201033c6', '09c5d266-0899-4675-aac4-eb0873cbf2d7', 'Sangat Baik', 100.00, 'Sangat Baik', '2025-12-01 16:57:00.573', '2025-12-01 16:57:00.573'),
('f21c98f1-b4d5-494d-a054-02722851f79b', 'd9dd9c43-693f-48a6-a6cf-394b2dfd3f0d', 'Sebagian fitur jalan', 70.00, 'Cukup', '2025-12-01 16:47:17.953', '2025-12-01 16:47:17.953');

-- --------------------------------------------------------

--
-- Table structure for table `semester`
--

CREATE TABLE `semester` (
  `id` varchar(191) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `angka` int(11) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `semester`
--

INSERT INTO `semester` (`id`, `nama`, `angka`, `is_active`, `created_at`, `updated_at`) VALUES
('006bfeb2-2c1d-41a2-8d2d-0cc14b30cdeb', 'Semester 1', 1, 1, '2025-12-01 16:47:17.687', '2025-12-01 16:47:17.687'),
('63da5a92-77f8-43c7-a230-4db67cdbe97e', 'Semester 5', 5, 1, '2025-12-01 16:47:17.687', '2025-12-01 16:47:17.687'),
('67b9b0a3-199b-44b5-9de3-d1b60cb8d674', 'Semester 6', 6, 1, '2025-12-01 16:47:17.687', '2025-12-01 16:47:17.687'),
('6c30166b-7448-4469-be2e-0f77721ca871', 'Semester 8', 8, 1, '2025-12-01 16:47:17.687', '2025-12-01 16:47:17.687'),
('80a9d380-46c8-43a6-8952-243b7f1a44e5', 'Semester 3', 3, 1, '2025-12-01 16:47:17.687', '2025-12-01 16:47:17.687'),
('98e5505a-a7aa-4d2a-a5d8-10d9d6144b2e', 'Semester 4', 4, 1, '2025-12-01 16:47:17.687', '2025-12-01 16:47:17.687'),
('9fd7a78b-0c97-46e7-ba5f-62dda5a0d162', 'Semester 7', 7, 1, '2025-12-01 16:47:17.687', '2025-12-01 16:47:17.687'),
('f78bb418-8719-4d2d-92c1-dae5e2513b9a', 'Semester 2', 2, 1, '2025-12-01 16:47:17.687', '2025-12-01 16:47:17.687');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `ip_address` varchar(191) DEFAULT NULL,
  `user_agent` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `token`, `expires_at`, `created_at`, `ip_address`, `user_agent`) VALUES
('cf52c5d0-f514-4965-932a-bf1a3f708325', '9b0c44d1-79e8-4b63-8b43-632f575df3cd', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5YjBjNDRkMS03OWU4LTRiNjMtOGI0My02MzJmNTc1ZGYzY2QiLCJlbWFpbCI6ImRvc2VuMUB1bml2LmFjLmlkIiwicm9sZSI6ImRvc2VuIiwiaWF0IjoxNzY0NjA4MTc0LCJleHAiOj', '2025-12-08 16:56:14.186', '2025-12-01 16:56:14.188', NULL, NULL),
('e62fddaa-5f44-4e35-9f64-38dec07dffe1', '6905fdcb-4e17-4183-95ac-7653529c8cab', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTA1ZmRjYi00ZTE3LTQxODMtOTVhYy03NjUzNTI5YzhjYWIiLCJlbWFpbCI6ImFkbWluQHVuaXYuYWMuaWQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjQ2MDgxMDYsImV4cCI6MT', '2025-12-08 16:55:06.312', '2025-12-01 16:55:06.313', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` text NOT NULL,
  `description` text DEFAULT NULL,
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `key`, `value`, `description`, `updated_at`) VALUES
('9f5ee53a-085d-48d1-ae81-f7a49826df5b', 'app_name', 'Sistem OBE', 'Nama Aplikasi', '2025-12-01 16:47:17.729');

-- --------------------------------------------------------

--
-- Table structure for table `tahun_ajaran`
--

CREATE TABLE `tahun_ajaran` (
  `id` varchar(191) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tahun_ajaran`
--

INSERT INTO `tahun_ajaran` (`id`, `nama`, `is_active`, `created_at`, `updated_at`) VALUES
('82dcabd1-340d-49a6-980b-c381dcfaa8af', '2024/2025', 1, '2025-12-01 16:47:17.681', '2025-12-01 16:47:17.681'),
('91b0afb5-49c7-4bd5-841b-95726bdf008f', '2023/2024', 0, '2025-12-01 16:47:17.681', '2025-12-01 16:47:17.681');

-- --------------------------------------------------------

--
-- Table structure for table `teknik_penilaian`
--

CREATE TABLE `teknik_penilaian` (
  `id` varchar(191) NOT NULL,
  `cpmk_id` varchar(191) NOT NULL,
  `nama_teknik` varchar(191) NOT NULL,
  `bobot_persentase` decimal(5,2) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `teknik_ref_id` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teknik_penilaian`
--

INSERT INTO `teknik_penilaian` (`id`, `cpmk_id`, `nama_teknik`, `bobot_persentase`, `deskripsi`, `created_at`, `updated_at`, `teknik_ref_id`) VALUES
('01037c9b-f021-4ba3-a97b-5e902e758941', '0914010f-46ad-46ca-8276-6b76a6a60eb4', 'UTS', 50.00, NULL, '2025-12-01 16:47:17.945', '2025-12-01 16:47:17.945', '1646f891-b2f7-401e-96b8-eb7fb0d797c2'),
('1c32e5c7-2c57-45d1-8809-2504b3fc9427', 'beb1f9a5-4beb-41fa-a9d4-67e684045396', 'UTS', 50.00, NULL, '2025-12-01 16:47:18.790', '2025-12-01 16:47:18.790', '1646f891-b2f7-401e-96b8-eb7fb0d797c2'),
('2261932e-3bc4-4baa-b7ff-483ad11610b4', 'b2b18a57-1ef1-4473-882f-e1c7ffb19e60', 'Proyek Akhir', 50.00, NULL, '2025-12-01 16:47:18.319', '2025-12-01 16:47:18.319', '04b34852-4abb-442b-866e-9c670a60bad2'),
('8d1d30ef-dd4d-4cd8-90e2-2dff71dd480c', 'c93c4535-8abc-480d-b11d-0e511a01ac7f', 'Proyek Akhir', 50.00, NULL, '2025-12-01 16:47:19.047', '2025-12-01 16:47:19.047', '04b34852-4abb-442b-866e-9c670a60bad2'),
('a8b34669-aa7f-4588-8349-9685e92d16b7', 'eed272d9-74c3-4e34-9057-ee06f9473c04', 'Proyek Akhir', 50.00, NULL, '2025-12-01 16:47:18.574', '2025-12-01 16:47:18.574', '04b34852-4abb-442b-866e-9c670a60bad2'),
('afe5ce7b-6efc-47e5-97bc-7feda0911678', '0cd7ad12-bbc9-4d29-b69f-570c2c6bb2f4', 'Proyek Akhir', 50.00, NULL, '2025-12-01 16:47:17.949', '2025-12-01 16:47:17.949', '04b34852-4abb-442b-866e-9c670a60bad2'),
('b08de74d-2a5c-4694-a3fc-803888c13afb', '389a4bd3-f046-4550-a6bb-7e7781187fb9', 'UTS', 50.00, NULL, '2025-12-01 16:47:19.043', '2025-12-01 16:47:19.043', '1646f891-b2f7-401e-96b8-eb7fb0d797c2'),
('cb9faf76-4b07-443b-a911-7216041f8408', '9db0f830-6309-4c83-a066-15507da1fbe5', 'UTS', 50.00, NULL, '2025-12-01 16:47:18.572', '2025-12-01 16:47:18.572', '1646f891-b2f7-401e-96b8-eb7fb0d797c2'),
('e71827d9-dd1b-4776-a32e-84bbdc261c87', 'd5fa648d-8d70-464b-880b-a3cd45d10272', 'Proyek Akhir', 50.00, NULL, '2025-12-01 16:47:18.793', '2025-12-01 16:47:18.793', '04b34852-4abb-442b-866e-9c670a60bad2'),
('ea2a2dd0-e0b7-4b86-8a6a-c71135cccc62', '8d555a09-097a-41e8-89f6-2bc37913b119', 'UTS', 50.00, NULL, '2025-12-01 16:47:18.315', '2025-12-01 16:47:18.315', '1646f891-b2f7-401e-96b8-eb7fb0d797c2');

-- --------------------------------------------------------

--
-- Table structure for table `teknik_penilaian_ref`
--

CREATE TABLE `teknik_penilaian_ref` (
  `id` varchar(191) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teknik_penilaian_ref`
--

INSERT INTO `teknik_penilaian_ref` (`id`, `nama`, `deskripsi`, `created_at`, `updated_at`) VALUES
('04b34852-4abb-442b-866e-9c670a60bad2', 'Proyek', 'Proyek besar', '2025-12-01 16:47:17.723', '2025-12-01 16:47:17.723'),
('1646f891-b2f7-401e-96b8-eb7fb0d797c2', 'Tugas', 'Tugas individu atau kelompok', '2025-12-01 16:47:17.723', '2025-12-01 16:47:17.723'),
('64d74e84-87ff-4081-8a04-57a682b21be6', 'Praktikum', 'Kegiatan praktikum', '2025-12-01 16:47:17.723', '2025-12-01 16:47:17.723'),
('705c0933-abe2-4ff4-96b8-cbcd4c5179ae', 'UAS', 'Ujian Akhir Semester', '2025-12-01 16:47:17.723', '2025-12-01 16:47:17.723'),
('977ae89d-5092-4616-a269-336c4e970c50', 'Kuis', 'Kuis singkat', '2025-12-01 16:47:17.723', '2025-12-01 16:47:17.723'),
('e3dbf4ed-06f1-4586-9036-26d11d2c5f1c', 'UTS', 'Ujian Tengah Semester', '2025-12-01 16:47:17.723', '2025-12-01 16:47:17.723');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(191) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `last_login` datetime(3) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `email_verified` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `created_at`, `updated_at`, `last_login`, `is_active`, `email_verified`) VALUES
('07f726a9-13c2-428a-91a5-dc40670a8b3a', '210002@mhs.univ.ac.id', '$2a$10$prpKtJMgPpAyDz3eEkPxMOWmWUbGDBaAInXi6UV53R3ZPIj4yjut6', '2025-12-01 16:47:17.794', '2025-12-01 16:47:17.794', NULL, 1, 1),
('0d82d749-e8d8-453a-ab55-4e4a310b94a5', '210009@mhs.univ.ac.id', '$2a$10$prpKtJMgPpAyDz3eEkPxMOWmWUbGDBaAInXi6UV53R3ZPIj4yjut6', '2025-12-01 16:47:17.824', '2025-12-01 16:47:17.824', NULL, 1, 1),
('133d79ea-b30f-4183-94ff-d587c99352e2', 'dosen3@univ.ac.id', '$2a$10$prpKtJMgPpAyDz3eEkPxMOWmWUbGDBaAInXi6UV53R3ZPIj4yjut6', '2025-12-01 16:47:17.786', '2025-12-01 16:47:17.786', NULL, 1, 1),
('56a45ba1-b6d8-4f76-8864-839825a973e2', '210005@mhs.univ.ac.id', '$2a$10$prpKtJMgPpAyDz3eEkPxMOWmWUbGDBaAInXi6UV53R3ZPIj4yjut6', '2025-12-01 16:47:17.808', '2025-12-01 16:47:17.808', NULL, 1, 1),
('6905fdcb-4e17-4183-95ac-7653529c8cab', 'admin@univ.ac.id', '$2a$10$prpKtJMgPpAyDz3eEkPxMOWmWUbGDBaAInXi6UV53R3ZPIj4yjut6', '2025-12-01 16:47:17.762', '2025-12-01 16:47:17.762', NULL, 1, 1),
('9197693b-0488-4735-96d4-3fcbe6915879', 'kaprodi.inf@univ.ac.id', '$2a$10$prpKtJMgPpAyDz3eEkPxMOWmWUbGDBaAInXi6UV53R3ZPIj4yjut6', '2025-12-01 16:47:17.767', '2025-12-01 16:47:17.767', NULL, 1, 1),
('92a0b9b8-6c70-416e-a9d2-21ab93766e38', '210007@mhs.univ.ac.id', '$2a$10$prpKtJMgPpAyDz3eEkPxMOWmWUbGDBaAInXi6UV53R3ZPIj4yjut6', '2025-12-01 16:47:17.816', '2025-12-01 16:47:17.816', NULL, 1, 1),
('96be31c2-b496-413e-b3f8-7b5dfd584b0e', '210004@mhs.univ.ac.id', '$2a$10$prpKtJMgPpAyDz3eEkPxMOWmWUbGDBaAInXi6UV53R3ZPIj4yjut6', '2025-12-01 16:47:17.804', '2025-12-01 16:47:17.804', NULL, 1, 1),
('9ae74e2a-1a03-4e75-a546-ad608df4db5f', '210001@mhs.univ.ac.id', '$2a$10$prpKtJMgPpAyDz3eEkPxMOWmWUbGDBaAInXi6UV53R3ZPIj4yjut6', '2025-12-01 16:47:17.790', '2025-12-01 16:47:17.790', NULL, 1, 1),
('9b0c44d1-79e8-4b63-8b43-632f575df3cd', 'dosen1@univ.ac.id', '$2a$10$prpKtJMgPpAyDz3eEkPxMOWmWUbGDBaAInXi6UV53R3ZPIj4yjut6', '2025-12-01 16:47:17.778', '2025-12-01 16:47:17.778', NULL, 1, 1),
('a3493848-185f-46fa-93df-d1f7124fabc1', '210003@mhs.univ.ac.id', '$2a$10$prpKtJMgPpAyDz3eEkPxMOWmWUbGDBaAInXi6UV53R3ZPIj4yjut6', '2025-12-01 16:47:17.798', '2025-12-01 16:47:17.798', NULL, 1, 1),
('b8dabe0c-dd26-4958-9f15-1bfedb71f5df', '210006@mhs.univ.ac.id', '$2a$10$prpKtJMgPpAyDz3eEkPxMOWmWUbGDBaAInXi6UV53R3ZPIj4yjut6', '2025-12-01 16:47:17.812', '2025-12-01 16:47:17.812', NULL, 1, 1),
('c37f443d-c904-433e-b244-1aa9014d7114', '210008@mhs.univ.ac.id', '$2a$10$prpKtJMgPpAyDz3eEkPxMOWmWUbGDBaAInXi6UV53R3ZPIj4yjut6', '2025-12-01 16:47:17.820', '2025-12-01 16:47:17.820', NULL, 1, 1),
('dce817fb-29ac-4b9f-a098-54881d30844d', '210010@mhs.univ.ac.id', '$2a$10$prpKtJMgPpAyDz3eEkPxMOWmWUbGDBaAInXi6UV53R3ZPIj4yjut6', '2025-12-01 16:47:17.828', '2025-12-01 16:47:17.828', NULL, 1, 1),
('ed42925d-924d-4517-b779-6dbf76cf923f', 'dosen2@univ.ac.id', '$2a$10$prpKtJMgPpAyDz3eEkPxMOWmWUbGDBaAInXi6UV53R3ZPIj4yjut6', '2025-12-01 16:47:17.782', '2025-12-01 16:47:17.782', NULL, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `id` int(11) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `role` enum('admin','dosen','mahasiswa','kaprodi','dekan') NOT NULL DEFAULT 'mahasiswa',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`id`, `user_id`, `role`, `created_at`, `updated_at`) VALUES
(43, '6905fdcb-4e17-4183-95ac-7653529c8cab', 'admin', '2025-12-01 16:47:17.762', '2025-12-01 16:47:17.762'),
(44, '9197693b-0488-4735-96d4-3fcbe6915879', 'kaprodi', '2025-12-01 16:47:17.767', '2025-12-01 16:47:17.767'),
(45, '9b0c44d1-79e8-4b63-8b43-632f575df3cd', 'dosen', '2025-12-01 16:47:17.778', '2025-12-01 16:47:17.778'),
(46, 'ed42925d-924d-4517-b779-6dbf76cf923f', 'dosen', '2025-12-01 16:47:17.782', '2025-12-01 16:47:17.782'),
(47, '133d79ea-b30f-4183-94ff-d587c99352e2', 'dosen', '2025-12-01 16:47:17.786', '2025-12-01 16:47:17.786'),
(48, '9ae74e2a-1a03-4e75-a546-ad608df4db5f', 'mahasiswa', '2025-12-01 16:47:17.790', '2025-12-01 16:47:17.790'),
(49, '07f726a9-13c2-428a-91a5-dc40670a8b3a', 'mahasiswa', '2025-12-01 16:47:17.794', '2025-12-01 16:47:17.794'),
(50, 'a3493848-185f-46fa-93df-d1f7124fabc1', 'mahasiswa', '2025-12-01 16:47:17.798', '2025-12-01 16:47:17.798'),
(51, '96be31c2-b496-413e-b3f8-7b5dfd584b0e', 'mahasiswa', '2025-12-01 16:47:17.804', '2025-12-01 16:47:17.804'),
(52, '56a45ba1-b6d8-4f76-8864-839825a973e2', 'mahasiswa', '2025-12-01 16:47:17.808', '2025-12-01 16:47:17.808'),
(53, 'b8dabe0c-dd26-4958-9f15-1bfedb71f5df', 'mahasiswa', '2025-12-01 16:47:17.812', '2025-12-01 16:47:17.812'),
(54, '92a0b9b8-6c70-416e-a9d2-21ab93766e38', 'mahasiswa', '2025-12-01 16:47:17.816', '2025-12-01 16:47:17.816'),
(55, 'c37f443d-c904-433e-b244-1aa9014d7114', 'mahasiswa', '2025-12-01 16:47:17.820', '2025-12-01 16:47:17.820'),
(56, '0d82d749-e8d8-453a-ab55-4e4a310b94a5', 'mahasiswa', '2025-12-01 16:47:17.824', '2025-12-01 16:47:17.824'),
(57, 'dce817fb-29ac-4b9f-a098-54881d30844d', 'mahasiswa', '2025-12-01 16:47:17.828', '2025-12-01 16:47:17.828');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_user_id_idx` (`user_id`),
  ADD KEY `audit_logs_action_idx` (`action`),
  ADD KEY `audit_logs_table_name_idx` (`table_name`),
  ADD KEY `audit_logs_created_at_idx` (`created_at`);

--
-- Indexes for table `cpl`
--
ALTER TABLE `cpl`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cpl_kode_cpl_key` (`kode_cpl`),
  ADD KEY `cpl_kode_cpl_idx` (`kode_cpl`),
  ADD KEY `cpl_kategori_idx` (`kategori`),
  ADD KEY `cpl_kategori_id_idx` (`kategori_id`),
  ADD KEY `cpl_prodi_id_idx` (`prodi_id`),
  ADD KEY `cpl_is_active_idx` (`is_active`),
  ADD KEY `cpl_created_by_fkey` (`created_by`);

--
-- Indexes for table `cpl_mata_kuliah`
--
ALTER TABLE `cpl_mata_kuliah`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cpl_mata_kuliah_cpl_id_mata_kuliah_id_key` (`cpl_id`,`mata_kuliah_id`),
  ADD KEY `cpl_mata_kuliah_cpl_id_idx` (`cpl_id`),
  ADD KEY `cpl_mata_kuliah_mata_kuliah_id_idx` (`mata_kuliah_id`);

--
-- Indexes for table `cpmk`
--
ALTER TABLE `cpmk`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cpmk_mata_kuliah_id_idx` (`mata_kuliah_id`),
  ADD KEY `cpmk_kode_cpmk_idx` (`kode_cpmk`),
  ADD KEY `cpmk_status_validasi_idx` (`status_validasi`),
  ADD KEY `cpmk_level_taksonomi_id_idx` (`level_taksonomi_id`),
  ADD KEY `cpmk_is_active_idx` (`is_active`),
  ADD KEY `cpmk_created_by_fkey` (`created_by`);

--
-- Indexes for table `cpmk_cpl_mapping`
--
ALTER TABLE `cpmk_cpl_mapping`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cpmk_cpl_mapping_cpmk_id_cpl_id_key` (`cpmk_id`,`cpl_id`),
  ADD KEY `cpmk_cpl_mapping_cpmk_id_idx` (`cpmk_id`),
  ADD KEY `cpmk_cpl_mapping_cpl_id_idx` (`cpl_id`);

--
-- Indexes for table `evaluasi_mata_kuliah`
--
ALTER TABLE `evaluasi_mata_kuliah`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `evaluasi_mata_kuliah_mata_kuliah_id_dosen_id_semester_tahun__key` (`mata_kuliah_id`,`dosen_id`,`semester`,`tahun_ajaran`),
  ADD KEY `evaluasi_mata_kuliah_mata_kuliah_id_idx` (`mata_kuliah_id`),
  ADD KEY `evaluasi_mata_kuliah_dosen_id_idx` (`dosen_id`);

--
-- Indexes for table `fakultas`
--
ALTER TABLE `fakultas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `fakultas_nama_key` (`nama`),
  ADD UNIQUE KEY `fakultas_kode_key` (`kode`);

--
-- Indexes for table `jenis_mata_kuliah`
--
ALTER TABLE `jenis_mata_kuliah`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `jenis_mata_kuliah_nama_key` (`nama`);

--
-- Indexes for table `kaprodi_data`
--
ALTER TABLE `kaprodi_data`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kaprodi_data_program_studi_key` (`program_studi`),
  ADD UNIQUE KEY `kaprodi_data_prodi_id_key` (`prodi_id`),
  ADD KEY `kaprodi_data_program_studi_idx` (`program_studi`),
  ADD KEY `kaprodi_data_prodi_id_idx` (`prodi_id`);

--
-- Indexes for table `kategori_cpl`
--
ALTER TABLE `kategori_cpl`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kategori_cpl_nama_key` (`nama`);

--
-- Indexes for table `kelas`
--
ALTER TABLE `kelas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kelas_nama_key` (`nama`);

--
-- Indexes for table `kurikulum`
--
ALTER TABLE `kurikulum`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kurikulum_nama_key` (`nama`);

--
-- Indexes for table `level_taksonomi`
--
ALTER TABLE `level_taksonomi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `level_taksonomi_kode_key` (`kode`);

--
-- Indexes for table `mata_kuliah`
--
ALTER TABLE `mata_kuliah`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mata_kuliah_kode_mk_key` (`kode_mk`),
  ADD KEY `mata_kuliah_kode_mk_idx` (`kode_mk`),
  ADD KEY `mata_kuliah_semester_idx` (`semester`),
  ADD KEY `mata_kuliah_semester_id_idx` (`semester_id`),
  ADD KEY `mata_kuliah_program_studi_idx` (`program_studi`),
  ADD KEY `mata_kuliah_prodi_id_idx` (`prodi_id`),
  ADD KEY `mata_kuliah_kurikulum_id_idx` (`kurikulum_id`),
  ADD KEY `mata_kuliah_is_active_idx` (`is_active`),
  ADD KEY `mata_kuliah_created_by_fkey` (`created_by`),
  ADD KEY `mata_kuliah_jenis_mk_id_fkey` (`jenis_mk_id`);

--
-- Indexes for table `mata_kuliah_pengampu`
--
ALTER TABLE `mata_kuliah_pengampu`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mata_kuliah_pengampu_mata_kuliah_id_dosen_id_kelas_id_key` (`mata_kuliah_id`,`dosen_id`,`kelas_id`),
  ADD KEY `mata_kuliah_pengampu_mata_kuliah_id_idx` (`mata_kuliah_id`),
  ADD KEY `mata_kuliah_pengampu_dosen_id_idx` (`dosen_id`),
  ADD KEY `mata_kuliah_pengampu_kelas_id_idx` (`kelas_id`);

--
-- Indexes for table `nilai_cpl`
--
ALTER TABLE `nilai_cpl`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nilai_cpl_mahasiswa_id_cpl_id_mata_kuliah_id_semester_tahun__key` (`mahasiswa_id`,`cpl_id`,`mata_kuliah_id`,`semester`,`tahun_ajaran`),
  ADD KEY `nilai_cpl_mahasiswa_id_idx` (`mahasiswa_id`),
  ADD KEY `nilai_cpl_cpl_id_idx` (`cpl_id`),
  ADD KEY `nilai_cpl_mata_kuliah_id_idx` (`mata_kuliah_id`),
  ADD KEY `nilai_cpl_semester_idx` (`semester`),
  ADD KEY `nilai_cpl_semester_id_idx` (`semester_id`),
  ADD KEY `nilai_cpl_tahun_ajaran_idx` (`tahun_ajaran`),
  ADD KEY `nilai_cpl_created_by_fkey` (`created_by`);

--
-- Indexes for table `nilai_cpmk`
--
ALTER TABLE `nilai_cpmk`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nilai_cpmk_mahasiswa_id_cpmk_id_semester_tahun_ajaran_key` (`mahasiswa_id`,`cpmk_id`,`semester`,`tahun_ajaran`),
  ADD KEY `nilai_cpmk_mahasiswa_id_idx` (`mahasiswa_id`),
  ADD KEY `nilai_cpmk_cpmk_id_idx` (`cpmk_id`),
  ADD KEY `nilai_cpmk_mata_kuliah_id_idx` (`mata_kuliah_id`),
  ADD KEY `nilai_cpmk_semester_idx` (`semester`),
  ADD KEY `nilai_cpmk_semester_id_idx` (`semester_id`),
  ADD KEY `nilai_cpmk_tahun_ajaran_idx` (`tahun_ajaran`);

--
-- Indexes for table `nilai_rubrik`
--
ALTER TABLE `nilai_rubrik`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nilai_rubrik_nilai_teknik_id_rubrik_level_id_key` (`nilai_teknik_id`,`rubrik_level_id`),
  ADD KEY `nilai_rubrik_nilai_teknik_id_idx` (`nilai_teknik_id`),
  ADD KEY `nilai_rubrik_rubrik_level_id_idx` (`rubrik_level_id`);

--
-- Indexes for table `nilai_teknik_penilaian`
--
ALTER TABLE `nilai_teknik_penilaian`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nilai_teknik_penilaian_mahasiswa_id_teknik_penilaian_id_seme_key` (`mahasiswa_id`,`teknik_penilaian_id`,`semester`,`tahun_ajaran`),
  ADD KEY `nilai_teknik_penilaian_mahasiswa_id_idx` (`mahasiswa_id`),
  ADD KEY `nilai_teknik_penilaian_teknik_penilaian_id_idx` (`teknik_penilaian_id`),
  ADD KEY `nilai_teknik_penilaian_mata_kuliah_id_idx` (`mata_kuliah_id`),
  ADD KEY `nilai_teknik_penilaian_semester_idx` (`semester`),
  ADD KEY `nilai_teknik_penilaian_semester_id_idx` (`semester_id`),
  ADD KEY `nilai_teknik_penilaian_tahun_ajaran_idx` (`tahun_ajaran`),
  ADD KEY `nilai_teknik_penilaian_created_by_fkey` (`created_by`);

--
-- Indexes for table `prodi`
--
ALTER TABLE `prodi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `prodi_nama_key` (`nama`),
  ADD KEY `prodi_fakultas_id_idx` (`fakultas_id`);

--
-- Indexes for table `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `profiles_user_id_key` (`user_id`),
  ADD UNIQUE KEY `profiles_nim_key` (`nim`),
  ADD UNIQUE KEY `profiles_nip_key` (`nip`),
  ADD UNIQUE KEY `profiles_nidn_key` (`nidn`),
  ADD KEY `profiles_nim_idx` (`nim`),
  ADD KEY `profiles_nip_idx` (`nip`),
  ADD KEY `profiles_nidn_idx` (`nidn`),
  ADD KEY `profiles_program_studi_idx` (`program_studi`),
  ADD KEY `profiles_prodi_id_idx` (`prodi_id`),
  ADD KEY `profiles_fakultas_id_idx` (`fakultas_id`),
  ADD KEY `profiles_semester_idx` (`semester`),
  ADD KEY `profiles_semester_id_idx` (`semester_id`),
  ADD KEY `profiles_kelas_id_idx` (`kelas_id`);

--
-- Indexes for table `rubrik`
--
ALTER TABLE `rubrik`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rubrik_cpmk_id_key` (`cpmk_id`),
  ADD KEY `rubrik_cpmk_id_idx` (`cpmk_id`);

--
-- Indexes for table `rubrik_kriteria`
--
ALTER TABLE `rubrik_kriteria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rubrik_kriteria_rubrik_id_idx` (`rubrik_id`);

--
-- Indexes for table `rubrik_level`
--
ALTER TABLE `rubrik_level`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rubrik_level_kriteria_id_idx` (`kriteria_id`);

--
-- Indexes for table `semester`
--
ALTER TABLE `semester`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `semester_nama_key` (`nama`),
  ADD UNIQUE KEY `semester_angka_key` (`angka`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sessions_token_key` (`token`),
  ADD KEY `sessions_user_id_idx` (`user_id`),
  ADD KEY `sessions_token_idx` (`token`),
  ADD KEY `sessions_expires_at_idx` (`expires_at`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `settings_key_key` (`key`);

--
-- Indexes for table `tahun_ajaran`
--
ALTER TABLE `tahun_ajaran`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tahun_ajaran_nama_key` (`nama`);

--
-- Indexes for table `teknik_penilaian`
--
ALTER TABLE `teknik_penilaian`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teknik_penilaian_cpmk_id_idx` (`cpmk_id`),
  ADD KEY `teknik_penilaian_teknik_ref_id_idx` (`teknik_ref_id`);

--
-- Indexes for table `teknik_penilaian_ref`
--
ALTER TABLE `teknik_penilaian_ref`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `teknik_penilaian_ref_nama_key` (`nama`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD KEY `users_email_idx` (`email`),
  ADD KEY `users_is_active_idx` (`is_active`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_roles_user_id_key` (`user_id`),
  ADD KEY `user_roles_role_idx` (`role`),
  ADD KEY `user_roles_user_id_idx` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `cpl`
--
ALTER TABLE `cpl`
  ADD CONSTRAINT `cpl_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `cpl_kategori_id_fkey` FOREIGN KEY (`kategori_id`) REFERENCES `kategori_cpl` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `cpl_prodi_id_fkey` FOREIGN KEY (`prodi_id`) REFERENCES `prodi` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `cpl_mata_kuliah`
--
ALTER TABLE `cpl_mata_kuliah`
  ADD CONSTRAINT `cpl_mata_kuliah_cpl_id_fkey` FOREIGN KEY (`cpl_id`) REFERENCES `cpl` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cpl_mata_kuliah_mata_kuliah_id_fkey` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `cpmk`
--
ALTER TABLE `cpmk`
  ADD CONSTRAINT `cpmk_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `cpmk_level_taksonomi_id_fkey` FOREIGN KEY (`level_taksonomi_id`) REFERENCES `level_taksonomi` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `cpmk_mata_kuliah_id_fkey` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `cpmk_cpl_mapping`
--
ALTER TABLE `cpmk_cpl_mapping`
  ADD CONSTRAINT `cpmk_cpl_mapping_cpl_id_fkey` FOREIGN KEY (`cpl_id`) REFERENCES `cpl` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cpmk_cpl_mapping_cpmk_id_fkey` FOREIGN KEY (`cpmk_id`) REFERENCES `cpmk` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `evaluasi_mata_kuliah`
--
ALTER TABLE `evaluasi_mata_kuliah`
  ADD CONSTRAINT `evaluasi_mata_kuliah_dosen_id_fkey` FOREIGN KEY (`dosen_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `evaluasi_mata_kuliah_mata_kuliah_id_fkey` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `kaprodi_data`
--
ALTER TABLE `kaprodi_data`
  ADD CONSTRAINT `kaprodi_data_prodi_id_fkey` FOREIGN KEY (`prodi_id`) REFERENCES `prodi` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `mata_kuliah`
--
ALTER TABLE `mata_kuliah`
  ADD CONSTRAINT `mata_kuliah_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `mata_kuliah_jenis_mk_id_fkey` FOREIGN KEY (`jenis_mk_id`) REFERENCES `jenis_mata_kuliah` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `mata_kuliah_kurikulum_id_fkey` FOREIGN KEY (`kurikulum_id`) REFERENCES `kurikulum` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `mata_kuliah_prodi_id_fkey` FOREIGN KEY (`prodi_id`) REFERENCES `prodi` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `mata_kuliah_semester_id_fkey` FOREIGN KEY (`semester_id`) REFERENCES `semester` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `mata_kuliah_pengampu`
--
ALTER TABLE `mata_kuliah_pengampu`
  ADD CONSTRAINT `mata_kuliah_pengampu_dosen_id_fkey` FOREIGN KEY (`dosen_id`) REFERENCES `profiles` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `mata_kuliah_pengampu_kelas_id_fkey` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `mata_kuliah_pengampu_mata_kuliah_id_fkey` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `nilai_cpl`
--
ALTER TABLE `nilai_cpl`
  ADD CONSTRAINT `nilai_cpl_cpl_id_fkey` FOREIGN KEY (`cpl_id`) REFERENCES `cpl` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_cpl_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_cpl_mahasiswa_id_fkey` FOREIGN KEY (`mahasiswa_id`) REFERENCES `profiles` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_cpl_mata_kuliah_id_fkey` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_cpl_semester_id_fkey` FOREIGN KEY (`semester_id`) REFERENCES `semester` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `nilai_cpmk`
--
ALTER TABLE `nilai_cpmk`
  ADD CONSTRAINT `nilai_cpmk_cpmk_id_fkey` FOREIGN KEY (`cpmk_id`) REFERENCES `cpmk` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_cpmk_mahasiswa_id_fkey` FOREIGN KEY (`mahasiswa_id`) REFERENCES `profiles` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_cpmk_mata_kuliah_id_fkey` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_cpmk_semester_id_fkey` FOREIGN KEY (`semester_id`) REFERENCES `semester` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `nilai_rubrik`
--
ALTER TABLE `nilai_rubrik`
  ADD CONSTRAINT `nilai_rubrik_nilai_teknik_id_fkey` FOREIGN KEY (`nilai_teknik_id`) REFERENCES `nilai_teknik_penilaian` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_rubrik_rubrik_level_id_fkey` FOREIGN KEY (`rubrik_level_id`) REFERENCES `rubrik_level` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `nilai_teknik_penilaian`
--
ALTER TABLE `nilai_teknik_penilaian`
  ADD CONSTRAINT `nilai_teknik_penilaian_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_teknik_penilaian_mahasiswa_id_fkey` FOREIGN KEY (`mahasiswa_id`) REFERENCES `profiles` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_teknik_penilaian_mata_kuliah_id_fkey` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_teknik_penilaian_semester_id_fkey` FOREIGN KEY (`semester_id`) REFERENCES `semester` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_teknik_penilaian_teknik_penilaian_id_fkey` FOREIGN KEY (`teknik_penilaian_id`) REFERENCES `teknik_penilaian` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `prodi`
--
ALTER TABLE `prodi`
  ADD CONSTRAINT `prodi_fakultas_id_fkey` FOREIGN KEY (`fakultas_id`) REFERENCES `fakultas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `profiles`
--
ALTER TABLE `profiles`
  ADD CONSTRAINT `profiles_fakultas_id_fkey` FOREIGN KEY (`fakultas_id`) REFERENCES `fakultas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `profiles_kelas_id_fkey` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `profiles_prodi_id_fkey` FOREIGN KEY (`prodi_id`) REFERENCES `prodi` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `profiles_semester_id_fkey` FOREIGN KEY (`semester_id`) REFERENCES `semester` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `rubrik`
--
ALTER TABLE `rubrik`
  ADD CONSTRAINT `rubrik_cpmk_id_fkey` FOREIGN KEY (`cpmk_id`) REFERENCES `cpmk` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `rubrik_kriteria`
--
ALTER TABLE `rubrik_kriteria`
  ADD CONSTRAINT `rubrik_kriteria_rubrik_id_fkey` FOREIGN KEY (`rubrik_id`) REFERENCES `rubrik` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `rubrik_level`
--
ALTER TABLE `rubrik_level`
  ADD CONSTRAINT `rubrik_level_kriteria_id_fkey` FOREIGN KEY (`kriteria_id`) REFERENCES `rubrik_kriteria` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `teknik_penilaian`
--
ALTER TABLE `teknik_penilaian`
  ADD CONSTRAINT `teknik_penilaian_cpmk_id_fkey` FOREIGN KEY (`cpmk_id`) REFERENCES `cpmk` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `teknik_penilaian_teknik_ref_id_fkey` FOREIGN KEY (`teknik_ref_id`) REFERENCES `teknik_penilaian_ref` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
