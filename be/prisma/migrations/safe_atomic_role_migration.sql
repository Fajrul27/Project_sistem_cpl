-- ============================================================================
-- SAFE ATOMIC MIGRATION: Enum Role → Table-Based Dynamic Roles
-- Execute STEP-BY-STEP and VERIFY each before proceeding!
-- ============================================================================

-- ============================================================================
-- CHECKPOINT 0: Pre-Migration Verification
-- ============================================================================
-- Run these queries and SAVE the output for comparison later

SELECT 'USER_ROLES_BEFORE' as checkpoint, role, COUNT(*) as count FROM user_roles GROUP BY role;
SELECT 'ROLE_PERMISSIONS_BEFORE' as checkpoint, role, COUNT(*) as count FROM role_permissions GROUP BY role;
SELECT 'DEFAULT_PERMISSIONS_BEFORE' as checkpoint, role, COUNT(*) as count FROM default_role_permissions GROUP BY role;
SELECT 'TOTAL_USERS' as checkpoint, COUNT(*) as total FROM user_roles;

-- ============================================================================
-- STEP 1: Create roles table
-- ============================================================================
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  name VARCHAR(191) NOT NULL UNIQUE,
  display_name VARCHAR(191) NOT NULL,
  description TEXT NULL,
  is_system BOOLEAN NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  icon VARCHAR(191) NULL,
  color VARCHAR(191) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- VERIFY STEP 1
SHOW TABLES LIKE 'roles';
DESCRIBE roles;

-- ============================================================================
-- STEP 2: Insert 5 system roles
-- ============================================================================
INSERT INTO roles (id, name, display_name, description, is_system, is_active, icon, color, sort_order)
VALUES
  (UUID(), 'admin', 'Administrator', 'Full system access', 1, 1, 'Shield', '#EF4444', 1),
  (UUID(), 'kaprodi', 'Kepala Program Studi', 'Program coordinator', 1, 1, 'GraduationCap', '#3B82F6', 2),
  (UUID(), 'dosen', 'Dosen', 'Lecturer', 1, 1, 'BookOpen', '#10B981', 3),
  (UUID(), 'mahasiswa', 'Mahasiswa', 'Student', 1, 1, 'User', '#8B5CF6', 4),
  (UUID(), 'dekan', 'Dekan', 'Dean', 1, 1, 'Crown', '#F59E0B', 5);

-- VERIFY STEP 2
SELECT * FROM roles ORDER BY sort_order;
SELECT COUNT(*) as role_count FROM roles; -- Should be 5

-- ============================================================================
-- STEP 3: Migrate user_roles table
-- ============================================================================

-- 3.1: Add role_id column (nullable first for safety)
ALTER TABLE user_roles ADD COLUMN role_id VARCHAR(191) NULL;

-- VERIFY 3.1
DESCRIBE user_roles; -- Should show both 'role' and 'role_id'

-- 3.2: Populate role_id from enum role
UPDATE user_roles ur
INNER JOIN roles r ON r.name = ur.role
SET ur.role_id = r.id;

-- VERIFY 3.2 - CRITICAL CHECK
SELECT 
  COUNT(*) as total_users,
  COUNT(role_id) as users_with_role_id,
  COUNT(*) - COUNT(role_id) as missing_count
FROM user_roles;
-- If missing_count != 0, STOP IMMEDIATELY!

-- VERIFY 3.2 - Role distribution should match original
SELECT 'USER_ROLES_MAPPED' as checkpoint, r.name as role, COUNT(*) as count 
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
GROUP BY r.name
ORDER BY r.name;

-- ⚠️ COMPARE the above output with CHECKPOINT 0 USER_ROLES_BEFORE
-- They MUST match exactly! If not, STOP and investigate!

-- 3.3: ONLY proceed if verification passed
-- Make role_id NOT NULL
ALTER TABLE user_roles MODIFY COLUMN role_id VARCHAR(191) NOT NULL;

-- VERIFY 3.3
DESCRIBE user_roles;

-- 3.4: Create index on role_id
CREATE INDEX user_roles_role_id_idx ON user_roles(role_id);

-- 3.5: Add foreign key constraint
ALTER TABLE user_roles 
ADD CONSTRAINT user_roles_role_id_fkey 
FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- VERIFY 3.5
SHOW CREATE TABLE user_roles;

-- 3.6: Drop old enum role column
ALTER TABLE user_roles DROP COLUMN role;

-- VERIFY 3.6
DESCRIBE user_roles; -- 'role' column should be gone, only 'role_id' remains

-- 3.7: Final verification - can we join properly?
SELECT ur.id, ur.user_id, r.name as role, r.display_name
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
LIMIT 10;

-- ============================================================================
-- STEP 4: Migrate role_permissions table
-- ============================================================================

-- 4.1: Add role_id column
ALTER TABLE role_permissions ADD COLUMN role_id VARCHAR(191) NULL;

-- VERIFY 4.1
DESCRIBE role_permissions;

-- 4.2: Populate role_id from enum
UPDATE role_permissions rp
INNER JOIN roles r ON r.name = rp.role
SET rp.role_id = r.id;

-- VERIFY 4.2
SELECT 
  COUNT(*) as total_perms,
  COUNT(role_id) as perms_with_role_id,
  COUNT(*) - COUNT(role_id) as missing_count
FROM role_permissions;
-- If missing_count != 0, STOP!

SELECT 'ROLE_PERMISSIONS_MAPPED' as checkpoint, r.name as role, COUNT(*) as count
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
GROUP BY r.name
ORDER BY r.name;
-- Compare with CHECKPOINT 0 ROLE_PERMISSIONS_BEFORE

-- 4.3: Make NOT NULL
ALTER TABLE role_permissions MODIFY COLUMN role_id VARCHAR(191) NOT NULL;

-- 4.4: Drop old unique constraint
ALTER TABLE role_permissions DROP INDEX role_permissions_role_resource_action_key;

-- 4.5: Add new unique constraint
ALTER TABLE role_permissions 
ADD UNIQUE INDEX role_permissions_role_id_resource_action_key (role_id, resource, action);

-- 4.6: Add foreign key
ALTER TABLE role_permissions 
ADD CONSTRAINT role_permissions_role_id_fkey 
FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- 4.7: Drop old enum column
ALTER TABLE role_permissions DROP COLUMN role;

-- VERIFY 4.7
DESCRIBE role_permissions;
SELECT rp.id, r.name as role, rp.resource, rp.action, rp.is_enabled
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
LIMIT 10;

-- ============================================================================
-- STEP 5: Migrate default_role_permissions table
-- ============================================================================

-- 5.1: Add role_id column
ALTER TABLE default_role_permissions ADD COLUMN role_id VARCHAR(191) NULL;

-- VERIFY 5.1
DESCRIBE default_role_permissions;

-- 5.2: Populate role_id
UPDATE default_role_permissions drp
INNER JOIN roles r ON r.name = drp.role
SET drp.role_id = r.id;

-- VERIFY 5.2
SELECT 
  COUNT(*) as total_perms,
  COUNT(role_id) as perms_with_role_id,
  COUNT(*) - COUNT(role_id) as missing_count
FROM default_role_permissions;
-- If missing_count != 0, STOP!

SELECT 'DEFAULT_PERMISSIONS_MAPPED' as checkpoint, r.name as role, COUNT(*) as count
FROM default_role_permissions drp
JOIN roles r ON drp.role_id = r.id
GROUP BY r.name
ORDER BY r.name;
-- Compare with CHECKPOINT 0 DEFAULT_PERMISSIONS_BEFORE

-- 5.3: Make NOT NULL
ALTER TABLE default_role_permissions MODIFY COLUMN role_id VARCHAR(191) NOT NULL;

-- 5.4: Drop old unique constraint
ALTER TABLE default_role_permissions DROP INDEX default_role_permissions_role_resource_action_key;

-- 5.5: Add new unique constraint
ALTER TABLE default_role_permissions 
ADD UNIQUE INDEX default_role_permissions_role_id_resource_action_key (role_id, resource, action);

-- 5.6: Add foreign key
ALTER TABLE default_role_permissions 
ADD CONSTRAINT default_role_permissions_role_id_fkey 
FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- 5.7: Drop old enum column
ALTER TABLE default_role_permissions DROP COLUMN role;

-- VERIFY 5.7
DESCRIBE default_role_permissions;
SELECT drp.id, r.name as role, drp.resource, drp.action
FROM default_role_permissions drp
JOIN roles r ON drp.role_id = r.id
LIMIT 10;

-- ============================================================================
-- STEP 6: Cleanup - Drop role_metadata table (merged into roles)
-- ============================================================================
DROP TABLE IF EXISTS role_metadata;

-- VERIFY - table should be gone
SHOW TABLES LIKE 'role_metadata';

-- ============================================================================
-- STEP 7: FINAL VERIFICATION
-- ============================================================================

-- 7.1: Check all tables exist correctly
SHOW TABLES LIKE '%role%';

-- 7.2: Verify roles table structure
SELECT * FROM roles ORDER BY sort_order;

-- 7.3: Verify user_roles migration - compare with CHECKPOINT 0
SELECT r.name as role, COUNT(*) as count
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
GROUP BY r.name
ORDER BY r.name;

-- 7.4: Verify role_permissions migration
SELECT r.name as role, COUNT(*) as count
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
GROUP BY r.name
ORDER BY r.name;

-- 7.5: Verify default_role_permissions migration
SELECT r.name as role, COUNT(*) as count
FROM default_role_permissions drp  
JOIN roles r ON drp.role_id = r.id
GROUP BY r.name
ORDER BY r.name;

-- 7.6: Sanity check - sample data from each table
SELECT 'USER_ROLES_SAMPLE' as table_name, ur.id, u.email, r.name as role
FROM user_roles ur
JOIN users u ON ur.user_id = u.id
JOIN roles r ON ur.role_id = r.id
LIMIT 5;

SELECT 'ROLE_PERMISSIONS_SAMPLE' as table_name, rp.id, r.name as role, rp.resource, rp.action
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
LIMIT 5;

-- ============================================================================
-- MIGRATION COMPLETE! 🎉
-- ============================================================================
-- Next steps:
-- 1. Backend server will auto-reload (tsx watch)
-- 2. Test login with various users
-- 3. Verify permissions work correctly
-- 4. Add permissions for 'roles' resource
-- 5. Test role management UI
-- ============================================================================
