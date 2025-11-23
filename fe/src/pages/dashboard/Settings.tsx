import { useState, useEffect } from "react";
import { supabase } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User } from "lucide-react";
import { DashboardPage } from "@/components/DashboardLayout";

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    namaLengkap: "",
    nim: "",
    nip: "",
    programStudi: "",
    semester: "",
    alamat: "",
    noTelepon: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profileData = user.profile;
      if (!profileData) return;

      setProfile({
        namaLengkap: profileData.namaLengkap || "",
        nim: profileData.nim || "",
        nip: profileData.nip || "",
        programStudi: profileData.programStudi || "",
        semester: profileData.semester?.toString() || "",
        alamat: profileData.alamat || "",
        noTelepon: profileData.noTelepon || "",
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast.error("Gagal memuat profil");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.profile) throw new Error("User not found");

      const updateData: any = {
        namaLengkap: profile.namaLengkap,
        nim: profile.nim || null,
        nip: profile.nip || null,
        programStudi: profile.programStudi || null,
        semester: profile.semester ? parseInt(profile.semester) : null,
        alamat: profile.alamat || null,
        noTelepon: profile.noTelepon || null,
      };

      // Update via API (will need backend endpoint)
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/profiles/${user.profile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal memperbarui profil');
      }

      toast.success("Profil berhasil diperbarui");
      
      // Refresh profile data
      await fetchProfile();
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || "Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardPage
      title="Pengaturan Akun"
      description="Kelola informasi profil dan pengaturan akun Anda"
    >
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Profil Pengguna</CardTitle>
              <CardDescription>Update informasi profil Anda</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="namaLengkap">Nama Lengkap</Label>
              <Input
                id="namaLengkap"
                value={profile.namaLengkap}
                onChange={(e) => setProfile({ ...profile, namaLengkap: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nim">NIM (Mahasiswa)</Label>
                <Input
                  id="nim"
                  placeholder="Kosongkan jika bukan mahasiswa"
                  value={profile.nim}
                  onChange={(e) => setProfile({ ...profile, nim: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nip">NIP (Dosen)</Label>
                <Input
                  id="nip"
                  placeholder="Kosongkan jika bukan dosen"
                  value={profile.nip}
                  onChange={(e) => setProfile({ ...profile, nip: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="programStudi">Program Studi</Label>
                <Input
                  id="programStudi"
                  placeholder="Contoh: Teknik Informatika"
                  value={profile.programStudi}
                  onChange={(e) => setProfile({ ...profile, programStudi: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester (Mahasiswa)</Label>
                <Input
                  id="semester"
                  type="number"
                  min="1"
                  max="8"
                  placeholder="1-8"
                  value={profile.semester}
                  onChange={(e) => setProfile({ ...profile, semester: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Input
                id="alamat"
                placeholder="Alamat lengkap"
                value={profile.alamat}
                onChange={(e) => setProfile({ ...profile, alamat: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="noTelepon">No. Telepon</Label>
              <Input
                id="noTelepon"
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={profile.noTelepon}
                onChange={(e) => setProfile({ ...profile, noTelepon: e.target.value })}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardPage>
  );
};

export default SettingsPage;
