-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `last_login` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `email_verified` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `role` ENUM('admin', 'dosen', 'mahasiswa') NOT NULL DEFAULT 'mahasiswa',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_roles_user_id_key`(`user_id`),
    INDEX `user_roles_role_idx`(`role`),
    INDEX `user_roles_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profiles` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `nama_lengkap` VARCHAR(191) NULL,
    `nim` VARCHAR(191) NULL,
    `nip` VARCHAR(191) NULL,
    `program_studi` VARCHAR(191) NULL,
    `semester` INTEGER NULL,
    `tahun_masuk` INTEGER NULL,
    `alamat` TEXT NULL,
    `no_telepon` VARCHAR(191) NULL,
    `foto_profile` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `profiles_user_id_key`(`user_id`),
    UNIQUE INDEX `profiles_nim_key`(`nim`),
    UNIQUE INDEX `profiles_nip_key`(`nip`),
    INDEX `profiles_nim_idx`(`nim`),
    INDEX `profiles_nip_idx`(`nip`),
    INDEX `profiles_program_studi_idx`(`program_studi`),
    INDEX `profiles_semester_idx`(`semester`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cpl` (
    `id` VARCHAR(191) NOT NULL,
    `kode_cpl` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NOT NULL,
    `kategori` VARCHAR(191) NULL,
    `bobot` DECIMAL(3, 2) NOT NULL DEFAULT 1.00,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` VARCHAR(191) NULL,

    UNIQUE INDEX `cpl_kode_cpl_key`(`kode_cpl`),
    INDEX `cpl_kode_cpl_idx`(`kode_cpl`),
    INDEX `cpl_kategori_idx`(`kategori`),
    INDEX `cpl_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mata_kuliah` (
    `id` VARCHAR(191) NOT NULL,
    `kode_mk` VARCHAR(191) NOT NULL,
    `nama_mk` VARCHAR(191) NOT NULL,
    `sks` INTEGER NOT NULL,
    `semester` INTEGER NOT NULL,
    `deskripsi` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` VARCHAR(191) NULL,

    UNIQUE INDEX `mata_kuliah_kode_mk_key`(`kode_mk`),
    INDEX `mata_kuliah_kode_mk_idx`(`kode_mk`),
    INDEX `mata_kuliah_semester_idx`(`semester`),
    INDEX `mata_kuliah_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cpl_mata_kuliah` (
    `id` VARCHAR(191) NOT NULL,
    `cpl_id` VARCHAR(191) NOT NULL,
    `mata_kuliah_id` VARCHAR(191) NOT NULL,
    `bobot_kontribusi` DECIMAL(3, 2) NOT NULL DEFAULT 1.00,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cpl_mata_kuliah_cpl_id_idx`(`cpl_id`),
    INDEX `cpl_mata_kuliah_mata_kuliah_id_idx`(`mata_kuliah_id`),
    UNIQUE INDEX `cpl_mata_kuliah_cpl_id_mata_kuliah_id_key`(`cpl_id`, `mata_kuliah_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nilai_cpl` (
    `id` VARCHAR(191) NOT NULL,
    `mahasiswa_id` VARCHAR(191) NOT NULL,
    `cpl_id` VARCHAR(191) NOT NULL,
    `mata_kuliah_id` VARCHAR(191) NOT NULL,
    `nilai` DECIMAL(5, 2) NOT NULL,
    `semester` INTEGER NOT NULL,
    `tahun_ajaran` VARCHAR(191) NOT NULL,
    `catatan` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` VARCHAR(191) NULL,

    INDEX `nilai_cpl_mahasiswa_id_idx`(`mahasiswa_id`),
    INDEX `nilai_cpl_cpl_id_idx`(`cpl_id`),
    INDEX `nilai_cpl_mata_kuliah_id_idx`(`mata_kuliah_id`),
    INDEX `nilai_cpl_semester_idx`(`semester`),
    INDEX `nilai_cpl_tahun_ajaran_idx`(`tahun_ajaran`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ip_address` VARCHAR(191) NULL,
    `user_agent` TEXT NULL,

    UNIQUE INDEX `sessions_token_key`(`token`),
    INDEX `sessions_user_id_idx`(`user_id`),
    INDEX `sessions_token_idx`(`token`),
    INDEX `sessions_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `table_name` VARCHAR(191) NOT NULL,
    `record_id` VARCHAR(191) NULL,
    `old_data` JSON NULL,
    `new_data` JSON NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_user_id_idx`(`user_id`),
    INDEX `audit_logs_action_idx`(`action`),
    INDEX `audit_logs_table_name_idx`(`table_name`),
    INDEX `audit_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cpl` ADD CONSTRAINT `cpl_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mata_kuliah` ADD CONSTRAINT `mata_kuliah_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cpl_mata_kuliah` ADD CONSTRAINT `cpl_mata_kuliah_cpl_id_fkey` FOREIGN KEY (`cpl_id`) REFERENCES `cpl`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cpl_mata_kuliah` ADD CONSTRAINT `cpl_mata_kuliah_mata_kuliah_id_fkey` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_cpl` ADD CONSTRAINT `nilai_cpl_mahasiswa_id_fkey` FOREIGN KEY (`mahasiswa_id`) REFERENCES `profiles`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_cpl` ADD CONSTRAINT `nilai_cpl_cpl_id_fkey` FOREIGN KEY (`cpl_id`) REFERENCES `cpl`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_cpl` ADD CONSTRAINT `nilai_cpl_mata_kuliah_id_fkey` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_cpl` ADD CONSTRAINT `nilai_cpl_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
