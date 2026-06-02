// CREATED: app/dashboard/po/events/page.tsx
// FIXED: 404 - /dashboard/po/events
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { getEvents, saveEvents, EventWithCertificate } from "../../../../lib/certificateData";
import { 
  ShieldAlert, ShieldCheck, Check, X, Calendar, MapPin, Building2, Ticket, 
  Search, Filter, Layers, Inbox, Award, Sparkles, CheckCircle2, ThumbsUp 
} from "lucide-react";

export default function POEventsPage() {
  const router = useRouter();
  const { user, addToast, addNotification } = useAuth();

  // Guard account
  useEffect(() => {
    if (user && user.role !== "po") {
      router.replace(`/dashboard/${user.role === "staf" ? "staff" : user.role}`);
    }
  }, [user, router]);

  // States
  const [events, setEvents] = useState<EventWithCertificate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  if (!user || user.role !== "po") {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center font-mono text-xs text-slate-400 font-bold tracking-widest uppercase animate-pulse">
        Memverifikasi Akun...
      </div>
    );
  }

  // Stats Counters
  const totalEvents = events.length;
  const approvedCount = events.filter(e => e.status === "approved" || e.status === "selesai").length;
  const pendingCount = events.filter(e => e.status === "pending_approval" || e.status === "pending").length;
  const selesaiCount = events.filter(e => e.eventStatus === "selesai" || e.status === "selesai").length;

  const categories = ["Semua", "Seminar", "Workshop", "Lomba", "Seni", "Olahraga", "Sosial"];

  // Apply search query and category filters
  const filteredEvents = events.filter(evt => {
    const catMatches = categoryFilter === "Semua" || evt.kategori.toLowerCase() === categoryFilter.toLowerCase();
    const searchMatches = 
      evt.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.penyelenggara.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatches && searchMatches;
  });

  // Action: Mark Event Completed (Selesai)
  const handleMarkCompleted = (evtId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menyelesaikan event ini secara resmi? Keadaan ini menandai kegiatan tuntas.")) {
      return;
    }

    const updated = events.map(evt => {
      if (evt.id === evtId) {
        return {
          ...evt,
          eventStatus: "selesai" as const
        };
      }
      return evt;
    });

    setEvents(updated);
    saveEvents(updated);
    addToast("Event berhasil diselesaikan! Hubungi panitia untuk input kehadiran & ajukan sertifikat.", "success");
  };

  // Action: Sign certificates / Approve Certificates
  const handleSignCertificates = (evtId: string) => {
    const updated = events.map(evt => {
      if (evt.id === evtId) {
        return {
          ...evt,
          sertifikatStatus: "approved" as const,
          eventStatus: "selesai" as const, // ensure event is complete
          status: "selesai" as const,     // update overall process
          peserta: evt.peserta.map(p => ({
            ...p,
            statusHadir: p.statusHadir === "menunggu" ? "tidak_hadir" : p.statusHadir // complete default status
          }))
        };
      }
      return evt;
    });

    setEvents(updated);
    saveEvents(updated);
    addToast("Sertifikat digital untuk seluruh peserta terdaftar 'Hadir' telah ditandatangani PO! ✍️", "success");

    const targetEvent = events.find(e => e.id === evtId);
    if (targetEvent) {
      addNotification(
        "Sertifikat Digital Diterbitkan",
        `Sertifikat partisipasi untuk event '${targetEvent.nama}' resmi disahkan oleh Project Officer!`,
        "Sertifikat",
        ["mahasiswa", "panitia"]
      );
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "approved":
      case "selesai":
        return "bg-emerald-50 text-emerald-700 border-emerald-250";
      case "pending_approval":
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-250 animate-pulse";
      case "rejected":
        return "bg-rose-50 text-rose-750 border-rose-250";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getStatusLabelText = (status: string) => {
    switch (status) {
      case "approved":
        return "Disetujui PO";
      case "selesai":
        return "Selesai";
      case "pending_approval":
      case "pending":
        return "Pending PO";
      case "rejected":
        return "Ditolak";
      default:
        return "Arsip";
    }
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      {/* Title block */}
      <div className="bg-[#114E8D] rounded-3xl p-6 text-white border-b-4 border-amber-400 shadow">
        <span className="bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded bg-opacity-95 shadow inline-flex items-center gap-1.5 mb-2.5">
          <ShieldCheck className="w-3.5 h-3.5" /> PO OVERVIEW COCKPIT
        </span>
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Manajemen Seluruh Sesi Event</h1>
        <p className="text-[11px] sm:text-xs text-slate-200 mt-1 max-w-xl font-medium leading-relaxed">
          Kilas pantau status kelayakan, selesaikan sesi berkala, dan tandatangani otentikasi dokumen sertifikat partisipasi mahasiswa agar siap diunduh.
        </p>
      </div>

      {/* Stats Board Row - 2 columns mobile, 4 columns desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total stats info */}
        <div className="bg-white rounded-2xl border p-4.5 shadow-sm space-y-1">
          <p className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-wider">TOTAL PENGAJUAN</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-slate-800">{totalEvents}</span>
            <Layers className="w-5 h-5 text-slate-300" />
          </div>
        </div>

        {/* Action stats info */}
        <div className="bg-white rounded-2xl border p-4.5 shadow-sm space-y-1">
          <p className="text-[9px] font-mono font-black text-[#114E8D] uppercase tracking-wider">DISETUJUI (APPROVED)</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-slate-800">{approvedCount}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* Pending stats info */}
        <div className="bg-white rounded-2xl border p-4.5 shadow-sm space-y-1">
          <p className="text-[9px] font-mono font-black text-amber-500 uppercase tracking-wider">PENDING REVIEW</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-slate-800">{pendingCount}</span>
            <Inbox className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
        </div>

        {/* Finished stats info */}
        <div className="bg-white rounded-2xl border p-4.5 shadow-sm space-y-1">
          <p className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-wider">SESI SELESAI</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-slate-800">{selesaiCount}</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Search and Category Filters panel */}
      <div className="bg-white rounded-2xl border p-4 shadow-sm space-y-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Event ID, nama, atau kepanitiaan pelaksana..."
            className="w-full text-slate-700 font-medium pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#114E8D] focus:ring-1 focus:ring-[#114E8D] outline-none transition-all placeholder-slate-400 text-xs h-11"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none no-scrollbar">
          <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-widest mr-1 shrink-0">
            Kategori:
          </span>
          <div className="flex gap-1.5 shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-[#114E8D] text-white border-b-2 border-amber-400 shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-605 text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive list of events */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white border rounded-3xl p-16 text-center shadow-sm select-none">
          <p className="text-slate-405 font-black text-xs uppercase text-slate-400">Tidak ada pengajuan yang cocok.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card List (Default on screens < sm) */}
          <div className="block sm:hidden space-y-4 select-none">
            {filteredEvents.map((evt, idx) => {
              const hasPendingCert = evt.sertifikatStatus === "pending";
              const isApprovedEvent = evt.status === "approved";
              const currentStatus = evt.eventStatus || "buka";

              return (
                <div key={evt.id} className="bg-white border rounded-3xl p-5 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-dashed pb-2">
                    <span className="font-mono text-xs font-black text-slate-400">#{idx + 1}</span>
                    <span className="font-mono font-bold text-[10.5px] bg-slate-50 px-1.5 py-0.5 border rounded text-slate-600">{evt.id}</span>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono font-black text-amber-500 uppercase tracking-wider">{evt.kategori}</span>
                    <h4 className="font-extrabold text-[#114E8D] text-xs uppercase leading-tight mt-0.5">{evt.nama}</h4>
                    <p className="text-[10.5px] text-slate-500 font-bold mt-1 font-mono">{evt.penyelenggara}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-1 text-[10.5px] text-slate-500 font-semibold border-t pt-2 border-dashed">
                    <p>Tanggal: <span className="font-mono font-semibold">{evt.tanggal}</span></p>
                    <p>Status: <span className={`px-2 py-0.5 rounded border text-[9.5px] font-black uppercase ${getStatusBadgeStyles(evt.status)}`}>{getStatusLabelText(evt.status)}</span></p>
                  </div>

                  {/* Operational actions inside cards */}
                  <div className="pt-2 border-t mt-3 border-dashed">
                    {hasPendingCert ? (
                      <button
                        onClick={() => handleSignCertificates(evt.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase py-2.5 rounded-xl border-b-2 border-emerald-850 cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                      >
                        <Award className="w-4.5 h-4.5 shrink-0" /> TTD Sertifikat ✓
                      </button>
                    ) : isApprovedEvent && currentStatus !== "selesai" ? (
                      <button
                        onClick={() => handleMarkCompleted(evt.id)}
                        className="w-full bg-[#114E8D] hover:bg-blue-700 text-amber-300 hover:text-white border-b-2 border-amber-400 font-black text-[11px] uppercase py-2.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        Selesaikan Acara ✓
                      </button>
                    ) : (
                      <p className="text-center text-[10.5px] text-slate-400 font-bold font-mono py-1.5 uppercase tracking-wider">
                        Sesi Terkunci
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Tabular View (Hidden on mobile) */}
          <div className="hidden sm:block overflow-x-auto border border-slate-200/60 bg-white rounded-3xl shadow-sm">
            <table className="w-full text-left border-collapse text-[11px] font-semibold text-slate-700">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b font-black font-mono uppercase h-11 select-none">
                  <th className="pl-5">No</th>
                  <th>ID</th>
                  <th>Nama Event</th>
                  <th>Kategori</th>
                  <th>Penyelenggara / Tanggal</th>
                  <th>Status</th>
                  <th className="pr-5 text-center">Tindakan PO</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredEvents.map((evt, idx) => {
                  const hasPendingCert = evt.sertifikatStatus === "pending";
                  const isApprovedEvent = evt.status === "approved";
                  const currentStatus = evt.eventStatus || "buka";

                  return (
                    <tr key={evt.id} className="h-14 hover:bg-slate-50">
                      <td className="pl-5 font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="font-mono font-extrabold text-[#114E8D]">{evt.id}</td>
                      <td className="max-w-[180px]">
                        <p className="font-extrabold text-[#114E8D] uppercase leading-tight line-clamp-1">{evt.nama}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1 italic font-medium font-serif mt-0.5">
                          &quot;{evt.deskripsi || "Detail deskripsi singkat."}&quot;
                        </p>
                      </td>
                      <td>
                        <span className="text-[10px] font-black uppercase text-purple-700 font-mono py-0.5 px-2 bg-purple-50 rounded border border-purple-250">
                          {evt.kategori}
                        </span>
                      </td>
                      <td>
                        <p className="font-bold text-slate-650">{evt.penyelenggara}</p>
                        <p className="text-[10px] text-slate-400 font-mono font-semibold mt-0.5">{evt.tanggal}</p>
                      </td>
                      <td>
                        <span className={`px-2.5 py-0.5 rounded border text-[9.5px] font-black uppercase ${getStatusBadgeStyles(evt.status)}`}>
                          {getStatusLabelText(evt.status)}
                        </span>
                      </td>
                      <td className="pr-5 text-center">
                        {hasPendingCert ? (
                          <button
                            onClick={() => handleSignCertificates(evt.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10.5px] uppercase py-2 px-3.5 rounded-xl border-b-2 border-emerald-800 cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 mx-auto"
                          >
                            <Award className="w-4 h-4 shrink-0" /> TTD Sertifikat ✓
                          </button>
                        ) : isApprovedEvent && currentStatus !== "selesai" ? (
                          <button
                            onClick={() => handleMarkCompleted(evt.id)}
                            className="bg-[#114E8D] hover:bg-blue-700 text-amber-300 hover:text-white border-b-2 border-amber-400 font-black text-[10.5px] uppercase py-2 px-3 rounded-xl transition-all h-8.5 cursor-pointer shadow-sm active:scale-95 mx-auto"
                          >
                            Selesaikan Acara ✓
                          </button>
                        ) : (
                          <span className="text-slate-400 font-mono text-[10px] font-bold uppercase tracking-wider block">
                            Arsip Terkunci
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

    </div>
  );
}
