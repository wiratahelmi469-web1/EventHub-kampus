// ADDED: High fidelity modular Project Officer Certificate Approval page
"use client";

import React, { useState, useEffect } from "react";
import { getEvents, saveEvents, EventWithCertificate } from "../../../../lib/certificateData";
import { useAuth } from "../../../../context/AuthContext";
import { 
  Award, Building2, Calendar, ShieldCheck, Check, X, AlertTriangle, 
  ArrowLeft, Users, FileText, Send, Eye, ShieldAlert, Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";

export default function PoSertifikatApprovalPage() {
  const router = useRouter();
  const { user, addToast, addNotification } = useAuth();

  // App States
  const [events, setEvents] = useState<EventWithCertificate[]>(() => {
    if (typeof window !== "undefined") return getEvents();
    return [];
  });
  const [selectedEvent, setSelectedEvent] = useState<EventWithCertificate | null>(null);

  // Rejection states
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const pendingEvents = events.filter((evt) => evt.sertifikatStatus === "pending");

  const handleApproveSertifikat = (evt: EventWithCertificate) => {
    const updatedEvents = events.map((item) => {
      if (item.id === evt.id) {
        return {
          ...item,
          sertifikatStatus: "approved" as const,
          sertifikatDisetujuiOleh: user?.nama || "Dr. Ahmad PO"
        };
      }
      return item;
    });

    setEvents(updatedEvents);
    saveEvents(updatedEvents);
    setSelectedEvent(null);

    // Dynamic Central Alerts to Student & Committee
    addNotification(
      "e-Sertifikat Resmi Rilis!",
      `Project Officer menyetujui penerbitan sertifikat untuk event '${evt.nama}'. Unduhan PDF dibuka!`,
      "Sertifikat",
      ["mahasiswa"]
    );

    addNotification(
      "Pengajuan e-Sertifikat Diterima ✓",
      `Sertifikat untuk event '${evt.nama}' sukses ditandatangani PO dan dirilis ke hadirin.`,
      "Sertifikat",
      ["panitia"]
    );

    addToast(`Sertifikat '${evt.nama}' resmi disetujui dan diluncurkan!`, "success");
  };

  const handleTriggerRejectDialog = (evt: EventWithCertificate) => {
    setSelectedEvent(evt);
    setRejectReason("");
    setShowRejectDialog(true);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    if (!rejectReason.trim()) {
      addToast("Harap berikan alasan penolakan sertifikat!", "warning");
      return;
    }

    const updatedEvents = events.map((item) => {
      if (item.id === selectedEvent.id) {
        return {
          ...item,
          sertifikatStatus: "rejected" as const,
          sertifikatAlasanPenolakan: rejectReason.trim()
        };
      }
      return item;
    });

    setEvents(updatedEvents);
    saveEvents(updatedEvents);
    setShowRejectDialog(false);
    setSelectedEvent(null);

    // Notify Panitia
    addNotification(
      "Pengajuan Sertifikat Ditolak ✕",
      `PO menangguhkan rancangan sertifikat '${selectedEvent.nama}'. Catatan: ${rejectReason.trim()}`,
      "Sertifikat",
      ["panitia"]
    );

    addToast(`Pengajuan sertifikat '${selectedEvent.nama}' ditolak. Catatan dikirim ke panitia.`, "error");
  };

  return (
    <div id="po-certificate-review-space" className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/dashboard/po")}
          className="p-2 bg-white rounded-xl border hover:bg-slate-50 text-slate-600 transition-all cursor-pointer flex items-center gap-1 font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke PO Dashboard
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-6.5 h-6.5 text-[#114E8D]" /> Otorisasi Penerbitan e-Sertifikat
        </h1>
        <p className="text-xs text-slate-500 font-bold mt-1 max-w-lg">
          Tinjau rancangan layout panitia, saring validasi keabsahan data presensi hadir mahasiswa, dan bubuhkan tanda tangan hukum digital untuk otorisasi publik.
        </p>
      </div>

      {pendingEvents.length === 0 ? (
        <div className="bg-white border rounded-3xl p-12 text-center text-xs text-slate-400 font-bold font-mono">
          Antrean otorisasi bersih. Tidak ada draf pengajuan sertifikat menunggu persetujuan Anda saat ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main List of Submitted Certificates (Col-span 2) */}
          <div className="lg:col-span-2 space-y-6">
            {pendingEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono font-black text-amber-900 bg-amber-55 px-2.5 py-0.5 rounded border border-amber-200">
                      STATUS: Pengajuan Panitia
                    </span>
                    <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                      <Users className="w-4 h-4 text-slate-400" /> rekap: {evt.peserta.filter(p => p.statusHadir === "hadir").length} Hadir
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-[17px] text-slate-900 leading-tight">
                      {evt.nama}
                    </h3>
                    <p className="text-[11.5px] text-[#114E8D] font-bold mt-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> Penyelenggara: {evt.penyelenggara}
                    </p>
                  </div>

                  {/* Template placeholder preview details */}
                  <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="bg-slate-200 p-3.5 rounded-xl border text-slate-500 font-mono text-[9px] font-black tracking-widest text-center uppercase shrink-0 w-full sm:w-28 h-18 flex items-center justify-center border-dashed select-none">
                      A4 LANDSCAPE
                    </div>
                    <div className="text-left text-slate-500 text-[11px] font-bold leading-relaxed">
                      <p className="text-slate-800 font-extrabold uppercase text-[10px] mb-0.5 flex items-center gap-1 text-[#114E8D]">
                        <FileText className="w-4 h-4" /> Rancangan Template Sertifikat OK
                      </p>
                      Layout background disesuaikan, tanda tangan Project Officer disematkan di footer ttd koordinat tengah-bawah.
                    </div>
                  </div>

                  {/* List of Attendees parsed inside this event */}
                  <div className="space-y-2 select-none">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Hadirin Tervalidasi ({evt.peserta.filter(p => p.statusHadir === "hadir").length} siswa)</p>
                    <div className="max-h-28 overflow-y-auto border rounded-2xl bg-slate-50 p-2.5 divide-y divide-slate-100">
                      {evt.peserta.filter(p => p.statusHadir === "hadir").map((p) => (
                        <div key={p.nim} className="py-1.5 flex justify-between items-center text-[10.5px] font-bold">
                          <span className="text-slate-800">{p.nama} <span className="font-mono text-slate-450 font-medium">({p.nim})</span></span>
                          <span className="text-emerald-600 font-mono text-[9px] uppercase">Hadir ✓</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submittal Actions */}
                <div className="px-6 py-4 bg-slate-50 border-t flex gap-2 justify-end text-xs">
                  <button
                    onClick={() => handleTriggerRejectDialog(evt)}
                    className="border border-rose-500 text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl font-bold uppercase cursor-pointer"
                  >
                    Tangguhkan / Tolak
                  </button>

                  <button
                    onClick={() => handleApproveSertifikat(evt)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4" /> Setujui & Rilis Sertifikat
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Guidelines Sidebar (Col-span 1) */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border p-5 shadow-sm space-y-4 select-none">
              <h3 className="font-extrabold text-[12.5px] text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Panduan Otoritas Hukum PO
              </h3>
              <div className="text-[11px] leading-relaxed text-slate-600 font-medium space-y-3">
                <p>
                  Sebagai penanggung jawab utama (Project Officer), validasi hukum sertifikat berada sepenuhnya di bawah persetujuan digital Anda.
                </p>
                <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl text-rose-900 leading-snug">
                  <strong>Penting:</strong> Menekan tombol setujui akan membuat berkas secara permanen tersedia di halaman draf mahasiswa aktif.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON PROMPT DIALOG */}
      <AnimatePresence>
        {showRejectDialog && selectedEvent && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[100] overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="bg-[#114E8D] text-white p-5 flex justify-between items-center border-b-[3.5px] border-amber-400">
                <h3 className="font-black text-sm uppercase tracking-tight">Form Penangguhan Draf</h3>
                <button onClick={() => setShowRejectDialog(false)} className="hover:bg-white/10 p-1 rounded-full text-white/50 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRejectSubmit} className="p-6 space-y-4 text-xs font-bold leading-none">
                <div>
                  <label className="block text-slate-500 uppercase font-bold text-[10px] tracking-wider mb-1.5">Alasan Penolakan / Catatan Perbaikan</label>
                  <textarea
                    required
                    rows={4}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Contoh: Typo pada logo humas di header, dan daftar rekap nama NIM Budi (NIM-01) salah."
                    className="w-full border rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-rose-500 font-semibold bg-white"
                  ></textarea>
                </div>

                <div className="bg-rose-50 border border-rose-150 p-3 rounded-2xl text-rose-900 leading-snug font-medium text-[10.5px]">
                  <strong>Catatan:</strong> Pesan perbaikan ini akan langsung terkirim dan terpampang di dasbor kepanitiaan pelaksana.
                </div>

                <div className="pt-4 border-t flex gap-2 justify-end text-xs">
                  <button
                    type="button"
                    onClick={() => setShowRejectDialog(false)}
                    className="border px-4 py-2 rounded-xl font-bold hover:bg-slate-50 uppercase text-slate-500 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl font-black uppercase tracking-wider cursor-pointer"
                  >
                    Kirim Penolakan
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
