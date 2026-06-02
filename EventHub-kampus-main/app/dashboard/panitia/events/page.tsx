// CREATED: app/dashboard/panitia/events/page.tsx
// FIXED: 404 - /dashboard/panitia/events
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { getEvents, saveEvents, EventWithCertificate, PesertaItem } from "../../../../lib/certificateData";
import { 
  Plus, Calendar, MapPin, Building2, Ticket, Check, X, Users, Filter, 
  ArrowRight, Shield, ShieldCheck, ShieldAlert, Award, FileText, ChevronDown, ChevronUp, Edit3, Trash2, Users2, QrCode
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ExtendedEvent extends EventWithCertificate {
  alasanDitolak?: string;
}

export default function PanitiaEventsPage() {
  const router = useRouter();
  const { user, addToast, addNotification } = useAuth();

  // Guard account
  useEffect(() => {
    if (user && user.role !== "panitia") {
      router.replace(`/dashboard/${user.role === "staf" ? "staff" : user.role}`);
    }
  }, [user, router]);

  // States
  const [events, setEvents] = useState<ExtendedEvent[]>([]);
  const [activeTab, setActiveTab] = useState<"my-events" | "all-active">("my-events");
  
  // Create / Edit Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ExtendedEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formNama, setFormNama] = useState("");
  const [formDeskripsi, setFormDeskripsi] = useState("");
  const [formKategori, setFormKategori] = useState("Seminar");
  const [formTanggal, setFormTanggal] = useState("");
  const [formJam, setFormJam] = useState("");
  const [formLokasi, setFormLokasi] = useState("");
  const [formKuotaMax, setFormKuotaMax] = useState(100);

  // Manage Attendees Modal
  const [showAttendeesModal, setShowAttendeesModal] = useState<ExtendedEvent | null>(null);
  const [attendees, setAttendees] = useState<PesertaItem[]>([]);

  // States for scanner simulation
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [scanSuccessMsg, setScanSuccessMsg] = useState("");

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      console.warn("AudioContext block:", e);
    }
  };

  const handleScanResult = (payload: { eventId: string; email: string; nim: string; nama: string }) => {
    if (!showAttendeesModal) return;

    if (payload.eventId !== showAttendeesModal.id) {
      addToast(`QR Tiket ini valid untuk Event ID ${payload.eventId}, melainkan menu aktif saat ini adalah ${showAttendeesModal.id}!`, "error");
      return;
    }

    // Check if participant exists in attendees list
    const exists = attendees.find(p => p.nim === payload.nim || p.email.toLowerCase() === payload.email.toLowerCase());
    if (!exists) {
      addToast(`Mahasiswa ${payload.nama} (${payload.nim}) belum terdaftar pada sesi RSVP event ini!`, "warning");
      return;
    }

    if (exists.statusHadir === "hadir") {
      addToast(`${payload.nama} sudah diverifikasi kehadiran sebelumnya.`, "info");
      return;
    }

    // Success check-in!
    playBeep();
    setScanSuccessMsg(`${payload.nama} (${payload.nim})`);
    
    // Update attendance state
    const updated = attendees.map(p => {
      if (p.nim === payload.nim) {
        return {
          ...p,
          statusHadir: "hadir" as const
        };
      }
      return p;
    });
    setAttendees(updated);

    // Save immediately so it updates localStorage on-the-fly!
    const updatedList = events.map(evt => {
      if (evt.id === showAttendeesModal.id) {
        return {
          ...evt,
          peserta: updated,
        };
      }
      return evt;
    });
    setEvents(updatedList);
    saveEvents(updatedList);

    addToast(`[SCAN SUCCESS] ${payload.nama} terverifikasi HADIR!`, "success");

    // Add brief auto notification to the scanned student
    addNotification(
      "Daftar Hadir Terverifikasi ✓",
      `Kehadiran Anda pada event '${showAttendeesModal.nama}' sukses tervalidasi via Scanner e-Tiket QR.`,
      "Event",
      ["mahasiswa"]
    );

    // Reset success message after some delay so they can scan next
    setTimeout(() => {
      setScanSuccessMsg("");
    }, 1800);
  };

  // Accordion for rejection reasons
  const [expandedRejectionId, setExpandedRejectionId] = useState<string | null>(null);

  useEffect(() => {
    setEvents(getEvents() as ExtendedEvent[]);
  }, []);

  if (!user || user.role !== "panitia") {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center font-mono text-xs text-slate-400 font-bold tracking-widest uppercase animate-pulse">
        Memverifikasi Akun...
      </div>
    );
  }

  const currentUserEmail = user.email || "panitia@kampus.ac.id";

  // Filter lists
  const myEvents = events.filter(e => e.pengajuEmail?.toLowerCase() === currentUserEmail.toLowerCase());
  const allActiveEvents = events.filter(e => e.status === "approved" || e.status === "aktif" || e.status === "selesai");

  // Handler: Open modal for Add Event
  const openAddModal = () => {
    setEditingEvent(null);
    setFormNama("");
    setFormDeskripsi("");
    setFormKategori("Seminar");
    // Default dummy schedule a month from now
    setFormTanggal("2026-07-25");
    setFormJam("09.00 - 12.00 WIB");
    setFormLokasi("Gd. Auditorium Rektorat Lt. 2");
    setFormKuotaMax(100);
    setShowFormModal(true);
  };

  // Handler: Open modal for Edit Event
  const openEditModal = (evt: ExtendedEvent) => {
    setEditingEvent(evt);
    setFormNama(evt.nama);
    setFormDeskripsi(evt.deskripsi || "");
    setFormKategori(evt.kategori);
    setFormTanggal(evt.tanggal);
    setFormJam(evt.jam || "");
    setFormLokasi(evt.lokasi);
    setFormKuotaMax(evt.kuotaMax || evt.kuota || 100);
    setShowFormModal(true);
  };

  // Tarik Pengajuan (withdrawal of pending proposal)
  const handleWithdraw = (evtId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menarik draf pengajuan event ini? Prosedur ini akan menghapus pengajuan dari antrean PO.")) {
      return;
    }

    const updated = events.filter(e => e.id !== evtId);
    setEvents(updated);
    saveEvents(updated);
    addToast("Pengajuan event berhasil ditarik.", "warning");
  };

  // Submit Add / Edit Form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formLokasi.trim()) {
      addToast("Harap lengkapi isian form yang wajib diisi.", "error");
      return;
    }

    setIsSubmitting(true);
    let updatedEventsList: ExtendedEvent[] = [];

    if (editingEvent) {
      // Edit existing
      updatedEventsList = events.map(evt => {
        if (evt.id === editingEvent.id) {
          return {
            ...evt,
            nama: formNama,
            deskripsi: formDeskripsi,
            kategori: formKategori,
            tanggal: formTanggal,
            jam: formJam,
            lokasi: formLokasi,
            kuotaMax: formKuotaMax,
            kuota: formKuotaMax,
            status: "pending_approval" as const, // re-submit as pending
            eventStatus: "segera" as const
          };
        }
        return evt;
      });
      addToast(`Draf perbaikan event '${formNama}' berhasil diajukan ulang ke PO!`, "success");
    } else {
      // Create new
      const nextId = `EVT00${events.length + 1}`;
      const newEvent: ExtendedEvent = {
        id: nextId,
        nama: formNama,
        kategori: formKategori,
        tanggal: formTanggal,
        jam: formJam,
        lokasi: formLokasi,
        penyelenggara: user.nama || "Divisi Kemahasiswaan BEM",
        pengajuEmail: currentUserEmail,
        kuotaMax: formKuotaMax,
        kuota: formKuotaMax,
        kuotaTerisi: 0,
        status: "pending_approval" as const,
        eventStatus: "segera" as const,
        tanggalDiajukan: new Date().toISOString().substring(0, 10),
        deskripsi: formDeskripsi,
        sertifikatStatus: null,
        peserta: []
      };
      updatedEventsList = [...events, newEvent];
      addToast(`Event '${formNama}' berhasil diajukan ke Project Officer!`, "success");
    }

    setTimeout(() => {
      setEvents(updatedEventsList);
      saveEvents(updatedEventsList);
      setIsSubmitting(false);
      setShowFormModal(false);

      // Notification logic
      addNotification(
        "Proposal Event Baru Diajukan!",
        `Panitia mengajukan event '${formNama}' untuk ditinjau kelayakannya oleh PO.`,
        "Persetujuan",
        ["po"]
      );
    }, 550);
  };

  // Open Attendees Management Drawer Panel
  const openAttendeesPanel = (evt: ExtendedEvent) => {
    setShowAttendeesModal(evt);
    setAttendees([...evt.peserta]);
  };

  // Toggle Attendee status locally in modal state
  const handleToggleAttendance = (nim: string, status: "hadir" | "tidak_hadir" | "menunggu") => {
    const updated = attendees.map(p => {
      if (p.nim === nim) {
        return {
          ...p,
          statusHadir: status
        };
      }
      return p;
    });
    setAttendees(updated);
  };

  // Submit Attendees and apply changes
  const handleSaveAttendees = () => {
    if (!showAttendeesModal) return;

    // Save peserta and overall list metadata
    const updatedList = events.map(evt => {
      if (evt.id === showAttendeesModal.id) {
        return {
          ...evt,
          peserta: attendees
        };
      }
      return evt;
    });

    setEvents(updatedList);
    saveEvents(updatedList);
    const updatedActive = updatedList.find(e => e.id === showAttendeesModal.id);
    if (updatedActive) {
      setShowAttendeesModal(updatedActive);
    }

    addToast("Daftar kehadiran peserta berhasil direkam!", "success");
  };

  // Batch Request Certificate status change to PO
  const handleRequestCertificate = () => {
    if (!showAttendeesModal) return;

    // Check if at least 1 person is listed as present
    const hasPresent = attendees.some(p => p.statusHadir === "hadir");
    if (!hasPresent) {
      addToast("Setidaknya 1 peserta harus ditandai 'Hadir' sebelum dapat mengajukan sertifikat.", "warning");
      return;
    }

    const updatedList = events.map(evt => {
      if (evt.id === showAttendeesModal.id) {
        return {
          ...evt,
          peserta: attendees,
          sertifikatStatus: "pending" as const // set to pending for PO
        };
      }
      return evt;
    });

    setEvents(updatedList);
    saveEvents(updatedList);
    addToast("Pengajuan penerbitan sertifikat dikirim ke PO!", "success");
    setShowAttendeesModal(null);

    // Push system alert notification to PO
    addNotification(
      "Pengajuan Sertifikat Masuk",
      `Panitia mengusulkan penandatanganan sertifikat untuk event '${showAttendeesModal.nama}'.`,
      "Sertifikat",
      ["po"]
    );
  };

  const getStatusBadgeStyles = (status: "aktif" | "selesai" | "pending" | "approved" | "pending_approval" | "rejected") => {
    switch (status) {
      case "approved":
      case "aktif":
        return "bg-emerald-50 text-emerald-700 border-emerald-250";
      case "pending_approval":
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-250 animate-pulse";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-250";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getStatusLabelText = (status: string) => {
    switch (status) {
      case "approved":
      case "aktif":
        return "Disetujui PO";
      case "pending_approval":
      case "pending":
        return "Menunggu Approval PO";
      case "rejected":
        return "Pengajuan Ditolak";
      default:
        return "Arsip";
    }
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* Title Card Panel Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#114E8D] rounded-3xl p-6 text-white border-b-4 border-amber-400 shadow-lg">
        <div>
          <span className="bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded bg-opacity-95 shadow inline-block mb-2">
            Panitia Pelaksana Hub
          </span>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Manajemen Event &amp; Kehadiran</h1>
          <p className="text-[11px] sm:text-xs text-slate-200 mt-1 max-w-sm block leading-relaxed">
            Kelola event kepanitiaan Anda, rancang pengusulan draf baru, validasi absensi presensi peserta, dan ajukan pengesahan sertifikat digital.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="shrink-0 flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border border-white/20 shadow-md active:scale-95"
        >
          <Plus className="w-4.5 h-4.5 stroke-[3px]" /> Buat Event Baru
        </button>
      </div>

      {/* Tabs navigation list */}
      <div className="bg-white border p-1 rounded-2xl flex gap-1.5 w-full sm:w-max shadow-sm">
        <button
          onClick={() => setActiveTab("my-events")}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase ${
            activeTab === "my-events"
              ? "bg-[#114E8D] text-white border-b-2 border-amber-400 shadow-sm"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Event Saya ({myEvents.length})
        </button>
        <button
          onClick={() => setActiveTab("all-active")}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase ${
            activeTab === "all-active"
              ? "bg-[#114E8D] text-white border-b-2 border-amber-400 shadow-sm"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Semua Event Aktif ({allActiveEvents.length})
        </button>
      </div>

      {/* Content Area Rendering */}
      {activeTab === "my-events" ? (
        /* PANITIA EVENTS DIRECTORY CARD GRID */
        myEvents.length === 0 ? (
          <div className="bg-white border rounded-3xl p-16 text-center shadow-xs">
            <div className="bg-slate-50 p-4 border rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3.5 text-slate-400">
              <Plus className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-extrabold text-[#114E8D] uppercase tracking-wide text-xs">Belum Ada Event</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto font-semibold">
              Kepanitiaan Anda belum mendaftarkan draf pengajuan event apapun. Tekan tombol &quot;Buat Event Baru&quot; di atas untuk memulai.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            {myEvents.map(evt => {
              const isPending = evt.status === "pending_approval" || evt.status === "pending";
              const isApproved = evt.status === "approved" || evt.status === "aktif" || evt.status === "selesai";
              const isRejected = evt.status === "rejected";

              return (
                <div 
                  key={evt.id}
                  className="bg-white border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[300px] group"
                >
                  <div className="space-y-3.5">
                    {/* Upper Line Info */}
                    <div className="flex items-center justify-between border-b border-dashed pb-3">
                      <span className="text-[9.5px] font-bold font-mono py-0.5 px-2 bg-slate-100 text-slate-600 border rounded">
                        Kategori: {evt.kategori}
                      </span>
                      <span className={`text-[9.5px] font-black uppercase px-2.5 py-0.5 rounded border select-none ${getStatusBadgeStyles(evt.status)}`}>
                        {getStatusLabelText(evt.status)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold text-[#114E8D] text-xs sm:text-sm uppercase leading-tight line-clamp-2 min-h-[40px] group-hover:text-blue-700 transition-colors">
                      {evt.nama}
                    </h3>

                    {/* Meta widgets */}
                    <div className="grid grid-cols-1 gap-1.5 text-[10.5px] text-slate-500 font-bold">
                      <div className="flex items-center gap-1.5 text-slate-450">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{evt.tanggal} {evt.jam ? `(${evt.jam})` : ""}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-450">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.lokasi}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-450">
                        <Users className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Terdaftar: {evt.kuotaTerisi} / {evt.kuota || evt.kuotaMax} Peserta</span>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Rejection block */}
                  {isRejected && evt.alasanDitolak && (
                    <div className="bg-rose-50 border border-rose-200/50 rounded-2xl p-3.5 text-[11px] leading-relaxed text-slate-600 font-medium italic select-text mt-3.5">
                      <p className="font-black text-rose-800 uppercase not-italic text-[9.5px] mb-1.5 tracking-wider flex items-center gap-1">
                        <ShieldAlert className="w-4 h-4" /> CATATAN PENOLAKAN PO:
                      </p>
                      &quot;{evt.alasanDitolak}&quot;
                    </div>
                  )}

                  {/* Actions footer block */}
                  <div className="grid grid-cols-2 gap-2 pt-4 border-t border-dashed mt-4">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => handleWithdraw(evt.id)}
                          className="w-full border hover:bg-rose-50 hover:text-rose-600 border-rose-200 text-slate-600 font-bold text-[10.5px] uppercase py-2.5 rounded-xl cursor-pointer transition-all h-10 flex items-center justify-center gap-1"
                        >
                          Tarik Draf
                        </button>
                        <button
                          onClick={() => openEditModal(evt)}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10.5px] uppercase py-2.5 rounded-xl h-10 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Sunting Draf
                        </button>
                      </>
                    ) : isApproved ? (
                      <>
                        <button
                          onClick={() => router.push(`/events/${evt.id}`)}
                          className="w-full border hover:bg-slate-50 text-slate-650 font-bold text-[10.5px] uppercase py-2.5 rounded-xl h-10 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          Intip Detail →
                        </button>
                        <button
                          onClick={() => openAttendeesPanel(evt)}
                          className="w-full bg-[#114E8D] hover:bg-blue-700 text-amber-300 hover:text-white border-b-2 border-amber-400 font-black text-[10.5px] uppercase py-2.5 rounded-xl h-10 flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                        >
                          <Users2 className="w-4 h-4" /> Kelola Peserta
                        </button>
                      </>
                    ) : (
                      /* Is Rejected */
                      <button
                        onClick={() => openEditModal(evt)}
                        className="col-span-2 w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-[11px] uppercase py-2.5 rounded-xl h-10 flex items-center justify-center gap-1.5 cursor-pointer border-b-2 border-rose-800 transition-all active:scale-98"
                      >
                        <Edit3 className="w-4 h-4" /> Edit &amp; Ajukan Ulang Ke PO
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* READ ONLY ALL ACTIVE EVENTS LIST */
        allActiveEvents.length === 0 ? (
          <div className="bg-white border rounded-3xl p-16 text-center select-none shadow-sm">
            <p className="text-slate-400 text-xs font-black uppercase">Tidak Ada Data</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {allActiveEvents.map(evt => (
              <div 
                key={evt.id}
                className="bg-white border rounded-3xl p-5 shadow-sm flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <div className="border-b border-dashed pb-3 mb-3">
                    <span className="text-[9px] font-mono font-extrabold py-0.5 px-2 bg-[#114E8D]/5 text-[#114E8D] border border-[#114E8D]/10 rounded select-none">
                      {evt.kategori}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-[#114E8D] text-xs sm:text-sm uppercase leading-tight line-clamp-2">
                    {evt.nama}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 font-mono">
                    PENYELENGGARA: {evt.penyelenggara}
                  </p>
                </div>

                <div className="pt-3 border-t border-dashed mt-4 text-[10.5px] text-slate-500 font-bold flex justify-between items-center bg-slate-50/-5 rounded-b-xl">
                  <span>Slot Sisa: {evt.kuotaTerisi} / {evt.kuota}</span>
                  <button
                    onClick={() => router.push(`/events/${evt.id}`)}
                    className="text-[#114E8D] hover:underline text-[10.5px] shrink-0 font-black"
                  >
                    Kunjungi Sesi →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* CREATE & EDIT FORM MODAL WINDOW */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 select-none">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden border border-slate-200 p-6 flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start border-b pb-3.5">
                <div>
                  <span className="bg-[#114E8D]/10 text-[#114E8D] text-[9.5px] font-black uppercase px-2.5 py-1 rounded block w-max">
                    Evaluasi Proposal Sesi
                  </span>
                  <h2 className="text-slate-800 font-black text-sm uppercase mt-1 leading-none">
                    {editingEvent ? "Sunting Pengajuan Event" : "Ajukan Proposal Event"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 border rounded-full text-slate-450 cursor-pointer active:scale-90 transition-transform"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form elements */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Judul Event */}
                <div className="space-y-1">
                  <label className="text-[9.5px] font-black uppercase text-slate-400 font-mono tracking-widest block">
                    Nama / Judul Event <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    placeholder="Malam Musik Akustik Bersama BEM..."
                    className="w-full text-slate-700 font-semibold p-3.5 bg-slate-50 border border-slate-201 rounded-xl focus:border-[#114E8D] focus:ring-1 focus:ring-[#114E8D] outline-none transition-all placeholder-slate-450 text-[13px] h-11"
                  />
                </div>

                {/* Deskripsi */}
                <div className="space-y-1">
                  <label className="text-[9.5px] font-black uppercase text-slate-400 font-mono tracking-widest block">
                    Deskripsi Singkat <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    value={formDeskripsi}
                    onChange={(e) => setFormDeskripsi(e.target.value)}
                    rows={3}
                    placeholder="Tulis rincian deskripsi singkat perihal cakupan, narasumber, dan benefit keikutsertaan..."
                    className="w-full text-slate-700 font-semibold p-3 bg-slate-50 border border-slate-201 rounded-xl focus:border-[#114E8D] focus:ring-1 focus:ring-[#114E8D] outline-none transition-all placeholder-slate-450 text-[12px] leading-relaxed"
                  />
                </div>

                {/* Category Selector */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black uppercase text-slate-400 font-mono tracking-widest block">
                      Kategori Event <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formKategori}
                      onChange={(e) => setFormKategori(e.target.value)}
                      className="w-full text-slate-705 font-bold p-3 bg-slate-50 border border-slate-201 rounded-xl outline-none text-xs h-11 cursor-pointer"
                    >
                      {["Seminar", "Workshop", "Lomba", "Seni", "Olahraga", "Sosial"].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Kuota */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black uppercase text-slate-400 font-mono tracking-widest block">
                      Maksimal Kuota <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={1200}
                      value={formKuotaMax}
                      onChange={(e) => setFormKuotaMax(parseInt(e.target.value) || 10)}
                      className="w-full text-slate-700 font-bold p-3 bg-slate-50 border border-slate-201 rounded-xl outline-none text-xs h-11"
                    />
                  </div>
                </div>

                {/* Schedule info block */}
                <div className="grid grid-cols-1 gap-3.5 border-t border-dashed pt-3.5">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black uppercase text-slate-400 font-mono tracking-widest block">
                      Tanggal Pelaksanaan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formTanggal}
                      onChange={(e) => setFormTanggal(e.target.value)}
                      className="w-full text-slate-705 font-bold p-3 bg-slate-50 border border-slate-201 rounded-xl outline-none text-xs h-11 h-11"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black uppercase text-slate-400 font-mono tracking-widest block">
                      Waktu Jam Operational <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formJam}
                      onChange={(e) => setFormJam(e.target.value)}
                      placeholder="Contoh: 09.00 - 15.00 WIB"
                      className="w-full text-slate-700 font-semibold p-3.5 bg-slate-50 border border-slate-201 rounded-xl outline-none text-xs h-11"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black uppercase text-slate-400 font-mono tracking-widest block">
                      Tempat / Ruang Lokasi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formLokasi}
                      onChange={(e) => setFormLokasi(e.target.value)}
                      placeholder="Contoh: Lab Komputer Gd. C Lantai 3"
                      className="w-full text-slate-700 font-semibold p-3.5 bg-slate-50 border border-slate-201 rounded-xl outline-none text-xs h-11"
                    />
                  </div>
                </div>

                {/* Submitting operational button */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowFormModal(false)}
                    className="w-full border font-bold text-xs uppercase py-3 rounded-xl hover:bg-slate-5  cursor-pointer h-12 flex items-center justify-center text-slate-550"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#114E8D] hover:bg-blue-700 text-amber-300 hover:text-white border-b-2 border-amber-400 font-black text-xs uppercase py-3 rounded-xl shadow h-12 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    {isSubmitting ? (
                      <span className="border-2 border-amber-400 border-t-transparent w-4.5 h-4.5 rounded-full animate-spin" />
                    ) : (
                      <span>Kirim Proposal →</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MANAGE ATTENDEES DRAWER/MODAL PANEL */}
      <AnimatePresence>
        {showAttendeesModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 select-none animate-fadeIn">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden border border-slate-200 p-6 flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-400/20 text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded block w-max">
                    Pengelola Absensi
                  </span>
                  <h2 className="text-slate-800 font-black text-xs sm:text-sm uppercase mt-1 leading-snug line-clamp-1">
                    ABSENSI: {showAttendeesModal.nama}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAttendeesModal(null)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 border rounded-full text-slate-450 cursor-pointer text-slate-500 mt-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* QR Scanner Activation Panel */}
              {attendees.length > 0 && (
                <div className="bg-amber-50 border border-amber-250 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 select-none">
                  <div className="text-left">
                    <p className="text-xs font-black text-amber-900 uppercase tracking-tight flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" /> Pindai Tiket Presensi Instan
                    </p>
                    <p className="text-[10px] text-amber-800 font-semibold leading-relaxed">
                      Pindai QR Code KTM/e-Tiket milik mahasiswa atau jalankan simulator scanner laser untuk memverifikasi kehadiran secara otomatis.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQrScanner(true)}
                    className="shrink-0 flex items-center gap-1.5 bg-[#114E8D] hover:bg-blue-700 text-amber-305 hover:text-white border-b-2 border-amber-400 font-black text-[10.5px] uppercase py-2.5 px-4 rounded-xl cursor-pointer shadow-xs transition-all active:scale-95 whitespace-nowrap"
                  >
                    <QrCode className="w-4.5 h-4.5" /> Buka Scanner Presensi
                  </button>
                </div>
              )}

              {/* Responsive Participants listing */}
              <div className="flex-1 min-h-[250px] overflow-y-auto">
                {attendees.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 font-bold font-mono">
                    Belum ada mahasiswa yang meregistrasikan diri pada event ini.
                  </div>
                ) : (
                  <>
                    <p className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider mb-2.5">
                      PRESENSI TUGAS DAFTAR HADIR ({attendees.length})
                    </p>

                    {/* Table View Desktop */}
                    <div className="hidden sm:block overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 border-b font-black uppercase font-mono h-10 select-none">
                            <th className="pl-4">No</th>
                            <th>Identitas</th>
                            <th>NIM / Email</th>
                            <th className="pr-4 text-center">Status Kehadiran</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y text-slate-700 font-semibold">
                          {attendees.map((at, idx) => (
                            <tr key={at.nim} className="h-12.5 hover:bg-slate-50">
                              <td className="pl-4 font-mono font-bold text-slate-400">{idx + 1}</td>
                              <td>{at.nama}</td>
                              <td>
                                <div className="font-mono text-slate-500">{at.nim}</div>
                                <div className="text-[10px] font-normal text-slate-400">{at.email}</div>
                              </td>
                              <td className="pr-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleAttendance(at.nim, "hadir")}
                                    className={`px-3 py-1 rounded-lg text-[9.5px] font-black uppercase cursor-pointer transition-all ${
                                      at.statusHadir === "hadir"
                                        ? "bg-emerald-605 bg-emerald-600 text-white shadow-xs"
                                        : "bg-slate-100 text-slate-400 hover:bg-slate-150"
                                    }`}
                                  >
                                    Hadir
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleAttendance(at.nim, "tidak_hadir")}
                                    className={`px-3 py-1 rounded-lg text-[9.5px] font-black uppercase cursor-pointer transition-all ${
                                      at.statusHadir === "tidak_hadir"
                                        ? "bg-rose-600 text-white shadow-xs"
                                        : "bg-slate-100 text-slate-400 hover:bg-slate-150"
                                    }`}
                                  >
                                    Absen
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Card View Mobile */}
                    <div className="block sm:hidden space-y-3">
                      {attendees.map((at, idx) => (
                        <div key={at.nim} className="border rounded-2xl p-4 bg-slate-50/50 space-y-2.5">
                          <div className="flex justify-between items-center border-b border-dashed pb-1.5">
                            <span className="font-mono font-black text-slate-405 text-xs">#{idx + 1}</span>
                            <span className="font-mono text-[10px] bg-slate-100 border px-1.5 py-0.5 rounded text-slate-600">NIM: {at.nim}</span>
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-xs uppercase leading-tight">{at.nama}</p>
                            <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">{at.email}</p>
                          </div>

                          <div className="flex gap-1.5 pt-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleAttendance(at.nim, "hadir")}
                              className={`flex-1 font-black text-[10.5px] uppercase py-2 rounded-xl cursor-pointer ${
                                at.statusHadir === "hadir"
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              Hadir
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleAttendance(at.nim, "tidak_hadir")}
                              className={`flex-1 font-black text-[10.5px] uppercase py-2 rounded-xl cursor-pointer ${
                                at.statusHadir === "tidak_hadir"
                                  ? "bg-rose-600 text-white"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              Absen
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Action Operations Footer */}
              {attendees.length > 0 && (
                <div className="border-t pt-4 space-y-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveAttendees}
                      className="flex-1 border hover:bg-slate-50 border-slate-200 text-slate-650 font-bold text-xs uppercase py-3 rounded-xl transition-all cursor-pointer h-11"
                    >
                      Simpan Kehadiran
                    </button>
                    
                    {/* Render action depending on certificate state */}
                    {showAttendeesModal.sertifikatStatus === "approved" ? (
                      <span className="bg-emerald-100 text-emerald-800 text-center font-black text-[10px] uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center border border-emerald-250 flex-1 h-11">
                        Sertifikat Disetujui ✓
                      </span>
                    ) : showAttendeesModal.sertifikatStatus === "pending" ? (
                      <span className="bg-amber-100 text-amber-800 text-center font-black text-[10px] uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center border border-amber-250 flex-1 h-11 animate-pulse">
                        Menunggu TTD PO...
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestCertificate}
                        className="flex-1 bg-[#114E8D] hover:bg-blue-700 text-amber-300 hover:text-white border-b-2 border-amber-400 font-extrabold text-xs uppercase py-3 rounded-xl shadow transition-all cursor-pointer h-11 flex items-center justify-center gap-1"
                      >
                        <Award className="w-4 h-4 shrink-0" /> Ajukan Sertifikat
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SNEAKY SCAN CERTIFICATE/ATTENDANCE QR SIMULATOR OVERLAY */}
      <AnimatePresence>
        {showQrScanner && showAttendeesModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 select-none">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 text-white rounded-3xl max-w-md w-full overflow-hidden border border-slate-800 shadow-2xl flex flex-col transform"
            >
              {/* Header */}
              <div className="bg-[#114E8D] p-5 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-[#114E8D] to-[#125ca5]">
                <div>
                  <span className="bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                    SCANNER AKTIF
                  </span>
                  <h3 className="font-extrabold uppercase text-xs mt-1 leading-tight line-clamp-1">
                    Absensi: {showAttendeesModal.nama}
                  </h3>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setShowQrScanner(false);
                    setScanSuccessMsg("");
                  }}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Viewport and Simulation */}
              <div className="p-6 flex flex-col items-center gap-5 text-center">
                {/* Webcam viewport simulator */}
                <div className="w-64 h-64 bg-slate-950 border-2 border-slate-800 rounded-2xl relative flex flex-col items-center justify-center overflow-hidden">
                  {/* Visual Scanner Corner brackets */}
                  <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                  
                  {/* Moving red laser line */}
                  <div className="absolute inset-x-4 top-0 h-0.5 bg-red-500 animate-bounce shadow-lg opacity-85" />

                  {scanSuccessMsg ? (
                    <motion.div 
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="space-y-2 p-4 text-center z-10"
                    >
                      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-md">
                        <Check className="w-6 h-6 text-slate-950 stroke-[3.5px]" style={{ strokeWidth: "3.5px" }} />
                      </div>
                      <p className="text-emerald-400 font-mono font-black uppercase tracking-wider text-[11px]">BEEP! SCAN OK</p>
                      <p className="text-xs font-bold text-slate-200 leading-snug">{scanSuccessMsg}</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-2.5 opacity-60">
                      <p className="text-[10px] uppercase font-mono font-bold text-slate-400 h-4 tracking-widest animate-pulse">Arahkan QR Tiket...</p>
                      <div className="border border-slate-800 w-24 h-24 rounded-xl flex items-center justify-center mx-auto border-dashed">
                        <QrCode className="w-8 h-8 text-slate-600 animate-spin" style={{ animationDuration: "12s" }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Simulation Selector Bar */}
                <div className="w-full text-left bg-slate-800/50 rounded-2xl p-4 border border-slate-850 space-y-3">
                  <p className="text-[9.5px] font-mono font-black text-emerald-400 uppercase tracking-widest block font-bold leading-none">
                    SIMULATOR LASER SCANNER TIKET QR
                  </p>
                  
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-bold uppercase text-slate-400">Pilih registran peserta event:</label>
                    <select
                      id="scanner-simulate-student-select"
                      className="w-full text-xs font-bold p-2.5 bg-slate-900 border border-slate-700 rounded-xl outline-none text-white select-none cursor-pointer"
                    >
                      <option value="">-- PILIH MAHASISWA MEMBAWA QR TIKET --</option>
                      {attendees.filter(p => p.statusHadir !== "hadir").map(p => (
                        <option key={p.nim} value={JSON.stringify({ eventId: showAttendeesModal.id, email: p.email, nim: p.nim, nama: p.nama })}>
                          {p.nama} ({p.nim}) - [{p.statusHadir === "menunggu" ? "BELUM ABSEN" : p.statusHadir.toUpperCase()}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const sel = document.getElementById("scanner-simulate-student-select") as HTMLSelectElement | null;
                      if (!sel || !sel.value) {
                        addToast("Harap pilih mahasiswa registran untuk disimulasikan!", "warning");
                        return;
                      }
                      try {
                        const payload = JSON.parse(sel.value);
                        handleScanResult(payload);
                      } catch (e) {
                        addToast("Gagal mengurai payload JSON QR Code.", "error");
                      }
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[10.5px] uppercase py-2.5 rounded-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm font-bold"
                  >
                    <Check className="w-4 h-4 stroke-[3px]" /> SIMULASIKAN SCAN TIKET QR
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-950 border-t border-slate-850 flex">
                <button 
                  type="button"
                  onClick={() => {
                    setShowQrScanner(false);
                    setScanSuccessMsg("");
                  }}
                  className="w-full bg-slate-800 text-slate-300 font-bold text-xs uppercase py-2.5 rounded-xl cursor-pointer"
                >
                  Kembali
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
