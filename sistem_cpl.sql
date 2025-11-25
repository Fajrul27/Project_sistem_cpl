-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 25 Nov 2025 pada 05.27
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
  `created_by` varchar(191) DEFAULT NULL,
  `minimal_nilai_tercapai` decimal(5,2) NOT NULL DEFAULT 70.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `cpl`
--

INSERT INTO `cpl` (`id`, `kode_cpl`, `deskripsi`, `kategori`, `bobot`, `is_active`, `created_at`, `updated_at`, `created_by`, `minimal_nilai_tercapai`) VALUES
('7c10cd25-6132-4472-9839-156c74397c35', 'CPL-05', 'Mampu mengidentifikasi, menganalisis, dan merumuskan solusi permasalahan', 'Keterampilan Umum', 1.00, 1, '2025-11-23 03:30:02.784', '2025-11-23 03:30:02.784', 'f863e327-d469-404b-8741-941bbe26b2ff', 70.00),
('83768506-9348-4558-98d6-81194b642108', 'CPL-01', 'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan atau implementasi ilmu pengetahuan dan teknologi', 'Sikap', 1.00, 1, '2025-11-23 03:30:02.766', '2025-11-23 03:30:02.766', 'f863e327-d469-404b-8741-941bbe26b2ff', 70.00),
('853b3ada-e882-409d-9e1d-0396f7e44d54', 'CPL-02', 'Menguasai konsep teoretis dan prinsip rekayasa perangkat lunak', 'Pengetahuan', 1.00, 1, '2025-11-23 03:30:02.773', '2025-11-23 03:30:02.773', 'f863e327-d469-404b-8741-941bbe26b2ff', 70.00),
('a673d82d-edfe-4af3-87c8-2aba50773734', 'CPL-03', 'Mampu merancang dan mengimplementasikan sistem informasi', 'Keterampilan Umum', 1.00, 1, '2025-11-23 03:30:02.777', '2025-11-23 03:30:02.777', 'f863e327-d469-404b-8741-941bbe26b2ff', 70.00),
('c36c1d33-a830-4411-af58-f2fa62bca982', 'CPL-04', 'Mampu bekerja sama dalam tim multidisiplin', 'Keterampilan Khusus', 1.00, 1, '2025-11-23 03:30:02.780', '2025-11-23 03:30:02.780', 'f863e327-d469-404b-8741-941bbe26b2ff', 70.00),
('e91c1d78-831d-4f1d-acb1-465a54410c8b', 'CPL-06', 'Njajal', 'Pengetahuan', 1.00, 1, '2025-11-23 03:45:38.936', '2025-11-23 03:45:38.936', 'f863e327-d469-404b-8741-941bbe26b2ff', 70.00);

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
('0336d2b6-faaf-44af-ab39-9737294e345f', '83768506-9348-4558-98d6-81194b642108', '7282a4e7-21ee-4813-8042-68c41b002fac', 1.00, '2025-11-23 03:30:02.816', '2025-11-23 03:30:02.816'),
('054b83b6-cf6a-413a-858d-d2c6d18d5604', 'c36c1d33-a830-4411-af58-f2fa62bca982', '4b32baa4-b816-43aa-a48f-0003839cca81', 1.00, '2025-11-23 03:30:02.816', '2025-11-23 03:30:02.816'),
('0ab46805-228d-42cb-82fe-334dd5f23461', '7c10cd25-6132-4472-9839-156c74397c35', 'b7025633-f203-4245-9eea-5226b10435eb', 1.00, '2025-11-23 03:30:02.816', '2025-11-23 03:30:02.816'),
('1ed763a5-510b-4ae3-9b24-7a5b2f85ac1e', 'a673d82d-edfe-4af3-87c8-2aba50773734', 'a1c09d06-a445-4204-adad-d5d454f06cf4', 1.00, '2025-11-23 03:30:02.816', '2025-11-23 03:30:02.816'),
('3b0d6eb2-a819-4d0a-9425-8b734f4ec73c', '853b3ada-e882-409d-9e1d-0396f7e44d54', 'b7025633-f203-4245-9eea-5226b10435eb', 1.50, '2025-11-23 03:30:02.816', '2025-11-23 03:30:02.816'),
('580054c1-89f0-4c53-9f50-845c7a805b7b', '853b3ada-e882-409d-9e1d-0396f7e44d54', '4b32baa4-b816-43aa-a48f-0003839cca81', 1.00, '2025-11-23 03:30:02.816', '2025-11-23 03:30:02.816'),
('64d79dde-6e2a-418c-a76d-44d8fac7b844', '853b3ada-e882-409d-9e1d-0396f7e44d54', '7282a4e7-21ee-4813-8042-68c41b002fac', 1.00, '2025-11-23 03:30:02.816', '2025-11-23 03:30:02.816'),
('6536abde-8619-4fc6-83ad-63932e0ee691', '83768506-9348-4558-98d6-81194b642108', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 1.40, '2025-11-23 06:41:08.563', '2025-11-23 06:41:08.563'),
('69b349b4-f258-46b4-81c4-84fef8a16568', 'a673d82d-edfe-4af3-87c8-2aba50773734', '4b32baa4-b816-43aa-a48f-0003839cca81', 1.00, '2025-11-23 03:30:02.816', '2025-11-23 03:30:02.816'),
('69d29543-1bae-4607-9189-86c67b665bab', 'c36c1d33-a830-4411-af58-f2fa62bca982', 'a1c09d06-a445-4204-adad-d5d454f06cf4', 1.00, '2025-11-23 03:30:02.816', '2025-11-23 03:30:02.816'),
('7f52d67c-489f-4af0-b468-04619d5b4b05', 'c36c1d33-a830-4411-af58-f2fa62bca982', 'b7025633-f203-4245-9eea-5226b10435eb', 1.00, '2025-11-23 03:30:02.816', '2025-11-23 03:30:02.816'),
('8b97e318-a062-4f78-a9c8-ba8580eb9f35', '853b3ada-e882-409d-9e1d-0396f7e44d54', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 1.00, '2025-11-24 07:57:56.734', '2025-11-24 07:57:56.734'),
('9b10bf57-7de3-46a1-8096-0f1eff990171', 'a673d82d-edfe-4af3-87c8-2aba50773734', 'b7025633-f203-4245-9eea-5226b10435eb', 1.50, '2025-11-23 03:30:02.816', '2025-11-23 03:30:02.816'),
('af410091-538d-4535-9d36-5d26cf3026c0', 'a673d82d-edfe-4af3-87c8-2aba50773734', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 1.00, '2025-11-24 07:57:56.734', '2025-11-24 07:57:56.734'),
('be6a2380-2c49-4214-b3ce-2545becf779b', '7c10cd25-6132-4472-9839-156c74397c35', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 1.00, '2025-11-24 07:57:56.734', '2025-11-24 07:57:56.734'),
('cbbc9d4c-1ff3-49c7-9463-7bd3b037926c', '853b3ada-e882-409d-9e1d-0396f7e44d54', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 1.00, '2025-11-23 06:41:08.563', '2025-11-23 06:41:08.563'),
('ff741766-83e4-41ab-b0d5-b8593062f790', '7c10cd25-6132-4472-9839-156c74397c35', '7282a4e7-21ee-4813-8042-68c41b002fac', 1.00, '2025-11-23 03:30:02.816', '2025-11-23 03:30:02.816');

-- --------------------------------------------------------

--
-- Struktur dari tabel `cpmk`
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
  `level_taksonomi` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `cpmk`
--

INSERT INTO `cpmk` (`id`, `kode_cpmk`, `deskripsi`, `mata_kuliah_id`, `is_active`, `created_at`, `updated_at`, `created_by`, `status_validasi`, `validated_at`, `validated_by`, `level_taksonomi`) VALUES
('37241bb6-3b20-454d-b93d-bd7d4a63ae5b', 'CPMK 6', NULL, 'a1c09d06-a445-4204-adad-d5d454f06cf4', 1, '2025-11-24 07:56:47.250', '2025-11-24 13:35:31.305', 'f863e327-d469-404b-8741-941bbe26b2ff', 'active', '2025-11-24 13:35:31.303', 'f863e327-d469-404b-8741-941bbe26b2ff', NULL),
('3a64c12c-0e00-4c84-a35b-b1b8382d34ea', 'CPMK 1', 'Mahasiswa mampu merancang database yang terstruktur', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 1, '2025-11-23 03:30:02.857', '2025-11-24 11:42:14.338', '95082c60-173d-42fd-8895-8b85f8bb5bf3', 'active', '2025-11-24 11:42:14.336', 'f863e327-d469-404b-8741-941bbe26b2ff', NULL),
('3a855135-ecf1-43f2-ad49-f857288a7fb4', 'CPMK 5', 'Mahasiswa mampu menganalisis kompleksitas algoritma', '7282a4e7-21ee-4813-8042-68c41b002fac', 1, '2025-11-23 03:30:02.849', '2025-11-24 11:42:01.328', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e', 'active', '2025-11-24 11:42:01.326', 'f863e327-d469-404b-8741-941bbe26b2ff', NULL),
('4238662f-8818-4d1c-85a8-a90b92a509df', 'CPMK 2', 'Mahasiswa mampu menggunakan SQL untuk manipulasi data', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 1, '2025-11-23 03:30:02.861', '2025-11-24 11:42:12.479', '95082c60-173d-42fd-8895-8b85f8bb5bf3', 'active', '2025-11-24 11:42:12.477', 'f863e327-d469-404b-8741-941bbe26b2ff', NULL),
('52d1e4e5-ec6b-4ecb-b123-fd82b720533a', 'CPMK 5', 'Observasi', '4b32baa4-b816-43aa-a48f-0003839cca81', 1, '2025-11-23 03:36:19.179', '2025-11-24 11:42:12.991', 'f863e327-d469-404b-8741-941bbe26b2ff', 'active', '2025-11-24 11:42:12.989', 'f863e327-d469-404b-8741-941bbe26b2ff', NULL),
('afaea075-7e33-43ee-a608-6927ad193bbd', 'CPMK 2', 'Mahasiswa mampu mengimplementasikan struktur data dasar', '7282a4e7-21ee-4813-8042-68c41b002fac', 1, '2025-11-23 03:30:02.852', '2025-11-24 11:42:00.808', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e', 'active', '2025-11-24 11:42:00.807', 'f863e327-d469-404b-8741-941bbe26b2ff', NULL),
('dddf6332-753c-4f3c-86d7-b2539461294b', 'CPMK 1', 'Mahasiswa mampu memahami konsep dasar pemrograman', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 1, '2025-11-23 03:30:02.838', '2025-11-24 11:42:02.663', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e', 'active', '2025-11-24 11:42:02.662', 'f863e327-d469-404b-8741-941bbe26b2ff', NULL),
('de03d4ce-3db4-4f60-8d7f-baba91e240de', 'CPMK 2', 'Mahasiswa mampu membuat program sederhana menggunakan bahasa pemrograman', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 1, '2025-11-23 03:30:02.845', '2025-11-24 11:42:01.859', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e', 'active', '2025-11-24 11:42:01.857', 'f863e327-d469-404b-8741-941bbe26b2ff', NULL),
('e18515f9-1a15-4081-8b13-ce060458a6e1', 'CPMK11', 'Ana lah', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 1, '2025-11-25 04:24:55.314', '2025-11-25 04:24:55.314', 'f863e327-d469-404b-8741-941bbe26b2ff', 'draft', NULL, NULL, 'C1');

-- --------------------------------------------------------

--
-- Struktur dari tabel `cpmk_cpl_mapping`
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
-- Dumping data untuk tabel `cpmk_cpl_mapping`
--

INSERT INTO `cpmk_cpl_mapping` (`id`, `cpmk_id`, `cpl_id`, `bobot_persentase`, `created_at`, `updated_at`) VALUES
('1e5832ac-e98f-4216-a828-a9ad83e9ef91', '4238662f-8818-4d1c-85a8-a90b92a509df', 'c36c1d33-a830-4411-af58-f2fa62bca982', 20.00, '2025-11-23 15:10:08.900', '2025-11-23 15:10:08.900'),
('26ad9ef8-a070-44e0-9354-5c88499fcbcd', 'de03d4ce-3db4-4f60-8d7f-baba91e240de', 'a673d82d-edfe-4af3-87c8-2aba50773734', 70.00, '2025-11-23 03:30:02.866', '2025-11-23 03:30:02.866'),
('2b523d8d-b856-4d9e-a346-c8c339a8d732', '3a64c12c-0e00-4c84-a35b-b1b8382d34ea', '853b3ada-e882-409d-9e1d-0396f7e44d54', 70.00, '2025-11-23 03:30:02.866', '2025-11-23 03:30:02.866'),
('37567b2b-b198-4d37-b129-079db0a3b861', '4238662f-8818-4d1c-85a8-a90b92a509df', 'a673d82d-edfe-4af3-87c8-2aba50773734', 30.00, '2025-11-23 03:30:02.866', '2025-11-23 15:10:00.755'),
('4a90fbd2-0a7b-4305-8082-641e11d5dba8', '3a64c12c-0e00-4c84-a35b-b1b8382d34ea', 'a673d82d-edfe-4af3-87c8-2aba50773734', 30.00, '2025-11-23 03:30:02.866', '2025-11-23 03:30:02.866'),
('76623649-b012-4f3e-b56a-af9f00609c82', '4238662f-8818-4d1c-85a8-a90b92a509df', '7c10cd25-6132-4472-9839-156c74397c35', 20.00, '2025-11-24 04:03:28.917', '2025-11-24 04:03:28.917'),
('7cbf32c7-313f-47d6-9119-1523beda15c7', '52d1e4e5-ec6b-4ecb-b123-fd82b720533a', 'a673d82d-edfe-4af3-87c8-2aba50773734', 20.00, '2025-11-24 08:14:20.161', '2025-11-24 08:14:20.161'),
('8d729729-9447-4c95-a087-bddece07769f', '3a855135-ecf1-43f2-ad49-f857288a7fb4', '853b3ada-e882-409d-9e1d-0396f7e44d54', 15.00, '2025-11-23 15:31:06.741', '2025-11-23 15:31:06.741'),
('a43478d9-3bac-4128-82a8-6ac3a2e2fef5', '4238662f-8818-4d1c-85a8-a90b92a509df', '853b3ada-e882-409d-9e1d-0396f7e44d54', 30.00, '2025-11-23 03:30:02.866', '2025-11-24 04:03:23.741'),
('a5f92b4b-dd57-4831-86e3-ccc0d7342aea', 'afaea075-7e33-43ee-a608-6927ad193bbd', '853b3ada-e882-409d-9e1d-0396f7e44d54', 25.00, '2025-11-23 03:30:02.866', '2025-11-23 15:24:04.729'),
('b5e412b8-2fc2-4286-8b79-9ef7d6493712', 'de03d4ce-3db4-4f60-8d7f-baba91e240de', '83768506-9348-4558-98d6-81194b642108', 30.00, '2025-11-23 03:30:02.866', '2025-11-23 03:30:02.866'),
('b9162674-1750-43cb-995d-ae2434bd80b7', '37241bb6-3b20-454d-b93d-bd7d4a63ae5b', 'e91c1d78-831d-4f1d-acb1-465a54410c8b', 90.00, '2025-11-24 07:56:59.689', '2025-11-24 08:44:19.787'),
('cb883c64-9e29-40e0-ab06-39fbaec695cc', '52d1e4e5-ec6b-4ecb-b123-fd82b720533a', 'e91c1d78-831d-4f1d-acb1-465a54410c8b', 50.00, '2025-11-24 07:56:12.277', '2025-11-24 07:56:12.277'),
('dcbc7aae-0d81-400e-ac2f-a97f4da1897a', 'dddf6332-753c-4f3c-86d7-b2539461294b', '83768506-9348-4558-98d6-81194b642108', 60.00, '2025-11-23 03:30:02.866', '2025-11-23 03:30:02.866'),
('ebb925cf-bc4f-4da4-b821-d2308b680df3', '52d1e4e5-ec6b-4ecb-b123-fd82b720533a', '853b3ada-e882-409d-9e1d-0396f7e44d54', 15.00, '2025-11-23 15:28:51.725', '2025-11-23 15:28:51.725'),
('ece45567-6ae0-4086-bd9b-cadda92fd48e', 'dddf6332-753c-4f3c-86d7-b2539461294b', 'a673d82d-edfe-4af3-87c8-2aba50773734', 40.00, '2025-11-23 03:30:02.866', '2025-11-23 03:30:02.866');

-- --------------------------------------------------------

--
-- Struktur dari tabel `kaprodi_data`
--

CREATE TABLE `kaprodi_data` (
  `id` varchar(191) NOT NULL,
  `program_studi` varchar(191) NOT NULL,
  `nama_kaprodi` varchar(191) NOT NULL,
  `nidn_kaprodi` varchar(191) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `kaprodi_data`
--

INSERT INTO `kaprodi_data` (`id`, `program_studi`, `nama_kaprodi`, `nidn_kaprodi`, `created_at`, `updated_at`) VALUES
('3fc997aa-f77a-4f3f-a42d-03cd6fbbf4f8', 'TEKNIK INFORMATIKA', 'Safiq Rosad, S.T., M. Kom ', 'NIDN. 0609018101', '2025-11-25 01:16:37.257', '2025-11-25 01:16:37.257');

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
  `created_by` varchar(191) DEFAULT NULL,
  `program_studi` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `mata_kuliah`
--

INSERT INTO `mata_kuliah` (`id`, `kode_mk`, `nama_mk`, `sks`, `semester`, `deskripsi`, `is_active`, `created_at`, `updated_at`, `created_by`, `program_studi`) VALUES
('48a537fb-d91c-4ac3-9c69-07c47e60b73b', 'IF-201', 'Basis Data', 3, 3, NULL, 1, '2025-11-23 03:30:02.798', '2025-11-23 03:30:02.798', '95082c60-173d-42fd-8895-8b85f8bb5bf3', NULL),
('4b32baa4-b816-43aa-a48f-0003839cca81', 'IF-202', 'Pemrograman Web', 3, 4, NULL, 1, '2025-11-23 03:30:02.801', '2025-11-23 03:30:02.801', '95082c60-173d-42fd-8895-8b85f8bb5bf3', NULL),
('59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 'IF-101', 'Pemrograman Dasar', 3, 1, NULL, 1, '2025-11-23 03:30:02.788', '2025-11-23 03:30:02.788', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e', NULL),
('7282a4e7-21ee-4813-8042-68c41b002fac', 'IF-102', 'Algoritma dan Struktur Data', 3, 2, NULL, 1, '2025-11-23 03:30:02.795', '2025-11-23 03:30:02.795', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e', NULL),
('a1c09d06-a445-4204-adad-d5d454f06cf4', 'IF-302', 'Sistem Informasi', 3, 5, NULL, 1, '2025-11-23 03:30:02.807', '2025-11-23 03:30:02.807', '95082c60-173d-42fd-8895-8b85f8bb5bf3', NULL),
('b7025633-f203-4245-9eea-5226b10435eb', 'IF-301', 'Rekayasa Perangkat Lunak', 3, 5, NULL, 1, '2025-11-23 03:30:02.804', '2025-11-23 03:30:02.804', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e', NULL),
('cc25264f-8c0d-474d-91c2-40f434903d77', 'IF-401', 'Machine Learning', 3, 7, NULL, 1, '2025-11-23 03:30:02.811', '2025-11-23 03:30:02.811', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `mata_kuliah_pengampu`
--

CREATE TABLE `mata_kuliah_pengampu` (
  `id` varchar(191) NOT NULL,
  `mata_kuliah_id` varchar(191) NOT NULL,
  `dosen_id` varchar(191) NOT NULL,
  `is_pengampu_utama` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `mata_kuliah_pengampu`
--

INSERT INTO `mata_kuliah_pengampu` (`id`, `mata_kuliah_id`, `dosen_id`, `is_pengampu_utama`, `created_at`, `updated_at`) VALUES
('22671ba0-b650-4b8a-bb84-9c55d19492e4', '7282a4e7-21ee-4813-8042-68c41b002fac', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e', 1, '2025-11-25 00:29:34.200', '2025-11-25 00:29:34.200'),
('2b1c9885-890c-487e-bfe7-3de1084a13a9', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', '95082c60-173d-42fd-8895-8b85f8bb5bf3', 1, '2025-11-25 00:29:48.718', '2025-11-25 00:29:48.718'),
('8a27f750-83d9-4aed-9893-0985d0b507ef', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', 1, '2025-11-25 00:33:18.367', '2025-11-25 00:33:18.367');

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
('02bb5b61-fb14-40e0-98b7-c93cf9990519', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '7c10cd25-6132-4472-9839-156c74397c35', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:14.230', '2025-11-24 08:20:14.337', NULL),
('050f661b-b572-4106-92ad-9006930c1544', '768e6245-b69c-4030-b97b-64522930fdb2', 'a673d82d-edfe-4af3-87c8-2aba50773734', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 80.00, 1, '2021/2022', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('053c6e9d-62bd-4cca-9d7e-16fbc27cb8fa', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '853b3ada-e882-409d-9e1d-0396f7e44d54', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:14.083', '2025-11-24 08:20:14.315', NULL),
('08940985-a394-4f56-9fe3-fb0f1bc827a9', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', 'c36c1d33-a830-4411-af58-f2fa62bca982', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:14.222', '2025-11-24 08:20:14.329', NULL),
('08944cc9-3632-4728-b9ef-65b840d66eeb', '768e6245-b69c-4030-b97b-64522930fdb2', '83768506-9348-4558-98d6-81194b642108', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 78.00, 1, '2021/2022', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('0ccb99db-fa08-4f3a-8b9b-8fbe2be36c88', '768e6245-b69c-4030-b97b-64522930fdb2', '83768506-9348-4558-98d6-81194b642108', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', NULL, '2025-11-23 12:17:23.500', '2025-11-24 08:51:03.631', NULL),
('0f8c4506-8b6e-40d7-ae8f-c2df62f28478', '1686500a-3771-4460-996e-e76b3f343167', '7c10cd25-6132-4472-9839-156c74397c35', '7282a4e7-21ee-4813-8042-68c41b002fac', 100.00, 2, '2025/2026', NULL, '2025-11-23 13:00:02.201', '2025-11-23 15:30:56.663', NULL),
('12efb37d-98e7-4547-b0c7-fab5510ccfe3', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '853b3ada-e882-409d-9e1d-0396f7e44d54', '4b32baa4-b816-43aa-a48f-0003839cca81', 85.00, 4, '2022/2023', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', '95082c60-173d-42fd-8895-8b85f8bb5bf3'),
('1352067c-c06b-4979-8416-55a48ef8869c', '1686500a-3771-4460-996e-e76b3f343167', 'a673d82d-edfe-4af3-87c8-2aba50773734', '4b32baa4-b816-43aa-a48f-0003839cca81', 93.00, 4, '2022/2023', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', '95082c60-173d-42fd-8895-8b85f8bb5bf3'),
('1545241c-59ac-47f7-a1d8-18ccf967e56f', '768e6245-b69c-4030-b97b-64522930fdb2', '853b3ada-e882-409d-9e1d-0396f7e44d54', '4b32baa4-b816-43aa-a48f-0003839cca81', 80.00, 4, '2022/2023', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', '95082c60-173d-42fd-8895-8b85f8bb5bf3'),
('1b12dba4-b4e1-4f79-baaa-da844e945034', '768e6245-b69c-4030-b97b-64522930fdb2', 'a673d82d-edfe-4af3-87c8-2aba50773734', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 83.00, 3, '2022/2023', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', '95082c60-173d-42fd-8895-8b85f8bb5bf3'),
('222682d5-4aba-4c51-9f71-88f103d86935', '1686500a-3771-4460-996e-e76b3f343167', '83768506-9348-4558-98d6-81194b642108', '7282a4e7-21ee-4813-8042-68c41b002fac', 100.00, 1, '2025/2026', NULL, '2025-11-23 11:10:42.019', '2025-11-23 15:24:04.764', NULL),
('2453a8fe-202a-4b89-9c9f-dc925417fb4e', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '853b3ada-e882-409d-9e1d-0396f7e44d54', '7282a4e7-21ee-4813-8042-68c41b002fac', 89.38, 2, '2025/2026', NULL, '2025-11-23 13:00:02.838', '2025-11-23 15:49:42.147', NULL),
('26d5c80d-93f9-4c71-9da2-766a5f547a8d', '1686500a-3771-4460-996e-e76b3f343167', '853b3ada-e882-409d-9e1d-0396f7e44d54', '7282a4e7-21ee-4813-8042-68c41b002fac', 100.00, 2, '2025/2026', NULL, '2025-11-23 13:00:02.346', '2025-11-23 15:49:42.191', NULL),
('2706ca78-28f6-4ede-b099-3b598a1063c9', '768e6245-b69c-4030-b97b-64522930fdb2', '7c10cd25-6132-4472-9839-156c74397c35', 'b7025633-f203-4245-9eea-5226b10435eb', 84.00, 5, '2023/2024', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('2a60aa22-1db0-4396-b142-997cfa549c25', '1686500a-3771-4460-996e-e76b3f343167', '83768506-9348-4558-98d6-81194b642108', '7282a4e7-21ee-4813-8042-68c41b002fac', 100.00, 2, '2025/2026', NULL, '2025-11-23 13:00:02.183', '2025-11-23 15:24:04.785', NULL),
('30824b32-f6eb-4a6a-b714-e8c1c38f2360', '768e6245-b69c-4030-b97b-64522930fdb2', '7c10cd25-6132-4472-9839-156c74397c35', '7282a4e7-21ee-4813-8042-68c41b002fac', 100.00, 2, '2025/2026', NULL, '2025-11-23 13:00:02.436', '2025-11-23 15:30:56.720', NULL),
('36562065-0c70-4618-9260-3823bcf846e0', '768e6245-b69c-4030-b97b-64522930fdb2', '7c10cd25-6132-4472-9839-156c74397c35', '7282a4e7-21ee-4813-8042-68c41b002fac', 81.00, 2, '2021/2022', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('38d96738-824e-44b2-8a9f-a4986ea00ded', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', 'c36c1d33-a830-4411-af58-f2fa62bca982', 'b7025633-f203-4245-9eea-5226b10435eb', 88.00, 5, '2023/2024', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('4171effa-f590-4df0-9fc6-6ba46bc0b344', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', 'a673d82d-edfe-4af3-87c8-2aba50773734', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 82.00, 1, '2021/2022', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('425bea83-b828-4a64-8927-430eaae21763', '1686500a-3771-4460-996e-e76b3f343167', 'a673d82d-edfe-4af3-87c8-2aba50773734', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:13.443', '2025-11-24 08:20:13.737', NULL),
('42ae1427-5f28-4933-b91b-84300d2e8eab', '768e6245-b69c-4030-b97b-64522930fdb2', 'a673d82d-edfe-4af3-87c8-2aba50773734', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:13.796', '2025-11-24 08:20:14.035', NULL),
('4330f12e-51d9-44ca-beeb-395801470b4e', '1686500a-3771-4460-996e-e76b3f343167', '7c10cd25-6132-4472-9839-156c74397c35', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:13.632', '2025-11-24 08:20:13.752', NULL),
('439d44ba-017b-41bb-af82-7b94c02df958', '1686500a-3771-4460-996e-e76b3f343167', 'c36c1d33-a830-4411-af58-f2fa62bca982', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:13.624', '2025-11-24 08:20:13.745', NULL),
('4a0edcab-3e12-4b82-9244-eb6ce8565d46', '1686500a-3771-4460-996e-e76b3f343167', '7c10cd25-6132-4472-9839-156c74397c35', '7282a4e7-21ee-4813-8042-68c41b002fac', 100.00, 1, '2025/2026', NULL, '2025-11-23 11:10:42.037', '2025-11-23 15:30:56.684', NULL),
('56700fdf-5664-4adf-a64b-73093b0bd2b9', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '83768506-9348-4558-98d6-81194b642108', '7282a4e7-21ee-4813-8042-68c41b002fac', 88.00, 2, '2021/2022', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('5a874639-c6f5-4743-a10a-fe279bbc6c16', '1686500a-3771-4460-996e-e76b3f343167', '853b3ada-e882-409d-9e1d-0396f7e44d54', '7282a4e7-21ee-4813-8042-68c41b002fac', 93.00, 2, '2021/2022', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('5cbc5226-b0aa-434b-955f-3a0197b7a5b0', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '853b3ada-e882-409d-9e1d-0396f7e44d54', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 90.00, 3, '2022/2023', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', '95082c60-173d-42fd-8895-8b85f8bb5bf3'),
('5d8a011e-a10a-4ce5-a508-cd900258e06f', '1686500a-3771-4460-996e-e76b3f343167', '853b3ada-e882-409d-9e1d-0396f7e44d54', 'b7025633-f203-4245-9eea-5226b10435eb', 97.00, 5, '2023/2024', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('5dcd6304-13ed-4d00-8ffd-ff59c149691f', '768e6245-b69c-4030-b97b-64522930fdb2', '853b3ada-e882-409d-9e1d-0396f7e44d54', '7282a4e7-21ee-4813-8042-68c41b002fac', 71.25, 2, '2025/2026', NULL, '2025-11-23 13:00:02.605', '2025-11-23 15:49:42.169', NULL),
('5f1c67c2-eaa5-41db-8b29-a0f7296b816c', '1686500a-3771-4460-996e-e76b3f343167', '853b3ada-e882-409d-9e1d-0396f7e44d54', '7282a4e7-21ee-4813-8042-68c41b002fac', 53.75, 1, '2025/2026', NULL, '2025-11-23 11:10:42.187', '2025-11-24 08:03:15.926', NULL),
('5fbe12a7-0ab0-49c4-81cd-442bbae1e7bd', '768e6245-b69c-4030-b97b-64522930fdb2', 'c36c1d33-a830-4411-af58-f2fa62bca982', '4b32baa4-b816-43aa-a48f-0003839cca81', 85.00, 4, '2022/2023', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', '95082c60-173d-42fd-8895-8b85f8bb5bf3'),
('64b534d8-fcf5-48ee-a075-7ae99e208594', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', 'a673d82d-edfe-4af3-87c8-2aba50773734', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 88.00, 3, '2022/2023', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', '95082c60-173d-42fd-8895-8b85f8bb5bf3'),
('6cc527b4-0b5c-41e0-a07b-667c78b63576', '768e6245-b69c-4030-b97b-64522930fdb2', 'a673d82d-edfe-4af3-87c8-2aba50773734', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', NULL, '2025-11-23 12:17:23.508', '2025-11-24 08:51:03.638', NULL),
('6d3425f5-b626-4e0c-8da8-110f39df9ec6', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '7c10cd25-6132-4472-9839-156c74397c35', 'b7025633-f203-4245-9eea-5226b10435eb', 89.00, 5, '2023/2024', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('6f93d9d5-4ca8-499c-8f3a-7814f2914d48', '768e6245-b69c-4030-b97b-64522930fdb2', '853b3ada-e882-409d-9e1d-0396f7e44d54', '7282a4e7-21ee-4813-8042-68c41b002fac', 79.00, 2, '2021/2022', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('77fd2e20-c659-41f3-a2ed-a9fb8e86b8e9', '1686500a-3771-4460-996e-e76b3f343167', 'a673d82d-edfe-4af3-87c8-2aba50773734', 'b7025633-f203-4245-9eea-5226b10435eb', 95.00, 5, '2023/2024', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('7984acb3-4009-440e-99ff-ce4ac90c79bf', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', 'a673d82d-edfe-4af3-87c8-2aba50773734', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:14.090', '2025-11-24 08:20:14.321', NULL),
('7ae7b80a-9440-425c-bf08-8a98c0d208fb', '1686500a-3771-4460-996e-e76b3f343167', 'c36c1d33-a830-4411-af58-f2fa62bca982', 'b7025633-f203-4245-9eea-5226b10435eb', 93.00, 5, '2023/2024', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('7c48426b-812f-4862-836d-876232536205', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '853b3ada-e882-409d-9e1d-0396f7e44d54', '7282a4e7-21ee-4813-8042-68c41b002fac', 85.00, 2, '2021/2022', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('7f0202ff-f259-4a83-89fc-479d4ffc4bb0', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '83768506-9348-4558-98d6-81194b642108', '7282a4e7-21ee-4813-8042-68c41b002fac', 100.00, 2, '2025/2026', NULL, '2025-11-23 13:00:02.690', '2025-11-23 15:24:04.742', NULL),
('7f44e468-f084-483e-983f-a7ee436feac8', '1686500a-3771-4460-996e-e76b3f343167', '853b3ada-e882-409d-9e1d-0396f7e44d54', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 96.00, 3, '2022/2023', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', '95082c60-173d-42fd-8895-8b85f8bb5bf3'),
('83cfd70b-3a69-459e-bd10-ae299fd5fc41', '1686500a-3771-4460-996e-e76b3f343167', '83768506-9348-4558-98d6-81194b642108', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', NULL, '2025-11-23 12:17:23.268', '2025-11-24 08:51:03.716', NULL),
('887e732b-2c1a-4ec5-8741-7637cbd9a215', '768e6245-b69c-4030-b97b-64522930fdb2', '853b3ada-e882-409d-9e1d-0396f7e44d54', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:13.788', '2025-11-24 08:20:14.028', NULL),
('8cb4b1f3-77af-4bc0-89e9-5900cefcdeab', '768e6245-b69c-4030-b97b-64522930fdb2', '83768506-9348-4558-98d6-81194b642108', '7282a4e7-21ee-4813-8042-68c41b002fac', 100.00, 2, '2025/2026', NULL, '2025-11-23 13:00:02.428', '2025-11-23 15:24:04.808', NULL),
('9682f9a7-e38a-4652-b5f6-0960da3364d1', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '7c10cd25-6132-4472-9839-156c74397c35', '7282a4e7-21ee-4813-8042-68c41b002fac', 87.00, 2, '2021/2022', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('97e67a6f-d146-4afe-932b-1569b3a97503', '768e6245-b69c-4030-b97b-64522930fdb2', '853b3ada-e882-409d-9e1d-0396f7e44d54', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 85.00, 3, '2022/2023', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', '95082c60-173d-42fd-8895-8b85f8bb5bf3'),
('9ca85a40-c395-4969-8549-afdb35198e80', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', 'c36c1d33-a830-4411-af58-f2fa62bca982', '4b32baa4-b816-43aa-a48f-0003839cca81', 90.00, 4, '2022/2023', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', '95082c60-173d-42fd-8895-8b85f8bb5bf3'),
('9dd41a04-2578-4c69-a51a-63b0f4a8b31b', '768e6245-b69c-4030-b97b-64522930fdb2', '853b3ada-e882-409d-9e1d-0396f7e44d54', 'b7025633-f203-4245-9eea-5226b10435eb', 87.00, 5, '2023/2024', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('9eb4735e-54c2-465f-aaa9-e63b1c2b3086', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', 'a673d82d-edfe-4af3-87c8-2aba50773734', 'b7025633-f203-4245-9eea-5226b10435eb', 90.00, 5, '2023/2024', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('9ee6d0e8-4361-4af6-8f00-f002a610a6d4', '1686500a-3771-4460-996e-e76b3f343167', '83768506-9348-4558-98d6-81194b642108', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 92.00, 1, '2021/2022', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('a1d74967-b72b-4779-8ccf-f0fc306eed9a', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '83768506-9348-4558-98d6-81194b642108', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', NULL, '2025-11-23 12:17:23.713', '2025-11-24 08:51:03.587', NULL),
('a3a577c0-6786-4de5-9f4d-09ee968bb16a', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', 'a673d82d-edfe-4af3-87c8-2aba50773734', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', NULL, '2025-11-23 12:17:23.732', '2025-11-24 08:51:03.595', NULL),
('a59e02fa-de78-4de4-8d23-bb27a3102f11', '1686500a-3771-4460-996e-e76b3f343167', '7c10cd25-6132-4472-9839-156c74397c35', '7282a4e7-21ee-4813-8042-68c41b002fac', 94.00, 2, '2021/2022', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('a6d0c167-4e68-43fe-8531-ef02e5904026', '1686500a-3771-4460-996e-e76b3f343167', '7c10cd25-6132-4472-9839-156c74397c35', 'b7025633-f203-4245-9eea-5226b10435eb', 94.00, 5, '2023/2024', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('a9ef2db8-1426-4f60-8afa-7a96883e2445', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '83768506-9348-4558-98d6-81194b642108', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 85.00, 1, '2021/2022', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('ae8c018c-deb8-46db-b372-9f13d50bf6da', '768e6245-b69c-4030-b97b-64522930fdb2', 'a673d82d-edfe-4af3-87c8-2aba50773734', 'b7025633-f203-4245-9eea-5226b10435eb', 85.00, 5, '2023/2024', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('b35cdc65-5784-47b3-912f-c8c7be7c5bdc', '1686500a-3771-4460-996e-e76b3f343167', 'a673d82d-edfe-4af3-87c8-2aba50773734', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', NULL, '2025-11-23 12:17:23.283', '2025-11-24 08:51:03.723', NULL),
('b465dab9-4415-4e8b-b51e-99d55ef23be2', '768e6245-b69c-4030-b97b-64522930fdb2', 'c36c1d33-a830-4411-af58-f2fa62bca982', 'b7025633-f203-4245-9eea-5226b10435eb', 83.00, 5, '2023/2024', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('b68a9a61-b410-4c9d-b58d-848fed381fd2', '768e6245-b69c-4030-b97b-64522930fdb2', '83768506-9348-4558-98d6-81194b642108', '7282a4e7-21ee-4813-8042-68c41b002fac', 82.00, 2, '2021/2022', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('c885403b-c76f-4f7e-be7e-018ec06c33ed', '1686500a-3771-4460-996e-e76b3f343167', '853b3ada-e882-409d-9e1d-0396f7e44d54', '4b32baa4-b816-43aa-a48f-0003839cca81', 92.00, 4, '2022/2023', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', '95082c60-173d-42fd-8895-8b85f8bb5bf3'),
('cde9024f-3e45-42d6-ad6c-3dea7fafe150', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', 'a673d82d-edfe-4af3-87c8-2aba50773734', '4b32baa4-b816-43aa-a48f-0003839cca81', 87.00, 4, '2022/2023', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', '95082c60-173d-42fd-8895-8b85f8bb5bf3'),
('d347bc09-e02d-4ceb-9d45-f88b680940a3', '1686500a-3771-4460-996e-e76b3f343167', 'a673d82d-edfe-4af3-87c8-2aba50773734', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 90.00, 1, '2021/2022', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('d46f022d-d4d5-431a-89d8-d35d1d4ed38b', '1686500a-3771-4460-996e-e76b3f343167', '83768506-9348-4558-98d6-81194b642108', '7282a4e7-21ee-4813-8042-68c41b002fac', 95.00, 2, '2021/2022', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('d71671c6-f7c1-4874-b845-350c5b0b4830', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '7c10cd25-6132-4472-9839-156c74397c35', '7282a4e7-21ee-4813-8042-68c41b002fac', 100.00, 2, '2025/2026', NULL, '2025-11-23 13:00:02.699', '2025-11-23 15:30:56.702', NULL),
('e79ebfa6-3a63-49bc-94dd-8580f06ad0af', '1686500a-3771-4460-996e-e76b3f343167', 'a673d82d-edfe-4af3-87c8-2aba50773734', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 94.00, 3, '2022/2023', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', '95082c60-173d-42fd-8895-8b85f8bb5bf3'),
('ee99651f-d9f0-4a73-bde1-61535814c875', '768e6245-b69c-4030-b97b-64522930fdb2', 'c36c1d33-a830-4411-af58-f2fa62bca982', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:13.936', '2025-11-24 08:20:14.042', NULL),
('f6062be9-3811-4a9f-990d-a0be172ae1bf', '1686500a-3771-4460-996e-e76b3f343167', '853b3ada-e882-409d-9e1d-0396f7e44d54', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:13.427', '2025-11-24 08:20:13.730', NULL),
('f845f673-164a-4b4b-938f-c8a15a120ea7', '768e6245-b69c-4030-b97b-64522930fdb2', 'a673d82d-edfe-4af3-87c8-2aba50773734', '4b32baa4-b816-43aa-a48f-0003839cca81', 82.00, 4, '2022/2023', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', '95082c60-173d-42fd-8895-8b85f8bb5bf3'),
('fb10b63e-72f8-4884-a526-dd6a4eaf58c7', '768e6245-b69c-4030-b97b-64522930fdb2', '7c10cd25-6132-4472-9839-156c74397c35', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:13.942', '2025-11-24 08:20:14.050', NULL),
('ff751bef-3297-4b87-a6a6-69f867691dfc', '1686500a-3771-4460-996e-e76b3f343167', 'c36c1d33-a830-4411-af58-f2fa62bca982', '4b32baa4-b816-43aa-a48f-0003839cca81', 95.00, 4, '2022/2023', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', '95082c60-173d-42fd-8895-8b85f8bb5bf3'),
('ffc8420f-449f-4fb3-905d-1c742dbb0660', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '853b3ada-e882-409d-9e1d-0396f7e44d54', 'b7025633-f203-4245-9eea-5226b10435eb', 92.00, 5, '2023/2024', NULL, '2025-11-23 03:30:02.824', '2025-11-23 03:30:02.824', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e');

-- --------------------------------------------------------

--
-- Struktur dari tabel `nilai_cpmk`
--

CREATE TABLE `nilai_cpmk` (
  `id` varchar(191) NOT NULL,
  `mahasiswa_id` varchar(191) NOT NULL,
  `cpmk_id` varchar(191) NOT NULL,
  `mata_kuliah_id` varchar(191) NOT NULL,
  `nilai_akhir` decimal(5,2) NOT NULL,
  `semester` int(11) NOT NULL,
  `tahun_ajaran` varchar(191) NOT NULL,
  `is_calculated` tinyint(1) NOT NULL DEFAULT 1,
  `calculated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `nilai_cpmk`
--

INSERT INTO `nilai_cpmk` (`id`, `mahasiswa_id`, `cpmk_id`, `mata_kuliah_id`, `nilai_akhir`, `semester`, `tahun_ajaran`, `is_calculated`, `calculated_at`, `updated_at`) VALUES
('0ba32fea-1efb-4f01-ac2e-7e5a01ed8bbc', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', 'afaea075-7e33-43ee-a608-6927ad193bbd', '7282a4e7-21ee-4813-8042-68c41b002fac', 95.00, 2, '2025/2026', 1, '2025-11-23 15:49:42.137', '2025-11-23 15:49:42.137'),
('1c63543d-1295-4cd8-837e-0a50542c5333', '768e6245-b69c-4030-b97b-64522930fdb2', 'de03d4ce-3db4-4f60-8d7f-baba91e240de', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', 1, '2025-11-24 08:51:03.271', '2025-11-24 08:51:03.271'),
('20f5e722-db59-48d3-844d-cea7c0416546', '1686500a-3771-4460-996e-e76b3f343167', '3a64c12c-0e00-4c84-a35b-b1b8382d34ea', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', 1, '2025-11-24 08:20:13.560', '2025-11-24 08:20:13.560'),
('2247f631-3737-43a0-bd13-23f872d270cd', '1686500a-3771-4460-996e-e76b3f343167', 'dddf6332-753c-4f3c-86d7-b2539461294b', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', 1, '2025-11-24 08:51:03.706', '2025-11-24 08:51:03.706'),
('3328c4f0-0fa8-4008-89a5-2669f6bb915e', '1686500a-3771-4460-996e-e76b3f343167', 'de03d4ce-3db4-4f60-8d7f-baba91e240de', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', 1, '2025-11-24 08:51:03.356', '2025-11-24 08:51:03.356'),
('357431c3-891d-44ef-aa87-d931dcf4d672', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', 'dddf6332-753c-4f3c-86d7-b2539461294b', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', 1, '2025-11-24 08:51:03.576', '2025-11-24 08:51:03.576'),
('47ce12ce-2cd3-45a0-bc4a-e5fad6d78e0c', '1686500a-3771-4460-996e-e76b3f343167', '4238662f-8818-4d1c-85a8-a90b92a509df', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', 1, '2025-11-24 08:20:13.719', '2025-11-24 08:20:13.719'),
('47cefd12-6cc9-4d69-99ab-09aa1bcad71a', '1686500a-3771-4460-996e-e76b3f343167', 'afaea075-7e33-43ee-a608-6927ad193bbd', '7282a4e7-21ee-4813-8042-68c41b002fac', 50.00, 1, '2025/2026', 1, '2025-11-24 08:03:15.878', '2025-11-24 08:03:15.878'),
('583c33ac-a385-4c54-9978-0d8f27d23bc5', '1686500a-3771-4460-996e-e76b3f343167', '3a855135-ecf1-43f2-ad49-f857288a7fb4', '7282a4e7-21ee-4813-8042-68c41b002fac', 60.00, 1, '2025/2026', 1, '2025-11-24 08:03:15.913', '2025-11-24 08:03:15.913'),
('5a5bb03c-b6eb-4dc3-b37e-bdae4c5d5d96', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '3a855135-ecf1-43f2-ad49-f857288a7fb4', '7282a4e7-21ee-4813-8042-68c41b002fac', 80.00, 2, '2025/2026', 1, '2025-11-23 15:49:42.067', '2025-11-23 15:49:42.067'),
('633ce9ec-5cc0-4ccd-8b08-6e84992e3f21', '1686500a-3771-4460-996e-e76b3f343167', 'afaea075-7e33-43ee-a608-6927ad193bbd', '7282a4e7-21ee-4813-8042-68c41b002fac', 100.00, 2, '2025/2026', 1, '2025-11-23 15:49:42.180', '2025-11-23 15:49:42.180'),
('6bbc57a8-b172-406d-8faf-55668ea8bd23', '768e6245-b69c-4030-b97b-64522930fdb2', '3a64c12c-0e00-4c84-a35b-b1b8382d34ea', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', 1, '2025-11-24 08:20:13.865', '2025-11-24 08:20:13.865'),
('6cb49132-8c79-4e52-893c-f8813f7963a3', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '3a64c12c-0e00-4c84-a35b-b1b8382d34ea', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', 1, '2025-11-24 08:20:14.153', '2025-11-24 08:20:14.153'),
('8b732e52-74df-44c5-a55a-3633234e2886', '768e6245-b69c-4030-b97b-64522930fdb2', '4238662f-8818-4d1c-85a8-a90b92a509df', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', 1, '2025-11-24 08:20:14.018', '2025-11-24 08:20:14.018'),
('942e1375-f5c2-4086-977b-70f595bb8ba6', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '4238662f-8818-4d1c-85a8-a90b92a509df', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', 1, '2025-11-24 08:20:14.303', '2025-11-24 08:20:14.303'),
('ab576d24-fb3f-458b-a0df-e49d1496e78b', '768e6245-b69c-4030-b97b-64522930fdb2', '3a855135-ecf1-43f2-ad49-f857288a7fb4', '7282a4e7-21ee-4813-8042-68c41b002fac', 90.00, 2, '2025/2026', 1, '2025-11-23 15:49:42.092', '2025-11-23 15:49:42.092'),
('ac8d04af-5d2e-4896-a537-a9c764fede44', '768e6245-b69c-4030-b97b-64522930fdb2', 'afaea075-7e33-43ee-a608-6927ad193bbd', '7282a4e7-21ee-4813-8042-68c41b002fac', 60.00, 2, '2025/2026', 1, '2025-11-23 15:49:42.159', '2025-11-23 15:49:42.159'),
('cb0fd392-6ec1-4513-9b03-8c7a47ee6482', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', 'de03d4ce-3db4-4f60-8d7f-baba91e240de', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', 1, '2025-11-24 08:51:03.310', '2025-11-24 08:51:03.310'),
('f57e5651-e47e-421b-9743-08e8b55e0099', '768e6245-b69c-4030-b97b-64522930fdb2', 'dddf6332-753c-4f3c-86d7-b2539461294b', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', 1, '2025-11-24 08:51:03.619', '2025-11-24 08:51:03.619');

-- --------------------------------------------------------

--
-- Struktur dari tabel `nilai_teknik_penilaian`
--

CREATE TABLE `nilai_teknik_penilaian` (
  `id` varchar(191) NOT NULL,
  `mahasiswa_id` varchar(191) NOT NULL,
  `teknik_penilaian_id` varchar(191) NOT NULL,
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
-- Dumping data untuk tabel `nilai_teknik_penilaian`
--

INSERT INTO `nilai_teknik_penilaian` (`id`, `mahasiswa_id`, `teknik_penilaian_id`, `mata_kuliah_id`, `nilai`, `semester`, `tahun_ajaran`, `catatan`, `created_at`, `updated_at`, `created_by`) VALUES
('07c5dfc2-0a33-4295-8348-461fa196c6ad', '1686500a-3771-4460-996e-e76b3f343167', '6267b890-236c-4a73-8f8c-a62b4a050dd7', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:13.641', '2025-11-24 08:20:13.641', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('15f2071a-e301-42cb-b0a9-c7678f54a571', '768e6245-b69c-4030-b97b-64522930fdb2', '6267b890-236c-4a73-8f8c-a62b4a050dd7', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:13.952', '2025-11-24 08:20:13.952', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('16c97bdc-4525-4ace-946c-47cbab48dd05', '1686500a-3771-4460-996e-e76b3f343167', '81456a61-00a9-4a71-b16d-1fef91bfe97b', '7282a4e7-21ee-4813-8042-68c41b002fac', 50.00, 1, '2025/2026', NULL, '2025-11-23 11:10:42.195', '2025-11-24 08:03:15.863', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('1d7cd9d7-3c47-4040-a58e-79f58bad3ffa', '768e6245-b69c-4030-b97b-64522930fdb2', '16347181-6a43-449e-8571-c472f5b983f0', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:13.898', '2025-11-24 08:20:13.898', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('232dd425-e127-4f62-8801-d9180f959933', '1686500a-3771-4460-996e-e76b3f343167', '2c049623-1e8a-4738-aa61-0cd8564eab41', '7282a4e7-21ee-4813-8042-68c41b002fac', 100.00, 2, '2025/2026', NULL, '2025-11-23 13:00:02.300', '2025-11-23 15:48:50.461', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('285b71c0-dfdf-4096-8d99-d0044e6f70e4', '768e6245-b69c-4030-b97b-64522930fdb2', 'f0b00f3f-788e-44f8-8d07-ffc932f96e59', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:13.851', '2025-11-24 08:20:13.851', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('2cfe1189-e4dc-4266-912c-4f1d736050c0', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '6267b890-236c-4a73-8f8c-a62b4a050dd7', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:14.238', '2025-11-24 08:20:14.238', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('3963a801-f411-4a6f-b4ca-0d41c36a19b8', '1686500a-3771-4460-996e-e76b3f343167', '9ecc9c4f-231c-434c-bd3a-bcbe0564eb03', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:13.453', '2025-11-24 08:20:13.453', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('3f45180d-e1b5-446f-9c73-cd6c53e1ffd7', '768e6245-b69c-4030-b97b-64522930fdb2', '05ab54d6-97ee-4e63-9930-927ece62396c', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', NULL, '2025-11-23 12:17:23.475', '2025-11-24 08:51:03.082', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('49affcac-e8eb-4caf-b1fb-946e9e4ad582', '768e6245-b69c-4030-b97b-64522930fdb2', '8ed74ef3-5af3-4c24-895d-e6f0e8595ef2', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', NULL, '2025-11-23 12:17:23.598', '2025-11-24 08:51:03.130', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('4bcd9292-7d81-4deb-ab5d-b0f31a1c93e2', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '16347181-6a43-449e-8571-c472f5b983f0', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:14.184', '2025-11-24 08:20:14.184', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('52c47162-334c-4812-874f-7edcc6eb55df', '1686500a-3771-4460-996e-e76b3f343167', '9c73030d-f2dd-4bfc-9228-e1d033fd9d51', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', NULL, '2025-11-23 12:17:23.432', '2025-11-24 08:51:03.175', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('5a99a34a-681b-4551-85c9-17361e6b3d4e', '768e6245-b69c-4030-b97b-64522930fdb2', '2c049623-1e8a-4738-aa61-0cd8564eab41', '7282a4e7-21ee-4813-8042-68c41b002fac', 50.00, 2, '2025/2026', NULL, '2025-11-23 13:00:02.561', '2025-11-23 15:49:42.032', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('5c871371-aa38-4615-ab5c-024d249b585a', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '2c049623-1e8a-4738-aa61-0cd8564eab41', '7282a4e7-21ee-4813-8042-68c41b002fac', 100.00, 2, '2025/2026', NULL, '2025-11-23 13:00:02.793', '2025-11-23 15:49:41.991', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('6c37c7de-a853-4775-9dd7-ecfccd4dbde6', '768e6245-b69c-4030-b97b-64522930fdb2', '0b324259-e36e-42b2-b24e-564a2ae376c0', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:13.764', '2025-11-24 08:20:13.764', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('6fb53533-a3da-44fc-91f8-47aa1d203c8f', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '8ed74ef3-5af3-4c24-895d-e6f0e8595ef2', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', NULL, '2025-11-23 12:17:23.836', '2025-11-24 08:51:03.219', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('74d4da2a-4f59-48b6-ba9b-543ab3019761', '768e6245-b69c-4030-b97b-64522930fdb2', '9c73030d-f2dd-4bfc-9228-e1d033fd9d51', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', NULL, '2025-11-23 12:17:23.651', '2025-11-24 08:51:03.259', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('80cc5c64-9420-4f90-b316-c42d3d8dd125', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', 'f0b00f3f-788e-44f8-8d07-ffc932f96e59', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:14.140', '2025-11-24 08:20:14.140', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('8197e709-8b56-45a3-b213-a5be83b92a79', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '9c73030d-f2dd-4bfc-9228-e1d033fd9d51', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', NULL, '2025-11-23 12:17:23.876', '2025-11-24 08:51:03.298', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('85e741f0-36af-49a4-a39a-50b8d80f4741', '1686500a-3771-4460-996e-e76b3f343167', '8ed74ef3-5af3-4c24-895d-e6f0e8595ef2', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', NULL, '2025-11-23 12:17:23.387', '2025-11-24 08:51:03.340', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('8db82b9d-9853-4e51-8ddd-61b172e168ef', '768e6245-b69c-4030-b97b-64522930fdb2', 'd1e40505-9d41-432a-b834-8337e22847d3', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', NULL, '2025-11-23 12:17:23.558', '2025-11-24 08:51:03.381', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('90a33d6d-08e3-4601-9a8d-06721db1b9ef', '1686500a-3771-4460-996e-e76b3f343167', '81456a61-00a9-4a71-b16d-1fef91bfe97b', '7282a4e7-21ee-4813-8042-68c41b002fac', 100.00, 2, '2025/2026', NULL, '2025-11-23 13:00:02.354', '2025-11-23 15:48:50.588', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('90bd90e9-4402-4d66-a22b-2398fa13ab2d', '768e6245-b69c-4030-b97b-64522930fdb2', '6d414d18-f27a-4e1a-98bb-db0d5b4252ad', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:14.007', '2025-11-24 08:20:14.007', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('939dae73-c68d-40e5-94d4-e2deb6d16900', '1686500a-3771-4460-996e-e76b3f343167', '05ab54d6-97ee-4e63-9930-927ece62396c', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', NULL, '2025-11-23 12:17:23.215', '2025-11-24 08:51:03.690', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('93dfec9e-7019-44d0-84ad-7b5cc30252a3', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '2661a785-bc55-4a99-8769-af752e71fbb6', '7282a4e7-21ee-4813-8042-68c41b002fac', 80.00, 2, '2025/2026', NULL, '2025-11-23 15:49:42.014', '2025-11-23 15:49:42.014', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('9421dd85-8b44-4ecf-9831-f545dec3a43f', '768e6245-b69c-4030-b97b-64522930fdb2', '81456a61-00a9-4a71-b16d-1fef91bfe97b', '7282a4e7-21ee-4813-8042-68c41b002fac', 70.00, 2, '2025/2026', NULL, '2025-11-23 13:00:02.614', '2025-11-23 15:49:42.042', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('95044d10-55a4-489b-9098-b3377cc6940a', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '6d414d18-f27a-4e1a-98bb-db0d5b4252ad', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:14.291', '2025-11-24 08:20:14.291', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('97d15993-6b59-4287-863b-d1ff6e8792fb', '1686500a-3771-4460-996e-e76b3f343167', 'd1e40505-9d41-432a-b834-8337e22847d3', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', NULL, '2025-11-23 12:17:23.340', '2025-11-24 08:51:03.428', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('99d9aec6-ab31-4d89-afdf-044255a8a9f7', '768e6245-b69c-4030-b97b-64522930fdb2', '9ecc9c4f-231c-434c-bd3a-bcbe0564eb03', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:13.805', '2025-11-24 08:20:13.805', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('9c5e0888-cee1-4d0b-989a-b4ec44fe9c01', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '05ab54d6-97ee-4e63-9930-927ece62396c', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', NULL, '2025-11-23 12:17:23.690', '2025-11-24 08:51:03.474', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('a262ecd4-589b-4a26-8056-13ecfbcbcf42', '1686500a-3771-4460-996e-e76b3f343167', '2c049623-1e8a-4738-aa61-0cd8564eab41', '7282a4e7-21ee-4813-8042-68c41b002fac', 50.00, 1, '2025/2026', NULL, '2025-11-23 11:10:42.144', '2025-11-24 08:03:15.812', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('a54ca5d2-16e9-45a2-82ec-80fb966315b4', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', 'd1e40505-9d41-432a-b834-8337e22847d3', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', NULL, '2025-11-23 12:17:23.791', '2025-11-24 08:51:03.521', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('a55d4fe7-cc02-4e7d-af5f-99cadc962821', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', 'a3b7dac1-2982-4289-bd4a-3408838a37cc', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', NULL, '2025-11-23 12:17:23.742', '2025-11-24 08:51:03.562', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('a7eb9dd2-e32b-4880-afa7-9d7a70138d3f', '768e6245-b69c-4030-b97b-64522930fdb2', 'a3b7dac1-2982-4289-bd4a-3408838a37cc', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', NULL, '2025-11-23 12:17:23.516', '2025-11-24 08:51:03.605', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('bd0ad3c4-85bb-44fe-bd23-9b0fee5156bb', '768e6245-b69c-4030-b97b-64522930fdb2', '2661a785-bc55-4a99-8769-af752e71fbb6', '7282a4e7-21ee-4813-8042-68c41b002fac', 90.00, 2, '2025/2026', NULL, '2025-11-23 15:49:42.052', '2025-11-23 15:49:42.052', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('c4c8dc3b-386e-47d3-bd5e-c6e7b1ad652f', '1686500a-3771-4460-996e-e76b3f343167', '0b324259-e36e-42b2-b24e-564a2ae376c0', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:13.379', '2025-11-24 08:20:13.379', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('c7628ba7-c846-4d98-b152-13bca1dd542d', '1686500a-3771-4460-996e-e76b3f343167', 'a3b7dac1-2982-4289-bd4a-3408838a37cc', '59a36bc1-9bbf-4ed1-baff-df768d0fe0ce', 100.00, 1, '2025/2026', NULL, '2025-11-23 12:17:23.292', '2025-11-24 08:51:03.648', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('c844e70a-b874-4adb-bc5f-837307ed5be5', '1686500a-3771-4460-996e-e76b3f343167', '6d414d18-f27a-4e1a-98bb-db0d5b4252ad', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:13.707', '2025-11-24 08:20:13.707', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('cc2d5f4a-50eb-4877-ae99-cabc3cb15052', '1686500a-3771-4460-996e-e76b3f343167', '16347181-6a43-449e-8571-c472f5b983f0', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:13.589', '2025-11-24 08:20:13.589', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('cd5ed293-11f1-468e-9574-82d371690bb3', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '0b324259-e36e-42b2-b24e-564a2ae376c0', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:14.060', '2025-11-24 08:20:14.060', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('db819ccd-938a-46b0-bbee-b7e15c638032', '1686500a-3771-4460-996e-e76b3f343167', '2661a785-bc55-4a99-8769-af752e71fbb6', '7282a4e7-21ee-4813-8042-68c41b002fac', 60.00, 1, '2025/2026', NULL, '2025-11-23 15:33:18.744', '2025-11-24 08:03:15.898', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('e109b273-22f3-477f-8c8a-e5186c422056', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '81456a61-00a9-4a71-b16d-1fef91bfe97b', '7282a4e7-21ee-4813-8042-68c41b002fac', 90.00, 2, '2025/2026', NULL, '2025-11-23 13:00:02.845', '2025-11-23 15:49:42.003', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('f3a7c33e-1409-4c15-b1d6-34cc447c8d87', '1686500a-3771-4460-996e-e76b3f343167', 'f0b00f3f-788e-44f8-8d07-ffc932f96e59', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:13.546', '2025-11-24 08:20:13.546', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e'),
('fa2f5c64-dbeb-4d1f-ba4d-adae794df546', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', '9ecc9c4f-231c-434c-bd3a-bcbe0564eb03', '48a537fb-d91c-4ac3-9c69-07c47e60b73b', 10.00, 1, '2025/2026', NULL, '2025-11-24 08:20:14.098', '2025-11-24 08:20:14.098', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e');

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
  `updated_at` datetime(3) NOT NULL,
  `nidn` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `profiles`
--

INSERT INTO `profiles` (`id`, `user_id`, `nama_lengkap`, `nim`, `nip`, `program_studi`, `semester`, `tahun_masuk`, `alamat`, `no_telepon`, `foto_profile`, `created_at`, `updated_at`, `nidn`) VALUES
('1acaafc7-c75f-4739-ab68-52d30bc131ad', '3a0dcc3b-176d-42a8-ba96-206c16a53e89', 'Ahmad Rizki Wijaya', NULL, '21321344234', 'Fakultas Keguruan dan Ilmu Pendidikan (FKIP) - Pendidikan Guru SD (PGSD)', 5, NULL, NULL, NULL, NULL, '2025-11-23 03:30:02.745', '2025-11-25 00:35:19.780', NULL),
('23f27700-b75a-422e-9839-b32c16505f0c', '768e6245-b69c-4030-b97b-64522930fdb2', 'Siti Nurhaliza', '2101010002', NULL, 'Fakultas Keagamaan Islam (FKI) - Komunikasi dan Penyiaran Islam (KPI)', 5, NULL, NULL, NULL, NULL, '2025-11-23 03:30:02.754', '2025-11-25 00:35:05.379', NULL),
('6bfcbed7-257f-4b6a-a0c6-1fa3cc76524e', '95082c60-173d-42fd-8895-8b85f8bb5bf3', 'Dr. Siti Aisyah, M.T', NULL, '198802020002', 'Teknik Informatika', NULL, NULL, NULL, NULL, NULL, '2025-11-23 03:30:02.738', '2025-11-23 03:30:02.738', NULL),
('8bb289f8-7fce-42c2-b324-c5db0db63641', '31cd7c6f-12f9-45a3-87ee-5249a83d4555', 'Fajrul tok', '22EO10027', NULL, 'Fakultas Matematika dan Komputer (FMIKOM) - Informatika', 7, NULL, NULL, NULL, NULL, '2025-11-23 11:01:16.119', '2025-11-25 00:34:31.498', NULL),
('90fc5e6d-e223-4c84-9306-0f210013dbd3', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e', 'Dr. Budi Santoso, M.Kom', NULL, '198801010001', 'Teknik Informatika', NULL, NULL, NULL, NULL, NULL, '2025-11-23 03:30:02.727', '2025-11-23 03:30:02.727', NULL),
('b09ff4b3-b841-475d-8312-67dd978f46f7', '1686500a-3771-4460-996e-e76b3f343167', 'Budi Hartono', '2101010003', NULL, 'Fakultas Teknologi Industri (FTI) - Teknik Kimia', 5, NULL, NULL, NULL, NULL, '2025-11-23 03:30:02.760', '2025-11-25 00:34:57.794', NULL),
('ec920248-467f-4d83-8ca0-7df7ced52a16', 'f863e327-d469-404b-8741-941bbe26b2ff', 'Administrator System', NULL, '198800000001', NULL, NULL, NULL, 'Jl. Administrasi No. 1, Jakarta', '081234567890', NULL, '2025-11-23 03:30:02.707', '2025-11-23 03:30:02.707', NULL);

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
('1bc9d3bd-1170-4c3d-8232-c66cb1506294', '31cd7c6f-12f9-45a3-87ee-5249a83d4555', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMWNkN2M2Zi0xMmY5LTQ1YTMtODdlZS01MjQ5YTgzZDQ1NTUiLCJlbWFpbCI6ImtvbmdndWFuNDBAZ21haWwuY29tIiwicm9sZSI6ImthcHJvZGkiLCJpYXQiOjE3NjM5NzQ1NDQsIm', '2025-12-01 08:55:44.277', '2025-11-24 08:55:44.278', NULL, NULL),
('55618480-a6c9-4314-a16c-17c7988e6dc2', 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmZjU2ZjcyNC1jNmE1LTQ0MzgtOGFiMi01ZDA0ZmJkZTNjN2UiLCJlbWFpbCI6ImRvc2VuMUBzaXN0ZW0tY3BsLmFjLmlkIiwicm9sZSI6ImRvc2VuIiwiaWF0IjoxNzY0MDMzMTcxLC', '2025-12-02 01:12:51.451', '2025-11-25 01:12:51.454', NULL, NULL),
('6cfda01a-41be-44f1-a554-2e6948f0135a', '31cd7c6f-12f9-45a3-87ee-5249a83d4555', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMWNkN2M2Zi0xMmY5LTQ1YTMtODdlZS01MjQ5YTgzZDQ1NTUiLCJlbWFpbCI6ImtvbmdndWFuNDBAZ21haWwuY29tIiwicm9sZSI6ImthcHJvZGkiLCJpYXQiOjE3NjM5MDA2OTcsIm', '2025-11-30 12:24:57.890', '2025-11-23 12:24:57.892', NULL, NULL),
('753d9094-5df3-49a4-8141-f1d4912a3099', 'f863e327-d469-404b-8741-941bbe26b2ff', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmODYzZTMyNy1kNDY5LTQwNGItODc0MS05NDFiYmUyNmIyZmYiLCJlbWFpbCI6ImFkbWluQHNpc3RlbS1jcGwuYWMuaWQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjQwMDUwODYsIm', '2025-12-01 17:24:46.017', '2025-11-24 17:24:46.019', NULL, NULL),
('c8a6e2f8-75f6-473a-95da-9b24dfd423dc', '31cd7c6f-12f9-45a3-87ee-5249a83d4555', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMWNkN2M2Zi0xMmY5LTQ1YTMtODdlZS01MjQ5YTgzZDQ1NTUiLCJlbWFpbCI6ImtvbmdndWFuNDBAZ21haWwuY29tIiwicm9sZSI6ImthcHJvZGkiLCJpYXQiOjE3NjM4OTU4NDQsIm', '2025-11-30 11:04:04.980', '2025-11-23 11:04:04.984', NULL, NULL),
('f73aa100-3700-468a-ab1c-def8f773ad0a', '31cd7c6f-12f9-45a3-87ee-5249a83d4555', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMWNkN2M2Zi0xMmY5LTQ1YTMtODdlZS01MjQ5YTgzZDQ1NTUiLCJlbWFpbCI6ImtvbmdndWFuNDBAZ21haWwuY29tIiwicm9sZSI6Im1haGFzaXN3YSIsImlhdCI6MTc2Mzg5NTY4My', '2025-11-30 11:01:23.160', '2025-11-23 11:01:23.164', NULL, NULL),
('ffaa8e12-91cb-46d9-bb11-a2df152719e6', '1686500a-3771-4460-996e-e76b3f343167', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNjg2NTAwYS0zNzcxLTQ0NjAtOTk2ZS1lNzZiM2YzNDMxNjciLCJlbWFpbCI6Im1haGFzaXN3YTNAc2lzdGVtLWNwbC5hYy5pZCIsInJvbGUiOiJtYWhhc2lzd2EiLCJpYXQiOjE3Nj', '2025-12-01 09:50:48.867', '2025-11-24 09:50:48.869', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `settings`
--

CREATE TABLE `settings` (
  `id` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` text NOT NULL,
  `description` text DEFAULT NULL,
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `settings`
--

INSERT INTO `settings` (`id`, `key`, `value`, `description`, `updated_at`) VALUES
('11e26c51-44db-4498-99db-ef841a126fb0', 'col2SepX', '155', NULL, '2025-11-24 14:16:19.868'),
('16f727b1-0e3c-4b71-a6e6-f828ed2750e4', 'kaprodiName', 'Safiq Rosad, S.T., M. Kom ', NULL, '2025-11-24 14:16:19.868'),
('1b45c2d6-5acd-4bca-8cfe-6f321596b7f5', 'footerFontSize', '10', NULL, '2025-11-24 14:16:19.868'),
('1d4c8189-01a3-4d1c-a2b8-427d6d61e7ce', 'col2LabelX', '120', NULL, '2025-11-24 14:16:19.868'),
('1f7416eb-cdd8-44cd-821c-43e96a36d20a', 'marginLeft', '14.3', NULL, '2025-11-24 14:16:19.868'),
('2db5f78d-73ad-485a-929d-71679c3c7578', 'col1LabelX', '20', NULL, '2025-11-24 14:16:19.868'),
('462778bc-5df6-45bb-9da0-4361e9881b8a', 'summaryFontSize', '10', NULL, '2025-11-24 14:16:19.868'),
('4a00fd59-54dd-441a-97d0-62305ed26e3c', 'titleFontSize', '14', NULL, '2025-11-24 14:16:19.868'),
('5b2ede5b-9029-4460-b56d-9b713ab0bbfb', 'headerCenterX', '115.1', NULL, '2025-11-24 14:16:19.868'),
('699b1bc0-d525-408e-b601-036e4b99f90d', 'signatureTop', '20', NULL, '2025-11-24 14:16:19.868'),
('6db42d93-d24f-412d-af52-fe1df2d379b8', 'col1SepX', '55', NULL, '2025-11-24 14:16:19.868'),
('7171891b-7df6-409b-aafe-f0a9f7117ae7', 'kaprodiNip', 'NIDN. 0609018101', NULL, '2025-11-24 14:16:19.868'),
('7c5e074f-1a57-4433-b5b8-b8485d4ff0ec', 'headerWidth', '150', NULL, '2025-11-24 14:16:19.868'),
('819aa8e3-b6f4-4b8f-9864-c22bd1392c58', 'col2ValX', '158', NULL, '2025-11-24 14:16:19.868'),
('84bad330-2a28-4316-90f5-f3a62efa5aae', 'univContact', 'Website : www.unugha.ac.id / e-Mail : kita@unugha.ac.id / Telepon : 0282 695415', NULL, '2025-11-24 14:16:19.868'),
('89c88e4d-3854-4bc1-a989-434a97c4644d', 'headerTop', '17.6', NULL, '2025-11-24 14:16:19.868'),
('8cfc1cf9-0eee-40de-96dd-08d2ddd15f7a', 'studentInfoTop', '68.1', NULL, '2025-11-24 14:16:19.868'),
('92cc9aa2-98e6-4b11-b56d-9e6bfc13974d', 'footerTop', '240', NULL, '2025-11-24 14:16:19.868'),
('9599594b-e238-4be6-b23b-5dfd32953943', 'logoTop', '11.8', NULL, '2025-11-24 14:16:19.868'),
('9af4908f-e172-428d-b830-cfae1fed9a99', 'logoUrl', '/logo.png', NULL, '2025-11-24 14:16:19.868'),
('9d3608ce-e417-4bb2-92b2-c095c7e9d18b', 'titleX', '106.3', NULL, '2025-11-24 14:16:19.868'),
('a7554dff-a838-4efc-b7c8-dd14f760fe8f', 'studentInfoFontSize', '10', NULL, '2025-11-24 14:16:19.868'),
('a98ab57a-8600-4fe6-90c6-8bbdff8b1089', 'headerFontSize', '14', NULL, '2025-11-24 14:16:19.868'),
('ad8a7309-b8af-4d6d-bf68-61f7d0abc7a8', 'summaryTop', '200', NULL, '2025-11-24 14:16:19.868'),
('b0706c95-5fd7-4022-a37b-42d4acc12167', 'logoWidth', '25', NULL, '2025-11-24 14:16:19.868'),
('b12b5649-9762-4ea7-b315-2d21022d7e0f', 'univAddress', 'Jl. Kemerdekaan Barat No.17 Kesugihan Kidul, Kec. Kesugihan, Kabupaten Cilacap, Jawa Tengah 53274', NULL, '2025-11-24 14:16:19.868'),
('d9547fc8-0e91-4453-8710-0557446c28bb', 'col1ValX', '58', NULL, '2025-11-24 14:16:19.868'),
('fcf0056b-9ff1-440d-a7b9-b7efb7e4f116', 'titleTop', '44.5', NULL, '2025-11-24 14:16:19.868'),
('fd384b51-7f00-4760-931a-3b98f20cd1c4', 'univName', 'UNIVERSITAS NAHDLATUL ULAMA AL GHAZALI CILACAP', NULL, '2025-11-24 14:16:19.868');

-- --------------------------------------------------------

--
-- Struktur dari tabel `teknik_penilaian`
--

CREATE TABLE `teknik_penilaian` (
  `id` varchar(191) NOT NULL,
  `cpmk_id` varchar(191) NOT NULL,
  `nama_teknik` varchar(191) NOT NULL,
  `bobot_persentase` decimal(5,2) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `teknik_penilaian`
--

INSERT INTO `teknik_penilaian` (`id`, `cpmk_id`, `nama_teknik`, `bobot_persentase`, `deskripsi`, `created_at`, `updated_at`) VALUES
('05ab54d6-97ee-4e63-9930-927ece62396c', 'dddf6332-753c-4f3c-86d7-b2539461294b', 'Observasi', 30.00, 'Observasi praktikum', '2025-11-23 03:30:02.875', '2025-11-23 03:30:02.875'),
('0b324259-e36e-42b2-b24e-564a2ae376c0', '3a64c12c-0e00-4c84-a35b-b1b8382d34ea', 'Presentasi', 20.00, 'Presentasi rancangan ERD', '2025-11-23 03:30:02.875', '2025-11-23 03:30:02.875'),
('16347181-6a43-449e-8571-c472f5b983f0', '4238662f-8818-4d1c-85a8-a90b92a509df', 'Praktikum', 60.00, 'Query SQL kompleks', '2025-11-23 03:30:02.875', '2025-11-23 03:30:02.875'),
('2661a785-bc55-4a99-8769-af752e71fbb6', '3a855135-ecf1-43f2-ad49-f857288a7fb4', 'Unjuk kerja', 100.00, NULL, '2025-11-23 15:31:34.486', '2025-11-23 15:31:34.486'),
('283fef7c-2f57-4b8b-92d5-700e8daf0bca', '37241bb6-3b20-454d-b93d-bd7d4a63ae5b', 'Unjuk kerja', 100.00, NULL, '2025-11-24 07:57:08.133', '2025-11-24 08:11:32.420'),
('2c049623-1e8a-4738-aa61-0cd8564eab41', 'afaea075-7e33-43ee-a608-6927ad193bbd', 'Tes tertulis', 50.00, 'Implementasi struktur data', '2025-11-23 03:30:02.875', '2025-11-23 15:18:24.370'),
('6267b890-236c-4a73-8f8c-a62b4a050dd7', '4238662f-8818-4d1c-85a8-a90b92a509df', 'Kuis', 20.00, 'Kuis mingguan SQL', '2025-11-23 03:30:02.875', '2025-11-23 03:30:02.875'),
('6d414d18-f27a-4e1a-98bb-db0d5b4252ad', '4238662f-8818-4d1c-85a8-a90b92a509df', 'Tes tertulis', 20.00, 'Ujian akhir SQL', '2025-11-23 03:30:02.875', '2025-11-23 03:30:02.875'),
('81456a61-00a9-4a71-b16d-1fef91bfe97b', 'afaea075-7e33-43ee-a608-6927ad193bbd', 'Observasi', 50.00, 'Ujian akhir', '2025-11-23 03:30:02.875', '2025-11-23 15:18:37.224'),
('8ed74ef3-5af3-4c24-895d-e6f0e8595ef2', 'de03d4ce-3db4-4f60-8d7f-baba91e240de', 'Tes tertulis', 40.00, 'Ujian akhir semester', '2025-11-23 03:30:02.875', '2025-11-23 03:30:02.875'),
('9c73030d-f2dd-4bfc-9228-e1d033fd9d51', 'de03d4ce-3db4-4f60-8d7f-baba91e240de', 'Unjuk kerja', 60.00, 'Project akhir pemrograman', '2025-11-23 03:30:02.875', '2025-11-23 03:30:02.875'),
('9ecc9c4f-231c-434c-bd3a-bcbe0564eb03', '3a64c12c-0e00-4c84-a35b-b1b8382d34ea', 'Tes tertulis', 30.00, 'Ujian normalisasi database', '2025-11-23 03:30:02.875', '2025-11-23 03:30:02.875'),
('a1ff77ee-c03c-43b6-b3b2-bfb0058b8f80', '52d1e4e5-ec6b-4ecb-b123-fd82b720533a', 'Unjuk kerja', 100.00, NULL, '2025-11-23 15:29:35.395', '2025-11-23 15:29:35.395'),
('a3b7dac1-2982-4289-bd4a-3408838a37cc', 'dddf6332-753c-4f3c-86d7-b2539461294b', 'Tes tertulis', 50.00, 'Ujian tengah semester', '2025-11-23 03:30:02.875', '2025-11-23 03:30:02.875'),
('d1e40505-9d41-432a-b834-8337e22847d3', 'dddf6332-753c-4f3c-86d7-b2539461294b', 'Tugas', 20.00, 'Tugas mingguan', '2025-11-23 03:30:02.875', '2025-11-23 03:30:02.875'),
('f0b00f3f-788e-44f8-8d07-ffc932f96e59', '3a64c12c-0e00-4c84-a35b-b1b8382d34ea', 'Project', 50.00, 'Desain database untuk kasus nyata', '2025-11-23 03:30:02.875', '2025-11-23 03:30:02.875');

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
('1686500a-3771-4460-996e-e76b3f343167', 'mahasiswa3@sistem-cpl.ac.id', '$2a$10$Bg/yQ8SgD0N8DKtt43rOzesfF1eh3TqB4SDJ.ZmWGY1V8Bii9i1LW', '2025-11-23 03:30:02.760', '2025-11-23 03:30:02.760', NULL, 1, 1),
('31cd7c6f-12f9-45a3-87ee-5249a83d4555', 'kongguan40@gmail.com', '$2a$10$4u2mHc1k8d8zaKLTw/WCI.6fSAjWIJJS/f24LjCfGLba7LSp72fhG', '2025-11-23 11:01:16.119', '2025-11-23 11:01:16.119', NULL, 1, 1),
('3a0dcc3b-176d-42a8-ba96-206c16a53e89', 'mahasiswa1@sistem-cpl.ac.id', '$2a$10$Bg/yQ8SgD0N8DKtt43rOzesfF1eh3TqB4SDJ.ZmWGY1V8Bii9i1LW', '2025-11-23 03:30:02.745', '2025-11-23 03:30:02.745', NULL, 1, 1),
('768e6245-b69c-4030-b97b-64522930fdb2', 'mahasiswa2@sistem-cpl.ac.id', '$2a$10$Bg/yQ8SgD0N8DKtt43rOzesfF1eh3TqB4SDJ.ZmWGY1V8Bii9i1LW', '2025-11-23 03:30:02.754', '2025-11-23 03:30:02.754', NULL, 1, 1),
('95082c60-173d-42fd-8895-8b85f8bb5bf3', 'dosen2@sistem-cpl.ac.id', '$2a$10$Bg/yQ8SgD0N8DKtt43rOzesfF1eh3TqB4SDJ.ZmWGY1V8Bii9i1LW', '2025-11-23 03:30:02.738', '2025-11-23 03:30:02.738', NULL, 1, 1),
('f863e327-d469-404b-8741-941bbe26b2ff', 'admin@sistem-cpl.ac.id', '$2a$10$Bg/yQ8SgD0N8DKtt43rOzesfF1eh3TqB4SDJ.ZmWGY1V8Bii9i1LW', '2025-11-23 03:30:02.707', '2025-11-23 03:30:02.707', NULL, 1, 1),
('ff56f724-c6a5-4438-8ab2-5d04fbde3c7e', 'dosen1@sistem-cpl.ac.id', '$2a$10$Bg/yQ8SgD0N8DKtt43rOzesfF1eh3TqB4SDJ.ZmWGY1V8Bii9i1LW', '2025-11-23 03:30:02.727', '2025-11-23 03:30:02.727', NULL, 1, 1);

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_roles`
--

CREATE TABLE `user_roles` (
  `id` int(11) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `role` enum('admin','dosen','mahasiswa','kaprodi') NOT NULL DEFAULT 'mahasiswa',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `user_roles`
--

INSERT INTO `user_roles` (`id`, `user_id`, `role`, `created_at`, `updated_at`) VALUES
(1, 'f863e327-d469-404b-8741-941bbe26b2ff', 'admin', '2025-11-23 03:30:02.707', '2025-11-23 03:30:02.707'),
(2, 'ff56f724-c6a5-4438-8ab2-5d04fbde3c7e', 'dosen', '2025-11-23 03:30:02.727', '2025-11-23 03:30:02.727'),
(3, '95082c60-173d-42fd-8895-8b85f8bb5bf3', 'dosen', '2025-11-23 03:30:02.738', '2025-11-23 03:30:02.738'),
(4, '3a0dcc3b-176d-42a8-ba96-206c16a53e89', 'dosen', '2025-11-23 03:30:02.745', '2025-11-25 00:33:09.770'),
(5, '768e6245-b69c-4030-b97b-64522930fdb2', 'mahasiswa', '2025-11-23 03:30:02.754', '2025-11-23 03:30:02.754'),
(6, '1686500a-3771-4460-996e-e76b3f343167', 'mahasiswa', '2025-11-23 03:30:02.760', '2025-11-23 03:30:02.760'),
(7, '31cd7c6f-12f9-45a3-87ee-5249a83d4555', 'kaprodi', '2025-11-23 11:01:16.119', '2025-11-23 11:03:53.398');

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
-- Indeks untuk tabel `cpmk`
--
ALTER TABLE `cpmk`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cpmk_mata_kuliah_id_idx` (`mata_kuliah_id`),
  ADD KEY `cpmk_kode_cpmk_idx` (`kode_cpmk`),
  ADD KEY `cpmk_is_active_idx` (`is_active`),
  ADD KEY `cpmk_created_by_fkey` (`created_by`),
  ADD KEY `cpmk_status_validasi_idx` (`status_validasi`);

--
-- Indeks untuk tabel `cpmk_cpl_mapping`
--
ALTER TABLE `cpmk_cpl_mapping`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cpmk_cpl_mapping_cpmk_id_cpl_id_key` (`cpmk_id`,`cpl_id`),
  ADD KEY `cpmk_cpl_mapping_cpmk_id_idx` (`cpmk_id`),
  ADD KEY `cpmk_cpl_mapping_cpl_id_idx` (`cpl_id`);

--
-- Indeks untuk tabel `kaprodi_data`
--
ALTER TABLE `kaprodi_data`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kaprodi_data_program_studi_key` (`program_studi`),
  ADD KEY `kaprodi_data_program_studi_idx` (`program_studi`);

--
-- Indeks untuk tabel `mata_kuliah`
--
ALTER TABLE `mata_kuliah`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mata_kuliah_kode_mk_key` (`kode_mk`),
  ADD KEY `mata_kuliah_kode_mk_idx` (`kode_mk`),
  ADD KEY `mata_kuliah_semester_idx` (`semester`),
  ADD KEY `mata_kuliah_is_active_idx` (`is_active`),
  ADD KEY `mata_kuliah_created_by_fkey` (`created_by`),
  ADD KEY `mata_kuliah_program_studi_idx` (`program_studi`);

--
-- Indeks untuk tabel `mata_kuliah_pengampu`
--
ALTER TABLE `mata_kuliah_pengampu`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mata_kuliah_pengampu_mata_kuliah_id_dosen_id_key` (`mata_kuliah_id`,`dosen_id`),
  ADD KEY `mata_kuliah_pengampu_mata_kuliah_id_idx` (`mata_kuliah_id`),
  ADD KEY `mata_kuliah_pengampu_dosen_id_idx` (`dosen_id`);

--
-- Indeks untuk tabel `nilai_cpl`
--
ALTER TABLE `nilai_cpl`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nilai_cpl_mahasiswa_id_cpl_id_mata_kuliah_id_semester_tahun__key` (`mahasiswa_id`,`cpl_id`,`mata_kuliah_id`,`semester`,`tahun_ajaran`),
  ADD KEY `nilai_cpl_mahasiswa_id_idx` (`mahasiswa_id`),
  ADD KEY `nilai_cpl_cpl_id_idx` (`cpl_id`),
  ADD KEY `nilai_cpl_mata_kuliah_id_idx` (`mata_kuliah_id`),
  ADD KEY `nilai_cpl_semester_idx` (`semester`),
  ADD KEY `nilai_cpl_tahun_ajaran_idx` (`tahun_ajaran`),
  ADD KEY `nilai_cpl_created_by_fkey` (`created_by`);

--
-- Indeks untuk tabel `nilai_cpmk`
--
ALTER TABLE `nilai_cpmk`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nilai_cpmk_mahasiswa_id_cpmk_id_semester_tahun_ajaran_key` (`mahasiswa_id`,`cpmk_id`,`semester`,`tahun_ajaran`),
  ADD KEY `nilai_cpmk_mahasiswa_id_idx` (`mahasiswa_id`),
  ADD KEY `nilai_cpmk_cpmk_id_idx` (`cpmk_id`),
  ADD KEY `nilai_cpmk_mata_kuliah_id_idx` (`mata_kuliah_id`),
  ADD KEY `nilai_cpmk_semester_idx` (`semester`),
  ADD KEY `nilai_cpmk_tahun_ajaran_idx` (`tahun_ajaran`);

--
-- Indeks untuk tabel `nilai_teknik_penilaian`
--
ALTER TABLE `nilai_teknik_penilaian`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nilai_teknik_penilaian_mahasiswa_id_teknik_penilaian_id_seme_key` (`mahasiswa_id`,`teknik_penilaian_id`,`semester`,`tahun_ajaran`),
  ADD KEY `nilai_teknik_penilaian_mahasiswa_id_idx` (`mahasiswa_id`),
  ADD KEY `nilai_teknik_penilaian_teknik_penilaian_id_idx` (`teknik_penilaian_id`),
  ADD KEY `nilai_teknik_penilaian_mata_kuliah_id_idx` (`mata_kuliah_id`),
  ADD KEY `nilai_teknik_penilaian_semester_idx` (`semester`),
  ADD KEY `nilai_teknik_penilaian_tahun_ajaran_idx` (`tahun_ajaran`),
  ADD KEY `nilai_teknik_penilaian_created_by_fkey` (`created_by`);

--
-- Indeks untuk tabel `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `profiles_user_id_key` (`user_id`),
  ADD UNIQUE KEY `profiles_nim_key` (`nim`),
  ADD UNIQUE KEY `profiles_nip_key` (`nip`),
  ADD UNIQUE KEY `profiles_nidn_key` (`nidn`),
  ADD KEY `profiles_nim_idx` (`nim`),
  ADD KEY `profiles_nip_idx` (`nip`),
  ADD KEY `profiles_program_studi_idx` (`program_studi`),
  ADD KEY `profiles_semester_idx` (`semester`),
  ADD KEY `profiles_nidn_idx` (`nidn`);

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
-- Indeks untuk tabel `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `settings_key_key` (`key`);

--
-- Indeks untuk tabel `teknik_penilaian`
--
ALTER TABLE `teknik_penilaian`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teknik_penilaian_cpmk_id_idx` (`cpmk_id`);

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
-- Ketidakleluasaan untuk tabel `cpmk`
--
ALTER TABLE `cpmk`
  ADD CONSTRAINT `cpmk_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `cpmk_mata_kuliah_id_fkey` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `cpmk_cpl_mapping`
--
ALTER TABLE `cpmk_cpl_mapping`
  ADD CONSTRAINT `cpmk_cpl_mapping_cpl_id_fkey` FOREIGN KEY (`cpl_id`) REFERENCES `cpl` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cpmk_cpl_mapping_cpmk_id_fkey` FOREIGN KEY (`cpmk_id`) REFERENCES `cpmk` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `mata_kuliah`
--
ALTER TABLE `mata_kuliah`
  ADD CONSTRAINT `mata_kuliah_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `mata_kuliah_pengampu`
--
ALTER TABLE `mata_kuliah_pengampu`
  ADD CONSTRAINT `mata_kuliah_pengampu_dosen_id_fkey` FOREIGN KEY (`dosen_id`) REFERENCES `profiles` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `mata_kuliah_pengampu_mata_kuliah_id_fkey` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `nilai_cpl`
--
ALTER TABLE `nilai_cpl`
  ADD CONSTRAINT `nilai_cpl_cpl_id_fkey` FOREIGN KEY (`cpl_id`) REFERENCES `cpl` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_cpl_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_cpl_mahasiswa_id_fkey` FOREIGN KEY (`mahasiswa_id`) REFERENCES `profiles` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_cpl_mata_kuliah_id_fkey` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `nilai_cpmk`
--
ALTER TABLE `nilai_cpmk`
  ADD CONSTRAINT `nilai_cpmk_cpmk_id_fkey` FOREIGN KEY (`cpmk_id`) REFERENCES `cpmk` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_cpmk_mahasiswa_id_fkey` FOREIGN KEY (`mahasiswa_id`) REFERENCES `profiles` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_cpmk_mata_kuliah_id_fkey` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `nilai_teknik_penilaian`
--
ALTER TABLE `nilai_teknik_penilaian`
  ADD CONSTRAINT `nilai_teknik_penilaian_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_teknik_penilaian_mahasiswa_id_fkey` FOREIGN KEY (`mahasiswa_id`) REFERENCES `profiles` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_teknik_penilaian_mata_kuliah_id_fkey` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nilai_teknik_penilaian_teknik_penilaian_id_fkey` FOREIGN KEY (`teknik_penilaian_id`) REFERENCES `teknik_penilaian` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
-- Ketidakleluasaan untuk tabel `teknik_penilaian`
--
ALTER TABLE `teknik_penilaian`
  ADD CONSTRAINT `teknik_penilaian_cpmk_id_fkey` FOREIGN KEY (`cpmk_id`) REFERENCES `cpmk` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
