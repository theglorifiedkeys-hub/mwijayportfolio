# Maintaining the public portfolio

The homepage and `/projects` share `src/lib/portfolio.ts`. Altraware is listed first as the primary venture. Project statuses are editorial snapshots, **not** uptime checks. A public URL is not evidence that development is complete.

When updating:

1. Check [Altraware work](https://altra.tanzaniareach.com/work) and [Mwijay Studio work](https://mwijay-studio.vercel.app/work). The public defaults are also in [Altraware’s site content](https://github.com/mwijay12/altraware-tech/blob/main/lib/site-content.js) and [the Studio catalogue](https://github.com/mwijay12/Mwijay-Studio/blob/main/src/data/projects.ts).
2. Update the project name, studio, published status, short description and public link together. Preserve qualifiers such as “demo”. Update `reviewed` after checking the entries.
3. Run `npm run typecheck` and inspect the index filters. The public index does not require Firebase credentials.
4. After deploying changes, inspect `/`, `/about`, `/services/content` and `/projects` in Google Search Console and request indexing for the affected URLs. Google controls crawl timing and may rewrite titles and snippets.

## Editorial art and project notes

Home, Work and About share `src/components/portfolio/folio.tsx`. The landscape studies and product covers are illustrative artwork, not product screenshots. The screenshots inside the Faida POS and Audenic notes are sourced from `public/assets/work/` in the [Altraware site repository](https://github.com/mwijay12/altraware-tech). The About portrait is that repository’s `public/assets/team/david.jpg`. Keep the portfolio’s real person and project images distinct from its illustrative covers when replacing assets.

### Publishing and discovery

| Studio control | Public result | Client entry point |
| --- | --- | --- |
| `/admin/blogs` → Published | Latest three in `/` and `/library`; full searchable archive at `/blog`; draft detail URLs are not public | Library in the workspace |
| `/admin/market` → Available | `/market`, the resource shelf under `/pricing`, and PDF editions in the design gallery | Explore the market in Library; signed-in checkouts appear in Orders |
| `/admin/site-config` | Directory facts/contact information on the homepage, existing design showcases, installed-app manifest and sign-in artwork | Client sign-in uses the configured hero image |

The three handbook entries are static client help, not seeded Firestore posts. Empty and unavailable catalogues do not invent inventory. Public content requires explicit `isPublished: true` or `isAvailable: true`; check older listings without flags in admin before rollout. Existing formatted TZS prices are supported.

**Release check:** deploy the app with the correct Firebase environment, then publish `firestore.rules` and `firestore.indexes.json` to that same project. With test accounts, save a draft and publish it, toggle product availability, submit and verify a test order, and check the signed-in buyer's history. A guest order can still be tracked with its ID and checkout email; it is not automatically claimed by an account. Never put payment proofs or delivery secrets in a public product record.
