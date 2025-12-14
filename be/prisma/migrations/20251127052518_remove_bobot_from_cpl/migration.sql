/*
  Warnings:

  - You are about to drop the column `bobot` on the `cpl` table. All the data in the column will be lost.
  - You are about to drop the column `minimal_nilai_tercapai` on the `cpl` table. All the data in the column will be lost.
  - You are about to drop the column `prodi_id` on the `cpl` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `cpl` DROP FOREIGN KEY `cpl_prodi_id_fkey`;

-- AlterTable
ALTER TABLE `cpl` DROP COLUMN `bobot`,
    DROP COLUMN `minimal_nilai_tercapai`,
    DROP COLUMN `prodi_id`;
