import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const envUsername = process.env.ADMIN_USERNAME;
    const envPassword = process.env.ADMIN_PASSWORD;

    if (!envUsername || !envPassword) {
      return NextResponse.json({ message: 'Admin credentials not configured on server' }, { status: 500 });
    }

    if (username === envUsername && password === envPassword) {
      // Create a signed token for the admin session
      const token = jwt.sign({ role: 'superadmin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

      // Set cookie
      const cookieStore = await cookies();
      cookieStore.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });

      return NextResponse.json({ message: 'Admin login successful' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Invalid admin credentials' }, { status: 401 });
  } catch (error: any) {
    console.error('Admin Login Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
