import { useState, useEffect } from "react";
import { supabase } from "@/lib/api-client";

export type UserRole = "admin" | "dosen" | "mahasiswa" | "kaprodi" | "dekan" | null;

export function useUserRole() {
  const [role, setRole] = useState<UserRole>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setRole(null);
        setUserId(null);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      // Role already included in user object from /api/auth/me
      if (user.role && typeof user.role === 'object' && 'role' in user.role) {
        setRole(user.role.role as UserRole);
      } else if (typeof user.role === 'string') {
        setRole(user.role as UserRole);
      } else {
        setRole(null);
      }
    } catch (error) {
      console.error("Error fetching role:", error);
      setRole(null);
      setUserId(null);
    } finally {
      setLoading(false);
    }
  };

  return { role, userId, loading, refetch: fetchUserRole };
}
