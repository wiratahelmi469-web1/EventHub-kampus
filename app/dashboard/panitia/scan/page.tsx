"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { getEvents, saveEvents, EventWithCertificate, PesertaItem } from "../../../../lib/certificateData";
import { processTicketScan, ScanResultPayload } from "../../../../lib/scanUtils";
import ScanResult from "../../../../components/ScanResult";
import { 
  Camera, Keyboard, Search, UserCheck, Users, HelpCircle, ShieldAlert, Check, RefreshCw 
} from "lucide-react";

export default function PanitiaScanPage() {
  const router = useRouter();
  const { user, addToast } = useAuth();

  // Guard: panitia only
  useEffect(() => {
    if (user && user.role !== "panitia") {
      router.replace(`/dashboard/${user.role === "staf" ? "staff" : user.role}`);
    }
  }, [user, router]);

  // States
  const [events, setEvents] = useState<EventWithCertificate[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [scanResult, setScanResult] = useState<ScanResultPayload | null>(null);
  const [activeTab, setActiveTab] = useState<"camera" | "manual" | "list">("camera");
  const [manualCode, setManualCode] = useState<string>("");
  const [searchMemberQuery, setSearchMemberQuery] = useState<string>("");
  const [listFilter, setListFilter] = useState<"semua" | "menunggu" | "hadir">("semua");

  // Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const qrScannerRef = useRef<any>(null);

  // Load events
  useEffect(() => {
    const timer = setTimeout(() => {
      const list = getEvents();
      // Only display events owned / created by this panitia (if configured), or all if none
      const owned = list.filter(e => !e.pengajuEmail || e.pengajuEmail.toLowerCase() === user?.email?.toLowerCase());
      setEvents(owned.length > 0 ? owned : list);
      
      const activeList = owned.length > 0 ? owned : list;
      if (activeList.length > 0) {
        setSelectedEventId(activeList[0].id);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  // Handle active event change
  const currentEvent = events.find(e => e.id === selectedEventId);

  // Lazy load html5-qrcode
  useEffect(() => {
    if (!cameraActive || typeof window === "undefined" || activeTab !== "camera") {
      cleanupScanner();
      return;
    }

    let isMounted = true;
    let html5QrcodeScannerModule: any = null;

    import("html5-qrcode")
      .then((mod) => {
        if (!isMounted) return;
        html5QrcodeScannerModule = mod;
        
        // Timeout to ensure the container is fully rendered in DOM
        setTimeout(() => {
          if (!isMounted) return;
          try {
            const scanner = new mod.Html5QrcodeScanner(
              "qr-reader-panel",
              { 
                fps: 10, 
                qrbox: { width: 260, height: 260 },
                aspectRatio: 1.0
              },
              /* verbose= */ false
            );

            qrScannerRef.current = scanner;

            const onScanSuccess = (decodedText: string) => {
              // Beep sound feedback
              try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                if (audioCtx) {
                  const osc = audioCtx.createOscillator();
                  const gain = audioCtx.createGain();
                  osc.connect(gain);
                  gain.connect(audioCtx.destination);
                  osc.frequency.setValueAtTime(880, audioCtx.currentTime); // high pitched beep
                  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
                  osc.start();
                  osc.stop(audioCtx.currentTime + 0.1);
                }
              } catch (e) {}

              const res = processTicketScan(decodedText);
              setScanResult(res);
              setCameraActive(false); // pause camera showing result
              
              // refresh local state list
              setEvents(getEvents());
            };

            const onScanFailure = (error: any) => {
              // quiet standard scanning frames failures
            };

            scanner.render(onScanSuccess, onScanFailure);
            setScannerError(null);
          } catch (err: any) {
            console.error("Scanner rendering error", err);
            setScannerError(
              "Tidak dapat mengaktifkan kamera. Pastikan izin kamera diizinkan atau coba buka di Tab Baru."
            );
          }
        }, 300);
      })
      .catch((err) => {
        console.error("Failed to load html5-qrcode", err);
      });

    return () => {
      isMounted = false;
      cleanupScanner();
    };
  }, [cameraActive, activeTab]);

  const cleanupScanner = () => {
    if (qrScannerRef.current) {
      try {
        qrScannerRef.current.clear().catch((e: any) => console.log("cleanup error quiet", e));
      } catch (e) {}
      qrScannerRef.current = null;
    }
  };

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      addToast("Harap masukkan kode QR payload tiket.", "error");
      return;
    }

    const res = processTicketScan(manualCode.trim());
    setScanResult(res);
    setManualCode("");
    
    // Refresh local list
    const updatedList = getEvents();
    setEvents(updatedList);

    if (res.success) {
      addToast("Validasi tiket berhasil!", "success");
    } else {
      addToast(res.message, "error");
    }
  };

  // Perform quick check-in for registered participant list
  const handleQuickCheckin = (memberEmail: string) => {
    if (!currentEvent) return;

    // Create a virtual payload: "EVENTHUB-TICKET:eventId:email:name"
    const participant = currentEvent.peserta.find(p => p.email.toLowerCase() === memberEmail.toLowerCase());
    if (!participant) return;

    const payload = `EVENTHUB-TICKET:${currentEvent.id}:${participant.email}:${participant.nama}`;
    const res = processTicketScan(payload);

    // Refresh list
    const updated = getEvents();
    const owned = updated.filter(e => !e.pengajuEmail || e.pengajuEmail.toLowerCase() === user?.email?.toLowerCase());
    setEvents(owned.length > 0 ? owned : updated);

    addToast(`Presensi ${participant.nama} berhasil dicatat! 🎉`, "success");
  };

  // Reset scan result state
  const handleClearResult = () => {
    setScanResult(null);
    setCameraActive(true); // resume scanner automatically
  };

  // Filter dynamic attendee member list
  const filteredPeserta = currentEvent?.peserta.filter(p => {
    const term = searchMemberQuery.toLowerCase();
    const queryMatches = p.nama.toLowerCase().includes(term) || p.nim.toLowerCase().includes(term) || p.email.toLowerCase().includes(term);
    
    if (listFilter === "semua") return queryMatches;
    if (listFilter === "menunggu") return queryMatches && p.statusHadir === "menunggu";
    if (listFilter === "hadir") return queryMatches && p.statusHadir === "hadir";
    return queryMatches;
  }) || [];

  return (
    <div className="space-y-6">
      
      {/* Dynamic Selector Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            NFC & QR Code Ticket Scanner
          </h1>
          <p className="text-xs text-[#1976D2] font-semibold mt-1">
            Validasi Tiket & Catat Presensi Kehadiran Mahasiswa
          </p>
        </div>

        {/* Dropdown Event Selector */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold tracking-wider uppercase whitespace-nowrap">Event Aktif:</span>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full md:w-80 h-[42px] border border-slate-300 rounded-xl px-3 bg-slate-50 text-slate-705 focus:border-[#114E8D] focus:outline-none font-bold text-xs"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                [{e.id}] {e.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {scanResult ? (
        /* Result Dialog overlay view */
        <div className="max-w-md mx-auto py-8">
          <ScanResult result={scanResult} onClear={handleClearResult} />
        </div>
      ) : (
        /* Standard scan tab options layout container */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Scanning Interaction Control Panel (Left column - 7 span) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[480px]">
            
            {/* View tabs bar */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("camera");
                  setCameraActive(true);
                }}
                className={`flex-1 flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "camera" 
                    ? "bg-[#114E8D] text-white shadow-md shadow-[#114E8D]/15" 
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Camera className="w-4 h-4" /> Kamera Scanner
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setActiveTab("manual");
                  setCameraActive(false);
                }}
                className={`flex-1 flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "manual" 
                    ? "bg-[#114E8D] text-white shadow-md shadow-[#114E8D]/15" 
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Keyboard className="w-4 h-4" /> Masukkan Kode
              </button>
            </div>

            {/* Content view body based on active tab state */}
            <div className="flex-1 p-6 flex flex-col justify-center items-center min-h-[380px]">
              {activeTab === "camera" && (
                <div className="w-full flex flex-col items-center">
                  {!cameraActive ? (
                    <div className="flex flex-col items-center text-center p-8 border-4 border-dashed border-slate-100 rounded-3xl max-w-sm">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-[#114E8D] mb-4 shadow-sm">
                        <Camera className="w-8 h-8" />
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-800">
                        Kamera Scanner Non-aktif
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 pb-4 leading-relaxed font-semibold">
                        Gunakan kamera perangkat Anda untuk menscan tiket QR code mahasiswa di lokasi pendaftaran event secara instant.
                      </p>
                      <button
                        type="button"
                        onClick={() => setCameraActive(true)}
                        className="h-[42px] px-6 text-xs bg-[#114E8D] hover:bg-[#0D47A1] text-white font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        Aktifkan Kamera
                      </button>
                    </div>
                  ) : (
                    <div className="w-full max-w-md bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative border-4 border-slate-950 p-2">
                      {scannerError ? (
                        <div className="p-8 text-center text-rose-200 bg-rose-950/90 rounded-xl">
                          <ShieldAlert className="w-10 h-10 mx-auto text-rose-400 mb-2" />
                          <p className="text-xs font-bold font-mono">{scannerError}</p>
                          <button
                            onClick={() => {
                              cleanupScanner();
                              setCameraActive(false);
                              setTimeout(() => setCameraActive(true), 200);
                            }}
                            className="mt-4 px-3.5 py-1.5 bg-rose-800 rounded-lg text-[10px] uppercase font-bold tracking-wider hover:bg-rose-700"
                          >
                            Ulangi Kamera
                          </button>
                        </div>
                      ) : (
                        <div>
                          {/* Target Container element for HTML5 QR Scanner */}
                          <div id="qr-reader-panel" className="w-full rounded-lg overflow-hidden md:min-h-[280px]"></div>
                          
                          <div className="bg-slate-950/75 p-3 text-center text-[10px] text-amber-300 font-extrabold tracking-wide border-t border-slate-900 uppercase">
                            Posisikan QR Code di dalam kotak target kamera
                          </div>
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => {
                          cleanupScanner();
                          setCameraActive(false);
                        }}
                        className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white font-semibold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/10"
                      >
                        Tutup Kamera
                      </button>
                    </div>
                  )}

                  {/* Smart simulation notice helpful for developers and sandboxed users */}
                  <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2.5 max-w-md">
                    <HelpCircle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                      <strong className="text-amber-800">Tips Pengujian:</strong> Jika kamera diblokir oleh sandbox iframe Google, salin payload QR tiket dari tab <strong className="text-slate-800">&quot;Masukkan Kode&quot;</strong> atau gunakan daftar tab di sebelah kanan untuk menandai kehadiran.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "manual" && (
                <form onSubmit={handleManualCodeSubmit} className="w-full max-w-md space-y-4">
                  <div className="text-center pb-2">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 mx-auto mb-2">
                      <Keyboard className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-800">
                      Entri Simulator & Payload Scanner Manual
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-semibold leading-relaxed">
                      Simulasikan hasil pemindaian barcode dengan memasukkan teks string format payload QR secara langsung.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">
                      Payload QR Code / Payload Tiket
                    </label>
                    <textarea
                      rows={3}
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="Contoh: EVENTHUB-TICKET:EVT001:mahasiswa@nurulfikri.ac.id:Budi Santoso"
                      className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-[#114E8D]"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-[44px] bg-[#114E8D] hover:bg-[#0D47A1] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Uji & Dekode String Payload
                  </button>

                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5 text-[11px] text-slate-500">
                    <span className="font-bold underline block">Contoh Payload Demo:</span>
                    <ul className="list-disc pl-4 space-y-1 font-mono text-[10px] text-slate-600">
                      <li className="cursor-pointer hover:text-blue-600 select-all" onClick={() => setManualCode(`EVENTHUB-TICKET:${selectedEventId}:budi.mahasiswa@nurulfikri.ac.id:Budi Santoso`)}>
                        EVENTHUB-TICKET:{selectedEventId}:budi.mahasiswa@nurulfikri.ac.id:Budi Santoso
                      </li>
                      <li className="cursor-pointer hover:text-blue-600 select-all" onClick={() => setManualCode(`EVENTHUB-TICKET:${selectedEventId}:guest.helmi@gmail.com:Helmi Wirata`)}>
                        EVENTHUB-TICKET:{selectedEventId}:guest.helmi@gmail.com:Helmi Wirata
                      </li>
                    </ul>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Attendee / Registration Checklist panel (Right column - 5 span) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden min-h-[480px]">
            
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block font-mono">Daftar Kehadiran Event</h2>
              <span className="text-xs font-black text-slate-700 block mt-0.5 truncate">{currentEvent?.nama || "Pilih Event Aktif"}</span>
            </div>

            {/* Filters panel inside checklist */}
            <div className="p-3 bg-white border-b border-slate-100 flex flex-col gap-2">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchMemberQuery}
                  onChange={(e) => setSearchMemberQuery(e.target.value)}
                  placeholder="Cari nama, NIM, email..."
                  className="w-full h-9 pl-9 pr-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#114E8D]"
                />
              </div>

              {/* Status checklist buttons */}
              <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setListFilter("semua")}
                  className={`py-1 text-[10px] font-bold rounded-md transition-all ${
                    listFilter === "semua" ? "bg-white text-[#114E8D] shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Semua ({currentEvent?.peserta.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setListFilter("menunggu")}
                  className={`py-1 text-[10px] font-bold rounded-md transition-all ${
                    listFilter === "menunggu" ? "bg-white text-[#114E8D] shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Menunggu ({currentEvent?.peserta.filter(p => p.statusHadir === "menunggu").length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setListFilter("hadir")}
                  className={`py-1 text-[10px] font-bold rounded-md transition-all ${
                    listFilter === "hadir" ? "bg-white text-[#114E8D] shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Hadir ({currentEvent?.peserta.filter(p => p.statusHadir === "hadir").length || 0})
                </button>
              </div>
            </div>

            {/* Dynamic Interactive Attendee List Panel */}
            <div className="flex-1 overflow-y-auto max-h-[350px] divide-y divide-slate-100">
              {filteredPeserta.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-bold font-mono">
                  Tidak ada data cocok.
                </div>
              ) : (
                filteredPeserta.map((m) => {
                  const isCheckedIn = m.statusHadir === "hadir";
                  return (
                    <div key={m.email} className="p-3.5 flex items-center justify-between gap-2.5 hover:bg-slate-50/50 transition-all">
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs text-slate-800 leading-none truncate">{m.nama}</p>
                        <p className="text-[10px] text-slate-500 font-mono font-medium truncate mt-0.5">{m.email} {m.nim ? `| ${m.nim}` : ""}</p>
                        
                        <span className={`inline-block text-[8px] font-black uppercase px-1.5 py-[1.5px] rounded mt-1.5 ${
                          isCheckedIn 
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}>
                          {isCheckedIn ? "HADIR" : "MENUNGGU"}
                        </span>
                      </div>

                      {/* Manual Quick Action Checkin Check mark Button */}
                      {!isCheckedIn ? (
                        <button
                          type="button"
                          onClick={() => handleQuickCheckin(m.email)}
                          className="h-[28px] px-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-100 hover:bg-[#114E8D] text-slate-700 hover:text-white transition-all cursor-pointer flex items-center gap-1 hover:shadow-sm"
                        >
                          Tandai Hadir <Check className="w-3 h-3" />
                        </button>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                          <UserCheck className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
