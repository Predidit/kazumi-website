# AGENTS.md

## Stack

AnalogJS + Angular 22 + Vite. SSR with prerendered static routes. Angular Material for UI. Content is Markdown in `src/content/docs/` rendered by `@analogjs/content` with Prism syntax highlighting.

## Commands

```sh
bun install          # install deps (bun.lock is the lockfile, not pnpm)
bun run dev          # dev server (port 5173)
bun run build        # production build (prebuild auto-generates public/doc-updates.json from git log)
bun run test         # vitest
bun run lint         # biome check (lint + format check)
bun run format       # biome check --write (auto-fix)
bun run preview      # serve production build locally
```

CI runs `lint` + `build` on PRs (`.github/workflows/pr-test.yml`). No tests exist yet — `bun run test` passes vacuously.

## Code Style

- **Formatter**: Biome 2.5 — tabs, double quotes
- **Linter**: Biome recommended rules, `useImportType` is off
- **No comments** in code unless explicitly requested

## Routing (AnalogJS file-based)

- Files named `*.page.ts` in `src/app/pages/` define routes
- Page components must be **default exported**
- Nested dirs = nested routes (e.g., `pages/about/icon.page.ts` → `/about/icon`)
- Docs content pages live in `src/content/docs/` as `.md` with frontmatter
- New docs pages must be added to the prerender list in `vite.config.ts`
- Sidebar nav is hardcoded in `src/app/pages/docs.page.ts` (not a separate config file)

## Key Conventions

- Standalone components (no NgModule)
- Angular 22 `@if`/`@for` control flow syntax (not `*ngIf`/`*ngFor`)
- Signals for state (`signal()`, not BehaviorSubject)
- SCSS for styles, using `var(--mat-sys-*)` CSS custom properties from Material 3
- Components use inline `template` + `styles` (not separate files)

## Project Structure

```
src/
  app/
    app.ts              # root component
    app.config.ts       # client providers
    app.config.server.ts # server providers
    features/
      layout/           # header, footer, theme
      docs/             # toc, doc-footer, code-copy
      home/             # hero, contributors
    pages/              # route pages (*.page.ts)
  content/
    docs/               # markdown content
  main.ts               # client bootstrap
  main.server.ts        # SSR entry
```

## Prerender

Static routes are explicitly listed in `vite.config.ts` under `analog({ prerender: { routes: [...] } })`. Add new content pages there or they won't be built.
