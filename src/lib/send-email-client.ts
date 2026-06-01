
'use client';

/**
 * @fileOverview Client-side utility for triggering system emails.
 */

export async function triggerEmail(
  type: string,
  data: Record<string, any>
): Promise<void> {
  try {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ type, data })
    });
  } catch (err) {
    console.warn('Email trigger failed silently:', err);
  }
}

export const emailHelpers = {
  notifyInquiry: (data: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    clientMessage: string;
    submittedAt: string;
  }) => triggerEmail('inquiry_notification', data),

  sendAutoReply: (data: {
    clientName: string;
    clientEmail: string;
  }) => triggerEmail('auto_reply', data),

  confirmOrder: (data: {
    customerName: string;
    customerEmail: string;
    productName: string;
    amount: number;
    orderId: string;
  }) => triggerEmail('order_confirmation', {
    ...data,
    mpesaNumber: '0790942616',
    tigopesaNumber: '0620641695',
    airtelNumber: '0665275804'
  }),

  deliverOrder: (data: {
    customerName: string;
    customerEmail: string;
    productName: string;
    orderId: string;
  }) => triggerEmail('order_delivered', data)
};
