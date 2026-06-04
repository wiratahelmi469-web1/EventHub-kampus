'use client';

import { useState } from 'react';
import { Search, UserCheck, AlertCircle, Sparkles } from 'lucide-react';

interface AbsenManualModalProps {
  eventId: string;
  scannedBy: string;
  onVerifySuccess: (result: any) => void;
}

export default function AbsenManualModal({ eventId, scannedBy, onVerifySuccess }: AbsenManualModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/attendance/search?event_id=${eventId}&q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results || []);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Gagal mencari peserta.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Terjadi kegagalan koneksi ke server.' });
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const handleMarkPresent = async (peserta: any) => {
    try {
      setStatusMsg(null);
      const res = await fetch('/api/attendance/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qr_code: peserta.email, // using email as look-up key for robustness
          event_id: eventId,
          scanned_by: scannedBy,
          method: 'manual',
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Mark as present in the local search results state immediately
        setSearchResults(prev =>
          prev.map(p => p.email === peserta.email ? { ...p, statusHadir: 'hadir' } : p)
        );
        onVerifySuccess(data);
      } else {
        if (data.status === 'Duplikat') {
          onVerifySuccess(data); // send to display "already checkin" result
        } else {
          setStatusMsg({ type: 'error', text: data.message || 'Gagal menandai kehadiran.' });
        }
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Terjadi kegagalan memproses kehadiran.' });
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            required
            placeholder="Cari nama, NIM, atau email peserta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-xs bg-white border border-slate-200 focus:border-[#114E8D] focus:outline-none rounded-xl font-medium"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="h-10 px-5 bg-[#114E8D] hover:bg-[#0D47A1] text-white disabled:bg-slate-300 font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center shrink-0 shadow-sm"
        >
          {isSearching ? 'Mencari...' : 'Cari'}
        </button>
      </form>

      {statusMsg && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
          statusMsg.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
        }`}>
          <AlertCircle className="w-4 h-4" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Results panel */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 min-h-[160px] max-h-[300px] overflow-y-auto space-y-2">
        {!hasSearched ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
            <Sparkles className="w-7 h-7 text-slate-300 mb-1" />
            <p className="text-[11px] font-bold font-mono">Siap Mencari</p>
            <p className="text-[10px] text-slate-400 max-w-xs mt-0.5 font-medium leading-relaxed">
              Masukkan pencarian nama untuk memproses absensi manual peserta yang tidak membawa tiket.
            </p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-bold text-xs font-mono">
            Tidak ada peserta yang cocok dengan kata pencarian.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 bg-white rounded-xl border overflow-hidden">
            {searchResults.map((p) => {
              const isCheckedIn = p.statusHadir === 'hadir';
              return (
                <div key={p.email} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/40 transition-colors">
                  <div className="min-w-0">
                    <p className="font-extrabold text-xs text-slate-800 leading-none truncate">{p.nama}</p>
                    <p className="text-[10px] text-slate-500 font-mono font-medium truncate mt-1">
                      {p.email} {p.nim ? `| NIM: ${p.nim}` : ''}
                    </p>
                    <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded mt-2 border ${
                      isCheckedIn 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      {isCheckedIn ? 'SUDAH HADIR' : 'MENUNGGU'}
                    </span>
                  </div>

                  {!isCheckedIn ? (
                    <button
                      type="button"
                      onClick={() => handleMarkPresent(p)}
                      className="h-8 px-4 font-black text-[9px] uppercase tracking-wider bg-[#114E8D] hover:bg-blue-800 text-white rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Tandai Hadir
                    </button>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-150">
                      <UserCheck className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
