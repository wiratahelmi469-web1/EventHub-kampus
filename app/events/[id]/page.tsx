// CREATED: app/events/[id]/page.tsx
// FIXED: 404 - /events/[id]
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { getEvents, saveEvents, EventWithCertificate } from "../../../lib/certificateData";
import Navbar from "../../../components/Navbar";
import { 
  ArrowLeft, Calendar, Clock, MapPin, Building2, Users, Share2, Sparkles, Check, X, AlertCircle, Award 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const eventId = unwrappedParams.id;

  const router = useRouter();
  const { user, addToast, addNotification } = useAuth();

  // States
  const [events, setEvents] = useState<EventWithCertificate[]>([]);
  const [event, setEvent] = useState<EventWithCertificate | null>(null);
  const [copied, setCopied] = useState(false);

  // RSVP Form States
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load events and search for active event
    const timer = setTimeout(() => {
      const list = getEvents();
      setEvents(list);
      const found = list.find((e) => e.id === eventId);
      if (found) {
        setEvent(found);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [eventId]);

  if (!event && events.length > 0) {
    // Custom 404 state if data is fetched but event doesn't exist
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="bg-slate-100 p-4 rounded-full border border-slate-200 mb-4 text-slate-400">
            <AlertCircle className="w-12 h-12" />
          </div>
          <h1 className="text-xl font-black text-[#114E8D] uppercase tracking-wide">Event Tidak Ditemukan</h1>
          <p className="text-xs text-slate-400 mt-2 max-w-sm">
            Event dengan ID <code className="font-mono font-bold bg-slate-100 px-1 py-0.5 rounded text-slate-600">{eventId}</code> tidak terdaftar di sistem.
          </p>
          <button
            onClick={() => router.push("/events")}
            className="mt-6 border hover:bg-slate-50 font-extrabold text-xs px-5 py-2.5 rounded-xl text-slate-700 flex items-center gap-2 cursor-pointer transition-transform active:scale-95 uppercase"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali Ke Daftar Event
          </button>
        </main>
      </div>
    );
  }

  // Fallback rendering during initial compile check
  if (!event) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center font-mono text-xs text-slate-400 font-bold tracking-wider uppercase animate-pulse">
          Memuat Detail Event...
        </main>
      </div>
    );
  }

  const currentStatus = event.eventStatus || (event.status === "selesai" ? "selesai" : "buka");
  const isLocked = currentStatus === "tutup" || currentStatus === "selesai";
  const isSelesai = currentStatus === "selesai";

  const userAlreadyRSVP = user
    ? event.peserta.some((p) => p.email.toLowerCase() === user.email.toLowerCase())
    : false;

  const getCategoryGradient = (category: string) => {
    switch (category?.toLowerCase()) {
      case "seminar":
        return "from-blue-600 to-indigo-700";
      case "workshop":
        return "from-purple-600 to-fuchsia-700";
      case "lomba":
        return "from-rose-600 to-red-700";
      case "olahraga":
        return "from-emerald-600 to-green-700";
      case "sosial":
        return "from-amber-600 to-orange-650";
      case "seni":
        return "from-pink-600 to-rose-700";
      default:
        return "from-[#114E8D] to-indigo-750";
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

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    addToast("Link event berhasil disalin ke papan klip! 📋", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRsvpClick = () => {
    if (!user) {
      addToast("Silakan masuk menggunakan akun mahasiswa Anda untuk RSVP event.", "info");
      router.push("/login");
      return;
    }

    if (user.role !== "mahasiswa") {
      addToast(`Akun Anda (${user.role.toUpperCase()}) tidak memiliki izin RSVP. Gunakan akun Mahasiswa.`, "warning");
      return;
    }

    setShowRsvpModal(true);
  };

  const handleConfirmRsvp = () => {
    if (!user) return;

    setIsSubmitting(true);

    const updatedEvents = events.map((evt) => {
      if (evt.id === event.id) {
        const alreadyIn = evt.peserta.some((p) => p.email.toLowerCase() === user.email.toLowerCase());
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
      // update state memory
      setEvents(updatedEvents);
      saveEvents(updatedEvents);
      const updatedItem = updatedEvents.find((evt) => evt.id === event.id);
      if (updatedItem) setEvent(updatedItem);

      setIsSubmitting(false);
      setShowRsvpModal(false);

      addToast("RSVP berhasil! Sampai jumpa di eventnya 🎉", "success");

      // Log notification
      addNotification(
        "RSVP Event Terdaftar!",
        `Pendaftaran sesi untuk event '${event.nama}' berhasil dicatat. Unduh tiket di halaman Riwayat.`,
        "Event",
        ["mahasiswa"]
      );
    }, 600);
  };

  const handleCancelRsvp = () => {
    if (!user) return;

    if (!window.confirm("Apakah Anda yakin ingin membatalkan RSVP pendaftaran event ini?")) {
      return;
    }

    const updatedEvents = events.map((evt) => {
      if (evt.id === event.id) {
        const filteredPeserta = evt.peserta.filter(
          (p) => p.email.toLowerCase() !== user.email.toLowerCase()
        );

        return {
          ...evt,
          kuotaTerisi: Math.max(0, evt.kuotaTerisi - 1),
          peserta: filteredPeserta
        };
      }
      return evt;
    });

    setEvents(updatedEvents);
    saveEvents(updatedEvents);

    const updatedItem = updatedEvents.find((evt) => evt.id === event.id);
    if (updatedItem) setEvent(updatedItem);

    addToast("RSVP Event berhasil dibatalkan.", "warning");
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 select-none">
        {/* Navigation bar trigger */}
        <button
          onClick={() => router.push("/events")}
          className="mb-6 flex items-center gap-2 text-xs font-bold uppercase text-slate-500 hover:text-[#114E8D] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali Ke Daftar Event
        </button>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Pane (Left 2 Col) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Elegant Banner Accent Card */}
            <div className={`bg-gradient-to-r ${getCategoryGradient(event.kategori)} rounded-3xl p-6 sm:p-10 text-white relative shadow-md overflow-hidden border-b-4 border-amber-400`}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 blur-2xl rounded-full"></div>
              <div className="relative z-10 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-white/20 px-3 py-1 rounded-lg text-[9px] uppercase tracking-wider font-extrabold font-mono border border-white/10 select-none">
                    {event.kategori}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusBadgeStyles(currentStatus)}`}>
                    {getStatusLabel(currentStatus)}
                  </span>
                </div>

                <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-tight uppercase">
                  {event.nama}
                </h1>

                <div className="flex items-center gap-1.5 text-xs text-slate-200/90 font-semibold bg-white/5 py-1 px-3 border border-white/10 rounded-xl w-max">
                  <Building2 className="w-4 h-4 text-amber-300" /> Penyelenggara: {event.penyelenggara}
                </div>
              </div>
            </div>

            {/* Metas and Schedule Box */}
            <div className="bg-white rounded-2xl border p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="text-xs uppercase font-black tracking-widest text-[#114E8D] font-mono border-b pb-2">
                Jadwal &amp; Lokasi Acara
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tanggal */}
                <div className="flex gap-3.5">
                  <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-center shrink-0 text-slate-500">
                    <Calendar className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-black font-mono">TANGGAL PELAKSANAAN</p>
                    <p className="text-slate-800 text-xs font-bold leading-tight mt-0.5">{event.tanggal}</p>
                  </div>
                </div>

                {/* Waktu */}
                <div className="flex gap-3.5">
                  <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-center shrink-0 text-slate-500">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-black font-mono">JAM PELAKSANAAN</p>
                    <p className="text-slate-800 text-xs font-bold leading-tight mt-0.5">{event.jam || "08:00 WIB"}</p>
                  </div>
                </div>

                {/* Lokasi */}
                <div className="flex gap-3.5 md:col-span-2 border-t pt-3.5 border-dashed">
                  <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-center shrink-0 text-slate-500 w-11 h-11">
                    <MapPin className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-black font-mono">TEMPAT VENUE</p>
                    <p className="text-slate-800 text-xs font-bold leading-snug mt-0.5 truncate">{event.lokasi}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-2xl border p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="text-xs uppercase font-black tracking-widest text-[#114E8D] font-mono border-b pb-2">
                Deskripsi Event Lengkap
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 font-medium">
                {event.deskripsi || "Detail deskripsi event ini belum didefinisikan secara spesifik oleh panitia pelaksana kegiatan."}
              </p>
              
              <div className="bg-amber-400/5 border border-amber-400/10 rounded-2xl p-4 flex gap-3 text-amber-800 text-[11px] leading-relaxed font-semibold">
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span>Setiap mahasiswa Universitas Nurul Fikri yang mendaftar dan dinyatakan <b>HADIR</b> oleh panitia setelah event selesai otomatis berhak mengunduh sertifikat resmi ber-ID divalidasi oleh Kemahasiswaan.</span>
              </div>
            </div>
          </div>

          {/* Right Pane CTA Box (1 Col) */}
          <div className="space-y-6">
            {/* Box CTA */}
            <div className="bg-white rounded-2xl border border-slate-250 p-6 shadow-md shadow-slate-100 space-y-5">
              <h3 className="text-xs uppercase font-black tracking-widest text-slate-400 font-mono">
                Registrasi &amp; Tiket RSVP
              </h3>

              {/* Progress seats */}
              <div className="border border-slate-100 rounded-2xl p-4 text-center space-y-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold font-mono flex items-center justify-center gap-1">
                  <Users className="w-4 h-4 text-slate-400" /> Sisa Kuota Terisi
                </p>
                <p className="text-slate-800 font-black text-xl leading-none">
                  {event.kuotaTerisi} <span className="text-slate-400 font-bold text-xs">/ {event.kuota} Kursi</span>
                </p>

                <div className="w-full bg-slate-100 h-2 border rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (event.kuotaTerisi / event.kuota) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Action operations button box */}
              <div className="space-y-3.5">
                {userAlreadyRSVP ? (
                  <div className="space-y-2.5">
                    {/* Terdaftar label */}
                    <div className="bg-emerald-50 border border-emerald-150 rounded-2xl p-4 text-center">
                      <p className="text-[#1B5E20] font-black text-xs uppercase flex items-center justify-center gap-1">
                        <Check className="w-4 h-4 text-emerald-500 stroke-[3px]" /> Anda Terdaftar ✓
                      </p>
                      <p className="text-[10.5px] text-emerald-700/80 leading-snug mt-1 font-medium">
                        Tiket Anda aktif. Silakan tunjukkan QR tiket pada hari H di lokasi atau cek riwayat event Anda.
                      </p>
                    </div>

                    {/* Batalkan RSVP Button */}
                    <button
                      onClick={handleCancelRsvp}
                      className="w-full border hover:bg-rose-50 hover:text-rose-600 font-extrabold text-xs uppercase py-3 rounded-xl cursor-pointer transition-all h-12"
                    >
                      Batalkan RSVP
                    </button>
                  </div>
                ) : isSelesai && event.sertifikatStatus === "approved" ? (
                  /* Completed event certified redirect block */
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
                    <div className="flex gap-2">
                      <Award className="w-5 h-5 text-blue-600 shrink-0" />
                      <div>
                        <p className="text-blue-900 font-black text-xs uppercase leading-none">Sertifikat Tersedia!</p>
                        <p className="text-[10.5px] text-blue-700/80 leading-normal mt-1 font-semibold">
                          Event telah selesai &amp; sertifikat kehadiran digital Anda siap diunduh! Cek laman Riwayat Event Anda.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push("/dashboard/mahasiswa/riwayat")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all uppercase cursor-pointer block text-center shadow-sm"
                    >
                      Cek Riwayat Event Saya
                    </button>
                  </div>
                ) : isLocked ? (
                  /* Sealed locked states */
                  <button
                    disabled
                    className="w-full bg-slate-100 text-slate-450 border border-slate-250 cursor-not-allowed font-extrabold text-xs uppercase py-3 rounded-xl h-12"
                  >
                    Pendaftaran Ditutup
                  </button>
                ) : (
                  /* Active RSVP trigger btn */
                  <button
                    onClick={handleRsvpClick}
                    className="w-full bg-[#114E8D] hover:bg-blue-700 text-amber-300 hover:text-white border-b-2 border-amber-400 font-black text-xs uppercase py-3.5 rounded-xl transition-all shadow flex items-center justify-center gap-1 cursor-pointer h-12"
                  >
                    RSVP Sekarang →
                  </button>
                )}

                {/* Share Link Button operations */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full border-b border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold text-xs uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer h-12 mt-2"
                >
                  <Share2 className="w-4.5 h-4.5" />
                  <span>{copied ? "Tersalin ✓" : "Salin Link Event"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* RSVP Confirmation Modal */}
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
                  <Award className="w-5 h-5" />
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
                  {event.nama}
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
                Pendaftaran bersifat gratis menggunakan sistem SSO Kemahasiswaan terintegrasi. Dengan menekan tombol konfirmasi Anda setuju untuk terdaftar dan dihubungi oleh kepanitiaan <b className="text-slate-600">&quot;{event.penyelenggara}&quot;</b> terkait.
              </p>

              {/* Action operations button pane */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowRsvpModal(false)}
                  className="w-full border font-bold text-xs uppercase py-3 rounded-xl hover:bg-slate-50 cursor-pointer active:scale-95 transition-all text-slate-605 h-12"
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

      <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-12 text-center text-slate-500 text-[11px] font-mono leading-relaxed select-none">
        <p>© 2026 Universitas Nurul Fikri — EventHub System</p>
        <p className="text-[9px] text-slate-600 mt-1 uppercase tracking-widest font-black">
          Sistem Informasi Kepanitiaan Kampus &amp; Manajemen Sertifikat Terpusat
        </p>
      </footer>
    </div>
  );
}
