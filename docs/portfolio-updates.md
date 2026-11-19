# Maintaining the public portfolio

The homepage and `/projects` share `src/lib/portfolio.ts`. Altraware is listed first as the primary venture. Project statuses are editorial snapshots, **not** uptime checks. A public URL is not evidence that development is complete.

When updating:

1. Check [Altraware work](https://altra.tanzaniareach.com/work) and [Mwijay Studio work](https://mwijay-studio.vercel.app/work). The public defaults are also in [Altraware’s site content](https://github.com/mwijay12/altraware-tech/blob/main/lib/site-content.js) and [the Studio catalogue](https://github.com/mwijay12/Mwijay-Studio/blob/main/src/data/projects.ts).
2. Update the project name, studio, published status, short description and public link together. Preserve qualifiers such as “demo”. Update `reviewed` after checking the entries.
3. Run `npm run typecheck` and inspect the index filters. The public index does not require Firebase credentials.
4. After deploying changes, inspect `/`, `/about`, `/services/content` and `/projects` in Google Search Console and request indexing for the affected URLs. Google controls crawl timing and may rewrite titles and snippets.
