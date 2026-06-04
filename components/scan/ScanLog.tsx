'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, RefreshCw, Eye } from 'lucide-react';

interface ScanLogProps {
  eventId: string;
  refreshTrigger?: number;
}

export default function ScanLog({ eventId, refreshTrigger = 0 }: ScanLogProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    if (!eventId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/attendance/log?event_id=${eventId}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Error fetching attendance logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, refreshTrigger]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Valid':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-1.5 py-0.5 text-[8.5px] font-black uppercase">Valid</span>;
      case 'Duplikat':
        return <span className="bg-amber-50 text-amber-700 border border-amber-100 rounded px-1.5 py-0.5 text-[8.5px] font-black uppercase">Duplikat</span>;
      default:
        return <span className="bg-rose-50 text-rose-700 border border-rose-100 rounded px-1.5 py-0.5 text-[8.5px] font-black uppercase">Gagal</span>;
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-center bg-slate-50 border p-3 rounded-2xl">
        <h4 className="text-[11px] font-black uppercase tracking-widest text-[#114E8D] flex items-center gap-1.5">
          <ClipboardList className="w-4 h-4" /> Live Log Absen Hari Ini
        </h4>
        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="text-slate-500 hover:text-[#114E8D] p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer disabled:opacity-50 transition-colors"
          title="Sinkronisasi manual"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-100 rounded-2xl">
        <table className="w-full text-left text-[11px] font-bold">
          <thead>
            <tr className="bg-slate-100 text-slate-500 font-black uppercase tracking-wider text-[9px] border-b">
              <th className="py-2.5 px-3">Waktu</th>
              <th className="py-2.5 px-3">Nama Peserta</th>
              <th className="py-2.5 px-3">Tiket/NIM</th>
              <th className="py-2.5 px-3">Metode</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400 font-mono text-[10.5px]">
                  {isLoading ? 'Melakukan sinkronisasi...' : 'Belum ada rekaman presensi masuk hari ini.'}
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 font-mono">{log.timestamp}</td>
                  <td className="py-2.5 px-3 text-slate-800 font-black truncate max-w-[120px]">{log.attendeeName}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-650">{log.ticketCode}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-500 font-sans">
                    {log.method === 'qr_scan' ? '📷 Scan QR' : '✍️ Manual'}
                  </td>
                  <td className="py-2.5 px-3 text-center align-middle">{getStatusBadge(log.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
