import { db } from "@repo/db";
import { Room } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await context.params;
  const roomIdNum = parseInt(roomId, 10);

  if (Number.isNaN(roomIdNum)) {
    return NextResponse.json({ selectedbgColor: "#121212" });
  }

  try {
    const room = await db.query.Room.findFirst({ where: eq(Room.id, roomIdNum) });
    if (!room || !room.roomSettings) {
      return NextResponse.json({ selectedbgColor: "#121212" });
    }

    try {
      const settings = JSON.parse(room.roomSettings || "{}");
      const color =
        typeof settings.selectedbgColor === "string" && settings.selectedbgColor.trim().length > 0
          ? settings.selectedbgColor
          : "#121212";
      return NextResponse.json({ selectedbgColor: color });
    } catch {
      return NextResponse.json({ selectedbgColor: "#121212" });
    }
  } catch (e) {
    console.error("Error in room settings API:", e);
    return NextResponse.json({ selectedbgColor: "#121212" });
  }
}