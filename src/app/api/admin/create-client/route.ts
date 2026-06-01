
import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { DEFAULT_MILESTONES } from '@/lib/client-portal-types';
import * as admin from 'firebase-admin';
import { sendMail } from '@/lib/mailer';
import { clientWelcomeTemplate } from '@/lib/email-templates';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/create-client
 * 
 * Elite Provisioning Protocol:
 * 1. Creates Auth User
 * 2. Initializes Client Registry Node
 * 3. Architects Initial Project Blueprint
 * 4. Injects Genesis Message Signal
 * 5. Transmits Welcome Signal via Email
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      name,
      phone,
      company,
      projectName,
      service,
      totalAmount,
      amountPaid,
      startDate,
      estimatedCompletion,
    } = body;

    // 1. Initial Validation
    if (!email || !password || !name || !projectName) {
      return NextResponse.json({ success: false, error: 'Missing mandatory registry fields' }, { status: 400 });
    }

    const auth = getAdminAuth();
    const db = getAdminDb();

    if (!auth || !db) {
       return NextResponse.json({ success: false, error: 'Firebase Registry Unreachable' }, { status: 500 });
    }

    // 2. Provision Auth Identity
    const userRecord = await auth.createUser({
      email: email.toLowerCase().trim(),
      password,
      displayName: name.trim(),
    });

    const uid = userRecord.uid;
    const projectId = `${uid}_main`;

    // 3. Register Client Metadata
    await db.collection('clients').doc(uid).set({
      uid,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      company: company?.trim() || 'Personal Node',
      projectId,
      accountStatus: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 4. Architect Project Blueprint
    const milestones = DEFAULT_MILESTONES.map((m, i) => ({
      id: `m_${i + 1}`,
      name: m.name,
      status: i === 0 ? 'completed' : 'pending',
      completedAt: i === 0 ? new Date() : null,
      notes: i === 0 ? 'Registry handshake complete.' : '',
      order: i + 1,
    }));

    await db.collection('client_projects').doc(projectId).set({
      projectId,
      clientId: uid,
      clientName: name.trim(),
      projectName: projectName.trim(),
      service: service || 'Custom Build',
      description: 'System build initialized.',
      status: 'planning',
      progressPercent: 10,
      currentMilestone: milestones[0].name,
      milestones,
      totalAmount: Number(totalAmount) || 0,
      amountPaid: Number(amountPaid) || 0,
      startDate: startDate ? new Date(startDate) : new Date(),
      estimatedCompletion: estimatedCompletion ? new Date(estimatedCompletion) : null,
      deliverables: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 5. Inject Genesis Message
    await db.collection('client_messages').doc(projectId).collection('messages').add({
      projectId,
      senderId: 'mwijay-admin',
      senderName: 'David (Architect)',
      senderRole: 'admin',
      message: `Habari ${name.split(' ')[0]}! Karibu kwenye Partner Terminal. Hapa ndipo utakapoweza kufuatilia kila hatua ya mradi wako wa ${projectName}. Kama una swali lolote, tuma ujumbe hapa wakati wowote.`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      isRead: false
    });

    // 6. Transmit Welcome Signal
    try {
      await sendMail({
        to: email,
        subject: `Welcome to the Partner Terminal — Mwijay Services ✓`,
        html: clientWelcomeTemplate({
          clientName: name,
          email,
          projectName,
          loginUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/client-portal/login`,
        }),
        text: `Welcome ${name}! Your account for ${projectName} is ready. Login at ${process.env.NEXT_PUBLIC_SITE_URL}/client-portal/login`,
      });
    } catch (e) {
      console.warn('📡 [Email Terminal] Welcome signal failed to transmit.');
    }

    return NextResponse.json({ success: true, uid });

  } catch (error: any) {
    console.error('🔥 [Provisioning Exception]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
