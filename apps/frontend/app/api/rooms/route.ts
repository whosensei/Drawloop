export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@repo/db';
import { userRooms, Room } from '@repo/db/schema';
import { eq, inArray } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';

export async function GET(request: Request) {
  const token = request.headers.get('authorization') ?? '';
  let decoded: { id: number };
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { id: number };
  } catch (error) {
    return NextResponse.json({ message: 'Invalid or missing token' }, { status: 400 });
  }

  const userId = decoded.id;
  try {
    const userRoomEntries = await db.select({ roomId: userRooms.roomId })
      .from(userRooms)
      .where(eq(userRooms.userId, userId));

    if (userRoomEntries.length === 0) {
      return NextResponse.json({ rooms: [] });
    }

    const roomIds = userRoomEntries.map(entry => entry.roomId);
    const rooms = await db.select()
      .from(Room)
      .where(inArray(Room.id, roomIds));

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch rooms' }, { status: 500 });
  }
} 