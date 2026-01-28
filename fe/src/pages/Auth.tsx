import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/common/RequiredLabel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { supabase, fetchProdiList } from "@/lib/api";

// const API_URL = import.meta.env.VITE_API_URL || '/api'; // No longer needed

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [prodiList, setProdiList] = useState<any[]>([]);
  const [selectedProdi, setSelectedProdi] = useState("");

  useEffect(() => {
    // Check if user already logged in
    const user = localStorage.getItem('user');
    if (user) {
      navigate("/dashboard");
    }

    // Fetch Prodi list
    const fetchProdi = async () => {
      try {
        const response = await fetchProdiList();
        if (response.data) {
          setProdiList(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch prodi:", error);
      }
    };
    fetchProdi();
  }, [navigate]);

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
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            prodiId: selectedProdi // Pass this if supported by signUp wrapper, otherwise we might need to adjust api-client
          }
        }
      });

      // Note: api-client's signUp wrapper currently only takes full_name in options.data
      // We might need to update api-client to pass prodiId if we want to support it here.
      // But for now, let's use what's there. 
      // Wait, I should check api-client's signUp implementation.
      // It takes options.data.full_name. It doesn't seem to pass other fields to /register.
      // I should update api-client.ts first if I want to support prodiId in signup here.
      // BUT, the user's issue is LOGIN.
      // Let's stick to fixing login first.

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Akun berhasil dibuat! Silakan login.");
      setEmail("");
      setPassword("");
      setFullName("");
    } catch (error: any) {
      toast.error(error.message);
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Sistem CPL</CardTitle>
          <CardDescription>Pengukuran Capaian Pembelajaran Lulusan</CardDescription>
        </CardHeader>
        <CardContent>
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
                className="bg-card"
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
                  className="pr-10 bg-card"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                >
                  {showLoginPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span className="sr-only">Toggle password visibility</span>
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
