# Frontend Architecture Guide

## 1) Goals

- Keep business code easy to scale by route and by module.
- Keep reusable UI/layout separated from route-level logic.
- Make import boundaries explicit and enforceable by ESLint.

## 2) Layered Structure

The project follows a lightweight layered structure:

```text
src/
  app/         # App bootstrap, router, global styles, providers
  pages/       # Route-level screens (dashboard, settings, not-found)
  widgets/     # Reusable composed UI blocks (AppShell, Sidebar, Header)
  devtools/    # Development-only demo/showcase modules
  shared/      # Shared UI kit, hooks, utils, constants, providers
```

## 3) Responsibility By Layer

- `app`
  - Owns app startup and top-level concerns.
  - Should not contain business UI details.
- `pages`
  - Owns route-level state orchestration and page composition.
  - Uses `widgets` and `shared`.
  - Intra-page imports should be relative (`../model`, `./components`).
- `widgets`
  - Owns reusable composed sections/layouts.
  - Must not import route-level code from `pages`.
- `devtools`
  - Playground / component showcase for development.
  - Should not be coupled to business routing.
- `shared`
  - Design system and framework-agnostic utilities.
  - Can be used by any layer.

## 4) Import Boundary Rules

Implemented in `eslint.config.js`:

- `src/widgets/**/*.{ts,tsx}` cannot import `@/pages/*`.
- `src/pages/**/*.{ts,tsx}` cannot import `@/pages/*`.
  - Use relative imports inside each page module for local cohesion.

## 5) Module Conventions

Use this convention inside a route module:

```text
pages/<page-name>/
  index.ts
  model/        # hooks, local state helpers, mappers
  ui/
    <PageName>.tsx
    components/ # presentational sections
    config/     # chart/visual config and static page-only data
```

Use this convention inside reusable widget modules:

```text
widgets/<widget-name>/
  index.ts
  model/        # static data, widget-level helpers
  ui/
    <Widget>.tsx
    components/
```

## 6) Data Placement Rules

- Put page-only static data under `pages/<name>/ui/config` or `pages/<name>/model`.
- Put widget-only static data under `widgets/<name>/model`.
- Avoid placing mock/static datasets inside large UI component files.

## 7) Current Notable Modules

- `widgets/app-shell`
  - Reusable app layout with sidebar, header, notification sheet.
  - Sidebar data and header feed data are stored in `model/`.
- `pages/dashboard`
  - Route screen for analytics overview using Recharts.
- `pages/settings`
  - Route screen for system preferences; page state is orchestrated in `SettingsPage`, UI is split into section cards.
- `devtools/component-showcase`
  - Component demos for development.

## 8) Practical Rules For New Code

- If code is route-specific, put it in `pages`.
- If code is reusable across multiple pages, put it in `widgets` or `shared`.
- Keep component files focused on rendering; move data/constants/helpers to `model` or `config`.
- Prefer small composable components over one large page file.
- Add/update `index.ts` barrel exports per module to keep imports predictable.

## 9) Suggested Next Steps

- Add `features/` and `entities/` only when domain complexity requires it.
- Add architecture checks in CI by running `npm run lint` on pull requests.
- For bigger modules, add local `README.md` describing state flow and API contracts.
