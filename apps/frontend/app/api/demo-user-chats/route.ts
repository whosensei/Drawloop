export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@repo/db';
import { chats } from '@repo/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ message: 'UserId is required' }, { status: 400 });
    }
    await db.delete(chats).where(eq(chats.userId, userId));
    return NextResponse.json({ message: 'Successfully cleared chats for demo user' });
  } catch (error) {
    console.error('Error clearing demo user chats:', error);
    return NextResponse.json({ message: 'Failed to clear demo user chats' }, { status: 500 });
  }
} 