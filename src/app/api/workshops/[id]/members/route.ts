import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import { inviteSchema } from '@/lib/validations';

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

    const member = workshop.members.find((m) => m.userId === user.id);
    if (!member || member.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { error } = inviteSchema.validate(body);
    if (error) return NextResponse.json({ message: error.details[0].message }, { status: 400 });

    const invitee = await prisma.user.findUnique({ where: { email: body.email } });
    if (!invitee) return NextResponse.json({ message: 'User with this email not found' }, { status: 404 });

    const isAlreadyMember = workshop.members.some((m) => m.userId === invitee.id);
    if (isAlreadyMember) return NextResponse.json({ message: 'User is already a member' }, { status: 400 });

    await prisma.workshopMember.create({
      data: {
        userId: invitee.id,
        workshopId: id,
        role: body.role || 'member'
      }
    });

    return NextResponse.json({ message: 'Member added successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Add Member Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
