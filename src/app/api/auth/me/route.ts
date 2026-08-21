import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const decoded = await getUserFromToken();
    if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        deletedAt: true,
        banExpiresAt: true,
        role: true,
      }
    });

    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    if (user.deletedAt) {
      return NextResponse.json({ message: 'Account deleted' }, { status: 403 });
    }

    if (user.banExpiresAt && new Date() < user.banExpiresAt) {
      return NextResponse.json({ message: 'Account banned' }, { status: 403 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
