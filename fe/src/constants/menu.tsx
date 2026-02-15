import {
    BarChart3,
    BookOpen,
    FileText,
    GraduationCap,
    Database,
    Users,
    Settings,
    LayoutDashboard,
    BookCheck,
} from "lucide-react";
import { type UserRole } from "@/hooks/useUserRole";

export const MENU_ITEMS = [
    {
        title: "Beranda",
        url: "/dashboard",
        icon: LayoutDashboard,
        roles: ["admin", "dosen", "mahasiswa", "kaprodi"] as UserRole[],
        resource: 'dashboard'
    },
    {
        title: "Data Institusi",
        icon: Database,
        roles: ["admin", "kaprodi"] as UserRole[],
        items: [
            { title: "Unit & Jenjang", url: "/dashboard/fakultas", roles: ["admin"], resource: 'fakultas' },
            { title: "Manajemen Skala Nilai", url: "/dashboard/skala-nilai", roles: ["admin", "kaprodi"], resource: 'fakultas' },
        ]
    },
    {
        title: "Akademik",
        icon: BookCheck,
        roles: ["admin", "kaprodi", "dosen"] as UserRole[],
        items: [
            { title: "Master Akademik", url: "/dashboard/master-akademik", roles: ["admin", "kaprodi"], resource: 'tahun_ajaran' },
            { title: "Registrasi KRS", url: "/dashboard/krs", roles: ["admin", "kaprodi"], resource: 'tahun_ajaran' },
        ]
    },
    {
        title: "Perencanaan OBE",
        icon: LayoutDashboard,
        roles: ["admin", "kaprodi", "dosen", "mahasiswa"] as UserRole[],
        items: [
            { title: "Visi & Misi", url: "/dashboard/visi-misi", roles: ["admin", "dosen", "kaprodi", "mahasiswa"], resource: 'visi_misi' },
            { title: "Profil Lulusan", url: "/dashboard/profil-lulusan", roles: ["admin", "dosen", "kaprodi", "mahasiswa"], resource: 'profil_lulusan' },
            { title: "Data CPL", url: "/dashboard/cpl", roles: ["admin", "dosen", "kaprodi"], resource: 'cpl' },
            { title: "Mata Kuliah", url: "/dashboard/mata-kuliah", icon: BookOpen, roles: ["admin", "kaprodi", "dosen"], resource: 'mata_kuliah' },
        ]
    },
    {
        title: "Pembelajaran",
        icon: GraduationCap,
        roles: ["admin", "dosen", "kaprodi", "mahasiswa"] as UserRole[],
        items: [
            { title: "Data CPMK", url: "/dashboard/cpmk", roles: ["admin", "dosen", "kaprodi"], resource: 'cpmk' },
            { title: "Penilaian", url: "/dashboard/nilai-teknik", roles: ["admin", "kaprodi", "dosen"], resource: 'nilai_teknik' },
        ]
    },
    {
        title: "Monev CPL",
        icon: FileText,
        roles: ["admin", "dosen", "kaprodi", "mahasiswa"] as UserRole[],
        items: [
            { title: "Transkrip CPL", url: "/dashboard/transkrip-cpl", roles: ["admin", "dosen", "kaprodi", "mahasiswa"], resource: 'transkrip_cpl' },
            { title: "Analisis CPL", url: "/dashboard/analisis", roles: ["admin", "dosen", "kaprodi"], resource: 'analisis_cpl' },
            { title: "Evaluasi Kurikulum", url: "/dashboard/evaluasi-cpl", roles: ["admin", "kaprodi", "dosen"], resource: 'evaluasi_cpl' },
        ]
    },
    {
        title: "Sivitas Akademika",
        icon: Users,
        roles: ["admin", "dosen", "kaprodi"] as UserRole[],
        items: [
            { title: "Dosen Pengampu", url: "/dashboard/dosen-pengampu", roles: ["admin", "kaprodi"], resource: 'dosen_pengampu' },
            { title: "Data Kaprodi", url: "/dashboard/kaprodi-data", roles: ["admin"], resource: 'kaprodi_data' },
            { title: "Data Mahasiswa", url: "/dashboard/mahasiswa", roles: ["admin", "dosen", "kaprodi"], resource: 'mahasiswa' },
            { title: "Akun Pengguna", url: "/dashboard/users", roles: ["admin"], resource: 'users' },
        ]
    },
    {
        title: "Sistem",
        icon: Settings,
        roles: ["admin", "dosen", "kaprodi"] as UserRole[],
        items: [
            { title: "Daftar Role", url: "/dashboard/role-management", roles: ["admin"], resource: 'roles' },
            { title: "Hak Akses", url: "/dashboard/role-access", roles: ["admin"], resource: 'role_permissions' },
            { title: "Default Akses", url: "/dashboard/default-role-access", roles: ["admin"], resource: 'default_role_permissions' },
            { title: "Log Aktivitas", url: "/dashboard/activity-log", roles: ["admin"], resource: 'audit_log' },
        ]
    }
];
