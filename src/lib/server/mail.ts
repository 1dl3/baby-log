import nodemailer from 'nodemailer';
import { compileTemplate } from './email-templates/compile';
import { env } from '$env/dynamic/private';

// Create a transporter using SMTP settings from .env
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'localhost',
  port: parseInt(env.SMTP_PORT || '1025'),
  secure: env.SMTP_SECURE === 'true',
  auth: env.SMTP_USER && (env.SMTP_PASSWORD || env.SMTP_PASS) ? {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD || env.SMTP_PASS
  } : undefined,
  tls: {
    rejectUnauthorized: false
  }
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${env.APP_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: env.SMTP_FROM || '"Baby Protocol" <noreply@babyprotocol.com>',
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
  const resetUrl = `${env.APP_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: env.SMTP_FROM || '"Baby Protocol" <noreply@babyprotocol.com>',
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

export async function sendInvitationEmail(email: string, inviterName: string, babyName: string, invitationCode: string) {
  const invitationUrl = `${env.APP_URL}/invitation?code=${invitationCode}`;

  const mailOptions = {
    from: env.SMTP_FROM || '"Baby Protocol" <noreply@babyprotocol.com>',
    to: email,
    subject: `Einladung zu Baby Log - ${babyName}`,
    html: compileTemplate('invitation', { 
      inviterName, 
      babyName, 
      invitationUrl, 
      invitationCode 
    })
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw new Error('Failed to send invitation email');
  }
} 
