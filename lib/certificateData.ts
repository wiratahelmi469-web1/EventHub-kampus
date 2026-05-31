// ADDED: certificateData.ts for localStorage synchronization
import { INITIAL_EVENTS } from "./mockData";

export interface PesertaItem {
  nim: string;
  nama: string;
  email: string;
  statusHadir: "hadir" | "tidak_hadir" | "menunggu";
  sertifikatDownloaded: boolean;
  nomorSertifikat: string;
}

export interface EventWithCertificate {
  id: string;
  nama: string;
  tanggal: string;
  lokasi: string;
  penyelenggara: string;
  kategori: string;
  status: "aktif" | "selesai" | "pending" | "approved" | "pending_approval" | "rejected";
  sertifikatStatus: "pending" | "approved" | "rejected" | null;
  sertifikatDisetujuiOleh?: string;
  sertifikatTemplateUrl?: string; // Uploaded custom design
  sertifikatAlasanPenolakan?: string;
  peserta: PesertaItem[];
  kuota: number;
  kuotaMax: number;
  kuotaTerisi: number;
  jam?: string;
  pengajuEmail?: string;
  eventStatus?: "buka" | "tutup" | "selesai" | "segera";
  tanggalDiajukan?: string;
  deskripsi?: string;
}

// Seeding of user's requested DUMMY_EVENTS
const DEFAULT_EVENTS: EventWithCertificate[] = [
  {
    id: "EVT001",
    nama: "Seminar Nasional AI & Transformasi Digital",
    kategori: "Seminar",
    tanggal: "2026-07-15",
    jam: "08.00 - 17.00 WIB",
    lokasi: "Aula Utama Gedung A",
    penyelenggara: "Divisi Akademik BEM",
    pengajuEmail: "panitia@kampus.ac.id",
    kuotaMax: 200,
    kuota: 200,
    kuotaTerisi: 143,
    status: "approved",          
    eventStatus: "buka",         
    tanggalDiajukan: "2026-06-01",
    deskripsi: "Seminar membahas peran AI dalam dunia pendidikan.",
    sertifikatStatus: null,
    peserta: []
  },
  {
    id: "EVT002",
    nama: "Workshop UI/UX Design Thinking",
    kategori: "Workshop",
    tanggal: "2026-07-22",
    jam: "09.00 - 15.00 WIB",
    lokasi: "Lab Komputer Lantai 3",
    penyelenggara: "Himpunan Sistem Informasi",
    pengajuEmail: "panitia@kampus.ac.id",
    kuotaMax: 50,
    kuota: 50,
    kuotaTerisi: 50,
    status: "approved",
    eventStatus: "tutup",
    tanggalDiajukan: "2026-06-05",
    deskripsi: "Workshop intensif design thinking dan prototyping Figma.",
    sertifikatStatus: null,
    peserta: []
  },
  {
    id: "EVT003",
    nama: "Lomba Karya Tulis Ilmiah 2026",
    kategori: "Lomba",
    tanggal: "2026-08-05",
    jam: "08.00 WIB",
    lokasi: "Online (Zoom)",
    penyelenggara: "UKM Penelitian",
    pengajuEmail: "panitia@kampus.ac.id",
    kuotaMax: 100,
    kuota: 100,
    kuotaTerisi: 28,
    status: "approved",
    eventStatus: "buka",
    tanggalDiajukan: "2026-06-10",
    deskripsi: "Lomba KTI tingkat nasional berhadiah total 15 juta rupiah.",
    sertifikatStatus: null,
    peserta: []
  },
  {
    id: "EVT004",
    nama: "Pelatihan Public Speaking",
    kategori: "Workshop",
    tanggal: "2026-06-10",
    jam: "13.00 - 17.00 WIB",
    lokasi: "Ruang Seminar B",
    penyelenggara: "UKM Debat",
    pengajuEmail: "panitia@kampus.ac.id",
    kuotaMax: 60,
    kuota: 60,
    kuotaTerisi: 60,
    status: "approved",
    eventStatus: "selesai",
    tanggalDiajukan: "2025-05-01",
    deskripsi: "Pelatihan berbicara di depan umum oleh praktisi.",
    sertifikatStatus: "approved",
    peserta: [
      {
        nim: "2021001",
        nama: "Budi Santoso",
        email: "mahasiswa@kampus.ac.id",
        statusHadir: "hadir",
        nomorSertifikat: "CERT-2026-EVT004-2021001",
        sertifikatDownloaded: false
      }
    ]
  },
  {
    id: "EVT005",
    nama: "Turnamen Futsal Antar Jurusan",
    kategori: "Olahraga",
    tanggal: "2026-08-20",
    jam: "07.00 WIB",
    lokasi: "Lapangan Futsal Kampus",
    penyelenggara: "UKM Olahraga",
    pengajuEmail: "panitia@kampus.ac.id",
    kuotaMax: 80,
    kuota: 80,
    kuotaTerisi: 12,
    status: "approved",
    eventStatus: "buka",
    tanggalDiajukan: "2026-06-15",
    deskripsi: "Turnamen futsal berhadiah antar jurusan se-kampus.",
    sertifikatStatus: null,
    peserta: []
  },
  {
    id: "EVT006",
    nama: "Malam Keakraban Mahasiswa Baru",
    kategori: "Sosial",
    tanggal: "2026-09-01",
    jam: "19.00 - 22.00 WIB",
    lokasi: "Gedung Serba Guna",
    penyelenggara: "Panitia OSPEK",
    pengajuEmail: "panitia@kampus.ac.id",
    kuotaMax: 500,
    kuota: 500,
    kuotaTerisi: 89,
    status: "approved",
    eventStatus: "segera",
    tanggalDiajukan: "2026-06-20",
    deskripsi: "Acara keakraban untuk mahasiswa baru.",
    sertifikatStatus: null,
    peserta: []
  },
  {
    id: "EVT007",
    nama: "Hackathon Kampus 2026",
    kategori: "Lomba",
    tanggal: "2026-08-10",
    jam: "08.00 WIB",
    lokasi: "Lab Inovasi Gedung C",
    penyelenggara: "Himpunan Informatika",
    pengajuEmail: "panitia@kampus.ac.id",
    kuotaMax: 120,
    kuota: 120,
    kuotaTerisi: 0,
    status: "pending_approval",
    eventStatus: "segera",
    tanggalDiajukan: "2026-06-28",
    deskripsi: "Hackathon 24 jam membangun solusi digital kampus.",
    sertifikatStatus: null,
    peserta: []
  },
  {
    id: "EVT008",
    nama: "Webinar Karir & Industri IT",
    kategori: "Seminar",
    tanggal: "2026-07-30",
    jam: "14.00 - 16.00 WIB",
    lokasi: "Online (Google Meet)",
    penyelenggara: "Divisi Karir BEM",
    pengajuEmail: "panitia@kampus.ac.id",
    kuotaMax: 300,
    kuota: 300,
    kuotaTerisi: 0,
    status: "pending_approval",
    eventStatus: "segera",
    tanggalDiajukan: "2026-06-29",
    deskripsi: "Webinar bersama praktisi IT dari perusahaan teknologi.",
    sertifikatStatus: null,
    peserta: []
  }
];

export function initializeDatabase() {
  if (typeof window === "undefined") return;
  
  if (!localStorage.getItem("events")) {
    localStorage.setItem("events", JSON.stringify(DEFAULT_EVENTS));
  }
}

export function getEvents(): EventWithCertificate[] {
  if (typeof window === "undefined") return DEFAULT_EVENTS;
  initializeDatabase();
  const data = localStorage.getItem("events");
  if (!data) return DEFAULT_EVENTS;
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_EVENTS;
  }
}

export function saveEvents(events: EventWithCertificate[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("events", JSON.stringify(events));
}
