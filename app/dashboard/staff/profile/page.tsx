// CREATED: app/dashboard/staff/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { User, Phone, BookOpen, Mail, Shield, Save, ArrowLeft } from "lucide-react";

export default function StaffProfilePage() {
  const router = useRouter();
  const { user, updateUserProfile, addToast } = useAuth();

  // Guard account
  useEffect(() => {
    if (user && (user.role as string) !== "staf" && (user.role as string) !== "staff") {
      const mappedRole = (user.role as string) === "staf" ? "staff" : user.role;
      router.replace(`/dashboard/${mappedRole}`);
    }
  }, [user, router]);

  // Form states
  const [nama, setNama] = useState("");
  const [nim, setNim] = useState("");
  const [noHp, setNoHp] = useState("");
  const [prodi, setProdi] = useState("");

  // Load custom data from localStorage
  useEffect(() => {
    if (!user) return;
    setNama(user.nama || "");
    setNim(user.nim || "");
    
    const savedDetails = localStorage.getItem(`eventhub_profile_${user.email}`);
    if (savedDetails) {
      try {
        const details = JSON.parse(savedDetails);
        setNoHp(details.noHp || "");
        setProdi(details.prodi || "");
      } catch (e) {
        console.error(e);
      }
    }
  }, [user]);

  if (!user || ((user.role as string) !== "staf" && (user.role as string) !== "staff")) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center font-mono text-xs text-slate-400 font-bold tracking-widest uppercase animate-pulse">
        Memverifikasi Akun...
      </div>
    );
  }

  const getInitials = (fullName: string) => {
    if (!fullName) return "S";
    return fullName
      .split(" ")
      .map(n => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      addToast("Nama tidak boleh kosong!", "warning");
      return;
    }

    // Save extended fields to localStorage
    const extDetails = { noHp, prodi };
    localStorage.setItem(`eventhub_profile_${user.email}`, JSON.stringify(extDetails));

    // Sync context profile info
    updateUserProfile(nama.trim(), nim.trim());
    addToast("Profil Staf Kemahasiswaan berhasil disimpan!", "success");
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn max-w-4xl mx-auto">
      {/* Header block with back button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/dashboard/staff")}
          className="p-2.5 bg-white rounded-2xl border hover:bg-slate-50 text-slate-600 transition-all cursor-pointer flex items-center gap-1.5 font-bold text-xs shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dasbor Staf
        </button>
      </div>

      <div className="bg-[#114E8D] rounded-3xl p-6 text-white border-b-4 border-amber-400 shadow-md">
        <span className="bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded bg-opacity-95 shadow inline-flex items-center gap-1 mb-2.5">
          <Shield className="w-3.5 h-3.5" /> Administrasi Pengawas Universitas
        </span>
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Profil Staf Pengawas</h1>
        <p className="text-[11px] sm:text-xs text-slate-205 mt-1 max-w-xl font-medium leading-relaxed">
          Ubah konfigurasi data profil staf rektorat pengendali status global event dan audit akun mahasiswa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar */}
        <div className="md:col-span-1 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-3xl border-4 border-white shadow-md select-none">
            {getInitials(nama)}
          </div>

          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase leading-snug">{nama}</h2>
            <p className="text-[11px] text-slate-450 font-mono font-bold mt-0.5">{nim || "NIP-77112"}</p>
          </div>

          <div className="flex flex-col gap-2 w-full pt-4 border-t border-dashed">
            <div className="flex justify-between text-[11px] font-semibold text-slate-600">
              <span className="text-slate-400 uppercase font-mono">Role:</span>
              <span className="bg-emerald-100 text-emerald-805 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                STAFF ACTIVE
              </span>
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-600">
              <span className="text-slate-400 uppercase font-mono">Sektor:</span>
              <span className="text-slate-700 font-mono">REKTORAT</span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit form */}
        <div className="md:col-span-2 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xs font-mono font-black uppercase text-[#114E8D] border-b pb-2 mb-4 tracking-wider">
             FORMULIR KOORDINASI ADMINISTRASI STAF KEMAHASISWAAN
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-black uppercase text-slate-400 font-mono tracking-widest block">
                  Nama Lengkap & Kode <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Nama Staf Rektorat..."
                    className="w-full text-slate-700 font-semibold pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#114E8D] outline-none transition-all text-xs h-11"
                  />
                </div>
              </div>

              {/* NIP / Identitas ID */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-black uppercase text-slate-400 font-mono tracking-widest block">
                  NIP Identitas <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Shield className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    placeholder="Kode NIP..."
                    className="w-full text-slate-705 font-bold pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#114E8D] outline-none transition-all text-xs h-11 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* No. HP */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-black uppercase text-slate-400 font-mono tracking-widest block">
                  Nomor Handphone Rektorat
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="No HP dinas..."
                    className="w-full text-slate-700 font-semibold pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#114E8D] outline-none transition-all text-xs h-11"
                  />
                </div>
              </div>

              {/* Prodi */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-black uppercase text-slate-400 font-mono tracking-widest block">
                  Divisi / Ruang Unit Kerja
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={prodi}
                    onChange={(e) => setProdi(e.target.value)}
                    placeholder="Contoh: Biro Kemahasiswaan Rektorat Lt. 1..."
                    className="w-full text-slate-700 font-semibold pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#114E8D] outline-none transition-all text-xs h-11"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-[9.5px] font-black uppercase text-slate-400 font-mono tracking-widest block">
                Alamat Email Staff (Kampus Official)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full text-slate-405 font-mono font-medium pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl outline-none text-xs h-11 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                className="bg-[#114E8D] hover:bg-blue-700 text-amber-300 hover:text-white border-b-2 border-amber-400 font-black text-xs uppercase py-3 px-5 rounded-2xl cursor-pointer active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
