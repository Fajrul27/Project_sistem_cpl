import { useState, useEffect } from "react";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/common/RequiredLabel";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { Save, Building, MapPin, Globe, Mail, Phone, Image as ImageIcon, Eye, Info } from "lucide-react";
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
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Forms */}
                    <div className="lg:col-span-7 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Card className="shadow-sm border-primary/10">
                                <CardHeader className="pb-3 px-6 pt-6">
                                    <CardTitle className="flex items-center text-lg">
                                        <Building className="h-5 w-5 mr-2 text-primary" />
                                        Identitas Universitas
                                    </CardTitle>
                                    <CardDescription>Informasi nama dan alamat resmi universitas</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 px-6 pb-6">
                                    <div className="space-y-2">
                                        <RequiredLabel required>Nama Universitas</RequiredLabel>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                name="institution_name"
                                                value={formData.institution_name}
                                                onChange={handleChange}
                                                className="pl-10 h-10"
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
                                                className="pl-10 h-10"
                                                placeholder="Jl. Kemerdekaan Barat No.17..."
                                                required
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border-primary/10">
                                <CardHeader className="pb-3 px-6 pt-6">
                                    <CardTitle className="flex items-center text-lg">
                                        <Globe className="h-5 w-5 mr-2 text-primary" />
                                        Informasi Kontak
                                    </CardTitle>
                                    <CardDescription>Akan ditampilkan pada bagian kop surat/laporan</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 pb-6">
                                    <div className="space-y-2">
                                        <Label className="flex items-center text-xs font-semibold">
                                            <Globe className="h-3.5 w-3.5 mr-2" />
                                            Website
                                        </Label>
                                        <Input
                                            name="institution_website"
                                            value={formData.institution_website}
                                            onChange={handleChange}
                                            placeholder="www.unugha.ac.id"
                                            className="h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center text-xs font-semibold">
                                            <Mail className="h-3.5 w-3.5 mr-2" />
                                            Email
                                        </Label>
                                        <Input
                                            name="institution_email"
                                            value={formData.institution_email}
                                            onChange={handleChange}
                                            placeholder="kita@unugha.ac.id"
                                            type="email"
                                            className="h-10"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="flex items-center text-xs font-semibold">
                                            <Phone className="h-3.5 w-3.5 mr-2" />
                                            Telepon / Kontak
                                        </Label>
                                        <Input
                                            name="institution_phone"
                                            value={formData.institution_phone}
                                            onChange={handleChange}
                                            placeholder="0282 695415"
                                            className="h-10"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border-primary/10">
                                <CardHeader className="pb-3 px-6 pt-6">
                                    <CardTitle className="flex items-center text-lg">
                                        <ImageIcon className="h-5 w-5 mr-2 text-primary" />
                                        Logo Universitas
                                    </CardTitle>
                                    <CardDescription>Logo resmi untuk tampilan header laporan</CardDescription>
                                </CardHeader>
                                <CardContent className="px-6 pb-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800">
                                        <div className="w-24 h-24 border rounded-md flex items-center justify-center overflow-hidden bg-white dark:bg-slate-950 shrink-0 shadow-sm border-slate-200 dark:border-slate-800">
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
                                        <div className="flex-1 space-y-3">
                                            <Label htmlFor="logo_upload" className="font-semibold">Unggah File Logo</Label>
                                            <Input
                                                id="logo_upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                className="cursor-pointer bg-white dark:bg-slate-950"
                                            />
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                                * Rekomendasi format PNG/JPG dengan latar transparan
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
                                    className="w-full md:w-auto px-10 shadow-lg shadow-primary/20"
                                >
                                    {saving ? (
                                        <>
                                            <LoadingSpinner size="sm" className="mr-2" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-5 w-5 mr-2" />
                                            Simpan Semua Perubahan
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Right: Live Preview */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-6 space-y-4">
                            <Label className="text-sm font-bold flex items-center gap-2 text-primary px-1 uppercase tracking-widest">
                                <Eye className="h-4 w-4" />
                                Pratinjau Kop Surat (Live)
                            </Label>

                            <Card className="overflow-hidden border-2 border-slate-200 shadow-xl bg-white text-black">
                                <div className="p-8 space-y-6">
                                    <div className="bg-slate-100/50 p-2 rounded text-[10px] text-center font-bold text-slate-500 uppercase tracking-widest mb-4">
                                        Batas Halaman Cetak
                                    </div>

                                    {/* Real Header Replica */}
                                    <div className="border-b-2 border-black pb-2 flex items-center justify-between gap-4">
                                        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                                            {formData.institution_logo ? (
                                                <img
                                                    src={formData.institution_logo}
                                                    alt="Logo Univ"
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-slate-100 flex items-center justify-center rounded">
                                                    <Building className="h-6 w-6 text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 text-center">
                                            <h2 className="text-[11px] font-bold uppercase leading-tight tracking-wide !text-black">
                                                {formData.institution_name || 'NAMA UNIVERSITAS BELUM DIISI'}
                                            </h2>
                                            <p className="text-[8px] mt-1 leading-tight !text-black">
                                                {formData.institution_address || 'Alamat lengkap universitas akan muncul di sini...'}
                                            </p>
                                            <p className="text-[8px] mt-0.5 leading-tight !text-black font-medium">
                                                Website: {formData.institution_website || '-'} | e-Mail: {formData.institution_email || '-'} | Telepon: {formData.institution_phone || '-'}
                                            </p>
                                        </div>
                                        <div className="w-16 h-16 flex-shrink-0"></div>
                                    </div>

                                    {/* Mock Body content */}
                                    <div className="space-y-4 pt-4 opacity-20 select-none pointer-events-none">
                                        <div className="h-4 w-2/3 bg-slate-300 rounded mx-auto"></div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="h-2 bg-slate-200 rounded"></div>
                                            <div className="h-2 bg-slate-200 rounded"></div>
                                            <div className="h-2 bg-slate-200 rounded"></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-20 bg-slate-100 rounded"></div>
                                            <div className="h-10 bg-slate-100 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                <h4 className="text-xs font-bold text-primary flex items-center gap-2 mb-2">
                                    <Info className="h-3.5 w-3.5" />
                                    Tips Laporan
                                </h4>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Kop surat yang Anda lihat di atas akan diterapkan secara otomatis pada seluruh laporan PDF, termasuk Transkrip CPL, Analisis, dan kartu hasil studi lainnya.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardPage>
    );
};

export default InstansiSettings;
