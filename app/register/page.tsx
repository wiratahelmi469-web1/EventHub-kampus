"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldAlert, Check, AlertTriangle, Key, Mail, User, GraduationCap, 
  ArrowRight, ArrowLeft, ShieldCheck
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [nimNip, setNimNip] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"mahasiswa" | "panitia" | "po" | "staf">("mahasiswa");

  // Feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Basic checks
    if (!name.trim() || !nimNip.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage("Semua kolom isian wajib dilengkapi.");
      return;
    }

    if (!email.toLowerCase().endsWith(".ac.id") && !email.toLowerCase().endsWith("@kampus.ac.id")) {
      setErrorMessage("Email harus menggunakan domain resmi universitas (@kampus.ac.id atau berakhiran .ac.id).");
      return;
    }

    if (password.length < 5) {
      setErrorMessage("Kombinasi kata sandi minimal harus terdiri dari 5 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi kelayakan sandi tidak cocok dengan kata sandi pertama.");
      return;
    }

    setIsLoading(true);

    try {
      // Get existing registered users
      const existingData = localStorage.getItem("eventhub_registered_users");
      const users = existingData ? JSON.parse(existingData) : [];

      // Check if email already exists
      const isEmailTaken = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (isEmailTaken || ["po@kampus.ac.id", "panitia@kampus.ac.id", "mahasiswa@kampus.ac.id", "staff@kampus.ac.id"].includes(email.toLowerCase())) {
        setErrorMessage("Email ini sudah terdaftar di database sistem. Silakan login atau gunakan email lain.");
        setIsLoading(false);
        return;
      }

      // Add new user
      const newUser = {
        name,
        nimNip,
        email,
        password,
        role,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem("eventhub_registered_users", JSON.stringify(users));

      setSuccessMessage("Keanggotaan Anda sukses didaftarkan! Mengarahkan Anda ke halaman masuk...");

      setTimeout(() => {
        router.push("/login");
      }, 2500);

    } catch (e) {
      setErrorMessage("Terjadi kegagalan lokal saat menyimpan data. Silakan coba kembali.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#1976D2]/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative z-10 transition-all duration-300">
        
        {/* Banner branding */}
        <div className="bg-[#114E8D] text-white p-6 relative">
          <div className="absolute top-0 right-0 h-1.5 w-full bg-[#FF9800]"></div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hover:bg-white/10 p-2 rounded-lg transition-all" title="Kembali ke login">
              <ArrowLeft className="w-5 h-5 text-slate-300 hover:text-white" />
            </Link>
            <div>
              <h2 className="text-lg font-black tracking-tight">Formulir Pendaftaran</h2>
              <p className="text-[10px] uppercase tracking-widest opacity-80 font-mono">
                Registrasi Akses EventHub Kampus
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          
          <AnimatePresence>
            {/* Error alerts */}
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 bg-rose-50 text-rose-700 border border-rose-200 p-4 rounded-xl flex items-start gap-2.5 text-xs font-semibold"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">{errorMessage}</div>
              </motion.div>
            )}

            {/* Success alerts */}
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-teal-50 text-teal-800 border border-teal-200 p-4 rounded-xl flex items-start gap-2.5 text-xs font-bold"
              >
                <Check className="w-4.5 h-4.5 text-teal-600 shrink-0 mt-0.5 bg-teal-100 rounded-full p-0.5" />
                <div className="flex-1">{successMessage}</div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                Nama Lengkap
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none transition-all"
                  placeholder="Contoh: Budi Susanto"
                  required
                />
                <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* NIM/NIP and Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                  NIM / NIP Staf
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={nimNip}
                    onChange={(e) => setNimNip(e.target.value)}
                    className="w-full border border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none transition-all"
                    placeholder="120222XXXX"
                    required
                  />
                  <GraduationCap className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                  Peran Akses Pasifik
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full border border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white transition-all font-semibold text-slate-700"
                >
                  <option value="mahasiswa">Mahasiswa Umum</option>
                  <option value="panitia">Panitia Pelaksana</option>
                  <option value="po">Project Officer</option>
                  <option value="staf">Staf Kemahasiswaan</option>
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                Email Institusi Kampus
              </label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none transition-all"
                  placeholder="contoh@kampus.ac.id"
                  required
                />
                <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Wajib menggunakan email valid berakhiran .ac.id</span>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                  Sandi Baru
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none transition-all"
                    placeholder="••••••"
                    required
                  />
                  <Key className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                  Konfirmasi Sandi
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-slate-300 focus:border-[#1976D2] focus:ring-4 focus:ring-sky-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none transition-all"
                    placeholder="••••••"
                    required
                  />
                  <Key className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-3">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#1976D2] hover:bg-[#114E8D] disabled:bg-slate-400 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-1.5 focus:ring-4 focus:ring-sky-100"
              >
                {isLoading ? "Menyimpan Keanggotaan..." : "Daftar Anggota Sekarang"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

          {/* Prompt */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Sudah memiliki hak akses sebelumnya?{" "}
            <Link href="/login" className="text-[#1976D2] font-semibold hover:underline">
              Kembali ke Login &rarr;
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
