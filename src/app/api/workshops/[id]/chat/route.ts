import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

// GET all messages for a workshop
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is a member of this workshop
    const workshop = await prisma.workshop.findUnique({
      where: { id },
      include: { members: true }
    });
    if (!workshop || !workshop.members.some((m: any) => m.userId === user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: {
        workshopId: id,
        OR: [
          { recipientId: null }, // Group chat
          { senderId: user.id }, // DM sent by me
          { recipientId: user.id } // DM received by me
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Chat GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST a new encrypted message
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ciphertext, iv, recipient } = await req.json();
    if (!ciphertext || !iv) {
      return NextResponse.json({ error: 'Ciphertext and IV are required' }, { status: 400 });
    }
    
    const workshop = await prisma.workshop.findUnique({
      where: { id },
      include: { members: true }
    });
    if (!workshop || !workshop.members.some((m: any) => m.userId === user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const newMessage = await prisma.message.create({
      data: {
        workshopId: id,
        senderId: user.id,
        recipientId: recipient || null,
        ciphertext,
        iv,
        readBy: {
          connect: [{ id: user.id }]
        }
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
    });

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error: any) {
    console.error('Chat POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
