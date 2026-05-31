'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Bell, Check, X, Shield, Calendar, MapPin, Clock, LogIn, LogOut, CheckSquare, 
  ChevronRight, AlertTriangle, MessageSquare, Send, BarChart2, Info, User, HelpCircle, 
  Bookmark, Share2, Ticket, Award, Download, ArrowRight, Eye, Laptop, ShieldAlert, Sparkles, Filter
} from 'lucide-react';
import { 
  INITIAL_EVENTS, INITIAL_TASKS, INITIAL_RUNDOWN, INITIAL_CHAT, 
  INITIAL_DIVISIONS, INITIAL_NOTIFICATIONS, USER_FLOWS, RBAC_MATRIX,
  EventItem, TaskItem, RundownItem, ChatMessage, DivisionProgress, NotificationItem
} from '../lib/mockData';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { signOut } from 'next-auth/react';

export default function Workspace({ role: initialRole }: { role?: 'guest' | 'mahasiswa' | 'panitia' | 'po' | 'staf' }) {
  const { user, role: sessionRole } = useCurrentUser();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Current user role point-of-view state
  const [currentUserRole, setCurrentUserRole] = useState<'guest' | 'mahasiswa' | 'panitia' | 'po' | 'staf'>(initialRole || 'po');
  const [activeTab, setActiveTab] = useState<'beranda' | 'jelajahi' | 'tugas' | 'koordinasi' | 'event_saya' | 'notif' | 'profil'>(
    (initialRole === 'mahasiswa' || initialRole === 'guest') ? 'jelajahi' : 'beranda'
  );

  useEffect(() => {
    const targetRole = sessionRole || initialRole;
    if (targetRole && targetRole !== currentUserRole) {
      const timer = setTimeout(() => {
        setCurrentUserRole(targetRole);
        setActiveTab((targetRole === 'mahasiswa' || targetRole === 'guest') ? 'jelajahi' : 'beranda');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [sessionRole, initialRole, currentUserRole]);

  
  // App state
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [rundown, setRundown] = useState<RundownItem[]>(INITIAL_RUNDOWN);
  const [chats, setChats] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [divisions, setDivisions] = useState<DivisionProgress[]>(INITIAL_DIVISIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  
  // Interactive client state
  const [selectedEvent, setSelectedEvent] = useState<EventItem>(INITIAL_EVENTS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('Semua');
  const [activeFlowIndex, setActiveFlowIndex] = useState<number>(0);
  const [activeFlowStep, setActiveFlowStep] = useState<number>(0);
  
  // Custom states for simulations
  const [chatInput, setChatInput] = useState('');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isRSVPModalOpen, setIsRSVPModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isSplashOpen, setIsSplashOpen] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  // Archive data states
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [eventRating, setEventRating] = useState(5);
  
  // RSVP Form States
  const [rsvpName, setRsvpName] = useState('Helmi Wirata');
  const [rsvpNim, setRsvpNim] = useState('1202220136');
  const [rsvpEmail, setRsvpEmail] = useState('mahasiswa@univ.ac.id');
  const [rsvpPhone, setRsvpPhone] = useState('08123456789');
  const [rsvpSession, setRsvpSession] = useState('Sesi Utama (08:30)');
  const [rsvpAgreed, setRsvpAgreed] = useState(true);
  
  // Search state for tasks in kanban
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newTaskDueDate, setNewTaskDueDate] = useState('Besok, 13.00');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Bagus S.');

  // Simulated live counter of events joined by current user (Mahasiswa)
  const [registeredEvents, setRegisteredEvents] = useState<string[]>(['evt-3']); // Joined seminar-3 initially
  const [savedEvents, setSavedEvents] = useState<string[]>(['evt-2']); // Bookmarked event 2

  // For Guest Manual inputs
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestInst, setGuestInst] = useState('');

  // Toast / System updates alerting privacy filters or state changes
  const [toastMessage, setToastMessage] = useState<string | null>("Selamat datang di Project EventHub Kampus. Gunakan Role PO/Panitia/Staf di kanan atas untuk menguji Dashboard internal.");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 4500);
  };

  // Notification security filtering - Based on revised requirement
  const notificationFilter = (notif: NotificationItem, role: 'guest' | 'mahasiswa' | 'panitia' | 'po' | 'staf') => {
    // 1. Roles are validated according to the visibility whitelist
    const isAllowedByRole = notif.visibility.includes(role);
    
    // 2. Extra safety constraint: Hide all internal data from Mahasiswa & Guest even if visibility logic is compromised.
    if ((role === 'mahasiswa' || role === 'guest') && notif.isInternal) {
      return false;
    }
    
    return isAllowedByRole;
  };

  // Filter & count notifications for active POV
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => notificationFilter(n, currentUserRole));
  }, [notifications, currentUserRole]);

  const unreadNotifCount = useMemo(() => {
    return filteredNotifications.filter(n => n.isUnread).length;
  }, [filteredNotifications]);

  // Adjust bottom navigation defaults when role changes
  const handleRoleChange = (role: 'guest' | 'mahasiswa' | 'panitia' | 'po' | 'staf') => {
    setCurrentUserRole(role);
    // If Admin-like POV, set default tab to "beranda" (which translates to dashboard)
    // If Student-like or Guest, default to "jelajahi" (which maps to client feed)
    if (role === 'guest' || role === 'mahasiswa') {
      setActiveTab('jelajahi');
    } else {
      setActiveTab('beranda');
    }
    showToast(`Role dialihkan ke: ${role.toUpperCase()}. ${role === 'mahasiswa' || role === 'guest' ? 'Data Internal & Admin disembunyikan otomatis untuk Privasi.' : 'Akses Penuh Command Center dibuka.'}`);
  };

  // Flow simulator navigation logic
  const handleFlowStepClick = (index: number, stepIndex: number) => {
    setActiveFlowIndex(index);
    setActiveFlowStep(stepIndex);
    const flow = USER_FLOWS[index];
    const step = flow.steps[stepIndex];
    
    // Auto translate step screen to real view
    if (step.screen === 'splash') {
      setIsSplashOpen(true);
      setIsLoginOpen(false);
    } else if (step.screen === 'discover') {
      setIsSplashOpen(false);
      setIsLoginOpen(false);
      if (currentUserRole !== 'mahasiswa' && currentUserRole !== 'guest') {
        setCurrentUserRole('mahasiswa');
      }
      setActiveTab('jelajahi');
    } else if (step.screen === 'detail_mahasiswa') {
      setIsSplashOpen(false);
      setIsLoginOpen(false);
      if (currentUserRole !== 'mahasiswa' && currentUserRole !== 'guest') {
        setCurrentUserRole('mahasiswa');
      }
      setActiveTab('jelajahi');
      setSelectedEvent(events[0]);
    } else if (step.screen === 'modal_daftar') {
      setIsSplashOpen(false);
      setIsLoginOpen(false);
      setActiveTab('jelajahi');
      setIsRSVPModalOpen(true);
    } else if (step.screen === 'ticket') {
      setIsSplashOpen(false);
      setIsRSVPModalOpen(false);
      setIsSuccessModalOpen(true);
      setActiveTab('event_saya');
    } else if (step.screen === 'dashboard') {
      setIsSplashOpen(false);
      setIsLoginOpen(false);
      if (currentUserRole === 'mahasiswa' || currentUserRole === 'guest') {
        setCurrentUserRole('po');
      }
      setActiveTab('beranda');
    } else if (step.screen === 'detail_panitia') {
      setIsSplashOpen(false);
      setIsLoginOpen(false);
      if (currentUserRole === 'mahasiswa' || currentUserRole === 'guest') {
        setCurrentUserRole('po');
      }
      setActiveTab('beranda');
      setSelectedEvent(events[0]);
    } else if (step.screen === 'tasks') {
      setIsSplashOpen(false);
      setIsLoginOpen(false);
      if (currentUserRole === 'mahasiswa' || currentUserRole === 'guest') {
        setCurrentUserRole('panitia');
      }
      setActiveTab('tugas');
    } else if (step.screen === 'modal_buat_tugas') {
      setIsSplashOpen(false);
      if (currentUserRole === 'mahasiswa' || currentUserRole === 'guest') {
        setCurrentUserRole('panitia');
      }
      setActiveTab('tugas');
      setIsNewTaskModalOpen(true);
    } else if (step.screen === 'notifications') {
      setIsSplashOpen(false);
      setActiveTab('notif');
    } else if (step.screen === 'evaluasi') {
      setIsSplashOpen(false);
      if (currentUserRole === 'mahasiswa' || currentUserRole === 'guest') {
        setCurrentUserRole('po');
      }
      setActiveTab('profil');
      setIsArchiveModalOpen(true);
    } else if (step.screen === 'profile') {
      setIsSplashOpen(false);
      setActiveTab('profil');
    }
    
    showToast(`Simulasi Alur: Aktif di "${step.label}"`);
  };

  // Add simulated task
  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      title: newTaskTitle,
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      assignee: {
        name: newTaskAssignee,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80'
      },
      status: 'todo'
    };

    setTasks([newTask, ...tasks]);
    setIsNewTaskModalOpen(false);
    setNewTaskTitle('');
    
    // Auto advance progress in event model for engagement check
    setEvents(prev => prev.map(evt => {
      if (evt.id === selectedEvent.id) {
        return {
          ...evt,
          urgentTasksCount: evt.urgentTasksCount + (newTaskPriority === 'High' ? 1 : 0)
        };
      }
      return evt;
    }));

    // Trigger success tracking with notification audit
    const alarmNotif: NotificationItem = {
      id: `n-${Date.now()}`,
      category: 'Tugas',
      title: 'Tanggung Jawab Divisi Baru Dibuat',
      description: `Tugas "${newTask.title}" ditugaskan ke ${newTask.assignee.name} dengan tenggat ${newTask.dueDate}.`,
      timestamp: 'Baru saja',
      isUnread: true,
      hasQuickAction: false,
      visibility: ['panitia', 'po'],
      isInternal: true
    };
    setNotifications([alarmNotif, ...notifications]);
    showToast(`Sukses! Jobdesk baru ditambahkan ke papan Kanban.`);
  };

  // Complete task inside mock kanban lists
  const triggerToggleTaskStatus = (id: string, newStatus: 'todo' | 'progress' | 'done') => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    
    // Dynamically calculate overall progress indicator
    const completedCount = tasks.filter(t => t.status === 'done').length + (newStatus === 'done' ? 1 : 0);
    const calculatedPercentage = Math.round((completedCount / tasks.length) * 100);
    
    setEvents(prev => prev.map(evt => {
      if (evt.id === 'evt-1') {
        return { ...evt, progress: Math.min(95, calculatedPercentage + 35) };
      }
      return evt;
    }));

    showToast(`Status tugas diubah ke $[${newStatus.toUpperCase()}]`);
  };

  // Submit RSVP
  const handleConfirmRSVP = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUserRole === 'guest' && (!guestName || !guestEmail)) {
      showToast('Mohon lengkapi formulir pendaftaran Guest.');
      return;
    }

    setRegisteredEvents([...registeredEvents, selectedEvent.id]);
    setIsRSVPModalOpen(false);
    setIsSuccessModalOpen(true);

    const confirmationNotif: NotificationItem = {
      id: `n-${Date.now()}`,
      category: 'Umum',
      title: 'Registrasi Sukses!',
      description: `Pendaftaran Anda untuk "${selectedEvent.title}" dikonfirmasi. Unduh e-ticket Anda sekarang.`,
      timestamp: 'Baru saja',
      isUnread: true,
      hasQuickAction: false,
      visibility: ['mahasiswa', 'guest'],
      isInternal: false
    };

    setNotifications([confirmationNotif, ...notifications]);
  };

  // Toggle bookmark event
  const toggleBookmark = (id: string) => {
    if (savedEvents.includes(id)) {
      setSavedEvents(savedEvents.filter(item => item !== id));
      showToast('Event dihapus dari bookmark.');
    } else {
      setSavedEvents([...savedEvents, id]);
      showToast('Event disimpan ke daftar penjelajahan Anda.');
    }
  };

  // Handle active countdown / clock
  const [currentUtcTime, setCurrentUtcTime] = useState('06:34:01 UTC');
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentUtcTime(now.toUTCString().split(' ')[4] + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans antialiased text-slate-800 flex flex-col relative pb-16 lg:pb-0">
      
      {/* Floating Global Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-xl shadow-xl px-5 py-3 border border-slate-700/60 flex items-center gap-3 text-xs md:text-sm max-w-[90%] md:max-w-2xl"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
            <p className="flex-1 font-medium">{toastMessage}</p>
            <button onClick={() => setToastMessage(null)} className="hover:bg-white/10 p-1 rounded-lg">
              <X className="w-4 h-4 text-slate-400 hover:text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIXED TOP UTILITY BAR: Simulated Sandbox Environment Controller */}
      <div className="bg-slate-900 text-slate-100 px-4 py-2 flex flex-col lg:flex-row items-center justify-between gap-2 border-b border-slate-800 text-xs z-40">
        <div className="flex items-center gap-2">
          <span className="bg-[#FF9800] text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
            Design Thinking Lab
          </span>
          <span className="font-semibold text-slate-300">
            EventHub Kampus Command Center
          </span>
          <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] hidden md:inline ml-2 font-mono">
            V1.0.4 - AUTHENTICATED
          </span>
          <span className="font-mono text-slate-400 hidden xl:inline">
            | {currentUtcTime}
          </span>
        </div>

        {/* ACTIVE SESSION USER INFO */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-400">Sesi Aktif:</span>
          <span className="font-extrabold text-slate-205">{user?.name || "Tamu"}</span>
          <span className={`px-2 py-0.5 text-[9px] rounded-full uppercase font-black tracking-wide ${
            currentUserRole === 'po' ? 'bg-purple-900 text-purple-200 border border-purple-705' :
            currentUserRole === 'panitia' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
            currentUserRole === 'mahasiswa' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
            currentUserRole === 'staf' ? 'bg-orange-950 text-orange-300 border border-orange-850' :
            'bg-slate-800 text-slate-300 border border-slate-700'
          }`}>
            ROLE: {currentUserRole.toUpperCase()}
          </span>
        </div>
      </div>

      {/* MASTER APPLICATION CONTENT WITH PERSISTENT LAYOUTS */}

      {/* SPLASH SCREEN ACCORDING TO SPECS [1] */}
      {isSplashOpen ? (
        <div className="flex-1 bg-gradient-to-br from-[#1976D2] to-[#114E8D] text-white flex flex-col items-center justify-center p-6 text-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md bg-white/10 backdrop-blur-md p-10 rounded-2xl border border-white/20 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#FFC107]"></div>
            
            <div className="bg-[#FFC107] text-slate-900 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">EventHub Kampus</h1>
            <p className="text-amber-300 uppercase tracking-widest text-[11px] font-semibold mb-4">
              &quot;Kelola Event Kampus, Satu Platform&quot;
            </p>
            <p className="text-sm text-slate-200 mb-8 max-w-sm">
              Implementasi Design Thinking (Empathize → Define → Ideate → Prototype → Test) Jurusan Sistem Informasi.
            </p>

            <div className="w-full bg-black/30 h-1.5 rounded-full mb-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
                className="bg-[#FFC107] h-full"
              ></motion.div>
            </div>
            <div className="text-[10px] text-slate-300 flex justify-between tracking-mono mb-8 font-mono">
              <span>Menghubungkan ke Kampus...</span>
              <span>V1.0.4-BUILD.STABLE</span>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsSplashOpen(false);
                  setIsLoginOpen(true);
                  showToast("Masuk ke halaman Login/Register.");
                }}
                className="w-full bg-white text-[#1976D2] hover:bg-slate-100 py-3 rounded-xl font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-1"
              >
                Lanjut ke Login <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => {
                  setIsSplashOpen(false);
                  setIsLoginOpen(false);
                  setCurrentUserRole('guest');
                  setActiveTab('jelajahi');
                  showToast("Menjelajah sebagai Tamu Universitas. Data operasional internal disembunyikan untuk privasi.");
                }}
                className="w-full bg-slate-900/40 hover:bg-slate-900/60 text-slate-200 py-3 rounded-xl font-medium text-xs tracking-wide transition-all border border-white/10"
              >
                Mulai Sebagai Tamu (Tanpa Akun) →
              </button>
            </div>
          </motion.div>
          
          <div className="mt-8 text-xs text-white/60 font-mono">
            Jurusan Sistem Informasi &copy; 2026
          </div>
        </div>
      ) : isLoginOpen ? (
        
        /* LOGIN & REGISTER INTERFACES [2] WITH BOTH INTEGRATED TABS */
        <div className="flex-1 bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-[#1976D2] text-white p-6 relative">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 w-8 h-8 rounded-lg flex items-center justify-center text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold">EventHub Kampus</h2>
                  <p className="text-[10px] tracking-widest uppercase opacity-75">Sistem Informasi Event & Kepanitiaan</p>
                </div>
              </div>
            </div>

            {/* Custom Tab Panel Demo: Switch Login & Register */}
            <div className="p-6">
              <div className="mb-6">
                <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-3 py-2 rounded-xl flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Email atau password yang Anda masukkan salah (Demo Input Error State Active)
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email Institusi</label>
                  <input 
                    type="email" 
                    defaultValue="mahasiswa@univ.ac.id" 
                    className="w-full border border-red-400 focus:ring-2 focus:ring-red-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    placeholder="nama@univ.ac.id"
                  />
                  <span className="text-[10px] text-red-500 mt-1 block">Wajib menggunakan email resmi kampus .ac.id</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold uppercase text-slate-500">Kata Sandi</label>
                    <button className="text-xs text-[#1976D2] font-semibold hover:underline">Lupa Sandi?</button>
                  </div>
                  <input 
                    type="password" 
                    defaultValue="password123" 
                    className="w-full border border-red-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                    placeholder="••••••••"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => {
                      setIsLoginOpen(false);
                      setCurrentUserRole('po');
                      setActiveTab('beranda');
                      showToast("Login sukses sebagai Project Officer (Rian Prasetya)");
                    }}
                    className="w-full bg-[#1976D2] hover:bg-[#114E8D] text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-1"
                  >
                    Masuk Sekarang →
                  </button>
                </div>

                <div className="relative py-3 flex items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold tracking-widest uppercase">ATAU MASUK DENGAN</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-4">
                  <button 
                    onClick={() => {
                      setIsLoginOpen(false);
                      setCurrentUserRole('mahasiswa');
                      setActiveTab('jelajahi');
                      showToast("Login mahasiswa dikonfirmasi via Akun Google Kampus.");
                    }}
                    className="border border-slate-300 hover:bg-slate-50 text-slate-700 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span className="font-bold text-rose-500">G</span> Akun Google Kampus
                  </button>
                  <button 
                    onClick={() => {
                      setIsLoginOpen(false);
                      setCurrentUserRole('staf');
                      setActiveTab('beranda');
                      showToast("Sistem mendeteksi Staf Kemahasiswaan Tri Wahyuni.");
                    }}
                    className="border border-slate-300 hover:bg-slate-50 text-slate-700 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    Outlook Kampus
                  </button>
                </div>

                {/* Switch roles demo options on the screen */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                  <p className="text-xs text-slate-600 mb-2 font-medium">Bypass login cepat ke model Demo:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button 
                      onClick={() => { setIsLoginOpen(false); setCurrentUserRole('guest'); setActiveTab('jelajahi'); showToast("Masuk sebagai Tamu."); }}
                      className="px-3 py-1.5 bg-[#FFC107]/20 hover:bg-[#FFC107]/30 text-amber-800 rounded-lg text-xs font-semibold"
                    >
                      Lanjut sebagai Tamu →
                    </button>
                    <button 
                      onClick={() => { setIsLoginOpen(false); setCurrentUserRole('mahasiswa'); setActiveTab('jelajahi'); showToast("Masuk sebagai Mahasiswa."); }}
                      className="px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-850 rounded-lg text-xs font-semibold"
                    >
                      Masuk Mahasiswa →
                    </button>
                    <button 
                      onClick={() => { setIsLoginOpen(false); setCurrentUserRole('po'); setActiveTab('beranda'); showToast("Masuk sebagai Project Officer."); }}
                      className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-[#1976D2] rounded-lg text-xs font-semibold"
                    >
                      Masuk Panitia/PO →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      ) : (

        /* ACTUAL MULTI-VIEW WORKSPACE: Renders dynamically according to currentUserRole group */
        <div className="flex-grow flex flex-col">
          
          {/* DESKTOP INTEGRATED HEADER BANNER (Swiss & Brutalist influenced UI elements) */}
          <header className="bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 py-3.5 shadow-sm sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <div className="bg-[#1976D2] w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-slate-950">
                    EventHub <span className="text-[#1976D2]">Kampus</span>
                  </h1>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    currentUserRole === 'guest' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    currentUserRole === 'mahasiswa' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                    currentUserRole === 'staf' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                    'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}>
                    {currentUserRole.toUpperCase()} POV
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 tracking-wider uppercase font-semibold">
                  {currentUserRole === 'guest' || currentUserRole === 'mahasiswa' ? 'Portal Publik Mahasiswa' : 'KoorEvent — Command Center'}
                </p>
              </div>
            </div>

            {/* Privacy Shield Badge for Filter Notification feedback */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-medium max-w-sm">
              <Shield className="w-4 h-4 text-teal-600 shrink-0" />
              <div className="leading-tight text-left">
                <span className="font-bold">Keamanan Privasi Aktif:</span>{' '}
                {currentUserRole === 'guest' || currentUserRole === 'mahasiswa' 
                  ? 'Data internal, progress divisi, & nama Staf disembunyikan.' 
                  : 'Akses penuh data operasional internal terbuka.'}
              </div>
            </div>

            {/* SEARCH AND NOTIF/USER AVATAR BAR */}
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari event, tugas, atau panduan..."
                  className="bg-slate-100 hover:bg-slate-200/70 text-slate-700 placeholder-slate-400 rounded-full pl-9 pr-4 py-1.5 text-xs w-60 border border-transparent focus:border-slate-300 focus:outline-none focus:bg-white transition-all"
                />
                <Search className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
              </div>
              <button 
                onClick={() => setActiveTab('notif')}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all"
                title="Pemberitahuan"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-600 text-white font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Avatar status area with interactive NextAuth dropdown */}
              <div className="relative flex items-center gap-2 border-l pl-4">
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 text-left hover:opacity-85 transition-all focus:outline-none"
                  aria-expanded={isProfileDropdownOpen}
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {user?.name || "Tamu Unregistered"}
                    </p>
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-wider ${
                        currentUserRole === 'po' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        currentUserRole === 'panitia' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        currentUserRole === 'mahasiswa' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        'bg-orange-100 text-orange-700 border-orange-200'
                      }`}>
                        {currentUserRole === 'staf' ? 'STAFF' : currentUserRole.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-[#1976D2]/10 border-2 border-[#1976D2] flex items-center justify-center text-[#1976D2] font-black text-sm shadow-inner cursor-pointer select-none">
                    {(user?.name || "G").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                  </div>
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-left"
                    >
                      <div className="px-4 py-2.5 border-b border-slate-105">
                        <p className="text-xs font-bold text-slate-800 truncate">{user?.name || "Tamu Unregistered"}</p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{user?.email || "tamu@kampus.ac.id"}</p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab('profil');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-all font-semibold flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-slate-400" /> Profil Saya
                      </button>
                      <button
                        onClick={async () => {
                          setIsProfileDropdownOpen(false);
                          await signOut({ callbackUrl: "/login", redirectTo: "/login" });
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50/50 transition-all font-bold flex items-center gap-2 border-t border-slate-105"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" /> Keluar (Logout)
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* SIMULATED FLOWCHART NAVIGATION WORKSTATIONS AND DESIGN THINKING MAP */}
          <div className="bg-[#EDF2F7] px-4 py-2 border-b border-slate-200 text-xs flex flex-col xl:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-mono text-[10px]">FLOW SIMULATOR:</span>
              <div className="flex flex-wrap gap-1.5">
                {USER_FLOWS.map((flow, idx) => (
                  <button
                    key={flow.id}
                    onClick={() => handleFlowStepClick(idx, 0)}
                    className={`px-2.5 py-1 rounded transition-all text-[11px] font-semibold flex items-center gap-1 ${
                      activeFlowIndex === idx 
                        ? 'bg-slate-900 text-[#FFC107] shadow-sm font-bold' 
                        : 'bg-white text-slate-700 hover:bg-slate-200/80'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    {flow.title.split('—')[1] || flow.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Selected Flow Steps walkthrough slider */}
            <div className="bg-white px-3 py-1.5 rounded border border-slate-300 flex items-center gap-2 max-w-full overflow-x-auto no-scrollbar shrink-0">
              <HelpCircle className="w-3.5 h-3.5 text-[#1976D2] shrink-0" />
              <div className="flex items-center gap-1.5 whitespace-nowrap text-[10px]">
                {USER_FLOWS[activeFlowIndex].steps.map((step, sIdx) => (
                  <React.Fragment key={step.label}>
                    {sIdx > 0 && <span className="text-slate-300">&rarr;</span>}
                    <button
                      onClick={() => handleFlowStepClick(activeFlowIndex, sIdx)}
                      className={`px-1.5 py-0.5 rounded transition-all font-mono ${
                        activeFlowStep === sIdx 
                          ? 'bg-[#1976D2] text-white font-bold' 
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                      title={step.description}
                    >
                      {sIdx + 1}. {step.label}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN PAGE WRAPPER SPLIT INTO PERSISTENT ROLE TABS OR DISCOVER FEEDS */}
          <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">

            {/* CURRENT ACTIVE FLOW DESCRIPTIVE STEP INFOGRAPHIC BAR */}
            <div className="bg-[#1976D2]/5 border-l-4 border-[#1976D2] p-4 rounded-r-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="bg-[#1976D2]/10 text-[#1976D2] p-2 rounded-lg font-bold font-mono text-sm">
                  FLOW {String.fromCharCode(65 + activeFlowIndex)}
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {USER_FLOWS[activeFlowIndex].title}
                  </h4>
                  <p className="text-slate-600 text-xs">
                    <span className="font-bold">Langkah {activeFlowStep + 1}:</span> {USER_FLOWS[activeFlowIndex].steps[activeFlowStep].description}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={activeFlowStep === 0}
                  onClick={() => handleFlowStepClick(activeFlowIndex, activeFlowStep - 1)}
                  className="bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 border px-3 py-1.5 rounded-lg text-xs font-semibold"
                >
                  Sebelumnya
                </button>
                <button
                  disabled={activeFlowStep === USER_FLOWS[activeFlowIndex].steps.length - 1}
                  onClick={() => handleFlowStepClick(activeFlowIndex, activeFlowStep + 1)}
                  className="bg-[#1976D2] hover:bg-[#114E8D] text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                  Langkah Berikutnya &rarr;
                </button>
              </div>
            </div>

            {/* TAB DEFINERS ACCORDING TO SPECS ROLE NAVIGATION SWITCHED */}
            {/* If POV is standard Student / Guest, they see Student Discover event lists */}
            {['guest', 'mahasiswa'].includes(currentUserRole) ? (
              
              /* ==================== SCREEN B: STUDENT / GUEST PORTAL FLOW ==================== */
              <div className="space-y-6">
                
                {/* Simulated Tab Bar for Mahasiswa: Beranda · Jelajahi · Event Saya · Notif · Profil */}
                <div className="flex overflow-x-auto no-scrollbar gap-2 border-b border-slate-200 pb-px">
                  {[
                    { id: 'jelajahi', label: 'Jelajahi Event', icon: Search },
                    { id: 'event_saya', label: 'Event Saya', icon: Ticket, badge: registeredEvents.length },
                    { id: 'notif', label: 'Notifikasi', icon: Bell, badge: unreadNotifCount },
                    { id: 'profil', label: 'Profil Saya', icon: User }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-xs tracking-wide transition-all whitespace-nowrap ${
                          activeTab === tab.id 
                            ? 'border-[#1976D2] text-[#1976D2]' 
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                        {tab.badge && tab.badge > 0 ? (
                          <span className="bg-[#1976D2] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {tab.badge}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {/* TAB CONTROLS RENDERING */}
                {activeTab === 'jelajahi' && (
                  /* [M1] Discover Event (Feed Publik Mahasiswa) */
                  <div className="space-y-6">
                    {/* Hero Banner Promo */}
                    <div className="bg-gradient-to-r from-[#1976D2] via-[#0E5CA5] to-slate-950 p-6 md:p-8 rounded-2xl text-white relative overflow-hidden shadow-md">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                      <div className="relative z-10 max-w-xl">
                        <span className="bg-[#FF9800] text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Hot Featured Event
                        </span>
                        <h2 className="text-2xl md:text-3xl font-extrabold mt-3 leading-tight">
                          Dies Natalis Universitas Ke-58: Malam Apresiasi Seni
                        </h2>
                        <p className="text-xs md:text-sm text-slate-200 mt-2 mb-6">
                          Malam puncak festival seni akbar menghadirkan konser kolaboratif, penyerahan piala mahasiswa berprestasi, dan pameran kreatif.
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-300 mb-6">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#FFC107]" /> 27 Mei 2026</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#FFC107]" /> Auditorium Utama</span>
                          <span className="flex items-center gap-1"><Ticket className="w-3.5 h-3.5 text-[#FFC107]" /> Kuota Sisa: 47 Kursi</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              const target = events.find(e => e.id === 'evt-1') || events[0];
                              setSelectedEvent(target);
                              setIsRSVPModalOpen(true);
                            }}
                            className="bg-[#FFC107] hover:bg-amber-500 text-slate-900 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md"
                          >
                            Daftar Sekarang &rarr;
                          </button>
                          <button 
                            onClick={() => {
                              const target = events.find(e => e.id === 'evt-1') || events[0];
                              setSelectedEvent(target);
                              showToast(`Menampilkan info detail untuk: ${target.title}`);
                            }}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-semibold backdrop-blur-md"
                          >
                            Lihat Selengkapnya
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Filter and Switch controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Horizontal Scrolling Chips */}
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full py-1">
                        <Filter className="w-4 h-4 text-slate-400 mr-1 shrink-0" />
                        {['Semua', 'Seminar', 'Workshop', 'Lomba', 'Olahraga', 'Seni', 'Sosial'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setActiveCategoryFilter(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                              activeCategoryFilter === cat 
                                ? 'bg-[#1976D2] text-white shadow-sm' 
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Interactive Search inside view */}
                      <div className="relative w-full sm:w-64">
                        <input 
                          type="text" 
                          placeholder="Cari seminar atau lomba..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-white border rounded-xl pl-9 pr-4 py-2 text-xs w-full focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>

                    {/* EVENT ITEMS GRID RENDERING */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {events
                        .filter(item => activeCategoryFilter === 'Semua' || item.category === activeCategoryFilter)
                        .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((evt) => {
                          const isRegistered = registeredEvents.includes(evt.id);
                          const isBookmarked = savedEvents.includes(evt.id);
                          return (
                            <div 
                              key={evt.id} 
                              className={`bg-white rounded-xl border p-4 shadow-sm flex gap-4 transition-all hover:shadow-md ${
                                selectedEvent.id === evt.id ? 'ring-2 ring-[#1976D2]' : 'border-slate-200'
                              }`}
                            >
                              {/* Left Thumbnail with icon based on category */}
                              <div className="w-16 h-16 rounded-xl bg-[#1976D2]/5 flex-shrink-0 flex items-center justify-center text-[#1976D2] relative overflow-hidden">
                                <span className="font-bold text-xs uppercase opacity-90">{evt.category}</span>
                              </div>

                              {/* Content area */}
                              <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-start gap-1">
                                  <span className="text-[10px] font-bold text-[#1976D2]">{evt.organizer}</span>
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wider ${
                                    evt.status === 'Buka Pendaftaran' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    evt.status === 'Hampir Penuh' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                    'bg-slate-100 text-slate-500'
                                  }`}>
                                    {evt.status}
                                  </span>
                                </div>
                                <h3 className="font-bold text-sm text-slate-900 mt-1 mb-2 leading-snug line-clamp-1 truncate block">
                                  {evt.title}
                                </h3>

                                <div className="space-y-1 text-slate-500 text-[11px]">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" /> {evt.date} • {evt.time}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3" /> {evt.location}
                                  </div>
                                </div>

                                <div className="mt-3 pt-3 border-t flex justify-between items-center">
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => setSelectedEvent(evt)}
                                      className="text-xs text-[#1976D2] font-bold hover:underline"
                                    >
                                      Detail Event
                                    </button>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {/* Bookmark */}
                                    <button 
                                      onClick={() => toggleBookmark(evt.id)}
                                      className="p-1.5 rounded-lg border text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
                                      title="Simpan Event"
                                    >
                                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                                    </button>

                                    {/* Action button conditional state */}
                                    {isRegistered ? (
                                      <span className="bg-sky-50 text-sky-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-sky-200 flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5" /> Terdaftar
                                      </span>
                                    ) : evt.status === 'Tutup' ? (
                                      <button disabled className="bg-slate-100 text-slate-400 px-3 py-1.5 rounded-lg text-xs font-medium cursor-not-allowed">
                                        Ditutup
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => {
                                          setSelectedEvent(evt);
                                          setIsRSVPModalOpen(true);
                                        }}
                                        className="bg-[#1976D2] hover:bg-[#114E8D] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                      >
                                        Daftar &rarr;
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* [M2] READ-ONLY SIDEBAR DETAIL SCREEN DISPLAY */}
                    {selectedEvent && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md transition-all mt-6">
                        <div className="flex justify-between items-start gap-4 pb-4 border-b">
                          <div>
                            <span className="bg-[#1976D2]/10 text-[#1976D2] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                              Info Detail Event (Mahasiswa View)
                            </span>
                            <h2 className="text-xl font-bold text-slate-900 mt-2">{selectedEvent.title}</h2>
                            <p className="text-slate-500 text-xs mt-1">
                              diselenggarakan oleh <span className="font-bold text-slate-800">{selectedEvent.organizer}</span>
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <button onClick={() => toggleBookmark(selectedEvent.id)} className="p-2 border rounded-full text-slate-400 hover:text-[#1976D2] transition-colors">
                              <Bookmark className={`w-4 h-4 ${savedEvents.includes(selectedEvent.id) ? 'fill-[#FFC107] text-[#FFC107]' : ''}`} />
                            </button>
                            <button onClick={() => showToast('Tautan event disalin ke clipboard.')} className="p-2 border rounded-full text-slate-400 hover:text-[#1976D2] transition-colors">
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Event grid attributes view */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 text-center border-b">
                          <div className="bg-[#F5F7FA] p-3 rounded-xl border border-slate-200">
                            <Calendar className="w-5 h-5 text-[#1976D2] mx-auto mb-1" />
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Tanggal & Waktu</p>
                            <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedEvent.date} • {selectedEvent.time}</p>
                          </div>
                          <div className="bg-[#F5F7FA] p-3 rounded-xl border border-slate-200">
                            <MapPin className="w-5 h-5 text-[#1976D2] mx-auto mb-1" />
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Lokasi/Mode</p>
                            <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedEvent.location} {selectedEvent.isOnline ? '(Online)' : ''}</p>
                          </div>
                          <div className="bg-[#F5F7FA] p-3 rounded-xl border border-slate-200">
                            <Clock className="w-5 h-5 text-[#1976D2] mx-auto mb-1" />
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Penyelenggara</p>
                            <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedEvent.coordinator}</p>
                          </div>
                        </div>

                        {/* Collapsible About Description Section */}
                        <div className="py-4 border-b">
                          <h4 className="font-bold text-sm text-slate-800 mb-2">Tentang Event</h4>
                          <p className="text-xs text-slate-650 leading-relaxed text-slate-600">
                            {selectedEvent.description}
                          </p>
                        </div>

                        {/* Rundown preview list (WITHOUT DRAG HANDLE OR TRASH ICONS) */}
                        <div className="py-4">
                          <h4 className="font-bold text-sm text-slate-800 mb-3">Rundown Acara (Preview)</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {rundown.map((item) => (
                              <div key={item.id} className="flex gap-4 items-center bg-[#F5F7FA] px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-600">
                                <span className="font-bold text-slate-800 shrink-0 w-24">{item.timeStart} - {item.timeEnd}</span>
                                <div className="flex-1">
                                  <p className="font-semibold text-slate-900">{item.title}</p>
                                  <p className="text-[10px] text-slate-450 text-slate-500">PIC: {item.pic} • {item.location}</p>
                                </div>
                                {item.isLive && (
                                  <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse uppercase shrink-0">
                                    LIVE
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Attachments / Files safe for students */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-sky-50 text-[#1976D2] p-2 rounded-lg">
                              <Info className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-xs text-slate-800">Panduan Acara & Template Penulisan.pdf</p>
                              <p className="text-[10px] text-slate-500">Berkas Publik mahasiswa • 2.4 MB</p>
                            </div>
                          </div>
                          <button onClick={() => showToast('Mengunduh panduan acara...')} className="bg-white hover:bg-slate-100 shadow px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5">
                            <Download className="w-3.5 h-3.5" /> Unduh
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* [M4 / M5] Event Saya & Tiket Digital Tab */}
                {activeTab === 'event_saya' && (
                  <div className="space-y-6">
                    <div className="border-b pb-4 flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-bold">Event & Partisipasi Saya</h2>
                        <p className="text-xs text-slate-500">Dua kategori: event yang diikuti, dan event yang disimpan</p>
                      </div>
                      <span className="bg-[#1976D2]/10 text-[#1976D2] px-3 py-1 rounded-full font-bold text-xs">
                        {registeredEvents.length} Event Terdaftar
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Left: Registered E-Ticket list */}
                      <div className="space-y-4">
                        <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2">E-Ticket Aktif Anda</h3>
                        {events.filter(e => registeredEvents.includes(e.id)).length === 0 ? (
                          <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 text-xs">
                            <Ticket className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                            Belum ada tiket aktif. Daftar event di tab Jelajahi terlebih dahulu.
                          </div>
                        ) : (
                          events.filter(e => registeredEvents.includes(e.id)).map(evt => (
                            <div key={evt.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md relative">
                              {/* Ticket Notch Design */}
                              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between px-0 z-10 pointer-events-none">
                                <div className="w-4 h-8 bg-[#F5F7FA] rounded-r-full -ml-2 border-r border-slate-200"></div>
                                <div className="w-4 h-8 bg-[#F5F7FA] rounded-l-full -mr-2 border-l border-slate-200"></div>
                              </div>

                              {/* Upper Ticket Section */}
                              <div className="bg-slate-900 text-white p-5">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="bg-emerald-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      TIKET AKTIF
                                    </span>
                                    <h4 className="font-extrabold text-sm mt-2">{evt.title}</h4>
                                    <p className="text-[10px] text-slate-300 mt-1">Diselenggarakan oleh: {evt.organizer}</p>
                                  </div>
                                  <Ticket className="w-6 h-6 text-[#FFC107] shrink-0" />
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-4 text-[10px] text-slate-300 border-t border-white/15 pt-3">
                                  <div>
                                    <p className="uppercase text-[9px] text-slate-450">Tanggal & Jam</p>
                                    <p className="font-bold text-white mt-0.5">{evt.date} • {evt.time}</p>
                                  </div>
                                  <div>
                                    <p className="uppercase text-[9px] text-slate-450">Lokasi</p>
                                    <p className="font-bold text-white mt-0.5">{evt.location}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Lower Check-in Section (Pass structure) */}
                              <div className="bg-slate-50 p-5 pt-6 border-t border-dashed border-slate-300 flex flex-col sm:flex-row items-center gap-4 justify-between">
                                <div className="text-center sm:text-left">
                                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Nomor ID Tiket</p>
                                  <p className="text-xs font-mono font-bold text-slate-800">#EVT-2026-F58K9</p>
                                  <p className="text-[10px] text-slate-500 mt-0.5">Pemilik: {rsvpName} ({rsvpNim})</p>
                                </div>

                                {/* Placeholder QR code */}
                                <div className="flex flex-col items-center shrink-0">
                                  <div className="w-16 h-16 bg-white border p-1 rounded-lg flex items-center justify-center">
                                    {/* Simulated elegant minimalist Grid bar */}
                                    <div className="grid grid-cols-4 gap-1 w-full h-full">
                                      {Array.from({ length: 16 }).map((_, rIdx) => (
                                        <div 
                                          key={rIdx} 
                                          className={`rounded-sm ${rIdx % 3 === 0 || rIdx % 5 === 2 ? 'bg-slate-900' : 'bg-slate-100'}`}
                                        ></div>
                                      ))}
                                    </div>
                                  </div>
                                  <span className="text-[8px] text-slate-400 mt-1 uppercase font-bold">Scan QR Absensi</span>
                                </div>
                              </div>

                              {/* Download actions */}
                              <div className="bg-white px-4 py-3 border-t flex justify-end gap-2 text-xs">
                                <button 
                                  onClick={() => showToast('Mengunduh tiket PDF...')}
                                  className="bg-[#1976D2] text-white hover:bg-[#114E8D] px-3 py-1.5 rounded-lg border text-[11px] font-bold"
                                >
                                  Unduh Tiket (PDF)
                                </button>
                                <button 
                                  onClick={() => showToast('Mendownload Sertifikat partisipasi (Sertifikat akan aktif setelah status event Selesai).')}
                                  className="text-[#1976D2] hover:bg-sky-50 px-3 py-1.5 rounded-lg text-[11px] font-bold"
                                >
                                  Download Sertifikat
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Right: Saved bookmark items */}
                      <div className="space-y-4">
                        <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2">Event yang Disimpan ({savedEvents.length})</h3>
                        {events.filter(e => savedEvents.includes(e.id)).length === 0 ? (
                          <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 text-xs">
                            <Bookmark className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                            Belum ada event disimpan. Klik ikon bookmark di list untuk menyematkan event di sini.
                          </div>
                        ) : (
                          events.filter(e => savedEvents.includes(e.id)).map(evt => (
                            <div key={evt.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-[#FFC107]/10 flex items-center justify-center text-[#FFC107] font-bold text-xs shrink-0">{evt.category}</div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-xs text-slate-950 truncate">{evt.title}</h4>
                                  <p className="text-[10px] text-slate-400">{evt.date} • {evt.location}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  setSelectedEvent(evt);
                                  setIsRSVPModalOpen(true);
                                }}
                                className="bg-[#1976D2] hover:bg-[#114E8D] text-white px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 shrink-0"
                              >
                                Daftar <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            ) : (

              /* ==================== SCREEN A: BENTO GRID PANITIA COMMAND CENTER ==================== */
              <div className="space-y-6">

                {/* SIMULATED COMMAND CENTER NAV PATHWAY STREAMS [Beranda, Tugas, Koordinasi, Notif, Profil] */}
                <div className="flex overflow-x-auto no-scrollbar gap-2 border-b border-slate-200 pb-px">
                  {[
                    { id: 'beranda', label: 'Command Dashboard', icon: Laptop },
                    { id: 'tugas', label: 'Jobdesk Kanban', icon: CheckSquare, badge: tasks.filter(t=>t.status==='todo').length },
                    { id: 'koordinasi', label: 'Tim Chat & Koordinasi', icon: MessageSquare, badge: chats.length },
                    { id: 'notif', label: 'Security Notifications', icon: Bell, badge: unreadNotifCount },
                    { id: 'profil', label: 'Lounge PO & Profil', icon: User }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as any);
                          showToast(`Membuka panel: ${tab.label}`);
                        }}
                        className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs tracking-wide transition-all whitespace-nowrap ${
                          activeTab === tab.id 
                            ? 'border-[#1976D2] text-[#1976D2]' 
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                        {tab.badge && tab.badge > 0 ? (
                          <span className="bg-[#1976D2] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {tab.badge}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {activeTab === 'beranda' && (
                  /* THE MASTER HIGH-FIDELITY BENTO GRID DESIGN PATTERN ACCORDING TO BENTO SCHEMATICS */
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-max lg:auto-rows-[160px]">
                    
                    {/* [BENTO B1] ACTIVE EVENT STATUS - ROW SPAN 3 (DEEP DARK CANVAS WITH VIBRANT LIGHT GRADIENT GLOWS) */}
                    <div className="bg-slate-900 border-none text-white rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-lg md:col-span-8 lg:row-span-2">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-[#1976D2] opacity-35 blur-[100px] -mr-32 -mt-32"></div>
                      
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-emerald-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Sedang Berlangsung (LIVE)
                          </span>
                          <span className="text-[11px] text-slate-350 bg-slate-800 px-3 py-1 rounded-md">
                            Mulai: 08:30 WIB
                          </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
                          Dies Natalis Universitas Ke-58: <br />Malam Apresiasi Seni & Expo
                        </h2>
                        <p className="text-xs text-slate-300 mt-2 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-[#FF9800]" /> Auditorium Serbaguna Aula Utama (Lantai 2)
                        </p>
                      </div>

                      {/* Bento Interactive progress component */}
                      <div className="relative z-10 bg-white/5 border border-white/10 p-4 rounded-xl mt-6">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="font-semibold text-slate-200">Total Progres Kepanitiaan</span>
                          <span className="font-bold text-[#FFC107]">58.5% Pekerjaan Selesai</span>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                          <div className="bg-[#1976D2] h-full rounded-full" style={{ width: '58.5%' }}></div>
                        </div>
                      </div>

                      {/* Quick dashboard interactive buttons */}
                      <div className="relative z-10 flex gap-3 mt-6">
                        <button 
                          onClick={() => { setActiveTab('tugas'); showToast('Membuka detail jobdesk...'); }}
                          className="flex-1 bg-white hover:bg-slate-100 text-slate-950 py-3 rounded-xl font-bold text-xs tracking-wider transition-all"
                        >
                          Kelola Rundown
                        </button>
                        <button 
                          onClick={() => { setActiveTab('koordinasi'); showToast('Membuka forum chat tim...'); }}
                          className="flex-1 bg-white/10 hover:bg-white/15 text-white border border-white/20 py-3 rounded-xl font-bold text-xs tracking-wider transition-all"
                        >
                          Buka Chat Tim
                        </button>
                      </div>
                    </div>

                    {/* [BENTO B2] LIVE ATTENDANCE STATS COUNTER - ROW SPAN 1 */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-center items-center text-center shadow-sm md:col-span-4 lg:row-span-1">
                      <div className="text-4xl font-extrabold text-[#1976D2] tracking-tight">1,240</div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">Peserta Hadir Live</p>
                      <div className="flex items-center gap-1.5 mt-2 text-emerald-600 font-semibold text-xs">
                        {/* Up arrow logo */}
                        <span>&uarr; +12% vs Jam Lalu</span>
                      </div>
                    </div>

                    {/* [BENTO B3] PENDING APPROVAL COUNTER (VIBRANT BLUE TO ORANGE COLOR BENTO CARD) [5] */}
                    <div className="bg-[#1976D2] text-white border-none rounded-2xl p-6 flex flex-col justify-between shadow-md md:col-span-4 lg:row-span-1 relative overflow-hidden">
                      <div className="absolute bottom-[-20%] right-[-10%] opacity-15 text-white">
                        <Shield className="w-32 h-32" />
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold mb-1">05</div>
                        <p className="text-xs opacity-90 uppercase tracking-wider font-semibold">Persetujuan Proposal</p>
                        <p className="text-[10px] text-slate-200 mt-1">Antrean kas anggaran & pengeluaran divisi</p>
                      </div>
                      <button 
                        onClick={() => { setActiveTab('notif'); showToast('Membuka antrean notifikasi persetujuan...'); }}
                        className="mt-3 bg-white/20 hover:bg-white/30 text-white rounded-full py-1 px-4 text-[10px] font-bold self-start transition-all"
                      >
                        Review Sekarang &rarr;
                      </button>
                    </div>

                    {/* [BENTO B4] URGENT CHORES LIST MODULE & REMINDER */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm md:col-span-5 lg:row-span-2 overflow-y-auto max-h-[340px]">
                      <div className="flex justify-between items-center mb-4 pb-2 border-b">
                        <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider">Tugas Urgen (5)</h3>
                        <button onClick={() => setActiveTab('tugas')} className="text-[#1976D2] text-xs font-bold hover:underline">
                          Papan Kanban
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {tasks.slice(0, 3).map((item) => (
                          <div 
                            key={item.id} 
                            onClick={() => triggerToggleTaskStatus(item.id, 'done')}
                            className="flex gap-3 items-start border-l-4 border-red-500 bg-red-50/20 p-2.5 rounded-r-lg hover:bg-red-50/50 cursor-pointer transition-all"
                            title="Ketuk untuk tandai selesai"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 leading-tight truncate">{item.title}</p>
                              <p className="text-[10px] text-slate-400 mt-1">Div. Perlengkapan • {item.dueDate}</p>
                            </div>
                            <span className="bg-red-100 text-red-700 text-[9px] px-2 py-0.5 rounded font-extrabold uppercase shrink-0">
                              {item.priority}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={() => setIsNewTaskModalOpen(true)}
                        className="w-full mt-4 py-3 border-2 border-dashed border-slate-200 hover:border-slate-350 rounded-xl text-slate-400 hover:text-slate-700 text-xs font-bold transition-all"
                      >
                        + Tambah Tugas Baru
                      </button>
                    </div>

                    {/* [BENTO B5] DIVISION LIVE PERFORMANCE METRIC */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm md:col-span-7 lg:row-span-2 overflow-y-auto max-h-[340px]">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider">Progress Per Divisi</h3>
                        <span className="text-[10px] text-slate-400 font-mono">Updated: 5 menit yang lalu</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                        {divisions.map((div, dIdx) => (
                          <div key={dIdx} className="space-y-1.5 p-3 bg-slate-50 rounded-xl border">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                              <span className="truncate">{div.name}</span>
                              <span className="text-[#1976D2]">{div.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  div.status === 'On Track' ? 'bg-emerald-500' :
                                  div.status === 'Delayed' ? 'bg-amber-500' : 'bg-rose-500'
                                }`} 
                                style={{ width: `${div.progress}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between items-center text-[9px] text-slate-400 uppercase font-mono">
                              <span>Status: {div.status}</span>
                              <span>{div.doneCount} Selesai</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* [BENTO B6] QUICK COORDINATION FORUM LOG */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm md:col-span-6 lg:row-span-2 flex flex-col justify-between max-h-[320px]">
                      <div>
                        <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider mb-3">Koordinasi Cepat</h3>
                        <div className="space-y-3 max-h-44 overflow-y-auto pr-1">
                          {chats.map((ch) => (
                            <div key={ch.id} className={`flex gap-2 items-start text-xs ${ch.isMe ? 'justify-end' : ''}`}>
                              {!ch.isMe && (
                                <div className="w-6 h-6 rounded-full bg-sky-100 shrink-0 text-[#1976D2] flex items-center justify-center font-bold text-[10px]">
                                  {ch.sender.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className={`p-2.5 rounded-xl max-w-[80%] ${
                                ch.isMe 
                                  ? 'bg-[#1976D2] text-white rounded-tr-none' 
                                  : 'bg-slate-100 text-slate-800 rounded-tl-none'
                              }`}>
                                <p className="text-[10px] opacity-75 font-bold mb-0.5">{ch.sender} ({ch.role})</p>
                                <p>{ch.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t flex gap-2">
                        <input 
                          type="text" 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && showToast('Pesan dikirim ke grup koordinasi!')}
                          placeholder="Ketik instruksi atau koordinasi..." 
                          className="flex-grow bg-slate-50 border rounded-xl px-3 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        <button 
                          onClick={() => {
                            if (!chatInput.trim()) return;
                            const newMsg: ChatMessage = {
                              id: `c-${Date.now()}`,
                              sender: 'Rian (You)',
                              role: 'PO',
                              isMe: true,
                              message: chatInput,
                              timestamp: 'Baru saja',
                              avatar: ''
                            };
                            setChats([...chats, newMsg]);
                            setChatInput('');
                            showToast('Instruksi dikirim ke tim koordinasi.');
                          }}
                          className="bg-[#1976D2] text-white p-2 rounded-xl"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* [BENTO B7] RUNDOWN SCHEDULE OVERVIEWS */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm md:col-span-6 lg:row-span-2 overflow-y-auto max-h-[320px]">
                      <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider mb-4">Timeline Mendatang</h3>
                      <div className="space-y-4">
                        {rundown.map((session, sIdx) => (
                          <div key={session.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full border-2 ${session.isLive ? 'bg-rose-500 border-white ring-2 ring-rose-300' : 'bg-slate-350 border-slate-200'}`}></div>
                              {sIdx < rundown.length - 1 && <div className="w-0.5 h-12 bg-slate-200"></div>}
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="font-bold text-slate-800 text-xs">{session.timeStart} - {session.timeEnd}</p>
                              <p className="font-semibold text-slate-950 text-sm mt-0.5 truncate">{session.title}</p>
                              <p className="text-[10px] text-slate-400">PIC: {session.pic} • {session.location}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB TASK KANBAN FOR TIM MEMBERS */}
                {activeTab === 'tugas' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
                      <div>
                        <h2 className="text-xl font-extrabold tracking-tight">KoorEvent Jobdesk Tracker</h2>
                        <p className="text-xs text-slate-500">Pindahkan progres tugas di bawah untuk menyinkronkan metrik acara.</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsNewTaskModalOpen(true)}
                          className="bg-[#1976D2] hover:bg-[#114E8D] text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                        >
                          <Plus className="w-4 h-4" /> Buat Tugas Baru
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* TODO LIST */}
                      <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 min-h-[380px]">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-500">To Do ({tasks.filter(t=>t.status==='todo').length})</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                        </div>
                        <div className="space-y-3">
                          {tasks.filter(t=>t.status==='todo').map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                              <h4 className="font-bold text-xs text-slate-900">{item.title}</h4>
                              <div className="flex items-center justify-between">
                                <span className="bg-slate-100 text-slate-500 text-[9px] px-2 py-0.5 rounded font-extrabold">
                                  {item.priority}
                                </span>
                                <span className="text-[9px] text-slate-400">{item.dueDate}</span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t mt-2">
                                <span className="text-[10px] text-slate-500 font-medium">Assigned: {item.assignee.name}</span>
                                <button 
                                  onClick={() => triggerToggleTaskStatus(item.id, 'progress')}
                                  className="text-[10px] font-bold text-[#1976D2] hover:underline"
                                >
                                  Mulai Kerja &rarr;
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* WORK IN PROGRESS */}
                      <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 min-h-[380px]">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-500">On Progress ({tasks.filter(t=>t.status==='progress').length})</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FF9800]"></span>
                        </div>
                        <div className="space-y-3">
                          {tasks.filter(t=>t.status==='progress').map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-xl border border-[#FF9800]/40 shadow-sm space-y-3">
                              <h4 className="font-bold text-xs text-slate-900">{item.title}</h4>
                              <div className="flex items-center justify-between">
                                <span className="bg-[#FF9800]/10 text-[#FF9800] text-[9px] px-2 py-0.5 rounded font-extrabold">
                                  {item.priority}
                                </span>
                                <span className="text-[9px] text-slate-450 text-[#FF9800] font-semibold">{item.dueDate}</span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t mt-2">
                                <span className="text-[10px] text-slate-500 font-medium">Assigned: {item.assignee.name}</span>
                                <button 
                                  onClick={() => triggerToggleTaskStatus(item.id, 'done')}
                                  className="text-[10px] font-bold text-emerald-600 hover:underline"
                                >
                                  Tandai Selesai &radic;
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* DONE */}
                      <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 min-h-[380px]">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-500">Done ({tasks.filter(t=>t.status==='done').length})</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        </div>
                        <div className="space-y-3">
                          {tasks.filter(t=>t.status==='done').map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm space-y-3 opacity-80">
                              <h4 className="font-semibold text-xs text-slate-650 text-slate-500 line-through">{item.title}</h4>
                              <div className="flex items-center justify-between">
                                <span className="bg-emerald-50 text-emerald-700 text-[9px] px-2 py-0.5 rounded font-extrabold">
                                  SELESAI
                                </span>
                                <span className="text-[9.5px] text-slate-400">Verifikasi Berhasil</span>
                              </div>
                              <div className="pt-2 border-t flex justify-between items-center text-[10px] text-slate-400">
                                <span>Assignee: {item.assignee.name}</span>
                                <span className="text-emerald-600 font-bold">Lengkap</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB INTERACTIVE CHAT SCREEN COORDINATION */}
                {activeTab === 'koordinasi' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row gap-6 min-h-[420px]">
                    
                    {/* Left: Interactive Group details */}
                    <div className="w-full md:w-60 border-r pr-6 space-y-4 shrink-0">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900">Saluran Koordinasi</h3>
                        <p className="text-[11px] text-slate-400">Komunikasi internal antar divisi aktif</p>
                      </div>

                      <div className="space-y-2">
                        <button className="w-full p-2.5 bg-slate-100 text-left rounded-xl border text-xs font-bold text-[#1976D2] flex justify-between items-center">
                          <span>Group Panitia Utama</span>
                          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        </button>
                        <button onClick={() => showToast('Saluran Div. Acara diklik.')} className="w-full p-2.5 hover:bg-slate-50 text-left rounded-xl text-xs font-semibold text-slate-600">
                          Divisi Acara & Rundown
                        </button>
                        <button onClick={() => showToast('Saluran Div. Perlengkapan diklik.')} className="w-full p-2.5 hover:bg-slate-50 text-left rounded-xl text-xs font-semibold text-slate-600">
                          Divisi Perlengkapan
                        </button>
                      </div>

                      {/* Brief Pin board widget */}
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                        <div className="flex gap-2 items-center mb-1">
                          <span className="bg-[#FF9800] text-white p-0.5 rounded text-[8px] font-bold">PINNED</span>
                          <span className="text-[9px] text-slate-500 font-mono">Yesterday</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-snug">
                          <strong>Pemberitahuan:</strong> Evaluasi akhir ditargetkan dikirim besok siang ke Kemahasiswaan. Mohon lampirkan PDF Laporan.
                        </p>
                      </div>
                    </div>

                    {/* Right: Message stream container */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pb-4 pr-1">
                        {chats.map((ch) => (
                          <div key={ch.id} className={`flex gap-3 items-start text-xs ${ch.isMe ? 'justify-end' : ''}`}>
                            {!ch.isMe && (
                              <div className="w-8 h-8 rounded-full bg-[#1976D2]/10 text-[#1976D2] font-bold flex items-center justify-center">
                                {ch.sender.slice(0, 1)}
                              </div>
                            )}
                            <div className={`p-3 rounded-xl max-w-[80%] ${
                              ch.isMe 
                                ? 'bg-[#1976D2] text-white rounded-tr-none shadow-sm' 
                                : 'bg-slate-100 text-slate-800 rounded-tl-none border'
                            }`}>
                              <div className="flex justify-between items-center gap-4 mb-1">
                                <span className="font-bold text-[10px] opacity-95">{ch.sender} ({ch.role})</span>
                                <span className="text-[8px] opacity-50">{ch.timestamp}</span>
                              </div>
                              <p className="text-xs leading-relaxed">{ch.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t flex gap-2">
                        <input 
                          type="text" 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (!chatInput.trim()) return;
                              setChats([...chats, {
                                id: `c-${Date.now()}`,
                                sender: 'Rian (You)',
                                role: 'PO',
                                isMe: true,
                                message: chatInput,
                                timestamp: '11:54',
                                avatar: ''
                              }]);
                              setChatInput('');
                              showToast('Pesan dikirim');
                            }
                          }}
                          placeholder="Masukkan instruksi koordinasi..."
                          className="flex-grow bg-slate-50 border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        <button 
                          onClick={() => {
                            if (!chatInput.trim()) return;
                            setChats([...chats, {
                              id: `c-${Date.now()}`,
                              sender: 'Rian (You)',
                              role: 'PO',
                              isMe: true,
                              message: chatInput,
                              timestamp: '11:54',
                              avatar: ''
                            }]);
                            setChatInput('');
                            showToast('Pesan dikirim');
                          }}
                          className="bg-[#1976D2] text-white px-4 py-2 rounded-xl text-xs font-bold"
                        >
                          Kirim
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* [11] LOUNGE PROJECT OFFICER PROFILE TAB */}
                {activeTab === 'profil' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row items-center gap-4 pb-6 border-b">
                        <div className="w-16 h-16 bg-[#1976D2]/10 border-2 border-[#1976D2] rounded-full text-[#1976D2] flex items-center justify-center font-extrabold text-2xl shadow">
                          RP
                        </div>
                        <div className="text-center sm:text-left">
                          <h2 className="text-xl font-bold">Rian Prasetya (Project Officer)</h2>
                          <p className="text-xs text-slate-500 mt-1">NIM: 1202220084 • Jurusan Sistem Informasi</p>
                          <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                            <span className="bg-[#FF9800] text-slate-950 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                              Ketua Panitia Utama
                            </span>
                            <span className="bg-[#1976D2] text-white text-[9px] px-2 py-0.5 rounded-full">
                              Verified Staff
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* STATS COUNT */}
                      <div className="grid grid-cols-3 gap-4 text-center py-6 border-b">
                        <div>
                          <p className="text-2xl font-bold text-slate-900">4</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Acara Dipantau</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-900">12</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Tugas Diselesaikan</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-900">1,500</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Poin Kehadiran</p>
                        </div>
                      </div>

                      {/* PO Lounge Special Actions */}
                      <div className="py-6 space-y-4">
                        <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Lounge Project Officer Actions</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-[#1976D2]/5 rounded-xl border border-[#1976D2]/20 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-sm text-slate-900">Evaluasi & Penguncian Dokumen</p>
                              <p className="text-xs text-slate-500">Kirim laporan akhir dan feedback ke Kemahasiswaan</p>
                            </div>
                            <button 
                              onClick={() => setIsArchiveModalOpen(true)}
                              className="bg-[#1976D2] hover:bg-[#114E8D] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                            >
                              Buka Form Arsip
                            </button>
                          </div>

                          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-sm text-slate-900">Kelola Pengaturan Pengguna</p>
                              <p className="text-xs text-slate-500">Ubah peran simulasi di top bar di atas</p>
                            </div>
                            <span className="text-slate-400 text-xs italic">Demo Simulator</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* [9] SYSTEM NOTIFICATION TAB - FOR BOTH SYSTEM RENDERS (HIGH PRIVACY APPLIED) */}
            {activeTab === 'notif' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-1.5 text-slate-900">
                      <Bell className="w-5 h-5 text-[#1976D2]" /> Notifikasi Pusat Informasi
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Menampilkan update real-time yang disaring ketat berdasarkan role: <span className="font-bold">{currentUserRole.toUpperCase()}</span>
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setNotifications(notifications.map(n => ({ ...n, isUnread: false })));
                      showToast('Seluruh notifikasi ditandai telah dibaca.');
                    }}
                    className="text-xs text-[#1976D2] font-semibold hover:underline"
                  >
                    Tandai Semua Dibaca
                  </button>
                </div>

                {/* Audit Information Banner showing alignment with prompt */}
                <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex gap-2">
                  <ShieldAlert className="w-5 h-5 text-teal-600 shrink-0" />
                  <div className="leading-relaxed">
                    <p className="font-bold">Pemblokiran Data Privasi Aktif (Revision Compliance):</p>
                    <p className="text-slate-700 mt-0.5">
                      Sesuai peraturan privasi internal, data operasional, memo staf Kemahasiswaan, & persentase kinerja divisi disembunyikan otomatis bila login sebagai **Mahasiswa** atau **Guest**.
                    </p>
                  </div>
                </div>

                {/* NOTIFICATION ITERATION RENDERING */}
                <div className="space-y-3">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12 text-slate-450 text-slate-400">
                      <Bell className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                      <p className="font-bold text-slate-600">Tidak ada notifikasi saat ini.</p>
                      <p className="text-xs text-slate-400 mt-0.5">Semua info internal sedang disaring untuk level keamanan Anda.</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notif) => (
                      <div 
                        key={notif.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row justify-between gap-4 ${
                          notif.isUnread 
                            ? 'bg-gradient-to-r from-sky-50 to-white border-l-4 border-l-[#1976D2] border-slate-200' 
                            : 'bg-white border-slate-100'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            notif.category === 'Persetujuan' ? 'bg-amber-100 text-amber-800' :
                            notif.category === 'Tugas' ? 'bg-indigo-100 text-[#1976D2]' :
                            notif.category === 'Pengumuman' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-slate-150 text-slate-600'
                          }`}>
                            {notif.category.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900">{notif.title}</h4>
                              {notif.isUnread && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.description}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block font-mono">{notif.timestamp}</span>
                          </div>
                        </div>

                        {/* Quick actions inline Terima / Tolak [9] */}
                        {notif.hasQuickAction && (notif.visibility.includes('po') || notif.visibility.includes('staf')) && (
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                            <button 
                              onClick={() => {
                                showToast(`Aset persetujuan disetujui.`);
                                setNotifications(notifications.filter(n => n.id !== notif.id));
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                            >
                              Terima ✓
                            </button>
                            <button 
                              onClick={() => {
                                showToast(`Aset persetujuan ditangguhkan.`);
                                setNotifications(notifications.filter(n => n.id !== notif.id));
                              }}
                              className="px-3 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg text-xs font-bold"
                            >
                              Tolak ✗
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ROLE-BASED ACCESS CONTROL MATRIX VISUAL DISPLAY [F] */}
            <section className="bg-slate-900 rounded-2xl border p-6 text-white overflow-hidden relative shadow-lg">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 opacity-40 rounded-full blur-2xl"></div>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-[#FFC107]" />
                <div>
                  <h3 className="font-extrabold text-sm uppercase text-[#FFC107] tracking-wider">
                    Role-Based Access Control (RBAC) Matrix Visualizer
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Matriks kendali perizinan akses data (KoorEvent vs Portal Publik)
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400">
                      <th className="py-2 font-bold uppercase">Fitur Aplikasi</th>
                      <th className="py-2 text-center uppercase">Guest</th>
                      <th className="py-2 text-center uppercase">Mahasiswa</th>
                      <th className="py-2 text-center uppercase">Panitia</th>
                      <th className="py-2 text-center uppercase">PO</th>
                      <th className="py-2 text-center uppercase">Staf</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {RBAC_MATRIX.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 font-semibold text-slate-300">{row.feature}</td>
                        <td className="text-center py-2.5 font-mono text-amber-400">{row.guest}</td>
                        <td className="text-center py-2.5 font-mono text-sky-400">{row.mahasiswa}</td>
                        <td className="text-center py-2.5 font-mono text-indigo-400">{row.panitia}</td>
                        <td className="text-center py-2.5 font-mono text-teal-400">{row.po}</td>
                        <td className="text-center py-2.5 font-mono text-rose-400">{row.staf}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

          </main>

          {/* PERSISTENT FOOTER WITH ACADEMIC INSIGHT */}
          <footer className="bg-white border-t py-6 text-center text-xs text-slate-450 text-slate-500 mt-12 space-y-2">
            <p className="font-mono">
              Designed For Visily AI &bull; Tugas Design Thinking &bull; Jurusan Sistem Informasi
            </p>
            <p className="font-semibold text-slate-900">
              Interactive Prototype Sandbox v1.0.4-BUILD.STABLE &bull; All States Fully Functional
            </p>
          </footer>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL CORES - FULL STYLED DIALOG CHANNELS */}
      {/* ======================================================== */}

      {/* MODAL: [6] BUAT TUGAS BARU (Kanban) */}
      <AnimatePresence>
        {isNewTaskModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="bg-[#1976D2] text-white p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm">Buat Tugas Baru</h3>
                  <p className="text-[10px] opacity-90 text-slate-100">Tambahkan tanggung jawab baru untuk anggota panitia</p>
                </div>
                <button onClick={() => setIsNewTaskModalOpen(false)} className="hover:bg-white/10 p-1 rounded-full text-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddNewTask} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nama Tugas / Jobdesk</label>
                  <input 
                    type="text" 
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="Contoh: Ambil konsumsi boks untuk juri"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Skala Prioritas</label>
                    <select 
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as any)}
                      className="w-full border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
                    >
                      <option value="High">Tinggi (High)</option>
                      <option value="Medium">Sedang (Medium)</option>
                      <option value="Low">Rendah (Low)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tenggat Waktu</label>
                    <input 
                      type="text" 
                      required
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                      placeholder="Hari ini, 17.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Pilih Anggota (PIC)</label>
                  <select 
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
                  >
                    <option value="Bagus S.">Bagus S. (Perlengkapan)</option>
                    <option value="Dian Permata">Dian Permata (Acara)</option>
                    <option value="Doni Alwi">Doni Alwi (Keamanan)</option>
                    <option value="Eka Lestari">Eka Lestari (Konsumsi)</option>
                  </select>
                </div>

                <div className="pt-4 border-t flex gap-2 justify-end">
                  <button 
                    type="button"
                    onClick={() => setIsNewTaskModalOpen(false)}
                    className="border px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="bg-[#1976D2] hover:bg-[#114E8D] text-white px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Simpan Tugas
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: [M3] DAFTAR EVENT & RSVP WITH ROLE DETECTION */}
      <AnimatePresence>
        {isRSVPModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="bg-[#1976D2] text-white p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm">Daftar Event</h3>
                  <p className="text-[10px] opacity-90 text-slate-100">KoorEvent Auto-Confirm Engine</p>
                </div>
                <button onClick={() => setIsRSVPModalOpen(false)} className="hover:bg-white/10 p-1 rounded-full text-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmRSVP} className="p-6 space-y-4">
                
                {currentUserRole === 'guest' ? (
                  /* Guest form fields */
                  <div className="space-y-3">
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-800 text-[11px] mb-2 leading-relaxed">
                      <strong>Info Guest RSVP:</strong> Karena Anda masuk tanpa login, harap isi formulir manual di bawah. Upgrade ke Akun Mahasiswa untuk kemudahan riwayat event.
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nama Lengkap *</label>
                      <input 
                        type="text" 
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none bg-white"
                        placeholder="Contoh: Rendi Pangestu"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email Aktif *</label>
                      <input 
                        type="email" 
                        required
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none bg-white"
                        placeholder="rendi@gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Asal Institusi / Universitas</label>
                      <input 
                        type="text" 
                        required
                        value={guestInst}
                        onChange={(e) => setGuestInst(e.target.value)}
                        className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none bg-white"
                        placeholder="Universitas Terbuka"
                      />
                    </div>
                  </div>
                ) : (
                  /* Logged-in Student Auto-fill form fields */
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border">
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold uppercase">
                      Auto-Fill Aktif
                    </span>
                    <div>
                      <p className="text-[10px] text-slate-400 capitalize font-bold font-mono">Nama Lengkap / NIM</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{rsvpName} ({rsvpNim})</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 capitalize font-bold font-mono">Email Akademik</p>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">{rsvpEmail}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Pilihan Gelombang / Sesi</label>
                  <select 
                    value={rsvpSession}
                    onChange={(e) => setRsvpSession(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2.5 text-xs focus:outline-none bg-white font-semibold text-slate-700"
                  >
                    <option value="Sesi Utama (08:30)">Sesi Utama (08:30 WIB) - Presensi Gelombang 1</option>
                    <option value="Sesi Sore (13:30)">Sesi Sore (13:30 WIB) - Presensi Gelombang 2</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="chk-agreed" 
                    checked={rsvpAgreed}
                    onChange={(e) => setRsvpAgreed(e.target.checked)}
                    className="w-4 h-4 text-[#1976D2] border-slate-300 rounded" 
                  />
                  <label htmlFor="chk-agreed" className="text-[11px] text-slate-600 leading-tight">
                    Saya menyetujui syarat-syarat kehadiran & tata tertib kampus EventHub.
                  </label>
                </div>

                <div className="pt-4 border-t flex gap-2 justify-end">
                  <button 
                    type="button"
                    onClick={() => setIsRSVPModalOpen(false)}
                    className="border px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="bg-[#1976D2] hover:bg-[#114E8D] text-white px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Konfirmasi Daftar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: SUCCESS REGISTER RSVP STATE WITH CONFETTI MESSAGE */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="bg-emerald-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Check className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-extrabold text-slate-900">Pendaftaran Berhasil!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Registrasi Anda untuk <strong>{selectedEvent.title}</strong> telah divalidasi oleh KoorEvent.
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border my-4">
                <p className="text-[9px] text-slate-400 capitalize font-bold">Rundown check-in digital aktif</p>
                <div className="flex justify-between items-center mt-2 text-xs">
                  <span className="font-mono font-bold text-slate-700">#EVT-2026-F58K9</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full">AKTIF</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button 
                  onClick={() => {
                    setIsSuccessModalOpen(false);
                    setActiveTab('event_saya');
                  }}
                  className="w-full bg-[#1976D2] hover:bg-[#114E8D] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Lihat E-Ticket Saya
                </button>
                <button 
                  onClick={() => {
                    setIsSuccessModalOpen(false);
                    showToast('Event disinkronkan ke Google Calendar!');
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-[11px] font-bold transition-all"
                >
                  Tambah ke Kalender
                </button>
                <button 
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="w-full text-slate-500 hover:text-slate-800 text-[11px] font-semibold block transition-colors pt-2"
                >
                  Kembali ke Beranda
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: [10] EVALUASI & ARSIP EVENT (PO / STAF EXCLUSIVE ACTION) */}
      <AnimatePresence>
        {isArchiveModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm">Evaluasi & Penguncian Dokumen</h3>
                  <p className="text-[10px] text-slate-350">Laporan Akhir Pertanggungjawaban (LPJ)</p>
                </div>
                <button onClick={() => setIsArchiveModalOpen(false)} className="hover:bg-white/10 p-1 rounded-full text-slate-350">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800">
                  <div className="flex gap-2 items-start">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
                    <div>
                      <p className="font-bold">Dokumen Evaluasi Bersifat Penguncian Permanen!</p>
                      <p className="mt-0.5 opacity-90">
                        Begitu Anda mengirim dokumen LPJ ini, data koordinasi, jobdesk, dan riwayat rundown akan dikunci dan dikonversikan ke arsip SIPPK Kemahasiswaan. Pengubahan dilarang setelah validasi.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Rating Evaluasi Acara</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => {
                          setEventRating(star);
                          showToast(`Rating diset ke ${star} bintang`);
                        }}
                        className="text-2xl text-amber-400 hover:scale-110 focus:outline-none transition-transform"
                      >
                        {star <= eventRating ? '★' : '☆'}
                      </button>
                    ))}
                    <span className="text-xs text-slate-500 font-bold ml-2">({eventRating} / 5 Bintang)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Lessons Learned (Catatan Evaluasi)</label>
                  <textarea 
                    value={lessonsLearned}
                    onChange={(e) => setLessonsLearned(e.target.value)}
                    required
                    rows={3}
                    placeholder="Contoh: Hambatan terdapat pada logistik listrik sound cadangan. Untuk event Dies Natalis didepan sarankan penalti vendor."
                    className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tautkan Berkas Laporan Drive</label>
                  <input 
                    type="text" 
                    defaultValue="https://drive.google.com/drive/folders/koorevent_lpj_dies58" 
                    className="w-full border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none bg-slate-50"
                  />
                </div>

                <div className="pt-4 border-t flex gap-2 justify-end text-xs">
                  <button 
                    type="button"
                    onClick={() => setIsArchiveModalOpen(false)}
                    className="border px-4 py-2 rounded-xl font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsArchiveModalOpen(false);
                      showToast('Selamat! Dokumen LPJ Berhasil dikirim & divalidasi ke Staf Kemahasiswaan Tri Wahyuni.');
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold"
                  >
                    Arsip Event & Kirim LPJ
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
