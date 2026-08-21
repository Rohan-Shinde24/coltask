import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import { workshopSchema } from '@/lib/validations';
import { getCachedUserWorkshops, cacheUserWorkshops, invalidateUserWorkshops } from '@/lib/redis';

export async function GET() {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const cachedWorkshops = await getCachedUserWorkshops(user.id);
    if (cachedWorkshops) {
      return NextResponse.json({ workshops: cachedWorkshops, cached: true }, { status: 200 });
    }

    const workshops = await prisma.workshop.findMany({
      where: {
        members: {
          some: { userId: user.id }
        }
      },
      orderBy: { createdAt: 'desc' },
      include: { members: true, tags: true }
    });

    await cacheUserWorkshops(user.id, workshops);

    return NextResponse.json({ workshops }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch Workshops Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const { error } = workshopSchema.validate(body);
    if (error) {
      return NextResponse.json({ message: error.details[0].message }, { status: 400 });
    }

    const { name, description } = body;

    const crypto = await import('crypto');
    const joinCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    const workshop = await prisma.workshop.create({
      data: {
        name,
        description,
        joinCode,
        ownerId: user.id,
        members: {
          create: [{ userId: user.id, role: 'admin' }]
        }
      }
    });

    await invalidateUserWorkshops(user.id);

    return NextResponse.json({ workshop }, { status: 201 });
  } catch (error: any) {
    console.error('Create Workshop Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
