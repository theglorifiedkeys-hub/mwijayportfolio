# Pricing guide

The public `/pricing` page uses the package guide in `src/lib/pricing.ts`, aligned with [Altraware Technology pricing](https://altra.tanzaniareach.com/pricing), reviewed on 20 November 2026:

| Service | TSh | Pricing basis |
| --- | ---: | --- |
| Web Starter | 350,000 | Fixed package |
| Growth Business | 550,000 | Fixed package |
| Pro Portal | 750,000 | Fixed package |
| Web / mobile app | 800,000 | Starting price |
| Business system | 1,200,000 | Starting price |

Confirm the scope, extras, taxes, hosting and support in the written quote. Website package buttons link to the corresponding Altraware contact form. Custom project enquiries use `/contact`; the estimator links to Altraware so it does not produce a conflicting quote.

## Keeping this current

Review Altraware's pricing page before updating the guide. Update the prices and package details in `src/lib/pricing.ts` and check the public page and enquiry links. This is a manually maintained guide, not a live integration. Firestore `packages` records and the admin pricing editor do **not** update the public guide. Digital products on the pricing page continue to come from Firestore and use the existing checkout.

`npm run db:seed` copies the website package guide to Firestore for other uses. **It deletes all existing documents in the `packages` collection before seeding.** Do not run it against a live database without a backup and explicit approval.
