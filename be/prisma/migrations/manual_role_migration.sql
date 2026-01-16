-- ============================================================================
-- CRITICAL: Full Dynamic Role System Migration
-- WARNING: This is a BREAKING CHANGE - BACKUP REQUIRED before running!
-- ============================================================================

-- PHASE 1: Create roles table
-- ============================================================================
DROP TABLE IF EXISTS `roles`;

CREATE TABLE `roles` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL UNIQUE,
  `display_name` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `is_system` BOOLEAN NOT NULL DEFAULT 1,
  `is_active` BOOLEAN NOT NULL DEFAULT 1,
  `icon` VARCHAR(191) NULL,
  `color` VARCHAR(191) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PHASE 2: Insert existing enum roles as system roles
-- ============================================================================
INSERT INTO `roles` (`id`, `name`, `display_name`, `description`, `is_system`, `is_active`, `icon`, `color`, `sort_order`)
VALUES
  (UUID(), 'admin', 'Administrator', 'Full system access', 1, 1, 'Shield', '#EF4444', 1),
  (UUID(), 'kaprodi', 'Kepala Program Studi', 'Program coordinator and curriculum manager', 1, 1, 'GraduationCap', '#3B82F6', 2),
  (UUID(), 'dosen', 'Dosen', 'Lecturer and course instructor', 1, 1, 'BookOpen', '#10B981', 3),
  (UUID(), 'mahasiswa', 'Mahasiswa', 'Student participant', 1, 1, 'User', '#8B5CF6', 4),
  (UUID(), 'dekan', 'Dekan', 'Faculty dean', 1, 1, 'Crown', '#F59E0B', 5);

-- Verify roles inserted
SELECT * FROM `roles`;

-- PHASE 3: Migrate user_roles table
-- ============================================================================

-- Step 3.1: Add role_id column (temporary, nullable)
ALTER TABLE `user_roles` 
ADD COLUMN `role_id` VARCHAR(191) NULL AFTER `user_id`;

-- Step 3.2: Populate role_id from old role enum
UPDATE `user_roles` ur
JOIN `roles` r ON r.name = ur.role
SET ur.role_id = r.id;

-- Step 3.3: Verify all rows have role_id populated
SELECT COUNT(*) AS total, COUNT(role_id) AS with_role_id 
FROM `user_roles`;
-- If total != with_role_id, STOP and investigate!

-- Step 3.4: Make role_id NOT NULL
ALTER TABLE `user_roles` 
MODIFY COLUMN `role_id` VARCHAR(191) NOT NULL;

-- Step 3.5: Drop old index on role column
ALTER TABLE `user_roles` DROP INDEX `user_roles_role_idx`;

-- Step 3.6: Add index on role_id
ALTER TABLE `user_roles` ADD INDEX `user_roles_role_id_idx` (`role_id`);

-- Step 3.7: Add foreign key constraint
ALTER TABLE `user_roles` 
ADD CONSTRAINT `user_roles_role_id_fkey` 
FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 3.8: Drop old role column
ALTER TABLE `user_roles` DROP COLUMN `role`;

-- Verify migration
SELECT ur.*, r.name as role_name, r.display_name 
FROM `user_roles` ur 
JOIN `roles` r ON ur.role_id = r.id 
LIMIT 10;

-- PHASE 4: Migrate role_permissions table
-- ============================================================================

-- Step 4.1: Add role_id column
ALTER TABLE `role_permissions` 
ADD COLUMN `role_id` VARCHAR(191) NULL;

-- Step 4.2: Populate role_id
UPDATE `role_permissions` rp
JOIN `roles` r ON r.name = rp.role
SET rp.role_id = r.id;

-- Step 4.3: Verify
SELECT COUNT(*) AS total, COUNT(role_id) AS with_role_id 
FROM `role_permissions`;

-- Step 4.4: Make NOT NULL
ALTER TABLE `role_permissions` 
MODIFY COLUMN `role_id` VARCHAR(191) NOT NULL;

-- Step 4.5: Drop old unique constraint
ALTER TABLE `role_permissions` 
DROP INDEX `role_permissions_role_resource_action_key`;

-- Step 4.6: Add new unique constraint
ALTER TABLE `role_permissions` 
ADD UNIQUE INDEX `role_permissions_role_id_resource_action_key` (`role_id`, `resource`, `action`);

-- Step 4.7: Add foreign key
ALTER TABLE `role_permissions` 
ADD CONSTRAINT `role_permissions_role_id_fkey` 
FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 4.8: Drop old role column
ALTER TABLE `role_permissions` DROP COLUMN `role`;

-- Verify
SELECT rp.*, r.name as role_name 
FROM `role_permissions` rp 
JOIN `roles` r ON rp.role_id = r.id 
LIMIT 10;

-- PHASE 5: Migrate default_role_permissions table
-- ============================================================================

-- Step 5.1: Add role_id column
ALTER TABLE `default_role_permissions` 
ADD COLUMN `role_id` VARCHAR(191) NULL;

-- Step 5.2: Populate role_id
UPDATE `default_role_permissions` drp
JOIN `roles` r ON r.name = drp.role
SET drp.role_id = r.id;

-- Step 5.3: Verify
SELECT COUNT(*) AS total, COUNT(role_id) AS with_role_id 
FROM `default_role_permissions`;

-- Step 5.4: Make NOT NULL  
ALTER TABLE `default_role_permissions` 
MODIFY COLUMN `role_id` VARCHAR(191) NOT NULL;

-- Step 5.5: Drop old unique constraint
ALTER TABLE `default_role_permissions` 
DROP INDEX `default_role_permissions_role_resource_action_key`;

-- Step 5.6: Add new unique constraint
ALTER TABLE `default_role_permissions` 
ADD UNIQUE INDEX `default_role_permissions_role_id_resource_action_key` (`role_id`, `resource`, `action`);

-- Step 5.7: Add foreign key
ALTER TABLE `default_role_permissions` 
ADD CONSTRAINT `default_role_permissions_role_id_fkey` 
FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5.8: Drop old role column
ALTER TABLE `default_role_permissions` DROP COLUMN `role`;

-- Verify
SELECT drp.*, r.name as role_name 
FROM `default_role_permissions` drp 
JOIN `roles` r ON drp.role_id = r.id 
LIMIT 10;

-- PHASE 6: Drop role_metadata table (merged into roles)
-- ============================================================================
DROP TABLE IF EXISTS `role_metadata`;

-- PHASE 7: Final Verification
-- ============================================================================

-- Check all tables
SHOW TABLES LIKE '%role%';

-- Check roles table
SELECT * FROM `roles` ORDER BY `sort_order`;

-- Check user roles
SELECT 
  u.email, 
  r.name as role_name, 
  r.display_name 
FROM `users` u
JOIN `user_roles` ur ON u.id = ur.user_id
JOIN `roles` r ON ur.role_id = r.id
LIMIT 20;

-- Check permissions
SELECT 
  r.name as role, 
  COUNT(*) as permission_count 
FROM `role_permissions` rp
JOIN `roles` r ON rp.role_id = r.id
GROUP BY r.name;

-- Check default permissions
SELECT 
  r.name as role,
  COUNT(*) as default_permission_count 
FROM `default_role_permissions` drp
JOIN `roles` r ON drp.role_id = r.id
GROUP BY r.name;

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
-- Next steps:
-- 1. Run `npx prisma generate` to regenerate Prisma Client
-- 2. Restart backend server
-- 3. Test login with existing users
-- 4. Verify permissions still work
-- ============================================================================
