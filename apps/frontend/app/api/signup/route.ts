export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { SignupSchema } from '@repo/common/zod';
import { db } from '@repo/db';
import { User } from '@repo/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    console.error(parsed.error);
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
  }
  try {
    const existingUser = await db.query.User.findFirst({ where: eq(User.email, parsed.data.email) });
    if (existingUser) {
      return NextResponse.json({ message: 'email already exists' }, { status: 409 });
    }
    await db.insert(User).values({
      email: parsed.data.email,
      username: parsed.data.username,
      password: parsed.data.password,
    });
    return NextResponse.json({ message: 'User successfully signed up' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'error' }, { status: 500 });
  }
} 