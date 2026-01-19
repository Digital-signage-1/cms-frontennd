# Dynamic Breadcrumb System

## Overview
The breadcrumb system automatically generates navigation breadcrumbs for every page based on the URL path, with the ability to override with custom breadcrumbs when needed.

## How It Works

### 1. Automatic Breadcrumb Generation
Every page automatically gets breadcrumbs based on its URL:

**Examples:**
- `/home` → `Dashboard`
- `/apps` → `Apps`
- `/apps/create` → `Apps > Create New`
- `/apps/[id]/edit` → `Apps > Details`
- `/content` → `Content Library`
- `/channels` → `Channels`
- `/schedules` → `Schedules`
- `/analytics` → `Analytics`
- `/players` → `Players`
- `/settings` → `Settings`
- `/profile` → `Profile`

### 2. Manual Override (for dynamic content)
Pages can override the automatic breadcrumbs to show specific names:

```tsx
import { useBreadcrumb } from '@/contexts/breadcrumb-context'

export default function EditAppPage() {
  const { setBreadcrumbItems } = useBreadcrumb()
  const app = // ... fetch app data
  
  useEffect(() => {
    if (app) {
      setBreadcrumbItems([
        { label: 'Apps', href: '/apps' },
        { label: app.name } // Custom app name instead of "Details"
      ])
    }
  }, [app, setBreadcrumbItems])
}
```

### 3. Clearing Manual Breadcrumbs
To revert to automatic breadcrumbs:

```tsx
const { clearBreadcrumbs } = useBreadcrumb()

useEffect(() => {
  return () => clearBreadcrumbs() // Reset on unmount
}, [clearBreadcrumbs])
```

## Architecture

### Components & Hooks

**`useAutoBreadcrumb`** - Generates breadcrumbs from URL
- Reads current pathname
- Maps route segments to human-readable labels
- Handles UUID segments (shows as "Details")
- Returns array of breadcrumb items

**`BreadcrumbContext`** - Manages breadcrumb state
- Stores manual breadcrumbs (if set)
- Falls back to automatic breadcrumbs
- Provides `setBreadcrumbItems()` and `clearBreadcrumbs()`

**`Header`** - Displays breadcrumbs
- Receives breadcrumb items from context
- Shows breadcrumbs when available
- Falls back to search bar when no breadcrumbs

### Flow Diagram

```
URL Change
    ↓
useAutoBreadcrumb() → Generates automatic breadcrumbs
    ↓
BreadcrumbContext → Stores in state
    ↓                    ↓
    ↓              Page calls setBreadcrumbItems()? → Manual override
    ↓                    ↓
    └────────────────────┘
             ↓
      Header renders breadcrumb
```

## Route Label Mapping

Located in `hooks/useAutoBreadcrumb.ts`:

```tsx
const routeLabels: Record<string, string> = {
  'home': 'Dashboard',
  'apps': 'Apps',
  'create': 'Create New',
  'edit': 'Edit',
  'content': 'Content Library',
  'channels': 'Channels',
  'schedules': 'Schedules',
  'analytics': 'Analytics',
  'players': 'Players',
  'settings': 'Settings',
  'profile': 'Profile',
  'workspace': 'Workspace',
  // Add more as needed
}
```

## Special Cases

### UUID/ID Segments
UUIDs in URLs are automatically detected and labeled as "Details":
- `/apps/123e4567-e89b-12d3-a456-426614174000/edit` 
  → `Apps > Details`

### Nested Routes
Multiple segments are automatically chained:
- `/apps/create` → `Apps > Create New`
- `/channels/builder` → `Channels > Builder`

### Dynamic Content Names
Use manual override for showing actual names:
```tsx
// Instead of: Apps > Details
// Show: Apps > "Weather Widget"
setBreadcrumbItems([
  { label: 'Apps', href: '/apps' },
  { label: weather.name }
])
```

## Adding New Routes

### For Static Routes
Just add to the `routeLabels` map:

```tsx
const routeLabels: Record<string, string> = {
  // ... existing
  'my-new-page': 'My New Page',
}
```

### For Dynamic Routes
Use manual override in the page component:

```tsx
useEffect(() => {
  if (data) {
    setBreadcrumbItems([
      { label: 'Parent', href: '/parent' },
      { label: data.name }
    ])
  }
}, [data, setBreadcrumbItems])
```

## Best Practices

1. **Use automatic breadcrumbs by default** - Most pages don't need custom breadcrumbs

2. **Override for dynamic content** - Use `setBreadcrumbItems()` when showing specific item names

3. **Keep breadcrumbs short** - Maximum 3-4 levels for readability

4. **Make intermediate breadcrumbs clickable** - All items except the last should have `href`

5. **Clean up on unmount** - Call `clearBreadcrumbs()` if you set manual breadcrumbs

## Examples

### Basic Page (Automatic)
```tsx
// No breadcrumb code needed!
export default function AnalyticsPage() {
  return <div>Analytics content</div>
}
// Automatically shows: "Analytics"
```

### Detail Page (Manual Override)
```tsx
export default function ChannelDetailsPage() {
  const { setBreadcrumbItems } = useBreadcrumb()
  const { data: channel } = useChannel(channelId)
  
  useEffect(() => {
    if (channel) {
      setBreadcrumbItems([
        { label: 'Channels', href: '/channels' },
        { label: channel.name }
      ])
    }
  }, [channel, setBreadcrumbItems])
  
  return <div>Channel details</div>
}
// Shows: "Channels > Marketing Display"
```

### Nested Creation Flow
```tsx
export default function CreateSchedulePage() {
  const { setBreadcrumbItems } = useBreadcrumb()
  
  useEffect(() => {
    setBreadcrumbItems([
      { label: 'Schedules', href: '/schedules' },
      { label: 'Create New' }
    ])
  }, [setBreadcrumbItems])
  
  return <div>Create schedule form</div>
}
// Shows: "Schedules > Create New"
```

## Files

- ✅ `hooks/useAutoBreadcrumb.ts` - Automatic breadcrumb generation
- ✅ `contexts/breadcrumb-context.tsx` - Breadcrumb state management
- ✅ `components/layout/header.tsx` - Breadcrumb display
- ✅ `components/ui/breadcrumb.tsx` - Breadcrumb component

## Benefits

✅ **Zero configuration** - Works automatically for all pages
✅ **Flexible** - Easy to override when needed
✅ **Consistent** - Same behavior across entire app
✅ **Maintainable** - Single source of truth for labels
✅ **User-friendly** - Always shows where you are
✅ **Accessible** - Proper navigation landmarks

The breadcrumb system now works dynamically for every page in the application!
