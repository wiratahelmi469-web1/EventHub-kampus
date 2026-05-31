// CREATED: app/profile/page.tsx
// FIXED: 404 - Redirects central /profile to role-specific dashboard profile pages
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    
    if (user) {
      const mappedRole = (user.role as string) === "staf" ? "staff" : user.role;
      router.replace(`/dashboard/${mappedRole}/profile`);
    } else {
      router.replace("/login");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center font-mono text-xs text-slate-400 font-bold tracking-widest uppercase animate-pulse">
      Memuat Profil Anda...
    </div>
  );
}
