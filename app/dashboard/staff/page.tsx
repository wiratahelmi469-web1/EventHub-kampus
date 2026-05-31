// ADDED: High fidelity modular Staf Kemahasiswaan Dashboard Page
"use client";

import React, { useState, useEffect } from "react";
import { getEvents, saveEvents, EventWithCertificate } from "../../../lib/certificateData";
import { useAuth } from "../../../context/AuthContext";
import { 
  Building2, Calendar, ClipboardCheck, Users, ShieldAlert, Check, 
  Trash2, ToggleLeft, ToggleRight, Sparkles, Star, UserCheck, Shield, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CampusUser {
  nama: string;
  email: string;
  nim: string;
  role: string;
  tanggalBergabung: string;
}

export default function StaffDashboardPage() {
  const { user, addToast, addNotification } = useAuth();

  // App States
  const [events, setEvents] = useState<EventWithCertificate[]>(() => {
    if (typeof window !== "undefined") return getEvents();
    return [];
  });
  const [campusUsers, setCampusUsers] = useState<CampusUser[]>(() => {
    if (typeof window !== "undefined") {
      const storedUsers = localStorage.getItem("eventhub_registered_users");
      const demoAccounts: CampusUser[] = [
        { nama: "Dr. Ahmad PO", email: "po@kampus.ac.id", nim: "NIP-77112", role: "po", tanggalBergabung: "2026-01-10" },
        { nama: "Ani Wijaya (Panitia)", email: "panitia@kampus.ac.id", nim: "NIM-2021045", role: "panitia", tanggalBergabung: "2026-02-15" },
        { nama: "Budi Santoso", email: "mahasiswa@kampus.ac.id", nim: "2021001", role: "mahasiswa", tanggalBergabung: "2026-03-24" }
      ];
      if (storedUsers) {
        try {
          const parsed = JSON.parse(storedUsers);
          return [...demoAccounts, ...parsed];
        } catch (e) {
          return demoAccounts;
        }
      }
      return demoAccounts;
    }
    return [];
  });

  const handleToggleEventStatus = (eventId: string) => {
    const updated = events.map((evt) => {
      if (evt.id === eventId) {
        const nextStatus = evt.status === "aktif" ? ("selesai" as const) : ("aktif" as const);
        
        addToast(`Event '${evt.nama}' diset ke status ${nextStatus.toUpperCase()}!`, "info");
        
        // Notification
        addNotification(
          `Event ${nextStatus === "selesai" ? "Selesai & Dikunci" : "Kembali Aktif"}`,
          `Staf mengubah status event '${evt.nama}' menjadi ${nextStatus.toUpperCase()}.`,
          "Event",
          ["mahasiswa", "panitia", "po"]
        );

        return { ...evt, status: nextStatus };
      }
      return evt;
    });

    setEvents(updated);
    saveEvents(updated);
  };

  return (
    <div id="staff-workspace-container" className="space-y-6">
      {/* Greetings ban */}
      <div className="bg-gradient-to-br from-[#114E8D] to-[#125ba5] text-white rounded-3xl p-6 md:p-8 shadow-md border border-white/10 relative overflow-hidden">
        <div>
          <div className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full mb-3">
            <Shield className="w-3.5 h-3.5" /> STAF KEMAHASISWAAN REKTORAT
          </div>
          <h1 className="text-2xl md:text-3.5xl font-black tracking-tight leading-none text-white">
            Konsol Pengawas Kemahasiswaan
          </h1>
          <p className="text-slate-200 text-xs md:text-sm max-w-lg mt-2 leading-relaxed">
            Otoritas tertinggi administrasi Universitas Negeri Kebangsaan. Saring status operasional event BEM secara global, sahkan berkas LPJ panitia, dan audit log pendaftar akun mahasiswa di direktori pusat.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 font-bold text-[150px] select-none leading-none -mb-10 -mr-6 pointer-events-none">
          STAF
        </div>
      </div>

      {/* Grid Layout of Staff Admin features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Col-span 2) - Event Status Toggles & LPJ verification */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5 border-b pb-2">
              <ClipboardCheck className="w-4.5 h-4.5 text-[#114E8D]" /> Kendali Status Event & Koordinasi Global
            </h2>

            <div className="divide-y space-y-4 pt-2">
              {events.map((evt) => (
                <div key={evt.id} className="pt-4 first:pt-0 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-extrabold text-[13.5px] text-slate-900 leading-tight">
                      {evt.nama}
                    </p>
                    <p className="text-[11px] text-slate-500 font-bold">
                      {evt.penyelenggara} | Tanggal: {evt.tanggal}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Status Badge */}
                    {evt.status === "aktif" ? (
                      <span className="bg-emerald-100 text-emerald-850 text-[10px] uppercase font-black px-2.5 py-1 rounded border border-emerald-200">
                        Aktif
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 text-[10px] uppercase font-black px-2.5 py-1 rounded border">
                        Selesai
                      </span>
                    )}

                    {/* Toggle Switch Button */}
                    <button
                      onClick={() => handleToggleEventStatus(evt.id)}
                      className="p-1 px-3 bg-slate-50 border hover:bg-slate-100 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-600 transition-all cursor-pointer flex items-center gap-1 active:scale-95 select-none"
                    >
                      {evt.status === "aktif" ? "Selesaikan" : "Aktifkan"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LPJ Verification section */}
          <div className="bg-white rounded-3xl border p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5 border-b pb-2">
              <Star className="w-4.5 h-4.5 text-[#114E8D]" /> Verifikasi Dokumen Arsip & Evaluasi LPJ
            </h2>

            <div className="bg-slate-50 p-4 rounded-2xl border text-[11px] leading-relaxed text-slate-650 font-medium">
              <p className="text-slate-800 font-extrabold uppercase text-[10px] mb-1 flex items-center gap-1 text-[#114E8D]">
                <ClipboardCheck className="w-4 h-4" /> Validasi LPJ Dies Natalis 58 Terkunci ✓
              </p>
              Tingkat evaluasi bintang: <b>5/5 ★★★★★</b>. Lesson Learned: &quot;Mitigasi logistik listrik sound cadangan aman diselesaikan oleh panitia sebelum rektorat memasuki venue utama.&quot; Dokumen LPJ disimpan permanen di arsip SIPPK Kemahasiswaan. Pengubahan dilarang setelah validasi.
            </div>
          </div>
        </div>

        {/* Right Column (Col-span 1) - Registered Campus User Directory */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5 border-b pb-2">
                <UserCheck className="w-5 h-5 text-[#114E8D]" /> Direktori Akun Terdaftar ({campusUsers.length})
              </h2>

              <div className="space-y-3 overflow-y-auto max-h-[360px] mt-3">
                {campusUsers.map((usr) => (
                  <div key={usr.email} className="bg-slate-50 border p-3 rounded-2xl relative space-y-1">
                    <div className="flex justify-between items-start text-xs font-bold leading-tight">
                      <div>
                        <p className="text-slate-900 font-extrabold max-w-[140px] truncate">{usr.nama}</p>
                        <p className="text-[10px] text-slate-500 font-mono font-medium mt-0.5">{usr.nim}</p>
                      </div>
                      <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[8px] font-black uppercase px-2 py-0.5 rounded leading-none">
                        {usr.role === "staf" ? "STAFF" : usr.role}
                      </span>
                    </div>

                    <p className="text-[10.5px] text-[#114E8D] font-mono leading-none truncate font-bold pt-1">
                      {usr.email}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
