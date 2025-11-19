import { useState, useEffect } from "react";
import { supabase } from "@/lib/api-client";

export type UserRole = "admin" | "dosen" | "mahasiswa" | null;

export function useUserRole() {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      // Role already included in user object from /api/auth/me
      if (user.role) {
        setRole(user.role as UserRole);
      } else {
        setRole(null);
      }
    } catch (error) {
      console.error("Error fetching role:", error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  return { role, loading, refetch: fetchUserRole };
}
