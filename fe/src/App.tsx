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
import ValidasiCPMKPage from "./pages/dashboard/ValidasiCPMK";
import TranskripCPLPage from "./pages/dashboard/TranskripCPL";
import KaprodiDataSettings from "./pages/dashboard/KaprodiDataSettings";
import DosenPengampuPage from "./pages/dashboard/DosenPengampu";
import TestNavbar from "./pages/TestNavbar";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RequireRole } from "@/components/RequireRole";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
              path="validasi-cpmk"
              element={
                <RequireRole roles={["admin", "kaprodi", "dosen"]}>
                  <ValidasiCPMKPage />
                </RequireRole>
              }
            />
            <Route
              path="mata-kuliah"
              element={
                <RequireRole roles={["admin", "kaprodi"]}>
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
                <RequireRole roles={["dosen"]}>
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
            <Route path="analisis" element={<AnalisisiPage />} />
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
  </QueryClientProvider>
);

export default App;
