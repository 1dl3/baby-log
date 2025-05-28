import nodemailer from 'nodemailer';
import { compileTemplate } from './email-templates/compile';
import { env } from '$env/dynamic/private';

// Create a transporter using MailDev
const transporter = nodemailer.createTransport({
  host: env.MAIL_HOST || 'localhost',
  port: parseInt(env.MAIL_PORT || '1025'),
  secure: env.MAIL_SECURE === 'true',
  auth: env.MAIL_USER && env.MAIL_PASSWORD ? {
    user: env.MAIL_USER,
    pass: env.MAIL_PASSWORD
  } : undefined,
  tls: {
    rejectUnauthorized: false
  }
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${env.PUBLIC_APP_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: env.MAIL_FROM || '"Baby Protocol" <noreply@babyprotocol.com>',
    to: email,
    subject: 'Email Verifizierung',
    html: compileTemplate('verification', { verificationUrl })
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${env.PUBLIC_APP_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: env.MAIL_FROM || '"Baby Protocol" <noreply@babyprotocol.com>',
    to: email,
    subject: 'Passwort zurücksetzen',
    html: compileTemplate('reset-password', { resetUrl })
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
} 