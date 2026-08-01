import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./components/common/ThemeProvider.tsx";
import { HelmetProvider } from "react-helmet-async";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// Auto-reload gracefully when a new build deployment updates bundle chunk hashes
window.addEventListener("vite:preloadError", () => {
  console.warn("Build baru terdeteksi. Memuat ulang halaman...");
  window.location.reload();
});

window.addEventListener("error", (event) => {
  const msg = event.message || "";
  if (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("error loading dynamically imported module") ||
    msg.includes("Importing a module script failed")
  ) {
    console.warn("Chunk bundle lama tidak ditemukan (build baru telah di-deploy). Memuat ulang halaman...");
    window.location.reload();
  }
});

// Debug log — hanya aktif di development, tidak bocor ke production
if (import.meta.env.DEV) {
  console.log("Environment:", import.meta.env.MODE);
  console.log("Google Client ID:", GOOGLE_CLIENT_ID ? "Loaded ✓" : "NOT LOADED ✗");
  if (!GOOGLE_CLIENT_ID) {
    console.warn("⚠️  VITE_GOOGLE_CLIENT_ID is not set. Google Sign-In will not work.");
  }
}

const AppWrapper = () => (
  <HelmetProvider>
    <ThemeProvider>
      {GOOGLE_CLIENT_ID ? (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <App />
        </GoogleOAuthProvider>
      ) : (
        // Render App tanpa GoogleOAuthProvider jika clientId tidak tersedia
        // agar tidak terjadi error "client_id is required" dari library
        <App />
      )}
    </ThemeProvider>
  </HelmetProvider>
);

createRoot(document.getElementById("root")!).render(<AppWrapper />);
