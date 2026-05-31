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
  status: "aktif" | "selesai" | "pending";
  sertifikatStatus: "pending" | "approved" | "rejected" | null;
  sertifikatDisetujuiOleh?: string;
  sertifikatTemplateUrl?: string; // Uploaded custom design
  sertifikatAlasanPenolakan?: string;
  peserta: PesertaItem[];
  kuota: number;
  kuotaTerisi: number;
}

// Initial seeding of data if not present
const DEFAULT_EVENTS: EventWithCertificate[] = [
  {
    id: "EVT001",
    nama: "Seminar AI & Kampus Digital",
    tanggal: "2026-03-15",
    lokasi: "Aula Utama Kampus",
    penyelenggara: "Divisi Akademik",
    kategori: "Seminar",
    status: "selesai",
    sertifikatStatus: "approved",
    sertifikatDisetujuiOleh: "Dr. Ahmad PO",
    kuota: 100,
    kuotaTerisi: 45,
    peserta: [
      {
        nim: "2021001",
        nama: "Budi Santoso",
        email: "mahasiswa@kampus.ac.id",
        statusHadir: "hadir",
        sertifikatDownloaded: false,
        nomorSertifikat: "CERT-2026-EVT001-2021001"
      },
      {
        nim: "2021002",
        nama: "Ani Wijaya",
        email: "panitia@kampus.ac.id",
        statusHadir: "hadir",
        sertifikatDownloaded: false,
        nomorSertifikat: "CERT-2026-EVT001-2021002"
      }
    ]
  },
  {
    id: "EVT002",
    nama: "Dies Natalis Universitas Ke-58",
    tanggal: "2026-05-27",
    lokasi: "Auditorium Mandiri Aula Utama",
    penyelenggara: "BEM Universitas",
    kategori: "Seni",
    status: "aktif",
    sertifikatStatus: null,
    kuota: 1200,
    kuotaTerisi: 850,
    peserta: [
      {
        nim: "2021001",
        nama: "Budi Santoso",
        email: "mahasiswa@kampus.ac.id",
        statusHadir: "menunggu",
        sertifikatDownloaded: false,
        nomorSertifikat: "CERT-2026-EVT002-2021001"
      }
    ]
  },
  {
    id: "EVT003",
    nama: "National Tech Summit and Hackathon",
    tanggal: "2026-06-12",
    lokasi: "Gedung Tekno Lantai 3",
    penyelenggara: "Himpunan Sistem Informasi",
    kategori: "Lomba",
    status: "aktif",
    sertifikatStatus: null,
    kuota: 400,
    kuotaTerisi: 342,
    peserta: []
  },
  {
    id: "EVT004",
    nama: "Workshop UI/UX Portfolio Design",
    tanggal: "2026-06-05",
    lokasi: "Lab Komputer SI-202",
    penyelenggara: "UKM Computer Club",
    kategori: "Workshop",
    status: "aktif",
    sertifikatStatus: null,
    kuota: 50,
    kuotaTerisi: 50,
    peserta: [
      {
        nim: "2021001",
        nama: "Budi Santoso",
        email: "mahasiswa@kampus.ac.id",
        statusHadir: "hadir",
        sertifikatDownloaded: false,
        nomorSertifikat: "CERT-2026-EVT004-2021001"
      }
    ]
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
