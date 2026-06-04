'use client';

import { Check, X, AlertTriangle, User, Calendar, Mail, Timer } from 'lucide-react';
import { motion } from 'motion/react';

interface ScanResultCardProps {
  payload: {
    success: boolean;
    status: 'Valid' | 'Duplikat' | 'Gagal';
    message: string;
    data?: {
      attendeeName: string;
      ticketCode: string;
      timestamp: string;
      method: string;
      email: string;
    };
  } | null;
  onReset: () => void;
}

export default function ScanResultCard({ payload, onReset }: ScanResultCardProps) {
  if (!payload) return null;

  const { success, status, message, data } = payload;

  const isSuccess = success && status === 'Valid';
  const isDuplicate = status === 'Duplikat';
  const isFailed = status === 'Gagal' || !success;

  // Aesthetic adjustments
  let containerBorder = 'border-emerald-200';
  let headerBg = 'bg-emerald-50';
  let badgeColor = 'bg-emerald-100 text-emerald-800 border bg-emerald-250';
  let iconElement = (
    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-300 animate-bounce">
      <Check className="w-8 h-8 stroke-[3]" />
    </div>
  );

  if (isDuplicate) {
    containerBorder = 'border-amber-200';
    headerBg = 'bg-amber-50';
    badgeColor = 'bg-amber-100 text-amber-850 border border-amber-250';
    iconElement = (
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 border border-amber-300 animate-pulse">
        <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
      </div>
    );
  } else if (isFailed) {
    containerBorder = 'border-rose-200';
    headerBg = 'bg-rose-50';
    badgeColor = 'bg-rose-100 text-rose-850 border border-rose-250';
    iconElement = (
      <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 border border-rose-300 animate-shake">
        <X className="w-8 h-8 stroke-[3]" />
      </div>
    );
  }

  // Animation variants
  const pulseVariant = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 200, damping: 15 }
    }
  };

  return (
    <motion.div
      variants={pulseVariant}
      initial="initial"
      animate="animate"
      className={`bg-white rounded-3xl border-2 ${containerBorder} shadow-xl overflow-hidden max-w-sm w-full mx-auto`}
    >
      <div className={`p-6 flex flex-col items-center text-center ${headerBg} border-b border-dashed border-slate-150`}>
        <div className="mb-3">
          {iconElement}
        </div>
        <span className={`inline-block font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-1.5 ${badgeColor}`}>
          Presensi {status}
        </span>
        <h3 className="font-extrabold text-sm text-slate-800 leading-snug">
          {message}
        </h3>
      </div>

      {data && (
        <div className="p-5 space-y-3.5 text-xs">
          <div className="flex gap-3 items-start">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 mt-0.5 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Nama Lengkap</span>
              <p className="font-extrabold text-slate-800 text-xs truncate leading-none mt-0.5">{data.attendeeName}</p>
            </div>
          </div>

          <div className="flex gap-3 items-start border-t border-slate-100 pt-3">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 mt-0.5 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Nomor Tiket / NIM</span>
              <p className="font-mono font-bold text-slate-700 text-xs mt-0.5">{data.ticketCode}</p>
            </div>
          </div>

          <div className="flex gap-3 items-start border-t border-slate-100 pt-3">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 mt-0.5 shrink-0">
              <Timer className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Waktu Presensi</span>
              <p className="font-mono font-bold text-slate-700 text-xs mt-0.5">{data.timestamp} {data.method === 'manual' ? '✍️' : '📷'}</p>
            </div>
          </div>
        </div>
      )}

      {!data && isFailed && (
        <div className="p-5 text-center text-xs text-slate-500 font-medium leading-relaxed">
          Pindai ulang atau gunakan tombol cari manual jika biodata peserta tidak tersimpan di daftar tiket terbit.
        </div>
      )}

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
        <button
          onClick={onReset}
          className="w-full h-10 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-sm flex items-center justify-center"
        >
          Pindai / Cari Baru
        </button>
      </div>
    </motion.div>
  );
}
