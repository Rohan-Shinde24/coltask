import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyResetToken } from '@/lib/redis';
import bcrypt from 'bcryptjs';
import Joi from 'joi';

const resetSchema = Joi.object({
  email: Joi.string().email().required(),
  token: Joi.string().length(6).required(),
  newPassword: Joi.string().min(6).required()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { error } = resetSchema.validate(body);
    
    if (error) {
      return NextResponse.json({ message: error.details[0].message }, { status: 400 });
    }

    const { email, token, newPassword } = body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }

    const isValid = await verifyResetToken(user.id, token);
    
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid or expired reset token' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ message: 'Password has been reset successfully' }, { status: 200 });
  } catch (err: any) {
    console.error('Reset Password Error:', err);
    return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
  }
}
