import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/api";

export type UserRole = "admin" | "dosen" | "mahasiswa" | "kaprodi" | "dekan" | null;

interface UserContextType {
    role: UserRole;
    userId: string | null;
    profile: any;
    loading: boolean;
    refetch: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [role, setRole] = useState<UserRole>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    const fetchUserRole = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setRole(null);
                setUserId(null);
                setProfile(null);
                setLoading(false);
                return;
            }

            setUserId(user.id);
            // @ts-ignore
            setProfile(user.profile || null);

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
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserRole();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                // Pass session to avoid extra fetch if possible, or just refetch
                if (session?.user) {
                    const user = session.user;
                    setUserId(user.id);
                    // @ts-ignore
                    setProfile(user.profile || null);

                    if (user.role && typeof user.role === 'object' && 'role' in user.role) {
                        setRole(user.role.role as UserRole);
                    } else if (typeof user.role === 'string') {
                        setRole(user.role as UserRole);
                    } else {
                        setRole(null);
                    }
                    setLoading(false);
                }
            } else if (event === 'SIGNED_OUT') {
                setRole(null);
                setUserId(null);
                setProfile(null);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <UserContext.Provider value={{ role, userId, profile, loading, refetch: fetchUserRole }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
