
// SERVER SIDE ONLY - never import in client components
import nodemailer from 'nodemailer';

/**
 * @fileOverview Nodemailer transporter configuration for Gmail.
 * This utility handles the actual sending of emails using environment credentials.
 */

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Verifies that the mailer is correctly configured.
 */
export async function verifyMailer(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Mailer verification failed:', error);
    return false;
  }
}

/**
 * Core function to send an email.
 */
export async function sendMail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await transporter.sendMail({
      from: `"Mwijay Services" <${process.env.GMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text,
    });
    return { success: true };
  } catch (error: any) {
    console.error('Email send error:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error during email transmission.' 
    };
  }
}
