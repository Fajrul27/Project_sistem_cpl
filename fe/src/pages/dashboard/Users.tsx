import { useEffect, useState, FormEvent } from "react";
import { DashboardPage } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { fetchAllUsers, updateUserRole, createUserWithRole, updateUser, deleteUser, updateProfile, fetchKelas, fetchFakultasList, fetchAngkatanList } from "@/lib/api-client";
import { Search, SlidersHorizontal } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  kelasId?: string | null;
  profileId?: string | null;
  angkatan?: number | null;
  angkatanId?: string | null;
}

interface NewUserForm {
  fullName: string;
  email: string;
  password: string;
  role: string;
  fakultasId: string;
  prodiId: string;
  identityType: "mahasiswa" | "dosen";
  identityNumber: string;
  semester: string;
  kelasId?: string;
  angkatanId?: string;
}

interface EditUserForm {
  fullName: string;
  email: string;
  role: string;
  fakultas: string; // This is actually fakultasId
  prodi: string;    // This is actually prodiId
  identityType: "mahasiswa" | "dosen";
  identityNumber: string;
  semester: string;
  kelasId?: string;
  angkatanId?: string;
}

type ProdiOption = { id: string; nama: string; kode: string };
type FakultasOption = { id: string; nama: string; kode: string; prodi: ProdiOption[] };

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "dosen", label: "Dosen" },
  { value: "mahasiswa", label: "Mahasiswa" },
  { value: "kaprodi", label: "Kaprodi" },
];

const UsersPage = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fakultasList, setFakultasList] = useState<FakultasOption[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [creating, setCreating] = useState(false);
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [angkatanList, setAngkatanList] = useState<any[]>([]);
  const [newUser, setNewUser] = useState<NewUserForm>({
    fullName: "",
    email: "",
    password: "",
    role: "dosen", // Default to dosen since activeTab is staff
    fakultasId: "",
    prodiId: "",
    identityType: "dosen",
    identityNumber: "",
    semester: "",
    kelasId: "",
    angkatanId: "",
  });
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [facultyFilter, setFacultyFilter] = useState<string>("all");
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  const [kelasFilter, setKelasFilter] = useState<string>("all");
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
    kelasId: "",
    angkatanId: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("staff");

  useEffect(() => {
    loadUsers();
    loadKelas();
    loadFakultas();
    loadAngkatan();
  }, []);

  const loadAngkatan = async () => {
    try {
      const res = await fetchAngkatanList();
      if (res.data) setAngkatanList(res.data);
    } catch (error) {
      console.error("Error fetching angkatan:", error);
    }
  };

  const loadFakultas = async () => {
    try {
      const res = await fetchFakultasList();
      if (res.data) setFakultasList(res.data);
    } catch (error) {
      console.error("Error fetching fakultas:", error);
    }
  };

  const loadKelas = async () => {
    try {
      const res = await fetchKelas();
      if (res.data) setKelasList(res.data);
    } catch (error) {
      console.error("Error fetching kelas:", error);
    }
  };

  const selectedFakultas = fakultasList.find(
    (f) => f.id === newUser.fakultasId
  );

  const selectedEditFakultas = fakultasList.find(
    (f) => f.id === editData.fakultas
  );

  const selectedFacultyFilter =
    facultyFilter === "all"
      ? undefined
      : fakultasList.find((f) => f.id === facultyFilter);

  const programFilterOptions: ProdiOption[] = selectedFacultyFilter
    ? (selectedFacultyFilter.prodi as ProdiOption[])
    : (fakultasList.flatMap((f) => f.prodi) as ProdiOption[]);

  const hasActiveFilter =
    roleFilter !== "all" ||
    facultyFilter !== "all" ||
    programFilter !== "all" ||
    roleFilter !== "all" ||
    facultyFilter !== "all" ||
    programFilter !== "all" ||
    semesterFilter !== "all" ||
    kelasFilter !== "all";

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetchAllUsers({ limit: -1 });
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

            // Search in fakultasList
            for (const fak of fakultasList) {
              const foundProdi = fak.prodi.find(p =>
                p.nama.toLowerCase() === fullProgram.toLowerCase() ||
                p.kode.toLowerCase() === fullProgram.toLowerCase()
              );

              if (foundProdi) {
                fakultasName = fak.nama;
                prodiName = foundProdi.nama; // Normalize to label
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
          kelasId: u.profile?.kelasId,
          profileId: u.profile?.id,
          angkatan: u.profile?.angkatanRef?.tahun,
          angkatanId: u.profile?.angkatanId,
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
        : fakultasList.find((f) => f.id === facultyFilter)?.nama;

    const programLabelFilter =
      programFilter === "all"
        ? undefined
        : programFilterOptions.find((p) => p.id === programFilter)?.nama;

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
      matchProgramFilter &&
      matchSemesterFilter &&
      (kelasFilter === "all" || u.kelasId === kelasFilter)
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
        kelasId?: string;
        prodiId?: string;
        fakultasId?: string;
      } = {};

      if (newUser.identityNumber.trim()) {
        if (newUser.identityType === "mahasiswa") {
          profilePayload.nim = newUser.identityNumber.trim();
        } else {
          profilePayload.nip = newUser.identityNumber.trim();
        }
      }

      if (newUser.fakultasId || newUser.prodiId) {
        const fakultasLabel = fakultasList.find(
          (f) => f.id === newUser.fakultasId
        )?.nama;
        const prodiLabel = selectedFakultas?.prodi.find(
          (p) => p.id === newUser.prodiId
        )?.nama;

        const combined = [fakultasLabel, prodiLabel]
          .filter(Boolean)
          .join(" - ");
        profilePayload.programStudi = combined || null;
        profilePayload.prodiId = newUser.prodiId;
        profilePayload.fakultasId = newUser.fakultasId;
      }

      if (newUser.semester.trim()) {
        const parsed = parseInt(newUser.semester.trim(), 10);
        profilePayload.semester = Number.isNaN(parsed) ? null : parsed;
      }

      if (newUser.kelasId) {
        profilePayload.kelasId = newUser.kelasId;
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
        fakultasId: "",
        prodiId: "",
        identityType: "mahasiswa",
        identityNumber: "",
        semester: "",
        kelasId: "",
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

      let prodiId: string | null = null;
      let fakultasId: string | null = null;

      if (editData.fakultas || editData.prodi) {
        const fakultasLabel = fakultasList.find(
          (f) => f.id === editData.fakultas
        )?.nama;
        const prodiLabel = selectedEditFakultas?.prodi.find(
          (p) => p.id === editData.prodi
        )?.nama;

        const combined = [fakultasLabel, prodiLabel]
          .filter(Boolean)
          .join(" - ");
        newProgramStudi = combined || null;
        prodiId = editData.prodi || null;
        fakultasId = editData.fakultas || null;
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
          kelasId: editData.kelasId || null,
          prodiId,
          fakultasId,
          angkatanId: editData.angkatanId || null,
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
                {/* Role Filter - Only for Staff/Dosen if needed, but user asked for specific filters. 
                    If activeTab is staff, user said "fakultas dan prodi". 
                    If activeTab is mahasiswa, user said "fakultas, prodi, semester, kelas".
                    So we hide Role filter for now as per instruction, or maybe keep it for Staff?
                    User instruction: "pada Separate Tab dosen, fungsi filter mnampilkan fakultas dan prodi"
                    So I will hide Role filter.
                */}

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
                      {fakultasList.map((fak) => (
                        <SelectItem
                          key={fak.id}
                          value={fak.id}
                          className="whitespace-normal text-xs"
                        >
                          {fak.nama}
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
                        <SelectItem key={p.id} value={p.id}>
                          {p.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {activeTab === "mahasiswa" && (
                  <>
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
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Kelas</Label>
                      <Select
                        value={kelasFilter}
                        onValueChange={(value) => setKelasFilter(value)}
                      >
                        <SelectTrigger className="w-full h-8 text-xs">
                          <SelectValue placeholder="Semua kelas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua kelas</SelectItem>
                          {kelasList.map((k) => (
                            <SelectItem key={k.id} value={k.id}>
                              {k.nama}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
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
                    setKelasFilter("all");
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

        <Tabs value={activeTab} onValueChange={(val) => {
          setActiveTab(val);
          setShowCreate(false);
          // Fully reset form state when switching tabs
          setNewUser({
            fullName: "",
            email: "",
            password: "",
            role: val === "mahasiswa" ? "mahasiswa" : "dosen",
            fakultasId: "",
            prodiId: "",
            identityType: val === "mahasiswa" ? "mahasiswa" : "dosen",
            identityNumber: "",
            semester: "",
            kelasId: "",
          });
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 dark:bg-muted p-1 rounded-xl gap-2 h-auto">
            <TabsTrigger
              value="staff"
              className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted-foreground/10 transition-all duration-300 ease-in-out rounded-lg font-medium"
            >
              Dosen & Tenaga Kependidikan
            </TabsTrigger>
            <TabsTrigger
              value="mahasiswa"
              className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted-foreground/10 transition-all duration-300 ease-in-out rounded-lg font-medium"
            >
              Mahasiswa
            </TabsTrigger>
          </TabsList>

          {/* Staff Tab Content */}
          <TabsContent value="staff" className="animate-in fade-in slide-in-from-top-4 duration-500">
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base md:text-lg">Daftar Dosen & Staff</CardTitle>
                  <CardDescription className="text-xs md:text-sm text-muted-foreground">
                    Menampilkan <span className="font-medium">{filteredUsers.filter(u => u.role !== 'mahasiswa').length}</span> pengguna
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowCreate((prev) => !prev)}
                  className="mt-2 sm:mt-0"
                >
                  {showCreate ? "Tutup Form" : "Tambah Pengguna"}
                </Button>
              </CardHeader>
              <CardContent>
                {showCreate && (
                  <div className="mb-6 border rounded-lg p-4 bg-muted/30">
                    <form
                      onSubmit={handleCreateUser}
                      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-start"
                    >
                      {/* Role Selection - First */}
                      <div className="space-y-2">
                        <Label htmlFor="new-role">Role</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(value) => {
                            let identityType: "mahasiswa" | "dosen" = "mahasiswa";
                            if (value === "dosen" || value === "kaprodi") {
                              identityType = "dosen";
                            }
                            setNewUser({
                              ...newUser,
                              role: value,
                              identityType,
                              // Reset semester/kelas if not mahasiswa
                              semester: value === "mahasiswa" ? newUser.semester : "",
                              kelasId: value === "mahasiswa" ? newUser.kelasId : ""
                            });
                          }}
                        >
                          <SelectTrigger id="new-role" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.filter(opt => opt.value !== "mahasiswa").map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

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

                      {/* Identity Type & Number */}
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
                            {newUser.role === "mahasiswa" ? (
                              <SelectItem value="mahasiswa">Mahasiswa (NIM)</SelectItem>
                            ) : (
                              <SelectItem value="dosen">Dosen/Staff (NIP/NIDN)</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-identitas">
                          {newUser.identityType === "mahasiswa" ? "NIM" : "NIP/NIDN"}
                        </Label>
                        <Input
                          id="new-identitas"
                          placeholder={
                            newUser.identityType === "mahasiswa"
                              ? "Masukkan NIM"
                              : "Masukkan NIP/NIDN"
                          }
                          value={newUser.identityNumber}
                          onChange={(e) =>
                            setNewUser({ ...newUser, identityNumber: e.target.value })
                          }
                          disabled={creating}
                        />
                      </div>

                      {/* Fakultas & Prodi - Always show unless Admin maybe? Keeping it for all for now */}
                      <div className="space-y-2">
                        <Label htmlFor="new-fakultas">Fakultas</Label>
                        <Select
                          value={newUser.fakultasId}
                          onValueChange={(value) =>
                            setNewUser({
                              ...newUser,
                              fakultasId: value,
                              prodiId: "",
                            })
                          }
                          disabled={creating}
                        >
                          <SelectTrigger id="new-fakultas" className="w-full">
                            <SelectValue placeholder="Pilih fakultas" />
                          </SelectTrigger>
                          <SelectContent>
                            {fakultasList.map((fak) => (
                              <SelectItem key={fak.id} value={fak.id}>
                                {fak.nama}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-prodi">Program Studi</Label>
                        <Select
                          value={newUser.prodiId}
                          onValueChange={(value) =>
                            setNewUser({ ...newUser, prodiId: value })
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
                              <SelectItem key={p.id} value={p.id}>
                                {p.nama}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Semester & Kelas - Only for Mahasiswa */}
                      {newUser.role === "mahasiswa" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="new-semester">Semester</Label>
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
                            <Label htmlFor="new-kelas">Kelas</Label>
                            <Select
                              value={newUser.kelasId}
                              onValueChange={(value) =>
                                setNewUser({ ...newUser, kelasId: value })
                              }
                              disabled={creating}
                            >
                              <SelectTrigger id="new-kelas" className="w-full">
                                <SelectValue placeholder="Pilih kelas" />
                              </SelectTrigger>
                              <SelectContent>
                                {kelasList.map((k) => (
                                  <SelectItem key={k.id} value={k.id}>
                                    {k.nama}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-angkatan">Angkatan</Label>
                            <Select
                              value={newUser.angkatanId}
                              onValueChange={(value) =>
                                setNewUser({ ...newUser, angkatanId: value })
                              }
                              disabled={creating}
                            >
                              <SelectTrigger id="new-angkatan" className="w-full">
                                <SelectValue placeholder="Pilih angkatan" />
                              </SelectTrigger>
                              <SelectContent>
                                {angkatanList.map((a) => (
                                  <SelectItem key={a.id} value={a.id}>
                                    {a.tahun}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      <div className="md:col-span-2 lg:col-span-4 flex justify-end mt-4">
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
                      <TableHead>NIP/NIDN</TableHead>
                      <TableHead>Fakultas</TableHead>
                      <TableHead>Program Studi</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.filter(u => u.role !== 'mahasiswa').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          Tidak ada data dosen/staff
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.filter(u => u.role !== 'mahasiswa').map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-mono text-xs md:text-sm">
                            {user.email}
                          </TableCell>
                          <TableCell>{user.namaLengkap || "-"}</TableCell>
                          <TableCell>
                            {user.nip ? (
                              <Badge variant="outline" className="inline-flex">{user.nip}</Badge>
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
                                // Mapping logic...
                                let fakultasValue = "";
                                let prodiValue = "";
                                if (user.fakultas) {
                                  const fak = fakultasList.find(f => f.nama === user.fakultas);
                                  if (fak) {
                                    fakultasValue = fak.id;
                                    if (user.programStudi) {
                                      const pOpt = fak.prodi.find(p => p.nama === user.programStudi);
                                      if (pOpt) prodiValue = pOpt.id;
                                    }
                                  }
                                }
                                let identityType: "mahasiswa" | "dosen" = "dosen";
                                let identityNumber = user.nip || user.nim || "";

                                setEditData({
                                  fullName: user.namaLengkap || "",
                                  email: user.email,
                                  role: user.role,
                                  fakultas: fakultasValue,
                                  prodi: prodiValue,
                                  identityType,
                                  identityNumber,
                                  semester: "",
                                  kelasId: "",
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
          </TabsContent>

          {/* Mahasiswa Tab Content */}
          <TabsContent value="mahasiswa" className="animate-in fade-in slide-in-from-top-4 duration-500">
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base md:text-lg">Daftar Mahasiswa</CardTitle>
                  <CardDescription className="text-xs md:text-sm text-muted-foreground">
                    Menampilkan <span className="font-medium">{filteredUsers.filter(u => u.role === 'mahasiswa').length}</span> mahasiswa
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowCreate((prev) => !prev)}
                  className="mt-2 sm:mt-0"
                >
                  {showCreate ? "Tutup Form" : "Tambah Pengguna"}
                </Button>
              </CardHeader>
              <CardContent>
                {showCreate && (
                  <div className="mb-6 border rounded-lg p-4 bg-muted/30">
                    <form
                      onSubmit={handleCreateUser}
                      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-start"
                    >
                      {/* Role Selection - First */}
                      <div className="space-y-2">
                        <Label htmlFor="new-role">Role</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(value) => {
                            let identityType: "mahasiswa" | "dosen" = "mahasiswa";
                            if (value === "dosen" || value === "kaprodi") {
                              identityType = "dosen";
                            }
                            setNewUser({
                              ...newUser,
                              role: value,
                              identityType,
                              // Reset semester/kelas if not mahasiswa
                              semester: value === "mahasiswa" ? newUser.semester : "",
                              kelasId: value === "mahasiswa" ? newUser.kelasId : ""
                            });
                          }}
                        >
                          <SelectTrigger id="new-role" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.filter(opt => opt.value === "mahasiswa").map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

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

                      {/* Identity Type & Number */}
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
                            {newUser.role === "mahasiswa" ? (
                              <SelectItem value="mahasiswa">Mahasiswa (NIM)</SelectItem>
                            ) : (
                              <SelectItem value="dosen">Dosen/Staff (NIP/NIDN)</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-identitas">
                          {newUser.identityType === "mahasiswa" ? "NIM" : "NIP/NIDN"}
                        </Label>
                        <Input
                          id="new-identitas"
                          placeholder={
                            newUser.identityType === "mahasiswa"
                              ? "Masukkan NIM"
                              : "Masukkan NIP/NIDN"
                          }
                          value={newUser.identityNumber}
                          onChange={(e) =>
                            setNewUser({ ...newUser, identityNumber: e.target.value })
                          }
                          disabled={creating}
                        />
                      </div>

                      {/* Fakultas & Prodi - Always show unless Admin maybe? Keeping it for all for now */}
                      <div className="space-y-2">
                        <Label htmlFor="new-fakultas">Fakultas</Label>
                        <Select
                          value={newUser.fakultasId}
                          onValueChange={(value) =>
                            setNewUser({
                              ...newUser,
                              fakultasId: value,
                              prodiId: "",
                            })
                          }
                          disabled={creating}
                        >
                          <SelectTrigger id="new-fakultas" className="w-full">
                            <SelectValue placeholder="Pilih fakultas" />
                          </SelectTrigger>
                          <SelectContent>
                            {fakultasList.map((fak) => (
                              <SelectItem key={fak.id} value={fak.id}>
                                {fak.nama}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-prodi">Program Studi</Label>
                        <Select
                          value={newUser.prodiId}
                          onValueChange={(value) =>
                            setNewUser({ ...newUser, prodiId: value })
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
                              <SelectItem key={p.id} value={p.id}>
                                {p.nama}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Semester & Kelas - Only for Mahasiswa */}
                      {newUser.role === "mahasiswa" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="new-semester">Semester</Label>
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
                            <Label htmlFor="new-kelas">Kelas</Label>
                            <Select
                              value={newUser.kelasId}
                              onValueChange={(value) =>
                                setNewUser({ ...newUser, kelasId: value })
                              }
                              disabled={creating}
                            >
                              <SelectTrigger id="new-kelas" className="w-full">
                                <SelectValue placeholder="Pilih kelas" />
                              </SelectTrigger>
                              <SelectContent>
                                {kelasList.map((k) => (
                                  <SelectItem key={k.id} value={k.id}>
                                    {k.nama}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      <div className="md:col-span-2 lg:col-span-4 flex justify-end mt-4">
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
                      <TableHead>NIM</TableHead>
                      <TableHead>Fakultas</TableHead>
                      <TableHead>Program Studi</TableHead>
                      <TableHead className="text-center">Semester</TableHead>
                      <TableHead className="text-center">Angkatan</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.filter(u => u.role === 'mahasiswa').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          Tidak ada data mahasiswa
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.filter(u => u.role === 'mahasiswa').map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-mono text-xs md:text-sm">
                            {user.email}
                          </TableCell>
                          <TableCell>{user.namaLengkap || "-"}</TableCell>
                          <TableCell>
                            {user.nim ? (
                              <Badge variant="secondary" className="inline-flex">{user.nim}</Badge>
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
                            {user.semester || "-"}
                          </TableCell>
                          <TableCell className="text-center text-xs md:text-sm">
                            {user.angkatan || "-"}
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
                                // Mapping logic...
                                let fakultasValue = "";
                                let prodiValue = "";
                                if (user.fakultas) {
                                  const fak = fakultasList.find(f => f.nama === user.fakultas);
                                  if (fak) {
                                    fakultasValue = fak.id;
                                    if (user.programStudi) {
                                      const pOpt = fak.prodi.find(p => p.nama === user.programStudi);
                                      if (pOpt) prodiValue = pOpt.id;
                                    }
                                  }
                                }

                                setEditData({
                                  fullName: user.namaLengkap || "",
                                  email: user.email,
                                  role: user.role,
                                  fakultas: fakultasValue,
                                  prodi: prodiValue,
                                  identityType: "mahasiswa",
                                  identityNumber: user.nim || "",
                                  semester: user.semester ? String(user.semester) : "",
                                  kelasId: user.kelasId || "",
                                  angkatanId: user.angkatanId || "",
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
          </TabsContent>
        </Tabs>

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
              <div className="space-y-4 mt-2 max-h-[70vh] overflow-y-auto pr-2">
                {/* Role Selection - First */}
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={editData.role}
                    onValueChange={(value) => {
                      let identityType: "mahasiswa" | "dosen" = "mahasiswa";
                      if (value === "dosen" || value === "kaprodi") {
                        identityType = "dosen";
                      }
                      setEditData((prev) => ({
                        ...prev,
                        role: value,
                        identityType,
                        // Reset semester/kelas if not mahasiswa
                        semester: value === "mahasiswa" ? prev.semester : "",
                        kelasId: value === "mahasiswa" ? prev.kelasId : ""
                      }));
                    }}
                    disabled={savingEdit || deletingId === editingUser.id}
                  >
                    <SelectTrigger id="edit-role" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.filter(opt =>
                        activeTab === "mahasiswa"
                          ? opt.value === "mahasiswa"
                          : opt.value !== "mahasiswa"
                      ).map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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

                {/* Identity Type & Number */}
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
                      {editData.role === "mahasiswa" ? (
                        <SelectItem value="mahasiswa">Mahasiswa (NIM)</SelectItem>
                      ) : (
                        <SelectItem value="dosen">Dosen/Staff (NIP/NIDN)</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-identitas">
                    {editData.identityType === "mahasiswa" ? "NIM" : "NIP/NIDN"}
                  </Label>
                  <Input
                    id="edit-identitas"
                    placeholder={
                      editData.identityType === "mahasiswa"
                        ? "Masukkan NIM"
                        : "Masukkan NIP/NIDN"
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
                      {fakultasList.map((fak) => (
                        <SelectItem key={fak.id} value={fak.id}>
                          {fak.nama}
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
                        <SelectItem key={p.id} value={p.id}>
                          {p.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Semester & Kelas - Only for Mahasiswa */}
                {editData.role === "mahasiswa" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="edit-semester">Semester</Label>
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
                      <Label htmlFor="edit-kelas">Kelas</Label>
                      <Select
                        value={editData.kelasId}
                        onValueChange={(value) =>
                          setEditData((prev) => ({ ...prev, kelasId: value }))
                        }
                        disabled={savingEdit || deletingId === editingUser.id}
                      >
                        <SelectTrigger id="edit-kelas" className="w-full">
                          <SelectValue placeholder="Pilih kelas" />
                        </SelectTrigger>
                        <SelectContent>
                          {kelasList.map((k) => (
                            <SelectItem key={k.id} value={k.id}>
                              {k.nama}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-angkatan">Angkatan</Label>
                      <Select
                        value={editData.angkatanId}
                        onValueChange={(value) =>
                          setEditData((prev) => ({ ...prev, angkatanId: value }))
                        }
                        disabled={savingEdit || deletingId === editingUser.id}
                      >
                        <SelectTrigger id="edit-angkatan" className="w-full">
                          <SelectValue placeholder="Pilih angkatan" />
                        </SelectTrigger>
                        <SelectContent>
                          {angkatanList.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.tahun}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

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
      </div >
    </DashboardPage >
  );
};

export default UsersPage;
