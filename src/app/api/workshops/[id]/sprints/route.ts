import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import Joi from 'joi';

const sprintSchema = Joi.object({
  name: Joi.string().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),
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

    const isMember = workshop.members.some((m: any) => m.userId === user.id);
    if (!isMember) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const sprints = await prisma.sprint.findMany({
      where: { workshopId: id },
      orderBy: { startDate: 'asc' }
    });
    return NextResponse.json({ sprints }, { status: 200 });
  } catch (error: any) {
    console.error('GET Sprints Error:', error);
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

    const member = workshop.members.find((m: any) => m.userId === user.id);
    if (!member || member.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { error } = sprintSchema.validate(body);
    if (error) return NextResponse.json({ message: error.details[0].message }, { status: 400 });

    const sprint = await prisma.sprint.create({
      data: {
        name: body.name,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        workshopId: id,
      }
    });

    try {
      await prisma.activityLog.create({
        data: {
          workshopId: id,
          userId: user.id,
          action: 'created sprint',
          targetName: sprint.name,
        }
      });
    } catch (logErr) {
      console.error(logErr);
    }

    return NextResponse.json({ sprint }, { status: 201 });
  } catch (error: any) {
    console.error('Create Sprint Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
