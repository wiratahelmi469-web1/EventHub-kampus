"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { Download, Ticket, MapPin, Calendar, User, Mail } from "lucide-react";

interface TicketQRCodeProps {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventLoc: string;
  userName: string;
  userEmail: string;
  userNim?: string;
}

export default function TicketQRCode({
  eventId,
  eventName,
  eventDate,
  eventLoc,
  userName,
  userEmail,
  userNim = "NIM-DEFAULT"
}: TicketQRCodeProps) {
  const [qrSrc, setQrSrc] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Unified ticket QR data string representation
  // Format: "EVENTHUB-TICKET:eventId:email:name"
  const payloadString = `EVENTHUB-TICKET:${eventId}:${userEmail}:${userName}`;

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(
      payloadString,
      {
        width: 300,
        margin: 2,
        color: {
          dark: "#1E293B", // Cool slate 800
          light: "#FFFFFF"
        }
      }
    )
      .then((url) => {
        if (active) {
          setQrSrc(url);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError("Gagal membuat QR Code.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [payloadString]);

  // Action: Generate printable landscape PDF Ticket using jsPDF
  const downloadTicketPdf = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [100, 150] // Ticket dimensions: 100mm wide by 150mm high
      });

      // Background card shape
      doc.setFillColor(250, 250, 250);
      doc.rect(0, 0, 100, 150, "F");

      // Deep Navy Header Accent Bar
      doc.setFillColor(17, 78, 141); // #114E8D Navy
      doc.rect(0, 0, 100, 28, "F");

      // Yellow/Gold bottom accent
      doc.setFillColor(245, 158, 11); // #f59e0b Yellow
      doc.rect(0, 26, 100, 2, "F");

      // Header Brand text
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("EVENTHUB STT-NF", 50, 10, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(229, 231, 235);
      doc.text("TIKET PRESENSI MASUK RESMI KAMPUS", 50, 15, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(eventName.toUpperCase(), 50, 22, { align: "center" });

      // Event Metas Details
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      
      doc.text("Detail Event:", 10, 36);
      doc.setFont("helvetica", "bold");
      doc.text(`ID Event: ${eventId}`, 10, 41);
      doc.text(`Tanggal: ${eventDate}`, 10, 46);
      doc.setFont("helvetica", "normal");
      doc.text(`Tempat: ${eventLoc.length > 40 ? eventLoc.substring(0, 38) + "..." : eventLoc}`, 10, 51);

      // Divider line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(10, 56, 90, 56);

      // Attendee Details
      doc.text("Detail Peserta:", 10, 62);
      doc.setFont("helvetica", "bold");
      doc.text(`Nama: ${userName.toUpperCase()}`, 10, 67);
      doc.text(`NIM ID: ${userNim}`, 10, 72);
      doc.setFont("helvetica", "normal");
      doc.text(`Email: ${userEmail}`, 10, 77);

      // Dash line before QR Code cut-out
      doc.setDrawColor(148, 163, 184);
      doc.line(10, 83, 90, 83);

      // Embed QR Code Image
      if (qrSrc) {
        doc.addImage(qrSrc, "JPEG", 27, 88, 46, 46);
      }

      // Footer Info
      doc.setFontSize(7);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(148, 163, 184);
      doc.text("Tunjukkan QR Code ini ke Panitia untuk Presensi Hadir", 50, 142, { align: "center" });

      doc.save(`Ticket-${eventId}-${userNim}.pdf`);
    } catch (err: any) {
      console.error("Gagal mendownload PDF", err);
    }
  };

  return (
    <div className="flex flex-col items-center bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4 max-w-sm mx-auto">
      {/* Visual Header */}
      <div className="w-full text-center pb-2 border-b border-dashed border-slate-200">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono block">Check-in QR Ticket</span>
        <span className="text-xs font-black text-slate-700 block mt-0.5 uppercase line-clamp-1">{eventName}</span>
      </div>

      {loading ? (
        <div className="w-40 h-40 bg-white border rounded-xl flex items-center justify-center text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono animate-pulse">
          E-ticket...
        </div>
      ) : error ? (
        <div className="w-40 h-40 bg-amber-50 rounded-xl flex items-center justify-center p-3 text-center text-[10px] uppercase font-bold text-amber-800">
          {error}
        </div>
      ) : (
        <div className="relative p-2 bg-white rounded-xl border border-dashed border-slate-300 w-48 h-48 flex items-center justify-center group overflow-hidden">
          <img
            src={qrSrc}
            alt="Check-in Ticket QR Code"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
          {/* Radar scan overlay feedback */}
          <div className="absolute inset-x-2 top-0 h-0.5 bg-red-400 shadow-md animate-bounce opacity-75" />
        </div>
      )}

      {/* Meta Student info list */}
      <div className="w-full space-y-1.5 text-left bg-white p-3 border border-slate-200/60 rounded-xl text-[10.5px] font-semibold text-slate-650">
        <div className="flex justify-between items-center">
          <span className="text-slate-400 uppercase font-mono text-[9px]">Peserta/NIM:</span>
          <span className="text-slate-800 font-extrabold uppercase text-right truncate max-w-[170px]">{userName} ({userNim})</span>
        </div>
        <div className="flex justify-between items-center border-t border-slate-100 pt-1.5">
          <span className="text-slate-400 uppercase font-mono text-[9px]">Email:</span>
          <span className="text-slate-500 font-mono text-right truncate max-w-[170px]">{userEmail}</span>
        </div>
      </div>

      {/* Action Download pdf button */}
      {!loading && !error && (
        <button
          type="button"
          onClick={downloadTicketPdf}
          className="w-full h-10 rounded-xl bg-[#114E8D] hover:bg-[#0D47A1] text-white font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Download className="w-4.5 h-4.5 cursor-pointer" /> Unduh PDF Tiket
        </button>
      )}
    </div>
  );
}
