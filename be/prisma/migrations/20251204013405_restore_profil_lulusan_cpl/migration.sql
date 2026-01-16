-- CreateTable
CREATE TABLE `profil_lulusan_cpl` (
    `id` VARCHAR(191) NOT NULL,
    `profil_lulusan_id` VARCHAR(191) NOT NULL,
    `cpl_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `profil_lulusan_cpl_profil_lulusan_id_idx`(`profil_lulusan_id`),
    INDEX `profil_lulusan_cpl_cpl_id_idx`(`cpl_id`),
    UNIQUE INDEX `profil_lulusan_cpl_profil_lulusan_id_cpl_id_key`(`profil_lulusan_id`, `cpl_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `profil_lulusan_cpl` ADD CONSTRAINT `profil_lulusan_cpl_profil_lulusan_id_fkey` FOREIGN KEY (`profil_lulusan_id`) REFERENCES `profil_lulusan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profil_lulusan_cpl` ADD CONSTRAINT `profil_lulusan_cpl_cpl_id_fkey` FOREIGN KEY (`cpl_id`) REFERENCES `cpl`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
