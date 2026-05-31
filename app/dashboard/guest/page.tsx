// ADDED: High fidelity responsive modular Guest Dashboard Page
"use client";

import React, { useState, useEffect } from "react";
import { getEvents, saveEvents, EventWithCertificate } from "../../../lib/certificateData";
import { useAuth } from "../../../context/AuthContext";
import { 
  Building2, Calendar, MapPin, Search, Ticket, AlertTriangle, 
  Sparkles, Check, Info, ArrowRight, User, Mail, QrCode, X 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GuestTicket {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventLoc: string;
  guestName: string;
  guestEmail: string;
  guestInst: string;
  rsvpDate: string;
}

export default function GuestDashboardPage() {
  const { addToast } = useAuth();
  
  // App state
  const [events, setEvents] = useState<EventWithCertificate[]>(() => {
    if (typeof window !== "undefined") return getEvents();
    return [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [guestTickets, setGuestTickets] = useState<GuestTicket[]>(() => {
    if (typeof window !== "undefined") {
      const storedTickets = localStorage.getItem("eventhub_guest_tickets");
      if (storedTickets) {
        try {
          return JSON.parse(storedTickets);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  });

  // Dialog / flow states
  const [selectedEvent, setSelectedEvent] = useState<EventWithCertificate | null>(null);
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [viewTicket, setViewTicket] = useState<GuestTicket | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formInst, setFormInst] = useState("");

  const categories = ["Semua", "Seminar", "Seni", "Lomba", "Workshop"];

  const filteredEvents = events.filter((evt) => {
    const matchesSearch = evt.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          evt.penyelenggara.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === "Semua" || evt.kategori.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCat && evt.status === "aktif";
  });

  const handleOpenRsvp = (evt: EventWithCertificate) => {
    setSelectedEvent(evt);
    setFormName("");
    setFormEmail("");
    setFormInst("");
    setShowRsvpModal(true);
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    if (!formName.trim() || !formEmail.trim() || !formInst.trim()) {
      addToast("Harap isi semua kolom pendaftaran!", "warning");
      return;
    }

    if (!formEmail.includes("@")) {
      addToast("Format alamat email salah!", "warning");
      return;
    }

    // Check if already registered
    const alreadyRegistered = guestTickets.some(
      (t) => t.eventId === selectedEvent.id && t.guestEmail.toLowerCase() === formEmail.trim().toLowerCase()
    );

    if (alreadyRegistered) {
      addToast("Anda sudah terdaftar untuk event ini menggunakan email tersebut!", "warning");
      return;
    }

    // Process RSVP
    const newTicket: GuestTicket = {
      id: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
      eventId: selectedEvent.id,
      eventName: selectedEvent.nama,
      eventDate: selectedEvent.tanggal,
      eventLoc: selectedEvent.lokasi,
      guestName: formName.trim(),
      guestEmail: formEmail.trim().toLowerCase(),
      guestInst: formInst.trim(),
      rsvpDate: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    };

    const updatedTickets = [...guestTickets, newTicket];
    setGuestTickets(updatedTickets);
    localStorage.setItem("eventhub_guest_tickets", JSON.stringify(updatedTickets));

    // Update event quota
    const updatedEvents = events.map((evt) => {
      if (evt.id === selectedEvent.id) {
        return {
          ...evt,
          kuotaTerisi: Math.min(evt.kuota, evt.kuotaTerisi + 1)
        };
      }
      return evt;
    });
    setEvents(updatedEvents);
    saveEvents(updatedEvents);

    setShowRsvpModal(false);
    setViewTicket(newTicket);
    addToast(`Pendaftaran Berhasil! e-Ticket Anda diterbitkan.`, "success");
  };

  return (
    <div id="guest-dashboard-container" className="space-y-8">
      {/* Top Banner Alert to explain limitation */}
      <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-4 shadow-sm">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <p className="font-extrabold text-[13px] uppercase tracking-wider mb-1">Akses Penonton Publik / Tamu Terbatas</p>
            Sebelum mendaftar kepanitiaan, mengumpulkan laporan tugas devisi, atau mangakses e-Certificate resmi mahasiswa, Anda wajib masuk memakai akun Mahasiswa Kampus (<span className="font-mono font-bold bg-[#FFF2CC] px-1 rounded text-amber-900 border border-amber-300">.ac.id</span>). Sebagai Tamu, Anda hanya berhak mendaftar Tiket RSVP Umum.
          </div>
        </div>
      </div>

      {/* Header section */}
      <div className="bg-[#114E8D] text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden border border-white/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full mb-4">
            <Sparkles className="w-3 h-3 fill-current" /> Sesi Publik
          </div>
          <h1 className="text-2xl md:text-3.5xl font-black tracking-tight leading-none mb-3">
            Eksplorasi Event Kampus Kebangsaan
          </h1>
          <p className="text-slate-200 text-xs md:text-sm leading-relaxed max-w-lg">
            Temukan seminar akademik, pagelaran seni BEM, kompetisi nasional, maupun workshop terkini. RSVP cepat tanpa akun mahasiswa dan langsung kantongi e-Ticket Anda.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 font-black text-[120px] select-none leading-none -mb-10 -mr-6 md:block hidden">
          PUBLIC
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/85">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-1.5 order-2 md:order-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase transition-all tracking-wider ${
                  activeCategory === cat
                    ? "bg-[#114E8D] text-white shadow-md shadow-blue-900/10"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative order-1 md:order-2 w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari event / penyelenggara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9.5 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Active Events Grid */}
      <div>
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-[#114E8D]" /> Daftar Event Aktif ({filteredEvents.length})
        </h2>

        {filteredEvents.length === 0 ? (
          <div className="bg-white border rounded-2xl p-12 text-center text-xs text-slate-400 font-bold font-mono">
            Event aktif bertema &quot;{activeCategory}&quot; tidak ditemukan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((evt) => {
              // Check if already registered
              const ticket = guestTickets.find((t) => t.eventId === evt.id);
              const kuotaSisa = evt.kuota - evt.kuotaTerisi;

              return (
                <div
                  key={evt.id}
                  id={`event-card-${evt.id}`}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-blue-50 text-[#114E8D] border border-blue-100">
                        {evt.kategori}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono font-bold">
                        Sisa Kuota: <span className={kuotaSisa <= 5 ? "text-rose-600 font-black animate-pulse" : "text-slate-800"}>{kuotaSisa}</span> / {evt.kuota}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-[15px] text-slate-900 leading-snug">
                        {evt.nama}
                      </h3>
                      <p className="text-[11px] text-[#114E8D] font-bold mt-1.5 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" /> {evt.penyelenggara}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-slate-100 text-[11.5px] text-slate-500 font-bold">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{evt.tanggal}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.lokasi}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4 bg-slate-50/75 border-t flex gap-2 items-center justify-between">
                    {ticket ? (
                      <>
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase">
                          <Check className="w-3.5 h-3.5" /> Terdaftar
                        </span>
                        <button
                          onClick={() => setViewTicket(ticket)}
                          className="bg-slate-900 text-white font-extrabold text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-xl hover:bg-slate-850 cursor-pointer text-xs"
                        >
                          Lihat Tiket
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] text-slate-400 font-bold">Pendaftaran Gratis</span>
                        <button
                          onClick={() => handleOpenRsvp(evt)}
                          disabled={kuotaSisa <= 0}
                          className={`font-black text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer ${
                            kuotaSisa <= 0
                              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                              : "bg-[#114E8D] hover:bg-blue-800 text-white shadow-sm"
                          }`}
                        >
                          RSVP Sekarang <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Guest registration history tickets */}
      {guestTickets.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider mb-4">
            Riwayat Tiket RSVP Saya
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {guestTickets.map((t) => (
              <div
                key={t.id}
                className="bg-white border text-left p-4 rounded-2xl relative shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded font-mono border border-amber-200">
                      ID: {t.id}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {t.rsvpDate}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-[13px] text-slate-950 leading-tight mb-2 truncate">
                    {t.eventName}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-bold truncate">
                    Atas Nama: <span className="text-slate-800">{t.guestName}</span>
                  </p>
                </div>
                <button
                  onClick={() => setViewTicket(t)}
                  className="mt-4 w-full text-center bg-slate-50 hover:bg-slate-100 text-[#114E8D] border py-1.5 rounded-xl font-bold text-xs uppercase"
                >
                  Tampilkan e-ticket
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: RSVP FORM */}
      <AnimatePresence>
        {showRsvpModal && selectedEvent && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[100] overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="bg-[#114E8D] text-white p-5 flex justify-between items-center border-b-[3.5px] border-amber-400">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded">FORMULIR TAMU</span>
                  <h3 className="font-black text-sm uppercase tracking-tight mt-1">Konfirmasi RSVP Tiket</h3>
                </div>
                <button onClick={() => setShowRsvpModal(false)} className="hover:bg-white/10 p-1 rounded-full text-white/50 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRsvpSubmit} className="p-6 space-y-4 text-xs font-bold leading-none">
                <div>
                  <label className="block text-slate-500 uppercase font-bold text-[10px] tracking-wider mb-1.5">Nama Lengkap Anda</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama resmi untuk e-ticket"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full pl-9 px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 uppercase font-bold text-[10px] tracking-wider mb-1.5">Alamat Email Umum</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="Contoh: andi@gmail.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full pl-9 px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 uppercase font-bold text-[10px] tracking-wider mb-1.5">Instansi / Sekolah Asal</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: SMA Negeri 4 Bandung / Developer"
                      value={formInst}
                      onChange={(e) => setFormInst(e.target.value)}
                      className="w-full pl-9 px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold bg-white"
                    />
                  </div>
                </div>

                <div className="bg-slate-100 p-3.5 rounded-2xl space-y-1.5 text-[11px] leading-relaxed text-slate-600 font-bold">
                  <p className="font-extrabold uppercase text-[10px] text-slate-800">Event Yang Dipilih:</p>
                  <p className="text-slate-900">{selectedEvent.nama}</p>
                  <p>Tanggal: {selectedEvent.tanggal}</p>
                  <p>Lokasi: {selectedEvent.lokasi}</p>
                </div>

                <div className="pt-4 border-t flex gap-2 justify-end text-xs">
                  <button
                    type="button"
                    onClick={() => setShowRsvpModal(false)}
                    className="border px-4 py-2 rounded-xl font-bold hover:bg-slate-50 uppercase text-slate-500 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-[#114E8D] hover:bg-blue-800 text-white px-4 py-2 rounded-xl font-black uppercase tracking-wider cursor-pointer"
                  >
                    Beli / Ambil Tiket
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: TICKET VIEW SCREEN */}
      <AnimatePresence>
        {viewTicket && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[100] overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-700 p-6 text-white text-center space-y-6"
            >
              {/* Ticket Top Branding */}
              <div className="flex flex-col items-center">
                <div className="bg-amber-400 text-slate-950 p-2.5 rounded-2xl flex items-center justify-center border border-white/20 shadow-md mb-2">
                  <Ticket className="w-6 h-6 fill-current animate-pulse" />
                </div>
                <h3 className="font-black text-base uppercase tracking-tight text-white mb-0.5">
                  e-Ticket Resmi Universitas
                </h3>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-300">
                  Tiket Terdaftar Publik
                </span>
              </div>

              {/* QR Code and Meta Section */}
              <div className="bg-white text-slate-950 rounded-2xl p-5 border-2 border-dashed border-slate-200">
                {/* Visual Mock QR code layout */}
                <div className="w-36 h-36 mx-auto bg-slate-100 rounded-2xl p-3 border flex flex-col items-center justify-center mb-4 relative group">
                  <QrCode className="w-24 h-24 text-slate-900" />
                  <span className="absolute bottom-1 font-mono text-[8px] font-black tracking-widest text-[#114E8D]">
                    {viewTicket.id}
                  </span>
                </div>

                {/* Event meta description inside barcode card */}
                <div className="space-y-2 text-left text-slate-600 font-bold text-[11px] leading-relaxed border-t border-slate-100 pt-3">
                  <p className="font-extrabold text-[12.5px] text-slate-900 leading-tight">
                    {viewTicket.eventName}
                  </p>
                  <div>
                    <p className="text-slate-400 font-black text-[9px] uppercase tracking-wider mb-0.5">Nama Peserta</p>
                    <p className="text-slate-800">{viewTicket.guestName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-black text-[9px] uppercase tracking-wider mb-0.5">Asal Instansi</p>
                    <p className="text-slate-800 truncate">{viewTicket.guestInst}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 font-black text-[9px] uppercase tracking-wider mb-0.5">Tanggal Pelaksanaan</p>
                      <p className="text-slate-800">{viewTicket.eventDate}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-black text-[9px] uppercase tracking-wider mb-0.5">Lokasi Utama</p>
                      <p className="text-slate-800 truncate">{viewTicket.eventLoc}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informative Security Label */}
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 text-[10.5px] leading-snug text-slate-400 font-bold">
                Tunjukkan QR code di pintu masuk Auditorium. Registrasi terekam ke database Sistem Informasi kampus tanggal {viewTicket.rsvpDate}.
              </div>

              <button
                onClick={() => setViewTicket(null)}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase cursor-pointer"
              >
                Selesai / Simpan
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
