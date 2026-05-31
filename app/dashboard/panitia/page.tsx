// ADDED: High fidelity modular responsive Panitia Kanban & Command Dashboard
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { 
  Building2, Calendar, CheckCircle2, Circle, Clock, MessageSquare, 
  Send, Plus, Award, LayoutGrid, Kanban, ListTodo, Activity, HelpCircle, X 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";

interface KanbanTask {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  assignee: string;
  status: "todo" | "progress" | "done";
}

interface MessageItem {
  id: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
}

const fallbackTasks: KanbanTask[] = [
  { id: "task-1", title: "Sewa sound system cadangan (genset)", priority: "High", dueDate: "Hari ini, 15:00", assignee: "Ani Wijaya", status: "todo" },
  { id: "task-2", title: "Siapkan konsumsi untuk pemateri seminar", priority: "Medium", dueDate: "Besok, 08:00", assignee: "Budi Santoso", status: "progress" },
  { id: "task-3", title: "Briefing dengan tim LO", priority: "High", dueDate: "Lusa, 14:00", assignee: "Siti M.", status: "progress" },
  { id: "task-4", title: "Cetak id card panitia pelaksana", priority: "Low", dueDate: "Selesai", assignee: "Andi R.", status: "done" }
];

const fallbackChats: MessageItem[] = [
  { id: "msg-1", senderName: "Ani Wijaya (Panitia)", senderRole: "Divisi Acara", content: "Teman-teman, sound system cadangan sudah aman disewa.", timestamp: "10:42 AM" },
  { id: "msg-2", senderName: "Dr. Ahmad PO", senderRole: "Project Officer", content: "Bagus, tolong dipastikan genset juga diletakkan dekat panggung.", timestamp: "11:05 AM" },
  { id: "msg-3", senderName: "Dani Rahman (Staf)", senderRole: "Staf Mhs", content: "Jika proposal akhir LPJ sudah siap, segera infokan ke staf ya.", timestamp: "11:15 AM" }
];

export default function PanitiaDashboardPage() {
  const router = useRouter();
  const { user, addToast, addNotification } = useAuth();

  // App States
  const [tasks, setTasks] = useState<KanbanTask[]>(() => {
    if (typeof window !== "undefined") {
      const storedTasks = localStorage.getItem("eventhub_kanban_tasks");
      if (storedTasks) {
        try {
          return JSON.parse(storedTasks);
        } catch (e) {
          return fallbackTasks;
        }
      } else {
        localStorage.setItem("eventhub_kanban_tasks", JSON.stringify(fallbackTasks));
        return fallbackTasks;
      }
    }
    return [];
  });
  const [chats, setChats] = useState<MessageItem[]>(() => {
    if (typeof window !== "undefined") {
      const storedChats = localStorage.getItem("eventhub_kanban_chats");
      if (storedChats) {
        try {
          return JSON.parse(storedChats);
        } catch (e) {
          return fallbackChats;
        }
      } else {
        localStorage.setItem("eventhub_kanban_chats", JSON.stringify(fallbackChats));
        return fallbackChats;
      }
    }
    return [];
  });
  const [chatInput, setChatInput] = useState("");

  // Modal / Form States
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [newAssignee, setNewAssignee] = useState("");
  const [newDueDate, setNewDueDate] = useState("Besok, 13:00");

  useEffect(() => {
    // Synchronize to local storage on mount
    const storedTasks = localStorage.getItem("eventhub_kanban_tasks");
    if (!storedTasks) {
      localStorage.setItem("eventhub_kanban_tasks", JSON.stringify(fallbackTasks));
    }
    const storedChats = localStorage.getItem("eventhub_kanban_chats");
    if (!storedChats) {
      localStorage.setItem("eventhub_kanban_chats", JSON.stringify(fallbackChats));
    }
  }, []);

  const saveTasksToStorage = (updatedTasks: KanbanTask[]) => {
    setTasks(updatedTasks);
    localStorage.setItem("eventhub_kanban_tasks", JSON.stringify(updatedTasks));
  };

  const handleMoveTask = (id: string, newStatus: "todo" | "progress" | "done") => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        return { ...t, status: newStatus };
      }
      return t;
    });
    saveTasksToStorage(updated);
    addToast("Tugas dipindahkan!", "success");
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      addToast("Harap isi deskripsi tugas!", "warning");
      return;
    }

    const newTask: KanbanTask = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      priority: newPriority,
      dueDate: newDueDate,
      assignee: newAssignee.trim() || user?.nama || "Panitia",
      status: "todo"
    };

    const updated = [...tasks, newTask];
    saveTasksToStorage(updated);
    setShowAddTask(false);
    
    // Alert system
    addNotification(
      "Tugas Baru Ditambahkan",
      `Tugas '${newTask.title}' dimasukkan ke kolom To Do oleh Panitia.`,
      "Tugas",
      ["panitia", "po"]
    );

    addToast("Tugas baru berhasil dirilis!", "success");
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newChat: MessageItem = {
      id: `msg-${Date.now()}`,
      senderName: user?.nama || "Panitia Aktif",
      senderRole: "Divisi Acara",
      content: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
      }) + " WIB"
    };

    const updatedChats = [...chats, newChat];
    setChats(updatedChats);
    localStorage.setItem("eventhub_kanban_chats", JSON.stringify(updatedChats));
    setChatInput("");
  };

  return (
    <div id="panitia-dashboard-top" className="space-y-6">
      {/* Visual greeting Banner */}
      <div className="bg-gradient-to-br from-[#114E8D] to-[#165a9e] text-white rounded-3xl p-6 md:p-8 shadow-md border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full mb-3">
            <Kanban className="w-3.5 h-3.5" /> PENGENDALI KEPANITIAAN BEM
          </div>
          <h1 className="text-2xl md:text-3.5xl font-black tracking-tight leading-none">
            Roster & Penugasan Panitia
          </h1>
          <p className="text-slate-200 text-xs md:text-sm max-w-lg mt-2 leading-relaxed">
            Organisasikan tugas pelaksana secara visual. Tautkan e-sertifikat peserta, laporkan kehadiran presensi event, dan sinkronisasi rundown di panel administrasi ini.
          </p>
        </div>

        <button
          onClick={() => router.push("/dashboard/panitia/sertifikat")}
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-950/10 shrink-0"
        >
          <Award className="w-4 h-4 fill-current" /> Kelola & Ajukan Sertifikat
        </button>
      </div>

      {/* Grid: Kanban Board + Chat Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kanban Task Panel (Col-span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase text-slate-500 tracking-widest flex items-center gap-1.5">
              <ListTodo className="w-4 h-4 text-[#114E8D]" /> Kanban Board Pelaksanaan
            </h2>
            <button
              onClick={() => {
                setNewTitle("");
                setNewAssignee("");
                setShowAddTask(true);
              }}
              className="bg-[#114E8D] hover:bg-blue-800 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Buat Tugas
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* COLUMN 1: TO DO */}
            <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col gap-3 min-h-[380px]">
              <div className="border-b pb-2 flex items-center justify-between">
                <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500">To Do</span>
                <span className="bg-slate-200 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-lg">
                  {tasks.filter((t) => t.status === "todo").length}
                </span>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[350px]">
                {tasks.filter((t) => t.status === "todo").map((t) => (
                  <TaskCard key={t.id} task={t} onMove={handleMoveTask} />
                ))}
                {tasks.filter((t) => t.status === "todo").length === 0 && (
                  <p className="text-[10.5px] text-slate-400 font-bold font-mono py-10 text-center">Kolom Kosong</p>
                )}
              </div>
            </div>

            {/* COLUMN 2: IN PROGRESS */}
            <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col gap-3 min-h-[380px]">
              <div className="border-b pb-2 flex items-center justify-between">
                <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500">In Progress</span>
                <span className="bg-blue-105 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-lg">
                  {tasks.filter((t) => t.status === "progress").length}
                </span>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[350px]">
                {tasks.filter((t) => t.status === "progress").map((t) => (
                  <TaskCard key={t.id} task={t} onMove={handleMoveTask} />
                ))}
                {tasks.filter((t) => t.status === "progress").length === 0 && (
                  <p className="text-[10.5px] text-slate-400 font-bold font-mono py-10 text-center">Kolom Kosong</p>
                )}
              </div>
            </div>

            {/* COLUMN 3: DONE */}
            <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col gap-3 min-h-[380px]">
              <div className="border-b pb-2 flex items-center justify-between">
                <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500">Done</span>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-lg">
                  {tasks.filter((t) => t.status === "done").length}
                </span>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[350px]">
                {tasks.filter((t) => t.status === "done").map((t) => (
                  <TaskCard key={t.id} task={t} onMove={handleMoveTask} />
                ))}
                {tasks.filter((t) => t.status === "done").length === 0 && (
                  <p className="text-[10.5px] text-slate-400 font-bold font-mono py-10 text-center">Kolom Kosong</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live coordinating Messaging Roster (Col-span 1) */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase text-slate-500 tracking-widest flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-[#114E8D]" /> Ruang Koordinasi Pentas BEM
          </h2>

          <div className="bg-white border rounded-3xl p-4 flex flex-col justify-between h-[430.5px] shadow-sm select-none">
            {/* Chats Container thread */}
            <div className="space-y-3 overflow-y-auto max-h-[320px] pr-1">
              {chats.map((msg) => (
                <div key={msg.id} className="text-xs">
                  <div className="flex justify-between items-center mb-0.5 font-bold">
                    <span className="text-slate-800 font-black">{msg.senderName}</span>
                    <span className="text-[9px] font-mono font-medium text-slate-450">{msg.timestamp}</span>
                  </div>
                  <div className="bg-slate-100 rounded-2xl p-2.5 font-semibold text-slate-700 leading-normal">
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendChat} className="mt-3 flex gap-2 border-t pt-3">
              <input
                type="text"
                placeholder="Tulis pesan penyelarasan..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-50 border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
              <button
                type="submit"
                className="bg-[#114E8D] hover:bg-blue-800 text-white p-2.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Send className="w-4 h-4 fill-current" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Stage Rundown / Rundown schedule tracker summary */}
      <div className="bg-white rounded-3xl border p-6 shadow-sm">
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-[#114E8D]" /> Agenda Pelaksanaan Hari-H (Dies Natalis)
        </h2>
        
        <div className="overflow-x-auto select-none">
          <table className="w-full text-left text-xs text-slate-600 font-bold">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-black uppercase tracking-wider text-[10px] border-b">
                <th className="py-2.5 px-4">Waktu</th>
                <th className="py-2.5 px-4">Deskripsi Rundown Pentas</th>
                <th className="py-2.5 px-4">PIC Lapangan</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-3 px-4 font-mono text-[#114E8D]">08:30 - 09:00</td>
                <td className="py-3 px-4 text-slate-800">Registrasi Peserta, Pemeriksaan e-ticket QR Code</td>
                <td className="py-3 px-4">Divisi Acara (Humas)</td>
                <td className="py-3 px-4 text-center">
                  <span className="bg-blue-105 text-blue-700 px-2 py-0.5 rounded font-bold uppercase text-[9px]">Berlangsung</span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-[#114E8D]">09:00 - 10:15</td>
                <td className="py-3 px-4 text-slate-800">Sambutan Rektor Utama & Pembukaan Dies Natalis 58</td>
                <td className="py-3 px-4">Siti M. (Acara)</td>
                <td className="py-3 px-4 text-center">
                  <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase text-[9px]">Diposkan</span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-[#114E8D]">10:15 - 11:30</td>
                <td className="py-3 px-4 text-slate-800">Pagelaran Seni Mahasiswa, Teater, Tari Tradisional</td>
                <td className="py-3 px-4">Helmi Wirata (LO)</td>
                <td className="py-3 px-4 text-center">
                  <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase text-[9px]">Diposkan</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE KANBAN TASK DIALOG */}
      <AnimatePresence>
        {showAddTask && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[100] overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="bg-[#114E8D] text-white p-5 flex justify-between items-center border-b-[3.5px] border-amber-400">
                <h3 className="font-black text-sm uppercase tracking-tight">Baru, Rilis Penugasan</h3>
                <button onClick={() => setShowAddTask(false)} className="hover:bg-white/10 p-1 rounded-full text-white/50 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTask} className="p-6 space-y-4 text-xs font-bold leading-none">
                <div>
                  <label className="block text-slate-500 uppercase font-bold text-[10px] tracking-wider mb-1.5">Deskripsi Tugas</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Beli kabel LAN panggung 20 meter"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl py-2 px-3 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 uppercase font-bold text-[10px] tracking-wider mb-1.5">Prioritas</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="w-full bg-slate-50 border rounded-xl py-2 px-3 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="High">Tinggi (High)</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Rendah (Low)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 uppercase font-bold text-[10px] tracking-wider mb-1.5">Batas Tenggat</label>
                    <input
                      type="text"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full bg-slate-50 border rounded-xl py-2 px-3 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 uppercase font-bold text-[10px] tracking-wider mb-1.5">Penanggung Jawab (Assignee)</label>
                  <input
                    type="text"
                    placeholder="Nama panitia"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl py-2 px-3 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div className="pt-4 border-t flex gap-2 justify-end text-xs">
                  <button
                    type="button"
                    onClick={() => setShowAddTask(false)}
                    className="border px-4 py-2 rounded-xl font-bold hover:bg-slate-50 uppercase text-slate-500 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-[#114E8D] hover:bg-blue-800 text-white px-4 py-2 rounded-xl font-black uppercase tracking-wider cursor-pointer"
                  >
                    Terbitkan Tugas
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Subordinate Task card component with state switches
function TaskCard({ task, onMove }: { task: KanbanTask; onMove: (id: string, stat: "todo" | "progress" | "done") => void }) {
  const getPriorityColor = (p: string) => {
    switch (p) {
      case "High":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "Medium":
        return "bg-amber-100 text-amber-900 border-amber-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-xl border p-3.5 shadow-sm space-y-3">
      <div className="flex justify-between items-center">
        <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        <span className="text-[10px] font-mono text-slate-400 font-bold truncate max-w-[80px]">
          {task.assignee}
        </span>
      </div>

      <p className="font-extrabold text-[12px] text-slate-800 leading-snug">
        {task.title}
      </p>

      <div className="flex items-center gap-1 text-[10px] text-slate-450 font-bold border-t pt-2">
        <Clock className="w-3.5 h-3.5" />
        <span>Tenggat: {task.dueDate}</span>
      </div>

      {/* Manual fast switch buttons under task card for mobile/iFrame safety */}
      <div className="flex gap-1.5 pt-1 text-[10px] leading-none select-none">
        {task.status !== "todo" && (
          <button
            onClick={() => onMove(task.id, task.status === "progress" ? "todo" : "progress")}
            className="flex-1 text-center bg-slate-50 border hover:bg-slate-100 py-1 rounded font-bold cursor-pointer"
          >
            ← Back
          </button>
        )}
        {task.status !== "done" && (
          <button
            onClick={() => onMove(task.id, task.status === "todo" ? "progress" : "done")}
            className="flex-1 text-center bg-[#114E8D] text-white hover:bg-blue-800 py-1 rounded font-black cursor-pointer"
          >
            Move →
          </button>
        )}
      </div>
    </div>
  );
}
