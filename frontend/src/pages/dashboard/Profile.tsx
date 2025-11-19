import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/api-client";
import { DashboardPage } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User, Mail, Hash, GraduationCap, Calendar, MapPin, Phone } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { role } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

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
        setProfile(userData.user.profile);
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
                onClick={() => navigate('/dashboard/settings')}
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
      </div>
    </DashboardPage>
  );
};

export default ProfilePage;
