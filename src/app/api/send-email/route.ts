
import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/mailer';
import { getAdminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import {
  inquiryNotificationTemplate,
  autoReplyTemplate,
  orderConfirmationTemplate,
  orderDeliveredTemplate,
  clientWelcomeTemplate,
} from '@/lib/email-templates';

export const dynamic = 'force-dynamic';

async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const db = getAdminDb();
  if (!db) return true; // Fail open

  const now = Date.now();
  const docRef = db.collection('rate_limits').doc(key);

  try {
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      await docRef.set({
        count: 1,
        windowStart: now,
      });
      return true;
    }

    const data = docSnap.data();
    if (!data) return true;

    const windowStart = data.windowStart || now;
    const count = data.count || 0;

    if (now - windowStart > windowSeconds * 1000) {
      await docRef.set({
        count: 1,
        windowStart: now,
      });
      return true;
    }

    if (count >= limit) {
      return false;
    }

    await docRef.update({
      count: count + 1,
    });
    return true;
  } catch (error) {
    console.error('Rate limit error:', error);
    return true; // Fail open
  }
}

/**
 * POST /api/send-email
 * 
 * CORE EMAIL TRANSMISSION NODE
 * Triggers automated visual signals for the entire MWJ ecosystem.
 */
export async function POST(req: Request) {
  try {
    // 1. Protection Check (5 emails per 60s per IP)
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const isAllowed = await rateLimit(`email:${ip}`, 5, 60);
    
    if (!isAllowed) {
      return NextResponse.json({ success: false, error: 'Signal rate limit exceeded.' }, { status: 429 });
    }

    const body = await req.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ success: false, error: 'Malformed signal: missing type/data' }, { status: 400 });
    }

    let emailConfig: {
      to: string;
      subject: string;
      html: string;
      text: string;
      replyTo?: string;
    } = {
      to: '',
      subject: '',
      html: '',
      text: '',
    };

    // 2. Prepare Signal based on Type
    switch (type) {
      case 'inquiry_notification':
        emailConfig = {
          to: process.env.ADMIN_EMAIL || 'theglorifiedkeys@gmail.com',
          subject: `🔔 New Registry Signal: ${data.clientName}`,
          html: inquiryNotificationTemplate(data),
          text: `New inquiry from ${data.clientName}. Reply to: ${data.clientEmail}`,
          replyTo: data.clientEmail,
        };
        break;

      case 'auto_reply':
        emailConfig = {
          to: data.clientEmail,
          subject: `✓ Signal Authenticated — Mwijay Services`,
          html: autoReplyTemplate(data),
          text: `Hi ${data.clientName}, your inquiry has been logged. We will respond within 24 hours.`,
        };
        break;

      case 'order_confirmation':
        emailConfig = {
          to: data.customerEmail,
          subject: `📦 Fulfillment Node Created: ${data.orderId}`,
          html: orderConfirmationTemplate(data),
          text: `Order #${data.orderId} registered. Amount: TZS ${data.amount}. Complete payment to verify signal.`,
        };
        break;

      case 'order_delivered':
        emailConfig = {
          to: data.customerEmail,
          subject: `🚀 Build Deployed: ${data.orderId}`,
          html: orderDeliveredTemplate(data),
          text: `Your build node #${data.orderId} for ${data.productName} is now ready!`,
        };
        break;

      case 'welcome_email':
        emailConfig = {
          to: data.email,
          subject: `Welcome to the Partner Terminal — Mwijay Services ✓`,
          html: clientWelcomeTemplate(data),
          text: `Welcome ${data.clientName}! Access your terminal at ${data.loginUrl}`,
        };
        break;

      default:
        return NextResponse.json({ success: false, error: 'Unknown signal type' }, { status: 400 });
    }

    // 3. Transmit Signal with Error Audit
    const result = await sendMail(emailConfig);

    // 4. Log Transaction (Audit Trail)
    try {
      const db = getAdminDb();
      if (db) {
        await db.collection('email_logs').add({
          type,
          recipient: emailConfig.to,
          status: result.success ? 'transmitted' : 'failed',
          error: result.error || null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          ipAddress: ip
        });
      }
    } catch (logErr) {
      console.warn('📡 [Audit Registry] Failed to log email event.');
    }

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 502 });
    }

    return NextResponse.json({ success: true, message: 'Signal transmitted successfully.' });

  } catch (error: any) {
    console.error('🔥 [Email Terminal Exception]:', error);
    return NextResponse.json({ success: false, error: 'Internal system fault during transmission' }, { status: 500 });
  }
}
