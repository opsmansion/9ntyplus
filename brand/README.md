# 90+ brand kit

These assets come from the earlier 90+ website and were made before the hackathon. Declare them as pre-existing brand assets in the hackathon submission.

## Wordmark

"90" in Reddit Sans ExtraBold (weight 800), followed by a "+" in the strong green (`--primary-strong`), with "by Opesi Mansion" beside it. Always present 90+ as an Opesi Mansion product.

## Icons

`icons/` holds the favicon set: a navy tile with "90" outlined from Reddit Sans ExtraBold and a mint plus raised on the right, like an exponent.

- `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`
- `site.webmanifest`: theme and background colour `#0f172a`

`generate-icons.mjs` rebuilds the set from the font. It was written for the old Astro project and needs `sharp` and a font parser to run.

## Colours ("Route Green")

Based on the shadcn "Ocean Breeze" preset from tweakcn. The full token set is in `route-green-theme.css`.

| Token | Value | Use |
| --- | --- | --- |
| `--navy` / `--heading` | `oklch(0.2077 0.0398 265.7549)`, about `#0f172a` | Headings, icon tile |
| `--primary` | `oklch(0.7227 0.192 149.5793)` | Buttons |
| `--primary-foreground` | navy | Text on buttons. White on green fails contrast (2.3:1). |
| `--primary-strong` | `oklch(0.5081 0.1049 165.6121)` | The "+" in the wordmark, links |
| mint | `#34d399` | The "+" in the icon |
| `--background` | `oklch(0.9751 0.0127 244.2507)` | Page background |
| `--foreground` | `oklch(0.3729 0.0306 259.7328)` | Body text |

## Type

Reddit Sans, self-hosted WOFF2 in `fonts/reddit-sans/`, weights 300 to 800 with italics. The licence and font log are included.
