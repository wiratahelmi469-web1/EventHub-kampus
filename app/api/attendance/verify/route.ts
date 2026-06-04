import { NextRequest, NextResponse } from "next/server";
import { getServerEvents, updateServerEvent, addAttendanceLog } from "../../../../lib/serverDb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { qr_code, event_id, scanned_by, method } = body;

    if (!event_id) {
      return NextResponse.json(
        { success: false, message: "event_id is required" },
        { status: 400 }
      );
    }

    const events = getServerEvents();
    const eventIndex = events.findIndex((e) => e.id === event_id);

    if (eventIndex === -1) {
      return NextResponse.json(
        { success: false, message: `Event dengan ID ${event_id} tidak dtemukan.` },
        { status: 404 }
      );
    }

    const event = events[eventIndex];
    let email = "";
    let name = "";
    let nim = "";
    let isNewGuest = false;

    // Decode QR Code Payload
    if (qr_code && qr_code.startsWith("EVENTHUB-TICKET:")) {
      const parts = qr_code.split(":");
      if (parts.length >= 4) {
        // EVENTHUB-TICKET:eventId:email:name
        email = parts[2];
        name = parts[3];
      } else {
        addAttendanceLog({
          attendeeName: "Tiket Tidak Diketahui",
          ticketCode: qr_code.substring(0, 15),
          method: method || "qr_scan",
          status: "Gagal",
          eventId: event_id
        });
        return NextResponse.json({
          success: false,
          status: "Gagal",
          message: "Format QR Code tidak dikenali oleh sistem EventHub."
        });
      }
    } else {
      // Manual input or custom ticket code
      const lookup = qr_code.trim();
      const existingPeserta = event.peserta.find(
        (p) =>
          p.email.toLowerCase() === lookup.toLowerCase() ||
          p.nim.toLowerCase() === lookup.toLowerCase() ||
          p.nama.toLowerCase() === lookup.toLowerCase()
      );

      if (existingPeserta) {
        email = existingPeserta.email;
        name = existingPeserta.nama;
        nim = existingPeserta.nim;
      } else {
        // Fallback or automatic guest signup if input looks like an email or search term
        if (lookup.includes("@")) {
          email = lookup;
          name = lookup.split("@")[0];
          isNewGuest = true;
        } else {
          // Gagal
          addAttendanceLog({
            attendeeName: "Unknown",
            ticketCode: lookup.substring(0, 15),
            method: method || "manual",
            status: "Gagal",
            eventId: event_id
          });
          return NextResponse.json({
            success: false,
            status: "Gagal",
            message: "Peserta tidak ditemukan di database daftar terdaftar."
          });
        }
      }
    }

    // Process participant lookup
    const pIndex = event.peserta.findIndex(
      (p) => p.email.toLowerCase() === email.toLowerCase()
    );

    if (pIndex !== -1) {
      const participant = event.peserta[pIndex];
      nim = participant.nim;

      if (participant.statusHadir === "hadir") {
        // Duplicate attendance log
        const log = addAttendanceLog({
          attendeeName: participant.nama,
          ticketCode: participant.nim || "GUEST",
          method: method || "qr_scan",
          status: "Duplikat",
          eventId: event_id
        });

        return NextResponse.json({
          success: false,
          status: "Duplikat",
          message: `Peserta ini sudah tercatat hadir pukul ${log.timestamp}`,
          data: {
            attendeeName: participant.nama,
            ticketCode: participant.nim || "GUEST",
            timestamp: log.timestamp,
            method: method || "qr_scan",
            email: participant.email
          }
        });
      }

      // Mark as present
      event.peserta[pIndex].statusHadir = "hadir";
      updateServerEvent(event);

      const log = addAttendanceLog({
        attendeeName: participant.nama,
        ticketCode: participant.nim || "GUEST",
        method: method || "qr_scan",
        status: "Valid",
        eventId: event_id
      });

      return NextResponse.json({
        success: true,
        status: "Valid",
        message: "Presensi kehadiran berhasil dicatat! Selamat mengikuti acara.",
        data: {
          attendeeName: participant.nama,
          ticketCode: participant.nim || "GUEST",
          timestamp: log.timestamp,
          method: method || "qr_scan",
          email: participant.email
        }
      });
    } else {
      // Register on-the-spot guest
      const isGuest = email.toLowerCase().includes("guest") || email.toLowerCase().includes("tamu") || isNewGuest;
      const generatedNim = isGuest ? "GUEST" : `NIM-${Math.floor(100000 + Math.random() * 900000)}`;

      const newParticipant = {
        nim: generatedNim,
        nama: name,
        email: email,
        statusHadir: "hadir" as const,
        sertifikatDownloaded: false,
        nomorSertifikat: `CERT-25-EVT${event.id}-${generatedNim}`
      };

      event.peserta.push(newParticipant);
      event.kuotaTerisi = Math.min(event.kuota, event.kuotaTerisi + 1);
      updateServerEvent(event);

      const log = addAttendanceLog({
        attendeeName: name,
        ticketCode: generatedNim,
        method: method || "qr_scan",
        status: "Valid",
        eventId: event_id
      });

      return NextResponse.json({
        success: true,
        status: "Valid",
        message: "Presensi On-The-Spot berhasil dicatat! Peserta baru ditambahkan ke daftar hadir.",
        data: {
          attendeeName: name,
          ticketCode: generatedNim,
          timestamp: log.timestamp,
          method: method || "qr_scan",
          email: email
        }
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
