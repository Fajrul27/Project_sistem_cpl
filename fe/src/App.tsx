import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CPLPage from "./pages/dashboard/CPL";
import CPLDetailPage from "./pages/dashboard/CPLDetail";
import MataKuliahPage from "./pages/dashboard/MataKuliah";
import MahasiswaPage from "./pages/dashboard/Mahasiswa";
import UsersPage from "./pages/dashboard/Users";
import InputNilaiTeknikPage from "./pages/dashboard/InputNilaiTeknik";
import AnalisisiPage from "./pages/dashboard/Analisis";
import SettingsPage from "./pages/dashboard/Settings";
import ProfilePage from "./pages/dashboard/Profile";
import CPMKPage from "./pages/dashboard/CPMK";
import CPMKDetailPage from "./pages/dashboard/CPMKDetail";

import TranskripCPLPage from "./pages/dashboard/TranskripCPL";
import KaprodiDataSettings from "./pages/dashboard/KaprodiDataSettings";
import DosenPengampuPage from "./pages/dashboard/DosenPengampu";
import TestNavbar from "./pages/TestNavbar";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RequireRole } from "@/components/common/RequireRole";

// New OBE Pages
import RubrikManager from "./pages/dashboard/RubrikManager";
import EvaluasiMataKuliah from "./pages/dashboard/EvaluasiMataKuliah";
import VisiMisiPage from "./pages/dashboard/VisiMisi";
import ProfilLulusanPage from "./pages/dashboard/ProfilLulusan";
import KuesionerCplPage from "./pages/dashboard/KuesionerCpl";
import RekapKuesionerPage from "./pages/dashboard/RekapKuesioner";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route
              path="cpl"
              element={
                <RequireRole roles={["admin", "dosen", "kaprodi"]}>
                  <CPLPage />
                </RequireRole>
              }
            />
            <Route
              path="cpl/:id"
              element={
                <RequireRole roles={["admin", "dosen", "kaprodi"]}>
                  <CPLDetailPage />
                </RequireRole>
              }
            />


            <Route
              path="mata-kuliah"
              element={
                <RequireRole roles={["admin", "kaprodi", "dosen"]}>
                  <MataKuliahPage />
                </RequireRole>
              }
            />
            <Route
              path="dosen-pengampu"
              element={
                <RequireRole roles={["admin"]}>
                  <DosenPengampuPage />
                </RequireRole>
              }
            />
            <Route
              path="mahasiswa"
              element={
                <RequireRole roles={["admin", "dosen", "kaprodi"]}>
                  <MahasiswaPage />
                </RequireRole>
              }
            />
            <Route
              path="users"
              element={
                <RequireRole roles={["admin"]}>
                  <UsersPage />
                </RequireRole>
              }
            />
            <Route
              path="nilai-teknik"
              element={
                <RequireRole roles={["admin", "kaprodi"]}>
                  <InputNilaiTeknikPage />
                </RequireRole>
              }
            />
            <Route
              path="cpmk"
              element={
                <RequireRole roles={["admin", "dosen", "kaprodi"]}>
                  <CPMKPage />
                </RequireRole>
              }
            />
            <Route
              path="cpmk/:id"
              element={
                <RequireRole roles={["admin", "dosen", "kaprodi"]}>
                  <CPMKDetailPage />
                </RequireRole>
              }
            />

            <Route path="transkrip-cpl" element={<TranskripCPLPage />} />
            <Route path="transkrip-cpl/:mahasiswaId" element={<TranskripCPLPage />} />
            <Route path="analisis" element={<AnalisisiPage />} />

            {/* New OBE Routes */}
            <Route path="visi-misi" element={<VisiMisiPage />} />
            <Route path="profil-lulusan" element={<ProfilLulusanPage />} />
            <Route path="kuesioner" element={<KuesionerCplPage />} />
            <Route path="rekap-kuesioner" element={
              <RequireRole roles={["admin", "kaprodi"]}>
                <RekapKuesionerPage />
              </RequireRole>
            } />
            <Route path="rubrik/:cpmkId" element={<RubrikManager />} />
            <Route path="evaluasi/:mataKuliahId" element={<EvaluasiMataKuliah />} />

            <Route
              path="settings"
              element={
                <RequireRole roles={["admin", "kaprodi"]}>
                  <SettingsPage />
                </RequireRole>
              }
            />
            <Route
              path="kaprodi-data"
              element={
                <RequireRole roles={["admin"]}>
                  <KaprodiDataSettings />
                </RequireRole>
              }
            />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="test-navbar" element={<TestNavbar />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider >
);

export default App;
