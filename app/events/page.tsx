// CREATED: app/events/page.tsx
// FIXED: 404 - /events
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { getEvents, saveEvents, EventWithCertificate } from "../../lib/certificateData";
import Navbar from "../../components/Navbar";
import { 
  Search, Calendar, MapPin, Sparkles, Building2, Ticket, Check, X, Users, Filter, ArrowRight 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function PublicEventsPage() {
  const router = useRouter();
  const { user, addToast, addNotification } = useAuth();

  // App States
  const [events, setEvents] = useState<EventWithCertificate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [activeStatus, setActiveStatus] = useState("Semua");
  const [selectedYear, setSelectedYear] = useState("Semua");
  const [isLoading, setIsLoading] = useState(true);

  // RSVP Confirmation Modal
  const [selectedEvent, setSelectedEvent] = useState<EventWithCertificate | null>(null);
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Initial fetch of seeded events from localStorage or DEFAULT
    setEvents(getEvents());
    setIsLoading(false);
  }, []);

  const categories = ["Semua", "Seminar", "Workshop", "Lomba", "Seni", "Olahraga", "Sosial"];
  const statuses = [
    { key: "Semua", label: "Semua Status" },
    { key: "buka", label: "Buka Pendaftaran" },
    { key: "segera", label: "Segera Hadir" },
    { key: "tutup", label: "Penuh/Tutup" },
    { key: "selesai", label: "Selesai" }
  ];
  const years = ["Semua", "2026", "2025"];

  // Filter events (only show approved events in public list)
  const approvedEvents = events.filter(evt => evt.status === "approved" || evt.status === "aktif" || evt.status === "selesai");

  const filteredEvents = approvedEvents.filter(evt => {
    // Category match
    const categoryMatch = activeCategory === "Semua" || evt.kategori.toLowerCase() === activeCategory.toLowerCase();
    
    // Status match
    const currentStatus = evt.eventStatus || (evt.status === "selesai" ? "selesai" : "buka");
    const statusMatch = activeStatus === "Semua" || currentStatus === activeStatus;

    // Search query match (title or organizer)
    const matchesSearch = 
      evt.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.penyelenggara.toLowerCase().includes(searchQuery.toLowerCase());

    // Year match
    const eventYear = evt.tanggal ? evt.tanggal.substring(0, 4) : "";
    const yearMatch = selectedYear === "Semua" || eventYear === selectedYear;

    return categoryMatch && statusMatch && matchesSearch && yearMatch;
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

  const hasUserRsvped = (event: EventWithCertificate) => {
    if (!user) return false;
    return event.peserta.some(p => p.email.toLowerCase() === user.email.toLowerCase());
  };

  const handleRsvpClick = (evt: EventWithCertificate) => {
    if (!user) {
      addToast("Silakan masuk menggunakan akun mahasiswa Anda untuk RSVP event.", "info");
      router.push("/login");
      return;
    }

    if (user.role !== "mahasiswa") {
      addToast(`Akun Anda (${user.role.toUpperCase()}) tidak memiliki izin RSVP. Gunakan akun Mahasiswa.`, "warning");
      return;
    }

    setSelectedEvent(evt);
    setShowRsvpModal(true);
  };

  const handleConfirmRsvp = () => {
    if (!selectedEvent || !user) return;

    setIsSubmitting(true);

    const updatedEvents = events.map(evt => {
      if (evt.id === selectedEvent.id) {
        const alreadyIn = evt.peserta.some(p => p.email.toLowerCase() === user.email.toLowerCase());
        if (alreadyIn) return evt;

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
              nomorSertifikat: `CERT-25-EVT${evt.id}-${user.nim || "GUEST"}`
            }
          ]
        };
      }
      return evt;
    });

    setTimeout(() => {
      setEvents(updatedEvents);
      saveEvents(updatedEvents);
      setIsSubmitting(false);
      setShowRsvpModal(false);

      // Add toast
      addToast("RSVP berhasil! Sampai jumpa di eventnya 🎉", "success");

      // Dispatch real push notification
      addNotification(
        "RSVP Event Terdaftar!",
        `Pendaftaran sesi untuk event '${selectedEvent.nama}' berhasil dicatat. Unduh tiket di halaman Riwayat.`,
        "Event",
        ["mahasiswa"]
      );
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 select-none">
        
        {/* Banner Section */}
        <div className="bg-[#114E8D] rounded-3xl p-6 sm:p-10 mb-8 text-white relative overflow-hidden border-b-4 border-amber-400 shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400 opacity-5 blur-3xl rounded-full"></div>
          <div className="relative z-10 max-w-3xl">
            <span className="bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded bg-opacity-95 shadow border border-amber-100 flex items-center gap-1.5 w-max mb-3">
              <Sparkles className="w-3.5 h-3.5 fill-current" /> Pusat Informasi Event
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Daftar Event Kampus
            </h1>
            <p className="text-slate-200 mt-2 text-xs sm:text-sm leading-relaxed font-medium">
              Jelajahi dan ikuti berbagai seminar, workshop, kompetisi, dan kegiatan seni kemahasiswaan. Dapatkan sertifikat bersertifikasi resmi yang terintegrasi secara otomatis.
            </p>
          </div>
        </div>

        {/* Filters and Search Container */}
        <div className="bg-white rounded-2xl border p-4 mb-8 shadow-sm space-y-4">
          {/* Top Panel: Search and Select Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari event atau penyelenggara..."
                className="w-full text-slate-700 font-medium pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#114E8D] focus:ring-1 focus:ring-[#114E8D] outline-none transition-all placeholder-slate-400 text-sm h-12"
              />
            </div>

            {/* Quick Select Panel Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Status Select */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 h-12">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={activeStatus}
                  onChange={(e) => setActiveStatus(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-600 outline-none pr-4 cursor-pointer"
                >
                  {statuses.map(st => (
                    <option key={st.key} value={st.key}>{st.label}</option>
                  ))}
                </select>
              </div>

              {/* Year Select */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 h-12">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-600 outline-none pr-4 cursor-pointer"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y === "Semua" ? "Semua Tahun" : `Tahun ${y}`}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bottom Panel: Horizontal Scroll Category Chips */}
          <div className="border-t pt-3 flex items-center gap-2 overflow-x-auto scrollbar-none no-scrollbar">
            <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-widest mr-1">
              Kategori:
            </span>
            <div className="flex gap-1.5 shrink-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

        {/* Loading / Empty Area */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border rounded-3xl h-80 animate-pulse" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white border rounded-3xl p-16 text-center shadow-sm">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
              <Ticket className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="font-extrabold text-[#114E8D] uppercase tracking-wide text-sm">Event Tidak Ditemukan</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
              Tidak ada event aktif yang sesuai kriteria pencarian atau kategori Anda saat ini.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("Semua");
                setActiveStatus("Semua");
                setSelectedYear("Semua");
              }}
              className="mt-4 bg-[#114E8D] hover:bg-[#1a56db] text-white font-extrabold text-xs px-4 py-2 rounded-xl border-b-2 border-amber-400 cursor-pointer active:scale-95 transition-all uppercase"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          /* Events Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => {
              const currentStatus = evt.eventStatus || (evt.status === "selesai" ? "selesai" : "buka");
              const isLocked = currentStatus === "tutup" || currentStatus === "selesai";
              const userAlreadyRSVP = hasUserRsvped(evt);

              return (
                <div 
                  id={`card-evt-${evt.id}`}
                  key={evt.id} 
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden flex flex-col group min-h-[420px]"
                >
                  {/* Category Banner Accent */}
                  <div className={`bg-gradient-to-r ${getCategoryGradient(evt.kategori)} p-4 text-white shrink-0 relative flex items-center justify-between`}>
                    <span className="bg-white/15 px-3 py-1 rounded-lg text-[9px] uppercase tracking-wider font-extrabold font-mono border border-white/10 select-none">
                      {evt.kategori}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusBadgeStyles(currentStatus)}`}>
                      {getStatusLabel(currentStatus)}
                    </span>
                  </div>

                  {/* Main card info container */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Organizer */}
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#114E8D] flex items-center gap-1.5 mb-1 bg-[#114E8D]/5 px-2.5 py-1 rounded-lg w-max border border-[#114E8D]/10">
                        <Building2 className="w-3.5 h-3.5" /> {evt.penyelenggara}
                      </p>

                      {/* Title */}
                      <h3 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-2 uppercase min-h-[40px] mt-2 group-hover:text-[#114E8D] transition-colors">
                        {evt.nama}
                      </h3>

                      {/* Deskripsi */}
                      {evt.deskripsi && (
                        <p className="text-[11px] leading-relaxed text-slate-400 font-medium italic mt-1 line-clamp-2">
                          &quot;{evt.deskripsi}&quot;
                        </p>
                      )}

                      {/* Meta information tags */}
                      <div className="grid grid-cols-1 gap-1.5 pt-3.5 border-t border-dashed mt-4 text-[10.5px] text-slate-500 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{evt.tanggal} {evt.jam ? `(${evt.jam})` : ""}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">{evt.lokasi}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress seats fill */}
                    <div className="mt-5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 font-mono mb-1.5">
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> KAPASITAS KUOTA</span>
                        <span className="text-[#114E8D]">{evt.kuotaTerisi} / {evt.kuota} Kursi</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border">
                        <div 
                          className="bg-amber-400 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, (evt.kuotaTerisi / evt.kuota) * 100)}%` }}
                        />
                      </div>

                      {/* Navigation and RSVP Buttons */}
                      <div className="grid grid-cols-2 gap-2 mt-4.5">
                        {/* Detail Link Button */}
                        <button
                          onClick={() => router.push(`/events/${evt.id}`)}
                          className="w-full border hover:bg-slate-50 text-slate-700 font-bold text-[11px] uppercase tracking-wider px-3 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer h-11"
                        >
                          Detail Event <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        {/* RSVP Action Button */}
                        {userAlreadyRSVP ? (
                          <button
                            disabled
                            className="w-full bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed font-extrabold text-[11px] uppercase tracking-wider px-3 py-2.5 rounded-xl flex items-center justify-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3px]" /> Terdaftar
                          </button>
                        ) : isLocked ? (
                          <button
                            disabled
                            className="w-full bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed font-extrabold text-[11px] uppercase tracking-wider px-3 py-2.5 rounded-xl h-11"
                          >
                            Ditutup
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRsvpClick(evt)}
                            className="w-full bg-[#114E8D] hover:bg-blue-700 text-amber-300 hover:text-white border-b-2 border-amber-400 hover:border-blue-800 font-extrabold text-[11px] tracking-wider uppercase px-3 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer h-11 active:scale-95"
                          >
                            RSVP Sekarang
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
      </main>

      {/* RSVP Confirmation Modal popup panel */}
      <AnimatePresence>
        {showRsvpModal && selectedEvent && (
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
                  onClick={() => setShowRsvpModal(false)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 border rounded-full text-slate-400 cursor-pointer active:scale-90 transition-transform"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              <div>
                <h3 className="font-extrabold text-[#114E8D] uppercase tracking-wide text-xs">Konfirmasi Pendaftaran RSVP</h3>
                <h2 className="text-slate-800 font-black text-sm uppercase mt-1 leading-snug">
                  {selectedEvent.nama}
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

              {/* Important Notes */}
              <p className="text-[10.5px] leading-relaxed text-slate-400 font-medium">
                Pendaftaran bersifat gratis menggunakan sistem SSO Kemahasiswaan terintegrasi. Dengan menekan tombol konfirmasi Anda setuju untuk terdaftar dan dihubungi oleh kepanitiaan <b className="text-slate-600">&quot;{selectedEvent.penyelenggara}&quot;</b> terkait.
              </p>

              {/* Action operations button pane */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowRsvpModal(false)}
                  className="w-full border font-bold text-xs uppercase py-3 rounded-xl hover:bg-slate-50 cursor-pointer active:scale-95 transition-all text-slate-600 h-12"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmRsvp}
                  className="w-full bg-[#114E8D] hover:bg-blue-700 text-amber-300 hover:text-white border-b-2 border-amber-400 font-black text-xs uppercase py-3 rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer h-12 active:scale-95"
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

      {/* Mini Simple Footer with Branding */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-12 text-center text-slate-500 text-[11px] font-mono leading-relaxed select-none">
        <p>© 2026 Universitas Kebangsaan — EventHub System</p>
        <p className="text-[9px] text-slate-600 mt-1 uppercase tracking-widest font-black">
          Sistem Informasi Kepanitiaan Kampus &amp; Manajemen Sertifikat Terpusat
        </p>
      </footer>
    </div>
  );
}
