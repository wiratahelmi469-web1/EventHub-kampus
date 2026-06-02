// CREATED: app/dashboard/mahasiswa/events/page.tsx
// FIXED: 404 - /dashboard/mahasiswa/events
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { getEvents, saveEvents, EventWithCertificate } from "../../../../lib/certificateData";
import { 
  Search, Calendar, MapPin, Building2, Ticket, Check, X, Users, Filter, ArrowRight, Award, Compass 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function MahasiswaEventsPage() {
  const router = useRouter();
  const { user, addToast, addNotification } = useAuth();

  // Guard: Redirect non-mahasiswa
  useEffect(() => {
    if (user && user.role !== "mahasiswa") {
      router.replace(`/dashboard/${user.role === "staf" ? "staff" : user.role}`);
    }
  }, [user, router]);

  // States
  const [events, setEvents] = useState<EventWithCertificate[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "registered">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [showRsvpModal, setShowRsvpModal] = useState<EventWithCertificate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  if (!user || user.role !== "mahasiswa") {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center font-mono text-xs text-slate-400 font-bold tracking-widest uppercase animate-pulse">
        Memverifikasi Akun...
      </div>
    );
  }

  const categories = ["Semua", "Seminar", "Workshop", "Lomba", "Seni", "Olahraga", "Sosial"];

  // Filter approved events
  const approvedEvents = events.filter(evt => evt.status === "approved" || evt.status === "aktif" || evt.status === "selesai");

  // Filter by registered or list all
  const listEvents = approvedEvents.filter(evt => {
    const isUserRegistered = evt.peserta.some(p => p.email.toLowerCase() === user.email.toLowerCase());
    if (activeTab === "all") {
      // Show open / active events that are not yet finished
      const currentStatus = evt.eventStatus || "buka";
      return currentStatus !== "selesai";
    } else {
      // Registered
      return isUserRegistered;
    }
  });

  // Apply inputs and filters
  const finalEvents = listEvents.filter(evt => {
    // Category matches
    const catMatches = activeCategory === "Semua" || evt.kategori.toLowerCase() === activeCategory.toLowerCase();
    
    // Search query matches
    const searchMatches = 
      evt.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.penyelenggara.toLowerCase().includes(searchQuery.toLowerCase());

    return catMatches && searchMatches;
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

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "buka":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "tutup":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "selesai":
        return "bg-slate-500/15 text-slate-400 border-slate-500/20";
      case "segera":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "buka":
        return "Buka Pendaftaran";
      case "tutup":
        return "Penuh/Tutup";
      case "selesai":
        return "Selesai";
      case "segera":
        return "Segera Hadir";
      default:
        return "Aktif";
    }
  };

  const handleConfirmRsvp = () => {
    if (!showRsvpModal) return;

    setIsSubmitting(true);

    const updated = events.map(evt => {
      if (evt.id === showRsvpModal.id) {
        return {
          ...evt,
          kuotaTerisi: Math.min(evt.kuota, evt.kuotaTerisi + 1),
          peserta: [
            ...evt.peserta,
            {
              nim: user.nim || "NIM-UNKNOWN",
              nama: user.nama,
              email: user.email,
              statusHadir: "menunggu" as const,
              sertifikatDownloaded: false,
              nomorSertifikat: `CERT-25-EVT${evt.id}-${user.nim}`
            }
          ]
        };
      }
      return evt;
    });

    setTimeout(() => {
      setEvents(updated);
      saveEvents(updated);
      setIsSubmitting(false);
      setShowRsvpModal(null);

      addToast("RSVP berhasil! Sampai jumpa di eventnya 🎉", "success");

      addNotification(
        "RSVP Event Terdaftar!",
        `Pendaftaran sesi untuk event '${showRsvpModal.nama}' berhasil dicatat. Unduh tiket di halaman Riwayat.`,
        "Event",
        ["mahasiswa"]
      );
    }, 500);
  };

  const handleCancelRsvp = (evtId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin membatalkan pendaftaran event ini?")) {
      return;
    }

    const updated = events.map(evt => {
      if (evt.id === evtId) {
        return {
          ...evt,
          kuotaTerisi: Math.max(0, evt.kuotaTerisi - 1),
          peserta: evt.peserta.filter(p => p.email.toLowerCase() !== user.email.toLowerCase())
        };
      }
      return evt;
    });

    setEvents(updated);
    saveEvents(updated);
    addToast("Pendaftaran RSVP event berhasil dibatalkan.", "warning");
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* Header Panel with Shortcut */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#114E8D] uppercase tracking-tight">Eksplorasi Event Kampus</h1>
          <p className="text-slate-450 text-xs mt-1 font-semibold">
            Kelola pendaftaran event aktif, cek tiket RSVP Anda, dan akses sertifikat partisipasi Anda.
          </p>
        </div>

        {/* Shortcut to History and Certificates */}
        <button
          onClick={() => router.push("/dashboard/mahasiswa/riwayat")}
          className="shrink-0 flex items-center justify-center gap-1.5 bg-[#114E8D] hover:bg-blue-700 text-amber-300 hover:text-white border-b-2 border-amber-400 py-3 px-5 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-sm"
        >
          <Award className="w-4 h-4 shrink-0" /> Riwayat &amp; Sertifikat →
        </button>
      </div>

      {/* Tabs navigation panels */}
      <div className="bg-white border p-1 rounded-2xl flex gap-1.5 w-full sm:w-max shadow-sm">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase ${
            activeTab === "all"
              ? "bg-[#114E8D] text-white border-b-2 border-amber-400 shadow-sm"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Semua Event
        </button>
        <button
          onClick={() => {
            setActiveTab("registered");
            setActiveCategory("Semua");
          }}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase ${
            activeTab === "registered"
              ? "bg-[#114E8D] text-white border-b-2 border-amber-400 shadow-sm"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Event Saya (RSVP)
        </button>
      </div>

      {/* Search and Category Filters Panel */}
      <div className="bg-white rounded-2xl border p-4 shadow-sm space-y-4">
        {/* Search Input Bar */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari event aktif atau penyelenggara..."
            className="w-full text-slate-700 font-medium pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#114E8D] focus:ring-1 focus:ring-[#114E8D] outline-none transition-all placeholder-slate-400 text-xs h-11"
          />
        </div>

        {/* Categories Carousel scroll */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none no-scrollbar">
          <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-widest mr-1 shrink-0">
            Kategori:
          </span>
          <div className="flex gap-1.5 shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[#114E8D] text-white border-b-2 border-amber-400 shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Content rendering */}
      {finalEvents.length === 0 ? (
        <div className="bg-white border rounded-3xl p-16 text-center shadow-sm select-none">
          <div className="p-4 bg-slate-50 border rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3.5 text-slate-400">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-[#114E8D] uppercase tracking-wide text-xs">Event Kosong</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto font-semibold mt-1">
            {activeTab === "all" 
              ? "Tidak ada event kampus aktif yang terdaftar untuk sisa hari ini." 
              : "Anda belum mendaftarkan RSVP pada event apapun saat ini."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {finalEvents.map(evt => {
            const currentStatus = evt.eventStatus || "buka";
            const isRegistered = evt.peserta.some(p => p.email.toLowerCase() === user.email.toLowerCase());
            const isFull = evt.kuotaTerisi >= evt.kuota;

            return (
              <div 
                key={evt.id}
                className="bg-white border rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden min-h-[380px]"
              >
                {/* Category Banner */}
                <div className={`bg-gradient-to-r ${getCategoryGradient(evt.kategori)} p-4 text-white shrink-0 flex items-center justify-between`}>
                  <span className="bg-white/20 border border-white/10 px-2.5 py-0.5 rounded-xl font-mono font-bold text-[9px] uppercase tracking-wider">
                    {evt.kategori}
                  </span>
                  
                  {isRegistered ? (
                    <span className="bg-emerald-500 text-white text-[9.5px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-400">
                      <Check className="w-3.5 h-3.5 stroke-[3.5px]" /> Terdaftar RSVP
                    </span>
                  ) : (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusBadgeStyles(currentStatus)}`}>
                      {getStatusLabel(currentStatus)}
                    </span>
                  )}
                </div>

                {/* Info block body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9.5px] font-mono font-black text-[#114E8D] uppercase tracking-wider bg-[#114E8D]/5 border px-2 py-0.5 rounded-md inline-block">
                      {evt.penyelenggara}
                    </span>
                    <h3 className="font-extrabold text-[#114E8D] text-sm leading-snug line-clamp-2 uppercase mt-2.5">
                      {evt.nama}
                    </h3>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed line-clamp-2 italic font-semibold mt-1">
                      &quot;{evt.deskripsi || "Detail deskripsi event singkat."}&quot;
                    </p>

                    <div className="grid grid-cols-1 gap-1.5 border-t border-dashed pt-3 mt-4 text-[10.5px] text-slate-500 font-bold">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{evt.tanggal}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.lokasi}</span>
                      </div>
                    </div>
                  </div>

                  {/* Seat meter & Action trigger cards */}
                  <div className="mt-5 space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-mono font-black uppercase text-slate-400">
                        <span>PENGISIAN SLOT</span>
                        <span className="text-[#114E8D]">{evt.kuotaTerisi} / {evt.kuota} KURSI</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 border rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-400 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, (evt.kuotaTerisi / evt.kuota) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Operational Actions Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => router.push(`/events/${evt.id}`)}
                        className="w-full border hover:bg-slate-50 text-slate-700 font-bold text-[11px] uppercase py-2.5 rounded-xl transition-all text-center h-10 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Detail <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {isRegistered ? (
                        <button
                          onClick={() => handleCancelRsvp(evt.id)}
                          className="w-full border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-[11px] uppercase py-2.5 rounded-xl transition-all h-10 cursor-pointer"
                        >
                          Batal RSVP
                        </button>
                      ) : currentStatus === "tutup" || isFull ? (
                        <button
                          disabled
                          className="w-full bg-slate-100 text-slate-400 cursor-not-allowed border text-[11px] font-bold uppercase py-2.5 rounded-xl h-10"
                        >
                          Slot Penuh
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowRsvpModal(evt)}
                          className="w-full bg-[#114E8D] hover:bg-blue-700 text-amber-300 hover:text-white border-b-2 border-amber-400 font-extrabold text-[11px] uppercase py-2.5 rounded-xl transition-all h-10 cursor-pointer shadow-sm text-center flex items-center justify-center"
                        >
                          RSVP Sesi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showRsvpModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 select-none">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden border border-slate-200 p-6 flex flex-col gap-4 max-h-[90vh] sm:max-h-none overflow-y-auto"
            >
              <div className="flex justify-between items-start">
                <div className="bg-amber-100 text-amber-800 p-2 rounded-xl border border-amber-200 flex items-center justify-center">
                  <Ticket className="w-5 h-5" />
                </div>
                <button
                  onClick={() => setShowRsvpModal(null)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 border rounded-full text-slate-400 cursor-pointer active:scale-90 transition-transform"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              <div>
                <h3 className="font-extrabold text-[#114E8D] uppercase tracking-wide text-xs">Konfirmasi Pendaftaran RSVP</h3>
                <h2 className="text-slate-800 font-black text-sm uppercase mt-1 leading-snug">
                  {showRsvpModal.nama}
                </h2>
              </div>

              {/* User auto-filled profile box */}
              <div className="bg-[#114E8D]/5 rounded-2xl p-4.5 border border-[#114E8D]/10">
                <span className="text-[9px] font-black uppercase text-slate-400 font-mono tracking-widest block mb-2">
                  INFORMASI KARTU IDENTITAS MAHASISWA
                </span>
                
                <div className="grid grid-cols-1 gap-2 text-xs font-semibold text-slate-700">
                  <div className="flex border-b border-dashed pb-1.5 justify-between">
                    <span className="text-slate-400 font-medium">NAMA:</span>
                    <span>{user?.nama}</span>
                  </div>
                  <div className="flex border-b border-dashed pb-1.5 justify-between">
                    <span className="text-slate-400 font-medium">NIM:</span>
                    <span className="font-mono">{user?.nim}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">EMAIL KAMPUS:</span>
                    <span className="font-mono text-[11px]">{user?.email}</span>
                  </div>
                </div>
              </div>

              {/* Action operations button pane */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowRsvpModal(null)}
                  className="w-full border font-bold text-xs uppercase py-3 rounded-xl hover:bg-slate-50 cursor-pointer active:scale-95 transition-all text-slate-600 h-10"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmRsvp}
                  className="w-full bg-[#114E8D] hover:bg-blue-700 text-amber-300 hover:text-white border-b-2 border-amber-400 font-black text-xs uppercase py-3 rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer h-10 active:scale-95"
                >
                  {isSubmitting ? (
                    <span className="border-2 border-amber-400 border-t-transparent w-4.5 h-4.5 rounded-full animate-spin" />
                  ) : (
                    <span>Konfirmasi RSVP</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
