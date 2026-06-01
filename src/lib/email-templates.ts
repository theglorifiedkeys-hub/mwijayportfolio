
// SERVER SIDE ONLY - Shared HTML templates for system emails

/**
 * Shared base layout for all Mwijay Services emails.
 */
function emailBase(content: string, previewText: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mwijayportfolio.vercel.app';
  
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${previewText}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        background-color: #07080c; 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #e5e5e5;
        line-height: 1.6;
      }
      .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { 
        background: #000000; 
        padding: 40px 32px;
        border: 1px solid #222;
        border-bottom: 2px solid #2563eb;
        text-align: center;
      }
      .header h1 { 
        color: #ffffff; 
        font-size: 28px; 
        letter-spacing: 0.3em;
        font-weight: 900;
        text-transform: uppercase;
        margin: 0;
      }
      .header p { 
        color: #2563eb; 
        font-size: 10px; 
        letter-spacing: 0.4em;
        margin-top: 10px;
        text-transform: uppercase;
        font-weight: 800;
      }
      .body { 
        background: #0d0f14; 
        padding: 48px 32px;
        border: 1px solid #222;
        border-top: none;
      }
      .footer { 
        background: #07080c; 
        padding: 32px;
        border: 1px solid #222;
        border-top: none;
        text-align: center;
      }
      .footer p { color: #555; font-size: 11px; line-height: 1.8; }
      .footer a { color: #2563eb; text-decoration: none; font-weight: 700; }
      h2 { color: #ffffff; font-size: 22px; margin-bottom: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; }
      p { color: #94a3b8; font-size: 15px; margin-bottom: 20px; }
      .highlight-box { 
        background: #111827; 
        border: 1px solid #1f2937;
        border-left: 4px solid #2563eb;
        padding: 24px;
        margin: 32px 0;
        border-radius: 12px;
      }
      .highlight-box p { color: #ffffff; margin: 0; font-weight: 500; }
      .info-row { 
        display: flex; 
        padding: 14px 0;
        border-bottom: 1px solid #1f2937;
      }
      .info-label { color: #4b5563; font-size: 11px; width: 140px; flex-shrink: 0; text-transform: uppercase; font-weight: 800; letter-spacing: 0.1em; }
      .info-value { color: #ffffff; font-size: 14px; font-weight: 600; }
      .btn { 
        display: inline-block;
        padding: 16px 32px;
        border-radius: 12px;
        text-decoration: none;
        font-size: 12px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        margin: 12px 12px 12px 0;
        text-align: center;
      }
      .btn-primary { background: #2563eb; color: #ffffff; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3); }
      .btn-whatsapp { background: #16a34a; color: #ffffff; box-shadow: 0 10px 15px -3px rgba(22, 163, 74, 0.3); }
      .divider { border: none; border-top: 1px solid #1f2937; margin: 40px 0; }
      .status-badge { 
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 0.1em;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <h1>MWIJAY</h1>
        <p>SYSTEMS_ARCHITECTURE_2026</p>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p>Mwijay Services &bull; Kongowe, Dar es Salaam, TZ</p>
        <p style="margin-top: 12px;">
          <a href="${siteUrl}">Work Gallery</a> &bull; 
          <a href="${siteUrl}/pricing">Service Matrix</a> &bull; 
          <a href="${siteUrl}/contact">Contact Node</a>
        </p>
        <p style="margin-top: 24px; opacity: 0.4; font-family: monospace; font-size: 9px; letter-spacing: 0.1em;">
          SIGNAL_AUTHENTICATED // &copy; ${new Date().getFullYear()} MWIJAY_SERVICES
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}

export function inquiryNotificationTemplate(data: {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientMessage: string;
  submittedAt: string;
}) {
  const cleanPhone = data.clientPhone.replace(/\D/g, '');
  
  return emailBase(`
    <h2>🔔 New Registry Signal</h2>
    <p>A new client brief has been synchronized through the portfolio intake system.</p>
    <div class="divider"></div>
    <div class="info-row"><div class="info-label">Client Node</div><div class="info-value">${data.clientName}</div></div>
    <div class="info-row"><div class="info-label">Signal Email</div><div class="info-value">${data.clientEmail}</div></div>
    <div class="info-row"><div class="info-label">Direct Line</div><div class="info-value">${data.clientPhone}</div></div>
    <div class="info-row"><div class="info-label">Registry Time</div><div class="info-value">${data.submittedAt}</div></div>
    <div class="divider"></div>
    <p><strong>Architecture Brief:</strong></p>
    <div class="highlight-box">
      <p>${data.clientMessage}</p>
    </div>
    <div class="divider"></div>
    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
      <a href="mailto:${data.clientEmail}" class="btn btn-primary">Transmit Reply</a>
      <a href="https://wa.me/${cleanPhone}" class="btn btn-whatsapp">Fast-Track WhatsApp</a>
    </div>
  `, `New Inquiry from ${data.clientName}`);
}

export function autoReplyTemplate(data: { clientName: string }) {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+255620641695';
  
  return emailBase(`
    <h2>Signal Authenticated ✓</h2>
    <p>Hi ${data.clientName},</p>
    <p>Thank you for initiating a project handshake. Your brief has been securely logged in the Mwijay Services registry.</p>
    <div class="divider"></div>
    <p><strong>Operational Protocol:</strong></p>
    <ul style="color: #94a3b8; padding-left: 20px; font-size: 14px; margin-bottom: 24px;">
      <li style="margin-bottom: 14px;">The Architect is currently auditing your technical requirements.</li>
      <li style="margin-bottom: 14px;">A response signal will be transmitted to this email within 24 hours.</li>
      <li style="margin-bottom: 14px;">For urgent builds, use the direct WhatsApp terminal below.</li>
    </ul>
    <div class="divider"></div>
    <p>Need immediate technical coordination?</p>
    <a href="https://wa.me/${whatsapp.replace(/\D/g, '')}" class="btn btn-whatsapp">Direct WhatsApp Terminal</a>
    <div class="divider"></div>
    <p style="font-size: 12px; color: #4b5563; font-style: italic;">
      <strong>Mwijay Services</strong> architecting precision digital systems for the 2026 African business landscape.
    </p>
  `, `Signal Received — Mwijay Services`);
}

export function clientWelcomeTemplate(data: {
  clientName: string;
  email: string;
  projectName: string;
  loginUrl: string;
}) {
  return emailBase(`
    <h2>Terminal Access Granted ✓</h2>
    <p>Hi ${data.clientName},</p>
    <p>Your authenticated partner account for <strong>${data.projectName}</strong> is now live. You can now track your build progress in real-time.</p>
    
    <div class="highlight-box">
      <p><strong>Registry Credentials:</strong></p>
      <div style="margin-top: 12px; font-family: monospace; font-size: 13px;">
        Email: <span style="color: #2563eb;">${data.email}</span><br>
        Status: <span style="color: #16a34a;">ACTIVE_NODE</span>
      </div>
    </div>

    <p>Use the link below to enter your project terminal. If this is your first time, please use the password provided by the architect.</p>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="${data.loginUrl}" class="btn btn-primary" style="display: block; margin: 0;">Access Partner Terminal</a>
    </div>

    <div class="divider"></div>
    <p><strong>Portal Capabilities:</strong></p>
    <ul style="color: #94a3b8; padding-left: 20px; font-size: 14px;">
      <li style="margin-bottom: 10px;">Real-time build milestone tracking</li>
      <li style="margin-bottom: 10px;">Secure file and deliverable vault</li>
      <li style="margin-bottom: 10px;">Direct technical signal terminal (Chat)</li>
      <li style="margin-bottom: 10px;">Verified financial registry (Receipts)</li>
    </ul>
  `, `Welcome to the Partner Terminal — Mwijay Services`);
}

export function orderConfirmationTemplate(data: {
  customerName: string;
  productName: string;
  amount: number;
  orderId: string;
  mpesaNumber: string;
  tigopesaNumber: string;
  airtelNumber: string;
}) {
  return emailBase(`
    <h2>Handshake Registered ✓</h2>
    <p>Hi ${data.customerName},</p>
    <p>Your request for <strong>${data.productName}</strong> has been registered. Fulfillment will initiate upon payment verification.</p>
    
    <div style="background: #000; border: 1px solid #1f2937; border-radius: 16px; padding: 28px; margin: 32px 0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.4);">
      <div class="info-row"><div class="info-label">Registry ID</div><div class="info-value" style="font-family: monospace; color: #2563eb;">${data.orderId}</div></div>
      <div class="info-row"><div class="info-label">Asset</div><div class="info-value">${data.productName}</div></div>
      <div class="info-row" style="border:none;"><div class="info-label">Fulfillment Fee</div><div class="info-value" style="font-size: 18px; color: #2563eb;">TZS ${data.amount.toLocaleString()}</div></div>
    </div>

    <h2 style="font-size: 16px; margin-top: 40px;">💳 Payment Nodes</h2>
    <p>Please transmit the fee to any of these verified Tanzanian nodes:</p>
    
    <div style="background: #111827; padding: 24px; border-radius: 12px; border: 1px solid #1f2937; margin-bottom: 32px;">
      <p style="font-size: 14px; color: #fff; margin-bottom: 12px; font-weight: 600;">📱 M-Pesa (Vodacom): <span style="color: #2563eb;">${data.mpesaNumber}</span></p>
      <p style="font-size: 14px; color: #fff; margin-bottom: 12px; font-weight: 600;">📱 Tigo Pesa: <span style="color: #2563eb;">${data.tigopesaNumber}</span></p>
      <p style="font-size: 14px; color: #fff; margin-bottom: 0; font-weight: 600;">📱 Airtel Money: <span style="color: #2563eb;">${data.airtelNumber}</span></p>
    </div>

    <p><strong>Crucial:</strong> Use <strong>${data.orderId}</strong> as the transaction reference. Once sent, transmit a screenshot to WhatsApp for instant verification.</p>
    
    <a href="https://wa.me/255620641695?text=Verifying payment signal for ${data.orderId}" class="btn btn-whatsapp">Verify Signal via WhatsApp</a>
  `, `Payment Registry — ${data.orderId}`);
}

export function orderDeliveredTemplate(data: {
  customerName: string;
  productName: string;
  orderId: string;
}) {
  return emailBase(`
    <div style="text-align: center; margin-bottom: 32px;">
      <span style="font-size: 56px;">🚀</span>
    </div>
    <h2>Architecture Deployed!</h2>
    <p>Hi ${data.customerName},</p>
    <p>Your payment signal has been authenticated. Your digital assets for <strong>${data.productName}</strong> are now fully unlocked.</p>
    
    <div style="background: #000; border: 1px solid #1f2937; border-radius: 16px; padding: 28px; margin: 32px 0;">
      <div class="info-row"><div class="info-label">Registry ID</div><div class="info-value">${data.orderId}</div></div>
      <div class="info-row"><div class="info-label">Asset Node</div><div class="info-value">${data.productName}</div></div>
      <div class="info-row" style="border:none;"><div class="info-label">Status</div><div class="info-value"><span style="color: #16a34a; font-weight: 900;">FULFILLED ✓</span></div></div>
    </div>

    <p>Your assets have been synchronized to your registered WhatsApp number and client vault. If the signal has not arrived, contact the architect immediately.</p>
    
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/pricing" class="btn btn-primary">Explore More Builds</a>
  `, `Build Delivered: ${data.orderId}`);
}
