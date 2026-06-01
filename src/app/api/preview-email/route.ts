
import { NextResponse } from 'next/server';
import {
  inquiryNotificationTemplate,
  autoReplyTemplate,
  orderConfirmationTemplate,
  orderDeliveredTemplate,
  clientWelcomeTemplate,
} from '@/lib/email-templates';

/**
 * GET /api/preview-email?type=inquiry|reply|order|delivered|welcome
 * 
 * DEVELOPMENT VISUALIZER
 * Allows the architect to verify email design signals in-browser.
 */
export async function GET(request: Request) {
  // Security guard for production
  if (process.env.NODE_ENV === 'production') {
    return new Response('Registry locked in production.', { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  const mockData = {
    inquiry: {
      clientName: "Amina Hassan",
      clientEmail: "amina.h@aymiafrica.org",
      clientPhone: "+255 712 345 678",
      clientMessage: "Hi David, I am looking to architect a new e-commerce system for our textile distribution business. Can we discuss technical feasibility and pricing?",
      submittedAt: new Date().toLocaleString('en-TZ', {
        timeZone: 'Africa/Dar_es_Salaam',
        dateStyle: 'full',
        timeStyle: 'short'
      })
    },
    autoReply: {
      clientName: "Amina Hassan",
      clientEmail: "amina.h@aymiafrica.org",
    },
    order: {
      customerName: "John Mwalimu",
      customerEmail: "john@smartgym.tz",
      productName: "SaaS Management Engine — Advanced",
      amount: 1500000,
      orderId: "MWJ-2026-X842",
      mpesaNumber: "0790 942 616",
      tigopesaNumber: "0620 641 695",
      airtelNumber: "0665 275 804",
    },
    delivered: {
      customerName: "John Mwalimu",
      productName: "SaaS Management Engine — Advanced",
      orderId: "MWJ-2026-X842",
    },
    welcome: {
      clientName: "Grace Kimaro",
      email: "grace@uaut.ac.tz",
      projectName: "UAUT Alumni Registry",
      loginUrl: "https://mwijayportfolio.vercel.app/client-portal/login"
    }
  };

  let html = '';

  switch (type) {
    case 'inquiry':
      html = inquiryNotificationTemplate(mockData.inquiry);
      break;
    case 'reply':
      html = autoReplyTemplate(mockData.autoReply);
      break;
    case 'order':
      html = orderConfirmationTemplate(mockData.order);
      break;
    case 'delivered':
      html = orderDeliveredTemplate(mockData.delivered);
      break;
    case 'welcome':
      html = clientWelcomeTemplate(mockData.welcome);
      break;
    default:
      return new Response(`
        <body style="background:#07080c;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
          <div style="text-align:center;">
            <h1 style="letter-spacing:0.2em;">EMAIL_PREVIEW_HUB</h1>
            <div style="display:flex;gap:10px;margin-top:20px;">
              <a href="?type=inquiry" style="color:#2563eb;text-decoration:none;font-weight:bold;">Inquiry</a>
              <a href="?type=reply" style="color:#2563eb;text-decoration:none;font-weight:bold;">Auto-Reply</a>
              <a href="?type=order" style="color:#2563eb;text-decoration:none;font-weight:bold;">Order</a>
              <a href="?type=delivered" style="color:#2563eb;text-decoration:none;font-weight:bold;">Delivered</a>
              <a href="?type=welcome" style="color:#2563eb;text-decoration:none;font-weight:bold;">Welcome</a>
            </div>
          </div>
        </body>
      `, { headers: { 'Content-Type': 'text/html' } });
  }

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
