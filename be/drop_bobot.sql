-- Manual SQL to drop bobot column from cpl table
USE sistem_cpl;

ALTER TABLE cpl DROP COLUMN IF EXISTS bobot;

-- Verify column is dropped
DESCRIBE cpl;
