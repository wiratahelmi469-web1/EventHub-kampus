import { getEvents, saveEvents, EventWithCertificate, PesertaItem } from "./certificateData";

export interface ScanResultPayload {
  success: boolean;
  message: string;
  eventName?: string;
  attendeeName?: string;
  attendeeEmail?: string;
  attendeeNim?: string;
  eventId?: string;
}

export function processTicketScan(payload: string): ScanResultPayload {
  try {
    if (!payload || !payload.startsWith("EVENTHUB-TICKET:")) {
      return {
        success: false,
        message: "Format tiket QR Code tidak dikenali oleh sistem EventHub Universitas Nurul Fikri.",
      };
    }

    const parts = payload.split(":");
    if (parts.length < 4) {
      return {
        success: false,
        message: "Format payload QR Code tidak lengkap.",
      };
    }

    // parts[0] = EVENTHUB-TICKET
    const eventId = parts[1];
    const email = parts[2];
    const name = parts[3];

    const events = getEvents();
    const eventIndex = events.findIndex((e) => e.id === eventId);

    if (eventIndex === -1) {
      return {
        success: false,
        message: `Event dengan ID ${eventId} tidak dapat ditemukan di database kampus.`,
      };
    }

    const event = events[eventIndex];
    
    // Search if attendee is already in the event's peserta list
    const participantIndex = event.peserta.findIndex(
      (p) => p.email.toLowerCase() === email.toLowerCase()
    );

    if (participantIndex !== -1) {
      const participant = event.peserta[participantIndex];
      if (participant.statusHadir === "hadir") {
        return {
          success: false,
          message: "Presensi kehadiran sudah terekam sebelumnya untuk peserta ini.",
          eventName: event.nama,
          attendeeName: participant.nama,
          attendeeEmail: participant.email,
          attendeeNim: participant.nim,
          eventId: event.id,
        };
      }

      // Update status to hadir
      event.peserta[participantIndex].statusHadir = "hadir";
      events[eventIndex] = event;
      saveEvents(events);

      return {
        success: true,
        message: "Presensi kehadiran berhasil dicatat! Selamat mengikuti acara.",
        eventName: event.nama,
        attendeeName: participant.nama,
        attendeeEmail: participant.email,
        attendeeNim: participant.nim,
        eventId: event.id,
      };
    } else {
      // Check if guest or new registration
      const isGuest = email.toLowerCase().includes("guest") || email.toLowerCase().includes("tamu");
      const generatedNim = isGuest ? "GUEST" : `NIM-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const newParticipant: PesertaItem = {
        nim: generatedNim,
        nama: name,
        email: email,
        statusHadir: "hadir",
        sertifikatDownloaded: false,
        nomorSertifikat: `CERT-25-EVT${event.id}-${generatedNim}`
      };

      event.peserta.push(newParticipant);
      event.kuotaTerisi = Math.min(event.kuota, event.kuotaTerisi + 1);
      events[eventIndex] = event;
      saveEvents(events);

      return {
        success: true,
        message: "Presensi On-The-Spot berhasil dicatat! Peserta baru secara otomatis ditambahkan ke daftar hadir.",
        eventName: event.nama,
        attendeeName: name,
        attendeeEmail: email,
        attendeeNim: newParticipant.nim,
        eventId: event.id,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Terjadi galat teknis saat pemindaian: ${err.message || err}`,
    };
  }
}
