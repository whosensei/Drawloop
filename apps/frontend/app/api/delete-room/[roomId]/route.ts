export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@repo/db';
import { userRooms } from '@repo/db/schema';
import { eq, and } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';

export async function DELETE(request: Request, { params }: { params: Promise<{ roomId: string }> }) {
  const token = request.headers.get('authorization') ?? '';
  let decoded: { id: number };
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { id: number };
  } catch (error) {
    return NextResponse.json({ message: 'Invalid or missing token' }, { status: 400 });
  }

  const roomId = parseInt((await params).roomId);
  if (isNaN(roomId)) {
    return NextResponse.json({ message: 'Invalid room ID format' }, { status: 400 });
  }

  try {
    await db.delete(userRooms).where(and(eq(userRooms.userId, decoded.id), eq(userRooms.roomId, roomId)));
    return NextResponse.json({ message: 'Successfully left the room' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to leave room' }, { status: 500 });
  }
} 