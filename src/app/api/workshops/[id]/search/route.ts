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

    const isMember = workshop.members.some((m) => m.userId === user.id);
    if (!isMember) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim() === '') {
       return NextResponse.json({ userStories: [], tasks: [] }, { status: 200 });
    }

    const [userStories, tasks] = await Promise.all([
      prisma.userStory.findMany({
        where: { workshopId: id, title: { contains: query, mode: 'insensitive' } }
      }),
      prisma.task.findMany({
        where: { workshopId: id, title: { contains: query, mode: 'insensitive' } }
      })
    ]);

    return NextResponse.json({ userStories, tasks }, { status: 200 });
  } catch (error: any) {
    console.error('Search Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
