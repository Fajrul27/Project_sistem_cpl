-- AlterTable
ALTER TABLE `profiles` ADD COLUMN `angkatan_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `angkatan` (
    `id` VARCHAR(191) NOT NULL,
    `tahun` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `angkatan_tahun_key`(`tahun`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rubrik` (
    `id` VARCHAR(191) NOT NULL,
    `cpmk_id` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `rubrik_cpmk_id_key`(`cpmk_id`),
    INDEX `rubrik_cpmk_id_idx`(`cpmk_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rubrik_kriteria` (
    `id` VARCHAR(191) NOT NULL,
    `rubrik_id` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NOT NULL,
    `bobot` DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `rubrik_kriteria_rubrik_id_idx`(`rubrik_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rubrik_level` (
    `id` VARCHAR(191) NOT NULL,
    `kriteria_id` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NOT NULL,
    `nilai` DECIMAL(5, 2) NOT NULL,
    `label` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `rubrik_level_kriteria_id_idx`(`kriteria_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nilai_rubrik` (
    `id` VARCHAR(191) NOT NULL,
    `nilai_teknik_id` VARCHAR(191) NOT NULL,
    `rubrik_level_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `nilai_rubrik_nilai_teknik_id_idx`(`nilai_teknik_id`),
    INDEX `nilai_rubrik_rubrik_level_id_idx`(`rubrik_level_id`),
    UNIQUE INDEX `nilai_rubrik_nilai_teknik_id_rubrik_level_id_key`(`nilai_teknik_id`, `rubrik_level_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluasi_mata_kuliah` (
    `id` VARCHAR(191) NOT NULL,
    `mata_kuliah_id` VARCHAR(191) NOT NULL,
    `dosen_id` VARCHAR(191) NOT NULL,
    `semester` INTEGER NOT NULL,
    `tahun_ajaran` VARCHAR(191) NOT NULL,
    `kendala` TEXT NULL,
    `rencana_perbaikan` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'submitted',
    `feedback_kaprodi` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `evaluasi_mata_kuliah_mata_kuliah_id_idx`(`mata_kuliah_id`),
    INDEX `evaluasi_mata_kuliah_dosen_id_idx`(`dosen_id`),
    UNIQUE INDEX `evaluasi_mata_kuliah_mata_kuliah_id_dosen_id_semester_tahun__key`(`mata_kuliah_id`, `dosen_id`, `semester`, `tahun_ajaran`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_angkatan_id_fkey` FOREIGN KEY (`angkatan_id`) REFERENCES `angkatan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rubrik` ADD CONSTRAINT `rubrik_cpmk_id_fkey` FOREIGN KEY (`cpmk_id`) REFERENCES `cpmk`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rubrik_kriteria` ADD CONSTRAINT `rubrik_kriteria_rubrik_id_fkey` FOREIGN KEY (`rubrik_id`) REFERENCES `rubrik`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rubrik_level` ADD CONSTRAINT `rubrik_level_kriteria_id_fkey` FOREIGN KEY (`kriteria_id`) REFERENCES `rubrik_kriteria`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_rubrik` ADD CONSTRAINT `nilai_rubrik_nilai_teknik_id_fkey` FOREIGN KEY (`nilai_teknik_id`) REFERENCES `nilai_teknik_penilaian`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_rubrik` ADD CONSTRAINT `nilai_rubrik_rubrik_level_id_fkey` FOREIGN KEY (`rubrik_level_id`) REFERENCES `rubrik_level`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluasi_mata_kuliah` ADD CONSTRAINT `evaluasi_mata_kuliah_mata_kuliah_id_fkey` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluasi_mata_kuliah` ADD CONSTRAINT `evaluasi_mata_kuliah_dosen_id_fkey` FOREIGN KEY (`dosen_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
