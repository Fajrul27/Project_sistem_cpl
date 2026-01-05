import {
    BarChart3,
    BookOpen,
    FileText,
    GraduationCap,
    Database,
    Users,
    Settings,
    LayoutDashboard,
} from "lucide-react";
import { type UserRole } from "@/hooks/useUserRole";

export const MENU_ITEMS = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        roles: ["admin", "dosen", "mahasiswa", "kaprodi"] as UserRole[],
        resource: 'dashboard'
    },
    {
        title: "Master Data & Perencanaan",
        icon: Database,
        roles: ["admin", "kaprodi", "dosen", "mahasiswa"] as UserRole[],
        items: [
            { title: "Data Fakultas dan Prodi", url: "/dashboard/fakultas", roles: ["admin"], resource: 'fakultas' },
            { title: "Visi & Misi", url: "/dashboard/visi-misi", roles: ["admin", "dosen", "kaprodi", "mahasiswa"], resource: 'visi_misi' },
            { title: "Profil Lulusan", url: "/dashboard/profil-lulusan", roles: ["admin", "dosen", "kaprodi", "mahasiswa"], resource: 'profil_lulusan' },
            { title: "CPL & Mapping PL - CPL", url: "/dashboard/cpl", roles: ["admin", "dosen", "kaprodi"], resource: 'cpl' },
            { title: "Mata Kuliah", url: "/dashboard/mata-kuliah", icon: BookOpen, roles: ["admin", "kaprodi", "dosen"], resource: 'mata_kuliah' },
        ]
    },
    {
        title: "Persiapan & Pembelajaran",
        icon: GraduationCap,
        roles: ["admin", "dosen", "kaprodi", "mahasiswa"] as UserRole[],
        items: [
            { title: "CPMK & Mapping CPMK - CPL", url: "/dashboard/cpmk", roles: ["admin", "dosen", "kaprodi"], resource: 'cpmk' },
            { title: "Input Nilai Teknik", url: "/dashboard/nilai-teknik", roles: ["admin", "kaprodi", "dosen"], resource: 'nilai_teknik' },
            { title: "Isi Kuesioner CPL", url: "/dashboard/kuesioner", roles: ["mahasiswa"], resource: 'kuesioner' },
        ]
    },
    {
        title: "Laporan & Evaluasi",
        icon: FileText,
        roles: ["admin", "dosen", "kaprodi", "mahasiswa"] as UserRole[],
        items: [
            { title: "Capaian Pembelajaran", url: "/dashboard/transkrip-cpl", roles: ["admin", "dosen", "kaprodi", "mahasiswa"], resource: 'transkrip_cpl' },
            { title: "Analisis CPL", url: "/dashboard/analisis", roles: ["admin", "dosen", "kaprodi"], resource: 'analisis_cpl' },
            { title: "Evaluasi CPL", url: "/dashboard/evaluasi-cpl", roles: ["admin", "kaprodi", "dosen"], resource: 'evaluasi_cpl' },
            { title: "Rekap Kuesioner", url: "/dashboard/rekap-kuesioner", roles: ["admin", "kaprodi"], resource: 'rekap_kuesioner' },
        ]
    },
    {
        title: "Manajemen Pengguna",
        icon: Users,
        roles: ["admin", "dosen", "kaprodi"] as UserRole[],
        items: [
            { title: "Dosen Pengampu", url: "/dashboard/dosen-pengampu", roles: ["admin", "kaprodi"], resource: 'dosen_pengampu' },
            { title: "Data Kaprodi", url: "/dashboard/kaprodi-data", roles: ["admin"], resource: 'kaprodi_data' },
            { title: "Mahasiswa", url: "/dashboard/mahasiswa", roles: ["admin", "dosen", "kaprodi"], resource: 'mahasiswa' },
            { title: "Pengguna Sistem", url: "/dashboard/users", roles: ["admin"], resource: 'users' },
        ]
    },
    {
        title: "Sistem",
        icon: Settings,
        roles: ["admin", "dosen", "kaprodi"] as UserRole[],
        items: [
            { title: "Kelola Role", url: "/dashboard/role-management", roles: ["admin"], resource: 'roles' },
            { title: "Hak Akses Role", url: "/dashboard/role-access", roles: ["admin"], resource: 'role_permissions' },
            { title: "Hak Akses Default Role", url: "/dashboard/default-role-access", roles: ["admin"], resource: 'default_role_permissions' },
            { title: "Log Aktivitas", url: "/dashboard/activity-log", roles: ["admin"], resource: 'audit_log' },
        ]
    }
];
