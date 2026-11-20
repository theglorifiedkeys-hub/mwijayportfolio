import { MetadataRoute } from 'next';
import { initializeFirebase } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Dynamic manifest generator - Fetches branding data from Firestore.
 * Ensures the app "Install" experience matches the site's precision design.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  // BASE DEFAULTS
  let manifestData: MetadataRoute.Manifest = {
    name: 'David Erick Mwijage Portfolio',
    short_name: 'Mwijay',
    description: 'Professional Portfolio and Digital Solutions by Mwijay Davie.',
    start_url: '/',
    display: 'standalone',
    background_color: '#07080c',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
    shortcuts: [
      {
        name: "Client Portal",
        url: "/client-portal",
        description: "Access project workspace and files"
      },
      {
        name: "Book a Project",
        url: "/book",
        description: "Launch project builder"
      }
    ]
  };

  try {
    const { firestore } = initializeFirebase();
    
    if (firestore) {
      // 1. Fetch manifest config
      const manifestRef = doc(firestore, 'site_config', 'manifest');
      const snap = await getDoc(manifestRef);

      // 2. Fetch general profile for fallback logo
      const profileRef = doc(firestore, 'users', 'mwijay-davie-admin');
      const profileSnap = await getDoc(profileRef);
      const fallbackLogo = profileSnap.exists() ? profileSnap.data().logoUrl : null;

      if (snap.exists()) {
        const db = snap.data();
        
        manifestData = {
          ...manifestData,
          name: db.name || manifestData.name,
          short_name: db.short_name || manifestData.short_name,
          theme_color: db.theme_color || manifestData.theme_color,
          background_color: db.background_color || manifestData.background_color,
          icons: [
            {
              src: db.icon192 || fallbackLogo || '/favicon.ico',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: db.icon512 || fallbackLogo || '/favicon.ico',
              sizes: '512x512',
              type: 'image/png',
            },
          ]
        };
      }
    }
  } catch (error) {
    console.warn('📡 [Manifest Engine] Sync failed, reverting to system defaults.');
  }

  return manifestData;
}
