// CREATED: app/dashboard/po/approval/page.tsx
// FIXED: 404 - /dashboard/po/approval
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { getEvents, saveEvents, EventWithCertificate } from "../../../../lib/certificateData";
import { 
  ShieldAlert, ShieldCheck, Check, X, AlertTriangle, HelpCircle, 
  ChevronDown, ChevronUp, Calendar, MapPin, Building2, Ticket, MessageSquare 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ExtendedEvent extends EventWithCertificate {
  alasanDitolak?: string;
  tanggalDiproses?: string;
}

export default function POApprovalPage() {
  const router = useRouter();
  const { user, addToast, addNotification } = useAuth();

  // App States
  const [events, setEvents] = useState<ExtendedEvent[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "processed">("pending");
  const [processedFilter, setProcessedFilter] = useState<"semua" | "approved" | "rejected">("semua");

  // Rejection Dialog State
  const [selectedEventToReject, setSelectedEventToReject] = useState<ExtendedEvent | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Accordion state for reasons
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  useEffect(() => {
    // Sync lists from localStorage
    setEvents(getEvents() as ExtendedEvent[]);
  }, []);

  // Secure Guard: only PO is allowed
  const isPO = user && user.role === "po";

  if (!isPO) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="bg-rose-100 p-4 rounded-full border border-rose-250 text-rose-650 mb-4 animate-bounce">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h1 className="text-xl font-black text-rose-800 uppercase tracking-wider">Akses Ditolak</h1>
        <p className="text-slate-500 text-xs mt-2 max-w-sm font-medium">
          Maaf, halaman ini dilindungi oleh kunci keamanan operasional dan hanya dapat diakses oleh akun dengan peran <b>Project Officer (PO)</b>.
        </p>
        <button
          onClick={() => router.push(user ? `/dashboard/${user.role === "staf" ? "staff" : user.role}` : "/")}
          className="mt-6 bg-[#114E8D] hover:bg-blue-700 text-amber-300 font-extrabold text-xs px-5 py-3 rounded-xl border-b-2 border-amber-400 cursor-pointer active:scale-95 transition-all uppercase"
        >
          Kembali Ke Beranda Saya
        </button>
      </div>
    );
  }

  // Pending Counter
  const pendingEvents = events.filter(e => e.status === "pending_approval" || e.status === "pending");
  const processedEvents = events.filter(e => e.status === "approved" || e.status === "rejected" || e.status === "selesai" || e.status === "aktif");

  // Filter processed events lists
  const filteredProcessed = processedEvents.filter(e => {
    if (processedFilter === "semua") return true;
    if (processedFilter === "approved") return e.status === "approved" || e.status === "aktif" || e.status === "selesai";
    if (processedFilter === "rejected") return e.status === "rejected";
    return true;
  });

  const handleApprove = (evt: ExtendedEvent) => {
    const todayStr = new Date().toISOString().substring(0, 10);
    const updated = events.map(item => {
      if (item.id === evt.id) {
        return {
          ...item,
          status: "approved" as const,
          eventStatus: item.eventStatus || "buka" as const, // default to open registration
          tanggalDiproses: todayStr
        };
      }
      return item;
    });

    setEvents(updated);
    saveEvents(updated);

    addToast(`Event '${evt.nama}' berhasil disetujui! 🚀`, "success");

    // Push local notification to panel
    addNotification(
      "Event Disetujui!",
      `Pengajuan event '${evt.nama}' disetujui oleh Project Officer. Sesi publik segera dibuka.`,
      "Persetujuan",
      ["panitia", "staf"]
    );
  };

  const handleRejectClick = (evt: ExtendedEvent) => {
    setSelectedEventToReject(evt);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventToReject || !rejectionReason.trim()) {
      addToast("Harap isi alasan penolakan secara mendetail.", "error");
      return;
    }

    setIsSubmitting(true);
    const todayStr = new Date().toISOString().substring(0, 10);

    const updated = events.map(item => {
      if (item.id === selectedEventToReject.id) {
        return {
          ...item,
          status: "rejected" as const,
          eventStatus: "tutup" as const,
          alasanDitolak: rejectionReason,
          tanggalDiproses: todayStr
        };
      }
      return item;
    });

    setTimeout(() => {
      setEvents(updated);
      saveEvents(updated);
      setIsSubmitting(false);
      setShowRejectModal(false);

      addToast(`Event '${selectedEventToReject.nama}' telah ditolak.`, "warning");

      // Push notification
      addNotification(
        "Event Ditolak",
        `Pengajuan event '${selectedEventToReject.nama}' ditolak karena: "${rejectionReason}". Silakan perbaiki draf.`,
        "Persetujuan",
        ["panitia"]
      );
    }, 500);
  };

  const toggleExpandReason = (id: string) => {
    setExpandedEventId(expandedEventId === id ? null : id);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Title Panel */}
      <div className="bg-[#114E8D] rounded-3xl p-6 text-white border-b-4 border-amber-400 shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded bg-opacity-95 shadow inline-flex items-center gap-1.5 mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Project Officer Command Space
          </span>
          <h1 className="text-xl sm:text-2xl font-black uppercase">Approval Pengajuan Event</h1>
          <p className="text-[11px] sm:text-xs text-slate-200 mt-1 max-w-xl font-medium leading-relaxed">
            Halaman khusus evaluasi proposal kegiatan kepanitiaan. Setujui publikasi atau tolak pengajuan kembali ke panitia pelaksana dengan catatan perbaikan resmi.
          </p>
        </div>

        {/* Pending Counter Panel */}
        <div className="bg-white/10 border border-white/20 p-4 rounded-2xl flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-black text-sm">
            {pendingEvents.length}
          </div>
          <div>
            <p className="text-[10px] text-amber-300 font-mono font-black uppercase tracking-wider">Antrean Pending</p>
            <p className="text-xs font-bold text-white mt-0.5">Menunggu Evaluasi</p>
          </div>
        </div>
      </div>

      {/* Navigation tabs row */}
      <div className="bg-white border p-1 rounded-2xl flex gap-1.5 sm:w-max shadow-sm">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase ${
            activeTab === "pending"
              ? "bg-[#114E8D] text-white border-b-2 border-amber-400 shadow-sm"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Menunggu Approval ({pendingEvents.length})
        </button>
        <button
          onClick={() => setActiveTab("processed")}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase ${
            activeTab === "processed"
              ? "bg-[#114E8D] text-white border-b-2 border-amber-400 shadow-sm"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Sudah Diproses ({processedEvents.length})
        </button>
      </div>

      {/* Main Tab Panels Content */}
      <div className="space-y-6">
        {activeTab === "pending" ? (
          /* PENDING FLOW VIEW */
          pendingEvents.length === 0 ? (
            <div className="bg-white border rounded-3xl p-16 text-center select-none shadow-sm">
              <div className="w-16 h-16 bg-emerald-50 rounded-full border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-500">
                <Check className="w-8 h-8 stroke-[3.5px]" />
              </div>
              <h3 className="font-extrabold text-[#114E8D] uppercase tracking-wide text-xs">Pekerjaan Selesai!</h3>
              <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto font-semibold">
                Tidak ada event yang menunggu approval PO saat ini. Semua pengajuan telah diproses secara profesional.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingEvents.map(evt => (
                <div 
                  key={evt.id} 
                  className="bg-white border rounded-3xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group h-[320px]"
                >
                  <div>
                    {/* Header line detail of card pending */}
                    <div className="flex items-center justify-between border-b pb-3 mb-3.5 border-dashed">
                      <span className="text-[10px] font-mono font-bold uppercase py-0.5 px-2 bg-purple-50 text-purple-700 border border-purple-250 rounded">
                        Kategori: {evt.kategori}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 font-bold block">
                        DIAJUKAN: {evt.tanggalDiajukan || "Baru saja"}
                      </span>
                    </div>

                    {/* Event name banner */}
                    <h3 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-2 uppercase group-hover:text-[#114E8D] transition-colors min-h-[40px]">
                      {evt.nama}
                    </h3>

                    {/* Deskripsi */}
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 font-semibold italic">
                      &quot;{evt.deskripsi || "Tidak ada deskripsi detail tambahan."}&quot;
                    </p>

                    {/* Meta info block */}
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-500 font-bold font-mono mt-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.tanggal}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.penyelenggara}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <Ticket className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Estimasi Kuota: {evt.kuota || evt.kuotaMax} Kursi</span>
                      </div>
                    </div>
                  </div>

                  {/* Operational buttons row */}
                  <div className="grid grid-cols-2 gap-2 pt-4 border-t border-dashed mt-4">
                    <button
                      onClick={() => handleRejectClick(evt)}
                      className="w-full border-b border hover:bg-rose-50 text-slate-650 hover:text-rose-650 font-bold text-[11px] uppercase py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 h-10 active:scale-95"
                    >
                      <X className="w-4 h-4 text-rose-500 stroke-[3px]" /> Tolak
                    </button>
                    <button
                      onClick={() => handleApprove(evt)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] uppercase py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 h-10 shadow active:scale-95 border-b-2 border-emerald-800"
                    >
                      <Check className="w-4 h-4 stroke-[3px]" /> Approve ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* PROCESSED ARCHIVES VIEW */
          <div className="space-y-4">
            {/* Filter buttons internally inside tab */}
            <div className="bg-slate-100 p-1.5 border rounded-2xl flex gap-1.5 w-full sm:w-max shrink-0 shadow-inner">
              {(["semua", "approved", "rejected"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setProcessedFilter(f)}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-[10.5px] font-black uppercase cursor-pointer transition-all ${
                    processedFilter === f
                      ? "bg-white text-slate-800 shadow"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {f === "semua" ? "Semua Proses" : f === "approved" ? "Disetujui" : "Ditolak"}
                </button>
              ))}
            </div>

            {filteredProcessed.length === 0 ? (
              <div className="bg-white border rounded-3xl p-16 text-center shadow-sm">
                <p className="text-slate-450 font-black text-xs uppercase">Arsip Kosong</p>
                <p className="text-xs text-slate-400 max-w-xs mt-1 mx-auto font-semibold">
                  Belum ada event dengan kriteria pencarian approval ini saat ini.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProcessed.map(evt => {
                  const isApproved = evt.status === "approved" || evt.status === "aktif" || evt.status === "selesai";
                  const isReject = evt.status === "rejected";

                  return (
                    <div 
                      key={evt.id}
                      className="bg-white border rounded-2xl p-4.5 sm:p-5 shadow-sm space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dashed pb-3">
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold font-mono py-0.5 px-2 bg-slate-100 text-slate-600 border rounded select-none mr-2">
                            {evt.kategori}
                          </span>
                          <span className="text-[10px] font-bold text-[#114E8D] font-mono">
                            ID: {evt.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isApproved ? (
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-emerald-250 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 stroke-[3.5px]" /> Disetujui
                            </span>
                          ) : (
                            <span className="bg-rose-50 text-rose-700 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-rose-250 flex items-center gap-1">
                              <X className="w-3.5 h-3.5 stroke-[3.5px]" /> Ditolak
                            </span>
                          )}
                          <span className="text-[9px] font-mono text-slate-400 font-bold shrink-0">
                            PROSES: {evt.tanggalDiproses || "Selesai"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm uppercase leading-tight">
                          {evt.nama}
                        </h4>
                        <p className="text-[10.5px] font-bold text-slate-450 mt-1">
                          Penyelenggara: {evt.penyelenggara} • Diajukan Oleh: <code className="font-normal bg-slate-50 px-1 py-0.5 border rounded text-slate-600">{evt.pengajuEmail || "panitia@kampus.ac.id"}</code>
                        </p>
                      </div>

                      {/* Accordion area if rejected */}
                      {isReject && (
                        <div className="bg-rose-400/5 border border-rose-200/40 rounded-xl overflow-hidden mt-2">
                          <button
                            onClick={() => toggleExpandReason(evt.id)}
                            className="w-full text-left p-3 flex justify-between items-center text-[11px] font-black uppercase text-rose-800 bg-rose-50/20"
                          >
                            <span className="flex items-center gap-1.5">
                              <MessageSquare className="w-4 h-4 text-rose-600" /> Lihat Alasan Penolakan
                            </span>
                            {expandedEventId === evt.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>

                          <AnimatePresence>
                            {expandedEventId === evt.id && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0 }}
                                className="border-t border-rose-200/20 p-4 text-[11px] leading-relaxed text-slate-600 font-medium italic bg-rose-50/10"
                              >
                                &quot;{evt.alasanDitolak || "Alasan penolakan tidak didokumentasikan."}&quot;
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reject Modal Window dialog box */}
      <AnimatePresence>
        {showRejectModal && selectedEventToReject && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 select-none">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden border border-slate-200 p-6 flex flex-col gap-4 max-h-[90vh] sm:max-h-none overflow-y-auto"
            >
              <div className="flex justify-between items-start">
                <div className="bg-rose-100 text-rose-800 p-2 rounded-xl border border-rose-200 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 border rounded-full text-slate-400 cursor-pointer active:scale-90 transition-transform"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              <div>
                <h3 className="font-extrabold text-[#114E8D] uppercase tracking-wide text-xs">Arsip Rejection Pengajuan</h3>
                <h2 className="text-slate-800 font-black text-xs uppercase mt-1 leading-snug">
                  TOLAK: {selectedEventToReject.nama}
                </h2>
              </div>

              {/* Form elements */}
              <form onSubmit={handleConfirmReject} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-widest block">
                    Alasan Penolakan (Catatan Perbaikan Panitia) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    placeholder="Contoh: Lampiran proposal RAB kurang lengkap atau rincian kuota melebihi kapasitas sarana prasarana gedung."
                    className="w-full text-slate-700 font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#114E8D] focus:ring-1 focus:ring-[#114E8D] outline-none transition-all placeholder-slate-400 text-xs leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowRejectModal(false)}
                    className="w-full border font-bold text-xs uppercase py-3 rounded-xl hover:bg-slate-50 cursor-pointer active:scale-95 transition-all text-slate-605 h-12"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !rejectionReason.trim()}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase py-3 rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer h-12 active:scale-95 border-b-2 border-rose-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="border-2 border-white border-t-transparent w-4.5 h-4.5 rounded-full animate-spin" />
                    ) : (
                      <span>Tolak Event ✗</span>
                    )}
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
