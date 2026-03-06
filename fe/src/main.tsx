import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./components/common/ThemeProvider.tsx";
import { HelmetProvider } from "react-helmet-async";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// Debug log
console.log("Environment:", import.meta.env.MODE);
console.log("Google Client ID:", GOOGLE_CLIENT_ID ? "Loaded ✓" : "NOT LOADED ✗");
if (!GOOGLE_CLIENT_ID) {
  console.warn("⚠️  VITE_GOOGLE_CLIENT_ID is not set. Google Sign-In will not work.");
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <ThemeProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </ThemeProvider>
  </HelmetProvider>
);
