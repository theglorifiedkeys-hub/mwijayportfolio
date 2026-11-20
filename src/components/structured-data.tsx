import React from 'react';

/**
 * StructuredData - Server Component to render JSON-LD for SEO.
 */
export function StructuredData() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mwijay.vercel.app';
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+255620641695';
  const email = process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'mwijaydavie@gmail.com';

  const graph = [
    {
      "@context": "https://schema.org",
      "@type": ["ProfessionalService", "LocalBusiness"],
      "@id": `${siteUrl}/#organization`,
      "name": "Mwijay Services",
      "description": "Professional web development, AI automation, and digital solutions in Tanzania",
      "url": siteUrl,
      "telephone": whatsapp,
      "email": email,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Kongowe",
        "addressLocality": "Dar es Salaam",
        "addressRegion": "Dar es Salaam",
        "postalCode": "00000",
        "addressCountry": "TZ"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -6.8235,
        "longitude": 39.2695
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "08:00",
        "closes": "20:00"
      },
      "priceRange": "TZS 250,000 - TZS 2,000,000+",
      "currenciesAccepted": "TZS",
      "paymentAccepted": "Mobile Money, Bank Transfer",
      "areaServed": {
        "@type": "Country",
        "name": "Tanzania"
      },
      "serviceType": [
        "Web Development",
        "AI Automation",
        "Graphic Design",
        "Web Hosting",
        "Digital Products"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      "name": "Mwijay Davie",
      "alternateName": "David Erick Mwijage",
      "jobTitle": "Full-Stack Developer & AI Specialist",
      "worksFor": { "@type": "Organization", "name": "Mwijay Services" },
      "alumniOf": {
        "@type": "EducationalOrganization",
        "name": "United Africa University of Tanzania (UAUT)"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Dar es Salaam",
        "addressCountry": "TZ"
      },
      "url": siteUrl,
      "sameAs": [
        "https://github.com/mwijay",
        "https://instagram.com/mwijaydavie"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      "name": "Mwijay Services",
      "url": siteUrl,
      "description": "Portfolio and services of Mwijay Davie",
      "inLanguage": ["en", "sw"],
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${siteUrl}/blog?search={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    }
  ];

  return (
    <script
      id="structured-data-schema"
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) }}
    />
  );
}
