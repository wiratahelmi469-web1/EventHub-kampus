// CREATED: app/dashboard/staf/events/page.tsx
// FIXED: 404 - /dashboard/staf/events
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { getEvents, EventWithCertificate } from "../../../../lib/certificateData";
import { 
  ShieldAlert, ShieldCheck, Check, Calendar, MapPin, Building2, Ticket, 
  Search, Filter, Layers, Inbox, Award, Sparkles, Compass 
} from "lucide-react";

export default function StafEventsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Guard account
  useEffect(() => {
    if (user && (user.role as any) !== "staf") {
      router.replace(`/dashboard/${(user.role as any) === "staf" ? "staff" : user.role}`);
    }
  }, [user, router]);

  // States
  const [events, setEvents] = useState<EventWithCertificate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  if (!user || (user.role as any) !== "staf") {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center font-mono text-xs text-slate-400 font-bold tracking-widest uppercase animate-pulse">
        Memverifikasi Akun...
      </div>
    );
  }

  // Filter approved events
  const approvedEvents = events.filter(e => e.status === "approved" || e.status === "aktif" || e.status === "selesai");

  // Filter based on Tab
  const tabFiltered = approvedEvents.filter(evt => {
    const isSelesai = evt.eventStatus === "selesai" || evt.status === "selesai";
    return activeTab === "completed" ? isSelesai : !isSelesai;
  });

  // Apply search query
  const finalEvents = tabFiltered.filter(evt => {
    return (
      evt.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.penyelenggara.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.kategori.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getCategoryGradient = (category: string) => {
    switch (category?.toLowerCase()) {
      case "seminar":
        return "from-blue-500 to-indigo-600";
      case "workshop":
        return "from-purple-500 to-fuchsia-600";
      case "lomba":
        return "from-rose-500 to-red-600";
      case "olahraga":
        return "from-emerald-500 to-green-600";
      case "sosial":
        return "from-amber-500 to-orange-500";
      case "seni":
        return "from-pink-500 to-rose-500";
      default:
        return "from-[#114E8D] to-blue-600";
    }
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      {/* Title box panel */}
      <div className="bg-[#114E8D] rounded-3xl p-6 text-white border-b-4 border-amber-400 shadow">
        <span className="bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded bg-opacity-95 shadow inline-flex items-center gap-1.5 mb-2.5">
          <ShieldAlert className="w-3.5 h-3.5" /> STAF KEMAHASISWAAN COMMAND DECK
        </span>
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Direktori Kegiatan Mahasiswa</h1>
        <p className="text-[11px] sm:text-xs text-slate-205 mt-1 max-w-xl font-medium leading-relaxed">
          Pusat pemantauan draf kegiatan organisasi, evaluasi pengisian kapasitas kursi, dan arsip aktivitas yang telah diselenggarakan dalam lingkungan kampus.
        </p>
      </div>

      {/* Tabs list navigation */}
      <div className="bg-white border p-1 rounded-2xl flex gap-1.5 w-full sm:w-max shadow-sm">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase ${
            activeTab === "active"
              ? "bg-[#114E8D] text-white border-b-2 border-amber-400 shadow-sm"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Semua Event Aktif
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase ${
            activeTab === "completed"
              ? "bg-[#114E8D] text-white border-b-2 border-amber-400 shadow-sm"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Sudah Terlaksana ({approvedEvents.filter(e => e.eventStatus === "selesai" || e.status === "selesai").length})
        </button>
      </div>

      {/* Search Input Filter for Staf */}
      <div className="bg-white rounded-2xl border p-4 shadow-sm relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-7 pointer-events-none text-slate-400">
          <Search className="w-4.5 h-4.5" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari agenda kegiatan kemahasiswaan atau divisi kepanitiaan organisasi..."
          className="w-full text-slate-700 font-medium pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#114E8D] focus:ring-1 focus:ring-[#114E8D] outline-none transition-all placeholder-slate-400 text-xs h-11"
        />
      </div>

      {/* Grid List View for Staf */}
      {finalEvents.length === 0 ? (
        <div className="bg-white border rounded-3xl p-16 text-center shadow-sm select-none">
          <div className="p-4 bg-slate-50 border rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3.5 text-slate-400">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-[#114E8D] uppercase tracking-wide text-xs">Arsip Kosong</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto font-semibold mt-1">
            {activeTab === "active" 
              ? "Tidak ada agenda kegiatan kemahasiswaan aktif yang dijadwalkan." 
              : "Belum tercatat dokumen laporan event yang selesai diselenggarakan."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {finalEvents.map(evt => {
            const currentStatus = evt.eventStatus || "buka";
            const percentFilled = Math.min(100, (evt.kuotaTerisi / evt.kuota) * 100);

            return (
              <div 
                key={evt.id}
                className="bg-white border rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden min-h-[350px]"
              >
                {/* Visual Category Frame */}
                <div className={`bg-gradient-to-r ${getCategoryGradient(evt.kategori)} p-4 text-white shrink-0 flex items-center justify-between`}>
                  <span className="bg-white/20 border border-white/10 px-2.5 py-0.5 rounded-xl font-mono font-bold text-[9px] uppercase tracking-wider">
                    {evt.kategori}
                  </span>
                  
                  <span className="bg-white/10 px-2.5 py-0.5 rounded-lg text-[9px] font-mono uppercase font-black tracking-wider">
                    {evt.id}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono font-black text-[#114E8D] uppercase tracking-wider bg-[#114E8D]/5 border px-2 py-0.5 rounded">
                      PENYELENGGARA: {evt.penyelenggara}
                    </span>
                    <h3 className="font-extrabold text-[#114E8D] text-xs sm:text-sm uppercase leading-tight line-clamp-2">
                      {evt.nama}
                    </h3>
                    <p className="text-[10.5px] text-slate-450 leading-relaxed line-clamp-3 italic font-semibold">
                      &quot;{evt.deskripsi || "Detail penulisan deskripsi ringkas agenda."}&quot;
                    </p>

                    <div className="grid grid-cols-1 gap-1 border-t border-dashed pt-3 mt-4 text-[10.5px] text-slate-500 font-bold font-mono">
                      <div className="flex items-center gap-1.5 text-slate-450">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{evt.tanggal}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-450">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.lokasi}</span>
                      </div>
                    </div>
                  </div>

                  {/* Meter panel with View Detail Action link */}
                  <div className="mt-5 space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-mono font-black uppercase text-slate-400">
                        <span>METRIK RESERVASI</span>
                        <span className="text-[#114E8D]">{evt.kuotaTerisi} / {evt.kuota} PESERTA</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 border rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-405 bg-amber-400 h-full rounded-full transition-all"
                          style={{ width: `${percentFilled}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/events/${evt.id}`)}
                      className="w-full border-b border hover:bg-slate-50 text-slate-700 font-bold text-[10.5px] uppercase py-2.5 rounded-xl transition-all h-10 text-center flex items-center justify-center cursor-pointer"
                    >
                      Kunjungi Detail Sesi →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
