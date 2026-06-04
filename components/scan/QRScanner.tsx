'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { RefreshCw, CameraOff, Camera } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (result: string) => void;
}

export default function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [currentFacingMode, setCurrentFacingMode] = useState<"environment" | "user">("environment");

  const startScanner = (facing: "environment" | "user") => {
    setIsStarting(true);
    setError(null);

    const html5QrCode = new Html5Qrcode("qr-reader", {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });
    scannerRef.current = html5QrCode;

    html5QrCode.start(
      { facingMode: facing }, // kamera belakang di HP, webcam di desktop
      {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      (decodedText) => {
        // Play beep sound if browser supports AudioContext
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          if (audioCtx) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.08);
          }
        } catch (e) {}

        onScanSuccess(decodedText);
      },
      () => {} // abaikan error per-frame
    )
    .then(() => setIsStarting(false))
    .catch((err) => {
      console.error("Camera startup error", err);
      const errMsg = err?.toString() || '';
      if (errMsg.includes('Permission') || errMsg.includes('NotAllowedError')) {
        setError('Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.');
      } else if (errMsg.includes('NotFound') || errMsg.includes('DevicesNotFoundError')) {
        setError('Tidak ada kamera yang terdeteksi di perangkat ini.');
      } else {
        setError('Gagal mengakses kamera. Pastikan Anda memberikan izin kamera dan menggunakan koneksi HTTPS.');
      }
      setIsStarting(false);
    });
  };

  const handleToggleCamera = () => {
    const nextMode = currentFacingMode === "environment" ? "user" : "environment";
    setCurrentFacingMode(nextMode);

    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        scannerRef.current.stop()
          .then(() => {
            try {
              scannerRef.current?.clear();
            } catch (e) {}
            startScanner(nextMode);
          })
          .catch((err) => {
            console.error("Error stopping scanner to toggle camera", err);
            startScanner(nextMode);
          });
      } else {
        startScanner(nextMode);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      startScanner(currentFacingMode);
    }, 0);

    return () => {
      clearTimeout(timer);
      const activeScanner = scannerRef.current;
      if (activeScanner) {
        if (activeScanner.isScanning) {
          activeScanner.stop()
            .then(() => {
              try {
                activeScanner.clear();
              } catch (e) {}
            })
            .catch((e) => console.log("Quiet cleanup error", e));
        } else {
          try {
            activeScanner.clear();
          } catch (e) {}
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return (
    <div className="p-6 bg-red-50 text-red-700 rounded-3xl border border-red-200 text-center space-y-3 font-medium text-xs">
      <CameraOff className="w-8 h-8 text-red-500 mx-auto" />
      <p className="font-semibold leading-relaxed">{error}</p>
      <p className="text-[10px] text-red-500/80 font-normal leading-relaxed">
        Catatan: Pembukaan scanner di browser membutuhkan izin penuh. Jika Anda menggunakan iframe preview, coba buka aplikasi di Tab Baru.
      </p>
    </div>
  );

  return (
    <div className="w-full space-y-4">
      <div className="relative bg-slate-950 rounded-2xl overflow-hidden shadow-xl border-4 border-slate-900 aspect-square flex flex-col justify-center items-center">
        {isStarting && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-slate-900 gap-3 z-10">
            <svg className="animate-spin h-7 w-7 text-[#1976D2]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-[11px] text-slate-400 font-bold font-mono">Memulai kamera...</p>
          </div>
        )}
        <div id="qr-reader" className="w-full aspect-square" />
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleToggleCamera}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-extrabold text-xs uppercase px-4 py-2 rounded-xl border flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Toggle Kamera ({currentFacingMode === "environment" ? "Belakang" : "Depan"})
        </button>
      </div>
    </div>
  );
}
