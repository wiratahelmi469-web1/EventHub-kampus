// ADDED: High fidelity modular Project Officer Dashboard Page
"use client";

import React, { useState, useEffect } from "react";
import { getEvents, EventWithCertificate } from "../../../lib/certificateData";
import { useAuth } from "../../../context/AuthContext";
import { 
  Building2, Calendar, Users, Award, ShieldAlert, Check, X, 
  ArrowRight, BarChart3, HelpCircle, Sparkles, Star, ClipboardCheck, Percent 
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

export default function PoDashboardPage() {
  const router = useRouter();
  const { user, addToast, addNotification } = useAuth();

  // App States
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

  const handleApproveApplication = (appId: string) => {
    const updatedApps = comApplications.map((app) => {
      if (app.id === appId) {
        // Trigger notification to student
        addNotification(
          "Penerimaan Panitia Disetujui!",
          `Selamat! Aplikasi Anda untuk divisi ${app.selectedDivision} pada event ${app.eventName} disetujui Project Officer.`,
          "Tugas",
          ["mahasiswa"]
        );

        return { ...app, status: "approved" as const };
      }
      return app;
    });

    setComApplications(updatedApps);
    localStorage.setItem("eventhub_committee_applications", JSON.stringify(updatedApps));
    addToast("Aplikasi pendaftaran panitia disetujui!", "success");
  };

  const handleRejectApplication = (appId: string) => {
    const updatedApps = comApplications.map((app) => {
      if (app.id === appId) {
        addNotification(
          "Aplikasi Panitia Ditangguhkan",
          `Aplikasi Anda untuk ${app.selectedDivision} pada event ${app.eventName} ditangguhkan oleh PO.`,
          "Tugas",
          ["mahasiswa"]
        );
        return { ...app, status: "rejected" as const };
      }
      return app;
    });

    setComApplications(updatedApps);
    localStorage.setItem("eventhub_committee_applications", JSON.stringify(updatedApps));
    addToast("Aplikasi pendaftaran panitia ditolak.", "error");
  };

  // Graphical metrics calculations
  const totalEvents = events.length;
  const activeEvents = events.filter((e) => e.status === "aktif").length;
  const pendingCertsCount = events.filter((e) => e.sertifikatStatus === "pending").length;

  const totalCapacity = events.reduce((sum, e) => sum + e.kuota, 0);
  const totalRegistered = events.reduce((sum, e) => sum + e.kuotaTerisi, 0);
  const averageOccupancy = totalCapacity > 0 ? Math.round((totalRegistered / totalCapacity) * 100) : 0;

  const pendingApplications = comApplications.filter((app) => app.status === "pending");

  return (
    <div id="po-dashboard-container" className="space-y-6">
      {/* Executive welcomes */}
      <div className="bg-gradient-to-br from-[#114E8D] to-[#125ea5] text-white rounded-3xl p-6 md:p-8 shadow-md border border-white/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full mb-3">
              <Star className="w-3.5 h-3.5 fill-current" /> Project Officer (PO) Principal
            </div>
            <h1 className="text-2xl md:text-3.5xl font-black tracking-tight leading-none text-white">
              Sistem Koordinasi & Evaluasi Utama
            </h1>
            <p className="text-slate-200 text-xs md:text-sm max-w-lg mt-2 leading-relaxed">
              Persetujuan proposal berkas kepanitiaan, otorisasi penerbitan e-Sertifikat lulus, dan monitor dashboard kuota kehadiran secara eksekutif. Hanay Anda yang memiliki tanda tangan hukum sertifikat digital.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard/po/sertifikat")}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md inline-flex"
          >
            <Award className="w-4 h-4 fill-current" /> Antrean Approval Sertifikat ({pendingCertsCount})
          </button>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 font-bold text-[150px] select-none leading-none -mb-10 -mr-6 pointer-events-none">
          PO
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border shadow-sm text-left">
          <p className="text-slate-400 text-[9px] uppercase font-mono font-bold tracking-wider">Total Event Terkelola</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{totalEvents}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border shadow-sm text-left">
          <p className="text-slate-400 text-[9px] uppercase font-mono font-bold tracking-wider">Event Aktif</p>
          <p className="text-2xl font-black text-[#114E8D] mt-1">{activeEvents}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border shadow-sm text-left">
          <p className="text-slate-400 text-[9px] uppercase font-mono font-bold tracking-wider">Tingkat Okupansi Kuota</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-800">{averageOccupancy}%</span>
            <span className="text-[10px] text-slate-400 font-bold">rata-rata</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border shadow-sm text-left">
          <p className="text-slate-400 text-[9px] uppercase font-mono font-bold tracking-wider">Menunggu TTD Sertifikat</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{pendingCertsCount}</p>
        </div>
      </div>

      {/* Graphical occupied report + Quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Occupancy Chart Section (Col-span 2) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-4.5 h-4.5 text-[#114E8D]" /> Diagram Okupansi Kuota Kehadiran
          </h2>

          <div className="space-y-4 select-none">
            {events.map((evt) => {
              const rsvpedPercentage = evt.kuota > 0 ? Math.round((evt.kuotaTerisi / evt.kuota) * 100) : 0;
              return (
                <div key={evt.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold leading-none">
                    <span className="text-slate-800 truncate max-w-[240px]">{evt.nama}</span>
                    <span className="text-slate-500">{evt.kuotaTerisi} / {evt.kuota} ({rsvpedPercentage}%)</span>
                  </div>
                  {/* Styled custom CSS bar chart */}
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border">
                    <div
                      style={{ width: `${rsvpedPercentage}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        rsvpedPercentage >= 100
                          ? "bg-rose-500"
                          : rsvpedPercentage >= 75
                          ? "bg-amber-400"
                          : "bg-[#114E8D]"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Committee applicants pending review (Col-span 1) */}
        <div className="bg-white rounded-3xl border p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5 border-b pb-2">
              <ClipboardCheck className="w-4.5 h-4.5 text-[#114E8D]" /> Verifikasi Roster Panitia
            </h2>

            <div className="space-y-3 overflow-y-auto max-h-[280px] mt-3">
              {pendingApplications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-bold font-mono">
                  Belum ada usulan panitia baru menunggu persetujuan.
                </div>
              ) : (
                pendingApplications.map((app) => (
                  <div key={app.id} className="bg-slate-50 border p-3 rounded-2xl relative space-y-2">
                    <div className="flex justify-between items-start text-[11px] font-bold">
                      <div>
                        <p className="text-slate-800 font-black">{app.studentName}</p>
                        <p className="text-[10px] text-slate-450 mt-0.5">{app.studentNim}</p>
                      </div>
                      <span className="bg-amber-100 text-amber-900 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-amber-200">
                        {app.selectedDivision}
                      </span>
                    </div>

                    <div className="text-[10.5px] leading-relaxed text-slate-650 font-semibold italic bg-white p-2 rounded-xl border">
                      &quot;{app.motivation}&quot;
                    </div>

                    <div className="flex gap-2 text-[10px] leading-none pt-1">
                      <button
                        onClick={() => handleRejectApplication(app.id)}
                        className="flex-1 text-center bg-white border text-rose-600 hover:bg-rose-50 border-rose-200 py-1.5 rounded-xl font-bold cursor-pointer"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => handleApproveApplication(app.id)}
                        className="flex-1 text-center bg-[#114E8D] text-white hover:bg-blue-800 py-1.5 rounded-xl font-black cursor-pointer"
                      >
                        Terima
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
