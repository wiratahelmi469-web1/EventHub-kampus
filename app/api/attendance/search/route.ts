import { NextRequest, NextResponse } from "next/server";
import { getServerEvents } from "../../../../lib/serverDb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("event_id");
    const query = searchParams.get("q") || "";

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "event_id is required" },
        { status: 400 }
      );
    }

    const events = getServerEvents();
    const event = events.find((e) => e.id === eventId);

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 450 }
      );
    }

    const term = query.toLowerCase().trim();
    const results = event.peserta.filter(
      (p) =>
        p.nama.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term) ||
        p.nim.toLowerCase().includes(term)
    );

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
