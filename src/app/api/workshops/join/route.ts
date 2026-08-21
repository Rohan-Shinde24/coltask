import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import Joi from 'joi';

const joinSchema = Joi.object({
  code: Joi.string().required().messages({
    'string.empty': 'Please enter a join code',
  }),
});

export async function POST(req: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { error } = joinSchema.validate(body);
    if (error) {
      return NextResponse.json({ message: error.details[0].message }, { status: 400 });
    }

    // Find the workshop by joinCode
    const workshop = await prisma.workshop.findUnique({
      where: { joinCode: body.code.toUpperCase() },
      include: { members: true }
    });
    
    if (!workshop) {
      return NextResponse.json({ message: 'Invalid join code' }, { status: 404 });
    }

    // Check if user is already a member
    const isMember = workshop.members.some((m) => m.userId === user.id);
    if (isMember) {
      return NextResponse.json({ message: 'You are already a member of this workshop', workshopId: workshop.id }, { status: 200 });
    }

    // Add user as member
    await prisma.workshopMember.create({
      data: {
        userId: user.id,
        workshopId: workshop.id,
        role: 'member',
      }
    });

    // Log the activity
    try {
      await prisma.activityLog.create({
        data: {
          workshopId: workshop.id,
          userId: user.id,
          action: 'joined via code',
          targetName: workshop.name,
        }
      });
    } catch (logErr) {
      console.error(logErr);
    }

    return NextResponse.json({ message: 'Successfully joined workshop', workshopId: workshop.id }, { status: 200 });
  } catch (error: any) {
    console.error('Join Workshop Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
