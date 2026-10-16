# 90+ (9ntyplus.com)

The landing page for 90+, GPS fleet tracking from Opesi Mansion and the company's first product. It keeps Opesi Mansion's Reddit Sans, button variants, and theme switching, with its own Route Green colors.

## Run locally

```sh
pnpm install
pnpm dev
```

## Validate

```sh
pnpm check
pnpm build
```

## How it connects to Opesi Mansion

- Sign-up, sales, and legal pages live on www.opesimansion.com. Links are in `src/lib/site.ts`.
- The hero email form opens `https://www.opesimansion.com/get-started#email=...&solution=fleet`. The fragment is never sent to a server; the stepper reads it, preselects Fleet Intelligence, and removes it from the address bar.

## Theme and layout

- Colors use the shadcn "Ocean Breeze" preset from tweakcn (https://tweakcn.com/r/themes/ocean-breeze.json), called Route Green here. Buttons use navy text on green because the preset's white text fails contrast (2.3:1); muted text is slightly darker than the preset for the same reason.
- The page layout follows wialon.com: promo bar, header with Product, Solutions, Resources, and Company menus, a hero with a capability row, then suite, functionality, benefits, commitments, hardware, AI, industries, partners, demo, FAQs, sign-up, and a four-column footer.
- Wialon's usage counters, certifications, testimonials, and awards are intentionally left out until 90+ has its own.

## Images

Photos in `public/images/` are CC0 stock placeholders (see `public/images/SOURCES.md`). Replace them with 90+ product screenshots and photography when available.
