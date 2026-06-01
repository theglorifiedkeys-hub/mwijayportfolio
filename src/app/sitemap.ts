import { MetadataRoute } from 'next';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert, getApps } from 'firebase-admin/app';

/**
 * Dynamic SEO Sitemap Generator
 * - Hardened for Next.js 15
 * - Pulls dynamic slugs from Firestore registry
 * - Includes all high-value conversion nodes
 */

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY;

// Initialize Admin SDK only if credentials exist and no app is running
if (!getApps().length && PROJECT_ID && CLIENT_EMAIL && PRIVATE_KEY) {
  try {
    initializeApp({
      credential: cert({
        projectId: PROJECT_ID,
        clientEmail: CLIENT_EMAIL,
        privateKey: PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('📡 [Sitemap Engine] Firebase Admin Init Failed:', error);
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mwijayportfolio.vercel.app';

  /* ═══════════════════════════════════════
     1. STATIC NODES
  ═══════════════════════════════════════ */
  const staticRoutes = [
    '',
    '/projects',
    '/blog',
    '/pricing',
    '/contact',
    '/about',
    '/agreement',
    '/terms',
    '/privacy',
    '/book',
    '/track-order',
  ];

  const staticEntries = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === '' ? 'daily' : 'weekly') as 'daily' | 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  /* ═══════════════════════════════════════
     2. DYNAMIC NODES (Resilient Fetch)
  ═══════════════════════════════════════ */
  let projectEntries: MetadataRoute.Sitemap = [];
  let blogEntries: MetadataRoute.Sitemap = [];

  try {
    const db = getFirestore();
    
    // PROJECT REGISTRY
    const projectSnap = await db.collection('projects').get();
    projectEntries = projectSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        url: `${baseUrl}/projects/${data.slug || doc.id}`,
        lastModified: data.updatedAt?.toDate() || new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.9,
      };
    });

    // BLOG REGISTRY
    const blogSnap = await db.collection('blogs').get();
    blogEntries = blogSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        url: `${baseUrl}/blog/${data.slug || doc.id}`,
        lastModified: data.publishedAt?.toDate() || new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      };
    });
  } catch (err) {
    console.warn('📡 [Sitemap Engine] Dynamic fetch failed. Falling back to static nodes.');
  }

  return [
    ...staticEntries,
    ...projectEntries,
    ...blogEntries,
  ];
}
