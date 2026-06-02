
/**
 * @fileOverview Setup Admin User Script
 * Ensures the admin role is set in Firestore and Auth Custom Claims.
 */

import * as admin from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Force load variables from .env.local with absolute path
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

if (!admin.apps.length) {
  try {
    const keyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!keyString) {
      console.error("❌ ERROR: FIREBASE_SERVICE_ACCOUNT_KEY is missing in .env.local");
      process.exit(1);
    }

    const serviceAccount = JSON.parse(keyString);
    
    if (!serviceAccount.project_id) {
      console.error("❌ ERROR: Service Account JSON is invalid.");
      process.exit(1);
    }

    initializeApp({
      credential: cert(serviceAccount),
    });
    console.log("✅ Firebase Admin Initialized with Registry Key.");
  } catch (err: any) {
    console.error("❌ Failed to parse Service Account Key:", err.message);
    process.exit(1);
  }
}

const db = getFirestore();
const auth = getAuth();

// The specific UID provided by the user system
const ADMIN_UID = "rZaL1kVALOMewoZcjIePDAyXKji2";
const ADMIN_EMAIL = "admin@mwijay.com";

async function setupAdmin() {
  console.log(`🚀 Initializing Admin Node for: ${ADMIN_EMAIL}...`);

  try {
    // 1. Set Custom Claims in Firebase Auth (Muhimu kwa Security Rules)
    await auth.setCustomUserClaims(ADMIN_UID, { 
      role: 'admin', 
      admin: true 
    });
    console.log("✅ Custom Claims updated for primary admin (role: admin).");

    // Also update claims for theglorifiedkeys Google account
    const GOOGLE_ADMIN_UID = "3xyxYBDNsnermsXQeqWpVen0adE3";
    try {
      await auth.setCustomUserClaims(GOOGLE_ADMIN_UID, {
        role: 'admin',
        admin: true
      });
      console.log("✅ Custom Claims updated for Google admin account.");
    } catch (e: any) {
      console.log("⚠️ Could not update custom claims for Google admin account (user might not be created in Auth yet):", e.message);
    }

    // 2. Set Admin Document in Firestore
    const userRef = db.collection('users').doc(ADMIN_UID);
    await userRef.set({
      uid: ADMIN_UID,
      email: ADMIN_EMAIL,
      role: 'admin',
      displayName: "MWJ Admin",
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      emailVerified: false
    }, { merge: true });

    // Also create admin document for the Google account
    const googleUserRef = db.collection('users').doc(GOOGLE_ADMIN_UID);
    await googleUserRef.set({
      uid: GOOGLE_ADMIN_UID,
      email: "theglorifiedkeys@gmail.com",
      role: 'admin',
      displayName: "Mwijay Davie",
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      emailVerified: true
    }, { merge: true });
    console.log("✅ Firestore Google admin user document synced.");

    // 3. Create Public Profile Document for Landing Page access
    // Hii inafuta kero ya 'permission-denied' kwenye Landing Page
    await db.collection('users').doc('mwijay-davie-admin').set({
      name: "David Erick Mwijage",
      heroTitle: "Creative Technologist",
      heroTagline: "Smart Systems*AI Automation*Precision Logic",
      aboutBio: "Building intelligent applications and automated systems that solve real-world problems in the 2026 digital landscape.",
      location: "Kongowe, Dar es Salaam",
      email: "mwijaydavie@gmail.com",
      whatsapp: "+255 620 641 695",
      systemsBuilt: 12,
      webSystems: 10,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    console.log("✅ Firestore user documents synced.");
    console.log("🎉 Admin setup complete! Restart your server to see changes.");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  }
}

setupAdmin();
