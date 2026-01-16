-- Add permissions for 'roles' resource to admin
-- Run this in MySQL

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

-- Verify
SELECT r.name as role, rp.resource, rp.action, rp.is_enabled
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
WHERE rp.resource = 'roles';
