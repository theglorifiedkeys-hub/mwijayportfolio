/**
 * @fileOverview Seed Packages Script
 * Standardized: Starter Build starts at 120,000 TZS.
 */

import * as admin from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

if (!admin.apps.length) {
  try {
    const keyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (keyString) {
      const serviceAccount = JSON.parse(keyString);
      initializeApp({
        credential: cert(serviceAccount),
      });
    }
  } catch (err) {
    console.error("❌ Seeding Initialization Failed:", err);
    process.exit(1);
  }
}

const db = getFirestore();

const packages = [
  {
    name: "Starter",
    price: 120000,
    currency: "TZS",
    billingPeriod: "one-time",
    description: "Ideal for landing pages and simple portfolios",
    features: [
      "Single Page Architecture",
      "Next.js 15 Implementation",
      "WhatsApp Integration",
      "3 Revision Rounds",
      "Standard PWA Setup"
    ],
    isPopular: false,
    isActive: true,
    order: 1
  },
  {
    name: "Professional",
    price: 350000,
    currency: "TZS", 
    billingPeriod: "one-time",
    description: "For growing businesses that need real systems",
    features: [
      "Full Web Application",
      "Firebase Integration",
      "Payment Flow Setup",
      "AI Workflow Automation",
      "Admin Dashboard",
      "Priority Support",
      "5 Revision Rounds"
    ],
    isPopular: true,
    isActive: true,
    order: 2
  },
  {
    name: "Enterprise",
    price: 800000,
    currency: "TZS",
    billingPeriod: "one-time", 
    description: "Complete digital transformation for your business",
    features: [
      "Multi-System Architecture",
      "Custom AI Integration",
      "n8n Workflow Automation",
      "Secure Infrastructure Setup",
      "Analytics Dashboard",
      "Staff Training Session",
      "6 Months Support",
      "Unlimited Revisions"
    ],
    isPopular: false,
    isActive: true,
    order: 3
  }
];

async function seedPackages() {
  console.log("🌱 Seeding Pricing Packages...");
  
  try {
    const colRef = db.collection('packages');
    const existing = await colRef.get();
    for (const doc of existing.docs) {
      await doc.ref.delete();
    }

    for (const pkg of packages) {
      await colRef.add({
        ...pkg,
        createdAt: FieldValue.serverTimestamp()
      });
      console.log(`✅ Added: ${pkg.name}`);
    }
    
    console.log("🎉 Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedPackages();
