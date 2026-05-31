// ADDED: High fidelity modular Panitia Certificate Administration page
"use client";

import React, { useState, useEffect } from "react";
import { getEvents, saveEvents, EventWithCertificate, PesertaItem } from "../../../../lib/certificateData";
import { useAuth } from "../../../../context/AuthContext";
import { 
  Award, Building2, UploadCloud, FileText, ChevronRight, CheckCircle, 
  ArrowLeft, FileSpreadsheet, Eye, Send, Sparkles, HelpCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";

export default function PanitiaSertifikatPage() {
  const router = useRouter();
  const { user, addToast, addNotification } = useAuth();

  // App States
  const [events, setEvents] = useState<EventWithCertificate[]>(() => {
    if (typeof window !== "undefined") return getEvents();
    return [];
  });
  const [selectedEventId, setSelectedEventId] = useState(() => {
    if (typeof window !== "undefined") {
      const list = getEvents();
      if (list.length > 0) return list[0].id;
    }
    return "";
  });
  
  // File upload mocks
  const [templateFile, setTemplateFile] = useState<string | null>(null);
  const [csvEmails, setCsvEmails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropMock = (e: React.DragEvent) => {
    e.preventDefault();
    setTemplateFile("mock_design_template_landscape_a4.png");
    addToast("Muckup berkas rancangan sertifikat diunggah!", "success");
  };

  const handleManualUploadMock = () => {
    setTemplateFile("mock_design_template_landscape_a4.png");
    addToast("Muckup berkas rancangan sertifikat diunggah!", "success");
  };

  const handleAjukanSertifikat = (e: React.FormEvent) => {
    e.preventDefault();
    const eventObj = events.find((evt) => evt.id === selectedEventId);
    if (!eventObj) return;

    if (!templateFile) {
      addToast("Harap unggah berkas rancangan template sertifikat!", "warning");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // 1. Parse CSV pasted emails
      let newlyParsedCount = 0;
      let emailList: string[] = [];
      if (csvEmails.trim()) {
        emailList = csvEmails
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.includes("@") && line.toLowerCase().endsWith(".ac.id"));
      }

      // Merge new participants or mark matching ones as "hadir"
      const updatedEvents = events.map((evt) => {
        if (evt.id === selectedEventId) {
          // Initialize participants update
          const currentPeserta = [...evt.peserta];

          // Auto update or join participants as "hadir" from parsed text emails
          emailList.forEach((email) => {
            const matched = currentPeserta.find((p) => p.email.toLowerCase() === email.toLowerCase());
            if (matched) {
              matched.statusHadir = "hadir"; // verified present
            } else {
              // Add a new student registration manually
              const emailPrefix = email.split("@")[0];
              const namePart = emailPrefix
                .replace(/[.\-_]/g, " ")
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

              const nimPart = `2021${Math.floor(100 + Math.random() * 900)}`;

              currentPeserta.push({
                nim: nimPart,
                nama: namePart,
                email: email.toLowerCase(),
                statusHadir: "hadir",
                sertifikatDownloaded: false,
                nomorSertifikat: `CERT-25-EVT${evt.id}-${nimPart}`
              });
              newlyParsedCount++;
            }
          });

          return {
            ...evt,
            sertifikatStatus: "pending", // submitted to PO for review
            sertifikatTemplateUrl: "/mock_template_active_event.jpg",
            kuotaTerisi: Math.max(evt.kuotaTerisi, currentPeserta.length),
            peserta: currentPeserta
          } as EventWithCertificate;
        }
        return evt;
      });

      setEvents(updatedEvents);
      saveEvents(updatedEvents);
      setIsSubmitting(false);

      // System notification
      addNotification(
        "Pengajuan e-Sertifikat Baru!",
        `Panitia mengunggah berkas rancangan untuk event '${eventObj.nama}'. Validasi antrean persetujuan PO dibuka.`,
        "Persetujuan",
        ["po"]
      );

      // Toast back details
      addToast(`Sertifikat '${eventObj.nama}' berhasil diajukan ke Project Officer!`, "success");
      if (emailList.length > 0) {
        addToast(`Tervalidasi ${emailList.length} peserta hadir!`, "info");
      }

      // Reset
      setTemplateFile(null);
      setCsvEmails("");
      router.push("/dashboard/panitia");
    }, 1500);
  };

  const selectedEvent = events.find((evt) => evt.id === selectedEventId);

  return (
    <div id="panitia-sertifikat-container" className="space-y-6">
      {/* Back navigation header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/dashboard/panitia")}
          className="p-2 bg-white rounded-xl border hover:bg-slate-50 text-slate-600 transition-all cursor-pointer flex items-center gap-1 font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Panel Panitia
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Award className="w-6.5 h-6.5 text-[#114E8D]" /> Pengurusan Sertifikat Peserta
        </h1>
        <p className="text-xs text-slate-500 font-bold mt-1 max-w-lg">
          Unggah layout sertifikat dalam PDF/Image, verifikasi rekapitulasi data pendaftar hadir, lalu ajukan persetujuan tanda tangan digital ke Project Officer.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Input Form (Col-span 2) */}
        <div className="lg:col-span-2">
          <form onSubmit={handleAjukanSertifikat} className="bg-white rounded-3xl border p-6 shadow-sm space-y-6">
            
            {/* Event selection */}
            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider">
                1. Pilih Event Universitas Terkait
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-slate-50 border rounded-2xl py-3 px-4 font-extrabold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.nama} ({evt.tanggal})
                  </option>
                ))}
              </select>
            </div>

            {/* Drag and Drop File template mockup uploader */}
            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider">
                2. Unggah Rancangan Desain Template (Sertifikat Landscape A4)
              </label>

              <div
                onDragOver={handleDragOver}
                onDrop={handleDropMock}
                onClick={handleManualUploadMock}
                className="border-2 border-dashed border-slate-300 rounded-3xl p-8 hover:border-blue-500 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[160px] bg-slate-50 group select-none"
              >
                {templateFile ? (
                  <div className="space-y-2 text-center text-xs text-emerald-800">
                    <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 max-w-max mx-auto border border-emerald-250">
                      <FileText className="w-7 h-7" />
                    </div>
                    <p className="font-extrabold">{templateFile}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Draf Siap Diajukan (Klik untuk Ubah)</p>
                  </div>
                ) : (
                  <div className="space-y-2 text-slate-500">
                    <div className="bg-slate-200 group-hover:bg-blue-50/75 group-hover:text-[#114E8D] p-3 rounded-full text-slate-600 max-w-max mx-auto shadow-sm">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <p className="font-extrabold text-xs">Tarik & Lepas file desain di sini, atau cari secara lokal</p>
                    <p className="text-[10px] text-slate-404 font-semibold font-mono">Ekstensi yang diizinkan: PNG, JPG, PDF (Maks 10MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Manual CSV parser textarea */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  3. Tempel Berkas Rekapitulasi Presensi Hadir (Daftar Email .ac.id)
                </label>
                <span className="text-[9px] uppercase font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                  Format Mocking CSV
                </span>
              </div>
              <textarea
                rows={5}
                value={csvEmails}
                onChange={(e) => setCsvEmails(e.target.value)}
                placeholder="rekap_hadir.csv&#13;&#13;mahasiswa@univ.ac.id&#13;andi@kampus.ac.id&#13;siti@kampus.ac.id"
                className="w-full border rounded-2xl p-4 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 font-semibold bg-white"
              ></textarea>
              <p className="text-[10.5px] leading-relaxed text-slate-450 font-medium">
                Sistem akan memecah masukan baris per baris. Alamat email yang terdaftar sebagai peserta akan ditandai dengan status <b>Hadir</b>, sedangkan pendaftar baru yang tidak terdaftar rsvp akan disisipkan baru secara otomatis ke data presensi.
              </p>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t flex gap-2 justify-end text-xs">
              <button
                type="button"
                onClick={() => router.push("/dashboard/panitia")}
                className="border px-4 py-2.5 rounded-xl font-bold bg-white text-slate-500 hover:bg-slate-50 uppercase cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#114E8D] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Memproses...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 fill-current" /> Ajukan e-Sertifikat ke PO
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Info pane (Col-span 1) */}
        <div>
          <div className="bg-white rounded-3xl border p-5 shadow-sm space-y-4 select-none">
            <h3 className="font-extrabold text-[12.5px] text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b">
              <FileSpreadsheet className="w-5 h-5 text-[#114E8D]" /> Informasi Event Tertunjuk
            </h3>

            {selectedEvent ? (
              <div className="space-y-4 text-xs font-bold leading-relaxed text-slate-650">
                <div>
                  <p className="text-slate-400 text-[9px] uppercase tracking-wider">Nama Event</p>
                  <p className="text-slate-900 text-sm leading-tight mt-0.5">{selectedEvent.nama}</p>
                </div>

                <div>
                  <p className="text-slate-400 text-[9px] uppercase tracking-wider">Status Sertifikat Saat Ini</p>
                  {selectedEvent.sertifikatStatus === "approved" ? (
                    <span className="inline-block mt-1 font-black bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded uppercase font-mono text-[10px]">
                      Disetujui PO ✓
                    </span>
                  ) : selectedEvent.sertifikatStatus === "pending" ? (
                    <span className="inline-block mt-1 font-black bg-amber-55 text-amber-900 border border-amber-200 px-2 py-0.5 rounded uppercase font-mono text-[10px]">
                      Menunggu Approval
                    </span>
                  ) : (
                    <span className="inline-block mt-1 font-black bg-slate-100 text-slate-500 border px-2 py-0.5 rounded uppercase font-mono text-[10px]">
                      Belum Diajukan
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-3">
                  <div>
                    <p className="text-slate-400 text-[9px] uppercase tracking-wider">Penyelenggara</p>
                    <p className="text-slate-800">{selectedEvent.penyelenggara}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[9px] uppercase tracking-wider">Partisipan RSVP</p>
                    <p className="text-slate-800">{selectedEvent.peserta.length} Mahasiswa</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-blue-900 leading-snug font-medium text-[10.5px]">
                  <strong>Mekanisme Verifikasi:</strong> PO akan melihat draf ulasan sertifikat ini di halaman approval PO, meluncurkan ulasan verifikasi, dan merekomendasikan penandatanganan digital.
                </div>
              </div>
            ) : (
              <p className="text-slate-400 font-mono text-center">Belum ada pilihan</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
