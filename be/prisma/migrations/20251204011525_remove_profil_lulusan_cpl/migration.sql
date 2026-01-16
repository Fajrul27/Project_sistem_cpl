/*
  Warnings:

  - You are about to drop the `profil_lulusan_cpl` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `profil_lulusan_cpl` DROP FOREIGN KEY `profil_lulusan_cpl_cpl_id_fkey`;

-- DropForeignKey
ALTER TABLE `profil_lulusan_cpl` DROP FOREIGN KEY `profil_lulusan_cpl_profil_lulusan_id_fkey`;

-- DropTable
DROP TABLE `profil_lulusan_cpl`;
