import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import Joi from 'joi';

const taskUpdateSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().allow('', null).optional(),
  status: Joi.string().valid('NEW', 'IN_PROGRESS', 'READY_FOR_TEST', 'CLOSED').optional(),
  assignees: Joi.array().items(Joi.string()).optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id, taskId } = await params;

    const workshop = await prisma.workshop.findUnique({
      where: { id },
      include: { members: true }
    });
    if (!workshop) return NextResponse.json({ message: 'Workshop not found' }, { status: 404 });

    const member = workshop.members.find((m) => m.userId === user.id);
    if (!member) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { error } = taskUpdateSchema.validate(body);
    if (error) return NextResponse.json({ message: error.details[0].message }, { status: 400 });

    const oldTask = await prisma.task.findUnique({
      where: { id: taskId, workshopId: id },
      include: { assignees: true }
    });
    if (!oldTask) return NextResponse.json({ message: 'Task not found' }, { status: 404 });

    const isCreator = oldTask.createdById === user.id;
    const isAssignee = oldTask.assignees.some((a) => a.id === user.id);
    
    if (!isCreator && !isAssignee && member.role !== 'admin') {
       return NextResponse.json({ message: 'Forbidden: You did not create this task and are not assigned to it' }, { status: 403 });
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.assignees !== undefined) {
      updateData.assignees = {
        set: body.assignees.map((assigneeId: string) => ({ id: assigneeId }))
      };
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData
    });
    
    try {
      if (oldTask.status !== task.status) {
        await prisma.activityLog.create({
          data: {
            workshopId: id,
            userId: user.id,
            action: 'moved task',
            targetName: task.title,
            details: `to ${task.status}`,
          }
        });
      } else if (body.title || body.description !== undefined) {
         await prisma.activityLog.create({
          data: {
            workshopId: id,
            userId: user.id,
            action: 'updated task',
            targetName: task.title,
            details: 'details updated',
          }
        });
      }
    } catch (logErr) {
      console.error('Failed to log activity', logErr);
    }

    return NextResponse.json({ task }, { status: 200 });
  } catch (error: any) {
    console.error('Update Task Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id, taskId } = await params;

    const workshop = await prisma.workshop.findUnique({
      where: { id },
      include: { members: true }
    });
    if (!workshop) return NextResponse.json({ message: 'Workshop not found' }, { status: 404 });

    const member = workshop.members.find((m) => m.userId === user.id);
    if (!member) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const oldTask = await prisma.task.findUnique({
      where: { id: taskId, workshopId: id }
    });
    if (!oldTask) return NextResponse.json({ message: 'Task not found' }, { status: 404 });

    const isCreator = oldTask.createdById === user.id;
    if (!isCreator && member.role !== 'admin') {
       return NextResponse.json({ message: 'Forbidden: You did not create this task' }, { status: 403 });
    }

    await prisma.task.delete({
      where: { id: taskId }
    });
    
    try {
      await prisma.activityLog.create({
        data: {
          workshopId: id,
          userId: user.id,
          action: 'deleted task',
          targetName: oldTask.title,
        }
      });
    } catch (logErr) {
      console.error(logErr);
    }
    
    return NextResponse.json({ message: 'Task deleted' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete Task Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
