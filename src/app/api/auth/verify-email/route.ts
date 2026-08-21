import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyOTP } from '@/lib/redis';
import Joi from 'joi';

const verifySchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { error } = verifySchema.validate(body);
    
    if (error) {
      return NextResponse.json({ message: error.details[0].message }, { status: 400 });
    }

    const { email, otp } = body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: 'User is already verified' }, { status: 400 });
    }

    const isValid = await verifyOTP(email, otp);
    
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 });
    }

    await prisma.user.update({
      where: { email },
      data: { isVerified: true }
    });

    return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
  } catch (err: any) {
    console.error('Verify Email Error:', err);
    return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
  }
}
