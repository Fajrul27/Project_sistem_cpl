import { useUser, UserRole } from "../contexts/UserContext";

// Re-export UserRole type
export type { UserRole };

// Shim useUserRole to use the centralized context
export function useUserRole() {
  return useUser();
}
