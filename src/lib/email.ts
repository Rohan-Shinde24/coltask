import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOTP = async (to: string, otp: string, type: 'verification' | 'reset') => {
  const subject = type === 'verification' 
    ? 'Verify your Coltask Email' 
    : 'Reset your Coltask Password';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #000; text-align: center;">Coltask</h2>
      <p style="font-size: 16px; color: #333;">
        ${type === 'verification' 
          ? 'Thank you for registering! Please use the following OTP to verify your email address.' 
          : 'We received a request to reset your password. Use the following OTP to proceed.'}
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000; background-color: #f4f4f4; padding: 15px 30px; border-radius: 8px;">
          ${otp}
        </span>
      </div>
      <p style="font-size: 14px; color: #666; text-align: center;">
        This code will expire in ${type === 'verification' ? '10' : '30'} minutes. If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Coltask Security" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent: ${info.messageId}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};
