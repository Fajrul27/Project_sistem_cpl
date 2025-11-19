-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 18 Nov 2025 pada 13.01
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

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
-- Struktur dari tabel `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) NOT NULL,
  `user_id` varchar(191) DEFAULT NULL,
  `action` varchar(191) NOT NULL,
  `table_name` varchar(191) NOT NULL,
  `record_id` varchar(191) DEFAULT NULL,
  `old_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_data`)),
  `new_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_data`)),
  `ip_address` varchar(191) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `cpl`
--

CREATE TABLE `cpl` (
  `id` varchar(191) NOT NULL,
  `kode_cpl` varchar(191) NOT NULL,
  `deskripsi` text NOT NULL,
  `kategori` varchar(191) DEFAULT NULL,
  `bobot` decimal(3,2) NOT NULL DEFAULT 1.00,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `created_by` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `cpl`
--

INSERT INTO `cpl` (`id`, `kode_cpl`, `deskripsi`, `kategori`, `bobot`, `is_active`, `created_at`, `updated_at`, `created_by`) VALUES
('2696be85-fd5b-40fe-974d-bb9dd68058af', 'CPL-02', 'Menguasai konsep teoretis dan prinsip rekayasa perangkat lunak', 'Pengetahuan', 1.00, 1, '2025-11-17 06:10:15.359', '2025-11-17 06:10:15.359', '4a564afd-4bdc-4555-8355-c22487b3cf8b'),
('3b073dae-4d88-41d1-adc8-6b5b969df96d', 'CPL-03', 'Mampu merancang dan mengimplementasikan sistem informasi', 'Keterampilan Umum', 1.00, 1, '2025-11-17 06:10:15.366', '2025-11-17 06:10:15.366', '4a564afd-4bdc-4555-8355-c22487b3cf8b'),
('49ca9e32-55c8-4f21-8950-2911d1c04b78', 'CPL-01', 'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan atau implementasi ilmu pengetahuan dan teknologi', 'Sikap', 1.00, 1, '2025-11-17 06:10:15.348', '2025-11-17 06:10:15.348', '4a564afd-4bdc-4555-8355-c22487b3cf8b'),
('728ddd78-cb0f-4360-9d8a-7d49737b704c', 'CPL-05', 'Mampu mengidentifikasi, menganalisis, dan merumuskan solusi permasalahan', 'Keterampilan Umum', 1.00, 1, '2025-11-17 06:10:15.379', '2025-11-17 06:10:15.379', '4a564afd-4bdc-4555-8355-c22487b3cf8b'),
('bdd9ebab-d5cc-45d6-a42e-cae7483b8d90', 'CPL-04', 'Mampu bekerja sama dalam tim multidisiplin', 'Keterampilan Khusus', 1.00, 1, '2025-11-17 06:10:15.373', '2025-11-17 06:10:15.373', '4a564afd-4bdc-4555-8355-c22487b3cf8b');

-- --------------------------------------------------------

--
-- Struktur dari tabel `cpl_mata_kuliah`
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
-- Dumping data untuk tabel `cpl_mata_kuliah`
--

INSERT INTO `cpl_mata_kuliah` (`id`, `cpl_id`, `mata_kuliah_id`, `bobot_kontribusi`, `created_at`, `updated_at`) VALUES
('1aba2115-f3a0-4a6b-85b4-ccea9aaab257', 'bdd9ebab-d5cc-45d6-a42e-cae7483b8d90', 'c6a8b377-0838-403f-98f1-62a74ffebfec', 1.00, '2025-11-17 06:10:15.437', '2025-11-17 06:10:15.437'),
('1ccde193-5ce1-4d5b-8e4c-120d8d339040', '3b073dae-4d88-41d1-adc8-6b5b969df96d', 'a8bd0391-18b6-4800-849f-ef143c8556bd', 1.00, '2025-11-17 06:10:15.437', '2025-11-17 06:10:15.437'),
('26373576-dd45-47be-85e6-d29a61783523', '2696be85-fd5b-40fe-974d-bb9dd68058af', '0edea0ab-b66e-4ef0-b826-62fed46bd700', 1.00, '2025-11-17 06:10:15.437', '2025-11-17 06:10:15.437'),
('2e9d4295-52f3-4593-aa74-b186e7a44020', '3b073dae-4d88-41d1-adc8-6b5b969df96d', 'dc148f80-b9d1-4cdd-8bf3-3720e68c7568', 1.00, '2025-11-17 06:10:15.437', '2025-11-17 06:10:15.437'),
('42f50a1f-d554-48d6-830d-5e018664fe1a', '49ca9e32-55c8-4f21-8950-2911d1c04b78', 'e1a55392-40c7-4b5a-964a-8e330010a1e4', 1.00, '2025-11-18 08:08:22.472', '2025-11-18 08:08:22.472'),
('51bc89f8-5e98-414e-bf55-90d09e6933c1', '2696be85-fd5b-40fe-974d-bb9dd68058af', 'c6a8b377-0838-403f-98f1-62a74ffebfec', 1.50, '2025-11-17 06:10:15.437', '2025-11-17 06:10:15.437'),
('647d4db7-186c-4ff7-bfce-66a4e0f55ad9', 'bdd9ebab-d5cc-45d6-a42e-cae7483b8d90', 'dc148f80-b9d1-4cdd-8bf3-3720e68c7568', 1.00, '2025-11-17 06:10:15.437', '2025-11-17 06:10:15.437'),
('722b0f86-568c-4daf-8bb8-48ebf6eb7fbb', '2696be85-fd5b-40fe-974d-bb9dd68058af', 'a8bd0391-18b6-4800-849f-ef143c8556bd', 1.00, '2025-11-17 06:10:15.437', '2025-11-17 06:10:15.437'),
('728c51ce-3327-429d-800b-3e4807393b4f', '3b073dae-4d88-41d1-adc8-6b5b969df96d', 'e1a55392-40c7-4b5a-964a-8e330010a1e4', 1.00, '2025-11-18 08:08:22.472', '2025-11-18 08:08:22.472'),
('92634066-73dc-49f4-88e1-d78a5420d49b', '3b073dae-4d88-41d1-adc8-6b5b969df96d', '188c3fb5-e235-4dd3-a53b-47d2c1635d11', 1.00, '2025-11-17 06:10:15.437', '2025-11-17 06:10:15.437'),
('a021cfcd-7db8-4709-8c5f-aabafc98a90a', '49ca9e32-55c8-4f21-8950-2911d1c04b78', '09fa11da-455c-4b8f-b015-7d7c87fc06c9', 1.00, '2025-11-18 08:08:16.085', '2025-11-18 08:08:16.085'),
('aa9790df-4d92-407a-85a1-8b97393806eb', '2696be85-fd5b-40fe-974d-bb9dd68058af', '09fa11da-455c-4b8f-b015-7d7c87fc06c9', 1.00, '2025-11-18 08:08:16.085', '2025-11-18 08:08:16.085'),
('d2258cf1-203b-46b9-b2ab-b353d4eb160e', '2696be85-fd5b-40fe-974d-bb9dd68058af', '188c3fb5-e235-4dd3-a53b-47d2c1635d11', 1.00, '2025-11-17 06:10:15.437', '2025-11-17 06:10:15.437'),
('d9ca7856-0dd4-4044-96e6-24135e0ede07', '728ddd78-cb0f-4360-9d8a-7d49737b704c', 'c6a8b377-0838-403f-98f1-62a74ffebfec', 1.00, '2025-11-17 06:10:15.437', '2025-11-17 06:10:15.437'),
('da19b642-38f1-4226-b19c-25ba40aad1a9', '3b073dae-4d88-41d1-adc8-6b5b969df96d', 'c6a8b377-0838-403f-98f1-62a74ffebfec', 1.50, '2025-11-17 06:10:15.437', '2025-11-17 06:10:15.437'),
('deee226b-c0d8-47cd-82e3-a68a9f23762e', '728ddd78-cb0f-4360-9d8a-7d49737b704c', '0edea0ab-b66e-4ef0-b826-62fed46bd700', 1.50, '2025-11-17 06:10:15.437', '2025-11-17 06:10:15.437'),
('ed4a2bf4-80b2-4660-98ce-7c389fdf8910', 'bdd9ebab-d5cc-45d6-a42e-cae7483b8d90', '188c3fb5-e235-4dd3-a53b-47d2c1635d11', 1.00, '2025-11-17 06:10:15.437', '2025-11-17 06:10:15.437');

-- --------------------------------------------------------

--
-- Struktur dari tabel `mata_kuliah`
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
  `created_by` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `mata_kuliah`
--

INSERT INTO `mata_kuliah` (`id`, `kode_mk`, `nama_mk`, `sks`, `semester`, `deskripsi`, `is_active`, `created_at`, `updated_at`, `created_by`) VALUES
('09fa11da-455c-4b8f-b015-7d7c87fc06c9', 'IF-101', 'Pemrograman Dasar', 3, 1, NULL, 1, '2025-11-17 06:10:15.386', '2025-11-17 06:10:15.386', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('0edea0ab-b66e-4ef0-b826-62fed46bd700', 'IF-401', 'Machine Learning', 3, 7, NULL, 1, '2025-11-17 06:10:15.429', '2025-11-17 06:10:15.429', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('188c3fb5-e235-4dd3-a53b-47d2c1635d11', 'IF-202', 'Pemrograman Web', 3, 4, NULL, 1, '2025-11-17 06:10:15.410', '2025-11-17 06:10:15.410', '335a92a7-fb87-4f0d-80cb-4b47ebab7861'),
('a8bd0391-18b6-4800-849f-ef143c8556bd', 'IF-201', 'Basis Data', 3, 3, NULL, 1, '2025-11-17 06:10:15.403', '2025-11-17 06:10:15.403', '335a92a7-fb87-4f0d-80cb-4b47ebab7861'),
('c6a8b377-0838-403f-98f1-62a74ffebfec', 'IF-301', 'Rekayasa Perangkat Lunak', 3, 5, NULL, 1, '2025-11-17 06:10:15.416', '2025-11-17 06:10:15.416', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('dc148f80-b9d1-4cdd-8bf3-3720e68c7568', 'IF-302', 'Sistem Informasi', 3, 5, NULL, 1, '2025-11-17 06:10:15.423', '2025-11-17 06:10:15.423', '335a92a7-fb87-4f0d-80cb-4b47ebab7861'),
('e1a55392-40c7-4b5a-964a-8e330010a1e4', 'IF-102', 'Algoritma dan Struktur Data', 3, 2, NULL, 1, '2025-11-17 06:10:15.398', '2025-11-17 06:10:15.398', 'a40d4e79-303b-48c6-a714-c518d95249d4');

-- --------------------------------------------------------

--
-- Struktur dari tabel `nilai_cpl`
--

CREATE TABLE `nilai_cpl` (
  `id` varchar(191) NOT NULL,
  `mahasiswa_id` varchar(191) NOT NULL,
  `cpl_id` varchar(191) NOT NULL,
  `mata_kuliah_id` varchar(191) NOT NULL,
  `nilai` decimal(5,2) NOT NULL,
  `semester` int(11) NOT NULL,
  `tahun_ajaran` varchar(191) NOT NULL,
  `catatan` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `created_by` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `nilai_cpl`
--

INSERT INTO `nilai_cpl` (`id`, `mahasiswa_id`, `cpl_id`, `mata_kuliah_id`, `nilai`, `semester`, `tahun_ajaran`, `catatan`, `created_at`, `updated_at`, `created_by`) VALUES
('03b44db7-6d3a-497a-8c96-30c6965b3ac4', '800fed0f-2949-4a2e-8381-7cd458713f0d', '3b073dae-4d88-41d1-adc8-6b5b969df96d', '09fa11da-455c-4b8f-b015-7d7c87fc06c9', 90.00, 1, '2021/2022', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('040f205d-12b6-4440-8b74-3aef5235bbbe', '01541ea6-a67e-47b5-a747-3c46a6143585', '2696be85-fd5b-40fe-974d-bb9dd68058af', '188c3fb5-e235-4dd3-a53b-47d2c1635d11', 85.00, 4, '2022/2023', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', '335a92a7-fb87-4f0d-80cb-4b47ebab7861'),
('0e879368-6109-4ea8-9411-638723ec1b08', '01541ea6-a67e-47b5-a747-3c46a6143585', '2696be85-fd5b-40fe-974d-bb9dd68058af', 'c6a8b377-0838-403f-98f1-62a74ffebfec', 92.00, 5, '2023/2024', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('15ab98b5-ca18-4916-a58a-c1d5a852e269', 'ccae5e8e-87dd-44b9-94f5-67ff4189485e', '3b073dae-4d88-41d1-adc8-6b5b969df96d', 'a8bd0391-18b6-4800-849f-ef143c8556bd', 83.00, 3, '2022/2023', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', '335a92a7-fb87-4f0d-80cb-4b47ebab7861'),
('17ac055e-c6e8-41ab-b51a-a997e43ecca0', 'ccae5e8e-87dd-44b9-94f5-67ff4189485e', 'bdd9ebab-d5cc-45d6-a42e-cae7483b8d90', '188c3fb5-e235-4dd3-a53b-47d2c1635d11', 85.00, 4, '2022/2023', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', '335a92a7-fb87-4f0d-80cb-4b47ebab7861'),
('1a72a1ca-535a-4618-810a-3120114d80e2', 'ccae5e8e-87dd-44b9-94f5-67ff4189485e', 'bdd9ebab-d5cc-45d6-a42e-cae7483b8d90', 'c6a8b377-0838-403f-98f1-62a74ffebfec', 83.00, 5, '2023/2024', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('1fa53b56-4350-42fa-ab87-a36fd976dfa1', '800fed0f-2949-4a2e-8381-7cd458713f0d', 'bdd9ebab-d5cc-45d6-a42e-cae7483b8d90', 'c6a8b377-0838-403f-98f1-62a74ffebfec', 93.00, 5, '2023/2024', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('20999244-d8dd-4d81-af0f-d45a48f33e24', '800fed0f-2949-4a2e-8381-7cd458713f0d', '728ddd78-cb0f-4360-9d8a-7d49737b704c', 'e1a55392-40c7-4b5a-964a-8e330010a1e4', 94.00, 2, '2021/2022', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('20d95b18-d184-4e48-b60e-bee1ff38240f', '800fed0f-2949-4a2e-8381-7cd458713f0d', '2696be85-fd5b-40fe-974d-bb9dd68058af', '188c3fb5-e235-4dd3-a53b-47d2c1635d11', 92.00, 4, '2022/2023', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', '335a92a7-fb87-4f0d-80cb-4b47ebab7861'),
('27befb52-a007-44e5-8c05-366eb89d2bed', 'ccae5e8e-87dd-44b9-94f5-67ff4189485e', '2696be85-fd5b-40fe-974d-bb9dd68058af', 'c6a8b377-0838-403f-98f1-62a74ffebfec', 87.00, 5, '2023/2024', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('2cfad794-6bcc-48c1-9af7-b8faf668a99a', 'ccae5e8e-87dd-44b9-94f5-67ff4189485e', '49ca9e32-55c8-4f21-8950-2911d1c04b78', 'e1a55392-40c7-4b5a-964a-8e330010a1e4', 82.00, 2, '2021/2022', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('2ec2b529-edb1-4a5b-b8f1-34c513c103ea', '01541ea6-a67e-47b5-a747-3c46a6143585', '728ddd78-cb0f-4360-9d8a-7d49737b704c', 'c6a8b377-0838-403f-98f1-62a74ffebfec', 89.00, 5, '2023/2024', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('35fd029f-5ec8-431d-85f5-cdfaf8e5ec90', '800fed0f-2949-4a2e-8381-7cd458713f0d', '49ca9e32-55c8-4f21-8950-2911d1c04b78', '09fa11da-455c-4b8f-b015-7d7c87fc06c9', 92.00, 1, '2021/2022', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('40b82019-fab6-4d8b-b87d-810b7fe34d40', '800fed0f-2949-4a2e-8381-7cd458713f0d', 'bdd9ebab-d5cc-45d6-a42e-cae7483b8d90', '188c3fb5-e235-4dd3-a53b-47d2c1635d11', 95.00, 4, '2022/2023', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', '335a92a7-fb87-4f0d-80cb-4b47ebab7861'),
('410e210a-6ce1-4b0b-9bfb-c294ca6c58ea', 'ccae5e8e-87dd-44b9-94f5-67ff4189485e', '2696be85-fd5b-40fe-974d-bb9dd68058af', 'e1a55392-40c7-4b5a-964a-8e330010a1e4', 79.00, 2, '2021/2022', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('4288fa8e-f470-4f99-bcf4-4e5f6f263798', 'ccae5e8e-87dd-44b9-94f5-67ff4189485e', '3b073dae-4d88-41d1-adc8-6b5b969df96d', '09fa11da-455c-4b8f-b015-7d7c87fc06c9', 80.00, 1, '2021/2022', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('436a069f-a55a-4e3a-b870-a5cbd6884997', '01541ea6-a67e-47b5-a747-3c46a6143585', '49ca9e32-55c8-4f21-8950-2911d1c04b78', 'e1a55392-40c7-4b5a-964a-8e330010a1e4', 88.00, 2, '2021/2022', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('46ff1085-80f3-4e67-85e5-7b680298d735', '01541ea6-a67e-47b5-a747-3c46a6143585', 'bdd9ebab-d5cc-45d6-a42e-cae7483b8d90', 'c6a8b377-0838-403f-98f1-62a74ffebfec', 88.00, 5, '2023/2024', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('52efc2d2-cab1-45e1-b4a8-a60a00441984', '800fed0f-2949-4a2e-8381-7cd458713f0d', '3b073dae-4d88-41d1-adc8-6b5b969df96d', '188c3fb5-e235-4dd3-a53b-47d2c1635d11', 93.00, 4, '2022/2023', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', '335a92a7-fb87-4f0d-80cb-4b47ebab7861'),
('52f5420d-7a33-46e8-ba55-b26197f72d17', 'ccae5e8e-87dd-44b9-94f5-67ff4189485e', '49ca9e32-55c8-4f21-8950-2911d1c04b78', '09fa11da-455c-4b8f-b015-7d7c87fc06c9', 78.00, 1, '2021/2022', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('5c32cfe6-0286-47c6-9c33-e9b40b13ad01', '01541ea6-a67e-47b5-a747-3c46a6143585', '3b073dae-4d88-41d1-adc8-6b5b969df96d', 'c6a8b377-0838-403f-98f1-62a74ffebfec', 90.00, 5, '2023/2024', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('675fa5f4-936f-4c23-8e3d-e0dcb4ccbf1c', '800fed0f-2949-4a2e-8381-7cd458713f0d', '49ca9e32-55c8-4f21-8950-2911d1c04b78', 'e1a55392-40c7-4b5a-964a-8e330010a1e4', 95.00, 2, '2021/2022', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('68ea49f8-7317-4947-bef5-39c9e4c59217', '01541ea6-a67e-47b5-a747-3c46a6143585', '3b073dae-4d88-41d1-adc8-6b5b969df96d', '188c3fb5-e235-4dd3-a53b-47d2c1635d11', 87.00, 4, '2022/2023', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', '335a92a7-fb87-4f0d-80cb-4b47ebab7861'),
('6cc4854b-c354-40fe-967e-3ff06c23ef28', '800fed0f-2949-4a2e-8381-7cd458713f0d', '2696be85-fd5b-40fe-974d-bb9dd68058af', 'a8bd0391-18b6-4800-849f-ef143c8556bd', 96.00, 3, '2022/2023', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', '335a92a7-fb87-4f0d-80cb-4b47ebab7861'),
('713bbc27-e9ff-4acd-932d-a85b86384f2a', '01541ea6-a67e-47b5-a747-3c46a6143585', '2696be85-fd5b-40fe-974d-bb9dd68058af', 'e1a55392-40c7-4b5a-964a-8e330010a1e4', 85.00, 2, '2021/2022', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('7d11a725-cc2e-45ac-8db4-d1213e20a90c', '800fed0f-2949-4a2e-8381-7cd458713f0d', '3b073dae-4d88-41d1-adc8-6b5b969df96d', 'a8bd0391-18b6-4800-849f-ef143c8556bd', 94.00, 3, '2022/2023', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', '335a92a7-fb87-4f0d-80cb-4b47ebab7861'),
('7deadfee-821b-411e-be00-98a9cd1674c8', '01541ea6-a67e-47b5-a747-3c46a6143585', '728ddd78-cb0f-4360-9d8a-7d49737b704c', 'e1a55392-40c7-4b5a-964a-8e330010a1e4', 87.00, 2, '2021/2022', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('82e2cd04-909f-4217-b86e-c590a6a98590', '800fed0f-2949-4a2e-8381-7cd458713f0d', '728ddd78-cb0f-4360-9d8a-7d49737b704c', 'c6a8b377-0838-403f-98f1-62a74ffebfec', 94.00, 5, '2023/2024', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('85458929-1f56-4382-8682-3daf9f54eab3', '01541ea6-a67e-47b5-a747-3c46a6143585', '49ca9e32-55c8-4f21-8950-2911d1c04b78', '09fa11da-455c-4b8f-b015-7d7c87fc06c9', 85.00, 1, '2021/2022', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('89d2420b-5c4c-4e6c-8a61-638536f0d791', '01541ea6-a67e-47b5-a747-3c46a6143585', '3b073dae-4d88-41d1-adc8-6b5b969df96d', 'a8bd0391-18b6-4800-849f-ef143c8556bd', 88.00, 3, '2022/2023', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', '335a92a7-fb87-4f0d-80cb-4b47ebab7861'),
('8bbeb3ea-39ba-4012-a858-8b9e8cde70e2', '800fed0f-2949-4a2e-8381-7cd458713f0d', '2696be85-fd5b-40fe-974d-bb9dd68058af', 'c6a8b377-0838-403f-98f1-62a74ffebfec', 97.00, 5, '2023/2024', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('a523dacb-0fd8-48a5-88eb-e2e241d8a98a', 'ccae5e8e-87dd-44b9-94f5-67ff4189485e', '2696be85-fd5b-40fe-974d-bb9dd68058af', 'a8bd0391-18b6-4800-849f-ef143c8556bd', 85.00, 3, '2022/2023', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', '335a92a7-fb87-4f0d-80cb-4b47ebab7861'),
('a57fc0a1-2eab-4d22-b58a-770e3e025b57', 'ccae5e8e-87dd-44b9-94f5-67ff4189485e', '3b073dae-4d88-41d1-adc8-6b5b969df96d', '188c3fb5-e235-4dd3-a53b-47d2c1635d11', 82.00, 4, '2022/2023', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', '335a92a7-fb87-4f0d-80cb-4b47ebab7861'),
('a62d67ee-ca82-4da3-b237-6dcedddc862f', '800fed0f-2949-4a2e-8381-7cd458713f0d', '2696be85-fd5b-40fe-974d-bb9dd68058af', 'e1a55392-40c7-4b5a-964a-8e330010a1e4', 93.00, 2, '2021/2022', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('ad3745c2-f07c-4bee-8bed-59ccccb05ef6', '01541ea6-a67e-47b5-a747-3c46a6143585', '2696be85-fd5b-40fe-974d-bb9dd68058af', 'a8bd0391-18b6-4800-849f-ef143c8556bd', 90.00, 3, '2022/2023', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', '335a92a7-fb87-4f0d-80cb-4b47ebab7861'),
('aeebb022-d634-4d34-8157-836cfd608baf', '800fed0f-2949-4a2e-8381-7cd458713f0d', '3b073dae-4d88-41d1-adc8-6b5b969df96d', 'c6a8b377-0838-403f-98f1-62a74ffebfec', 95.00, 5, '2023/2024', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('bddc2629-e6ab-4d62-b32f-bd8560572d01', '01541ea6-a67e-47b5-a747-3c46a6143585', '3b073dae-4d88-41d1-adc8-6b5b969df96d', '09fa11da-455c-4b8f-b015-7d7c87fc06c9', 82.00, 1, '2021/2022', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('d6321da2-1c33-409e-abfe-b2e2f26e6b6c', 'ccae5e8e-87dd-44b9-94f5-67ff4189485e', '728ddd78-cb0f-4360-9d8a-7d49737b704c', 'c6a8b377-0838-403f-98f1-62a74ffebfec', 84.00, 5, '2023/2024', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('dea8a702-2b2b-44ba-a3fb-299b0076336d', 'ccae5e8e-87dd-44b9-94f5-67ff4189485e', '728ddd78-cb0f-4360-9d8a-7d49737b704c', 'e1a55392-40c7-4b5a-964a-8e330010a1e4', 81.00, 2, '2021/2022', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('ed4b8e7f-e5d5-4e6c-9c1b-5ec42e040c8b', 'ccae5e8e-87dd-44b9-94f5-67ff4189485e', '2696be85-fd5b-40fe-974d-bb9dd68058af', '188c3fb5-e235-4dd3-a53b-47d2c1635d11', 80.00, 4, '2022/2023', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', '335a92a7-fb87-4f0d-80cb-4b47ebab7861'),
('f53475e7-a09b-4c55-bc7a-4d038a609803', 'ccae5e8e-87dd-44b9-94f5-67ff4189485e', '3b073dae-4d88-41d1-adc8-6b5b969df96d', 'c6a8b377-0838-403f-98f1-62a74ffebfec', 85.00, 5, '2023/2024', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', 'a40d4e79-303b-48c6-a714-c518d95249d4'),
('fa1eee4e-c4cc-4a97-b93d-2e82b2a1c31c', '01541ea6-a67e-47b5-a747-3c46a6143585', 'bdd9ebab-d5cc-45d6-a42e-cae7483b8d90', '188c3fb5-e235-4dd3-a53b-47d2c1635d11', 90.00, 4, '2022/2023', NULL, '2025-11-17 06:10:15.453', '2025-11-17 06:10:15.453', '335a92a7-fb87-4f0d-80cb-4b47ebab7861');

-- --------------------------------------------------------

--
-- Struktur dari tabel `profiles`
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
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `profiles`
--

INSERT INTO `profiles` (`id`, `user_id`, `nama_lengkap`, `nim`, `nip`, `program_studi`, `semester`, `tahun_masuk`, `alamat`, `no_telepon`, `foto_profile`, `created_at`, `updated_at`) VALUES
('2adcbb10-9b61-47cc-8bf5-f9d3dd785eb6', '4a564afd-4bdc-4555-8355-c22487b3cf8b', 'Administrator System', NULL, '198800000001', NULL, NULL, NULL, 'Jl. Administrasi No. 1, Jakarta', '081234567890', NULL, '2025-11-17 06:10:15.257', '2025-11-17 06:10:15.257'),
('45842c2b-efed-4375-a1f8-7da92897e213', 'a40d4e79-303b-48c6-a714-c518d95249d4', 'Dr. Budi Santoso, M.Kom', NULL, '198801010001', 'Teknik Informatika', NULL, NULL, NULL, NULL, NULL, '2025-11-17 06:10:15.287', '2025-11-17 06:10:15.287'),
('9ee9e62b-a04f-4e0f-9d59-3a7317377598', '01541ea6-a67e-47b5-a747-3c46a6143585', 'Ahmad Rizki Wijaya', '2101010001', NULL, 'Teknik Informatika', 5, 2021, NULL, NULL, NULL, '2025-11-17 06:10:15.321', '2025-11-17 06:10:15.321'),
('b3c59b7d-2227-4e15-95d0-1a9294efbb39', '800fed0f-2949-4a2e-8381-7cd458713f0d', 'Budi Hartono', '2101010003', NULL, 'Teknik Informatika', 5, 2021, NULL, NULL, NULL, '2025-11-17 06:10:15.335', '2025-11-17 06:10:15.335'),
('ce2e6eb3-e3fa-4663-a731-83f8226d2980', '335a92a7-fb87-4f0d-80cb-4b47ebab7861', 'Dr. Siti Aisyah, M.T', NULL, '198802020002', 'Teknik Informatika', NULL, NULL, NULL, NULL, NULL, '2025-11-17 06:10:15.312', '2025-11-17 06:10:15.312'),
('d72b167e-9743-4b51-82ba-965c20e893ba', 'c5fd206f-ad0d-47d2-a232-ad7e16118cb2', 'Fajrul tok', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-18 08:01:39.018', '2025-11-18 08:01:39.018'),
('e58b47ee-fa2a-4cc6-a42a-aa2134695639', 'ccae5e8e-87dd-44b9-94f5-67ff4189485e', 'Siti Nurhaliza', '2101010002', NULL, 'Teknik Informatika', 5, 2021, NULL, NULL, NULL, '2025-11-17 06:10:15.328', '2025-11-17 06:10:15.328');

-- --------------------------------------------------------

--
-- Struktur dari tabel `sessions`
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
-- Dumping data untuk tabel `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `token`, `expires_at`, `created_at`, `ip_address`, `user_agent`) VALUES
('8411d0ee-b2b5-4338-ba5b-3c80eb3a4c33', '01541ea6-a67e-47b5-a747-3c46a6143585', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMTU0MWVhNi1hNjdlLTQ3YjUtYTc0Ny0zYzQ2YTYxNDM1ODUiLCJlbWFpbCI6Im1haGFzaXN3YTFAc2lzdGVtLWNwbC5hYy5pZCIsInJvbGUiOiJtYWhhc2lzd2EiLCJpYXQiOjE3Nj', '2025-11-24 06:10:45.214', '2025-11-17 06:10:45.216', NULL, NULL),
('86de8d37-b2f8-4c29-a5fb-2198b336d9d9', '4a564afd-4bdc-4555-8355-c22487b3cf8b', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YTU2NGFmZC00YmRjLTQ1NTUtODM1NS1jMjI0ODdiM2NmOGIiLCJlbWFpbCI6ImFkbWluQHNpc3RlbS1jcGwuYWMuaWQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjM0MzQ0MDMsIm', '2025-11-25 02:53:23.780', '2025-11-18 02:53:23.781', NULL, NULL),
('9d25aed5-2390-40f8-8fab-400d97cb0959', '4a564afd-4bdc-4555-8355-c22487b3cf8b', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YTU2NGFmZC00YmRjLTQ1NTUtODM1NS1jMjI0ODdiM2NmOGIiLCJlbWFpbCI6ImFkbWluQHNpc3RlbS1jcGwuYWMuaWQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjMzNTk4NzksIm', '2025-11-24 06:11:19.933', '2025-11-17 06:11:19.935', NULL, NULL),
('b73e0aad-0df2-4554-a3fd-bdb41cb4a607', 'c5fd206f-ad0d-47d2-a232-ad7e16118cb2', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjNWZkMjA2Zi1hZDBkLTQ3ZDItYTIzMi1hZDdlMTYxMThjYjIiLCJlbWFpbCI6ImtvbmdndWFuNDBAZ21haWwuY29tIiwicm9sZSI6Im1haGFzaXN3YSIsImlhdCI6MTc2MzQ1MjkwOC', '2025-11-25 08:01:48.493', '2025-11-18 08:01:48.495', NULL, NULL),
('ebb904e9-b77b-4db0-ba89-5c28ef5fd7e0', '4a564afd-4bdc-4555-8355-c22487b3cf8b', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YTU2NGFmZC00YmRjLTQ1NTUtODM1NS1jMjI0ODdiM2NmOGIiLCJlbWFpbCI6ImFkbWluQHNpc3RlbS1jcGwuYWMuaWQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjM0NTMxMTAsIm', '2025-11-25 08:05:10.009', '2025-11-18 08:05:10.010', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
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
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `created_at`, `updated_at`, `last_login`, `is_active`, `email_verified`) VALUES
('01541ea6-a67e-47b5-a747-3c46a6143585', 'mahasiswa1@sistem-cpl.ac.id', '$2a$10$nN.aIsZuS9gcFsLac6IOeOkr3S.VU/a8KFbgle/hM/7eZt23cz3uq', '2025-11-17 06:10:15.321', '2025-11-17 06:10:15.321', NULL, 1, 1),
('335a92a7-fb87-4f0d-80cb-4b47ebab7861', 'dosen2@sistem-cpl.ac.id', '$2a$10$nN.aIsZuS9gcFsLac6IOeOkr3S.VU/a8KFbgle/hM/7eZt23cz3uq', '2025-11-17 06:10:15.312', '2025-11-17 06:10:15.312', NULL, 1, 1),
('4a564afd-4bdc-4555-8355-c22487b3cf8b', 'admin@sistem-cpl.ac.id', '$2a$10$nN.aIsZuS9gcFsLac6IOeOkr3S.VU/a8KFbgle/hM/7eZt23cz3uq', '2025-11-17 06:10:15.257', '2025-11-17 06:10:15.257', NULL, 1, 1),
('800fed0f-2949-4a2e-8381-7cd458713f0d', 'mahasiswa3@sistem-cpl.ac.id', '$2a$10$nN.aIsZuS9gcFsLac6IOeOkr3S.VU/a8KFbgle/hM/7eZt23cz3uq', '2025-11-17 06:10:15.335', '2025-11-17 06:10:15.335', NULL, 1, 1),
('a40d4e79-303b-48c6-a714-c518d95249d4', 'dosen1@sistem-cpl.ac.id', '$2a$10$nN.aIsZuS9gcFsLac6IOeOkr3S.VU/a8KFbgle/hM/7eZt23cz3uq', '2025-11-17 06:10:15.287', '2025-11-17 06:10:15.287', NULL, 1, 1),
('c5fd206f-ad0d-47d2-a232-ad7e16118cb2', 'kongguan40@gmail.com', '$2a$10$TzOWFuDi7b84zcD.3AtKh.F.xXH2cjhAEIhi2YTfr5a0zkFdVvLAW', '2025-11-18 08:01:39.018', '2025-11-18 08:01:39.018', NULL, 1, 1),
('ccae5e8e-87dd-44b9-94f5-67ff4189485e', 'mahasiswa2@sistem-cpl.ac.id', '$2a$10$nN.aIsZuS9gcFsLac6IOeOkr3S.VU/a8KFbgle/hM/7eZt23cz3uq', '2025-11-17 06:10:15.328', '2025-11-17 06:10:15.328', NULL, 1, 1);

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_roles`
--

CREATE TABLE `user_roles` (
  `id` int(11) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `role` enum('admin','dosen','mahasiswa') NOT NULL DEFAULT 'mahasiswa',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `user_roles`
--

INSERT INTO `user_roles` (`id`, `user_id`, `role`, `created_at`, `updated_at`) VALUES
(1, '4a564afd-4bdc-4555-8355-c22487b3cf8b', 'admin', '2025-11-17 06:10:15.257', '2025-11-17 06:10:15.257'),
(2, 'a40d4e79-303b-48c6-a714-c518d95249d4', 'dosen', '2025-11-17 06:10:15.287', '2025-11-17 06:10:15.287'),
(3, '335a92a7-fb87-4f0d-80cb-4b47ebab7861', 'dosen', '2025-11-17 06:10:15.312', '2025-11-17 06:10:15.312'),
(4, '01541ea6-a67e-47b5-a747-3c46a6143585', 'mahasiswa', '2025-11-17 06:10:15.321', '2025-11-17 06:10:15.321'),
(5, 'ccae5e8e-87dd-44b9-94f5-67ff4189485e', 'mahasiswa', '2025-11-17 06:10:15.328', '2025-11-17 06:10:15.328'),
(6, '800fed0f-2949-4a2e-8381-7cd458713f0d', 'mahasiswa', '2025-11-17 06:10:15.335', '2025-11-17 06:10:15.335'),
(7, 'c5fd206f-ad0d-47d2-a232-ad7e16118cb2', 'mahasiswa', '2025-11-18 08:01:39.018', '2025-11-18 08:01:39.018');

-- --------------------------------------------------------

--
-- Struktur dari tabel `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('24cb5d40-0a0a-4b64-abaa-9528562b5fe7', '0b8117310c2c422793170cf59b60c16b3daeb0dd942069b06a54ffadcdc452c7', '2025-11-17 06:10:07.073', '20251117061005_init', NULL, NULL, '2025-11-17 06:10:05.216', 1);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_user_id_idx` (`user_id`),
  ADD KEY `audit_logs_action_idx` (`action`),
  ADD KEY `audit_logs_table_name_idx` (`table_name`),
  ADD KEY `audit_logs_created_at_idx` (`created_at`);

--
-- Indeks untuk tabel `cpl`
--
ALTER TABLE `cpl`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cpl_kode_cpl_key` (`kode_cpl`),
  ADD KEY `cpl_kode_cpl_idx` (`kode_cpl`),
  ADD KEY `cpl_kategori_idx` (`kategori`),
  ADD KEY `cpl_is_active_idx` (`is_active`),
  ADD KEY `cpl_created_by_fkey` (`created_by`);

--
-- Indeks untuk tabel `cpl_mata_kuliah`
--
ALTER TABLE `cpl_mata_kuliah`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cpl_mata_kuliah_cpl_id_mata_kuliah_id_key` (`cpl_id`,`mata_kuliah_id`),
  ADD KEY `cpl_mata_kuliah_cpl_id_idx` (`cpl_id`),
  ADD KEY `cpl_mata_kuliah_mata_kuliah_id_idx` (`mata_kuliah_id`);

--
-- Indeks untuk tabel `mata_kuliah`
--
ALTER TABLE `mata_kuliah`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mata_kuliah_kode_mk_key` (`kode_mk`),
  ADD KEY `mata_kuliah_kode_mk_idx` (`kode_mk`),
  ADD KEY `mata_kuliah_semester_idx` (`semester`),
  ADD KEY `mata_kuliah_is_active_idx` (`is_active`),
  ADD KEY `mata_kuliah_created_by_fkey` (`created_by`);

--
-- Indeks untuk tabel `nilai_cpl`
--
ALTER TABLE `nilai_cpl`
  ADD PRIMARY KEY (`id`),
  ADD KEY `nilai_cpl_mahasiswa_id_idx` (`mahasiswa_id`),
  ADD KEY `nilai_cpl_cpl_id_idx` (`cpl_id`),
  ADD KEY `nilai_cpl_mata_kuliah_id_idx` (`mata_kuliah_id`),
  ADD KEY `nilai_cpl_semester_idx` (`semester`),
  ADD KEY `nilai_cpl_tahun_ajaran_idx` (`tahun_ajaran`),
  ADD KEY `nilai_cpl_created_by_fkey` (`created_by`);

--
-- Indeks untuk tabel `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `profiles_user_id_key` (`user_id`),
  ADD UNIQUE KEY `profiles_nim_key` (`nim`),
  ADD UNIQUE KEY `profiles_nip_key` (`nip`),
  ADD KEY `profiles_nim_idx` (`nim`),
  ADD KEY `profiles_nip_idx` (`nip`),
  ADD KEY `profiles_program_studi_idx` (`program_studi`),
  ADD KEY `profiles_semester_idx` (`semester`);

--
-- Indeks untuk tabel `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sessions_token_key` (`token`),
  ADD KEY `sessions_user_id_idx` (`user_id`),
  ADD KEY `sessions_token_idx` (`token`),
  ADD KEY `sessions_expires_at_idx` (`expires_at`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD KEY `users_email_idx` (`email`),
  ADD KEY `users_is_active_idx` (`is_active`);

--
-- Indeks untuk tabel `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_roles_user_id_key` (`user_id`),
  ADD KEY `user_roles_role_idx` (`role`),
  ADD KEY `user_roles_user_id_idx` (`user_id`);

--
-- Indeks untuk tabel `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `cpl`
--
ALTER TABLE `cpl`
  ADD CONSTRAINT `cpl_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `cpl_mata_kuliah`
--
ALTER TABLE `cpl_mata_kuliah`
  ADD CONSTRAINT `cpl_mata_kuliah_cpl_id_fkey` FOREIGN KEY (`cpl_id`) REFERENCES `cpl` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cpl_mata_kuliah_mata_kuliah_id_fkey` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `mata_kuliah`
--
ALTER TABLE `mata_kuliah`
  ADD CONSTRAINT `mata_kuliah_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `nilai_cpl`
--
ALTER TABLE `nilai_cpl`
  ADD CONSTRAINT `nilai_cpl_cpl_id_fkey` FOREIGN KEY (`cpl_id`) REFERENCES `cpl` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_cpl_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_cpl_mahasiswa_id_fkey` FOREIGN KEY (`mahasiswa_id`) REFERENCES `profiles` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_cpl_mata_kuliah_id_fkey` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `profiles`
--
ALTER TABLE `profiles`
  ADD CONSTRAINT `profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
