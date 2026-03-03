import { useState, useEffect } from "react";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/common/RequiredLabel";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { Save, Building, MapPin, Globe, Mail, Phone, Image as ImageIcon } from "lucide-react";
import { LoadingScreen, LoadingSpinner } from "@/components/common/LoadingScreen";

const InstansiSettings = () => {
    const { settings, loading, saving, updateSettings } = useSettings();
    const [formData, setFormData] = useState({
        institution_name: "UNIVERSITAS NAHDLATUL ULAMA AL GHAZALI CILACAP",
        institution_address: "Jl. Kemerdekaan Barat No.17 Kesugihan Kidul, Kec. Kesugihan, Kabupaten Cilacap, Jawa Tengah 53274",
        institution_website: "www.unugha.ac.id",
        institution_email: "kita@unugha.ac.id",
        institution_phone: "0282 695415",
        institution_logo: "/logo.png"
    });

    useEffect(() => {
        if (!loading) {
            setFormData({
                institution_name: settings.institution_name || "UNIVERSITAS NAHDLATUL ULAMA AL GHAZALI CILACAP",
                institution_address: settings.institution_address || "Jl. Kemerdekaan Barat No.17 Kesugihan Kidul, Kec. Kesugihan, Kabupaten Cilacap, Jawa Tengah 53274",
                institution_website: settings.institution_website || "www.unugha.ac.id",
                institution_email: settings.institution_email || "kita@unugha.ac.id",
                institution_phone: settings.institution_phone || "0282 695415",
                institution_logo: settings.institution_logo || "/logo.png"
            });
        }
    }, [settings, loading]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, institution_logo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateSettings(formData);
    };

    if (loading) return <LoadingScreen message="Memuat pengaturan instansi..." />;

    return (
        <DashboardPage
            title="Pengaturan Instansi"
            description="Kustomisasi identitas instansi untuk header laporan dan tampilan aplikasi"
        >
            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Building className="h-5 w-5 mr-2" />
                                Identitas Universitas
                            </CardTitle>
                            <CardDescription>Informasi nama dan alamat resmi universitas</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <RequiredLabel required>Nama Universitas</RequiredLabel>
                                <div className="relative">
                                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        name="institution_name"
                                        value={formData.institution_name}
                                        onChange={handleChange}
                                        className="pl-10"
                                        placeholder="Contoh: UNIVERSITAS NAHDLATUL ULAMA AL GHAZALI CILACAP"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <RequiredLabel required>Alamat Lengkap</RequiredLabel>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        name="institution_address"
                                        value={formData.institution_address}
                                        onChange={handleChange}
                                        className="pl-10"
                                        placeholder="Jl. Kemerdekaan Barat No.17..."
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Globe className="h-5 w-5 mr-2" />
                                Informasi Kontak
                            </CardTitle>
                            <CardDescription>Akan ditampilkan pada bagian kop surat/laporan</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center">
                                    <Globe className="h-4 w-4 mr-2" />
                                    Website
                                </Label>
                                <Input
                                    name="institution_website"
                                    value={formData.institution_website}
                                    onChange={handleChange}
                                    placeholder="www.unugha.ac.id"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Email
                                </Label>
                                <Input
                                    name="institution_email"
                                    value={formData.institution_email}
                                    onChange={handleChange}
                                    placeholder="kita@unugha.ac.id"
                                    type="email"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Telepon
                                </Label>
                                <Input
                                    name="institution_phone"
                                    value={formData.institution_phone}
                                    onChange={handleChange}
                                    placeholder="0282 695415"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <ImageIcon className="h-5 w-5 mr-2" />
                                Logo Universitas
                            </CardTitle>
                            <CardDescription>Logo resmi untuk tampilan header laporan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                <div className="w-24 h-24 border rounded-md flex items-center justify-center overflow-hidden bg-white shrink-0 shadow-sm border-dashed">
                                    {formData.institution_logo ? (
                                        <img
                                            src={formData.institution_logo}
                                            alt="Preview Logo"
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <Building className="h-8 w-8 text-muted-foreground opacity-20" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="logo_upload">Ganti Logo</Label>
                                    <Input
                                        id="logo_upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="cursor-pointer"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Rekomendasi format PNG atau JPG dengan latar belakang transparan (jika PNG).
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            disabled={saving}
                            size="lg"
                            className="w-full md:w-auto px-8 shadow-sm"
                        >
                            {saving ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5 mr-2" />
                                    Simpan Perubahan
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardPage>
    );
};

export default InstansiSettings;
