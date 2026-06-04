"use client";

import { useSession } from "next-auth/react";

export function useCurrentUser() {
  const { data: session, status, update } = useSession();
  
  // Normalize roles: if it returns "staf", map to "staf" or "staff" nicely
  const rawRole = session?.user?.role;
  const role = rawRole ? (rawRole === "staff" ? "staf" : rawRole) : undefined;

  return {
    user: session?.user,
    role: role as "po" | "panitia" | "mahasiswa" | "staf" | undefined,
    status,
    loading: status === "loading",
    isAuthenticated: status === "authenticated",
    update,
  };
}
