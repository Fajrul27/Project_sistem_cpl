import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/api-client";
import { DashboardPage } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User, Mail, Hash, GraduationCap, Calendar, MapPin, Phone, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserRole } from "@/hooks/useUserRole";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { role } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [fakultasList, setFakultasList] = useState<any[]>([]);
  const [prodiList, setProdiList] = useState<any[]>([]);
  const [filteredProdiList, setFilteredProdiList] = useState<any[]>([]);

  useEffect(() => {
    fetchUserData();
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const [fakultasRes, prodiRes] = await Promise.all([
        fetch(`${API_URL}/fakultas`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch(`${API_URL}/prodi`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);

      const fakultasData = await fakultasRes.json();
      const prodiData = await prodiRes.json();

      if (fakultasData.data) setFakultasList(fakultasData.data);
      if (prodiData.data) setProdiList(prodiData.data);
    } catch (error) {
      console.error("Error fetching master data:", error);
    }
  };

  useEffect(() => {
    if (editForm.fakultasId) {
      const filtered = prodiList.filter((p: any) => p.fakultasId === editForm.fakultasId);
      setFilteredProdiList(filtered);
    } else {
      setFilteredProdiList([]);
    }
  }, [editForm.fakultasId, prodiList]);

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        setUser(userData.user);
        setUser(userData.user);
        setProfile(userData.user.profile);
        setEditForm({
          namaLengkap: userData.user.profile?.namaLengkap || "",
          nim: userData.user.profile?.nim || "",
          nip: userData.user.profile?.nip || "",
          fakultasId: userData.user.profile?.fakultasId || "",
          prodiId: userData.user.profile?.prodiId || "",
          semester: userData.user.profile?.semester || "",
          alamat: userData.user.profile?.alamat || "",
          noTelepon: userData.user.profile?.noTelepon || ""
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Gagal memuat data profil");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardPage title="Profil Saya">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
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

            {profile?.programStudi && (
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

            {profile?.semester && (
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

        {/* Action Buttons */}
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Button
                onClick={() => setIsEditing(true)}
                className="flex-1"
              >
                Edit Profil
              </Button>
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="namaLengkap" className="text-right">
                  Nama
                </Label>
                <Input
                  id="namaLengkap"
                  value={editForm.namaLengkap}
                  onChange={(e) => setEditForm({ ...editForm, namaLengkap: e.target.value })}
                  className="col-span-3"
                />
              </div>

              {role === 'mahasiswa' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nim" className="text-right">
                    NIM
                  </Label>
                  <Input
                    id="nim"
                    value={editForm.nim}
                    onChange={(e) => setEditForm({ ...editForm, nim: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              )}

              {(role === 'dosen' || role === 'kaprodi' || role === 'dekan') && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nip" className="text-right">
                    NIP
                  </Label>
                  <Input
                    id="nip"
                    value={editForm.nip}
                    onChange={(e) => setEditForm({ ...editForm, nip: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fakultas" className="text-right">
                  Fakultas
                </Label>
                <Select
                  value={editForm.fakultasId}
                  onValueChange={(val) => setEditForm({ ...editForm, fakultasId: val, prodiId: "" })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih Fakultas" />
                  </SelectTrigger>
                  <SelectContent>
                    {fakultasList.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prodi" className="text-right">
                  Prodi
                </Label>
                <Select
                  value={editForm.prodiId}
                  onValueChange={(val) => setEditForm({ ...editForm, prodiId: val })}
                  disabled={!editForm.fakultasId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih Prodi" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProdiList.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {role === 'mahasiswa' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="semester" className="text-right">
                    Semester
                  </Label>
                  <Input
                    id="semester"
                    type="number"
                    value={editForm.semester}
                    onChange={(e) => setEditForm({ ...editForm, semester: parseInt(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="alamat" className="text-right">
                  Alamat
                </Label>
                <Input
                  id="alamat"
                  value={editForm.alamat}
                  onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="noTelepon" className="text-right">
                  No. HP
                </Label>
                <Input
                  id="noTelepon"
                  value={editForm.noTelepon}
                  onChange={(e) => setEditForm({ ...editForm, noTelepon: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={async () => {
                try {
                  setLoading(true);
                  const { error } = await supabase.from('profiles').update(editForm).eq('id', profile.id);
                  if (error) throw error;
                  toast.success("Profil berhasil diperbarui");
                  setIsEditing(false);
                  fetchUserData();
                } catch (e: any) {
                  toast.error("Gagal memperbarui profil: " + e.message);
                } finally {
                  setLoading(false);
                }
              }}>Simpan Perubahan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardPage>
  );
};

export default ProfilePage;
