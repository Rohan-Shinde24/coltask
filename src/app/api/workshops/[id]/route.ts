import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import { workshopSchema } from '@/lib/validations';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    let workshop = await prisma.workshop.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            }
          }
        },
        tags: true
      }
    });

    if (!workshop) return NextResponse.json({ message: 'Workshop not found' }, { status: 404 });

    const isMember = workshop.members.some((m) => m.userId === user.id);
    if (!isMember) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    if (!workshop.joinCode) {
      const crypto = await import('crypto');
      const joinCode = crypto.randomBytes(3).toString('hex').toUpperCase();
      workshop = await prisma.workshop.update({
        where: { id },
        data: { joinCode },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatarUrl: true }
              }
            }
          },
          tags: true
        }
      });
    }

    // Format to match old Mongoose response shape slightly if needed, or leave as is.
    // Client might expect `user._id` instead of `user.id`. Wait, Prisma returns `id`. The client needs to handle it.
    
    return NextResponse.json({ workshop }, { status: 200 });
  } catch (error: any) {
    console.error('GET Workshop Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const workshop = await prisma.workshop.findUnique({
      where: { id },
      include: { members: true }
    });

    if (!workshop) return NextResponse.json({ message: 'Workshop not found' }, { status: 404 });

    const member = workshop.members.find((m) => m.userId === user.id);
    if (!member) {
      return NextResponse.json({ message: 'Forbidden: Not a member' }, { status: 403 });
    }

    const body = await req.json();
    const { error } = workshopSchema.validate(body);
    if (error) return NextResponse.json({ message: error.details[0].message }, { status: 400 });

    if (member.role !== 'admin') {
      const isTryingToChangeName = body.name !== undefined && body.name !== workshop.name;
      const isTryingToChangeDesc = body.description !== undefined && body.description !== (workshop.description || '');
      const isTryingToChangePrivate = body.isPrivate !== undefined && body.isPrivate !== workshop.isPrivate;

      if (isTryingToChangeName || isTryingToChangeDesc || isTryingToChangePrivate) {
        return NextResponse.json({ message: 'Forbidden: Admin access required to update project details' }, { status: 403 });
      }
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.isPrivate !== undefined) updateData.isPrivate = body.isPrivate;
    if (body.tags !== undefined) {
      updateData.tags = {
        deleteMany: {},
        create: body.tags.map((t: any) => ({ name: t.name, color: t.color }))
      };
    }

    const updatedWorkshop = await prisma.workshop.update({
      where: { id },
      data: updateData,
      include: { tags: true }
    });

    return NextResponse.json({ workshop: updatedWorkshop }, { status: 200 });
  } catch (error: any) {
    console.error('PUT Workshop Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const workshop = await prisma.workshop.findUnique({
      where: { id },
      include: { members: true }
    });

    if (!workshop) return NextResponse.json({ message: 'Workshop not found' }, { status: 404 });

    const member = workshop.members.find((m) => m.userId === user.id);
    if (!member || member.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Prisma onDelete: Cascade will handle deletion of related tasks, messages, etc.
    await prisma.workshop.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Workshop deleted' }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE Workshop Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
