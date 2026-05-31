"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function DashboardRoutePicker() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // 1. Check if we have a standard NextAuth session
    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role;
      const mappedRole = role === "staf" || role === "staff" ? "staff" : role.toLowerCase();
      router.replace(`/dashboard/${mappedRole}`);
      return;
    }

    // 2. Check localStorage as fallback (for Guests or preserved state)
    if (status !== "loading") {
      if (typeof window !== "undefined") {
        const authDataStr = localStorage.getItem("eventhub_auth");
        if (authDataStr) {
          try {
            const authData = JSON.parse(authDataStr);
            if (authData && authData.isLoggedIn && authData.role) {
              const role = authData.role;
              const mappedRole = role === "staf" || role === "staff" ? "staff" : role.toLowerCase();
              router.replace(`/dashboard/${mappedRole}`);
              return;
            }
          } catch (e) {
            console.error("Error reading localStorage session", e);
          }
        }
      }
      
      // 3. Fallback to login if neither exists
      router.replace("/login");
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin h-8 w-8 text-[#1976D2]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-sm font-semibold text-slate-600 font-mono">Mengarahkan Dashboard...</p>
      </div>
    </div>
  );
}
