/**
 * @fileOverview High-performance font nodes.
 * Automatically self-hosted by Next.js to eliminate render-blocking Google Font CSS.
 */
import { Inter, Space_Grotesk } from 'next/font/google';

// Inter for body text - highly readable
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Ensures text remains visible during font load
  variable: '--font-inter',
});

// Space Grotesk for high-impact headlines
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});
