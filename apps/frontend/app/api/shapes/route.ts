export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@repo/db';
import { chats } from '@repo/db/schema';
import { eq, inArray } from 'drizzle-orm';

export async function DELETE(request: Request) {
  try {
    const { roomId, shapeIds } = await request.json();
    const parsedRoomId = parseInt(roomId, 10);
    if (isNaN(parsedRoomId)) {
      return NextResponse.json({ message: 'Invalid Room ID format.' }, { status: 400 });
    }
    if (!Array.isArray(shapeIds) || shapeIds.length === 0 || !shapeIds.every(id => typeof id === 'string')) {
      return NextResponse.json({ message: 'Invalid or empty shapeIds array provided.' }, { status: 400 });
    }

    const roomChats = await db.select().from(chats).where(eq(chats.roomId, parsedRoomId));

    const chatIdsToDelete: number[] = [];
    roomChats.forEach(chat => {
      try {
        const content = JSON.parse(chat.message);
        if (content?.shape?.id && shapeIds.includes(content.shape.id)) {
          if (chat.id) chatIdsToDelete.push(chat.id);
        }
      } catch (_) {
        // skip invalid JSON
      }
    });

    if (chatIdsToDelete.length > 0) {
      await db.delete(chats).where(inArray(chats.id, chatIdsToDelete));
      return NextResponse.json({ message: `Successfully deleted ${chatIdsToDelete.length} shape(s).` });
    } else {
      return NextResponse.json({ message: 'No shapes found matching the provided IDs in this room.' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting shapes:', error);
    return NextResponse.json({ message: 'Failed to delete shapes due to a server error.' }, { status: 500 });
  }
} 