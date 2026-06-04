import { EventWithCertificate } from "./certificateData";

export interface AttendanceLog {
  id: string;
  timestamp: string;
  attendeeName: string;
  ticketCode: string;
  method: "qr_scan" | "manual";
  status: "Valid" | "Duplikat" | "Gagal";
  eventId: string;
}

// Global server-side state
let serverEvents: EventWithCertificate[] = [];
let attendanceLogs: AttendanceLog[] = [];

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
    peserta: [
      { nim: "2021001", nama: "Budi Santoso", email: "budi.mahasiswa@nurulfikri.ac.id", statusHadir: "tidak_hadir", nomorSertifikat: "CERT-2026-EVT001-2021001", sertifikatDownloaded: false },
      { nim: "2021002", nama: "Sari Dewi", email: "sari.mahasiswa@nurulfikri.ac.id", statusHadir: "tidak_hadir", nomorSertifikat: "CERT-2026-EVT001-2021002", sertifikatDownloaded: false },
      { nim: "2021003", nama: "Helmi Wirata", email: "guest.helmi@gmail.com", statusHadir: "tidak_hadir", nomorSertifikat: "CERT-2026-EVT001-2021003", sertifikatDownloaded: false }
    ]
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
    peserta: [
      { nim: "2021004", nama: "Dian Permata", email: "dian.mahasiswa@nurulfikri.ac.id", statusHadir: "tidak_hadir", nomorSertifikat: "CERT-2026-EVT002-2021004", sertifikatDownloaded: false },
      { nim: "2021005", nama: "Ahmad Fauzi", email: "ahmad.mahasiswa@nurulfikri.ac.id", statusHadir: "tidak_hadir", nomorSertifikat: "CERT-2026-EVT002-2021005", sertifikatDownloaded: false }
    ]
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
  }
];

export function getServerEvents(): EventWithCertificate[] {
  if (serverEvents.length === 0) {
    serverEvents = JSON.parse(JSON.stringify(DEFAULT_EVENTS));
  }
  return serverEvents;
}

export function updateServerEvent(updatedEvent: EventWithCertificate) {
  const events = getServerEvents();
  const index = events.findIndex(e => e.id === updatedEvent.id);
  if (index !== -1) {
    events[index] = updatedEvent;
  } else {
    events.push(updatedEvent);
  }
}

export function getAttendanceLogs(eventId: string): AttendanceLog[] {
  return attendanceLogs.filter(log => log.eventId === eventId);
}

export function addAttendanceLog(log: Omit<AttendanceLog, "id" | "timestamp">) {
  const timestamp = new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  }) + " WIB";
  
  const newLog: AttendanceLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp
  };
  attendanceLogs = [newLog, ...attendanceLogs];
  return newLog;
}
