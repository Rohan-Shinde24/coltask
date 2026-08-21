import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { storeOTP } from '@/lib/redis';
import { sendOTP } from '@/lib/email';
import Joi from 'joi';

const resendSchema = Joi.object({
  email: Joi.string().email().required(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { error } = resendSchema.validate(body);
    
    if (error) {
      return NextResponse.json({ message: error.details[0].message }, { status: 400 });
    }

    const { email } = body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't leak whether the email exists, just say sent
      return NextResponse.json({ message: 'If the email exists, a new OTP has been sent.' }, { status: 200 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: 'Email is already verified.' }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Redis (expires in 2 minutes)
    await storeOTP(user.email, otp, 2);

    // Send via email service
    await sendOTP(user.email, otp, 'verification');

    return NextResponse.json({ message: 'A new OTP has been sent to your email.' }, { status: 200 });

  } catch (err: any) {
    console.error('Resend Verification Error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
