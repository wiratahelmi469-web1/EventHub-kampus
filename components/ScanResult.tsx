"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Calendar, User, Mail, Award, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { ScanResultPayload } from "../lib/scanUtils";

interface ScanResultComponentProps {
  result: ScanResultPayload;
  onClear: () => void;
}

export default function ScanResult({ result, onClear }: ScanResultComponentProps) {
  const { success, message, eventName, attendeeName, attendeeEmail, attendeeNim } = result;

  // Custom colors & icons based on scan state
  const isDuplicate = message.includes("sudah terekam");
  
  let mainIcon = <CheckCircle2 className="w-16 h-16 text-emerald-500" />;
  let headerBg = "bg-emerald-50";
  let statusMessage = "Pindai Berhasil";
  let borderStyle = "border-emerald-100";
  
  if (!success && isDuplicate) {
    mainIcon = <AlertTriangle className="w-16 h-16 text-amber-500" />;
    headerBg = "bg-amber-50";
    statusMessage = "Presensi Duplikat";
    borderStyle = "border-amber-100";
  } else if (!success) {
    mainIcon = <XCircle className="w-16 h-16 text-rose-500" />;
    headerBg = "bg-rose-50";
    statusMessage = "Pindai Gagal";
    borderStyle = "border-rose-100";
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 15 }}
      transition={{ duration: 0.25, type: "spring", damping: 20 }}
      className={`bg-white rounded-3xl border ${borderStyle} shadow-xl overflow-hidden max-w-md w-full mx-auto`}
    >
      {/* Visual Header */}
      <div className={`p-6 flex flex-col items-center justify-center text-center ${headerBg} transition-colors border-b border-dashed border-slate-100`}>
        <motion.div
          initial={{ scale: 0.6 }}
          animate={{ scale: [0.6, 1.1, 1] }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-3"
        >
          {mainIcon}
        </motion.div>
        
        <h3 className="text-lg font-black tracking-tight text-slate-800 uppercase">
          {statusMessage}
        </h3>
        <p className="text-xs text-slate-500 mt-1 font-medium px-4 leading-relaxed">
          {message}
        </p>
      </div>

      {/* Information Content Body */}
      {(eventName || attendeeName) && (
        <div className="p-6 space-y-4 text-sm">
          {eventName && (
            <div className="flex gap-3 items-start">
              <div className="p-2 rounded-xl bg-blue-50 text-[#114E8D] mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">Event Terkait</span>
                <span className="font-extrabold text-slate-800 text-sm block leading-snug">{eventName}</span>
              </div>
            </div>
          )}

          {attendeeName && (
            <div className="flex gap-3 items-start border-t border-slate-100 pt-3">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 mt-0.5">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">Nama Lengkap</span>
                <span className="font-extrabold text-slate-800 text-sm block leading-none">{attendeeName}</span>
                {attendeeNim && (
                  <span className="text-[11px] text-slate-500 mt-1 block font-mono font-bold uppercase">
                    NIM: {attendeeNim}
                  </span>
                )}
              </div>
            </div>
          )}

          {attendeeEmail && (
            <div className="flex gap-3 items-start border-t border-slate-100 pt-3">
              <div className="p-2 rounded-xl bg-slate-50 text-slate-600 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">Alamat Email</span>
                <span className="font-medium text-slate-700 text-xs block truncate">{attendeeEmail}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Primary Actions */}
      <div className="p-5 bg-slate-50 border-t border-slate-100 flex gap-3">
        <button
          type="button"
          onClick={onClear}
          className="w-full h-[46px] rounded-xl text-xs font-black text-white bg-slate-800 hover:bg-slate-900 transition-all shadow-md active:scale-98 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5"
        >
          Selesai & Pindai Baru <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
