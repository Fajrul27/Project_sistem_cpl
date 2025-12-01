/*
  Warnings:

  - A unique constraint covering the columns `[mata_kuliah_id,dosen_id,kelas_id]` on the table `mata_kuliah_pengampu` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `mata_kuliah_pengampu_mata_kuliah_id_dosen_id_key` ON `mata_kuliah_pengampu`;

-- AlterTable
ALTER TABLE `cpl` ADD COLUMN `prodi_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `mata_kuliah` ADD COLUMN `semester_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `mata_kuliah_pengampu` ADD COLUMN `kelas_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `nilai_cpl` ADD COLUMN `semester_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `nilai_cpmk` ADD COLUMN `semester_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `nilai_teknik_penilaian` ADD COLUMN `semester_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `profiles` ADD COLUMN `kelas_id` VARCHAR(191) NULL,
    ADD COLUMN `semester_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `semester` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `angka` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `semester_nama_key`(`nama`),
    UNIQUE INDEX `semester_angka_key`(`angka`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kelas` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `kelas_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `cpl_prodi_id_idx` ON `cpl`(`prodi_id`);

-- CreateIndex
CREATE INDEX `mata_kuliah_semester_id_idx` ON `mata_kuliah`(`semester_id`);

-- CreateIndex
CREATE INDEX `mata_kuliah_pengampu_kelas_id_idx` ON `mata_kuliah_pengampu`(`kelas_id`);

-- CreateIndex
CREATE UNIQUE INDEX `mata_kuliah_pengampu_mata_kuliah_id_dosen_id_kelas_id_key` ON `mata_kuliah_pengampu`(`mata_kuliah_id`, `dosen_id`, `kelas_id`);

-- CreateIndex
CREATE INDEX `nilai_cpl_semester_id_idx` ON `nilai_cpl`(`semester_id`);

-- CreateIndex
CREATE INDEX `nilai_cpmk_semester_id_idx` ON `nilai_cpmk`(`semester_id`);

-- CreateIndex
CREATE INDEX `nilai_teknik_penilaian_semester_id_idx` ON `nilai_teknik_penilaian`(`semester_id`);

-- CreateIndex
CREATE INDEX `profiles_semester_id_idx` ON `profiles`(`semester_id`);

-- CreateIndex
CREATE INDEX `profiles_kelas_id_idx` ON `profiles`(`kelas_id`);

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_semester_id_fkey` FOREIGN KEY (`semester_id`) REFERENCES `semester`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_kelas_id_fkey` FOREIGN KEY (`kelas_id`) REFERENCES `kelas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cpl` ADD CONSTRAINT `cpl_prodi_id_fkey` FOREIGN KEY (`prodi_id`) REFERENCES `prodi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mata_kuliah` ADD CONSTRAINT `mata_kuliah_semester_id_fkey` FOREIGN KEY (`semester_id`) REFERENCES `semester`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_cpl` ADD CONSTRAINT `nilai_cpl_semester_id_fkey` FOREIGN KEY (`semester_id`) REFERENCES `semester`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_teknik_penilaian` ADD CONSTRAINT `nilai_teknik_penilaian_semester_id_fkey` FOREIGN KEY (`semester_id`) REFERENCES `semester`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_cpmk` ADD CONSTRAINT `nilai_cpmk_semester_id_fkey` FOREIGN KEY (`semester_id`) REFERENCES `semester`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mata_kuliah_pengampu` ADD CONSTRAINT `mata_kuliah_pengampu_kelas_id_fkey` FOREIGN KEY (`kelas_id`) REFERENCES `kelas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
