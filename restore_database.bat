@echo off
echo Restoring database from backup...
echo.
echo Step 1: Dropping existing database...
mysql -u root -e "DROP DATABASE IF EXISTS sistem_cpl;"
echo.
echo Step 2: Creating new database...
mysql -u root -e "CREATE DATABASE sistem_cpl CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo.
echo Step 3: Importing backup data...
mysql -u root sistem_cpl < sistem_cpl.sql
echo.
echo Step 4: Verifying data...
mysql -u root -e "USE sistem_cpl; SELECT 'Users:', COUNT(*) FROM users; SELECT 'CPL:', COUNT(*) FROM cpl; SELECT 'Mata Kuliah:', COUNT(*) FROM mata_kuliah;"
echo.
echo Database restore complete!
pause
