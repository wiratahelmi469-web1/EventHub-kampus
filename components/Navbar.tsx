// ADDED: Modular responsive unified Navbar
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Bell, LogOut, User, Menu, X, Award, Shield, CheckCircle2, Flame, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Navbar() {
  const router = useRouter();
  const { user, logoutUser, notifications, markNotificationsAsRead } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (nama: string) => {
    if (!nama) return "U";
    return nama
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const activeRole = user?.role || "guest";

  // Filter notifications based on actual user role
  const visibleNotifs = notifications.filter((n) =>
    n.roleVisibility.map(r => r.toLowerCase()).includes(activeRole.toLowerCase())
  );

  const unreadCount = visibleNotifs.filter((n) => n.isUnread).length;

  const handleMarkAllRead = () => {
    markNotificationsAsRead();
  };

  const getNotifIcon = (category: string) => {
    switch (category) {
      case "Sertifikat":
        return <Award className="w-4 h-4 text-emerald-500" />;
      case "Persetujuan":
        return <Shield className="w-4 h-4 text-purple-500" />;
      case "Tugas":
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-amber-500" />;
    }
  };

  const navMenuItems = [
    { title: "Beranda", path: `/dashboard/${activeRole === "staf" ? "staff" : activeRole}` },
    { title: "Daftar Event", path: "/events" },
  ];

  if (activeRole === "mahasiswa") {
    navMenuItems.push({ title: "Sesi RSVP", path: "/dashboard/mahasiswa/events" });
    navMenuItems.push({ title: "Riwayat & Sertifikat", path: "/dashboard/mahasiswa/riwayat" });
  } else if (activeRole === "panitia") {
    navMenuItems.push({ title: "Kelola Event", path: "/dashboard/panitia/events" });
    navMenuItems.push({ title: "Kelola Sertifikat", path: "/dashboard/panitia/sertifikat" });
  } else if (activeRole === "po") {
    navMenuItems.push({ title: "Approval Event", path: "/dashboard/po/approval" });
    navMenuItems.push({ title: "Approval Sertifikat", path: "/dashboard/po/sertifikat" });
    navMenuItems.push({ title: "Kelola Sesi", path: "/dashboard/po/events" });
  } else if (activeRole === "staf") {
    navMenuItems.push({ title: "Eksplorasi Sesi", path: "/dashboard/staf/events" });
  }

  return (
    <nav className="bg-[#114E8D] text-white w-full sticky top-0 z-[50] shadow-md border-b-[3.5px] border-amber-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">
          {/* Logo on Left */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.push(user ? `/dashboard/${activeRole === "staf" ? "staff" : activeRole}` : "/")}
              className="flex items-center gap-2 font-black tracking-tight text-lg cursor-pointer active:scale-95 transition-transform"
            >
              <div className="bg-amber-400 text-slate-950 p-1.5 rounded-xl flex items-center justify-center border border-white/20 shadow-md">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <span className="hidden sm:inline">EventHub <span className="text-amber-300">Kampus</span></span>
            </button>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/20 select-none">
              SI-DEMO
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navMenuItems.map((item) => (
              <button
                key={item.title}
                onClick={() => router.push(item.path)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-100 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                {item.title}
              </button>
            ))}
          </div>

          {/* Notification bell + User profile details + Hamburger (responsive layout) */}
          <div className="flex items-center gap-3">
            {/* Notifications Menu Trigger */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  if (!isNotifOpen) handleMarkAllRead();
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all relative shrink-0 cursor-pointer active:scale-95"
              >
                <Bell className="w-4.5 h-4.5 text-slate-100" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce border-2 border-[#114E8D]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Card */}
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 w-80 overflow-hidden z-[60]"
                  >
                    <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                      <span className="font-extrabold text-xs uppercase tracking-wider text-slate-500">
                        Notifikasi ({unreadCount} baru)
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] font-black text-[#1976D2] hover:underline"
                        >
                          Tandai baca semua
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {visibleNotifs.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400 font-bold font-mono">
                          Belum ada notifikasi baru.
                        </div>
                      ) : (
                        visibleNotifs.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3.5 flex gap-3 transition-colors ${
                              n.isUnread ? "bg-blue-50/45 hover:bg-blue-50/80" : "hover:bg-slate-50"
                            }`}
                          >
                            <div className="mt-0.5 bg-slate-150 p-1.5 rounded-lg shrink-0 flex items-center justify-center">
                              {getNotifIcon(n.category)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-extrabold text-[12px] text-slate-800 leading-tight">
                                {n.title}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                {n.description}
                              </p>
                              <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                                {n.timestamp}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile trigger badge */}
            <button
              onClick={() => router.push("/profile")}
              className="bg-white/5 border border-white/10 p-1 pr-3 rounded-full flex items-center gap-2 hover:bg-white/10 cursor-pointer text-left transition-all active:scale-98"
            >
              <div id="nav-user-avatar" className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 select-none border border-white/20">
                {user ? getInitials(user.nama) : "G"}
              </div>
              <div className="hidden lg:block min-w-0 pr-1 select-none">
                <p className="font-extrabold text-[11px] text-slate-100 max-w-[85px] leading-tight truncate">
                  {user ? user.nama : "Tamu Kampus"}
                </p>
                <div id="nav-user-badge" className="inline-block bg-amber-400 text-slate-950 font-black text-[8px] uppercase px-1.5 py-[1px] rounded tracking-widest leading-none mt-0.5">
                  {activeRole === "staf" ? "STAFF" : activeRole}
                </div>
              </div>
            </button>

            {/* Logout button (Desktop) */}
            {user ? (
              <button
                onClick={logoutUser}
                className="hidden md:flex p-2 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/15 text-slate-100 hover:text-rose-200 hover:border-rose-500/20 cursor-pointer transition-all active:scale-95 text-xs font-bold items-center gap-1.5 uppercase"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="hidden md:block text-xs uppercase font-extrabold bg-amber-400 hover:bg-amber-500 text-slate-950 px-3.5 py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                Masuk
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0A3D73] border-t border-white/10 px-4 pt-2.5 pb-4 space-y-2 select-none"
          >
            {navMenuItems.map((item) => (
              <button
                key={item.title}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push(item.path);
                }}
                className="block w-full text-left py-2 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-100 hover:bg-black/15 transition-all cursor-pointer"
              >
                {item.title}
              </button>
            ))}
            <div className="border-t border-white/10 pt-2.5 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push("/profile");
                }}
                className="w-full flex items-center gap-2.5 py-2 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-200 hover:bg-black/15 cursor-pointer"
              >
                <User className="w-4.5 h-4.5" /> Profil Saya
              </button>
              {user ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logoutUser();
                  }}
                  className="w-full flex items-center gap-2.5 py-2 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-rose-300 hover:bg-rose-500/10 cursor-pointer border border-rose-500/20"
                >
                  <LogOut className="w-4.5 h-4.5" /> Log Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push("/login");
                  }}
                  className="w-full text-center py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black tracking-wide text-xs uppercase"
                >
                  Masuk Sekarang
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
