/**
 * Portfolio project catalogue — current builds (2026).
 *
 * Sourced from:
 *  - https://altra.tanzaniareach.com/      (Altraware Technology)
 *  - https://mwijay-studio.vercel.app/     (Mwijay Studio)
 *  - https://altra-motion-lab.vercel.app/  (Altraware Motion Lab)
 *
 * Used as the public fallback when Firestore has no projects yet, and as
 * alongside additional projects maintained through the admin.
 */

export interface PortfolioProject {
  id: string;
  name: string;
  type: string;
  status?: 'Live' | 'In Progress' | 'Concept';
  year: string;
  description: string;
  thumbnailImageUrl: string;
  liveUrl?: string;
  featured?: boolean;
}

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'faida-pos',
    name: 'Faida POS',
    type: 'Business System · Altraware',
    status: 'Live',
    year: '2026',
    description:
      'Sell anywhere. Work offline. Keep complete control. An offline-first point-of-sale with M-Pesa, Tigo Pesa and Airtel Money at the core — built for Tanzanian retail, from Kariakoo dukas to supermarkets. A sale closes in under 0.8 seconds, barcode to receipt.',
    thumbnailImageUrl:
      'https://altra-motion-lab.vercel.app/assets/faida-1600-BHYRWVfy.webp',
    liveUrl: 'https://faida-hq.vercel.app/',
    featured: true,
  },
  {
    id: 'uaut-connect',
    name: 'UAUT Connect',
    type: 'Education Portal',
    status: 'Live',
    year: '2026',
    description:
      'The campus and admissions portal of the United African University of Tanzania — applications, student records and campus communication in one place, in Kiswahili and English.',
    thumbnailImageUrl:
      'https://altra-motion-lab.vercel.app/assets/uaut-connect-1600-D9CnsbmU.webp',
    liveUrl: 'https://www.uautconnect.com/',
    featured: true,
  },
  {
    id: 'aymi-africa',
    name: 'AYMI Africa Hub',
    type: 'Non-profit · Web',
    status: 'Live',
    year: '2026',
    description:
      'A hub for a pan-African youth movement — programmes, stories and membership sign-up, designed to feel as bold as the movement itself.',
    thumbnailImageUrl:
      'https://altra-motion-lab.vercel.app/assets/aymi-1600-DhQbicfp.webp',
    liveUrl: 'https://www.aymiafrica.org/',
    featured: true,
  },
  {
    id: 'volta-rentals',
    name: 'Volta Rentals',
    type: 'Web Platform',
    status: 'Live',
    year: '2026',
    description:
      'A fleet registry, a booking flow and a trip calculator for a car-rental company — every vehicle, trip and invoice in one calm dashboard.',
    thumbnailImageUrl:
      'https://altra-motion-lab.vercel.app/assets/volta-1600-CMRmuJ5I.webp',
    liveUrl: 'https://volta-rentals.vercel.app/',
  },
  {
    id: 'bongo-foodie',
    name: 'Bongo Foodie',
    type: 'Food & Ordering',
    status: 'Live',
    year: '2026',
    description:
      'Authentic Swahili gastronomy — dishes browsable by ingredient, price and rating, with a chef assistant to ask. Order straight to WhatsApp.',
    thumbnailImageUrl:
      'https://altra-motion-lab.vercel.app/assets/bongo-foodie-1600-D8BP0IVp.webp',
    liveUrl: 'https://bongofoodie.vercel.app/',
  },
  {
    id: 'audenic',
    name: 'Audenic Audio Labs',
    type: 'E-commerce · Audio',
    status: 'Live',
    year: '2026',
    description:
      'A shop for studio headphones — sound that lives in the room with you. An assistant answers in Kiswahili and English, prices in shillings.',
    thumbnailImageUrl:
      'https://altra-motion-lab.vercel.app/assets/audenic-1600-EdbEtmP5.webp',
    liveUrl: 'https://audenic.vercel.app/',
  },
  {
    id: 'tanzania-reach',
    name: 'Tanzania Reach',
    type: 'Tourism · Education',
    status: 'In Progress',
    year: '2026',
    description:
      'A platform connecting learners, travellers and communities across Tanzania — currently in active build.',
    thumbnailImageUrl:
      'https://images.pexels.com/photos/106344/pexels-photo-106344.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200&sat=-20',
  },
  {
    id: 'caretrack-clinic',
    name: 'CareTrack',
    type: 'Care Centre System · Altraware',
    status: 'Live',
    year: '2026',
    description:
      'Attendance, health and meal notes, fees and guardian updates for care centres, schools and NGOs — designed for weak networks and privacy.',
    thumbnailImageUrl:
      'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    liveUrl: 'https://caretrack-six.vercel.app/dashboard',
  },
  {
    id: 'zion-church-app',
    name: 'Zion Church App',
    type: 'Mobile App',
    year: '2026',
    description:
      'A mobile-first app for the Zion Church community, featured in Altraware’s systems showcase.',
    thumbnailImageUrl:
      'https://res.cloudinary.com/oc8018um/image/upload/v1791639306/Screenshot_2026-10-01_160124.png',
  },
  {
    id: 'gta-tz',
    name: 'GTA Tz',
    type: 'Scroll Experience · Concept',
    status: 'Concept',
    year: '2026',
    description:
      'An immersive, scroll-driven concept experience reimagining a Tanzanian city as a playable world.',
    thumbnailImageUrl:
      'https://images.pexels.com/photos/27141307/pexels-photo-27141307.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
  {
    id: 'nike-tz',
    name: 'Nike Tz',
    type: 'Retail · Concept',
    status: 'Concept',
    year: '2026',
    description:
      'A retail concept storefront — bold product storytelling for the Tanzanian sneaker market.',
    thumbnailImageUrl:
      'https://images.pexels.com/photos/89724/pexels-photo-89724.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  },
];
