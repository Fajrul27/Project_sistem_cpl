
import {
    LayoutDashboard,
    Database,
    GraduationCap,
    FileText,
    Users,
    Settings,
    BookOpen,
    Shield
} from "lucide-react";

export const RESOURCE_CATEGORIES = [
    {
        name: 'Dashboard',
        icon: LayoutDashboard,
        resources: [
            { id: 'dashboard', label: 'Dashboard', description: 'Halaman utama dashboard yang menampilkan ringkasan data.' },
        ]
    },
    {
        name: 'Master Data & Perencanaan',
        icon: Database,
        resources: [
            { id: 'visi_misi', label: 'Visi & Misi', description: 'Pengaturan Visi dan Misi Program Studi.' },
            { id: 'profil_lulusan', label: 'Profil Lulusan', description: 'Manajemen data Profil Lulusan yang diharapkan.' },
            { id: 'cpl', label: 'CPL & Mapping PL - CPL', description: 'Manajemen Capaian Pembelajaran Lulusan dan pemetaannya.' },
            { id: 'mata_kuliah', label: 'Mata Kuliah', description: 'Manajemen data Mata Kuliah.' },
        ]
    },
    {
        name: 'Persiapan & Pembelajaran',
        icon: GraduationCap,
        resources: [
            { id: 'cpmk', label: 'CPMK & Mapping CPMK - CPL', description: 'Manajemen Capaian Pembelajaran Mata Kuliah dan pemetaannya.' },
            { id: 'nilai_teknik', label: 'Input Nilai Teknik', description: 'Input nilai teknik penilaian mahasiswa.' },
            { id: 'kuesioner', label: 'Isi Kuesioner CPL', description: 'Pengisian kuesioner CPL oleh mahasiswa.' },
        ]
    },
    {
        name: 'Laporan & Evaluasi',
        icon: FileText,
        resources: [
            { id: 'transkrip_cpl', label: 'Capaian Pembelajaran', description: 'Laporan hasil capaian pembelajaran mahasiswa.' },
            { id: 'analisis_cpl', label: 'Analisis CPL', description: 'Analisis mendalam mengenai pencapaian CPL.' },
            { id: 'evaluasi_cpl', label: 'Evaluasi CPL', description: 'Evaluasi ketercapaian CPL.' },
            { id: 'rekap_kuesioner', label: 'Rekap Kuesioner', description: 'Rekapitulasi hasil pengisian kuesioner.' },
            { id: 'evaluasi_mk', label: 'Evaluasi Mata Kuliah', description: 'Evaluasi performa Mata Kuliah.' },
        ]
    },
    {
        name: 'Manajemen Pengguna',
        icon: Users,
        resources: [
            { id: 'dosen_pengampu', label: 'Dosen Pengampu', description: 'Manajemen penugasan dosen pengampu mata kuliah.' },
            { id: 'kaprodi_data', label: 'Data Kaprodi', description: 'Manajemen data Kepala Program Studi.' },
            { id: 'mahasiswa', label: 'Mahasiswa', description: 'Manajemen data Mahasiswa.' },
            { id: 'users', label: 'Pengguna Sistem', description: 'Manajemen seluruh pengguna sistem (admin, dosen, dll).' },
        ]
    },
    {
        name: 'Sistem & Referensi',
        icon: Settings,
        resources: [
            { id: 'roles', label: 'Kelola Role', description: 'Manajemen role pengguna (CRUD Role).' },
            { id: 'role_permissions', label: 'Hak Akses Role', description: 'Pengaturan hak akses fitur untuk setiap role.' },
            { id: 'default_role_permissions', label: 'Hak Akses Default Role', description: 'Pengaturan template default hak akses role.' },
            { id: 'fakultas', label: 'Data Fakultas', description: 'Manajemen referensi data Fakultas.' },
        ]
    },
];

export const ACTIONS = [
    { id: 'view', label: 'View', description: 'Izin untuk melihat data/halaman.' },
    { id: 'create', label: 'Create', description: 'Izin untuk membuat data baru.' },
    { id: 'edit', label: 'Edit', description: 'Izin untuk mengubah data yang ada.' },
    { id: 'delete', label: 'Delete', description: 'Izin untuk menghapus data.' },
    { id: 'view_all', label: 'View All', description: 'Izin untuk melihat semua data (misal: data dosen lain).' },
    { id: 'verify', label: 'Verify', description: 'Izin untuk melakukan verifikasi/approval data.' },
];
