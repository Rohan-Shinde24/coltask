import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

// PUT to mark messages as read
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageIds } = await req.json();
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json({ error: 'Message IDs array is required' }, { status: 400 });
    }

    // Find messages that need updating
    const messagesToUpdate = await prisma.message.findMany({
      where: {
        id: { in: messageIds },
        workshopId: id,
        NOT: {
          readBy: {
            some: { id: user.id }
          }
        }
      },
      select: { id: true }
    });

    if (messagesToUpdate.length > 0) {
      await prisma.$transaction(
        messagesToUpdate.map((msg) =>
          prisma.message.update({
            where: { id: msg.id },
            data: {
              readBy: {
                connect: { id: user.id }
              }
            }
          })
        )
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Chat Read PUT Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
