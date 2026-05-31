"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, AlertTriangle, Key, Mail, ChevronDown, ChevronUp, Check, 
  Sparkles, ArrowRight, User, GraduationCap, Building2, Eye, EyeOff
} from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Active tab state: 'login' or 'register'
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form states
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerNimNip, setRegisterNimNip] = useState("");
  const [registerRole, setRegisterRole] = useState<"mahasiswa" | "staf">("mahasiswa");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

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

  // Demo users mapping
  const DEMO_USERS = [
    { email: "po@kampus.ac.id", password: "po123", role: "po", name: "Rian Prasetya", description: "Project Officer" },
    { email: "panitia@kampus.ac.id", password: "panitia123", role: "panitia", name: "Dian Permata", description: "Divisi Acara" },
    { email: "mahasiswa@kampus.ac.id", password: "mhs123", role: "mahasiswa", name: "Helmi Wirata", description: "Mahasiswa Aktif" },
    { email: "staff@kampus.ac.id", password: "staff123", role: "staf", name: "Tri Wahyuni", description: "Staf Kemahasiswaan" },
  ];

  // Redirect if logged in (Client Side Gate keeping)
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      // FIXED: Save state to localStorage to keep persistence consistent with user request
      const role = session.user.role;
      const userEmail = session.user.email || "";
      const userName = session.user.name || "";
      
      localStorage.setItem("eventhub_auth", JSON.stringify({
        email: userEmail,
        role: role,
        nama: userName,
        isLoggedIn: true
      }));

      const mappedRole = role === "staf" || role === "staff" ? "staff" : role.toLowerCase();
      router.push(`/dashboard/${mappedRole}`);
    }
  }, [status, session, router]);

  // Handle demo account clicking with dynamic sign in directly
  const handleDemoClick = async (demo: typeof DEMO_USERS[0]) => {
    setLoginEmail(demo.email);
    setLoginPassword(demo.password);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      // Sync localStorage to keep offline and online state aligned
      localStorage.setItem("eventhub_auth", JSON.stringify({
        email: demo.email,
        role: demo.role,
        nama: demo.name,
        isLoggedIn: true
      }));

      const res = await signIn("credentials", {
        email: demo.email,
        password: demo.password,
        name: demo.name,
        role: demo.role,
        redirect: false
      });

      if (res?.error) {
        setErrorMessage("Email atau password yang Anda masukkan salah.");
        setIsLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setErrorMessage("Terjadi masalah koneksi saat melakukan sign-in demo.");
      setIsLoading(false);
    }
  };

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // FIXED: Prevent double submit

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMessage("Alamat email dan kata sandi wajib diisi.");
      return;
    }

    // Validation: Email format .ac.id check
    const isAcId = loginEmail.toLowerCase().endsWith(".ac.id") || loginEmail.toLowerCase().includes(".ac.id");
    if (!isAcId) {
      setErrorMessage("Wajib menggunakan email resmi kampus .ac.id");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const targetEmail = loginEmail.trim().toLowerCase();

    try {
      // 1. Resolve credentials (Demo users vs registered local storage users)
      const isDemo = DEMO_USERS.find(user => user.email.toLowerCase() === targetEmail);
      let registeredUser: any = null;

      if (typeof window !== "undefined") {
        const localUsers = localStorage.getItem("eventhub_registered_users");
        if (localUsers) {
          const parsedUsers = JSON.parse(localUsers);
          registeredUser = parsedUsers.find((u: any) => u.email.toLowerCase() === targetEmail);
        }
      }

      if (!isDemo && !registeredUser) {
        // FIXED: Informative validation messages (not generic context error)
        setErrorMessage("Email atau password yang Anda masukkan salah");
        setIsLoading(false);
        return;
      }

      const activeUser = isDemo || registeredUser;
      if (activeUser.password !== loginPassword) {
        setErrorMessage("Email atau password yang Anda masukkan salah");
        setIsLoading(false);
        return;
      }

      // 2. Write authentication payload to localStorage
      localStorage.setItem("eventhub_auth", JSON.stringify({
        email: activeUser.email,
        role: activeUser.role,
        nama: activeUser.name,
        isLoggedIn: true
      }));

      // 3. Initiate next-auth credentials synchronization
      const res = await signIn("credentials", {
        email: activeUser.email,
        password: loginPassword,
        name: activeUser.name,
        role: activeUser.role,
        redirect: false
      });

      if (res?.error) {
        setErrorMessage("Email atau password yang Anda masukkan salah");
        setIsLoading(false);
      } else {
        setSuccessMessage("Autentikasi berhasil! Mengarahkan ke dashboard...");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setErrorMessage("Koneksi server terganggu. Silakan periksa jaringan internet Anda.");
      setIsLoading(false);
    }
  };

  // Register handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // FIXED: Prevent double submits

    setErrorMessage(null);
    setSuccessMessage(null);

    const nameTrimmed = registerName.trim();
    const emailTrimmed = registerEmail.trim();
    const nimNipTrimmed = registerNimNip.trim();

    // Validasi form tidak boleh kosong
    if (!nameTrimmed || !emailTrimmed || !registerPassword || !registerConfirmPassword) {
      setErrorMessage("Semua kolom isian wajib diisi secara lengkap.");
      return;
    }

    // Email format .ac.id validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setErrorMessage("Format email yang Anda masukkan tidak valid.");
      return;
    }
    if (!emailTrimmed.toLowerCase().endsWith(".ac.id")) {
      setErrorMessage("Wajib menggunakan email resmi kampus .ac.id");
      return;
    }

    // Password minimal 8 karakter validation
    if (registerPassword.length < 8) {
      setErrorMessage("Password minimal 8 karakter");
      return;
    }

    // Password matches confirmation check
    if (registerPassword !== registerConfirmPassword) {
      setErrorMessage("Password tidak cocok");
      return;
    }

    setIsLoading(true);

    try {
      // Get registered lists
      const localUsersKey = "eventhub_registered_users";
      const existingData = localStorage.getItem(localUsersKey);
      const registeredUsers = existingData ? JSON.parse(existingData) : [];

      // Check if email already taken (both in local storage and demo accounts)
      const existsInLocal = registeredUsers.some((u: any) => u.email.toLowerCase() === emailTrimmed.toLowerCase());
      const existsInDemo = DEMO_USERS.some(u => u.email.toLowerCase() === emailTrimmed.toLowerCase());

      if (existsInLocal || existsInDemo) {
        setErrorMessage("Alamat email ini sudah terdaftar. Silakan masuk memakai email ini.");
        setIsLoading(false);
        return;
      }

      // Add user to localStorage list
      const newUser = {
        name: nameTrimmed,
        email: emailTrimmed,
        nimNip: nimNipTrimmed,
        role: registerRole,
        password: registerPassword,
        createdAt: new Date().toISOString()
      };

      registeredUsers.push(newUser);
      localStorage.setItem(localUsersKey, JSON.stringify(registeredUsers));

      // ADDED: Green success toast redirecting back to Login with auto-fill
      setSuccessMessage("Akun berhasil dibuat! Silakan masuk.");
      
      // Auto fill registered credentials to improve workflow UX
      setLoginEmail(emailTrimmed);
      setLoginPassword(registerPassword);

      // Clean registration states
      setRegisterName("");
      setRegisterEmail("");
      setRegisterNimNip("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");

      setTimeout(() => {
        setIsLoading(false);
        setActiveTab("login");
      }, 1800);

    } catch (e) {
      setErrorMessage("Gagal memproses pendaftaran lokal. Silakan coba sebentar lagi.");
      setIsLoading(false);
    }
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
            <div className="bg-white/10 w-11 h-11 rounded-xl flex items-center justify-center text-white border border-white/10 shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-1.5">
                EventHub <span className="text-amber-300 font-extrabold text-lg">Kampus</span>
              </h2>
              <p className="text-[10px] uppercase tracking-widest opacity-80 font-mono">
                Sistem Informasi Event & Kepanitiaan
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
              setErrorMessage(null);
            }}
            className={`flex-1 py-3.5 text-center font-bold text-sm md:text-base border-b-2 transition-all ${
              activeTab === "login"
                ? "border-[#1976D2] text-[#1976D2] bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setErrorMessage(null);
            }}
            className={`flex-1 py-3.5 text-center font-bold text-sm md:text-base border-b-2 transition-all ${
              activeTab === "register"
                ? "border-[#1976D2] text-[#1976D2] bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            Daftar
          </button>
        </div>

        <div className="p-5 md:p-8">
          
          {/* RESPONSIVE: Feedback Alerts, minimum 16px icons, legible fonts */}
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 bg-rose-50 text-rose-700 border border-rose-200 p-4 rounded-xl flex items-start gap-2.5 text-sm font-semibold leading-relaxed"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">{errorMessage}</div>
              </motion.div>
            )}

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 bg-emerald-50 text-emerald-800 border border-emerald-250 p-4 rounded-xl flex items-start gap-2.5 text-sm font-bold leading-relaxed animate-pulse"
              >
                <Check className="w-4.5 h-4.5 text-white bg-emerald-600 rounded-full p-0.5 shrink-0 mt-0.5" />
                <div className="flex-1">{successMessage}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 1: LOGIN FORM SECTION */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Email Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                  Email Institusi Kampus
                </label>
                <div className="relative">
                  {/* RESPONSIVE: font-size 16px on mobile inputs prevents automatic layout zoom on iOS Safari */}
                  <input 
                    type="email" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full border border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100 rounded-xl pl-10 pr-4 py-3 text-base md:text-sm focus:outline-none transition-all"
                    placeholder="mahasiswa@kampus.ac.id"
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
                  onClick={() => alert("Koneksi sso universitas via OAuth Google sedang dihubungkan.")}
                  className="w-full flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 transition-all h-[44px]"
                >
                  <svg className="w-4.5 h-4.5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.25.61 4.5 1.62l2.42-2.42C17.435 1.55 14.975 1 12.24 1 6.83 1 2.37 5.46 2.37 11s4.46 10 9.87 10c5.33 0 9.76-3.886 9.76-11 0-.68-.08-1.336-.21-1.715H12.24z"/>
                  </svg>
                  Google Kampus
                </button>
                <button
                  type="button"
                  onClick={() => alert("Koneksi sso universitas via ActiveDirectory Outlook sedang dihubungkan.")}
                  className="w-full flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 transition-all h-[44px]"
                >
                  <svg className="w-4.5 h-4.5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1.5 5.5v13l13 2.5v-18l-13 2.5zm13 2v8.5l6-1.5v-5.5l-6-1.5z" />
                  </svg>
                  Outlook Kampus
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: REGISTER FORM SECTION */}
          {activeTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="w-full border border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100 rounded-xl pl-10 pr-4 py-3 text-base md:text-sm focus:outline-none transition-all"
                    placeholder="Contoh: Budi Susanto"
                    required
                  />
                  <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                </div>
              </div>

              {/* NIM / NIP Inputs & Role Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                    NIM / NIP Staf (Opsional)
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={registerNimNip}
                      onChange={(e) => setRegisterNimNip(e.target.value)}
                      className="w-full border border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100 rounded-xl pl-10 pr-4 py-3 text-base md:text-sm focus:outline-none transition-all"
                      placeholder="120222XXXX"
                    />
                    <GraduationCap className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                    Role Pilihan
                  </label>
                  <select
                    value={registerRole}
                    onChange={(e) => setRegisterRole(e.target.value as any)}
                    className="w-full border border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100 rounded-xl px-3 py-3 text-base md:text-sm focus:outline-none bg-white transition-all font-semibold text-slate-700 h-[50px]"
                  >
                    <option value="mahasiswa">Mahasiswa</option>
                    <option value="staf">Staf Kemahasiswaan</option>
                  </select>
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                  Email Institusi Kampus
                </label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full border border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100 rounded-xl pl-10 pr-4 py-3 text-base md:text-sm focus:outline-none transition-all"
                    placeholder="mahasiswa@kampus.ac.id"
                    required
                  />
                  <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Wajib berakhiran domain kampus resmi .ac.id</span>
              </div>

              {/* New Password & Confirm Passwords in grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input 
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="w-full border border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100 rounded-xl pl-10 pr-10 py-3 text-base md:text-sm focus:outline-none transition-all"
                      placeholder="Min 8 karakter"
                      required
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
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      className="w-full border border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100 rounded-xl pl-10 pr-4 py-3 text-base md:text-sm focus:outline-none transition-all"
                      placeholder="Ulangi password"
                      required
                    />
                    <Key className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Register Action Button */}
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-[#1976D2] hover:bg-[#114E8D] disabled:bg-slate-400 text-white font-bold h-[52px] rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-1.5 focus:ring-4 focus:ring-sky-100 cursor-pointer"
                >
                  {isLoading ? "Memproses Registrasi..." : "Daftar Sekarang →"}
                </button>
              </div>

            </form>
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
                  
                  {/* RESPONSIVE DOMO ACCOUNTS CARDS: 1 column on mobile, 2 columns on tablet and desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DEMO_USERS.map((demo) => {
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
                              {demo.name}
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
        Jurusan Sistem Informasi &copy; 2026
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
