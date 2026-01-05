import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PermissionProvider } from "./contexts/PermissionContext";
import { UserProvider } from "./contexts/UserContext";
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

import ProfilePage from "./pages/dashboard/Profile";
import DebugAccess from "./pages/dashboard/DebugAccess";
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
import RoleAccessPage from "./pages/dashboard/RoleAccess";
import DefaultRoleAccessPage from "./pages/dashboard/DefaultRoleAccess";
import RoleManagementPage from "./pages/dashboard/RoleManagement";
import EvaluasiCPLPage from "./pages/dashboard/EvaluasiCPL";
import FakultasPage from "./pages/dashboard/FakultasPage";
import ActivityLogPage from "./pages/dashboard/ActivityLog";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UserProvider>
        <PermissionProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={
                  <RequireRole roles={["admin", "dosen", "kaprodi", "mahasiswa"]} resource="dashboard">
                    <Dashboard />
                  </RequireRole>
                } />
                <Route path="debug-access" element={<DebugAccess />} />
                <Route
                  path="cpl"
                  element={
                    <RequireRole roles={["admin", "dosen", "kaprodi", "mahasiswa"]} resource="cpl">
                      <CPLPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="cpl/:id"
                  element={
                    <RequireRole roles={["admin", "dosen", "kaprodi", "mahasiswa"]} resource="cpl">
                      <CPLDetailPage />
                    </RequireRole>
                  }
                />

                <Route
                  path="mata-kuliah"
                  element={
                    <RequireRole roles={["admin", "kaprodi", "dosen"]} resource="mata_kuliah">
                      <MataKuliahPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="dosen-pengampu"
                  element={
                    <RequireRole roles={["admin"]} resource="dosen_pengampu">
                      <DosenPengampuPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="mahasiswa"
                  element={
                    <RequireRole roles={["admin", "dosen", "kaprodi"]} resource="mahasiswa">
                      <MahasiswaPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="users"
                  element={
                    <RequireRole roles={["admin"]} resource="users">
                      <UsersPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="nilai-teknik"
                  element={
                    <RequireRole roles={["admin", "kaprodi", "dosen"]} resource="nilai_teknik">
                      <InputNilaiTeknikPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="cpmk"
                  element={
                    <RequireRole roles={["admin", "dosen", "kaprodi"]} resource="cpmk">
                      <CPMKPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="cpmk/:id"
                  element={
                    <RequireRole roles={["admin", "dosen", "kaprodi"]} resource="cpmk">
                      <CPMKDetailPage />
                    </RequireRole>
                  }
                />

                <Route path="transkrip-cpl" element={
                  <RequireRole roles={["admin", "dosen", "kaprodi", "mahasiswa"]} resource="transkrip_cpl">
                    <TranskripCPLPage />
                  </RequireRole>
                } />
                <Route path="transkrip-cpl/:mahasiswaId" element={
                  <RequireRole roles={["admin", "dosen", "kaprodi", "mahasiswa"]} resource="transkrip_cpl">
                    <TranskripCPLPage />
                  </RequireRole>
                } />
                <Route path="analisis" element={
                  <RequireRole roles={["admin", "dosen", "kaprodi"]} resource="analisis_cpl">
                    <AnalisisiPage />
                  </RequireRole>
                } />

                {/* New OBE Routes */}
                <Route path="visi-misi" element={
                  <RequireRole roles={['admin', 'dosen', 'kaprodi', 'mahasiswa']} resource="visi_misi">
                    <VisiMisiPage />
                  </RequireRole>
                } />
                <Route path="profil-lulusan" element={
                  <RequireRole roles={['admin', 'dosen', 'kaprodi', 'mahasiswa']} resource="profil_lulusan">
                    <ProfilLulusanPage />
                  </RequireRole>
                } />
                <Route path="kuesioner" element={
                  <RequireRole roles={['mahasiswa']} resource="kuesioner">
                    <KuesionerCplPage />
                  </RequireRole>
                } />
                <Route path="rekap-kuesioner" element={
                  <RequireRole roles={["admin", "kaprodi"]} resource="rekap_kuesioner">
                    <RekapKuesionerPage />
                  </RequireRole>
                } />
                <Route path="rubrik/:cpmkId" element={
                  <RequireRole roles={["admin", "kaprodi", "dosen"]} resource="cpmk">
                    <RubrikManager />
                  </RequireRole>
                } />
                <Route path="evaluasi/:mataKuliahId" element={
                  <RequireRole roles={["admin", "kaprodi", "dosen"]} resource="mata_kuliah">
                    <EvaluasiMataKuliah />
                  </RequireRole>
                } />


                <Route
                  path="kaprodi-data"
                  element={
                    <RequireRole roles={["admin"]} resource="kaprodi_data">
                      <KaprodiDataSettings />
                    </RequireRole>
                  }
                />
                <Route
                  path="role-access"
                  element={
                    <RequireRole roles={["admin"]} resource="role_access">
                      <RoleAccessPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="default-role-access"
                  element={
                    <RequireRole roles={["admin"]} resource="role_access">
                      <DefaultRoleAccessPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="role-management"
                  element={
                    <RequireRole roles={["admin"]} resource="role_metadata">
                      <RoleManagementPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="fakultas"
                  element={
                    <RequireRole roles={["admin"]} resource="fakultas">
                      <FakultasPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="activity-log"
                  element={
                    <RequireRole roles={["admin", "dekan"]} resource="audit_log">
                      <ActivityLogPage />
                    </RequireRole>
                  }
                />
                <Route path="evaluasi-cpl" element={
                  <RequireRole roles={['admin', 'kaprodi', 'dosen']} resource="evaluasi_cpl">
                    <EvaluasiCPLPage />
                  </RequireRole>
                } />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="test-navbar" element={<TestNavbar />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PermissionProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider >
);

export default App;
