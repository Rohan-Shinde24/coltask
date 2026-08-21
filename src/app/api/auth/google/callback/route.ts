import { NextResponse } from 'next/server';
import axios from 'axios';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { storeSession } from '@/lib/redis';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=GoogleAuthFailed', req.url));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = 'http://localhost:3000/api/auth/google/callback';

    // Exchange code for tokens
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const { id_token, access_token } = tokenRes.data;

    // Fetch user profile
    const googleUserRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );

    const googleUser = googleUserRes.data;

    // Check if user exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.id },
          { email: googleUser.email }
        ]
      }
    });

    if (user) {
      // If user exists but doesn't have googleId linked yet
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleUser.id, isVerified: true, avatarUrl: user.avatarUrl || googleUser.picture }
        });
      }
      
      // Check bans/deleted status
      if (user.deletedAt || (user.banExpiresAt && new Date(user.banExpiresAt) > new Date())) {
        return NextResponse.redirect(new URL('/login?error=AccountBlocked', req.url));
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.id,
          avatarUrl: googleUser.picture,
          isVerified: true, // Google emails are already verified
        },
      });
    }

    // Sign Custom JWT
    const token = signToken({ id: user.id, email: user.email });

    // Store Session in Redis
    await storeSession(user.id, token, 7);

    // Set Cookie
    const cookieStore = await cookies();
    cookieStore.set('token', `Bearer ${token}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.redirect(new URL('/workshops', req.url));
  } catch (error: any) {
    console.error('Google Callback Error:', error.response?.data || error.message);
    return NextResponse.redirect(new URL('/login?error=GoogleAuthFailed', req.url));
  }
}
