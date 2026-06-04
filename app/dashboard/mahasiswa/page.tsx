// ADDED: High fidelity modular Mahasiswa Dashboard Page
"use client";

import React, { useState, useEffect } from "react";
import { getEvents, saveEvents, EventWithCertificate } from "../../../lib/certificateData";
import { useAuth } from "../../../context/AuthContext";
import { 
  User, Calendar, MapPin, Building2, Ticket, Award, BookOpen, 
  Users, Check, ArrowRight, ShieldCheck, Sparkles, Star, PlusSquare, Bookmark, X 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";

interface PanitiaApplication {
  id: string;
  eventId: string;
  eventName: string;
  studentName: string;
  studentEmail: string;
  studentNim: string;
  selectedDivision: string;
  motivation: string;
  status: "pending" | "approved" | "rejected";
  appliedDate: string;
}

export default function MahasiswaDashboardPage() {
  const router = useRouter();
  const { user, addToast, addNotification } = useAuth();
  
  // App state
  const [events, setEvents] = useState<EventWithCertificate[]>(() => {
    if (typeof window !== "undefined") return getEvents();
    return [];
  });
  const [comApplications, setComApplications] = useState<PanitiaApplication[]>(() => {
    if (typeof window !== "undefined") {
      const storedApps = localStorage.getItem("eventhub_committee_applications");
      if (storedApps) {
        try {
          return JSON.parse(storedApps);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  });

  // Dialog states
  const [selectedEvent, setSelectedEvent] = useState<EventWithCertificate | null>(null);
  const [showRsvpConfirm, setShowRsvpConfirm] = useState(false);
  const [showCommitteeModal, setShowCommitteeModal] = useState(false);

  // Form states
  const [selectedDivision, setSelectedDivision] = useState("Divisi Acara");
  const [motivationText, setMotivationText] = useState("");

  const divisionsList = [
    "Divisi Acara",
    "Divisi Logistik & Perlengkapan",
    "Divisi Hubungan Masyarakat (Humas)",
    "Divisi Publikasi & Dokumentasi (Pubdok)",
    "Divisi Konsumsi"
  ];

  const studentEmail = user?.email || "";
  const studentName = user?.nama || "";
  const studentNim = user?.nim || "";

  // Helper inside loop to check if registered for RSVP
  const isJoinedRsvp = (evt: EventWithCertificate) => {
    return evt.peserta.some((p) => p.email.toLowerCase() === studentEmail.toLowerCase());
  };

  // Helper inside loop to check if applied for Committee
  const hasAppliedCommittee = (eventId: string) => {
    return comApplications.some(
      (app) => app.eventId === eventId && app.studentEmail.toLowerCase() === studentEmail.toLowerCase()
    );
  };

  const getCommitteeStatusBadge = (eventId: string) => {
    const app = comApplications.find(
      (app) => app.eventId === eventId && app.studentEmail.toLowerCase() === studentEmail.toLowerCase()
    );
    if (!app) return null;

    const styles = {
      pending: "bg-amber-100 text-amber-900 border-amber-200",
      approved: "bg-emerald-150 text-emerald-900 border-emerald-250",
      rejected: "bg-rose-100 text-rose-900 border-rose-200"
    };

    return (
      <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border ${styles[app.status]}`}>
        Kepanitiaan: {app.status === "pending" ? "Menunggu" : app.status === "approved" ? "Diterima" : "Ditolak"}
      </span>
    );
  };

  // RSVP execution
  const handleRsvpSubmit = () => {
    if (!selectedEvent || !user) return;

    // Check quota
    const kuotaSisa = selectedEvent.kuota - selectedEvent.kuotaTerisi;
    if (kuotaSisa <= 0) {
      addToast("Maaf, kuota event ini sudah penuh!", "error");
      return;
    }

    // Call update list
    const updatedEvents = events.map((evt) => {
      if (evt.id === selectedEvent.id) {
        // Add student as peserta
        const alreadyIn = evt.peserta.some((p) => p.email.toLowerCase() === studentEmail.toLowerCase());
        if (alreadyIn) return evt;

        return {
          ...evt,
          kuotaTerisi: Math.min(evt.kuota, evt.kuotaTerisi + 1),
          peserta: [
            ...evt.peserta,
            {
              nim: studentNim,
              nama: studentName,
              email: studentEmail,
              statusHadir: "menunggu" as const,
              sertifikatDownloaded: false,
              nomorSertifikat: `CERT-25-EVT${evt.id}-${studentNim}`
            }
          ]
        };
      }
      return evt;
    });

    setEvents(updatedEvents);
    saveEvents(updatedEvents);
    setShowRsvpConfirm(false);
    
    // In-app alert
    addNotification(
      "RSVP Event Terdaftar!",
      `Sesi Anda untuk event '${selectedEvent.nama}' berhasil dicatat. Unduh tiket di halaman Riwayat.`,
      "Event",
      ["mahasiswa"]
    );

    addToast(`RSVP Berhasil! Anda terdaftar untuk '${selectedEvent.nama}'`, "success");
  };

  // Kepanitiaan execution
  const handleCommitteeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !user) return;

    if (!motivationText.trim()) {
      addToast("Silakan tulis alasan/motivasi singkat Anda!", "warning");
      return;
    }

    const newApp: PanitiaApplication = {
      id: `APP-${Math.floor(100000 + Math.random() * 900000)}`,
      eventId: selectedEvent.id,
      eventName: selectedEvent.nama,
      studentName: studentName,
      studentEmail: studentEmail,
      studentNim: studentNim,
      selectedDivision: selectedDivision,
      motivation: motivationText.trim(),
      status: "pending",
      appliedDate: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    };

    const updatedApps = [...comApplications, newApp];
    setComApplications(updatedApps);
    localStorage.setItem("eventhub_committee_applications", JSON.stringify(updatedApps));

    setShowCommitteeModal(false);

    // Alert
    addNotification(
      "Pendaftaran Panitia Dikirim",
      `Aplikasi untuk divisi ${selectedDivision} pada event '${selectedEvent.nama}' dikirim ke Project Officer.`,
      "Tugas",
      ["mahasiswa"]
    );

    // Notify PO
    addNotification(
      "Pendaftar Panitia Baru!",
      `Mahasiswa ${studentName} mendaftar sebagai ${selectedDivision} untuk event ${selectedEvent.nama}.`,
      "Persetujuan",
      ["po"]
    );

    addToast(`Pengajuan Panitia untuk '${selectedDivision}' Berhasil dikirim!`, "success");
  };

  const activeEvents = events.filter((evt) => evt.status === "aktif");

  return (
    <div id="mahasiswa-dashboard-wrap" className="space-y-8">
      {/* Dynamic Profile Welcome Card */}
      <div className="bg-gradient-to-br from-[#114E8D] to-[#1e6cb7] text-white rounded-3xl p-6 md:p-8 shadow-xl border border-white/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full">
              <Star className="w-3 h-3 fill-current" /> MAHASISWA AKTIF
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-none">
              Selamat datang kembali, <span className="text-amber-300">{studentName}</span>
            </h1>
            <p className="text-blue-150 text-xs font-mono font-bold">
              NIM KAMPUS: <span className="text-white">{studentNim}</span> | PRODI: Rekayasa Sistem Komputasi
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/dashboard/mahasiswa/riwayat")}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5"
            >
              <Ticket className="w-4 h-4" /> Riwayat & Sertifikat
            </button>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 font-bold text-[140px] select-none leading-none -mb-10 -mr-6 pointer-events-none">
          MHS
        </div>
      </div>

      {/* Quick Dashboard Stat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Event RSVP Saya</p>
            <p className="text-xl font-extrabold text-slate-800">
              {events.filter((evt) => isJoinedRsvp(evt)).length} Berpartisipasi
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="bg-amber-100 text-amber-600 p-3 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Aplikasi Kepanitiaan</p>
            <p className="text-xl font-extrabold text-slate-800">
              {comApplications.length} Terdaftar
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">e-Sertifikat Tersedia</p>
            <p className="text-xl font-extrabold text-slate-800">
              {events.filter((evt) => {
                const isUser = evt.peserta.find((p) => p.email.toLowerCase() === studentEmail.toLowerCase());
                return isUser && isUser.statusHadir === "hadir" && evt.sertifikatStatus === "approved";
              }).length} Dokumen
            </p>
          </div>
        </div>
      </div>

      {/* Active Campus Events feed with RSVP and Committee application button triggers */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#114E8D]" /> Agenda Event Aktif Universitas ({activeEvents.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeEvents.map((evt) => {
            const joined = isJoinedRsvp(evt);
            const appliedCom = hasAppliedCommittee(evt.id);
            const kuotaSisa = evt.kuota - evt.kuotaTerisi;

            return (
              <div
                key={evt.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-blue-50 text-[#114E8D]">
                      {evt.kategori}
                    </span>
                    <span className="text-[11px] text-slate-500 font-bold">
                      Sisa Kuota: <span className={kuotaSisa <= 5 ? "text-rose-500 font-extrabold" : "text-slate-800"}>{kuotaSisa}</span> / {evt.kuota}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-slate-950 leading-snug">
                      {evt.nama}
                    </h3>
                    <p className="text-[11.5px] text-[#114E8D] font-bold mt-1.5 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> BEM / {evt.penyelenggara}
                    </p>
                  </div>

                  <div className="pt-3 border-t grid grid-cols-2 gap-3 text-[11px] text-slate-500 font-bold leading-tight">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{evt.tanggal}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{evt.lokasi}</span>
                    </div>
                  </div>

                  {/* Operational Status indicators for registered paths */}
                  <div className="flex flex-wrap gap-2 pt-1 font-bold">
                    {joined && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-250">
                        <Check className="w-3 h-3" /> RSVP: Terdaftar
                      </span>
                    )}
                    {getCommitteeStatusBadge(evt.id)}
                  </div>
                </div>

                <div className="px-5 py-4 bg-slate-50 border-t rounded-b-3xl flex flex-wrap gap-2 items-center justify-between select-none">
                  <div className="flex gap-2 w-full sm:w-auto">
                    {/* Committee button - hidden or customized if already joined */}
                    {!appliedCom ? (
                      <button
                        onClick={() => {
                          setSelectedEvent(evt);
                          setMotivationText("");
                          setShowCommitteeModal(true);
                        }}
                        className="flex-1 sm:flex-none border border-[#114E8D] text-[#114E8D] hover:bg-blue-50 font-bold text-xs uppercase px-4 py-2 rounded-xl cursor-pointer"
                      >
                        Ikut Panitia
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 font-black uppercase px-3 py-2 bg-slate-100 rounded-xl border">
                        Panitia Dikirim
                      </span>
                    )}
                  </div>

                  {/* RSVP button action trigger */}
                  {!joined ? (
                    <button
                      onClick={() => {
                        setSelectedEvent(evt);
                        setShowRsvpConfirm(true);
                      }}
                      disabled={kuotaSisa <= 0}
                      className="w-full sm:w-auto bg-[#114E8D] hover:bg-blue-800 text-white font-extrabold text-xs uppercase px-4 py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Daftar RSVP <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push("/dashboard/mahasiswa/riwayat")}
                      className="w-full sm:w-auto bg-slate-800 text-white font-bold text-xs uppercase px-4 py-2 rounded-xl cursor-pointer"
                    >
                      Lihat Tiket
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONFIRM RSVP DIALOG */}
      <AnimatePresence>
        {showRsvpConfirm && selectedEvent && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[100] overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="bg-[#114E8D] text-white p-5 flex justify-between items-center border-b-[3.5px] border-amber-400">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded">SINKRONISASI AKUN</span>
                  <h3 className="font-black text-sm uppercase tracking-tight mt-1">Konfirmasi RSVP Mahasiswa</h3>
                </div>
                <button onClick={() => setShowRsvpConfirm(false)} className="hover:bg-white/10 p-1 rounded-full text-white/50 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs font-bold leading-normal">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-900 flex text-left gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#114E8D] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold">Akun Mahasiswa Anda Terverifikasi</p>
                    <p className="font-medium text-[11px] opacity-90 mt-0.5">
                      Pendaftaran menggunakan nama resmi <span className="font-bold underline">{studentName}</span> ({studentNim}) untuk presensi kehadiran digital otomatis.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border space-y-2 text-[11px] text-slate-600 font-bold">
                  <p className="font-extrabold uppercase text-[10px] text-slate-800">Event Detail:</p>
                  <p className="text-slate-950 text-[12.5px] font-black">{selectedEvent.nama}</p>
                  <p>Pelaksanaan: {selectedEvent.tanggal}</p>
                  <p>Lokasi: {selectedEvent.lokasi}</p>
                </div>

                <div className="pt-4 border-t flex gap-2 justify-end">
                  <button
                    onClick={() => setShowRsvpConfirm(false)}
                    className="border px-4 py-2 rounded-xl font-bold hover:bg-slate-50 uppercase text-slate-500 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleRsvpSubmit}
                    className="bg-[#114E8D] hover:bg-blue-800 text-white px-4 py-2 rounded-xl font-black uppercase tracking-wider cursor-pointer"
                  >
                    Konfirmasi, Daftar RSVP
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMMITTEE MODAL DETAILS */}
      <AnimatePresence>
        {showCommitteeModal && selectedEvent && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[100] overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="bg-[#114E8D] text-white p-5 flex justify-between items-center border-b-[3.5px] border-amber-400">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded">FORMULIR KEPANITIAAN</span>
                  <h3 className="font-black text-sm uppercase tracking-tight mt-1">Daftar Divisi Kepanitiaan</h3>
                </div>
                <button onClick={() => setShowCommitteeModal(false)} className="hover:bg-white/10 p-1 rounded-full text-white/50 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCommitteeSubmit} className="p-6 space-y-4 text-xs font-bold leading-none">
                <div>
                  <label className="block text-slate-500 uppercase font-bold text-[10px] tracking-wider mb-1.5">Pilihan Pasca Divisi</label>
                  <select
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl py-2 px-3 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {divisionsList.map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 uppercase font-bold text-[10px] tracking-wider mb-1.5">Motivasi & Deskripsi Kemampuan Singkat</label>
                  <textarea
                    required
                    rows={4}
                    value={motivationText}
                    onChange={(e) => setMotivationText(e.target.value)}
                    placeholder="Contoh: Saya memiliki pengalaman mengurus sound system di Dies Natalis sebelumnya dan menguasai pengoperasian mixer panggung."
                    className="w-full border rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold bg-white"
                  ></textarea>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-amber-900 leading-snug font-medium text-[10.5px]">
                  <strong>Catatan Seleksi:</strong> Project Officer (PO) dari event terkait memiliki hak prerogatif penuh untuk menyetujui, mengkondisikan, maupun memindahkan divisi pendaftar.
                </div>

                <div className="pt-4 border-t flex gap-2 justify-end text-xs">
                  <button
                    type="button"
                    onClick={() => setShowCommitteeModal(false)}
                    className="border px-4 py-2 rounded-xl font-bold hover:bg-slate-50 uppercase text-slate-500 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-[#114E8D] hover:bg-blue-800 text-white px-4 py-2 rounded-xl font-black uppercase tracking-wider cursor-pointer"
                  >
                    Ajukan Sebagai Panitia
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
