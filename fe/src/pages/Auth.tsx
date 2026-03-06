import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/common/RequiredLabel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { GraduationCap, Eye, EyeOff, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { supabase, fetchProdiList } from "@/lib/api";
import SEO from "@/components/common/SEO";
import { GoogleLogin } from "@react-oauth/google";
import { Separator } from "@/components/ui/separator";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  // Key trick: increment setelah mount agar GoogleLogin remount dan re-init script Google
  const [googleKey, setGoogleKey] = useState(0);

  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Forgot Password State
  const [authView, setAuthView] = useState<'login' | 'forgot_email' | 'verify_code' | 'reset_password'>('login');
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Resend Timer State
  const [timer, setTimer] = useState(0);
  const canResend = timer === 0;

  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      // Use getSession for a quiet local check first
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user && !location.state?.from) {
        window.location.href = "/dashboard";
      }
    };
    checkSession();

    // Remount GoogleLogin setelah komponen mount agar script GSI Google ter-inisialisasi ulang
    // Memperbaiki masalah "client_id undefined" setelah redirect dari logout
    const t = setTimeout(() => setGoogleKey(prev => prev + 1), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        toast.success("Login berhasil!");
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      toast.error(error.message);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      if (!credentialResponse.credential) {
        throw new Error("Gagal mengambil credential dari Google");
      }

      const { data, error } = await supabase.auth.signInWithGoogle(credentialResponse.credential);

      if (error) throw new Error(error.message);

      if (data?.session) {
        toast.success("Login Google berhasil!");
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      toast.error(error.message);
      console.error('Google login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.forgotPassword(resetEmail);

      if (error) {
        throw new Error(error.message);
      }

      toast.success(data?.message || "Kode verifikasi telah dikirim ke email");
      setAuthView('verify_code');
      setTimer(10); // Start 10s timer
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.forgotPassword(resetEmail);
      if (error) throw new Error(error.message);

      toast.success("Kode verifikasi telah dikirim ulang");
      setTimer(10); // Reset 10s timer
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyResetCode(resetEmail, resetCode);

      if (error) throw new Error(error.message);

      toast.success("Kode valid. Silakan buat password baru.");
      setAuthView('reset_password');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.resetPassword(resetEmail, resetCode, newPassword);

      if (error) throw new Error(error.message);

      if (data && (data as any).session) {
        toast.success("Password berhasil direset. Login otomatis...");
        window.location.href = "/dashboard";
      } else {
        toast.success("Password berhasil direset. Silakan login.");
        setAuthView('login');
        setEmail(resetEmail);
        setPassword("");
        setResetCode("");
        setNewPassword("");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-[#020817] transition-colors duration-500">
      {/* Subtle Mesh Gradient for Professional Look */}
      <div className="absolute inset-0 z-0 opacity-30 dark:opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full flex items-center justify-center">
        <SEO
          title="Login ke Sistem Penilaian OBE"
          description="Masuk ke platform pengukuran Capaian Pembelajaran Lulusan untuk mengakses data akademik Anda"
        />
        <Card className="w-full max-w-md shadow-2xl border-slate-200/60 dark:border-slate-800/50 backdrop-blur-md bg-white/90 dark:bg-slate-900/95 transition-all duration-300">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="Logo UNUGHA" className="h-20 w-auto" />
            </div>
            <CardTitle className="text-2xl">Sistem Penilaian OBE</CardTitle>
          </CardHeader>
          <CardContent>
            {authView === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <RequiredLabel htmlFor="login-email" required>Email</RequiredLabel>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="nama@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-card focus-visible:ring-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <RequiredLabel htmlFor="login-password" required>Password</RequiredLabel>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10 bg-card focus-visible:ring-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    >
                      {showLoginPassword ? (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span className="sr-only">Toggle password visibility</span>
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => { setAuthView('forgot_email'); setResetEmail(email); }}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Lupa Password?
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Loading..." : "Login"}
                </Button>

                <div className="space-y-4 pt-2">
                  <div className="relative flex items-center">
                    <span className="flex-grow border-t"></span>
                    <span className="flex-shrink mx-4 text-xs text-muted-foreground uppercase">atau</span>
                    <span className="flex-grow border-t"></span>
                  </div>

                  <div className="flex justify-center flex-col gap-3">
                    {googleClientId ? (
                      <div className="flex justify-center w-full">
                        <GoogleLogin
                          key={googleKey}
                          onSuccess={handleGoogleSuccess}
                          onError={() => toast.error("Gagal login dengan Google")}
                          theme="outline"
                          shape="pill"
                          size="large"
                          width="350px"
                          text="signin_with"
                          useOneTap
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <p className="text-xs text-red-600 dark:text-red-400">
                          Google Sign-In tidak tersedia. Hubungi administrator untuk konfigurasi.
                        </p>
                      </div>
                    )}

                    <p className="text-[10px] text-center text-muted-foreground">
                      Pastikan Anda menggunakan email yang terdaftar di sistem.
                    </p>
                  </div>
                </div>
              </form>
            )}

            {authView === 'forgot_email' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-lg">Reset Password</h3>
                  <p className="text-sm text-muted-foreground">Masukkan email yang terdaftar untuk menerima kode verifikasi.</p>
                </div>
                <div className="space-y-2">
                  <RequiredLabel htmlFor="reset-email" required>Email</RequiredLabel>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="nama@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Mengirim..." : "Kirim Kode Verifikasi"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setAuthView('login')}
                  >
                    Kembali ke Login
                  </Button>
                </div>
              </form>
            )}

            {authView === 'verify_code' && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-lg">Verifikasi Kode</h3>
                  <p className="text-sm text-muted-foreground">Masukkan 6 digit kode yang dikirim ke <strong>{resetEmail}</strong></p>
                </div>
                <div className="space-y-2">
                  <RequiredLabel htmlFor="otp-code" required>Kode Verifikasi</RequiredLabel>
                  <Input
                    id="otp-code"
                    type="text"
                    placeholder="123456"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    className="bg-card text-center text-2xl tracking-[0.5em] font-mono"
                    maxLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Verifikasi..." : "Verifikasi Kode"}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleResendCode}
                      disabled={!canResend || loading}
                    >
                      {timer > 0 ? `Kirim Ulang (${timer}s)` : "Kirim Ulang Kode"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => setAuthView('forgot_email')}
                    >
                      Ganti Email
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {authView === 'reset_password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-lg">Buat Password Baru</h3>
                  <p className="text-sm text-muted-foreground">Silakan masukkan password baru Anda.</p>
                </div>
                <div className="space-y-2">
                  <RequiredLabel htmlFor="new-password" required>Password Baru</RequiredLabel>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="pr-10 bg-card"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span className="sr-only">Toggle password visibility</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Menyimpan..." : "Simpan Password Baru"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
