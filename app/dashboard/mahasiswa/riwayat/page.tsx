// ADDED: High fidelity modular Mahasiswa Achievement & Ticket history page
"use client";

import React, { useState, useEffect } from "react";
import { getEvents, EventWithCertificate } from "../../../../lib/certificateData";
import { useAuth } from "../../../../context/AuthContext";
import { 
  Building2, Calendar, MapPin, Award, CheckCircle, Clock, XCircle, 
  ArrowLeft, Ticket, Download, QrCode, AlertCircle, ShieldCheck, X 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";

interface GuestTicket {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventLoc: string;
  guestName: string;
}

export default function MahasiswaRiwayatPage() {
  const router = useRouter();
  const { user, addToast } = useAuth();
  
  // States
  const [events, setEvents] = useState<EventWithCertificate[]>(() => {
    if (typeof window !== "undefined") return getEvents();
    return [];
  });
  const [selectedTicket, setSelectedTicket] = useState<EventWithCertificate | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const studentEmail = user?.email || "";
  const studentName = user?.nama || "";
  const studentNim = user?.nim || "";

  // Filter events registered by current student
  const registeredEvents = events.filter((evt) =>
    evt.peserta.some((p) => p.email.toLowerCase() === studentEmail.toLowerCase())
  );

  const getStudentPresence = (evt: EventWithCertificate) => {
    const student = evt.peserta.find((p) => p.email.toLowerCase() === studentEmail.toLowerCase());
    return student ? student.statusHadir : "menunggu";
  };

  const drawPDFCertificate = (evt: EventWithCertificate) => {
    setIsExporting(evt.id);
    const poName = evt.sertifikatDisetujuiOleh || "Dr. Ahmad PO";
    const eventName = evt.nama;
    const eventDate = evt.tanggal;
    const student = evt.peserta.find((p) => p.email.toLowerCase() === studentEmail.toLowerCase());
    const nomorSertifikat = student?.nomorSertifikat || `CERT-25-EVT${evt.id}-${studentNim}`;

    setTimeout(() => {
      try {
        const doc = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4"
        });

        // Background gold fill border frame
        doc.setDrawColor(245, 158, 11); // Gold/Amber
        doc.setLineWidth(1.8);
        doc.rect(10, 10, 277, 190); // Outer

        doc.setDrawColor(17, 78, 141); // Brand Blue
        doc.setLineWidth(0.6);
        doc.rect(12, 12, 273, 186); // Inner

        // Outer corner lines
        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(1);
        doc.line(8, 8, 289, 8); // Top outer line
        doc.line(8, 8, 8, 202);
        doc.line(289, 8, 289, 202);
        doc.line(8, 202, 289, 202);

        // Header branding text
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(17, 78, 141);
        doc.text("UNIVERSITAS NEGERI KEBANGSAAN", 148, 38, { align: "center" });

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139); // Slate Grey
        doc.text("BADAN EKSEKUTIF MAHASISWA & KEMAHASISWAAN UTAMA", 148, 45, { align: "center" });

        // Divide Line separator
        doc.setDrawColor(226, 232, 240); // divider border line
        doc.setLineWidth(0.5);
        doc.line(40, 52, 257, 52);

        // Main certificate award label
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(26);
        doc.setTextColor(30, 41, 59); // Slate-800
        doc.text("SERTIFIKAT PENGHARGAAN", 148, 72, { align: "center" });

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.text(`Nomor Dokumen: ${nomorSertifikat}`, 148, 80, { align: "center" });

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(13);
        doc.setTextColor(71, 85, 105);
        doc.text("Diberikan kepada mahasiswa / Awarded to:", 148, 100, { align: "center" });

        // Student's full name (The main star)
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(17, 78, 141); // primary blue
        doc.text(studentName, 148, 112, { align: "center" });

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.text(`Nomor Induk Mahasiswa (NIM): ${studentNim}`, 148, 118, { align: "center" });

        // Event explanation
        doc.setFontSize(12);
        doc.setTextColor(71, 85, 105);
        doc.text("Atas partisipasi dan keaktifannya sebagai PESERTA resmi dalam agenda:", 148, 134, { align: "center" });

        // Event Title
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(15);
        doc.setTextColor(30, 41, 59);
        doc.text(eventName, 148, 144, { align: "center" });

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.text(`Dilaksanakan di Kampus Utama pada tanggal ${eventDate}`, 148, 150, { align: "center" });

        // Signature layout footer
        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.4);
        doc.line(148 - 40, 178, 148 + 40, 178); // Draw straight signature line
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text(poName, 148, 184, { align: "center" });

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text("Project Officer Event Penyelenggara", 148, 189, { align: "center" });

        // Save
        doc.save(`Sertifikat_Presensi_${nomorSertifikat}.pdf`);
        addToast("PDF e-Sertifikat berhasil diunduh!", "success");
      } catch (e) {
        addToast("Sistem gagal menyusun berkas PDF.", "error");
      } finally {
        setIsExporting(null);
      }
    }, 1000);
  };

  return (
    <div id="achievement-riwayat-container" className="space-y-6">
      {/* Back Header navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/dashboard/mahasiswa")}
          className="p-2 bg-white rounded-xl border hover:bg-slate-50 text-slate-600 transition-all cursor-pointer flex items-center gap-1 font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Award className="w-6.5 h-6.5 text-[#114E8D]" /> Riwayat Event & Sertifikat Saya
        </h1>
        <p className="text-xs text-slate-500 font-bold mt-1 max-w-lg">
          Pantau e-ticket RSVP, status kehadiran, dan klaim unduhan pdf e-Sertifikat Anda secara digital di sini.
        </p>
      </div>

      {registeredEvents.length === 0 ? (
        <div className="bg-white border rounded-3xl p-12 text-center text-xs text-slate-400 font-bold font-mono">
          Anda belum mendaftar rsvp event apapun di semester ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registeredEvents.map((evt) => {
            const presence = getStudentPresence(evt);
            const certApproved = evt.sertifikatStatus === "approved";
            const ticketId = `TKT-MHS-${evt.id}-${studentNim.substring(0, 4)}`;

            return (
              <div
                key={evt.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#114E8D]">
                      ID: {ticketId}
                    </span>
                    {/* Render status presence with elegant badges */}
                    {presence === "hadir" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-55 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5" /> Presensi: Hadir
                      </span>
                    ) : presence === "tidak_hadir" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" /> Tidak Hadir
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <Clock className="w-3.5 h-3.5" /> Menunggu Absen
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-[15px] text-slate-900 leading-snug">
                      {evt.nama}
                    </h3>
                    <p className="text-[11.5px] text-slate-500 font-medium mt-1 leading-relaxed">
                      Tanggal: <span className="text-slate-800 font-bold">{evt.tanggal}</span> | Lokasi: <span className="text-slate-800 font-bold">{evt.lokasi}</span>
                    </p>
                  </div>

                  {/* Certificate eligibility helper messages */}
                  <div className="pt-3 border-t">
                    {presence === "hadir" && certApproved ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] leading-relaxed text-emerald-800 font-bold flex gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          Klaim Sertifikat Terbuka! Presensi Anda tervalidasi dan penandatanganan PO selesai.
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border rounded-xl p-3 text-[11px] leading-relaxed text-slate-500 font-bold flex gap-2">
                        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          {presence !== "hadir" 
                            ? "Sertifikat dikunci. Anda wajib menghadiri event dan tercatat dpresensi terlebih dahulu."
                            : "Ulasan persetujuan PO sedang diproses. e-Sertifikat belum resmi dirilis."}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-slate-50 border-t flex items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedTicket(evt)}
                    className="text-xs font-bold text-[#114E8D] bg-white border px-3.5 py-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Ticket className="w-4 h-4" /> e-Ticket QR
                  </button>

                  <button
                    onClick={() => drawPDFCertificate(evt)}
                    disabled={presence !== "hadir" || !certApproved || isExporting === evt.id}
                    className={`text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm ${
                      presence === "hadir" && certApproved
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed border"
                    }`}
                  >
                    {isExporting === evt.id ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Menyusun...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" /> Unduh PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EVENT TICKET QR POPUP */}
      <AnimatePresence>
        {selectedTicket && (
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
                  <Ticket className="w-6 h-6 fill-current" />
                </div>
                <h3 className="font-black text-base uppercase tracking-tight text-white mb-0.5">
                  e-Ticket Mahasiswa
                </h3>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-300">
                  Universitas Kebangsaan
                </span>
              </div>

              {/* QR Code Meta */}
              <div className="bg-white text-slate-950 rounded-2xl p-5 border-2 border-dashed border-slate-200">
                <div className="w-36 h-36 mx-auto bg-slate-100 rounded-2xl p-3 border flex flex-col items-center justify-center mb-4 relative">
                  <QrCode className="w-24 h-24 text-slate-900" />
                  <span className="absolute bottom-1 font-mono text-[8.5px] font-black tracking-widest text-slate-500">
                    MHS-{selectedTicket.id}-{studentNim.substring(0, 4)}
                  </span>
                </div>

                <div className="space-y-2 text-left text-slate-600 font-bold text-[11px] leading-relaxed border-t border-slate-100 pt-3">
                  <p className="font-extrabold text-[12.5px] text-slate-900 leading-tight">
                    {selectedTicket.nama}
                  </p>
                  <div>
                    <p className="text-slate-400 font-black text-[9px] uppercase tracking-wider mb-0.5">Nama Peserta</p>
                    <p className="text-slate-800">{studentName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-black text-[9px] uppercase tracking-wider mb-0.5">NIM / Prodi</p>
                    <p className="text-slate-800">{studentNim} / Komputasi</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 font-black text-[9px] uppercase tracking-wider mb-0.5">Tanggal</p>
                      <p className="text-slate-800">{selectedTicket.tanggal}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-black text-[9px] uppercase tracking-wider mb-0.5">Lokasi Utama</p>
                      <p className="text-slate-800 truncate">{selectedTicket.lokasi}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 text-[10.5px] leading-snug text-slate-400 font-bold">
                Tunjukkan QR code ke Divisi Acara Panitia untuk pendaftaran presensi digital di pintu masuk.
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase cursor-pointer"
              >
                Selesai / Tutup
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
