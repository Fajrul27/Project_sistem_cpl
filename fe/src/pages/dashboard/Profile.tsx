import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User, Mail, Hash, GraduationCap, Calendar, MapPin, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProfile } from "@/hooks/useProfile";
import { LoadingScreen } from "@/components/common/LoadingScreen";

const ProfilePage = () => {
  const navigate = useNavigate();
  const {
    user,
    profile,
    loading,
    role,
    fakultasList,
    prodiList,
    semesterList,
    kelasList,
    angkatanList,
    teachingAssignments,
    updateProfileData
  } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [filteredProdiList, setFilteredProdiList] = useState<any[]>([]);

  // Initialize edit form when opening dialog or profile changes
  useEffect(() => {
    if (isEditing && profile) {
      setEditForm({
        namaLengkap: profile.namaLengkap || "",
        nim: profile.nim || "",
        nip: profile.nip || "",
        fakultasId: profile.fakultasId || "",
        prodiId: profile.prodiId || "",
        semester: profile.semester || "",
        semesterId: profile.semesterId || "",
        kelasId: profile.kelasId || "",
        angkatanId: profile.angkatanId || "",
        alamat: profile.alamat || "",
        noTelepon: profile.noTelepon || "",
      });
    }
  }, [isEditing, profile]);

  // Filter prodi based on selected fakultas in form
  useEffect(() => {
    if (editForm.fakultasId) {
      const filtered = prodiList.filter((p: any) => p.fakultasId === editForm.fakultasId);
      setFilteredProdiList(filtered);
    } else {
      setFilteredProdiList([]);
    }
  }, [editForm.fakultasId, prodiList]);

  const handleSave = async () => {
    const success = await updateProfileData(editForm);
    if (success) {
      setIsEditing(false);
    }
  };

  const isDosen = role === 'dosen' || user?.role === 'dosen' || profile?.role === 'dosen';

  if (loading) {
    return (
      <DashboardPage title="Profil Saya">
        <LoadingScreen fullScreen={false} message="Memuat profil..." />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title="Profil Saya"
      description="Informasi akun dan profil Anda"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Informasi Akun */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Akun
            </CardTitle>
            <CardDescription>Data akun pengguna sistem</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                value={user?.email || '-'}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Role
              </Label>
              <Input
                value={role || '-'}
                disabled
                className="bg-muted capitalize"
              />
            </div>

            <div className="space-y-2">
              <Label>User ID</Label>
              <Input
                value={user?.id || '-'}
                disabled
                className="bg-muted text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Informasi Profil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Informasi Profil
            </CardTitle>
            <CardDescription>Data pribadi dan akademik</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nama Lengkap
              </Label>
              <Input
                value={profile?.namaLengkap || '-'}
                disabled
                className="bg-muted"
              />
            </div>

            {profile?.nim && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  NIM
                </Label>
                <Input
                  value={profile.nim}
                  disabled
                  className="bg-muted"
                />
              </div>
            )}

            {profile?.nip && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  NIP
                </Label>
                <Input
                  value={profile.nip}
                  disabled
                  className="bg-muted"
                />
              </div>
            )}

            {isDosen && (profile?.prodi?.nama || profile?.programStudi) && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Program Studi
                </Label>
                <Input
                  value={profile?.prodi?.nama || profile?.programStudi || "-"}
                  disabled
                  className="bg-muted"
                />
              </div>
            )}

            {profile?.programStudi && !isDosen && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Program Studi
                </Label>
                <Input
                  value={profile.programStudi}
                  disabled
                  className="bg-muted"
                />
              </div>
            )}

            {profile?.semester && !isDosen && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Semester
                </Label>
                <Input
                  value={`Semester ${profile.semester}`}
                  disabled
                  className="bg-muted"
                />
              </div>
            )}

            {profile?.kelasRef && !isDosen && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Kelas
                </Label>
                <Input
                  value={profile.kelasRef.nama}
                  disabled
                  className="bg-muted"
                />
              </div>
            )}

            {!isDosen && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Tahun Masuk
                </Label>
                <Input
                  value={
                    profile?.angkatanRef?.tahun ||
                    profile?.tahunMasuk ||
                    angkatanList.find(a => a.id === profile?.angkatanId)?.tahun ||
                    '-'
                  }
                  disabled
                  className="bg-muted"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informasi Kontak */}
        {(profile?.alamat || profile?.noTelepon) && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Informasi Kontak
              </CardTitle>
              <CardDescription>Alamat dan kontak</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {profile?.alamat && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Alamat
                  </Label>
                  <Input
                    value={profile.alamat}
                    disabled
                    className="bg-muted"
                  />
                </div>
              )}

              {profile?.noTelepon && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    No. Telepon
                  </Label>
                  <Input
                    value={profile.noTelepon}
                    disabled
                    className="bg-muted"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Mata Kuliah yang Diampu (Only for Dosen) */}
        {isDosen && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Mata Kuliah yang Diampu
              </CardTitle>
              <CardDescription>Daftar mata kuliah yang Anda ajar semester ini</CardDescription>
            </CardHeader>
            <CardContent>
              {teachingAssignments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode MK</TableHead>
                      <TableHead>Mata Kuliah</TableHead>
                      <TableHead>Semester</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      // Deduplicate assignments based on unique mataKuliahId
                      const uniqueAssignments = teachingAssignments.reduce((acc: any[], current) => {
                        const exists = acc.find(
                          (item: any) =>
                            item.mataKuliah?.id === current.mataKuliah?.id
                        );
                        if (!exists) {
                          acc.push(current);
                        }
                        return acc;
                      }, []);

                      return uniqueAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>{assignment.mataKuliah?.kodeMk || '-'}</TableCell>
                          <TableCell>{assignment.mataKuliah?.namaMk || '-'}</TableCell>
                          <TableCell>Semester {assignment.mataKuliah?.semester || '-'}</TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Belum ada mata kuliah yang diampu.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              {role !== 'dosen' && role !== 'mahasiswa' && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex-1"
                >
                  Edit Profil
                </Button>
              )}
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="flex-1"
              >
                Kembali ke Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Profil</DialogTitle>
              <DialogDescription>
                Perbarui informasi profil Anda di sini. Klik simpan setelah selesai.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Form fields here - reusing existing structure logic */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                <Label htmlFor="namaLengkap" className="text-left md:text-right">Name</Label>
                <Input id="namaLengkap" value={editForm.namaLengkap} onChange={(e) => setEditForm({ ...editForm, namaLengkap: e.target.value })} className="md:col-span-3" />
              </div>

              {role === 'mahasiswa' && (
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                  <Label htmlFor="nim" className="text-left md:text-right">NIM</Label>
                  <Input id="nim" value={editForm.nim} onChange={(e) => setEditForm({ ...editForm, nim: e.target.value })} className="md:col-span-3" />
                </div>
              )}

              {(role === 'dosen' || role === 'kaprodi' || role === 'dekan') && (
                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                  <Label htmlFor="nip" className="text-left md:text-right">NIP</Label>
                  <Input id="nip" value={editForm.nip} onChange={(e) => setEditForm({ ...editForm, nip: e.target.value })} className="md:col-span-3" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                <Label htmlFor="fakultas" className="text-left md:text-right">Fakultas</Label>
                <Select value={editForm.fakultasId} onValueChange={(val) => setEditForm({ ...editForm, fakultasId: val, prodiId: "" })}>
                  <SelectTrigger className="md:col-span-3"><SelectValue placeholder="Pilih Fakultas" /></SelectTrigger>
                  <SelectContent>
                    {fakultasList.map((f) => (<SelectItem key={f.id} value={f.id}>{f.nama}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                <Label htmlFor="prodi" className="text-left md:text-right">Prodi</Label>
                <Select value={editForm.prodiId} onValueChange={(val) => setEditForm({ ...editForm, prodiId: val })} disabled={!editForm.fakultasId}>
                  <SelectTrigger className="md:col-span-3"><SelectValue placeholder="Pilih Prodi" /></SelectTrigger>
                  <SelectContent>
                    {filteredProdiList.map((p) => (<SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              {role === 'mahasiswa' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                    <Label htmlFor="semester" className="text-left md:text-right">Semester</Label>
                    <Select value={editForm.semesterId} onValueChange={(val) => { const s = semesterList.find(i => i.id === val); setEditForm({ ...editForm, semesterId: val, semester: s?.angka }) }}>
                      <SelectTrigger className="md:col-span-3"><SelectValue placeholder="Pilih Semester" /></SelectTrigger>
                      <SelectContent>
                        {semesterList.map((s) => (<SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                    <Label htmlFor="kelas" className="text-left md:text-right">Kelas</Label>
                    <Select value={editForm.kelasId} onValueChange={(val) => setEditForm({ ...editForm, kelasId: val })}>
                      <SelectTrigger className="md:col-span-3"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                      <SelectContent>
                        {kelasList.map((k) => (<SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                    <Label htmlFor="angkatan" className="text-left md:text-right">Angkatan</Label>
                    <Select value={editForm.angkatanId} onValueChange={(val) => setEditForm({ ...editForm, angkatanId: val })}>
                      <SelectTrigger className="md:col-span-3"><SelectValue placeholder="Pilih Angkatan" /></SelectTrigger>
                      <SelectContent>
                        {angkatanList.map((a) => (<SelectItem key={a.id} value={a.id}>{a.tahun}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                <Label htmlFor="alamat" className="text-left md:text-right">Alamat</Label>
                <Input id="alamat" value={editForm.alamat} onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })} className="md:col-span-3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                <Label htmlFor="noTelepon" className="text-left md:text-right">No. HP</Label>
                <Input id="noTelepon" value={editForm.noTelepon} onChange={(e) => setEditForm({ ...editForm, noTelepon: e.target.value })} className="md:col-span-3" />
              </div>

            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSave} disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardPage>
  );
};

export default ProfilePage;
