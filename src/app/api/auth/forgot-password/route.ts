import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { storeResetToken } from '@/lib/redis';
import { sendOTP } from '@/lib/email';
import Joi from 'joi';

const forgotSchema = Joi.object({
  email: Joi.string().email().required()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { error } = forgotSchema.validate(body);
    
    if (error) {
      return NextResponse.json({ message: error.details[0].message }, { status: 400 });
    }

    const { email } = body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Don't leak whether the user exists or not
      return NextResponse.json({ message: 'If that email exists, a reset code has been sent.' }, { status: 200 });
    }

    // Generate 6-digit Reset OTP
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in Redis (expires in 2 minutes)
    await storeResetToken(user.id, resetToken, 2);

    // Send via email service
    await sendOTP(user.email, resetToken, 'reset');

    return NextResponse.json(
      { message: 'If that email exists, a reset code has been sent.' },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Forgot Password Error:', err);
    return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
  }
}
