# CLAUDE.md - SignageOS Digital Signage Platform (Frontend)

## Project Overview

Monorepo for the Digital Signage Platform frontend. Contains the admin dashboard (Next.js 15), device player app (Vite + React 19), and shared packages for API client, types, and content rendering.

**Backend**: `../CMS/` (FastAPI + PostgreSQL, see its CLAUDE.md)

## Quick Reference

- **Monorepo**: pnpm workspaces + Turborepo
- **Dashboard**: Next.js 15.1.3 + React 19 (App Router)
- **Player**: Vite 6 + React 19 (PWA)
- **Styling**: Tailwind CSS v4 (dashboard), v3.4 (player)
- **State**: Zustand (auth) + React Query v5 (server state)
- **UI**: Radix UI primitives + CVA + custom components
- **Animation**: Framer Motion 12
- **Maps**: Leaflet + react-leaflet
- **Charts**: Recharts
- **Forms**: react-hook-form + Zod
- **Icons**: lucide-react
- **Node**: >=20, pnpm@9.15.0

## Commands

```bash
# Install all dependencies
pnpm install

# Development (all apps + packages)
pnpm dev                    # Turbo: starts all apps
# Or individually:
cd apps/dashboard && pnpm dev   # Dashboard on :3000
cd apps/player && pnpm dev      # Player on :3001

# Build
pnpm build                  # Build all apps + packages

# Lint
pnpm lint

# Format
pnpm format

# Clean
pnpm clean
```

## Monorepo Structure

```
cms-frontennd/
├── apps/
│   ├── dashboard/              # Next.js 15 admin interface (:3000)
│   └── player/                 # Vite + React device player (:3001)
├── packages/
│   ├── api-client/             # @signage/api-client - HTTP client with typed endpoints
│   ├── types/                  # @signage/types - Shared TypeScript definitions
│   └── renderer/               # @signage/renderer - Content rendering engine
├── turbo.json                  # Turbo build orchestration
├── pnpm-workspace.yaml         # Workspace definition
├── tsconfig.base.json          # Shared TS config (ES2022, strict)
└── layoutguide.md              # Design system documentation
```

### Package Names

| Package | Import | Location |
|---------|--------|----------|
| Dashboard | N/A (app) | `apps/dashboard` |
| Player | N/A (app) | `apps/player` |
| API Client | `@signage/api-client` | `packages/api-client` |
| Types | `@signage/types` | `packages/types` |
| Renderer | `@signage/renderer` | `packages/renderer` |

## Dashboard App Architecture

### Route Structure (Next.js App Router)

```
src/app/
├── layout.tsx                  # Root: fonts (Inter + JetBrains Mono), Providers
├── providers.tsx               # React Query + ThemeProvider + auth init
├── page.tsx                    # Redirects to /home
├── globals.css                 # Tailwind v4 + CSS custom properties (design tokens)
│
├── (auth)/                     # Public auth routes
│   ├── layout.tsx              # Two-column: branding | form
│   ├── sign-in/page.tsx        # Email/password + social auth buttons
│   ├── sign-up/page.tsx        # Registration + email verification (2-step)
│   └── forgot-password/page.tsx
│
└── (dashboard)/                # Protected routes (redirects to /sign-in if unauthenticated)
    ├── layout.tsx              # Sidebar + Header + CommandPalette + ErrorBoundary
    ├── home/page.tsx           # Dashboard: metrics, player map, activity feed
    ├── content/page.tsx        # Media library: folders, upload (S3), grid view
    ├── apps/page.tsx           # App gallery: grid, filter by status, CRUD
    ├── apps/create/page.tsx    # App creation wizard
    ├── apps/[id]/edit/page.tsx # App editor
    ├── channels/page.tsx       # Channel list with layout previews
    ├── channels/new/page.tsx   # Channel creation wizard (template → details)
    ├── channels/[id]/page.tsx  # Channel detail/zone editor
    ├── channels/[id]/studio/page.tsx   # Advanced channel studio (design/preview modes)
    ├── channels/[id]/builder/page.tsx  # Alternative channel builder
    ├── players/page.tsx        # Player network: map + list + registration
    ├── schedules/page.tsx      # Schedule timeline + card views
    ├── analytics/page.tsx      # KPIs, charts, device status
    ├── profile/page.tsx        # User profile editor
    ├── workspace/page.tsx      # Workspace settings + team management
    └── settings/page.tsx       # Security, notifications, billing
```

### Source Organization

```
src/
├── components/
│   ├── ui/                     # Primitive components (Radix + CVA)
│   │   ├── button.tsx, input.tsx, label.tsx, textarea.tsx
│   │   ├── card.tsx, badge.tsx, avatar.tsx, skeleton.tsx
│   │   ├── dialog.tsx, drawer.tsx, dropdown-menu.tsx
│   │   ├── tabs.tsx, separator.tsx, breadcrumb.tsx
│   │   ├── data-table.tsx      # TanStack Table wrapper
│   │   ├── glass-card.tsx, empty-state.tsx, bento-grid.tsx
│   │   ├── stat-ring.tsx, status-dot.tsx, timeline.tsx
│   │   └── floating-panel.tsx
│   ├── layout/                 # sidebar.tsx, header.tsx
│   ├── apps/                   # AppCard, AppConfigForm, AppPreview, AppTypeSelector, etc.
│   ├── channels/               # ChannelPreview, ZoneBuilder, ZonePropertiesEditor, etc.
│   ├── channel-designer/       # ChannelDesigner, ZoneEditor, ZoneAppAssignment
│   ├── content/                # FolderTree, CreateFolderModal
│   ├── players/                # PlayerMap, PlayerRegistrationModal
│   ├── schedules/              # ScheduleModal
│   ├── dashboard/              # ActivityFeed, MetricsStrip
│   ├── command-palette/        # CommandPalette (Cmd+K)
│   └── common/                 # ErrorBoundary
│
├── hooks/
│   ├── queries/                # React Query hooks per domain
│   │   ├── useApps.ts, useChannels.ts, useContent.ts
│   │   ├── usePlayers.ts, useSchedules.ts, useTemplates.ts
│   │   ├── useWorkspaces.ts, useAnalytics.ts
│   │   └── index.ts
│   ├── useApi.ts               # API hook utilities
│   └── useAutoBreadcrumb.ts    # Dynamic breadcrumb hook
│
├── contexts/
│   ├── theme-context.tsx       # Light/dark theme (localStorage persisted)
│   ├── sidebar-context.tsx     # Sidebar collapse state
│   └── breadcrumb-context.tsx  # Dynamic breadcrumbs
│
├── stores/
│   └── auth-store.ts           # Zustand: user, account, workspace, workspaces, isAuthenticated
│
├── services/
│   ├── api.ts                  # ApiClient instance + namespaced exports (api.auth, api.apps, etc.)
│   └── auth.ts                 # Auth service: signIn, signUp, signOut, token management
│
└── lib/
    ├── utils.ts                # cn(), formatDate, formatBytes, formatDuration, debounce, throttle
    ├── animations.ts           # Framer Motion variants (fadeInUp, stagger, pageTransition, etc.)
    ├── errors.ts               # getErrorMessage()
    ├── layout-templates.ts     # Layout template definitions
    ├── upload.ts               # S3 upload utilities
    └── zone-validation.ts      # Zone position/size validation
```

## Coding Patterns & Conventions

### Component Pattern

```tsx
'use client'

import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { useApps } from '@/hooks/queries'
import { fadeInUpVariants } from '@/lib/animations'

export default function PageName() {
  const workspace = useAuthStore(s => s.workspace)
  const { data, isLoading } = useApps(workspace?.workspace_id)
  const [searchQuery, setSearchQuery] = useState('')

  if (isLoading) return <Skeleton />

  return (
    <motion.div variants={fadeInUpVariants} initial="hidden" animate="visible">
      {/* content */}
    </motion.div>
  )
}
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Pages | `page.tsx` (Next.js convention) | `apps/page.tsx` |
| Components | PascalCase files + exports | `AppCard.tsx`, `ZoneBuilder.tsx` |
| UI primitives | lowercase files | `button.tsx`, `card.tsx`, `dialog.tsx` |
| Hooks | `use` prefix, camelCase | `useApps`, `useChannels`, `useAutoBreadcrumb` |
| Stores | `{domain}-store.ts` | `auth-store.ts` |
| Services | lowercase `{domain}.ts` | `api.ts`, `auth.ts` |
| Contexts | `{domain}-context.tsx` | `theme-context.tsx`, `sidebar-context.tsx` |
| Lib utils | lowercase descriptive | `animations.ts`, `utils.ts`, `upload.ts` |
| Types | PascalCase interfaces | `App`, `Channel`, `Player`, `Content` |

### Styling Approach

**Tailwind CSS v4** with CSS custom properties for design tokens:

```css
/* globals.css - Design tokens */
@theme {
  --color-background: #FAFAFA;  /* Light */
  --color-surface: #FFFFFF;
  --color-primary: #2563EB;     /* Blue */
  --color-text-primary: #0F172A;
}
.dark { /* Dark mode overrides */ }
```

**Component variants with CVA:**
```tsx
const buttonVariants = cva(baseStyles, {
  variants: {
    variant: { default: '...', outline: '...', ghost: '...', destructive: '...' },
    size: { default: 'h-9 px-4', sm: 'h-8 px-3', lg: 'h-10 px-6' },
  },
})
```

**Class merging:** Always use `cn()` from `lib/utils.ts` (clsx + tailwind-merge).

**Glassmorphism:** `.glass-light` and `.glass-heavy` classes for blurred backgrounds.

**Design philosophy:** "Control Room Elegance" - information-dense, precise, minimal decoration. References: Linear, Vercel, Raycast, Arc Browser.

### State Management

| Layer | Tool | Purpose |
|-------|------|---------|
| Auth/User | Zustand (`auth-store.ts`) | User, account, workspace, isAuthenticated. Persisted to localStorage (`signage-auth` key) |
| Server data | React Query v5 | All API data. staleTime: 60s, retry: 1, refetchOnWindowFocus: false |
| Theme | React Context | Light/dark toggle, persisted to localStorage |
| Sidebar | React Context | Collapse/expand state |
| Breadcrumbs | React Context | Dynamic breadcrumb items |
| Forms | react-hook-form + Zod | Form state and validation |

### API Integration

**Shared API client** (`@signage/api-client`):
```tsx
// services/api.ts - Instantiates client and exports namespaced API
import { createApiClient } from '@signage/api-client'
export const api = createApiClient(baseUrl, getToken)
// Usage: api.apps.list(workspaceId), api.channels.create(workspaceId, data), etc.
```

**Token management:** Access token stored in localStorage as `signage_access_token`. Injected as `Authorization: Bearer {token}` on every request.

**Endpoint modules:** `auth`, `apps`, `channels`, `content`, `players`, `schedules`, `templates`, `analytics`

### React Query Patterns

```tsx
// Query hook
export function useApps(workspaceId?: string) {
  return useQuery({
    queryKey: ['apps', workspaceId],
    queryFn: () => api.apps.list(workspaceId!),
    enabled: !!workspaceId,
  })
}

// Mutation hook
export function useCreateApp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ workspaceId, data }) => api.apps.create(workspaceId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apps'] }),
  })
}
```

Query keys follow `[domain, id?, sub-resource?]` pattern: `['apps']`, `['channels', channelId]`, `['channels', channelId, 'manifest']`.

### Animation Patterns

Framer Motion variants defined in `lib/animations.ts`:
- `fadeInUpVariants` - Fade + slide up on mount
- `staggerChildrenVariants` - Stagger child animations
- `pageTransitionVariants` - Page enter/exit
- `cardHoverVariants` - Scale + lift on hover
- `modalVariants` - Scale + fade for modals
- `hoverLiftVariants` - Hover lift effect

Usage: `<motion.div variants={fadeInUpVariants} initial="hidden" animate="visible">`

## Player App Architecture

Lightweight Vite + React PWA for display devices.

```
apps/player/src/
├── main.tsx                    # Entry point
├── App.tsx                     # Root component
├── core/
│   ├── PlayerEngine.ts         # Core playback engine
│   └── DeviceManager.ts        # Device management
└── screens/
    ├── PairingScreen.tsx       # 6-char pairing code entry
    ├── PlaybackScreen.tsx      # Content display
    └── WaitingScreen.tsx       # Idle/loading state
```

**Key features:**
- PWA with service worker (auto-update)
- Offline support via Dexie (IndexedDB)
- HLS video streaming via hls.js
- Real-time updates via Socket.io
- Uses `@signage/renderer` for content display
- Uses `@signage/types` for type safety

## Shared Packages

### @signage/types

All shared TypeScript interfaces: `App`, `Channel`, `ChannelZone`, `ZoneApp`, `Content`, `Player`, `PlayerCommand`, `Schedule`, `User`, `Account`, `Workspace`, etc.

Key type unions:
- `AppTemplateType`: `'image' | 'video' | 'pdf' | 'web' | 'html' | 'youtube' | 'clock' | 'weather' | 'slideshow' | ...`
- `ContentType`: `'image' | 'video' | 'pdf' | 'audio' | 'document'`
- `PlayerStatus`: `'online' | 'offline' | 'pending' | 'error'`
- `ChannelStatus`: `'draft' | 'published' | 'archived'`

### @signage/renderer

Content rendering engine used by both dashboard (preview) and player (playback):
- `ChannelRenderer` - Full channel with zones
- `ZoneRenderer` - Individual zone with playlist
- `PlaylistManager` - Zone app rotation
- `TransitionEngine` - Transition animations
- Per-type renderers: `ImageRenderer`, `VideoRenderer`, `WebRenderer`, `HtmlRenderer`, `ClockRenderer`, `WeatherRenderer`

### @signage/api-client

Typed HTTP client with endpoint factories:
- `client.ts` - Base ApiClient class (get, post, put, patch, delete, upload)
- `endpoints/` - auth, apps, channels, content, players, schedules, templates, analytics

## Feature Status

### Fully Built
- Auth flow (sign-in, sign-up with email verification, forgot password)
- Dashboard home (metrics, player map, activity feed)
- Content management (folders, S3 upload with progress, grid view, bulk delete)
- App gallery (CRUD, filter by status, preview on hover)
- Channel management (list, create wizard, zone editor, studio with design/preview modes)
- Player management (map view, registration, status tracking)
- Schedule management (timeline view, card view, CRUD)
- Analytics dashboard (KPIs, charts, device status)
- Profile editor
- Workspace + team management

### Partially Built / Mock Data
- Forgot password (no backend call)
- Social auth buttons (Google, Apple - UI only)
- Some analytics data (mock charts/trends)
- Team members list (hardcoded data)
- Settings password change (not connected)
- Billing page (static content)
- Player commands (UI exists, limited backend integration)

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | AWS Lambda URL | Backend API base URL |

## Important Notes

- The directory is named `cms-frontennd` (double 'n') - this is the actual folder name.
- Dashboard uses Tailwind **v4** (CSS-first config via `@theme` in globals.css). Player uses Tailwind **v3.4** (JS config).
- Path alias `@/*` maps to `src/*` in both apps.
- All pages are client components (`'use client'`) - no SSR/RSC usage currently.
- Auth redirects: `(auth)` routes redirect to `/home` if authenticated; `(dashboard)` routes redirect to `/sign-in` if not.
- React Query defaults: staleTime 60s, retry 1, no refetch on window focus.
- Zustand auth store persists to localStorage key `signage-auth` (excludes `isLoading`).
- Tokens stored in localStorage: `signage_access_token`, `signage_refresh_token`, `signage_id_token`.
- No Next.js middleware file exists - auth checking happens in layout components.
- The channel editor has two implementations: `/channels/[id]/studio` (primary) and `/channels/[id]/builder` (alternative).
