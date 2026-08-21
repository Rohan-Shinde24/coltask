import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const workshop = await prisma.workshop.findUnique({
      where: { id },
      include: { members: true }
    });
    if (!workshop) return NextResponse.json({ message: 'Workshop not found' }, { status: 404 });

    const isMember = workshop.members.some((m: any) => m.userId === user.id);
    if (!isMember) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const logs = await prisma.activityLog.findMany({
      where: { workshopId: id },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error: any) {
    console.error('GET Logs Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
