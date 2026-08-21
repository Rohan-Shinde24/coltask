import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { registerSchema } from '@/lib/validations';
import { storeOTP } from '@/lib/redis';
import { sendOTP } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const { error } = registerSchema.validate(body);
    if (error) {
      return NextResponse.json({ message: error.details[0].message }, { status: 400 });
    }
    
    const { name, email, password } = body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: false,
      }
    });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in Redis (expires in 2 minutes)
    await storeOTP(user.email, otp, 2);

    // Send via email service
    await sendOTP(user.email, otp, 'verification');

    return NextResponse.json(
      { message: 'User registered successfully. Please verify your email.', user: { id: user.id, name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
