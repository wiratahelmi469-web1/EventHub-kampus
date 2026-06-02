// ADDED: Universal dashboard shell layout with client-side session defense gatekeeping
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { Shield, Sparkles, AlertTriangle, ArrowRight } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [authorized, setAuthorized] = useState(() => {
    if (typeof window !== "undefined") {
      const isGuestPath = window.location.pathname.includes("/dashboard/guest");
      if (isGuestPath) return true;
      const savedAuth = localStorage.getItem("eventhub_auth");
      if (savedAuth) {
        try {
          const parsed = JSON.parse(savedAuth);
          if (parsed && parsed.isLoggedIn) return true;
        } catch (e) {}
      }
    }
    return false;
  });

  useEffect(() => {
    if (loading) return;

    const savedAuth = localStorage.getItem("eventhub_auth");
    
    // Check if path is guest
    const isGuestPath = pathname?.includes("/dashboard/guest");

    if (isGuestPath) {
      setTimeout(() => {
        setAuthorized(true);
      }, 0);
      return;
    }

    if (!savedAuth) {
      // Not logged in and not guest -> go to login
      router.replace("/login");
      return;
    }

    try {
      const parsed = JSON.parse(savedAuth);
      if (parsed && parsed.isLoggedIn) {
        setTimeout(() => {
          setAuthorized(true);
        }, 0);
      } else {
        router.replace("/login");
      }
    } catch (e) {
      router.replace("/login");
    }
  }, [loading, pathname, router]);

  if (loading || !authorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#114E8D]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-widest">
            Memverifikasi Sidik Jari Anda...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      {/* Dynamic Navigation Header */}
      <Navbar />

      {/* Main Content Pane */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Mini Simple Footer with Branding */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-12 text-center text-slate-500 text-[11px] font-mono leading-relaxed">
        <p>© 2026 Universitas Nurul Fikri — EventHub System</p>
        <p className="text-[9px] text-slate-600 mt-1 uppercase tracking-widest font-black">
          Sistem Informasi Kepanitiaan Kampus & Manajemen Sertifikat Terpusat
        </p>
      </footer>
    </div>
  );
}
