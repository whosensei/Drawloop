export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@repo/db';
import { chats } from '@repo/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: Promise<{ roomId: string }> }) {

  const roomId = parseInt((await params).roomId, 10);
  if (isNaN(roomId)) {
    return NextResponse.json({ message: 'Invalid room ID format' }, { status: 400 });
  }
  try {
    const messages = await db.query.chats.findMany({
      where: eq(chats.roomId, roomId),
      orderBy: [desc(chats.createdAt)],
      limit: 100,
    });
    return NextResponse.json({ messages });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch chats' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ roomId: string }> }) {
  const roomId = parseInt((await params).roomId, 10);
  if (isNaN(roomId)) {
    return NextResponse.json({ message: 'Invalid room ID format' }, { status: 400 });
  }
  try {
    await db.delete(chats).where(eq(chats.roomId, roomId));
    return NextResponse.json({ message: 'Canvas cleared' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'failed to clear canvas' }, { status: 500 });
  }
} 