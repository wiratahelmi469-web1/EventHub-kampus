// CREATED: app/dashboard/panitia/sertifikat/page.tsx
// FIXED: 404 - /dashboard/panitia/sertifikat
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { getEvents, saveEvents, EventWithCertificate } from "../../../../lib/certificateData";
import { 
  Award, Calendar, Check, X, ShieldCheck, Inbox, ArrowRight, Sparkles, AlertCircle 
} from "lucide-react";

export default function PanitiaSertifikatPage() {
  const router = useRouter();
  const { user, addToast, addNotification } = useAuth();

  // Guard account
  useEffect(() => {
    if (user && user.role !== "panitia") {
      router.replace(`/dashboard/${user.role === "staf" ? "staff" : user.role}`);
    }
  }, [user, router]);

  // States
  const [events, setEvents] = useState<EventWithCertificate[]>([]);

  useEffect(() => {
    if (!user) return;
    const all = getEvents();
    const myEvts = all.filter(e => e.pengajuEmail?.toLowerCase() === user.email?.toLowerCase());
    setEvents(myEvts);
  }, [user]);

  if (!user || user.role !== "panitia") {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center font-mono text-xs text-slate-400 font-bold tracking-widest uppercase animate-pulse">
        Memverifikasi Akun...
      </div>
    );
  }

  // Action: Prompt submit from shortcut
  const handleRequestCertFromShortcut = (evtId: string) => {
    const target = events.find(e => e.id === evtId);
    if (!target) return;

    // Must have at least 1 person marked as present
    const hasPresent = target.peserta.some(p => p.statusHadir === "hadir");
    if (!hasPresent) {
      addToast("Setidaknya 1 peserta harus mengisi daftar hadir (Hadir) di menu 'Kelola Peserta' pada dashboard utama.", "warning");
      return;
    }

    const updated = getEvents().map(evt => {
      if (evt.id === evtId) {
        return {
          ...evt,
          sertifikatStatus: "pending" as const
        };
      }
      return evt;
    });

    saveEvents(updated);
    setEvents(updated.filter(e => e.pengajuEmail?.toLowerCase() === user.email?.toLowerCase()));
    addToast("Pengajuan penerbitan sertifikat digital dikirim ke PO! 🚀", "success");

    addNotification(
      "Pengajuan Sertifikat Masuk",
      `Panitia mengusulkan penandatanganan sertifikat untuk event '${target.nama}'.`,
      "Sertifikat",
      ["po"]
    );
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      {/* Title box panel */}
      <div className="bg-[#114E8D] rounded-3xl p-6 text-white border-b-4 border-amber-400 shadow">
        <span className="bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded bg-opacity-95 shadow inline-flex items-center gap-1.5 mb-2.5">
          <Award className="w-3.5 h-3.5" /> Sertifikasi Kepanitiaan Kampus
        </span>
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Kanal Sertifikat Organisasi</h1>
        <p className="text-[11px] sm:text-xs text-slate-205 mt-1 max-w-xl font-medium leading-relaxed">
          Pantau persetujuan sertifikat seluruh acara kepanitiaan Anda. Ajukan pengesahan draf presensi mahasiswa ke Project Officer untuk rilis sertifikat digital.
        </p>
      </div>

      {/* Directory listing details */}
      <h3 className="text-xs font-mono font-black uppercase text-slate-400 tracking-wider">
        LOG STATUS SERTIFIKAT EVENT KEPANITIAAN ANDA
      </h3>

      {events.length === 0 ? (
        <div className="bg-white border rounded-3xl p-16 text-center shadow-sm select-none">
          <div className="bg-slate-50 p-4 border rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3.5 text-slate-400">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-[#114E8D] uppercase tracking-wide text-xs">Arsip Kosong</h3>
          <p className="text-slate-405 text-xs max-w-sm mx-auto font-semibold mt-1 text-slate-400">
            Anda belum mendaftarkan usulan event, sehingga tidak ada berkas sertifikat yang dikelola.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile responsive cards list */}
          <div className="block sm:hidden space-y-4">
            {events.map((evt, idx) => {
              const presentCount = evt.peserta.filter(p => p.statusHadir === "hadir").length;
              const certStatus = evt.sertifikatStatus;

              return (
                <div key={evt.id} className="bg-white border rounded-3xl p-5 shadow-sm space-y-3.5">
                  <div className="flex justify-between items-center border-b border-dashed pb-2">
                    <span className="font-mono text-slate-405 font-bold text-xs">#{idx + 1}</span>
                    <span className="font-mono text-[10px] text-[#114E8D] font-bold">{evt.id}</span>
                  </div>

                  <div>
                    <span className="text-[9.5px] font-mono font-black text-purple-700 uppercase">{evt.kategori}</span>
                    <h4 className="font-extrabold text-[#114E8D] text-xs uppercase leading-tight mt-0.5">{evt.nama}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">Kehadiran: <b className="text-slate-650">{presentCount} Mahasiswa</b></p>
                  </div>

                  <div className="pt-2 border-t mt-3 border-dashed">
                    {certStatus === "approved" ? (
                      <span className="bg-emerald-50 text-emerald-700 text-center font-black text-[10px] uppercase py-2 rounded-xl flex items-center justify-center border border-emerald-250 w-full">
                        Disetujui PO ✓
                      </span>
                    ) : certStatus === "pending" ? (
                      <span className="bg-amber-50 text-amber-700 text-center font-black text-[10px] uppercase py-2 rounded-xl flex items-center justify-center border border-amber-250 w-full animate-pulse">
                        Menunggu TTD PO
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRequestCertFromShortcut(evt.id)}
                        className="w-full bg-[#114E8D] hover:bg-blue-700 text-amber-300 hover:text-white border-b-2 border-amber-400 font-extrabold text-[10px] uppercase py-2 rounded-xl transition-all cursor-pointer text-center"
                      >
                        Ajukan Ke PO →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop tabular view */}
          <div className="hidden sm:block overflow-x-auto border border-slate-200/60 bg-white rounded-3xl shadow-sm">
            <table className="w-full text-left border-collapse text-[11px] font-semibold text-slate-705">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b font-black font-mono uppercase h-11 select-none">
                  <th className="pl-5">No</th>
                  <th>ID</th>
                  <th>Nama Event</th>
                  <th>Kategori</th>
                  <th>Sesi Panitia</th>
                  <th>Peserta Hadir</th>
                  <th className="pr-5 text-center">Status Validasi Sertifikat</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {events.map((evt, idx) => {
                  const presentCount = evt.peserta.filter(p => p.statusHadir === "hadir").length;
                  const certStatus = evt.sertifikatStatus;

                  return (
                    <tr key={evt.id} className="h-14 hover:bg-slate-50">
                      <td className="pl-5 font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="font-mono font-bold text-slate-500">{evt.id}</td>
                      <td className="max-w-[200px]">
                        <span className="font-extrabold text-[#114E8D] uppercase leading-tight line-clamp-1">{evt.nama}</span>
                      </td>
                      <td>
                        <span className="text-[10px] font-mono font-black uppercase text-purple-700 py-0.5 px-2 bg-purple-50 rounded border border-purple-250">
                          {evt.kategori}
                        </span>
                      </td>
                      <td className="text-slate-450">{evt.penyelenggara}</td>
                      <td className="font-mono font-bold text-slate-800 pl-4">{presentCount} Orang</td>
                      <td className="pr-5 text-center">
                        {certStatus === "approved" ? (
                          <span className="bg-emerald-55 bg-emerald-50 text-emerald-700 border border-emerald-250 px-3 py-1 rounded-xl text-[10px] font-black uppercase inline-flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 stroke-[3.5px]" /> Disetujui PO ✓
                          </span>
                        ) : certStatus === "pending" ? (
                          <span className="bg-amber-50 text-amber-700 border border-amber-250 px-3 py-1 rounded-xl text-[10px] font-black uppercase inline-block animate-pulse">
                            Menunggu TTD PO
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRequestCertFromShortcut(evt.id)}
                            className="bg-[#114E8D] hover:bg-blue-700 text-amber-300 hover:text-white border-b-2 border-amber-400 font-extrabold text-[10px] py-1.5 px-3.5 rounded-xl transition-all h-8.5 uppercase cursor-pointer shadow-xs inline-block"
                          >
                            Ajukan Ke PO →
                          </button>
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
