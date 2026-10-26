# 90+ by Opesi Mansion

One photo, 90+ listings. Photograph or film the items you want to sell, and 90+ turns them into ready-to-publish listings for eBay and Facebook Marketplace, powered by Meta's models. You approve everything before it goes live.

90+ reads size labels and fills in eBay's standard sizes, so clothing and shoe listings are not blocked or hidden under the size rules eBay has enforced since August 2026.

This repository is being rebuilt for the Meta Global AI Developer Hackathon. Building starts on 27 October 2026.

- `FEATURES.md`: what the product does and the demo plan.
- `INTEGRATIONS.md`: every account, API and key needed, and what to set up before building.
- `brand/`: the 90+ logo, icons, colours and fonts. These existed before the hackathon.
- `src/`: the 9ntyplus.com site, built with Next.js. Right now it is a one-page "Something exciting is happening" holding page with a fireworks background (`src/components/fireworks-background.tsx`, adapted from Bundui's Fireworks). Made on 26 October 2026, before the building period. It is a placeholder, not part of the product.

## Run locally

```sh
pnpm install
pnpm dev      # http://localhost:3000
pnpm lint
pnpm build
```

The earlier 90+ fleet-tracking website is in this repository's git history, up to commit `b29e4d0`.
