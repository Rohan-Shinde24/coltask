import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import Joi from 'joi';

const userStoryUpdateSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().allow('', null).optional(),
  points: Joi.number().min(0).optional(),
  sprint: Joi.string().allow(null, '').optional(),
  status: Joi.string().valid('NEW', 'READY', 'IN_PROGRESS', 'READY_FOR_TEST', 'DONE').optional(),
  tag: Joi.string().allow('', null).optional(),
  assignedTo: Joi.string().allow(null, '').optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; storyId: string }> }) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id, storyId } = await params;

    const workshop = await prisma.workshop.findUnique({
      where: { id },
      include: { members: true }
    });
    if (!workshop) return NextResponse.json({ message: 'Workshop not found' }, { status: 404 });

    const member = workshop.members.find((m: any) => m.userId === user.id);
    if (!member) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { error } = userStoryUpdateSchema.validate(body);
    if (error) return NextResponse.json({ message: error.details[0].message }, { status: 400 });

    const oldStory = await prisma.userStory.findUnique({
      where: { id: storyId, workshopId: id }
    });
    if (!oldStory) return NextResponse.json({ message: 'User Story not found' }, { status: 404 });

    // Check permissions: creator or admin
    const isCreator = oldStory.createdById === user.id;
    if (!isCreator && member.role !== 'admin') {
       return NextResponse.json({ message: 'Forbidden: You did not create this story' }, { status: 403 });
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.points !== undefined) updateData.points = body.points;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.tag !== undefined) updateData.tag = body.tag;
    
    if (body.sprint !== undefined) {
      updateData.sprintId = body.sprint === '' ? null : body.sprint;
    }
    if (body.assignedTo !== undefined) {
      updateData.assignedToId = body.assignedTo === '' ? null : body.assignedTo;
    }

    const updatedStory = await prisma.userStory.update({
      where: { id: storyId },
      data: updateData
    });

    try {
      let actionDetails = 'updated';
      if (body.sprint !== undefined && body.sprint !== oldStory.sprintId) {
         actionDetails = body.sprint ? 'assigned to sprint' : 'moved to backlog';
      } else if (body.status !== undefined && body.status !== oldStory.status) {
         actionDetails = `status changed to ${body.status}`;
      }

      await prisma.activityLog.create({
        data: {
          workshopId: id,
          userId: user.id,
          action: 'updated user story',
          targetName: updatedStory.title,
          details: actionDetails,
        }
      });
    } catch (logErr) {
      console.error('Failed to log activity', logErr);
    }

    return NextResponse.json({ userStory: updatedStory }, { status: 200 });
  } catch (error: any) {
    console.error('Update Story Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; storyId: string }> }) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id, storyId } = await params;

    const workshop = await prisma.workshop.findUnique({
      where: { id },
      include: { members: true }
    });
    if (!workshop) return NextResponse.json({ message: 'Workshop not found' }, { status: 404 });

    const isMember = workshop.members.some((m: any) => m.userId === user.id);
    if (!isMember) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const userStory = await prisma.userStory.findUnique({
      where: { id: storyId, workshopId: id }
    });
    if (!userStory) return NextResponse.json({ message: 'User Story not found' }, { status: 404 });

    await prisma.userStory.delete({
      where: { id: storyId }
    });
    
    try {
      await prisma.activityLog.create({
        data: {
          workshopId: id,
          userId: user.id,
          action: 'deleted user story',
          targetName: userStory.title,
        }
      });
    } catch (logErr) {
      console.error(logErr);
    }

    return NextResponse.json({ message: 'User Story deleted' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete Story Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
