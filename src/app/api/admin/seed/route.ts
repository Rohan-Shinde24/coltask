import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const adminEmail = 'rohan5112004@coltask.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (existingAdmin) {
      return NextResponse.json({ message: 'Admin already seeded' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('rohan009008', salt);

    const admin = await prisma.user.create({
      data: {
        name: 'Rohan5112004',
        email: adminEmail,
        password: hashedPassword,
        isVerified: true,
        role: 'admin'
      }
    });

    return NextResponse.json({ message: 'Admin user successfully created', user: { id: admin.id, email: admin.email, role: admin.role } }, { status: 201 });
  } catch (error: any) {
    console.error('Seed Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
