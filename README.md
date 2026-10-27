# SpareX Admin

Kannali Garage's admin panel for the SpareX platform: the vehicle master and fitment, catalogue, stock, B2B pricing,
orders, returns, payments, B2B businesses and credit, garages and service, content, support and reports.

Next.js (App Router), TypeScript, Tailwind CSS v4 and shadcn/ui. The full brief is in `CLAUDE.md`; open business
questions, each with the default that is built, are in `OPEN-QUESTIONS.md`.

## Run it

```bash
nvm use            # Node 24
npm install
npm run dev        # http://localhost:3000
```

Sign in with a demo account (listed on the sign-in screen, password `Demo@1234`). Super Admins use 2-step
verification; the demo code is `123456`. Admins see everything except admin users, roles, settings and integrations.

| Script           | What it does                       |
| ---------------- | ---------------------------------- |
| `npm run dev`    | Development server                 |
| `npm run check`  | Typecheck, lint and Prettier check |
| `npm run build`  | Production build                   |
| `npm run start`  | Serve the production build         |
| `npm run format` | Format every file                  |

## Where things live

```
src/
  app/
    (auth)/          sign-in, forgot and reset password
    (panel)/         every screen behind login: one folder per menu item
  components/
    ui/              shadcn components and shared blocks: DataTable, FilterBar, StatusBadge, FormDialog,
                     ConfirmDialog, ReasonDialog, Upload, StatCard, ChartCard, TaxDocument…
    layout/          app shell, PageHeader, DetailLayout, FormLayout, FormSection, TabNav
  features/<area>/   one business area: types.ts (the API contract), api.ts, schemas.ts, actions.ts,
                     columns.tsx, utils.ts and components/
  lib/               config, feature switches, permissions-aware navigation, formatting, dates, CSV, GST,
                     status colours, server-action helpers
  mocks/             in-memory demo data and mock handlers (deleted when the backend is live)
```

### Conventions

- **Lists** keep search, filters, sort and page in the URL. The mock (or backend) filters and paginates; screens never
  filter raw arrays. Every list exports the current filter to CSV through `lib/csv-export.ts`, which checks the
  `data.export` permission and records the export in the audit log.
- **Changes** go through Server Actions (`features/<area>/actions.ts`) using `runMutation` or `runValidatedMutation`
  from `lib/server-action.ts`. They check the permission on the server, re-validate with the same zod schema as the
  form, and return `ActionResult`. Every change writes an audit entry.
- **Permissions** are checked with `can(session, permission)` (`features/auth/permissions.ts`); roles are only a
  list of permissions, so a new role is data, not code.
- **Feature switches** for undecided features live in `lib/features.ts` and are shown in Settings → Feature switches.
  A switch only hides or shows; the screens behind it are built.
- **Business defaults** (credit terms, return window, pickup windows, seller details…) are in `lib/constants.ts`.

### Add a new module

1. `src/features/<area>/` with `types.ts`, `api.ts` (and `src/mocks/<area>-api.ts` until the backend exists).
2. Routes under `src/app/(panel)/<area>/` with a `loading.tsx` for each route that loads data.
3. A permission in `features/auth/permissions.ts` and a menu entry in `lib/navigation.ts`.

## Demo data and the real backend

Screens only call `src/features/<area>/api.ts`. Each one checks its data source in `src/lib/config.ts`:

- `"mock"` uses `src/mocks/`. Demo changes live in memory and reset when the server restarts.
- `"api"` calls the backend through `src/lib/api-client.ts`, using `NEXT_PUBLIC_API_BASE_URL` (see `.env.example`)
  and the signed-in admin's token.

To move one area to the real backend:

1. Build the endpoints `api.ts` calls (paths and payloads are in each function), returning the shapes in
   `types.ts`: string ids, ISO dates, money in integer paise, lists as `{ items, page, pageSize, total }`.
2. Set that area to `"api"` in `src/lib/config.ts`.
3. When every area is `"api"`, delete `src/mocks/`; nothing else imports it.
