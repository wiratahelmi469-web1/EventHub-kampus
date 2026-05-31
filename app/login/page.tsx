"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, AlertTriangle, Key, Mail, ChevronDown, ChevronUp, Check, 
  Sparkles, HelpCircle, ArrowRight, UserCheck
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoSection, setShowDemoSection] = useState(true);

  // Demo users listing
  const DEMO_USERS = [
    { email: "po@kampus.ac.id", password: "po123", role: "po", description: "Project Officer (Rian Prasetya)" },
    { email: "panitia@kampus.ac.id", password: "panitia123", role: "panitia", description: "Divisi Acara (Dian Permata)" },
    { email: "mahasiswa@kampus.ac.id", password: "mhs123", role: "mahasiswa", description: "Mahasiswa Aktif (Helmi Wirata)" },
    { email: "staff@kampus.ac.id", password: "staff123", role: "staff", description: "Staf Kemahasiswaan (Tri Wahyuni)" },
  ];

  // Load registered users from localStorage for testing
  const findRegisteredUser = (emailInput: string, passwordInput: string) => {
    if (typeof window === "undefined") return null;
    const dataString = localStorage.getItem("eventhub_registered_users");
    if (!dataString) return null;
    try {
      const users = JSON.parse(dataString);
      if (Array.isArray(users)) {
        return users.find(
          (u) => u.email.toLowerCase() === emailInput.toLowerCase() && u.password === passwordInput
        );
      }
    } catch (e) {
      console.error("Failed to parse eventhub_registered_users", e);
    }
    return null;
  };

  const handleDemoSelect = (demo: typeof DEMO_USERS[0]) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Email dan password wajib diisi.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Check if it's a demo user or custom registered user in localStorage
      let name = "";
      let role = "";

      const isDemo = DEMO_USERS.some(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!isDemo) {
        const customUser = findRegisteredUser(email, password);
        if (customUser) {
          name = customUser.name;
          role = customUser.role;
        } else {
          // Normal validation will fail, but let next-auth attempt it
        }
      }

      // 2. Perform dynamic sign-in
      const res = await signIn("credentials", {
        email,
        password,
        name, // Passed dynamically for localStorage users
        role, // Passed dynamically for localStorage users
        redirect: false,
      });

      if (res?.error) {
        setErrorMessage("Email atau password yang Anda masukkan salah. Gunakan akun demo di bawah untuk mencoba.");
        setIsLoading(false);
      } else {
        // Success redirect
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setErrorMessage("Koneksi server bermasalah. Silakan coba kembali.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#1976D2]/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative z-10 transition-all duration-300">
        
        {/* Header Branding */}
        <div className="bg-[#114E8D] text-white p-8 relative">
          <div className="absolute top-0 right-0 h-1.5 w-full bg-amber-500"></div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 w-11 h-11 rounded-xl flex items-center justify-center text-white border border-white/10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-1.5">
                EventHub <span className="text-amber-300 font-extrabold text-lg">Kampus</span>
              </h2>
              <p className="text-xs uppercase tracking-widest opacity-80 font-mono">
                Sistem Informasi Event & Kepanitiaan
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          
          {/* Error Message Box */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 bg-rose-50 text-rose-700 border border-rose-200 p-4 rounded-xl flex items-start gap-2.5 text-xs font-semibold leading-relaxed"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold">Login Gagal:</span> {errorMessage}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                Email Institusi Kampus
              </label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-all"
                  placeholder="mahasiswa@kampus.ac.id"
                  required
                />
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  Password Akun
                </label>
                <span className="text-xs text-[#1976D2] font-semibold hover:underline cursor-pointer">
                  Lupa Password?
                </span>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Login button */}
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#1976D2] hover:bg-[#114E8D] disabled:bg-slate-400 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-1.5 focus:ring-4 focus:ring-sky-100"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Memverifikasi Masuk...
                  </>
                ) : (
                  <>
                    Masuk Sekarang <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Collapsible Demo Users Panel */}
          <div className="mt-6 border-t pt-5">
            <button
              type="button"
              onClick={() => setShowDemoSection(!showDemoSection)}
              className="w-full flex items-center justify-between text-slate-600 bg-slate-50 hover:bg-slate-100 p-3 rounded-xl transition-all border border-slate-200"
            >
              <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                Daftar Akun Pengujian (Demo Akun)
              </span>
              {showDemoSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {showDemoSection && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-3"
                >
                  <p className="text-[11px] text-slate-500 mb-2 px-1">
                    Klik tombol di bawah untuk langsung mengisi form dengan akun simulasi:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DEMO_USERS.map((demo) => {
                      const isSelected = email === demo.email;
                      // Badges depending on role
                      const badgeClass = 
                        demo.role === "po" ? "bg-purple-100 text-purple-700 font-bold border-purple-200" :
                        demo.role === "panitia" ? "bg-blue-100 text-blue-700 font-bold border-blue-200" :
                        demo.role === "mahasiswa" ? "bg-emerald-100 text-emerald-700 font-bold border-emerald-200" :
                        "bg-orange-100 text-orange-700 font-bold border-orange-200";

                      return (
                        <button
                          key={demo.email}
                          type="button"
                          onClick={() => handleDemoSelect(demo)}
                          className={`p-2.5 rounded-lg border text-left transition-all leading-relaxed relative ${
                            isSelected 
                              ? "bg-sky-50/50 border-[#1976D2] ring-2 ring-sky-100" 
                              : "bg-white hover:border-slate-350 border-slate-200"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-xs font-extrabold text-slate-800 tracking-tight block truncate">
                              {demo.description.split(" (")[0]}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full border tracking-wider uppercase shrink-0 ${badgeClass}`}>
                              {demo.role}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono font-semibold select-all">
                            {demo.email}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-0.5">
                            Sandi: <span className="font-mono font-semibold text-slate-600">{demo.password}</span>
                          </p>
                          {isSelected && (
                            <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick links */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Belum memiliki kredensial keanggotaan?{" "}
            <Link href="/register" className="text-[#1976D2] font-semibold hover:underline">
              Pendaftaran Anggota Baru &rarr;
            </Link>
          </div>

        </div>
      </div>

      <div className="mt-6 text-slate-400 text-xs font-mono">
        Jurusan Sistem Informasi &copy; 2026
      </div>
    </div>
  );
}
