// CREATED: app/dashboard/mahasiswa/riwayat/page.tsx
// FIXED: 404 - /dashboard/mahasiswa/riwayat
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { getEvents, EventWithCertificate, PesertaItem } from "../../../../lib/certificateData";
import { 
  Award, Calendar, Check, X, ShieldAlert, FileText, Download, Briefcase, Sparkles, Inbox, Clock, ShieldCheck, Ticket
} from "lucide-react";
import jsPDF from "jspdf";

export default function MahasiswaRiwayatPage() {
  const router = useRouter();
  const { user, addToast } = useAuth();

  // Guard account
  useEffect(() => {
    if (user && user.role !== "mahasiswa") {
      router.replace(`/dashboard/${user.role === "staf" ? "staff" : user.role}`);
    }
  }, [user, router]);

  // States
  const [registeredEvents, setRegisteredEvents] = useState<EventWithCertificate[]>([]);
  const [selectedTicketEvent, setSelectedTicketEvent] = useState<EventWithCertificate | null>(null);

  useEffect(() => {
    if (!user) return;
    
    // Select events where user is listed as peserta
    const all = getEvents();
    const joined = all.filter(evt => {
      return evt.peserta.some(p => p.email.toLowerCase() === user.email.toLowerCase());
    });
    setRegisteredEvents(joined);
  }, [user]);

  if (!user || user.role !== "mahasiswa") {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center font-mono text-xs text-slate-400 font-bold tracking-widest uppercase animate-pulse">
        Memverifikasi Akun...
      </div>
    );
  }

  // Find user's participant item within an event
  const getUserParticipantItem = (evt: EventWithCertificate): PesertaItem | undefined => {
    return evt.peserta.find(p => p.email.toLowerCase() === user.email.toLowerCase());
  };

  // Metrics Counters
  const joinedCount = registeredEvents.length;
  const completedCount = registeredEvents.filter(e => e.eventStatus === "selesai" || e.status === "selesai").length;
  
  const presentCount = registeredEvents.filter(evt => {
    const pItem = getUserParticipantItem(evt);
    return pItem?.statusHadir === "hadir";
  }).length;

  const certIssuedCount = registeredEvents.filter(evt => {
    const pItem = getUserParticipantItem(evt);
    return pItem?.statusHadir === "hadir" && evt.sertifikatStatus === "approved";
  }).length;

  // Action: Download official PDF cert using jsPDF
  const generateCertificatePdf = (evt: EventWithCertificate) => {
    const pItem = getUserParticipantItem(evt);
    if (!pItem) return;

    try {
      // 1. Initialize Landscape PDF
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4" // A4 landscape: 297mm x 210mm
      });

      // 2. Draw Borders & Frame Design
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 297, 210, "F");

      // Gold External border
      doc.setDrawColor(212, 175, 55); // #D4AF37 Gold
      doc.setLineWidth(1.5);
      doc.rect(8, 8, 281, 194, "D");

      // Black Thin Inner border
      doc.setDrawColor(33, 37, 41);
      doc.setLineWidth(0.4);
      doc.rect(11, 11, 275, 188, "D");

      // Elegant Corner Shapes
      doc.setFillColor(212, 175, 55);
      doc.rect(8, 8, 8, 8, "F");
      doc.rect(281, 8, 8, 8, "F");
      doc.rect(8, 194, 8, 8, "F");
      doc.rect(281, 194, 8, 8, "F");

      // 3. Document Headings
      doc.setTextColor(17, 78, 141); // #114E8D Navy
      doc.setFont("times", "bold");
      doc.setFontSize(21);
      doc.text("UNIVERSITAS KEBANGSAAN", 148, 28, { align: "center" });

      doc.setTextColor(90, 105, 120);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text("KEMAHASISWAAN & LAYANAN SERTIFIKASI AKADEMIK TERINTEGRASI", 148, 33, { align: "center" });

      // Graphic line accent
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.8);
      doc.line(70, 38, 227, 38);

      // Certificate Title
      doc.setTextColor(17, 78, 141);
      doc.setFont("times", "bolditalic");
      doc.setFontSize(28);
      doc.text("Sertifikat Penghargaan", 148, 52, { align: "center" });

      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.text("DIBERIKAN KEPADA MAHASISWA BERIKUT:", 148, 62, { align: "center" });

      // 4. Student Name
      doc.setTextColor(17, 78, 141);
      doc.setFont("times", "bold");
      doc.setFontSize(24);
      doc.text(user.nama.toUpperCase(), 148, 76, { align: "center" });

      // Student NIM / ID
      doc.setTextColor(33, 37, 41);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`NIM: ${user.nim || "NIM-BELUM-TERCATAT"}`, 148, 83, { align: "center" });

      // Graphic line under name
      doc.setDrawColor(33, 37, 41, 0.15);
      doc.setLineWidth(0.2);
      doc.line(100, 89, 197, 89);

      // 5. Narrative Citation Text
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11.5);
      doc.text("Atas partisipasi aktif dan dedikasi penuh sebagai PESERTA dalam menyukseskan kegiatan agenda:", 148, 100, { align: "center" });

      // Event Title
      doc.setTextColor(17, 78, 141);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`"${evt.nama.toUpperCase()}"`, 148, 111, { align: "center" });

      // Organizer & Date Context
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Yang diselenggarakan secara resmi oleh ${evt.penyelenggara} pada tanggal ${evt.tanggal}.`, 148, 120, { align: "center" });

      // 6. Signature lines
      // Left signature line: Penyelenggara
      doc.setDrawColor(120, 120, 120);
      doc.setLineWidth(0.2);
      doc.line(40, 160, 105, 160);
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text("Divisi Panitia Pelaksana", 72.5, 165, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(evt.penyelenggara, 72.5, 169, { align: "center" });

      // Right signature line: Project Officer
      doc.line(192, 160, 257, 160);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text("Project Officer (PO)", 224.5, 165, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text("EventHub Universitas Nurul Fikri", 224.5, 169, { align: "center" });

      // Handwritten fake signature indicator text
      doc.setTextColor(17, 78, 141);
      doc.setFont("courier", "bolditalic");
      doc.setFontSize(9);
      doc.text("SIGNED DIGITAL", 72.5, 154, { align: "center" });
      doc.text("APPROVED BY SYSTEM", 224.5, 154, { align: "center" });

      // 7. Security verification serial number / barcode
      const certNo = pItem.nomorSertifikat || `CERT-25-EVT${evt.id}-${user.nim}`;
      doc.setTextColor(140, 140, 140);
      doc.setFont("courier", "bold");
      doc.setFontSize(7.5);
      doc.text(`VERIFIKASI ID SERTIFIKAT: ${certNo}`, 148, 186, { align: "center" });

      // Save Output
      doc.save(`Sertifikat_${evt.id}_${user.nama.replace(/\s+/g, "_")}.pdf`);
      addToast("Unduhan file PDF Sertifikat berhasil diproses! 🎓", "success");

    } catch (error) {
      addToast("Terjadi kesalahan teknis saat merender sertifikat PDF.", "error");
    }
  };

  const getAttendanceBadgeStyles = (status: "hadir" | "tidak_hadir" | "menunggu") => {
    switch (status) {
      case "hadir":
        return "bg-emerald-50 text-emerald-700 border-emerald-250";
      case "tidak_hadir":
        return "bg-rose-50 text-rose-700 border-rose-250";
      case "menunggu":
      default:
        return "bg-amber-50 text-amber-700 border-amber-250 animate-pulse";
    }
  };

  const getAttendanceLabelText = (status: "hadir" | "tidak_hadir" | "menunggu") => {
    switch (status) {
      case "hadir":
        return "Hadir";
      case "tidak_hadir":
        return "Tidak Hadir";
      case "menunggu":
      default:
        return "Belum Diabsen";
    }
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      {/* Title block */}
      <div className="bg-[#114E8D] rounded-3xl p-6 text-white border-b-4 border-amber-400 shadow">
        <span className="bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded bg-opacity-95 shadow inline-block mb-2">
          Akun Mahasiswa Terverifikasi
        </span>
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Riwayat Kegiatan &amp; Sertifikat</h1>
        <p className="text-[11px] sm:text-xs text-slate-205 mt-1 max-w-xl font-medium leading-relaxed">
          Kumpulan portofolio acara kemahasiswaan Universitas Nurul Fikri yang telah Anda RSVP. Unduh sertifikat resmi digital yang disahkan oleh Project Officer.
        </p>
      </div>

      {/* Metrics Row - 2 Columns Mobile, 4 Columns Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metrik 1: Registrasi */}
        <div className="bg-white rounded-2xl border p-4.5 shadow-sm space-y-1">
          <p className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-wider">EVENT DIKUTI</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-slate-800">{joinedCount}</span>
            <Calendar className="w-5 h-5 text-slate-300" />
          </div>
        </div>

        {/* Metrik 2: Selesai */}
        <div className="bg-white rounded-2xl border p-4.5 shadow-sm space-y-1">
          <p className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-wider">EVENT SELESAI</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-slate-800">{completedCount}</span>
            <Clock className="w-5 h-5 text-slate-300" />
          </div>
        </div>

        {/* Metrik 3: Hadir */}
        <div className="bg-white rounded-2xl border p-4.5 shadow-sm space-y-1">
          <p className="text-[9px] font-mono font-black text-emerald-600 uppercase tracking-wider">KEHADIRAN VALID</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-slate-800">{presentCount}</span>
            <Check className="w-5 h-5 text-emerald-300 stroke-[3px]" />
          </div>
        </div>

        {/* Metrik 4: Sertifikat */}
        <div className="bg-white rounded-2xl border p-4.5 shadow-sm space-y-1">
          <p className="text-[9px] font-mono font-black text-amber-500 uppercase tracking-wider">SERTIFIKAT TERBIT</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-slate-800">{certIssuedCount}</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Responsive table block detail listings */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-black uppercase text-slate-400 tracking-wider">
          DAFTAR LOG AKTIVITAS ANDA
        </h3>

        {registeredEvents.length === 0 ? (
          <div className="bg-white border rounded-3xl p-16 text-center select-none shadow-sm">
            <div className="bg-slate-50 p-4 border rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3.5 text-slate-450">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-[#114E8D] uppercase tracking-wide text-xs">Aktivitas Kosong</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto font-semibold">
              Anda belum melakukan pendaftaran RSVP atau berpartisipasi pada rangkaian event universitas sejauh ini.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card List (Hidden on sm) */}
            <div className="block sm:hidden space-y-4">
              {registeredEvents.map((evt, idx) => {
                const pItem = getUserParticipantItem(evt);
                const statusHadir = pItem?.statusHadir || "menunggu";
                const isPresent = statusHadir === "hadir";
                const certStatus = evt.sertifikatStatus;

                return (
                  <div key={evt.id} className="bg-white border rounded-3xl p-5 shadow-sm space-y-3.5">
                    <div className="flex justify-between items-center border-b border-dashed pb-2">
                      <span className="font-mono text-slate-400 font-bold text-xs">#{idx + 1}</span>
                      <span className="font-mono text-[10px] text-[#114E8D] font-bold decoration-dotted">{evt.id}</span>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono font-black text-purple-700 uppercase">{evt.kategori}</span>
                      <h4 className="font-extrabold text-[#114E8D] text-xs uppercase leading-tight mt-0.5">{evt.nama}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">{evt.penyelenggara} • {evt.tanggal}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10.5px] border-t border-dashed pt-3">
                      <div>
                        <p className="text-[8.5px] font-mono font-black text-slate-400 uppercase tracking-wider mb-1">kehadiran:</p>
                        <span className={`px-2 py-0.5 rounded border text-[9.5px] font-black uppercase ${getAttendanceBadgeStyles(statusHadir)}`}>
                          {getAttendanceLabelText(statusHadir)}
                        </span>
                      </div>

                      <div>
                        <p className="text-[8.5px] font-mono font-black text-slate-400 uppercase tracking-wider mb-1">sertifikat:</p>
                        {isPresent ? (
                          certStatus === "approved" ? (
                            <button
                              onClick={() => generateCertificatePdf(evt)}
                              className="text-[#114E8D] font-black hover:underline flex items-center gap-1 uppercase text-[9.5px]"
                            >
                              <Download className="w-3.5 h-3.5 stroke-[3px]" /> Unduh PDF
                            </button>
                          ) : certStatus === "pending" ? (
                            <span className="text-amber-600 font-bold text-[9.5px] tracking-wide animate-pulse">Menunggu TTD</span>
                          ) : (
                            <span className="text-slate-400 font-bold text-[9.5px] tracking-wide">Belum Diajukan</span>
                          )
                        ) : (
                          <span className="text-slate-400 font-bold text-[9.5px] tracking-wide">Tidak Memenuhi Syarat</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-dotted mt-2">
                      <button
                        onClick={() => setSelectedTicketEvent(evt)}
                        className="w-full text-center bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[10px] uppercase py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Ticket className="w-4 h-4" /> Tampilkan Tiket QR
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden sm:block overflow-x-auto border border-slate-200/60 bg-white rounded-3xl shadow-sm">
              <table className="w-full text-left border-collapse text-[11px] font-semibold text-slate-705">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b font-black font-mono uppercase h-11 select-none">
                    <th className="pl-5">No</th>
                    <th>ID</th>
                    <th>Nama Event / Penyelenggara</th>
                    <th>Kategori</th>
                    <th>Tanggal RSVP</th>
                    <th>Presensi &amp; Tiket</th>
                    <th className="pr-5 text-center">Status Dokumen Sertifikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {registeredEvents.map((evt, idx) => {
                    const pItem = getUserParticipantItem(evt);
                    const statusHadir = pItem?.statusHadir || "menunggu";
                    const isPresent = statusHadir === "hadir";
                    const certStatus = evt.sertifikatStatus;

                    return (
                      <tr key={evt.id} className="h-15 hover:bg-slate-50">
                        <td className="pl-5 font-mono font-bold text-slate-400">{idx + 1}</td>
                        <td className="font-mono font-bold text-slate-500">{evt.id}</td>
                        <td>
                          <p className="font-extrabold text-[#114E8D] uppercase leading-tight line-clamp-1">{evt.nama}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{evt.penyelenggara}</p>
                        </td>
                        <td>
                          <span className="text-[10px] font-mono font-black uppercase text-purple-700 py-0.5 px-2 bg-purple-50 rounded border border-purple-250">
                            {evt.kategori}
                          </span>
                        </td>
                        <td className="font-mono text-slate-500">{evt.tanggal}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 border rounded text-[9.5px] font-black uppercase ${getAttendanceBadgeStyles(statusHadir)}`}>
                              {getAttendanceLabelText(statusHadir)}
                            </span>
                            <button
                              onClick={() => setSelectedTicketEvent(evt)}
                              className="bg-amber-100 hover:bg-amber-200 text-slate-900 border border-amber-300 font-bold text-[9.5px] px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 select-none"
                            >
                              <Ticket className="w-3.5 h-3.5" /> Tiket QR
                            </button>
                          </div>
                        </td>
                        <td className="pr-5 text-center">
                          {isPresent ? (
                            certStatus === "approved" ? (
                              <button
                                onClick={() => generateCertificatePdf(evt)}
                                className="bg-[#114E8D] hover:bg-blue-700 text-amber-300 hover:text-white border-b-2 border-amber-400 font-extrabold text-[10.5px] py-1.5 px-3 rounded-xl transition-all h-8.5 uppercase cursor-pointer shadow-xs flex items-center justify-center gap-1 mx-auto"
                              >
                                <Download className="w-3.5 h-3.5 stroke-[3px]" /> Unduh PDF
                              </button>
                            ) : certStatus === "pending" ? (
                              <span className="text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide animate-pulse inline-block">
                                Antrean TTD PO
                              </span>
                            ) : (
                              <span className="text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide inline-block">
                                Belum Diajukan
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400 font-mono text-[9.5px] font-bold uppercase tracking-wider block">
                              Tidak Memenuhi Syarat
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

      {/* TICKET QR OVERLAY DIALOG */}
      {selectedTicketEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 select-none">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-scaleUp">
            {/* Header ticket cut-out appearance */}
            <div className="bg-[#114E8D] text-white p-5 text-center relative border-b-2 border-dashed border-slate-350 bg-gradient-to-r from-[#114E8D] to-[#125ca5]">
              <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-2.5 py-1 rounded tracking-widest mb-2.5 inline-block">
                TIKET REMO PERSENSI MASUK
              </span>
              <h3 className="font-extrabold uppercase line-clamp-1 text-xs">
                {selectedTicketEvent.nama}
              </h3>
              <p className="font-mono text-[9.5px] text-slate-300 mt-1">EVENT ID: {selectedTicketEvent.id}</p>
              
              {/* Half circles decoration */}
              <div className="absolute bottom-0 left-0 w-4 h-4 bg-black/60 rounded-full translate-y-1/2 -translate-x-1/2 shadow-inner" />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-black/60 rounded-full translate-y-1/2 translate-x-1/2 shadow-inner" />
            </div>

            {/* Ticket QR body */}
            <div className="p-6 text-center space-y-5 relative bg-white">
              <div className="relative mx-auto w-48 h-48 bg-slate-50 border-2 border-dashed p-2 rounded-2xl flex items-center justify-center border-slate-200">
                {/* QR Code image loaded dynamically from qrserver API */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({
                    eventId: selectedTicketEvent.id,
                    email: user.email,
                    nim: user.nim,
                    nama: user.nama
                  }))}`}
                  alt="Check-in QR Ticket" 
                  className="w-full h-full object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
                
                {/* Scanner visual radar line overlay representation */}
                <div className="absolute inset-x-2 top-0 h-0.5 bg-red-500 animate-bounce shadow-md opacity-75" />
              </div>

              {/* Participant information */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/60 text-left text-[11px] font-semibold space-y-1 relative">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">NAMA:</span>
                  <span className="text-slate-800 uppercase font-black">{user.nama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">NIM ID:</span>
                  <span className="text-slate-705 font-mono">{user.nim || "NIM-DEFAULT"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">EMAIL:</span>
                  <span className="text-slate-500 truncate max-w-[180px] font-mono font-medium">{user.email}</span>
                </div>
                {/* Half circles decoration */}
                <div className="absolute top-1/2 left-0 w-3 h-3 bg-black/60 rounded-full -translate-y-1/2 -translate-x-1/2 shadow-inner" />
                <div className="absolute top-1/2 right-0 w-3 h-3 bg-black/60 rounded-full -translate-y-1/2 translate-x-1/2 shadow-inner" />
              </div>

              <div className="text-[10px] text-slate-450 font-semibold leading-relaxed">
                Tunjukkan QR Code ini kepada panitia pelaksana di pintu masuk untuk merekam kehadiran absensi Anda secara otomatis.
              </div>
            </div>

            {/* Footer close button */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex">
              <button 
                onClick={() => setSelectedTicketEvent(null)}
                className="w-full bg-[#114E8D] hover:bg-blue-700 text-white font-black text-xs uppercase py-2.5 rounded-xl cursor-pointer shadow-md transition-all active:scale-95"
              >
                Tutup Tiket
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
