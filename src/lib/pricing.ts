/** Public guide aligned with Altraware's pricing page. Review when its prices change. */
export const WEB_PACKAGES = [
  {
    id: 'web-starter', name: 'Web Starter', price: 350000,
    description: 'A simple web presence for a small business or new venture.',
    features: ['Mobile-first layout with 1–3 sections', 'WhatsApp and phone contact links', 'Domain and one year of hosting', 'Admin walkthrough and one month of support'],
    popular: false,
  },
  {
    id: 'growth-site', name: 'Growth Business', price: 550000,
    description: 'A multi-page site for an established business or growing brand.',
    features: ['Product or service showcase', 'WhatsApp enquiries and quote requests', 'Google Business and local search setup', 'Content management and three months of support'],
    popular: true,
  },
  {
    id: 'pro-portal', name: 'Pro Portal', price: 750000,
    description: 'A custom web presence with a client portal and database forms.',
    features: ['English and Kiswahili ready', 'Client portal and database enquiries', 'API and payment webhook readiness', 'Written SLA and six-month warranty'],
    popular: false,
  },
] as const;

export const ADDITIONAL_SERVICES = [
  { name: 'Web & mobile apps', price: 800000, description: 'Apps for customers, teams and day-to-day operations.' },
  { name: 'Business systems', price: 1200000, description: 'Purpose-built tools for sales, stock, records and more.' },
] as const;

export function formatTsh(amount: number) {
  return `TSh ${new Intl.NumberFormat('en-TZ').format(amount)}`;
}
