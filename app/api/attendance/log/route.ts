import { NextRequest, NextResponse } from "next/server";
import { getAttendanceLogs } from "../../../../lib/serverDb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("event_id");

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "event_id is required" },
        { status: 400 }
      );
    }

    const logs = getAttendanceLogs(eventId);

    return NextResponse.json({
      success: true,
      logs
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
