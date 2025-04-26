export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { CreateRoomSchema } from '@repo/common/zod';
import { db } from '@repo/db';
import { Room, userRooms } from '@repo/db/schema';
import { eq } from 'drizzle-orm';
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

  const parsed = CreateRoomSchema.safeParse(await request.json());
  if (!parsed.success) {
    console.error(parsed.error);
    return NextResponse.json({ message: 'Invalid room data' }, { status: 400 });
  }

  const userId = decoded.id;
  const roomId = Math.floor(Math.random() * 1000) + 1;
  const roomName = parsed.data.name;

  try {
    await db.insert(Room).values({
      id: roomId,
      name: roomName,
      adminId: userId,
    });
    await db.insert(userRooms).values({
      userId: userId,
      roomId: roomId,
    });
    return NextResponse.json({ message: 'Room created successfully', id: roomId, name: roomName, adminId: userId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to create room' }, { status: 500 });
  }
} 