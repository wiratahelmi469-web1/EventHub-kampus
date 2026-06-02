// ADDED: Universal beautiful Toast notification system
"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, AlertTriangle, Info, X, AlertCircle } from "lucide-react";

export interface ToastItem {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div 
      id="global-toast-container" 
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-3.5 max-w-sm w-full pointer-events-none select-none"
    >
      <AnimatePresence>
        {toasts.slice(0, 3).map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
      icon: <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />,
      bar: "bg-emerald-500"
    },
    error: {
      bg: "bg-rose-50 border-rose-200 text-rose-800",
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
      bar: "bg-rose-500"
    },
    warning: {
      bg: "bg-amber-50 border-amber-200 text-amber-800",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
      bar: "bg-amber-500"
    },
    info: {
      bg: "bg-blue-50 border-blue-200 text-blue-800",
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
      bar: "bg-blue-500"
    }
  };

  const styleObj = config[toast.type] || config.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 15 }}
      transition={{ type: "spring", damping: 18, stiffness: 180 }}
      layout
      id={`toast-${toast.id}`}
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border ${styleObj.bg} shadow-[0_10px_30px_rgba(0,0,0,0.06)] relative overflow-hidden`}
    >
      {styleObj.icon}
      
      <div className="flex-1 text-[13px] font-bold leading-tight pr-4">
        {toast.message}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0 active:scale-90"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Decorative progress shrink bar */}
      <motion.div 
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 4, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-[3px] ${styleObj.bar}`}
      />
    </motion.div>
  );
}
