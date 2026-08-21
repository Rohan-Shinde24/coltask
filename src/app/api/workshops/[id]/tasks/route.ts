import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import { taskSchema } from '@/lib/validations';

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

    // Allow filtering by userStory
    const { searchParams } = new URL(req.url);
    const userStoryId = searchParams.get('userStory');
    const query: any = { workshopId: id };
    if (userStoryId) query.userStoryId = userStoryId;

    const tasks = await prisma.task.findMany({
      where: query,
      include: {
        assignees: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error: any) {
    console.error('GET Tasks Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const body = await req.json();
    const { error } = taskSchema.validate(body);
    if (error) return NextResponse.json({ message: error.details[0].message }, { status: 400 });

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        status: body.status || 'NEW',
        workshopId: id,
        userStoryId: body.userStory,
        createdById: user.id,
        ...(body.assignees && body.assignees.length > 0
          ? { assignees: { connect: body.assignees.map((assigneeId: string) => ({ id: assigneeId })) } }
          : {})
      }
    });

    try {
      await prisma.activityLog.create({
        data: {
          workshopId: id,
          userId: user.id,
          action: 'created task',
          targetName: task.title,
        }
      });
    } catch (logErr) {
      console.error('Failed to log activity', logErr);
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    console.error('Create Task Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
