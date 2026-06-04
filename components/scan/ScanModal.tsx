'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode, ClipboardList, Keyboard, Camera, CheckSquare } from 'lucide-react';
import QRScanner from './QRScanner';
import AbsenManualModal from './AbsenManualModal';
import ScanLog from './ScanLog';
import ScanResultCard from './ScanResultCard';
import { getEvents, saveEvents, EventWithCertificate } from '../../lib/certificateData';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  scannedByUserId?: string;
  scannedByUserName?: string;
  initialTab?: 'scan' | 'manual' | 'log';
}

export default function ScanModal({
  isOpen,
  onClose,
  scannedByUserId = 'panitia-1',
  scannedByUserName = 'Panitia BEM',
  initialTab = 'scan',
}: ScanModalProps) {
  const [activeTab, setActiveTab] = useState<'scan' | 'manual' | 'log'>(initialTab);
  const [events, setEvents] = useState<EventWithCertificate[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [logRefreshTrigger, setLogRefreshTrigger] = useState(0);

  // Sync state between client storage & server state helper
  const syncLocalCheckin = (eventId: string, email: string, name?: string) => {
    const list = getEvents();
    const eventIdx = list.findIndex(e => e.id === eventId);
    if (eventIdx !== -1) {
      const event = list[eventIdx];
      const pIdx = event.peserta.findIndex(p => p.email.toLowerCase() === email.toLowerCase());
      if (pIdx !== -1) {
        event.peserta[pIdx].statusHadir = 'hadir';
        list[eventIdx] = event;
        saveEvents(list);
      } else {
        // Otomatis OTS register
        const targetName = name || email.split('@')[0];
        const isGuest = email.toLowerCase().includes('guest') || email.toLowerCase().includes('tamu');
        const generatedNim = isGuest ? 'GUEST' : `NIM-${Math.floor(100000 + Math.random() * 900000)}`;
        event.peserta.push({
          nim: generatedNim,
          nama: targetName,
          email: email,
          statusHadir: 'hadir',
          sertifikatDownloaded: false,
          nomorSertifikat: `CERT-25-EVT${event.id}-${generatedNim}`
        });
        event.kuotaTerisi = Math.min(event.kuota, event.kuotaTerisi + 1);
        list[eventIdx] = event;
        saveEvents(list);
      }
      setEvents(getEvents());
    }
  };

  // Seeding events list on load
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const list = getEvents();
        setEvents(list);
        if (list.length > 0) {
          setSelectedEventId(list[0].id);
        }
        setActiveTab(initialTab);
        setScanResult(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialTab]);

  const handleScanSuccess = async (decodedText: string) => {
    if (!selectedEventId) return;
    try {
      const res = await fetch('/api/attendance/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qr_code: decodedText,
          event_id: selectedEventId,
          scanned_by: scannedByUserId,
          method: 'qr_scan',
        }),
      });

      const data = await res.json();
      setScanResult(data);

      if (data.success && data.data) {
        syncLocalCheckin(selectedEventId, data.data.email, data.data.attendeeName);
        setLogRefreshTrigger(prev => prev + 1);
      } else if (data.status === 'Duplikat' && data.data) {
        // Duplicate also provides user info
        setLogRefreshTrigger(prev => prev + 1);
      }
    } catch (e) {
      console.error('Scan verification request failed:', e);
      setScanResult({
        success: false,
        status: 'Gagal',
        message: 'Gagal menghubungi server untuk memverifikasi QR Code.',
      });
    }
  };

  const handleManualVerifySuccess = (result: any) => {
    setScanResult(result);
    if (result.success && result.data) {
      syncLocalCheckin(selectedEventId, result.data.email, result.data.attendeeName);
      setLogRefreshTrigger(prev => prev + 1);
    } else if (result.status === 'Duplikat') {
      setLogRefreshTrigger(prev => prev + 1);
    }
  };

  // Automatic reset counter for smooth, non-blocking scan cycles
  useEffect(() => {
    if (scanResult && scanResult.success && activeTab === 'scan') {
      const timer = setTimeout(() => {
        setScanResult(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scanResult, activeTab]);

  if (!isOpen) return null;

  const activeEvent = events.find(e => e.id === selectedEventId);

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex justify-center items-center p-4 z-550 select-none overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] shadow-2xl"
      >
        {/* Modal Header */}
        <div className="bg-[#114E8D] text-white p-5 border-b-4 border-amber-400 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider leading-none">Presensi Digital Kampus</h3>
              <p className="text-[10px] text-slate-200 mt-1 font-semibold leading-none">Operator: {scannedByUserName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Picker & Stats Subheader */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex-1 flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-450 whitespace-nowrap">Acara Aktif:</span>
              <select
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  setScanResult(null);
                }}
                className="w-full text-xs font-black text-slate-705 border border-slate-300 rounded-xl px-2 h-9 focus:border-[#114E8D] focus:outline-none bg-white"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    [{e.id}] {e.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom counter badge */}
            {activeEvent && (
              <div className="bg-blue-105 border border-blue-200 text-[#114E8D] px-3 py-1.5 rounded-xl font-bold text-[10.5px] leading-tight flex items-center gap-1 shrink-0">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>
                  Hadir:{' '}
                  <strong className="font-extrabold text-xs">
                    {activeEvent.peserta.filter(p => p.statusHadir === 'hadir').length}
                  </strong>{' '}
                  / {activeEvent.peserta.length}
                </span>
              </div>
            )}
          </div>

          {/* Navigation Tab Menu */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/70 rounded-xl">
            <button
              onClick={() => {
                setActiveTab('scan');
                setScanResult(null);
              }}
              className={`py-2 text-[10.5px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'scan' ? 'bg-white text-[#114E8D] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4" /> Scan QR
            </button>
            <button
              onClick={() => {
                setActiveTab('manual');
                setScanResult(null);
              }}
              className={`py-2 text-[10.5px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'manual' ? 'bg-white text-[#114E8D] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Keyboard className="w-4 h-4" /> Manual
            </button>
            <button
              onClick={() => {
                setActiveTab('log');
                setScanResult(null);
              }}
              className={`py-2 text-[10.5px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'log' ? 'bg-white text-[#114E8D] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-4 h-4" /> Log Absen
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 min-h-[300px]">
          <AnimatePresence mode="wait">
            {scanResult ? (
              <div className="py-2" key="result">
                <ScanResultCard
                  payload={scanResult}
                  onReset={() => setScanResult(null)}
                />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                key={activeTab}
                className="h-full"
              >
                {activeTab === 'scan' && (
                  <div className="max-w-xs mx-auto">
                    <QRScanner onScanSuccess={handleScanSuccess} />
                    <p className="text-[10px] text-center text-slate-400 mt-3.5 font-medium leading-relaxed">
                      Senter otomatis menyala. Arahkan lensa kamera perangkat ke kode QR digital e-ticket mahasiswa untuk presensi.
                    </p>
                  </div>
                )}

                {activeTab === 'manual' && (
                  <AbsenManualModal
                    eventId={selectedEventId}
                    scannedBy={scannedByUserId}
                    onVerifySuccess={handleManualVerifySuccess}
                  />
                )}

                {activeTab === 'log' && (
                  <ScanLog
                    eventId={selectedEventId}
                    refreshTrigger={logRefreshTrigger}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
