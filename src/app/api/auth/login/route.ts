import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { loginSchema } from '@/lib/validations';
import { checkRateLimit, storeSession } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting (using a placeholder IP or extracting from headers)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = await checkRateLimit(`login:${ip}`, 5, 60); // 5 attempts per minute

    if (!rateLimit.success) {
      return NextResponse.json({ message: 'Too many login attempts, please try again later' }, { status: 429 });
    }

    const body = await req.json();

    const { error } = loginSchema.validate(body);
    if (error) {
      return NextResponse.json({ message: error.details[0].message }, { status: 400 });
    }

    const { email, password } = body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'User not found with this email address' }, { status: 401 });
    }

    if (!user.password) {
      return NextResponse.json({ message: 'Please log in with Google.' }, { status: 401 });
    }

    if (user.deletedAt) {
      return NextResponse.json({ message: 'This account has been deleted.' }, { status: 403 });
    }

    if (user.banExpiresAt && new Date() < user.banExpiresAt) {
      return NextResponse.json({ message: `Account is banned until ${user.banExpiresAt.toLocaleString()}` }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Incorrect password' }, { status: 401 });
    }

    const token = signToken({ id: user.id, email: user.email });

    // Store session in Redis for 7 days
    await storeSession(user.id, token, 7);

    // Ensure we await cookies() in Next.js 15+
    const cookieStore = await cookies();
    cookieStore.set('token', `Bearer ${token}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json(
      { message: 'Login successful', user: { id: user.id, name: user.name, email: user.email } },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
