"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Sparkles, GraduationCap } from "lucide-react";

export default function SplashPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Smooth loading animation over 2.5 seconds
  useEffect(() => {
    const totalDuration = 2500; // 2.5 seconds
    const intervalTime = 50; 
    const stepSize = 100 / (totalDuration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsLoaded(true);
          return 100;
        }
        return prev + stepSize;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  const handleGuestAccess = () => {
    if (typeof window !== "undefined") {
      // Set the guest session to localStorage as specified
      localStorage.setItem("eventhub_auth", JSON.stringify({
        email: "guest@kampus.ac.id",
        role: "guest",
        nama: "Tamu Universitas",
        isLoggedIn: true
      }));
      
      // Navigate to dashboard 
      router.push("/dashboard/guest");
    }
  };

  return (
    <div 
      id="splash-layout" 
      className="min-h-[100dvh] w-full bg-gradient-to-br from-[#1976D2] to-[#0D47A1] text-white flex flex-col items-center justify-center px-6 md:px-0 relative overflow-hidden"
    >
      {/* Radiant glows for premium brand appearance */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main card container */}
      <div className="w-full max-w-[460px] flex flex-col items-center justify-center text-center z-10">
        
        {/* Logo Icon Container with bounce & pulse animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mb-6 shrink-0"
        >
          {/* Logo container: 72px on mobile, 96px on desktop */}
          <div className="w-[72px] h-[72px] md:w-[96px] md:h-[96px] bg-amber-400 text-slate-950 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-[0_8px_30px_rgb(251,191,36,0.3)] border-2 border-white/20 select-none">
            <GraduationCap className="w-10 h-10 md:w-14 md:h-14 text-slate-900" />
          </div>
          <motion.div 
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute -top-1 -right-1 bg-rose-500 text-white p-1 rounded-full border-2 border-white shadow-md"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
          </motion.div>
        </motion.div>

        {/* Heading: text-3xl on mobile, text-5xl on desktop */}
        <motion.h1 
          className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-sm mb-1.5 selection:bg-amber-400 selection:text-slate-900"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          EventHub Kampus
        </motion.h1>

        {/* Subtitle: text-xs on mobile, text-sm on desktop */}
        <motion.p 
          className="text-amber-300 font-extrabold uppercase tracking-widest text-[11px] md:text-xs mb-6 select-none"
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          &quot;Kelola Event Kampus, Satu Platform&quot;
        </motion.p>

        {/* Auxiliary info */}
        <motion.p 
          className="text-[13px] md:text-sm text-blue-100 font-medium max-w-[340px] leading-relaxed mb-8 select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Implementasi Design Thinking (Empathize &rarr; Define &rarr; Ideate &rarr; Prototype &rarr; Test) Jurusan Sistem Informasi.
        </motion.p>

        {/* Loading Progress & Control Container */}
        <div className="w-full flex flex-col items-center justify-center min-h-[140px]">
          <AnimatePresence mode="wait">
            {!isLoaded ? (
              <motion.div 
                key="loader"
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-col items-center"
              >
                {/* Progress bar: 80% on mobile, max-width 320px on desktop */}
                <div className="w-[80%] md:w-full md:max-w-[325px] bg-slate-900/40 h-2.5 rounded-full overflow-hidden border border-white/10 p-[1.5px] mb-3">
                  <div 
                    style={{ width: `${progress}%` }}
                    className="bg-amber-400 h-full rounded-full transition-all duration-100 ease-out shadow-[0_0_10px_#fbbf24]"
                  ></div>
                </div>

                <p className="text-xs text-blue-200 font-extrabold animate-pulse tracking-wide font-mono">
                  Menghubungkan ke Kampus... {Math.round(progress)}%
                </p>
              </motion.div>
            ) : (
              /* Buttons: full width on mobile, max-width 360px on desktop, min-height 52px */
              <motion.div 
                key="buttons"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 15 }}
                className="w-full max-w-[360px] flex flex-col gap-3.5 px-4 md:px-0"
              >
                <button
                  type="button"
                  id="btn-login-splash"
                  onClick={() => router.push("/login")}
                  className="w-full bg-white hover:bg-slate-50 active:scale-[0.98] text-[#1976D2] min-h-[52px] rounded-2xl font-black text-sm tracking-wide shadow-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer touch-manipulation hover:shadow-2xl hover:shadow-white/10"
                >
                  Lanjut ke Login <ArrowRight className="w-5 h-5 text-[#1976D2] stroke-[2.5]" />
                </button>
                
                <button
                  type="button"
                  id="btn-guest-splash"
                  onClick={handleGuestAccess}
                  className="w-full bg-slate-900/35 hover:bg-slate-900/50 active:scale-[0.98] text-white min-h-[52px] rounded-2xl font-black text-xs tracking-wider uppercase transition-all duration-150 border border-white/15 cursor-pointer touch-manipulation flex items-center justify-center gap-2 hover:border-amber-400/50"
                >
                  Mulai Sebagai Tamu <Sparkles className="w-4 h-4 text-amber-300" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Footer System Spec Details */}
      <div className="absolute bottom-6 text-[10px] text-white/50 tracking-widest font-bold font-mono text-center">
        SISTEM INFORMASI &bull; EMULATION ENGINE v1.0.4-BUILD.STABLE
      </div>
    </div>
  );
}
