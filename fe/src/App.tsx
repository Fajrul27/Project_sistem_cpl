import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PermissionProvider } from "./contexts/PermissionContext";
import { UserProvider } from "./contexts/UserContext";
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements, Navigate } from "react-router-dom";
import { LoadingScreen } from "@/components/common/LoadingScreen";

// Auth is the first page, we can keep it static or lazy. Let's lazy load it too for consistency.
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CPLPage = lazy(() => import("./pages/dashboard/CPL"));
const CPLDetailPage = lazy(() => import("./pages/dashboard/CPLDetail"));
const MataKuliahPage = lazy(() => import("./pages/dashboard/MataKuliah"));
const MahasiswaPage = lazy(() => import("./pages/dashboard/Mahasiswa"));
const UsersPage = lazy(() => import("./pages/dashboard/Users"));
const InputNilaiTeknikPage = lazy(() => import("./pages/dashboard/InputNilaiTeknik"));
const AnalisisiPage = lazy(() => import("./pages/dashboard/Analisis"));
const KrsPage = lazy(() => import("./pages/dashboard/KrsPage"));
const ProfilePage = lazy(() => import("./pages/dashboard/Profile"));
const DebugAccess = lazy(() => import("./pages/dashboard/DebugAccess"));
const CPMKPage = lazy(() => import("./pages/dashboard/CPMK"));
const CPMKDetailPage = lazy(() => import("./pages/dashboard/CPMKDetail"));
const TranskripCPLPage = lazy(() => import("./pages/dashboard/TranskripCPL"));
const KaprodiDataSettings = lazy(() => import("./pages/dashboard/KaprodiDataSettings"));
const DosenPengampuPage = lazy(() => import("./pages/dashboard/DosenPengampu"));
const NotFound = lazy(() => import("./pages/NotFound"));

// New OBE Pages
const RubrikManager = lazy(() => import("./pages/dashboard/RubrikManager"));
const EvaluasiMataKuliah = lazy(() => import("./pages/dashboard/EvaluasiMataKuliah"));
const VisiMisiPage = lazy(() => import("./pages/dashboard/VisiMisi"));
const ProfilLulusanPage = lazy(() => import("./pages/dashboard/ProfilLulusan"));
const KuesionerCplPage = lazy(() => import("./pages/dashboard/KuesionerCpl"));
const RekapKuesionerPage = lazy(() => import("./pages/dashboard/RekapKuesioner"));
const RoleAccessPage = lazy(() => import("./pages/dashboard/RoleAccess"));
const DefaultRoleAccessPage = lazy(() => import("./pages/dashboard/DefaultRoleAccess"));
const RoleManagementPage = lazy(() => import("./pages/dashboard/RoleManagement"));
const EvaluasiCPLPage = lazy(() => import("./pages/dashboard/EvaluasiCPL"));
const FakultasPage = lazy(() => import("./pages/dashboard/FakultasPage"));
const ActivityLogPage = lazy(() => import("./pages/dashboard/ActivityLog"));
const MasterAkademikPage = lazy(() => import("./pages/dashboard/MasterAkademikPage"));
const SkalaNilaiPage = lazy(() => import("./pages/dashboard/SkalaNilaiPage"));
const InstansiSettings = lazy(() => import("./pages/dashboard/InstansiSettings"));

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RequireRole } from "@/components/common/RequireRole";

const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
          path="krs"
          element={
            <RequireRole roles={["admin", "kaprodi"]} resource="tahun_ajaran">
              <KrsPage />
            </RequireRole>
          }
        />
        <Route
          path="master-akademik"
          element={
            <RequireRole roles={["admin", "kaprodi"]} resource="tahun_ajaran">
              <MasterAkademikPage />
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
        <Route path="rubrik/:cpmkId" element={
          <RequireRole roles={["admin", "kaprodi", "dosen"]} resource="cpmk">
            <RubrikManager />
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
          path="instansi"
          element={
            <RequireRole roles={["admin"]} resource="settings">
              <InstansiSettings />
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
          path="skala-nilai"
          element={
            <RequireRole roles={["admin", "kaprodi"]} resource="fakultas">
              <SkalaNilaiPage />
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
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    }
  }
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UserProvider>
        <PermissionProvider>
          <Suspense fallback={<LoadingScreen message="Memuat halaman..." />}>
            <RouterProvider router={router} future={{ v7_startTransition: true }} />
          </Suspense>
        </PermissionProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider >
);

export default App;
