/*
  Warnings:

  - A unique constraint covering the columns `[mahasiswa_id,cpl_id,mata_kuliah_id,semester,tahun_ajaran]` on the table `nilai_cpl` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nidn]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `cpl` ADD COLUMN `kategori_id` VARCHAR(191) NULL,
    ADD COLUMN `minimal_nilai_tercapai` DECIMAL(5, 2) NOT NULL DEFAULT 70.00,
    ADD COLUMN `prodi_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `mata_kuliah` ADD COLUMN `jenis_mk_id` VARCHAR(191) NULL,
    ADD COLUMN `kurikulum_id` VARCHAR(191) NULL,
    ADD COLUMN `prodi_id` VARCHAR(191) NULL,
    ADD COLUMN `program_studi` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `profiles` ADD COLUMN `fakultas_id` VARCHAR(191) NULL,
    ADD COLUMN `nidn` VARCHAR(191) NULL,
    ADD COLUMN `prodi_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user_roles` MODIFY `role` ENUM('admin', 'dosen', 'mahasiswa', 'kaprodi', 'dekan') NOT NULL DEFAULT 'mahasiswa';

-- CreateTable
CREATE TABLE `cpmk` (
    `id` VARCHAR(191) NOT NULL,
    `kode_cpmk` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NULL,
    `level_taksonomi` VARCHAR(191) NULL,
    `level_taksonomi_id` VARCHAR(191) NULL,
    `mata_kuliah_id` VARCHAR(191) NOT NULL,
    `status_validasi` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `validated_at` DATETIME(3) NULL,
    `validated_by` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` VARCHAR(191) NULL,

    INDEX `cpmk_mata_kuliah_id_idx`(`mata_kuliah_id`),
    INDEX `cpmk_kode_cpmk_idx`(`kode_cpmk`),
    INDEX `cpmk_status_validasi_idx`(`status_validasi`),
    INDEX `cpmk_level_taksonomi_id_idx`(`level_taksonomi_id`),
    INDEX `cpmk_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cpmk_cpl_mapping` (
    `id` VARCHAR(191) NOT NULL,
    `cpmk_id` VARCHAR(191) NOT NULL,
    `cpl_id` VARCHAR(191) NOT NULL,
    `bobot_persentase` DECIMAL(5, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cpmk_cpl_mapping_cpmk_id_idx`(`cpmk_id`),
    INDEX `cpmk_cpl_mapping_cpl_id_idx`(`cpl_id`),
    UNIQUE INDEX `cpmk_cpl_mapping_cpmk_id_cpl_id_key`(`cpmk_id`, `cpl_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teknik_penilaian` (
    `id` VARCHAR(191) NOT NULL,
    `cpmk_id` VARCHAR(191) NOT NULL,
    `nama_teknik` VARCHAR(191) NOT NULL,
    `teknik_ref_id` VARCHAR(191) NULL,
    `bobot_persentase` DECIMAL(5, 2) NOT NULL,
    `deskripsi` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `teknik_penilaian_cpmk_id_idx`(`cpmk_id`),
    INDEX `teknik_penilaian_teknik_ref_id_idx`(`teknik_ref_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nilai_teknik_penilaian` (
    `id` VARCHAR(191) NOT NULL,
    `mahasiswa_id` VARCHAR(191) NOT NULL,
    `teknik_penilaian_id` VARCHAR(191) NOT NULL,
    `mata_kuliah_id` VARCHAR(191) NOT NULL,
    `nilai` DECIMAL(5, 2) NOT NULL,
    `semester` INTEGER NOT NULL,
    `tahun_ajaran` VARCHAR(191) NOT NULL,
    `catatan` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` VARCHAR(191) NULL,

    INDEX `nilai_teknik_penilaian_mahasiswa_id_idx`(`mahasiswa_id`),
    INDEX `nilai_teknik_penilaian_teknik_penilaian_id_idx`(`teknik_penilaian_id`),
    INDEX `nilai_teknik_penilaian_mata_kuliah_id_idx`(`mata_kuliah_id`),
    INDEX `nilai_teknik_penilaian_semester_idx`(`semester`),
    INDEX `nilai_teknik_penilaian_tahun_ajaran_idx`(`tahun_ajaran`),
    UNIQUE INDEX `nilai_teknik_penilaian_mahasiswa_id_teknik_penilaian_id_seme_key`(`mahasiswa_id`, `teknik_penilaian_id`, `semester`, `tahun_ajaran`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nilai_cpmk` (
    `id` VARCHAR(191) NOT NULL,
    `mahasiswa_id` VARCHAR(191) NOT NULL,
    `cpmk_id` VARCHAR(191) NOT NULL,
    `mata_kuliah_id` VARCHAR(191) NOT NULL,
    `nilai_akhir` DECIMAL(5, 2) NOT NULL,
    `semester` INTEGER NOT NULL,
    `tahun_ajaran` VARCHAR(191) NOT NULL,
    `is_calculated` BOOLEAN NOT NULL DEFAULT true,
    `calculated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `nilai_cpmk_mahasiswa_id_idx`(`mahasiswa_id`),
    INDEX `nilai_cpmk_cpmk_id_idx`(`cpmk_id`),
    INDEX `nilai_cpmk_mata_kuliah_id_idx`(`mata_kuliah_id`),
    INDEX `nilai_cpmk_semester_idx`(`semester`),
    INDEX `nilai_cpmk_tahun_ajaran_idx`(`tahun_ajaran`),
    UNIQUE INDEX `nilai_cpmk_mahasiswa_id_cpmk_id_semester_tahun_ajaran_key`(`mahasiswa_id`, `cpmk_id`, `semester`, `tahun_ajaran`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fakultas` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fakultas_nama_key`(`nama`),
    UNIQUE INDEX `fakultas_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prodi` (
    `id` VARCHAR(191) NOT NULL,
    `fakultas_id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NULL,
    `jenjang` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `prodi_nama_key`(`nama`),
    INDEX `prodi_fakultas_id_idx`(`fakultas_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tahun_ajaran` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tahun_ajaran_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kategori_cpl` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `kategori_cpl_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teknik_penilaian_ref` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `teknik_penilaian_ref_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `level_taksonomi` (
    `id` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NULL,
    `kategori` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `level_taksonomi_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kurikulum` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `tahun_mulai` INTEGER NOT NULL,
    `tahun_selesai` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `kurikulum_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jenis_mata_kuliah` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `jenis_mata_kuliah_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mata_kuliah_pengampu` (
    `id` VARCHAR(191) NOT NULL,
    `mata_kuliah_id` VARCHAR(191) NOT NULL,
    `dosen_id` VARCHAR(191) NOT NULL,
    `is_pengampu_utama` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `mata_kuliah_pengampu_mata_kuliah_id_idx`(`mata_kuliah_id`),
    INDEX `mata_kuliah_pengampu_dosen_id_idx`(`dosen_id`),
    UNIQUE INDEX `mata_kuliah_pengampu_mata_kuliah_id_dosen_id_key`(`mata_kuliah_id`, `dosen_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kaprodi_data` (
    `id` VARCHAR(191) NOT NULL,
    `program_studi` VARCHAR(191) NOT NULL,
    `prodi_id` VARCHAR(191) NULL,
    `nama_kaprodi` VARCHAR(191) NOT NULL,
    `nidn_kaprodi` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `kaprodi_data_program_studi_key`(`program_studi`),
    UNIQUE INDEX `kaprodi_data_prodi_id_key`(`prodi_id`),
    INDEX `kaprodi_data_program_studi_idx`(`program_studi`),
    INDEX `kaprodi_data_prodi_id_idx`(`prodi_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `description` TEXT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `settings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `cpl_kategori_id_idx` ON `cpl`(`kategori_id`);

-- CreateIndex
CREATE INDEX `cpl_prodi_id_idx` ON `cpl`(`prodi_id`);

-- CreateIndex
CREATE INDEX `mata_kuliah_program_studi_idx` ON `mata_kuliah`(`program_studi`);

-- CreateIndex
CREATE INDEX `mata_kuliah_prodi_id_idx` ON `mata_kuliah`(`prodi_id`);

-- CreateIndex
CREATE INDEX `mata_kuliah_kurikulum_id_idx` ON `mata_kuliah`(`kurikulum_id`);

-- CreateIndex
CREATE UNIQUE INDEX `nilai_cpl_mahasiswa_id_cpl_id_mata_kuliah_id_semester_tahun__key` ON `nilai_cpl`(`mahasiswa_id`, `cpl_id`, `mata_kuliah_id`, `semester`, `tahun_ajaran`);

-- CreateIndex
CREATE UNIQUE INDEX `profiles_nidn_key` ON `profiles`(`nidn`);

-- CreateIndex
CREATE INDEX `profiles_nidn_idx` ON `profiles`(`nidn`);

-- CreateIndex
CREATE INDEX `profiles_prodi_id_idx` ON `profiles`(`prodi_id`);

-- CreateIndex
CREATE INDEX `profiles_fakultas_id_idx` ON `profiles`(`fakultas_id`);

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_prodi_id_fkey` FOREIGN KEY (`prodi_id`) REFERENCES `prodi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_fakultas_id_fkey` FOREIGN KEY (`fakultas_id`) REFERENCES `fakultas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cpl` ADD CONSTRAINT `cpl_kategori_id_fkey` FOREIGN KEY (`kategori_id`) REFERENCES `kategori_cpl`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cpl` ADD CONSTRAINT `cpl_prodi_id_fkey` FOREIGN KEY (`prodi_id`) REFERENCES `prodi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mata_kuliah` ADD CONSTRAINT `mata_kuliah_prodi_id_fkey` FOREIGN KEY (`prodi_id`) REFERENCES `prodi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mata_kuliah` ADD CONSTRAINT `mata_kuliah_kurikulum_id_fkey` FOREIGN KEY (`kurikulum_id`) REFERENCES `kurikulum`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mata_kuliah` ADD CONSTRAINT `mata_kuliah_jenis_mk_id_fkey` FOREIGN KEY (`jenis_mk_id`) REFERENCES `jenis_mata_kuliah`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cpmk` ADD CONSTRAINT `cpmk_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cpmk` ADD CONSTRAINT `cpmk_mata_kuliah_id_fkey` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cpmk` ADD CONSTRAINT `cpmk_level_taksonomi_id_fkey` FOREIGN KEY (`level_taksonomi_id`) REFERENCES `level_taksonomi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cpmk_cpl_mapping` ADD CONSTRAINT `cpmk_cpl_mapping_cpmk_id_fkey` FOREIGN KEY (`cpmk_id`) REFERENCES `cpmk`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cpmk_cpl_mapping` ADD CONSTRAINT `cpmk_cpl_mapping_cpl_id_fkey` FOREIGN KEY (`cpl_id`) REFERENCES `cpl`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teknik_penilaian` ADD CONSTRAINT `teknik_penilaian_cpmk_id_fkey` FOREIGN KEY (`cpmk_id`) REFERENCES `cpmk`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teknik_penilaian` ADD CONSTRAINT `teknik_penilaian_teknik_ref_id_fkey` FOREIGN KEY (`teknik_ref_id`) REFERENCES `teknik_penilaian_ref`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_teknik_penilaian` ADD CONSTRAINT `nilai_teknik_penilaian_mahasiswa_id_fkey` FOREIGN KEY (`mahasiswa_id`) REFERENCES `profiles`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_teknik_penilaian` ADD CONSTRAINT `nilai_teknik_penilaian_teknik_penilaian_id_fkey` FOREIGN KEY (`teknik_penilaian_id`) REFERENCES `teknik_penilaian`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_teknik_penilaian` ADD CONSTRAINT `nilai_teknik_penilaian_mata_kuliah_id_fkey` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_teknik_penilaian` ADD CONSTRAINT `nilai_teknik_penilaian_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_cpmk` ADD CONSTRAINT `nilai_cpmk_mahasiswa_id_fkey` FOREIGN KEY (`mahasiswa_id`) REFERENCES `profiles`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_cpmk` ADD CONSTRAINT `nilai_cpmk_cpmk_id_fkey` FOREIGN KEY (`cpmk_id`) REFERENCES `cpmk`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_cpmk` ADD CONSTRAINT `nilai_cpmk_mata_kuliah_id_fkey` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prodi` ADD CONSTRAINT `prodi_fakultas_id_fkey` FOREIGN KEY (`fakultas_id`) REFERENCES `fakultas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mata_kuliah_pengampu` ADD CONSTRAINT `mata_kuliah_pengampu_mata_kuliah_id_fkey` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mata_kuliah_pengampu` ADD CONSTRAINT `mata_kuliah_pengampu_dosen_id_fkey` FOREIGN KEY (`dosen_id`) REFERENCES `profiles`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kaprodi_data` ADD CONSTRAINT `kaprodi_data_prodi_id_fkey` FOREIGN KEY (`prodi_id`) REFERENCES `prodi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
