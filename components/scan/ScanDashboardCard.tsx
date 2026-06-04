'use client';

import { useState, useEffect } from 'react';
import { QrCode, ClipboardList, UserCheck, Keyboard, ArrowRight } from 'lucide-react';
import ScanModal from './ScanModal';
import { getEvents, EventWithCertificate } from '../../lib/certificateData';

export default function ScanDashboardCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialModalTab, setInitialModalTab] = useState<'scan' | 'manual' | 'log'>('scan');
  const [activeEvent, setActiveEvent] = useState<EventWithCertificate | null>(null);

  const fetchActiveStats = () => {
    const list = getEvents();
    if (list.length > 0) {
      // Pick the first approved active event to show statistics
      const target = list.find((e) => e.status === 'approved' || e.eventStatus === 'buka') || list[0];
      setActiveEvent(target);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchActiveStats();
    }, 0);
    // Refresh statistics periodically
    const handle = setInterval(fetchActiveStats, 5000);
    return () => {
      clearTimeout(timer);
      clearInterval(handle);
    };
  }, []);

  const openScan = () => {
    setInitialModalTab('scan');
    setIsModalOpen(true);
  };

  const openManual = () => {
    setInitialModalTab('manual');
    setIsModalOpen(true);
  };

  const hadirCount = activeEvent?.peserta.filter(p => p.statusHadir === 'hadir').length || 0;
  const totalCount = activeEvent?.peserta.length || 0;

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
        <div className="space-y-3.5 max-w-sm">
          <div className="flex gap-2.5 items-center">
            <div className="w-10 h-10 bg-blue-50 text-[#114E8D] rounded-2xl flex items-center justify-center">
              <QrCode className="w-5.5 h-5.5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 leading-tight">
                Scan Kehadiran
              </h3>
              <p className="text-[10px] text-[#1976D2] font-black uppercase tracking-wider mt-0.5">
                Kepanitiaan & Loket Pendaftaran
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Pindai e-ticket mahasiswa penonton/peserta acara atau lakukan verifikasi absensi manual dengan mencari data registrasi mereka.
          </p>

          {activeEvent && (
            <div className="space-y-1 bg-slate-50 border p-3 rounded-2xl">
              <span className="text-[8.5px] font-black uppercase text-slate-400 block tracking-widest font-mono">Event Panitia:</span>
              <p className="text-xs font-extrabold text-slate-800 line-clamp-1 leading-none">{activeEvent.nama}</p>
              
              <div className="flex gap-3 mt-1.5 font-mono text-[10px] font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  💡 Hadir: <strong className="text-emerald-700 font-extrabold text-xs">{hadirCount}</strong> / {totalCount}
                </span>
                <span className="text-slate-350">|</span>
                <span className="flex items-center gap-1">
                  📋 Sisa: <strong className="text-[#114E8D] font-extrabold text-xs">{totalCount - hadirCount}</strong>
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col justify-center gap-2.5 shrink-0 select-none">
          <button
            onClick={openScan}
            className="h-[44px] px-5 bg-[#114E8D] hover:bg-blue-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-[#114E8D]/15"
          >
            <QrCode className="w-4 h-4" /> Buka Scanner Kamera
          </button>

          <button
            onClick={openManual}
            className="h-[44px] px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase tracking-wider rounded-2xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 border"
          >
            <Keyboard className="w-4 h-4" /> Absen Manual (Cari User)
          </button>
        </div>
      </div>

      <ScanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchActiveStats(); // refresh statistics
        }}
        initialTab={initialModalTab}
        scannedByUserName="Panitia Divisi Registrasi"
      />
    </>
  );
}
