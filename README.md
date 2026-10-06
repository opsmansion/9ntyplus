# 9ntyplus

An Astro coming-soon page using the Opesi Mansion shadcn theme, Reddit Sans, Tailwind CSS, and the existing `cn` and button patterns.

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

The page follows the system light or dark theme.

## Gravity Stars background

The reusable React component in `src/components/ui/gravity-stars.tsx` comes from the [official Animate UI registry](https://animate-ui.com/r/components-backgrounds-gravity-stars.json). It retains the [Gravity Stars configuration props](https://animate-ui.com/docs/components/backgrounds/gravity-stars), including star count, size, opacity, glow, movement, gravity, and interactions. The registry lists `motion`, but the component source does not import or use it, so no additional dependency is required.

Use `client:load` in Astro to start the canvas animation after hydration:

```astro
---
import { GravityStarsBackground } from "../components/ui/gravity-stars";
---

<div class="relative isolate min-h-dvh">
  <GravityStarsBackground client:load className="absolute inset-0" aria-hidden="true" />
  <div class="relative z-10">
    <!-- Page content -->
  </div>
</div>
```

The container uses `color: var(--primary)`. Each animation frame reads its computed color for both canvas fill and glow, so theme changes apply automatically. The existing light and dark `--primary` definitions in `src/styles/global.css` remain the source of truth.
