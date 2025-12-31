-- DropIndex
DROP INDEX `profil_lulusan_cpl_profil_lulusan_id_cpl_id_key` ON `profil_lulusan_cpl`;

-- DropIndex
DROP INDEX `sessions_token_idx` ON `sessions`;

-- DropIndex
DROP INDEX `sessions_token_key` ON `sessions`;

-- AlterTable
ALTER TABLE `profil_lulusan` ADD COLUMN `target_ketercapaian` DOUBLE NULL;

-- AlterTable
ALTER TABLE `sessions` MODIFY `token` VARCHAR(1000) NOT NULL;

-- CreateTable
CREATE TABLE `sub_cpmk` (
    `id` VARCHAR(191) NOT NULL,
    `cpmk_id` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NOT NULL,
    `bobot` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `sub_cpmk_cpmk_id_idx`(`cpmk_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asesmen_sub_cpmk` (
    `id` VARCHAR(191) NOT NULL,
    `teknik_penilaian_id` VARCHAR(191) NOT NULL,
    `sub_cpmk_id` VARCHAR(191) NOT NULL,
    `bobot` DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `asesmen_sub_cpmk_teknik_penilaian_id_idx`(`teknik_penilaian_id`),
    INDEX `asesmen_sub_cpmk_sub_cpmk_id_idx`(`sub_cpmk_id`),
    UNIQUE INDEX `asesmen_sub_cpmk_teknik_penilaian_id_sub_cpmk_id_key`(`teknik_penilaian_id`, `sub_cpmk_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nilai_sub_cpmk` (
    `id` VARCHAR(191) NOT NULL,
    `mahasiswa_id` VARCHAR(191) NOT NULL,
    `sub_cpmk_id` VARCHAR(191) NOT NULL,
    `mata_kuliah_id` VARCHAR(191) NOT NULL,
    `nilai` DECIMAL(5, 2) NOT NULL,
    `semester` INTEGER NOT NULL,
    `semester_id` VARCHAR(191) NULL,
    `tahun_ajaran` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `nilai_sub_cpmk_mahasiswa_id_idx`(`mahasiswa_id`),
    INDEX `nilai_sub_cpmk_sub_cpmk_id_idx`(`sub_cpmk_id`),
    INDEX `nilai_sub_cpmk_mata_kuliah_id_idx`(`mata_kuliah_id`),
    INDEX `nilai_sub_cpmk_semester_idx`(`semester`),
    INDEX `nilai_sub_cpmk_semester_id_idx`(`semester_id`),
    INDEX `nilai_sub_cpmk_tahun_ajaran_idx`(`tahun_ajaran`),
    UNIQUE INDEX `nilai_sub_cpmk_mahasiswa_id_sub_cpmk_id_semester_tahun_ajara_key`(`mahasiswa_id`, `sub_cpmk_id`, `semester`, `tahun_ajaran`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `penilaian_tidak_langsung` (
    `id` VARCHAR(191) NOT NULL,
    `mahasiswa_id` VARCHAR(191) NOT NULL,
    `cpl_id` VARCHAR(191) NOT NULL,
    `nilai` INTEGER NOT NULL,
    `semester` INTEGER NOT NULL,
    `tahun_ajaran` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `penilaian_tidak_langsung_mahasiswa_id_idx`(`mahasiswa_id`),
    INDEX `penilaian_tidak_langsung_cpl_id_idx`(`cpl_id`),
    UNIQUE INDEX `penilaian_tidak_langsung_mahasiswa_id_cpl_id_semester_tahun__key`(`mahasiswa_id`, `cpl_id`, `semester`, `tahun_ajaran`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `id` VARCHAR(191) NOT NULL,
    `role` ENUM('admin', 'dosen', 'mahasiswa', 'kaprodi', 'dekan') NOT NULL,
    `resource` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `role_permissions_role_resource_action_key`(`role`, `resource`, `action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `default_role_permissions` (
    `id` VARCHAR(191) NOT NULL,
    `role` ENUM('admin', 'dosen', 'mahasiswa', 'kaprodi', 'dekan') NOT NULL,
    `resource` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `default_role_permissions_role_resource_action_key`(`role`, `resource`, `action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `target_cpl` (
    `id` VARCHAR(191) NOT NULL,
    `prodi_id` VARCHAR(191) NOT NULL,
    `angkatan` VARCHAR(191) NOT NULL,
    `tahun_ajaran` VARCHAR(191) NOT NULL,
    `semester` INTEGER NULL,
    `cpl_id` VARCHAR(191) NOT NULL,
    `target` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `target_cpl_cpl_id_fkey`(`cpl_id`),
    UNIQUE INDEX `target_cpl_prodi_id_angkatan_tahun_ajaran_semester_cpl_id_key`(`prodi_id`, `angkatan`, `tahun_ajaran`, `semester`, `cpl_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tindak_lanjut_cpl` (
    `id` VARCHAR(191) NOT NULL,
    `evaluasi_id` VARCHAR(191) NULL,
    `prodi_id` VARCHAR(191) NOT NULL,
    `angkatan` VARCHAR(191) NOT NULL,
    `tahun_ajaran` VARCHAR(191) NOT NULL,
    `semester` INTEGER NULL,
    `cpl_id` VARCHAR(191) NOT NULL,
    `akar_masalah` TEXT NOT NULL,
    `rencana_perbaikan` TEXT NOT NULL,
    `penanggung_jawab` VARCHAR(191) NOT NULL,
    `target_semester` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'open',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` VARCHAR(191) NOT NULL,

    INDEX `tindak_lanjut_cpl_prodi_id_angkatan_tahun_ajaran_cpl_id_idx`(`prodi_id`, `angkatan`, `tahun_ajaran`, `cpl_id`),
    INDEX `tindak_lanjut_cpl_cpl_id_fkey`(`cpl_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `sessions_token_idx` ON `sessions`(`token`(768));

-- AddForeignKey
ALTER TABLE `sub_cpmk` ADD CONSTRAINT `sub_cpmk_cpmk_id_fkey` FOREIGN KEY (`cpmk_id`) REFERENCES `cpmk`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asesmen_sub_cpmk` ADD CONSTRAINT `asesmen_sub_cpmk_sub_cpmk_id_fkey` FOREIGN KEY (`sub_cpmk_id`) REFERENCES `sub_cpmk`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asesmen_sub_cpmk` ADD CONSTRAINT `asesmen_sub_cpmk_teknik_penilaian_id_fkey` FOREIGN KEY (`teknik_penilaian_id`) REFERENCES `teknik_penilaian`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_sub_cpmk` ADD CONSTRAINT `nilai_sub_cpmk_mahasiswa_id_fkey` FOREIGN KEY (`mahasiswa_id`) REFERENCES `profiles`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_sub_cpmk` ADD CONSTRAINT `nilai_sub_cpmk_mata_kuliah_id_fkey` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_sub_cpmk` ADD CONSTRAINT `nilai_sub_cpmk_semester_id_fkey` FOREIGN KEY (`semester_id`) REFERENCES `semester`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_sub_cpmk` ADD CONSTRAINT `nilai_sub_cpmk_sub_cpmk_id_fkey` FOREIGN KEY (`sub_cpmk_id`) REFERENCES `sub_cpmk`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `penilaian_tidak_langsung` ADD CONSTRAINT `penilaian_tidak_langsung_cpl_id_fkey` FOREIGN KEY (`cpl_id`) REFERENCES `cpl`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `penilaian_tidak_langsung` ADD CONSTRAINT `penilaian_tidak_langsung_mahasiswa_id_fkey` FOREIGN KEY (`mahasiswa_id`) REFERENCES `profiles`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `target_cpl` ADD CONSTRAINT `target_cpl_cpl_id_fkey` FOREIGN KEY (`cpl_id`) REFERENCES `cpl`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tindak_lanjut_cpl` ADD CONSTRAINT `tindak_lanjut_cpl_cpl_id_fkey` FOREIGN KEY (`cpl_id`) REFERENCES `cpl`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `profil_lulusan_cpl_profil_lulusan_id_fkey` ON `profil_lulusan_cpl`(`profil_lulusan_id`);
DROP INDEX `profil_lulusan_cpl_profil_lulusan_id_idx` ON `profil_lulusan_cpl`;
