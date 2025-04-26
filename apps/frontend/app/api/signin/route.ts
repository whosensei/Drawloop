export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { SigninSchema } from '@repo/common/zod';
import { db } from '@repo/db';
import { User } from '@repo/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = SigninSchema.safeParse(body);
  if (!parsed.success) {
    console.error(parsed.error);
    return NextResponse.json({ message: 'invalid format' }, { status: 400 });
  }
  try {
    const user = await db.query.User.findFirst({ where: eq(User.email, parsed.data.email) });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 401 });
    }
    if (user.password !== parsed.data.password) {
      return NextResponse.json({ message: 'Incorrect password' }, { status: 402 });
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    return NextResponse.json({ message: 'User successfully signed in', token });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 