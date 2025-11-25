import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { DashboardPage } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { fetchAllUsers, updateUserRole, createUserWithRole, updateUser, deleteUser, updateProfile } from "@/lib/api-client";
import { Search, SlidersHorizontal } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface UserRow {
  id: string;
  email: string;
  role: string;
  namaLengkap?: string | null;
  nim?: string | null;
  nip?: string | null;
  fakultas?: string | null;
  programStudi?: string | null;
  semester?: number | null;
  profileId?: string | null;
}

interface NewUserForm {
  fullName: string;
  email: string;
  password: string;
  role: string;
  fakultas: string;
  prodi: string;
  identityType: "mahasiswa" | "dosen";
  identityNumber: string;
  semester: string;
}

interface EditUserForm {
  fullName: string;
  email: string;
  role: string;
  fakultas: string;
  prodi: string;
  identityType: "mahasiswa" | "dosen";
  identityNumber: string;
  semester: string;
}

const FAKULTAS_OPTIONS = [
  {
    value: "fkip",
    label: "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)",
    prodi: [
      {
        value: "bk",
        label: "Bimbingan dan Konseling",
      },
      {
        value: "pgsd",
        label: "Pendidikan Guru SD (PGSD)",
      },
      {
        value: "piaud",
        label: "Pendidikan Islam Anak Usia Dini (PIAUD)",
      },
      {
        value: "mpi",
        label: "Manajemen Pendidikan Islam (MPI)",
      },
    ],
  },
  {
    value: "fmikom",
    label: "Fakultas Matematika dan Komputer (FMIKOM)",
    prodi: [
      {
        value: "matematika",
        label: "Matematika",
      },
      {
        value: "informatika",
        label: "Informatika",
      },
      {
        value: "sistem-informasi",
        label: "Sistem Informasi",
      },
    ],
  },
  {
    value: "fti",
    label: "Fakultas Teknologi Industri (FTI)",
    prodi: [
      {
        value: "ti",
        label: "Teknik Industri (Fakultas Teknologi Industri - FTI)",
      },
      {
        value: "teknik-kimia",
        label: "Teknik Kimia",
      },
      {
        value: "teknik-mesin",
        label: "Teknik Mesin (Fakultas Teknologi Industri - FTI)",
      },
    ],
  },
  {
    value: "fe",
    label: "Fakultas Ekonomi (FE)",
    prodi: [
      {
        value: "manajemen",
        label: "Manajemen",
      },
      {
        value: "ekonomi-pembangunan",
        label: "Ekonomi Pembangunan",
      },
    ],
  },
  {
    value: "fki",
    label: "Fakultas Keagamaan Islam (FKI)",
    prodi: [
      {
        value: "pai",
        label: "Pendidikan Agama Islam (PAI)",
      },
      {
        value: "pgmi",
        label: "Pendidikan Guru Madrasah Ibtidaiyah (PGMI)",
      },
      {
        value: "kpi",
        label: "Komunikasi dan Penyiaran Islam (KPI)",
      },
      {
        value: "ahwal-al-syakhshiyyah",
        label: "Ahwal Al-Syakhshiyyah / Hukum Keluarga Islam",
      },
    ],
  },
];

type ProdiOption = { value: string; label: string };
type FakultasOption = { value: string; label: string; prodi: ProdiOption[] };

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "dosen", label: "Dosen" },
  { value: "mahasiswa", label: "Mahasiswa" },
  { value: "kaprodi", label: "Kaprodi" },
];

const UsersPage = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState<NewUserForm>({
    fullName: "",
    email: "",
    password: "",
    role: "mahasiswa",
    fakultas: "",
    prodi: "",
    identityType: "mahasiswa",
    identityNumber: "",
    // disimpan sebagai string di form, dikirim sebagai number ke backend
    semester: "",
  });
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [facultyFilter, setFacultyFilter] = useState<string>("all");
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editData, setEditData] = useState<EditUserForm>({
    fullName: "",
    email: "",
    role: "mahasiswa",
    fakultas: "",
    prodi: "",
    identityType: "mahasiswa",
    identityNumber: "",
    semester: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selectedFakultas = FAKULTAS_OPTIONS.find(
    (f) => f.value === newUser.fakultas
  );

  const selectedEditFakultas = FAKULTAS_OPTIONS.find(
    (f) => f.value === editData.fakultas
  );

  const selectedFacultyFilter =
    facultyFilter === "all"
      ? undefined
      : FAKULTAS_OPTIONS.find((f) => f.value === facultyFilter);

  const programFilterOptions: ProdiOption[] = selectedFacultyFilter
    ? (selectedFacultyFilter.prodi as ProdiOption[])
    : (FAKULTAS_OPTIONS.flatMap((f) => f.prodi) as ProdiOption[]);

  const hasActiveFilter =
    roleFilter !== "all" ||
    facultyFilter !== "all" ||
    programFilter !== "all" ||
    semesterFilter !== "all";

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetchAllUsers();
      const data = (response?.data || []) as any[];

      const mapped: UserRow[] = data.map((u) => {
        let fakultasName: string | null = null;
        let prodiName: string | null = null;
        const fullProgram = (u.profile?.programStudi || null) as string | null;

        if (fullProgram) {
          if (fullProgram.includes(" - ")) {
            const [fLabel, pLabel] = fullProgram
              .split(" - ")
              .map((s: string) => s.trim());
            fakultasName = fLabel || null;
            prodiName = pLabel || null;
          } else {
            // Try to infer faculty from prodi name
            prodiName = fullProgram;

            // Search in FAKULTAS_OPTIONS
            for (const fak of FAKULTAS_OPTIONS) {
              const foundProdi = fak.prodi.find(p =>
                p.label.toLowerCase() === fullProgram.toLowerCase() ||
                p.value.toLowerCase() === fullProgram.toLowerCase()
              );

              if (foundProdi) {
                fakultasName = fak.label;
                prodiName = foundProdi.label; // Normalize to label
                break;
              }
            }
          }
        }

        return {
          id: u.id,
          email: u.email,
          role: u.role?.role || "mahasiswa",
          namaLengkap: u.profile?.namaLengkap,
          nim: u.profile?.nim,
          nip: u.profile?.nip,
          fakultas: fakultasName,
          programStudi: prodiName,
          semester: u.profile?.semester,
          profileId: u.profile?.id,
        };
      });

      setUsers(mapped);
    } catch (error: any) {
      console.error("Gagal memuat users:", error);
      toast.error("Gagal memuat data pengguna");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      u.email.toLowerCase().includes(q) ||
      (u.namaLengkap || "").toLowerCase().includes(q) ||
      (u.nim || "").toLowerCase().includes(q) ||
      (u.nip || "").toLowerCase().includes(q) ||
      (u.fakultas || "").toLowerCase().includes(q) ||
      (u.programStudi || "").toLowerCase().includes(q) ||
      (u.semester !== null && u.semester !== undefined
        ? String(u.semester).includes(q)
        : false);

    const matchRole = roleFilter === "all" || u.role === roleFilter;

    const facultyLabelFilter =
      facultyFilter === "all"
        ? undefined
        : FAKULTAS_OPTIONS.find((f) => f.value === facultyFilter)?.label;

    const programLabelFilter =
      programFilter === "all"
        ? undefined
        : programFilterOptions.find((p) => p.value === programFilter)?.label;

    const matchFacultyFilter =
      !facultyLabelFilter || u.fakultas === facultyLabelFilter;

    const matchProgramFilter =
      !programLabelFilter || u.programStudi === programLabelFilter;

    const matchSemesterFilter =
      semesterFilter === "all" ||
      (u.semester !== null && u.semester !== undefined &&
        String(u.semester) === semesterFilter);

    return (
      matchSearch &&
      matchRole &&
      matchFacultyFilter &&
      matchProgramFilter &&
      matchSemesterFilter
    );
  });

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();

    if (!newUser.email || !newUser.password || !newUser.fullName) {
      toast.error("Nama, email, dan password harus diisi");
      return;
    }

    try {
      setCreating(true);

      const profilePayload: {
        nim?: string;
        nip?: string;
        programStudi?: string | null;
        semester?: number | null;
      } = {};

      if (newUser.identityNumber.trim()) {
        if (newUser.identityType === "mahasiswa") {
          profilePayload.nim = newUser.identityNumber.trim();
        } else {
          profilePayload.nip = newUser.identityNumber.trim();
        }
      }

      if (newUser.fakultas || newUser.prodi) {
        const fakultasLabel = FAKULTAS_OPTIONS.find(
          (f) => f.value === newUser.fakultas
        )?.label;
        const prodiLabel = selectedFakultas?.prodi.find(
          (p) => p.value === newUser.prodi
        )?.label;

        const combined = [fakultasLabel, prodiLabel]
          .filter(Boolean)
          .join(" - ");
        profilePayload.programStudi = combined || null;
      }

      if (newUser.semester.trim()) {
        const parsed = parseInt(newUser.semester.trim(), 10);
        profilePayload.semester = Number.isNaN(parsed) ? null : parsed;
      }

      await createUserWithRole(
        newUser.email,
        newUser.password,
        newUser.fullName,
        newUser.role,
        profilePayload
      );

      toast.success("Pengguna baru berhasil dibuat");
      setNewUser({
        fullName: "",
        email: "",
        password: "",
        role: "mahasiswa",
        fakultas: "",
        prodi: "",
        identityType: "mahasiswa",
        identityNumber: "",
        semester: "",
      });
      await loadUsers();
    } catch (error: any) {
      console.error("Gagal membuat pengguna:", error);
      toast.error(error.message || "Gagal membuat pengguna baru");
    } finally {
      setCreating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    if (!editData.email) {
      toast.error("Email tidak boleh kosong");
      return;
    }

    try {
      setSavingEdit(true);

      await updateUser(editingUser.id, {
        email: editData.email,
        fullName: editData.fullName,
      });

      if (editData.role !== editingUser.role) {
        await updateUserRole(editingUser.id, editData.role);
      }

      let newNim: string | null = null;
      let newNip: string | null = null;
      let newProgramStudi: string | null | undefined = undefined;
      let newSemester: number | null | undefined = undefined;

      const identityTrimmed = editData.identityNumber.trim();
      if (identityTrimmed) {
        if (editData.identityType === "mahasiswa") {
          newNim = identityTrimmed;
          newNip = null;
        } else {
          newNip = identityTrimmed;
          newNim = null;
        }
      } else {
        newNim = null;
        newNip = null;
      }

      if (editData.fakultas || editData.prodi) {
        const fakultasLabel = FAKULTAS_OPTIONS.find(
          (f) => f.value === editData.fakultas
        )?.label;
        const prodiLabel = selectedEditFakultas?.prodi.find(
          (p) => p.value === editData.prodi
        )?.label;

        const combined = [fakultasLabel, prodiLabel]
          .filter(Boolean)
          .join(" - ");
        newProgramStudi = combined || null;
      } else {
        newProgramStudi = null;
      }

      if (editData.semester.trim()) {
        const parsed = parseInt(editData.semester.trim(), 10);
        newSemester = Number.isNaN(parsed) ? null : parsed;
      } else {
        newSemester = null;
      }

      if (editingUser.profileId) {
        await updateProfile(editingUser.profileId, {
          nim: newNim,
          nip: newNip,
          programStudi: newProgramStudi,
          semester: newSemester,
        });
      }

      toast.success("Pengguna berhasil diperbarui");
      // Refresh tabel dari backend supaya data selalu konsisten
      await loadUsers();

      setEditingUser(null);
    } catch (error: any) {
      console.error("Gagal memperbarui pengguna:", error);
      toast.error(error.message || "Gagal memperbarui pengguna");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!editingUser) return;

    const confirmDelete = window.confirm(
      "Yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan."
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(editingUser.id);
      await deleteUser(editingUser.id);
      toast.success("Pengguna berhasil dihapus");
      setUsers((prev) => prev.filter((u) => u.id !== editingUser.id));
      setEditingUser(null);
    } catch (error: any) {
      console.error("Gagal menghapus pengguna:", error);
      toast.error(error.message || "Gagal menghapus pengguna");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <DashboardPage title="Manajemen Pengguna">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title="Manajemen Pengguna"
      description="Kelola akun dan role pengguna dalam sistem"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari email, nama, NIM, NIP, fakultas, prodi, atau semester..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={hasActiveFilter ? "default" : "outline"}
                size="sm"
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
                <span className="sm:hidden">Filter</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Role</Label>
                  <Select
                    value={roleFilter}
                    onValueChange={(value) => setRoleFilter(value)}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Semua role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua role</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="dosen">Dosen</SelectItem>
                      <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                      <SelectItem value="kaprodi">Kaprodi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Fakultas</Label>
                  <Select
                    value={facultyFilter}
                    onValueChange={(value) => {
                      setFacultyFilter(value);
                      setProgramFilter("all");
                    }}
                  >
                    <SelectTrigger className="w-full h-8 text-xs text-left">
                      <SelectValue placeholder="Semua fakultas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua fakultas</SelectItem>
                      {FAKULTAS_OPTIONS.map((fak) => (
                        <SelectItem
                          key={fak.value}
                          value={fak.value}
                          className="whitespace-normal text-xs"
                        >
                          {fak.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Program Studi</Label>
                  <Select
                    value={programFilter}
                    onValueChange={(value) => setProgramFilter(value)}
                    disabled={
                      facultyFilter === "all" && programFilterOptions.length === 0
                    }
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Semua prodi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua prodi</SelectItem>
                      {programFilterOptions.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Semester</Label>
                  <Select
                    value={semesterFilter}
                    onValueChange={(value) => setSemesterFilter(value)}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Semua semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua semester</SelectItem>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <SelectItem key={s} value={String(s)}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-between pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRoleFilter("all");
                    setFacultyFilter("all");
                    setProgramFilter("all");
                    setSemesterFilter("all");
                  }}
                >
                  Reset
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={loadUsers}>
            Muat Ulang
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base md:text-lg">Daftar Pengguna</CardTitle>
              <CardDescription className="text-xs md:text-sm text-muted-foreground">
                Menampilkan <span className="font-medium">{filteredUsers.length}</span> dari{" "}
                <span className="font-medium">{users.length}</span> pengguna
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setShowCreate((prev) => !prev)}
              className="mt-2 sm:mt-0"
            >
              {showCreate ? "Tutup" : "Tambah Pengguna"}
            </Button>
          </CardHeader>
          <CardContent>
            {showCreate && (
              <div className="mb-6 border rounded-lg p-4 bg-muted/30">
                <form
                  onSubmit={handleCreateUser}
                  className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end"
                >
                  <div className="space-y-2">
                    <Label htmlFor="new-fullname">Nama Lengkap</Label>
                    <Input
                      id="new-fullname"
                      placeholder="Nama lengkap"
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                      disabled={creating}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-email">Email</Label>
                    <Input
                      id="new-email"
                      type="email"
                      placeholder="nama@example.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      disabled={creating}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Minimal 6 karakter"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      disabled={creating}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-fakultas">Fakultas</Label>
                    <Select
                      value={newUser.fakultas}
                      onValueChange={(value) =>
                        setNewUser({
                          ...newUser,
                          fakultas: value,
                          prodi: "",
                        })
                      }
                      disabled={creating}
                    >
                      <SelectTrigger id="new-fakultas" className="w-full">
                        <SelectValue placeholder="Pilih fakultas" />
                      </SelectTrigger>
                      <SelectContent>
                        {FAKULTAS_OPTIONS.map((fak) => (
                          <SelectItem key={fak.value} value={fak.value}>
                            {fak.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-semester">Semester (Mahasiswa)</Label>
                    <Input
                      id="new-semester"
                      type="number"
                      min={1}
                      max={14}
                      placeholder="Contoh: 1, 2, 3 ..."
                      value={newUser.semester}
                      onChange={(e) =>
                        setNewUser({ ...newUser, semester: e.target.value })
                      }
                      disabled={creating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-prodi">Program Studi</Label>
                    <Select
                      value={newUser.prodi}
                      onValueChange={(value) =>
                        setNewUser({ ...newUser, prodi: value })
                      }
                      disabled={creating || !selectedFakultas}
                    >
                      <SelectTrigger id="new-prodi" className="w-full">
                        <SelectValue
                          placeholder={
                            selectedFakultas
                              ? "Pilih program studi"
                              : "Pilih fakultas dulu"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedFakultas?.prodi.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-identitas-tipe">Tipe Identitas</Label>
                    <Select
                      value={newUser.identityType}
                      onValueChange={(value) =>
                        setNewUser({
                          ...newUser,
                          identityType: value as "mahasiswa" | "dosen",
                          identityNumber: "",
                        })
                      }
                      disabled={creating}
                    >
                      <SelectTrigger id="new-identitas-tipe" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mahasiswa">Mahasiswa (NIM)</SelectItem>
                        <SelectItem value="dosen">Dosen (NIP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-identitas">
                      {newUser.identityType === "mahasiswa" ? "NIM" : "NIP"}
                    </Label>
                    <Input
                      id="new-identitas"
                      placeholder={
                        newUser.identityType === "mahasiswa"
                          ? "Masukkan NIM (opsional)"
                          : "Masukkan NIP (opsional)"
                      }
                      value={newUser.identityNumber}
                      onChange={(e) =>
                        setNewUser({ ...newUser, identityNumber: e.target.value })
                      }
                      disabled={creating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-role">Role</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                    >
                      <SelectTrigger id="new-role" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                    <Button type="submit" disabled={creating}>
                      {creating ? "Menyimpan..." : "Simpan Pengguna"}
                    </Button>
                  </div>
                </form>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Identitas</TableHead>
                  <TableHead>Fakultas</TableHead>
                  <TableHead>Program Studi</TableHead>
                  <TableHead className="text-center">Semester</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Tidak ada data pengguna
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono text-xs md:text-sm">
                        {user.email}
                      </TableCell>
                      <TableCell>{user.namaLengkap || "-"}</TableCell>
                      <TableCell>
                        {user.nim ? (
                          <Badge variant="secondary" className="inline-flex">NIM: {user.nim}</Badge>
                        ) : user.nip ? (
                          <Badge variant="outline" className="inline-flex">NIP: {user.nip}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="max-w-[220px]">
                        <span className="block text-xs md:text-sm whitespace-normal break-words">
                          {user.fakultas || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[240px]">
                        <span className="block text-xs md:text-sm whitespace-normal break-words">
                          {user.programStudi || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-xs md:text-sm">
                        {user.semester !== null && user.semester !== undefined
                          ? user.semester
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/20"
                          onClick={() => {
                            setEditingUser(user);
                            // Mapping awal untuk fakultas, prodi, dan identitas
                            let fakultasValue = "";
                            let prodiValue = "";
                            if (user.fakultas) {
                              const fak = FAKULTAS_OPTIONS.find(
                                (f) => f.label === user.fakultas
                              );
                              if (fak) {
                                fakultasValue = fak.value;
                                if (user.programStudi) {
                                  const pOpt = fak.prodi.find(
                                    (p) => p.label === user.programStudi
                                  );
                                  if (pOpt) {
                                    prodiValue = pOpt.value;
                                  }
                                }
                              }
                            }

                            let identityType: "mahasiswa" | "dosen" = "mahasiswa";
                            let identityNumber = "";
                            if (user.nim) {
                              identityType = "mahasiswa";
                              identityNumber = user.nim;
                            } else if (user.nip) {
                              identityType = "dosen";
                              identityNumber = user.nip;
                            }

                            setEditData({
                              fullName: user.namaLengkap || "",
                              email: user.email,
                              role: user.role,
                              fakultas: fakultasValue,
                              prodi: prodiValue,
                              identityType,
                              identityNumber,
                              semester:
                                user.semester !== null && user.semester !== undefined
                                  ? String(user.semester)
                                  : "",
                            });
                          }}
                        >
                          Kelola
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog
          open={!!editingUser}
          onOpenChange={(open) => {
            if (!open && !savingEdit && !deletingId) {
              setEditingUser(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kelola Pengguna</DialogTitle>
              <DialogDescription>
                Ubah email, nama, dan role atau hapus akun pengguna.
              </DialogDescription>
            </DialogHeader>

            {editingUser && (
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editData.email}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    disabled={savingEdit || deletingId === editingUser.id}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fullname">Nama Lengkap</Label>
                  <Input
                    id="edit-fullname"
                    value={editData.fullName}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    disabled={savingEdit || deletingId === editingUser.id}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fakultas">Fakultas</Label>
                  <Select
                    value={editData.fakultas}
                    onValueChange={(value) =>
                      setEditData((prev) => ({
                        ...prev,
                        fakultas: value,
                        prodi: "",
                      }))
                    }
                    disabled={savingEdit || deletingId === editingUser.id}
                  >
                    <SelectTrigger id="edit-fakultas" className="w-full">
                      <SelectValue placeholder="Pilih fakultas" />
                    </SelectTrigger>
                    <SelectContent>
                      {FAKULTAS_OPTIONS.map((fak) => (
                        <SelectItem key={fak.value} value={fak.value}>
                          {fak.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-prodi">Program Studi</Label>
                  <Select
                    value={editData.prodi}
                    onValueChange={(value) =>
                      setEditData((prev) => ({ ...prev, prodi: value }))
                    }
                    disabled={
                      savingEdit ||
                      deletingId === editingUser.id ||
                      !selectedEditFakultas
                    }
                  >
                    <SelectTrigger id="edit-prodi" className="w-full">
                      <SelectValue
                        placeholder={
                          selectedEditFakultas
                            ? "Pilih program studi"
                            : "Pilih fakultas dulu"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedEditFakultas?.prodi.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-semester">Semester (Mahasiswa)</Label>
                  <Input
                    id="edit-semester"
                    type="number"
                    min={1}
                    max={14}
                    placeholder="Contoh: 1, 2, 3 ..."
                    value={editData.semester}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        semester: e.target.value,
                      }))
                    }
                    disabled={savingEdit || deletingId === editingUser.id}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-identitas-tipe">Tipe Identitas</Label>
                  <Select
                    value={editData.identityType}
                    onValueChange={(value) =>
                      setEditData((prev) => ({
                        ...prev,
                        identityType: value as "mahasiswa" | "dosen",
                        identityNumber: "",
                      }))
                    }
                    disabled={savingEdit || deletingId === editingUser.id}
                  >
                    <SelectTrigger id="edit-identitas-tipe" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mahasiswa">Mahasiswa (NIM)</SelectItem>
                      <SelectItem value="dosen">Dosen (NIP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-identitas">
                    {editData.identityType === "mahasiswa" ? "NIM" : "NIP"}
                  </Label>
                  <Input
                    id="edit-identitas"
                    placeholder={
                      editData.identityType === "mahasiswa"
                        ? "Masukkan NIM (opsional)"
                        : "Masukkan NIP (opsional)"
                    }
                    value={editData.identityNumber}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        identityNumber: e.target.value,
                      }))
                    }
                    disabled={savingEdit || deletingId === editingUser.id}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={editData.role}
                    onValueChange={(value) =>
                      setEditData((prev) => ({ ...prev, role: value }))
                    }
                    disabled={savingEdit || deletingId === editingUser.id}
                  >
                    <SelectTrigger id="edit-role" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-2">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteUser}
                    disabled={savingEdit || deletingId === editingUser.id}
                  >
                    {deletingId === editingUser.id ? "Menghapus..." : "Hapus Pengguna"}
                  </Button>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (!savingEdit && !deletingId) {
                          setEditingUser(null);
                        }
                      }}
                    >
                      Batal
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={savingEdit || deletingId === editingUser.id}
                    >
                      {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardPage>
  );
};

export default UsersPage;
