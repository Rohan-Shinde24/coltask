import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import Joi from 'joi';

const userStorySchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('', null).optional(),
  points: Joi.number().min(0).default(0),
  sprint: Joi.string().allow(null, '').optional(),
  status: Joi.string().valid('NEW', 'READY', 'IN_PROGRESS', 'READY_FOR_TEST', 'DONE').default('NEW'),
  tag: Joi.string().allow('', null).optional(),
  assignedTo: Joi.string().allow(null, '').optional(),
});

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

    // Allow filtering by sprint via query param
    const { searchParams } = new URL(req.url);
    const sprintId = searchParams.get('sprint');
    
    const query: any = { workshopId: id };
    if (sprintId === 'null') {
      query.sprintId = null;
    } else if (sprintId) {
      query.sprintId = sprintId;
    }

    const userStories = await prisma.userStory.findMany({
      where: query,
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ userStories }, { status: 200 });
  } catch (error: any) {
    console.error('GET User Stories Error:', error);
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
    const { error } = userStorySchema.validate(body);
    if (error) return NextResponse.json({ message: error.details[0].message }, { status: 400 });

    const userStory = await prisma.userStory.create({
      data: {
        title: body.title,
        description: body.description || '',
        points: body.points || 0,
        status: body.status || 'NEW',
        tag: body.tag || '',
        sprintId: body.sprint || null,
        assignedToId: body.assignedTo || null,
        workshopId: id,
        createdById: user.id,
      }
    });

    return NextResponse.json({ userStory }, { status: 201 });
  } catch (error: any) {
    console.error('Create User Story Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
