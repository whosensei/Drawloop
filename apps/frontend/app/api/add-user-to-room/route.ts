export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@repo/db';
import { userRooms, Room } from '@repo/db/schema';
import { eq, and } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';

export async function POST(request: Request) {
  const token = request.headers.get('authorization') ?? '';
  let decoded: { id: number };
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { id: number };
  } catch (error) {
    return NextResponse.json({ message: 'Invalid or missing token' }, { status: 400 });
  }

  const body = await request.json();
  const roomId = parseInt(body.roomId, 10);
  if (isNaN(roomId)) {
    return NextResponse.json({ message: 'Invalid room ID format' }, { status: 400 });
  }

  try {
    const roomExists = await db.query.Room.findFirst({ where: eq(Room.id, roomId) });
    if (!roomExists) {
      return NextResponse.json({ message: 'Room not found' }, { status: 404 });
    }

    const userId = decoded.id;
    const userInRoom = await db.select().from(userRooms)
      .where(and(eq(userRooms.userId, userId), eq(userRooms.roomId, roomId)));

    if (userInRoom.length > 0) {
      return NextResponse.json({ message: 'User already in room', alreadyJoined: true });
    }

    await db.insert(userRooms).values({ userId, roomId });
    if (roomExists.members !== null) {
      await db.update(Room).set({ members: roomExists.members + 1 }).where(eq(Room.id, roomId));
    } else {
      await db.update(Room).set({ members: 1 }).where(eq(Room.id, roomId));
    }

    return NextResponse.json({ message: 'Successfully joined room', roomName: roomExists.name });
  } catch (error) {
    console.error('Error joining room:', error);
    return NextResponse.json({ message: 'Failed to join room' }, { status: 500 });
  }
} 