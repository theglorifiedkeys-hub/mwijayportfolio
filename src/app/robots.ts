import { MetadataRoute } from 'next';

/**
 * robots.ts - Search Engine Directive Node
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = 'https://mwijayportfolio.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin', 
          '/admin/', 
          '/login', 
          '/api/', 
          '/client-portal/',
          '/interview-prep',
          '/*.json$',
          '/rate_limits/'
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
