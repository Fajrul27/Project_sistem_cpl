-- Cek user bije
SELECT u.id, u.email, ur.role 
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email LIKE '%bije%';

-- Cek profile bije
SELECT p.id, p.user_id, p.nama_lengkap, p.prodi_id, pr.nama as prodi_nama
FROM profiles p
LEFT JOIN prodi pr ON p.prodi_id = pr.id
LEFT JOIN users u ON p.user_id = u.id
WHERE u.email LIKE '%bije%';

-- Cek mata kuliah yang diampu bije
SELECT mkp.*, mk.nama_mk, mk.prodi_id, pr.nama as prodi_nama
FROM mata_kuliah_pengampu mkp
LEFT JOIN mata_kuliah mk ON mkp.mata_kuliah_id = mk.id
LEFT JOIN prodi pr ON mk.prodi_id = pr.id
LEFT JOIN profiles p ON mkp.dosen_id = p.user_id
LEFT JOIN users u ON p.user_id = u.id
WHERE u.email LIKE '%bije%';

-- Cek CPL dari prodi MTK
SELECT c.id, c.kode_cpl, c.deskripsi, c.prodi_id, p.nama as prodi_nama
FROM cpl c
LEFT JOIN prodi p ON c.prodi_id = p.id
WHERE c.is_active = 1 AND (p.nama LIKE '%Matematika%' OR p.kode LIKE '%MTK%');

-- Cek prodi MTK
SELECT * FROM prodi WHERE nama LIKE '%Matematika%' OR kode LIKE '%MTK%';
