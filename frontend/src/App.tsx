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
import CPLMappingPage from "./pages/dashboard/CPLMapping";
import MataKuliahPage from "./pages/dashboard/MataKuliah";
import MahasiswaPage from "./pages/dashboard/Mahasiswa";
import UsersPage from "./pages/dashboard/Users";
import InputNilaiPage from "./pages/dashboard/InputNilai";
import AnalisisiPage from "./pages/dashboard/Analisis";
import SettingsPage from "./pages/dashboard/Settings";
import ProfilePage from "./pages/dashboard/Profile";
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
                <RequireRole roles={["admin", "dosen"]}>
                  <CPLPage />
                </RequireRole>
              }
            />
            <Route
              path="cpl/:id"
              element={
                <RequireRole roles={["admin", "dosen"]}>
                  <CPLDetailPage />
                </RequireRole>
              }
            />
            <Route
              path="cpl-mapping"
              element={
                <RequireRole roles={["admin"]}>
                  <CPLMappingPage />
                </RequireRole>
              }
            />
            <Route
              path="mata-kuliah"
              element={
                <RequireRole roles={["admin"]}>
                  <MataKuliahPage />
                </RequireRole>
              }
            />
            <Route
              path="mahasiswa"
              element={
                <RequireRole roles={["admin", "dosen"]}>
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
              path="nilai"
              element={
                <RequireRole roles={["dosen"]}>
                  <InputNilaiPage />
                </RequireRole>
              }
            />
            <Route path="analisis" element={<AnalisisiPage />} />
            <Route path="settings" element={<SettingsPage />} />
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
