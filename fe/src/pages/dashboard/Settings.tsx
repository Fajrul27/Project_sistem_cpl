import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { DashboardPage } from "@/components/DashboardLayout";
import { Loader2, Save } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    univName: "UNIVERSITAS NAHDLATUL ULAMA AL GHAZALI CILACAP",
    univAddress: "Jl. Kemerdekaan Barat No.17 Kesugihan Kidul, Kec. Kesugihan, Kabupaten Cilacap, Jawa Tengah 53274",
    univContact: "Website : www.unugha.ac.id / e-Mail : kita@unugha.ac.id / Telepon : 0282 695415",
    kaprodiName: "",
    kaprodiNip: "",
    logoUrl: "/logo.png"
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data && Object.keys(result.data).length > 0) {
          setSettings(prev => ({ ...prev, ...result.data }));
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Gagal memuat pengaturan");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) throw new Error('Gagal menyimpan pengaturan');

      toast.success("Pengaturan berhasil disimpan");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardPage title="Pengaturan Laporan">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title="Pengaturan Laporan"
      description="Konfigurasi Kop Surat dan Tanda Tangan Laporan"
    >
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSave}>
          <div className="grid gap-6">
            {/* Kop Surat Section */}
            <Card>
              <CardHeader>
                <CardTitle>Kop Surat</CardTitle>
                <CardDescription>Pengaturan informasi pada kop surat laporan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="univName">Nama Universitas</Label>
                  <Input
                    id="univName"
                    name="univName"
                    value={settings.univName}
                    onChange={handleChange}
                    placeholder="Contoh: UNIVERSITAS NAHDLATUL ULAMA AL GHAZALI CILACAP"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="univAddress">Alamat</Label>
                  <Textarea
                    id="univAddress"
                    name="univAddress"
                    value={settings.univAddress}
                    onChange={handleChange}
                    placeholder="Alamat lengkap universitas"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="univContact">Kontak (Website / Email / Telepon)</Label>
                  <Input
                    id="univContact"
                    name="univContact"
                    value={settings.univContact}
                    onChange={handleChange}
                    placeholder="Informasi kontak"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">URL Logo (Opsional)</Label>
                  <Input
                    id="logoUrl"
                    name="logoUrl"
                    value={settings.logoUrl}
                    onChange={handleChange}
                    placeholder="/logo.png atau https://..."
                  />
                  <p className="text-xs text-muted-foreground">Biarkan default /logo.png jika menggunakan logo lokal.</p>
                </div>
              </CardContent>
            </Card>

            {/* Signature Section */}
            <Card>
              <CardHeader>
                <CardTitle>Tanda Tangan</CardTitle>
                <CardDescription>Pengaturan penandatangan laporan (Kaprodi)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kaprodiName">Nama Kaprodi</Label>
                  <Input
                    id="kaprodiName"
                    name="kaprodiName"
                    value={settings.kaprodiName}
                    onChange={handleChange}
                    placeholder="Nama lengkap beserta gelar"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kaprodiNip">NIP / NIDN (Opsional)</Label>
                  <Input
                    id="kaprodiNip"
                    name="kaprodiNip"
                    value={settings.kaprodiNip}
                    onChange={handleChange}
                    placeholder="Nomor induk pegawai"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Pengaturan
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardPage>
  );
};

export default SettingsPage;
