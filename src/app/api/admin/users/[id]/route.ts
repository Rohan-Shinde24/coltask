import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (err) {
      return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    const targetUserId = params.id;

    let updatedUser;

    switch (action) {
      case 'set_role':
        if (!['admin', 'user'].includes(body.role)) {
           return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
        }
        updatedUser = await prisma.user.update({
          where: { id: targetUserId },
          data: { role: body.role }
        });
        break;

      case 'ban':
        const days = body.banDurationInDays || 7;
        const banExpiresAt = new Date();
        banExpiresAt.setDate(banExpiresAt.getDate() + days);
        
        updatedUser = await prisma.user.update({
          where: { id: targetUserId },
          data: { 
            banExpiresAt,
            banReason: body.banReason || 'Violated terms of service'
          }
        });
        break;

      case 'unban':
        updatedUser = await prisma.user.update({
          where: { id: targetUserId },
          data: { 
            banExpiresAt: null,
            banReason: null
          }
        });
        break;

      case 'delete':
        updatedUser = await prisma.user.update({
          where: { id: targetUserId },
          data: { deletedAt: new Date() }
        });
        break;

      case 'restore':
        updatedUser = await prisma.user.update({
          where: { id: targetUserId },
          data: { deletedAt: null }
        });
        break;

      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Action completed successfully', user: updatedUser }, { status: 200 });

  } catch (error: any) {
    console.error('Admin User Action Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
