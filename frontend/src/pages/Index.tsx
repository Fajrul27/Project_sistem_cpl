import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { GraduationCap, BarChart3, FileText, Users, CheckCircle2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: GraduationCap,
      title: "Manajemen CPL",
      description: "Kelola data Capaian Pembelajaran Lulusan dengan mudah dan terstruktur",
    },
    {
      icon: Users,
      title: "Data Mahasiswa",
      description: "Pantau perkembangan dan pencapaian setiap mahasiswa secara real-time",
    },
    {
      icon: BarChart3,
      title: "Analisis Mendalam",
      description: "Visualisasi data dengan grafik interaktif untuk insight yang lebih baik",
    },
    {
      icon: FileText,
      title: "Laporan Lengkap",
      description: "Export laporan dalam format PDF dan Excel untuk dokumentasi",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-20 px-4 text-center animate-in fade-in duration-700">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 flex justify-center animate-in zoom-in duration-500">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-full hover:scale-110 transition-transform duration-300">
              <GraduationCap className="h-16 w-16 text-white" />
            </div>
          </div>
          
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl animate-in slide-in-from-bottom duration-500">
            Sistem Pengukuran CPL
          </h1>
          
          <p className="mb-8 text-lg text-white/90 md:text-xl animate-in slide-in-from-bottom duration-700">
            Platform modern untuk mengukur dan menganalisis Capaian Pembelajaran Lulusan
            dengan data akurat dan visualisasi yang informatif
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
            >
              Mulai Sekarang
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary transition-all duration-300 font-semibold shadow-lg"
            >
              Login
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Fitur Unggulan</h2>
            <p className="text-muted-foreground text-lg">
              Semua yang Anda butuhkan untuk mengukur CPL dengan efektif
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-1000">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Mengapa Memilih Sistem CPL?</h2>
              <div className="space-y-4">
                {[
                  "Autentikasi multi-level (Admin, Dosen, Mahasiswa)",
                  "Dashboard interaktif dengan grafik real-time",
                  "Input dan penilaian CPL yang mudah",
                  "Export laporan ke PDF dan Excel",
                  "Analisis mendalam per mahasiswa dan mata kuliah",
                  "Desain responsif untuk semua perangkat",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                    <p className="text-foreground">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary to-primary/80 p-8 rounded-2xl text-center shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="text-white">
                <p className="text-5xl font-bold mb-2">100%</p>
                <p className="text-xl mb-4">Akurat & Terpercaya</p>
                <p className="text-white/80">
                  Data tersimpan aman dengan backup otomatis dan enkripsi tingkat enterprise
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="text-3xl">Siap Memulai?</CardTitle>
              <CardDescription className="text-lg">
                Bergabunglah dengan ribuan institusi yang telah menggunakan sistem kami
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button size="lg" onClick={() => navigate("/auth")} className="w-full sm:w-auto">
                Daftar Sekarang - Gratis
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 Sistem CPL. Platform Pengukuran Capaian Pembelajaran.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
