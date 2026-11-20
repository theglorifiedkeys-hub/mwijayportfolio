/**
 * @fileOverview Seed Packages Script
 * Seeds the Altraware-aligned website packages. This replaces existing package documents.
 */

import * as admin from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { WEB_PACKAGES } from '../src/lib/pricing';

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

const packages = WEB_PACKAGES.map((pkg, index) => ({
  name: pkg.name,
  title: pkg.name,
  category: 'web',
  bestFor: pkg.description,
  displayOrder: index + 1,
  price: pkg.price,
  currency: 'TZS',
  billingPeriod: 'one-time',
  description: pkg.description,
  features: [...pkg.features],
  isPopular: pkg.popular,
  isActive: true,
  order: index + 1,
}));

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
