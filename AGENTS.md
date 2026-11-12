<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture

- All prototype data lives in `src/data/mock.ts`; components and routes import from there so it can be swapped for API calls later.
- Shared app chrome (sidebar, top bar, mobile bottom nav) is the `AppShell` component in `src/components/business/`; each route wraps its page in it instead of using a layout route.
- Locations use the hierarchical global catalog in `src/data/geo.ts` (optional levels); never hardcode a region — Kerala is demo data only.
- Money goes through `formatMoney(amount, sourceCurrency)` from `src/lib/currency.ts`; never hardcode currency symbols.
- Maps use Leaflet + OSM via `CreatorMap` (lazy, ClientOnly) so SSR never imports Leaflet.
