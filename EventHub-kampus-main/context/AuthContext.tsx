// ADDED: Global Unified Auth, Toast, and Notification Management Context
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ToastContainer, ToastItem } from "../components/Toast";
import { getEvents, saveEvents, EventWithCertificate, initializeDatabase } from "../lib/certificateData";

interface UserProfile {
  email: string;
  nama: string;
  nim: string; // NIM or NIP or blank
  role: "guest" | "mahasiswa" | "panitia" | "po" | "staf";
  isLoggedIn: boolean;
  tanggalBergabung?: string;
}

export interface LocalNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: "Tugas" | "Persetujuan" | "Pengumuman" | "Sertifikat" | "Event";
  isUnread: boolean;
  roleVisibility: string[]; // roles that see this
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  toasts: ToastItem[];
  notifications: LocalNotification[];
  addToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
  removeToast: (id: string) => void;
  loginUser: (email: string, password: string) => Promise<boolean>;
  registerUser: (data: { nama: string; email: string; nim: string; role: "mahasiswa" | "staf"; password: string }) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  addNotification: (title: string, description: string, category: LocalNotification["category"], roleVisibility: string[]) => void;
  markNotificationsAsRead: () => void;
  updateUserProfile: (nama: string, nim: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_NOTIFICATIONS: LocalNotification[] = [
  {
    id: "notif-1",
    title: "Sertifikat Siap Diunduh",
    description: "Sertifikat untuk Event 'Seminar AI & Kampus Digital' telah disetujui PO dan siap diunduh.",
    timestamp: "Baru saja",
    category: "Sertifikat",
    isUnread: true,
    roleVisibility: ["mahasiswa"]
  },
  {
    id: "notif-2",
    title: "Event Baru Diajukan",
    description: "Proposal event 'Dies Natalis' menunggu persetujuan dari Project Officer.",
    timestamp: "10 menit lalu",
    category: "Persetujuan",
    isUnread: true,
    roleVisibility: ["po"]
  },
  {
    id: "notif-3",
    title: "Jobdesk Kanban Update",
    description: "Tugas logistik sound system telah diubah menjadi 'On Progress' oleh panitia.",
    timestamp: "1 jam lalu",
    category: "Tugas",
    isUnread: false,
    roleVisibility: ["panitia", "po"]
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      const savedAuth = localStorage.getItem("eventhub_auth");
      if (savedAuth) {
        try {
          return JSON.parse(savedAuth);
        } catch (e) {
          localStorage.removeItem("eventhub_auth");
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [notifications, setNotifications] = useState<LocalNotification[]>(() => {
    if (typeof window !== "undefined") {
      const savedNotifs = localStorage.getItem("eventhub_notifications");
      if (savedNotifs) {
        try {
          return JSON.parse(savedNotifs);
        } catch (e) {
          return DEFAULT_NOTIFICATIONS;
        }
      } else {
        localStorage.setItem("eventhub_notifications", JSON.stringify(DEFAULT_NOTIFICATIONS));
        return DEFAULT_NOTIFICATIONS;
      }
    }
    return [];
  });
  const router = useRouter();

  // Load state on mount
  useEffect(() => {
    initializeDatabase();
    setTimeout(() => {
      setLoading(false);
    }, 0);
  }, []);

  const addToast = (message: string, type: ToastItem["type"] = "info") => {
    const newToast: ToastItem = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  const loginUser = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Match against Demo Accounts inside next-auth first
    const demoAccounts: Record<string, { name: string; role: UserProfile["role"]; nim: string }> = {
      "po@nurulfikri.ac.id": { name: "Project Officer", role: "po", nim: "NIP-77112" },
      "panitia@nurulfikri.ac.id": { name: "Divisi Acara", role: "panitia", nim: "NIM-2021045" },
      "mahasiswa@nurulfikri.ac.id": { name: "Budi Santoso", role: "mahasiswa", nim: "2021001" },
      "staff@nurulfikri.ac.id": { name: "Staf Kemahasiswaan", role: "staf", nim: "NIP-44919" },
    };

    const isDemo = demoAccounts[email.toLowerCase()];
    if (isDemo && (password === "po123" || password === "panitia123" || password === "mhs123" || password === "staff123")) {
      const activeUser: UserProfile = {
        email: email.toLowerCase(),
        nama: isDemo.name,
        role: isDemo.role,
        nim: isDemo.nim,
        isLoggedIn: true,
        tanggalBergabung: "2026-01-10",
      };
      
      localStorage.setItem("eventhub_auth", JSON.stringify(activeUser));
      // Sync with "currentUser" format requested by user
      localStorage.setItem("currentUser", JSON.stringify({
        email: email.toLowerCase(),
        nama: isDemo.name,
        role: isDemo.role,
        nimNip: isDemo.nim,
        isLoggedIn: true
      }));

      setUser(activeUser);
      
      addToast(`Selamat datang kembali, ${activeUser.nama}!`, "success");

      // Next-Auth Login trigger to make session middleware happy
      try {
        await nextAuthSignIn("credentials", {
          email: email.toLowerCase(),
          password,
          name: isDemo.name,
          role: isDemo.role,
          redirect: false
        });
      } catch (authError) {
        console.warn("NextAuth login background sync omitted or blocked inside Sandbox: ", authError);
      }

      const routeRole = activeUser.role === "staf" ? "staff" : activeUser.role;
      router.replace(`/dashboard/${routeRole}`);
      setLoading(false);
      return true;
    }

    // Checking client-side custom registered users in localStorage (checking both registeredUsers and eventhub_registered_users)
    const savedUsersStr = localStorage.getItem("registeredUsers") || localStorage.getItem("eventhub_registered_users");
    if (savedUsersStr) {
      try {
        const savedUsers = JSON.parse(savedUsersStr);
        // Map fields based on which array format is loaded
        const matched = savedUsers.find((u: any) => {
          const uEmail = u.email || "";
          const uPassword = u.password || "";
          return uEmail.toLowerCase() === email.toLowerCase() && uPassword === password;
        });
        if (matched) {
          const matchedName = matched.namaLengkap || matched.nama;
          const matchedNim = matched.nimNip || matched.nim;
          const activeUser: UserProfile = {
            email: matched.email,
            nama: matchedName,
            role: matched.role,
            nim: matchedNim || "NIM-BELUM-SET",
            isLoggedIn: true,
            tanggalBergabung: matched.tanggalDaftar ? matched.tanggalDaftar.split("T")[0] : matched.tanggalBergabung || "2026-05-31",
          };

          localStorage.setItem("eventhub_auth", JSON.stringify(activeUser));
          // Sync with "currentUser" format requested by user
          localStorage.setItem("currentUser", JSON.stringify({
            email: matched.email,
            nama: matchedName,
            role: matched.role,
            nimNip: matchedNim || "",
            isLoggedIn: true
          }));

          setUser(activeUser);

          addToast(`Pendaftaran Berhasil! Selamat datang ${activeUser.nama}`, "success");

          // Next-Auth Login trigger 
          try {
            await nextAuthSignIn("credentials", {
              email: matched.email,
              password,
              name: matchedName,
              role: matched.role,
              redirect: false
            });
          } catch (authError) {
            console.warn("NextAuth login background sync omitted or blocked inside Sandbox: ", authError);
          }

          const routeRole = activeUser.role === "staf" ? "staff" : activeUser.role;
          router.replace(`/dashboard/${routeRole}`);
          setLoading(false);
          return true;
        }
      } catch (e) {
        console.error(e);
      }
    }

    addToast("Email atau password yang Anda masukkan salah", "error");
    setLoading(false);
    return false;
  };

  const registerUser = async (data: { nama: string; email: string; nim: string; role: "mahasiswa" | "staf"; password: string }): Promise<boolean> => {
    setLoading(true);
    
    const savedUsersStr = localStorage.getItem("registeredUsers") || localStorage.getItem("eventhub_registered_users") || "[]";
    let savedUsers = [];
    try {
      savedUsers = JSON.parse(savedUsersStr);
    } catch (e) {
      savedUsers = [];
    }

    const emailExist = savedUsers.some((u: any) => u.email.toLowerCase() === data.email.toLowerCase());
    const isDemoExist = ["po@nurulfikri.ac.id", "panitia@nurulfikri.ac.id", "mahasiswa@nurulfikri.ac.id", "staff@nurulfikri.ac.id"].includes(data.email.toLowerCase());

    if (emailExist || isDemoExist) {
      addToast("Email kampus tersebut sudah terdaftar!", "error");
      setLoading(false);
      return false;
    }

    // Add user in eventhub format
    const newUser = {
      nama: data.nama,
      email: data.email.toLowerCase(),
      nim: data.nim,
      role: data.role === "staf" ? "staf" : "mahasiswa",
      password: data.password,
      tanggalBergabung: new Date().toISOString().split("T")[0],
    };

    // Add user in standard requested registeredUsers format
    const newRegUser = {
      id: Date.now().toString(),
      namaLengkap: data.nama,
      email: data.email.toLowerCase(),
      nimNip: data.nim,
      role: data.role === "staf" ? "staf" : "mahasiswa",
      password: data.password,
      tanggalDaftar: new Date().toISOString()
    };

    // Save both
    let currEventhubUsers = [];
    try { currEventhubUsers = JSON.parse(localStorage.getItem("eventhub_registered_users") || "[]"); } catch(e) {}
    currEventhubUsers.push(newUser);
    localStorage.setItem("eventhub_registered_users", JSON.stringify(currEventhubUsers));

    let currRegUsers = [];
    try { currRegUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]"); } catch(e) {}
    currRegUsers.push(newRegUser);
    localStorage.setItem("registeredUsers", JSON.stringify(currRegUsers));
    
    // Add toast
    addToast("Akun berhasil dibuat! Silakan masuk ke Tab Masuk.", "success");
    setLoading(false);
    return true;
  };

  const logoutUser = async () => {
    setLoading(true);
    
    // Wipe only current auth session completely and preserve all applications and tasks data
    if (typeof window !== "undefined") {
      localStorage.removeItem("eventhub_auth");
      localStorage.removeItem("currentUser");
      sessionStorage.clear();
    }

    setUser(null);
    addToast("Anda telah keluar dari EventHub Kampus", "info");
    
    try {
      await nextAuthSignOut({ redirect: false });
    } catch (e) {
      console.warn("Omitted nextAuthSignOut error: ", e);
    }

    // Force a complete browser reload/redirect to ensure all client cached states and routes flush
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    setLoading(false);
  };

  const addNotification = (title: string, description: string, category: LocalNotification["category"], roleVisibility: string[]) => {
    const newNotif: LocalNotification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      title,
      description,
      timestamp: "Baru saja",
      category,
      isUnread: true,
      roleVisibility
    };
    
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    localStorage.setItem("eventhub_notifications", JSON.stringify(updated));
  };

  const markNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isUnread: false }));
    setNotifications(updated);
    localStorage.setItem("eventhub_notifications", JSON.stringify(updated));
  };

  const updateUserProfile = (nama: string, nim: string) => {
    if (!user) return;
    const updated = { ...user, nama, nim };
    setUser(updated);
    localStorage.setItem("eventhub_auth", JSON.stringify(updated));
    addToast("Profil Anda berhasil diperbarui!", "success");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        toasts,
        notifications,
        addToast,
        removeToast,
        loginUser,
        registerUser,
        logoutUser,
        addNotification,
        markNotificationsAsRead,
        updateUserProfile
      }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
