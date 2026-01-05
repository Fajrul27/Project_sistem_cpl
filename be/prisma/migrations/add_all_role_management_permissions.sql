-- Complete Role Management Permissions for Admin
-- This adds permissions for ALL role management features
-- Run: mysql -u root -p sistem_cpl < this_file.sql

-- 1. Add permissions for 'roles' resource (Kelola Role)
INSERT INTO role_permissions (id, role_id, resource, action, is_enabled, created_at, updated_at)
SELECT 
  UUID(),
  r.id,
  'roles',
  action,
  1,
  NOW(3),
  NOW(3)
FROM roles r
CROSS JOIN (
  SELECT 'view' AS action
  UNION SELECT 'create'
  UNION SELECT 'edit'
  UNION SELECT 'delete'
) actions
WHERE r.name = 'admin'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp2
  WHERE rp2.role_id = r.id 
  AND rp2.resource = 'roles' 
  AND rp2.action = action
);

-- 2. Add permissions for 'role_permissions' resource (Hak Akses Role)
INSERT INTO role_permissions (id, role_id, resource, action, is_enabled, created_at, updated_at)
SELECT 
  UUID(),
  r.id,
  'role_permissions',
  action,
  1,
  NOW(3),
  NOW(3)
FROM roles r
CROSS JOIN (
  SELECT 'view' AS action
  UNION SELECT 'create'
  UNION SELECT 'edit'
  UNION SELECT 'delete'
) actions
WHERE r.name = 'admin'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp2
  WHERE rp2.role_id = r.id 
  AND rp2.resource = 'role_permissions' 
  AND rp2.action = action
);

-- 3. Add permissions for 'default_role_permissions' resource (Hak Akses Default Role)
INSERT INTO role_permissions (id, role_id, resource, action, is_enabled, created_at, updated_at)
SELECT 
  UUID(),
  r.id,
  'default_role_permissions',
  action,
  1,
  NOW(3),
  NOW(3)
FROM roles r
CROSS JOIN (
  SELECT 'view' AS action
  UNION SELECT 'create'
  UNION SELECT 'edit'
  UNION SELECT 'delete'
) actions
WHERE r.name = 'admin'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp2
  WHERE rp2.role_id = r.id 
  AND rp2.resource = 'default_role_permissions' 
  AND rp2.action = action
);

-- Verify all permissions added
SELECT 
  r.name as role, 
  rp.resource, 
  rp.action, 
  rp.is_enabled
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
WHERE rp.resource IN ('roles', 'role_permissions', 'default_role_permissions')
ORDER BY rp.resource, rp.action;
