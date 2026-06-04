export interface EventItem {
  id: string;
  title: string;
  category: 'Seminar' | 'Workshop' | 'Lomba' | 'Olahraga' | 'Seni' | 'Sosial';
  organizer: string;
  date: string;
  time: string;
  location: string;
  isOnline: boolean;
  status: 'Buka Pendaftaran' | 'Hampir Penuh' | 'Tutup';
  progress: number;
  pesertaCount: number;
  urgentTasksCount: number;
  description: string;
  coordinator: string;
}

export interface TaskItem {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  assignee: { name: string; avatar: string };
  status: 'todo' | 'progress' | 'done';
}

export interface RundownItem {
  id: string;
  timeStart: string;
  timeEnd: string;
  title: string;
  pic: string;
  location: string;
  isLive: boolean;
  isCompleted: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  isMe: boolean;
  message: string;
  timestamp: string;
  avatar: string;
}

export interface DivisionProgress {
  name: string;
  status: 'On Track' | 'Delayed' | 'Critical';
  progress: number;
  doneCount: number;
  activeCount: number;
}

export interface NotificationItem {
  id: string;
  category: 'Tugas' | 'Persetujuan' | 'Pengumuman' | 'Umum';
  title: string;
  description: string;
  timestamp: string;
  isUnread: boolean;
  hasQuickAction: boolean;
  // Specific roles allowed to view: guest, mahasiswa, panitia, po, staf
  visibility: ('guest' | 'mahasiswa' | 'panitia' | 'po' | 'staf')[];
  isInternal: boolean;
}

// Initial Mock Datasets
export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'evt-1',
    title: 'Dies Natalis Universitas Ke-58',
    category: 'Seni',
    organizer: 'BEM Universitas',
    date: '27 Mei 2026',
    time: '08.00 WIB',
    location: 'Auditorium Mandiri Aula Utama',
    isOnline: false,
    status: 'Buka Pendaftaran',
    progress: 58.5,
    pesertaCount: 1240,
    urgentTasksCount: 3,
    coordinator: 'Rian Prasetya (PO)',
    description: 'Perayaan puncak hari jadi universitas yang menyajikan pagelaran seni budaya, expo kewirausahaan mahasiswa, penganugerahan mahasiswa berprestasi, serta konser musik spektakuler kolaborasi antar UKM seni.'
  },
  {
    id: 'evt-2',
    title: 'National Tech Summit and Hackathon',
    category: 'Lomba',
    organizer: 'Himpunan Sistem Informasi',
    date: '12 Juni 2026',
    time: '09.00 WIB',
    location: 'Gedung Tekno Lantai 3',
    isOnline: false,
    status: 'Hampir Penuh',
    progress: 40.0,
    pesertaCount: 342,
    urgentTasksCount: 1,
    coordinator: 'Dian Permata (PO)',
    description: 'Kompetisi coding intensif selama 24 jam bertingkat nasional untuk menyelesaikan permasalahan riil perkotaan pintar (Smart City) dengan juri akademisi dan industri teknologi papan atas.'
  },
  {
    id: 'evt-3',
    title: 'Seminar Artificial Intelligence in Education',
    category: 'Seminar',
    organizer: 'Riset Grup Edu-Tech',
    date: '30 Mei 2026',
    time: '13.00 WIB',
    location: 'Zoom Meeting & Live YouTube',
    isOnline: true,
    status: 'Buka Pendaftaran',
    progress: 90.0,
    pesertaCount: 850,
    urgentTasksCount: 0,
    coordinator: 'Dr. Ahmad Fauzi (Staf)',
    description: 'Seminar interaktif membahas dampak model bahasa besar (LLM) terhadap metode penilaian tradisional di perguruan tinggi dan cara guru menyusun strategi pembelajaran berbasis AI.'
  },
  {
    id: 'evt-4',
    title: 'Workshop UI/UX Portfolio Design',
    category: 'Workshop',
    organizer: 'UKM Computer Club',
    date: '05 Juni 2026',
    time: '10.00 WIB',
    location: 'Lab Komputer SI-202',
    isOnline: false,
    status: 'Tutup',
    progress: 100.0,
    pesertaCount: 50,
    urgentTasksCount: 0,
    coordinator: 'Fandi Subakti',
    description: 'Praktik langsung mendesain studi kasus portofolio UI/UX yang memikat hati perekrut, menggunakan Figma dan di-review langsung oleh Lead Designer Tokopedia.'
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't-1',
    title: 'Konfirmasi ketersediaan sound system utama ke sarpras',
    priority: 'High',
    dueDate: 'Hari ini, 17.00',
    assignee: { name: 'Bagus S.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80' },
    status: 'progress'
  },
  {
    id: 't-2',
    title: 'Sewa alat genset cadangan kapasitas 5000 watt',
    priority: 'High',
    dueDate: '27 Mei, 07.00',
    assignee: { name: 'Doni Alwi', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80' },
    status: 'todo'
  },
  {
    id: 't-3',
    title: 'Draft pengajuan pencairan dana termin II kemahasiswaan',
    priority: 'Medium',
    dueDate: 'Besok, 12.00',
    assignee: { name: 'Eka Lestari', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80' },
    status: 'todo'
  },
  {
    id: 't-4',
    title: 'Desain banner publikasi utama postingan feeds Instagram',
    priority: 'Medium',
    dueDate: 'Sudah Lewat',
    assignee: { name: 'Sarah Putri', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80' },
    status: 'done'
  },
  {
    id: 't-5',
    title: 'Unduh list pendaftar eksternal format excel',
    priority: 'Low',
    dueDate: '29 Mei, 15.00',
    assignee: { name: 'Budi Hartono', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80' },
    status: 'done'
  }
];

export const INITIAL_RUNDOWN: RundownItem[] = [
  {
    id: 'r-1',
    timeStart: '08.00',
    timeEnd: '08.30',
    title: 'Registrasi Ulang Peserta & Pembagian Snack',
    pic: 'Zahra (Konsumsi)',
    location: 'Pintu Masuk Auditorium',
    isLive: false,
    isCompleted: true
  },
  {
    id: 'r-2',
    timeStart: '08.30',
    timeEnd: '09.00',
    title: 'Opening Ceremony & Grand Opening Tari Tradisional',
    pic: 'Rian Prasetya (PO)',
    location: 'Stage Utama',
    isLive: true,
    isCompleted: false
  },
  {
    id: 'r-3',
    timeStart: '09.00',
    timeEnd: '09.30',
    title: 'Sambutan Rektor & Dekan Sistem Informasi',
    pic: 'MC (Dwi & Anton)',
    location: 'Stage Utama',
    isLive: false,
    isCompleted: false
  },
  {
    id: 'r-4',
    timeStart: '09.30',
    timeEnd: '11.00',
    title: 'Pemberian Materi Sesi I: Digital Ecosystem',
    pic: 'Bambang Pamungkas (Google)',
    location: 'Stage Utama',
    isLive: false,
    isCompleted: false
  }
];

export const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'c-1',
    sender: 'Dian Permata',
    role: 'Korlap Acara',
    isMe: false,
    message: 'Halo rekan-rekan panitia, mohon cek kembali kelengkapan rundown Day 1 terutama pergantian antar pembicara.',
    timestamp: '08.15',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80'
  },
  {
    id: 'c-2',
    sender: 'Bagus S.',
    role: 'Logistik',
    isMe: false,
    message: 'Untuk sound system utama panggung sudah aman setelah dikonfirmasi tadi pagi. Konsumsi pembicara sudah standby juga.',
    timestamp: '08.18',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80'
  },
  {
    id: 'c-3',
    sender: 'Self (Rian)',
    role: 'Project Officer',
    isMe: true,
    message: 'Mantap tim! Tetap standby di koordinasi radio juga ya. Monitor terus registrasi peserta di lantai dasar.',
    timestamp: '08.20',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80'
  }
];

export const INITIAL_DIVISIONS: DivisionProgress[] = [
  { name: 'Humas & Dokumentasi', status: 'On Track', progress: 85, doneCount: 17, activeCount: 3 },
  { name: 'Divisi Acara & Rundown', status: 'On Track', progress: 62, doneCount: 8, activeCount: 5 },
  { name: 'Konsumsi & LO', status: 'Delayed', progress: 40, doneCount: 4, activeCount: 6 },
  { name: 'Perlengkapan & Logistik', status: 'Critical', progress: 25, doneCount: 2, activeCount: 6 }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    category: 'Persetujuan',
    title: 'Persetujuan Anggaran Konsumsi',
    description: 'Proposal anggaran dana tambahan Rp 1.500.000 disetujui oleh Kepala Kemahasiswaan Tri Wahyuni untuk konsumsi juri Lomba Hackathon.',
    timestamp: '2 menit lalu',
    isUnread: true,
    hasQuickAction: true,
    visibility: ['panitia', 'po', 'staf'],
    isInternal: true
  },
  {
    id: 'n-2',
    category: 'Tugas',
    title: 'Pernyataan Selesai Tugas Cadangan',
    description: 'Budi Hartono menyelesaikan "Unduh list pendaftar eksternal format excel".',
    timestamp: '15 menit lalu',
    isUnread: true,
    hasQuickAction: true,
    visibility: ['panitia', 'po'],
    isInternal: true
  },
  {
    id: 'n-3',
    category: 'Pengumuman',
    title: 'Pengumuman: Grand Launching Dies Natalis',
    description: 'Pendaftaran festival Dies Natalis resmi dibuka untuk seluruh Civitas Academica! Yuk daftar segara di Kategori Seni.',
    timestamp: '3 jam lalu',
    isUnread: false,
    hasQuickAction: false,
    visibility: ['guest', 'mahasiswa', 'panitia', 'po', 'staf'],
    isInternal: false
  },
  {
    id: 'n-4',
    category: 'Tugas',
    title: 'Mentoring Internal & Pembagian Briefing',
    description: 'Rian, tolong segera review draf MoU sponsorship PT Bank Mandiri sebelum jam 14.00 panitia kumpul.',
    timestamp: '1 jam lalu',
    isUnread: true,
    hasQuickAction: false,
    visibility: ['panitia', 'po'],
    isInternal: true
  },
  {
    id: 'n-5',
    category: 'Umum',
    title: 'Pendaftaran Berhasil Dikonfirmasi!',
    description: 'Selamat, tiket digital Anda untuk Dies Natalis Universitas Ke-58 telah aktif. Silakan buka E-Ticket.',
    timestamp: '10 menit lalu',
    isUnread: true,
    hasQuickAction: false,
    visibility: ['mahasiswa'],
    isInternal: false
  },
  {
    id: 'n-6',
    category: 'Pengumuman',
    title: 'Event Dimulai Besok — Pengingat',
    description: 'Pengingat H-1: Seminar Artificial Intelligence in Education akan berlangsung besok pukul 13.00 WIB online via Zoom.',
    timestamp: '1 hari lalu',
    isUnread: false,
    hasQuickAction: false,
    visibility: ['mahasiswa'],
    isInternal: false
  }
];

// Interactive User Flows
export interface UserFlow {
  id: string;
  title: string;
  role: 'guest' | 'mahasiswa' | 'panitia' | 'po' | 'staf';
  description: string;
  steps: {
    label: string;
    screen: string;
    description: string;
  }[];
}

export const USER_FLOWS: UserFlow[] = [
  {
    id: 'flow-a',
    title: 'Flow A — Guest Browse & RSVP',
    role: 'guest',
    description: 'Pengguna non-login menjelajahi event, memilih sesi daftar, dan mendapatkan QR tiket digital beserta promo membuat akun.',
    steps: [
      { label: 'Splash Screen', screen: 'splash', description: 'Melihat splash screen dan lanjut masuk sebagai tamu.' },
      { label: 'Discover Event Feed', screen: 'discover', description: 'Menjelajahi daftar event kampus di feed publik.' },
      { label: 'Detail Event', screen: 'detail_mahasiswa', description: 'Membaca deskripsi event dan sisa kuota, lalu menekan Daftar.' },
      { label: 'Modal Pembelian Tiket', screen: 'modal_daftar', description: 'Mengisi form data tamu secara manual.' },
      { label: 'E-Ticket QR Code', screen: 'ticket', description: 'Mendapat ID Tiket dan QR Code, ditawari upgrade akun.' }
    ]
  },
  {
    id: 'flow-b',
    title: 'Flow B — Panitia: Tambah & Kelola Tugas',
    role: 'panitia',
    description: 'Bagaimana panitia memantau dashboard, beralih ke Kanban, dan merilis jobdesk baru ke tim.',
    steps: [
      { label: 'Dashboard Panitia', screen: 'dashboard', description: 'Melihat widget tugas urgen dan ringkasan event aktif.' },
      { label: 'Detail Event KoorEvent', screen: 'detail_panitia', description: 'Melihat statistik detail divisi dan navigasi grup.' },
      { label: 'Manajemen Tugas (Kanban)', screen: 'tasks', description: 'Melihat board To Do, Progress, dan Done.' },
      { label: 'Form Buat Tugas Baru', screen: 'modal_buat_tugas', description: 'Popup menu membuat tugas baru didistribusikan ke staf.' }
    ]
  },
  {
    id: 'flow-c',
    title: 'Flow C — Staff Approval & Archive',
    role: 'staf',
    description: 'Persidangan akhir event, evaluasi rating bintang, dan persetujuan penguncian data oleh Staf Kemahasiswaan.',
    steps: [
      { label: 'Dashboard / Profil Staf', screen: 'profile', description: 'Staf login melihat antrean pengajuan persetujuan proposal.' },
      { label: 'Aktivasi Approval', screen: 'notifications', description: 'Melakukan aksi Terima/Tolak cepat anggaran keuangan.' },
      { label: 'Lembar Evaluasi & Rating', screen: 'evaluasi', description: 'Mengisi lessons learned, dokumentasi foto, dan mengunci arsip.' }
    ]
  },
  {
    id: 'flow-d',
    title: 'Flow D — Mahasiswa Terdaftar: Sertifikat',
    role: 'mahasiswa',
    description: 'Mahasiswa terdaftar melihat reminder, menghadiri event, cek-in lokasi, dan mengunduh berkas sertifikat.',
    steps: [
      { label: 'Feed Discover Kampus', screen: 'discover', description: 'Mahasiswa login mencari info event terbaru.' },
      { label: 'Registrasi Cepat', screen: 'modal_daftar', description: 'Form terisi otomatis berdasarkan data profil mahasiswa.' },
      { label: 'Menu Event Saya', screen: 'event_saya', description: 'Memilih event yang selesai untuk mengunduh bukti sertifikat.' }
    ]
  },
  {
    id: 'flow-e',
    title: 'Flow E — Registrasi Daftar Tunggu',
    role: 'mahasiswa',
    description: 'Mahasiswa mendaftar event yang kuotanya penuh dan bersiaga masuk antrean tunggu otomatis.',
    steps: [
      { label: 'Detail Event Penuh', screen: 'detail_mahasiswa', description: 'Melihat tombol pendaftaran tertulis "Masuk Daftar Tunggu".' },
      { label: 'Konfirmasi Antrean', screen: 'modal_daftar', description: 'Menerima syarat masuk antrean prioritas sistem.' }
    ]
  }
];

export const RBAC_MATRIX = [
  { feature: 'Buat & Kelola Event', guest: '✗', mahasiswa: '✗', panitia: '✓', po: '✓', staf: '✓ (Validasi)' },
  { feature: 'Buka Kanban & Edit Rundown', guest: '✗', mahasiswa: '✗', panitia: '✓', po: '✓', staf: '✗' },
  { feature: 'Kirim Chat Koordinasi internal', guest: '✗', mahasiswa: '✗', panitia: '✓', po: '✓', staf: '✗' },
  { feature: 'Ajukan Dana Reimbursement', guest: '✗', mahasiswa: '✗', panitia: '✓', po: '✓', staf: '✗' },
  { feature: 'Daftar Event & Lihat E-Ticket', guest: '✓ (Manual)', mahasiswa: '✓ (Auto)', panitia: '✓ (Auto)', po: '✓ (Auto)', staf: '✗' },
  { feature: 'Disposisi Approval Anggaran', guest: '✗', mahasiswa: '✗', panitia: '✗', po: '✗', staf: '✓ (Utama)' },
  { feature: 'Evaluasi & Kunci Arsip Event', guest: '✗', mahasiswa: '✗', panitia: '✗', po: '✓ (Ketua)', staf: '✓ (Validasi)' },
];
