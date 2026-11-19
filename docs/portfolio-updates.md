# Maintaining the public portfolio

The homepage and `/projects` share `src/lib/portfolio.ts`. Altraware is listed first as the primary venture. Project statuses are editorial snapshots, **not** uptime checks. A public URL is not evidence that development is complete.

When updating:

1. Check [Altraware work](https://altra.tanzaniareach.com/work) and [Mwijay Studio work](https://mwijay-studio.vercel.app/work). The public defaults are also in [Altraware’s site content](https://github.com/mwijay12/altraware-tech/blob/main/lib/site-content.js) and [the Studio catalogue](https://github.com/mwijay12/Mwijay-Studio/blob/main/src/data/projects.ts).
2. Update the project name, studio, published status, short description and public link together. Preserve qualifiers such as “demo”. Update `reviewed` after checking the entries.
3. Run `npm run typecheck` and inspect the index filters. The public index does not require Firebase credentials.
4. After deploying changes, inspect `/`, `/about`, `/services/content` and `/projects` in Google Search Console and request indexing for the affected URLs. Google controls crawl timing and may rewrite titles and snippets.

## Editorial art and project notes

Home, Work and About share `src/components/portfolio/folio.tsx`. The landscape studies and product covers are illustrative artwork, not product screenshots. The screenshots inside the Faida POS and Audenic notes are sourced from `public/assets/work/` in the [Altraware site repository](https://github.com/mwijay12/altraware-tech). The About portrait is that repository’s `public/assets/team/david.jpg`. Keep the portfolio’s real person and project images distinct from its illustrative covers when replacing assets.
