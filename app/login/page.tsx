"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, AlertTriangle, Key, Mail, ChevronDown, ChevronUp, Check, 
  Sparkles, ArrowRight, User, GraduationCap, Building2, Eye, EyeOff
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const { loginUser, registerUser, addToast } = useAuth();

  // Active tab state: 'login' or 'register'
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form states (CHANGED: strictly state names as requested)
  const [namaLengkap, setNamaLengkap] = useState("");
  const [email, setEmail] = useState("");
  const [nimNip, setNimNip] = useState("");
  const [role, setRole] = useState<"mahasiswa" | "staf" | "">("");
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [setuju, setSetuju] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // UI Flow states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // RESPONSIVE: Setup collapsible accordion for demo accounts based on screen size
  const [showDemoSection, setShowDemoSection] = useState(false);

  useEffect(() => {
    // Check url search parameters to match selected tab
    const urlTab = searchParams?.get("tab");
    const targetTab = urlTab === "register" ? "register" : "login";
    if (activeTab !== targetTab) {
      const timer = setTimeout(() => {
        setActiveTab(targetTab);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams, activeTab]);

  // RESPONSIVE: On mobile (width < 768px), keep the accordion collapsed by default to save space. On desktop, expand it.
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 768) {
        const timer = setTimeout(() => {
          setShowDemoSection(true);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Demo accounts (CHANGED: Universitas Nurul Fikri domains and fields)
  const DEMO_ACCOUNTS = [
    { email: "po@nurulfikri.ac.id", password: "po123", role: "po", namaLengkap: "Project Officer" },
    { email: "panitia@nurulfikri.ac.id", password: "panitia123", role: "panitia", namaLengkap: "Divisi Acara" },
    { email: "mahasiswa@nurulfikri.ac.id", password: "mhs123", role: "mahasiswa", namaLengkap: "Budi Santoso", nimNip: "2021001" },
    { email: "staff@nurulfikri.ac.id", password: "staff123", role: "staf", namaLengkap: "Staf Kemahasiswaan" }
  ];

  // Redirect if logged in (Client Side Gate keeping)
  useEffect(() => {
    const savedAuth = localStorage.getItem("eventhub_auth");
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        if (parsed.isLoggedIn && parsed.role) {
          const mappedRole = parsed.role === "staf" || parsed.role === "staff" ? "staff" : parsed.role.toLowerCase();
          router.push(`/dashboard/${mappedRole}`);
        }
      } catch (e) {
        // Safe skip
      }
    }
  }, [router]);

  // Handle demo account clicking with dynamic sign in directly
  const handleDemoClick = async (demo: typeof DEMO_ACCOUNTS[0]) => {
    setLoginEmail(demo.email);
    setLoginPassword(demo.password);
    setLoginError(null);
    setIsLoading(true);

    const success = await loginUser(demo.email, demo.password);
    setIsLoading(false);
    if (!success) {
      setLoginError("Email atau password yang Anda masukkan salah");
    }
  };

  // Login handler using specified LOGIC:
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setLoginError(null);

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError("Alamat email dan kata sandi wajib diisi.");
      return;
    }

    setIsLoading(true);

    const success = await loginUser(loginEmail.trim(), loginPassword);
    setIsLoading(false);

    if (!success) {
      setLoginError("Email atau password yang Anda masukkan salah");
    }
  };

  // FIXED: Standard complete logic for register form as requested
  const handleRegister = async () => {
    setErrors({})
    let valid = true
    const newErrors: Record<string, string> = {}

    if (!namaLengkap.trim()) {
      newErrors.namaLengkap = "Nama lengkap wajib diisi";
      valid = false;
    }
    if (!email.includes('.ac.id') || !email.includes('@')) {
      newErrors.email = "Gunakan email institusi (.ac.id)";
      valid = false;
    }
    if (!role) {
      newErrors.role = "Pilih role akun Anda";
      valid = false;
    }
    if (password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
      valid = false;
    }
    if (password !== konfirmasiPassword) {
      newErrors.konfirmasi = "Konfirmasi password tidak cocok";
      valid = false;
    }
    if (!setuju) {
      newErrors.setuju = "Anda harus menyetujui syarat & ketentuan";
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      // Scroll otomatis ke field pertama yang error
      const firstErrKey = Object.keys(newErrors)[0];
      const errorEl = document.getElementById(`register-${firstErrKey}`);
      if (errorEl) {
        errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsLoading(true);

    const existingUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );
    if (existingUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      setErrors({ email: "Email ini sudah terdaftar" });
      setIsLoading(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 600));

    const newUser = {
      id: Date.now().toString(),
      namaLengkap,
      email: email.toLowerCase(),
      nimNip,
      role,
      password,
      tanggalDaftar: new Date().toISOString()
    };

    const updatedUsers = [...existingUsers, newUser];
    localStorage.setItem(
      "registeredUsers",
      JSON.stringify(updatedUsers)
    );

    // Sync other format key "eventhub_registered_users"
    localStorage.setItem("eventhub_registered_users", JSON.stringify(
      updatedUsers.map(u => ({
        nama: u.namaLengkap,
        email: u.email,
        nim: u.nimNip,
        role: u.role,
        password: u.password,
        tanggalBergabung: u.tanggalDaftar.split("T")[0]
      }))
    ));

    setIsLoading(false);
    addToast("Akun berhasil dibuat! Silakan masuk.", "success");

    // Reset form
    setNamaLengkap("");
    setEmail("");
    setNimNip("");
    setRole("");
    setPassword("");
    setKonfirmasiPassword("");
    setSetuju(false);

    // Pindah ke tab Login setelah 1 detik
    setTimeout(() => setActiveTab("login"), 1000);
  };

  // Password Strength Indicator algorithm
  const getPasswordStrengthMessage = (pwd: string) => {
    if (!pwd) return { label: "", color: "" };
    if (pwd.length < 8) return { label: "Lemah", color: "text-rose-550 border-rose-250 bg-rose-50" };
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    if (hasLetters && hasNumbers && hasSpecial) {
      return { label: "Kuat", color: "text-emerald-700 border-emerald-350 bg-emerald-50" };
    }
    return { label: "Sedang", color: "text-amber-700 border-amber-300 bg-amber-50" };
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#1976D2]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm font-semibold text-slate-600 font-mono">Memverifikasi Sesi Aktif...</p>
        </div>
      </div>
    );
  }

  return (
    // RESPONSIVE: Full screen flex with light off-white tone and smooth gradients
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 relative overflow-y-auto">
      
      {/* Visual background aesthetics */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#1976D2]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* RESPONSIVE: Container centered card, mobile width full, desktop max-width 480px */}
      <div className="w-full max-w-[480px] bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative z-10 my-4">
        
        {/* RESPONSIVE: Rich branded header with custom blue, padding py-6 on mobile, py-8 on desktop */}
        <div className="bg-[#114E8D] text-white p-6 md:p-8 relative">
          <div className="absolute top-0 right-0 h-1.5 w-full bg-amber-500"></div>
          <div className="flex items-center gap-3">
            {/* CHANGED: logo → GraduationCap with wrapper */}
            <div className="bg-amber-400 text-slate-950 w-12 h-12 rounded-xl flex items-center justify-center border border-white/20 shadow-md shrink-0">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-1.5">
                EventHub <span className="text-amber-300 font-extrabold text-lg">Kampus</span>
              </h2>
              <p className="text-[10px] uppercase tracking-widest opacity-80 font-mono">
                Universitas Nurul Fikri
              </p>
            </div>
          </div>
        </div>

        {/* INTERACTIVE NAVIGATION TABS: full width tabs, text-sm mobile -> text-base desktop */}
        <div className="flex border-b border-slate-250 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setActiveTab("login");
              setLoginError(null);
            }}
            className={`flex-1 py-3.5 text-center font-bold text-sm md:text-base border-b-2 transition-all ${
              activeTab === "login"
                ? "border-b-4 border-[#1976D2] text-[#1976D2] bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setErrors({});
            }}
            className={`flex-1 py-3.5 text-center font-bold text-sm md:text-base border-b-2 transition-all ${
              activeTab === "register"
                ? "border-b-4 border-[#1976D2] text-[#1976D2] bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            Daftar
          </button>
        </div>

        <div className="p-5 md:p-8">
          
          {/* RESPONSIVE: Feedback Alerts, minimum 16px icons, legible fonts */}
          <AnimatePresence mode="wait">
            {loginError && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 bg-rose-50 text-rose-700 border border-rose-200 p-4 rounded-xl flex items-start gap-2.5 text-sm font-semibold leading-relaxed"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">{loginError}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 1: LOGIN FORM SECTION */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Email Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                  Email Institusi Universitas Nurul Fikri
                </label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full border border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100 rounded-xl pl-10 pr-4 py-3 text-base md:text-sm focus:outline-none transition-all"
                    placeholder="mahasiswa@nurulfikri.ac.id"
                    required
                  />
                  <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                </div>
              </div>

              {/* Password Input */}
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
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full border border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100 rounded-xl pl-10 pr-10 py-3 text-base md:text-sm focus:outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <Key className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit button: Responsive min-height 52px */}
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-[#1976D2] hover:bg-[#114E8D] disabled:bg-slate-400 text-white font-bold h-[52px] rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-1.5 focus:ring-4 focus:ring-sky-100 cursor-pointer"
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

              {/* Divider: ATAU MASUK DENGAN */}
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-slate-200"></div>
                <span className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase">ATAU MASUK DENGAN</span>
                <div className="flex-1 border-t border-slate-200"></div>
              </div>

              {/* RESPONSIF: Google / Outlook SS0 buttons. Stack on mobile, grid layout side by side on desktop */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => alert("Koneksi SSO Universitas Nurul Fikri via OAuth Google sedang dihubungkan.")}
                  className="w-full flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 transition-all h-[44px]"
                >
                  <svg className="w-4.5 h-4.5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.25.61 4.5 1.62l2.42-2.42C17.435 1.55 14.975 1 12.24 1 6.83 1 2.37 5.46 2.37 11s4.46 10 9.87 10c5.33 0 9.76-3.886 9.76-11 0-.68-.08-1.336-.21-1.715H12.24z"/>
                  </svg>
                  Google Nurul Fikri
                </button>
                <button
                  type="button"
                  onClick={() => alert("Koneksi SSO Universitas Nurul Fikri via ActiveDirectory Outlook sedang dihubungkan.")}
                  className="w-full flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 transition-all h-[44px]"
                >
                  <svg className="w-4.5 h-4.5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1.5 5.5v13l13 2.5v-18l-13 2.5zm13 2v8.5l6-1.5v-5.5l-6-1.5z" />
                  </svg>
                  Outlook Nurul Fikri
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: REGISTER FORM SECTION */}
          {activeTab === "register" && (
            <div className="space-y-4">
              
              {/* Full Name */}
              <div id="register-namaLengkap">
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    className={`w-full border rounded-xl pl-10 pr-4 py-3 text-base md:text-sm focus:outline-none transition-all ${
                      errors.namaLengkap ? "border-red-500 focus:ring-4 focus:ring-red-100" : "border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100"
                    }`}
                    placeholder="Contoh: Budi Susanto"
                  />
                  <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                </div>
                {errors.namaLengkap && (
                  <p className="text-red-500 text-xs mt-1 font-semibold">{errors.namaLengkap}</p>
                )}
              </div>

              {/* NIM / NIP Inputs & Role Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div id="register-nimNip">
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                    NIM / NIP Staf (Opsional)
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={nimNip}
                      onChange={(e) => setNimNip(e.target.value)}
                      className="w-full border border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100 rounded-xl pl-10 pr-4 py-3 text-base md:text-sm focus:outline-none transition-all"
                      placeholder="120222XXXX"
                    />
                    <GraduationCap className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                  </div>
                </div>

                <div id="register-role">
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                    Role Pilihan
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className={`w-full border rounded-xl px-3 py-3 text-base md:text-sm focus:outline-none bg-white transition-all font-semibold text-slate-700 h-[50px] ${
                      errors.role ? "border-red-500 focus:ring-4 focus:ring-red-100" : "border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100"
                    }`}
                  >
                    <option value="">-- Pilih --</option>
                    <option value="mahasiswa">Mahasiswa</option>
                    <option value="staf">Staf Kemahasiswaan</option>
                  </select>
                  {errors.role && (
                    <p className="text-red-500 text-xs mt-1 font-semibold">{errors.role}</p>
                  )}
                </div>
              </div>

              {/* Email Input */}
              <div id="register-email">
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                  Email Institusi Universitas Nurul Fikri
                </label>
                <div className="relative font-normal">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full border rounded-xl pl-10 pr-4 py-3 text-base md:text-sm focus:outline-none transition-all ${
                      errors.email ? "border-red-500 focus:ring-4 focus:ring-red-100" : "border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100"
                    }`}
                    placeholder="nama@nurulfikri.ac.id"
                  />
                  <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Wajib menggunakan email resmi kampus (.ac.id)</span>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email}</p>
                )}
              </div>

              {/* New Password & Confirm Passwords in grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div id="register-password">
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input 
                      type={showRegisterPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full border rounded-xl pl-10 pr-10 py-3 text-base md:text-sm focus:outline-none transition-all ${
                        errors.password ? "border-red-500 focus:ring-4 focus:ring-red-100" : "border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100"
                      }`}
                      placeholder="Min 8 karakter"
                    />
                    <Key className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password strength indicator label */}
                  {password && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Kekuatan:</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${getPasswordStrengthMessage(password).color}`}>
                        {getPasswordStrengthMessage(password).label}
                      </span>
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1 font-semibold">{errors.password}</p>
                  )}
                </div>

                <div id="register-konfirmasi">
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showRegisterPassword ? "text" : "password"}
                      value={konfirmasiPassword}
                      onChange={(e) => setKonfirmasiPassword(e.target.value)}
                      className={`w-full border rounded-xl pl-10 pr-4 py-3 text-base md:text-sm focus:outline-none transition-all ${
                        errors.konfirmasi ? "border-red-500 focus:ring-4 focus:ring-red-100" : "border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100"
                      }`}
                      placeholder="Ulangi password"
                    />
                    <Key className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                  </div>
                  {errors.konfirmasi && (
                    <p className="text-red-500 text-xs mt-1 font-semibold">{errors.konfirmasi}</p>
                  )}
                </div>
              </div>

              {/* Checkbox Syarat & Ketentuan */}
              <div id="register-setuju" className="flex items-start gap-2.5 pt-1.5">
                <input 
                  type="checkbox" 
                  id="checkbox-syarat"
                  checked={setuju}
                  onChange={(e) => setSetuju(e.target.checked)}
                  className="mt-0.5 rounded text-[#1976D2] focus:ring-[#1976D2] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="checkbox-syarat" className="text-xs text-slate-600 font-semibold cursor-pointer">
                  Saya menyetujui Syarat & Ketentuan yang berlaku di Universitas Nurul Fikri.
                </label>
              </div>
              {errors.setuju && (
                <p className="text-red-500 text-xs mt-0.5 font-semibold">{errors.setuju}</p>
              )}

              {/* Register Action Button (type="button", onClick={handleRegister}, disabled={isLoading}) */}
              <div className="pt-2">
                <button 
                  type="button" 
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="w-full bg-[#1976D2] hover:bg-[#114E8D] disabled:bg-slate-400 text-white font-bold h-[52px] rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-1.5 focus:ring-4 focus:ring-sky-100 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Mendaftarkan...
                    </>
                  ) : (
                    "Daftar Sekarang →"
                  )}
                </button>
              </div>

            </div>
          )}

          {/* COLLAPSIBLE ACCORDION PANEL FOR DEMO ACCOUNTS */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => setShowDemoSection(!showDemoSection)}
              className="w-full flex items-center justify-between text-slate-600 bg-slate-50 hover:bg-slate-100 p-3 rounded-xl transition-all border border-slate-200"
            >
              <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                Daftar Akun Pengujian (Demo Akun)
              </span>
              {showDemoSection ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
            </button>

            <AnimatePresence>
              {showDemoSection && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-3"
                >
                  <p className="text-[11px] text-slate-500 mb-2.5 px-1 font-medium">
                    Ketuk salah satu kartu demo di bawah untuk otomatis mengisi form dan sign-in:
                  </p>
                  
                  {/* RESPONSIVE DEMO ACCOUNTS CARDS: 1 column on mobile, 2 columns on tablet and desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DEMO_ACCOUNTS.map((demo) => {
                      const isSelected = loginEmail === demo.email;
                      const badgeClass = 
                        demo.role === "po" ? "bg-purple-100 text-purple-700 font-bold border-purple-200" :
                        demo.role === "panitia" ? "bg-blue-100 text-blue-700 font-bold border-blue-200" :
                        demo.role === "mahasiswa" ? "bg-emerald-100 text-emerald-700 font-bold border-emerald-200" :
                        "bg-orange-100 text-orange-700 font-bold border-orange-200";

                      return (
                        <button
                          key={demo.email}
                          type="button"
                          onClick={() => handleDemoClick(demo)}
                          // RESPONSIVE: min-height 44px for perfect tap target metrics
                          className={`p-2.5 rounded-xl border text-left transition-all leading-normal relative min-h-[44px] cursor-pointer ${
                            isSelected 
                              ? "bg-sky-50/50 border-[#1976D2] ring-2 ring-sky-100" 
                              : "bg-white hover:border-slate-350 border-slate-200"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-xs font-extrabold text-slate-800 tracking-tight block truncate">
                              {demo.namaLengkap}
                            </span>
                            <span className={`text-[8.5px] px-1.5 py-0.5 rounded-full border tracking-wider uppercase shrink-0 ${badgeClass}`}>
                              {demo.role === "staf" ? "STAFF" : demo.role.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono font-semibold select-all mt-0.5 truncate">
                            {demo.email}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-0.5">
                            Password: <span className="font-mono font-bold text-slate-600">{demo.password}</span>
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

        </div>
      </div>

      <div className="mt-4 text-slate-400 text-xs font-mono">
        Universitas Nurul Fikri &copy; 2026
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#1976D2]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm font-semibold text-slate-600 font-mono">Memuat Form Masuk...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
