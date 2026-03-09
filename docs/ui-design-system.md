# SignageOS UI Design System
> Source-of-truth for all UI decisions. Reference this file before every component change.
> AUTO-MAINTAINED — This file is updated automatically whenever a UI change is made.
> Last updated: 2026-03-09 (Ocean Breeze theme — full application redesign)

---

## 1. BRAND IDENTITY

- **Product**: SignageOS — Digital Signage Platform
- **Theme Name**: Ocean Breeze — Sky-blue / cyan light theme
- **Personality**: Modern, minimalist, premium — soft sky-blue tints with ocean palette
- **Primary Accent**: Sky Blue `#0ea5e9` → Cyan `#06B6D4` gradient
- **Logo**: Sky-cyan gradient square with bold white "S", rounded-lg, beside "Studio" in deep ocean blue
- **Theme**: Light mode only (dark mode CSS preserved in `.dark` class for future toggle)

---

## 2. COLOR PALETTE

### Ocean Breeze Theme (primary application)

| Token | Hex | Usage |
|---|---|---|
| `--color-background` | `#f0f9ff` | Full page background (soft sky-blue) |
| `--color-surface` | `#ffffff` | Cards, elevated panels |
| `--color-surface-alt` | `#e0f2fe` | Input rest state, sidebar hover, alternate areas |
| `--color-surface-elevated` | `#ffffff` + shadow | Modal, dropdown backgrounds |
| `--color-surface-hover` | `#e0f2fe` | Hover state for surfaces |
| `--color-border` | `#bae6fd` | All borders, dividers |
| `--color-border-subtle` | `#e0f2fe` | Intra-card separators, very subtle |
| `--color-text-primary` | `#0c4a6e` | Headings, labels, key text (deep ocean blue) |
| `--color-text-secondary` | `#0369a1` | Body text, descriptions |
| `--color-text-muted` | `#6b7280` | Placeholders, captions, labels |
| `--color-primary` | `#0ea5e9` | CTAs, active nav, focus rings |
| `--color-primary-hover` | `#0284c7` | Hover state of primary |
| `--color-primary-light` | `rgba(14,165,233,0.08)` | Tinted backgrounds, active nav bg |
| `--color-secondary` | `#06B6D4` | Gradient endpoint, secondary accent (cyan) |
| `--color-secondary-hover` | `#0891B2` | Hover state of secondary |
| `--color-success` | `#10b981` | Success indicators |
| `--color-warning` | `#f59e0b` | Warning states |
| `--color-error` | `#ef4444` | Error messages, error borders |

### Accent Border
| Hex | Usage |
|---|---|
| `#7dd3fc` | Auth dot grid, hero accent borders |

---

## 3. TYPOGRAPHY

| Element | Font | Size | Weight | Notes |
|---|---|---|---|---|
| UI font | Inter | — | 400/500/600 | All UI text |
| Mono font | JetBrains Mono | — | 400 | Code, kbd shortcuts |
| Auth hero | Georgia serif | 2.8–3.5rem | 300 (light) | Left branding panel only |
| Page heading (h1) | Inter | clamp(1.5rem–2rem) | 600 | Letter-spacing −0.02em |
| Section heading (h2) | Inter | clamp(1.25–1.5rem) | 600 | |
| Card title | Inter | 0.875rem | 600 | |
| Body | Inter | 0.875rem | 400 | `#0369a1` |
| Caption | Inter | 0.75rem | 400 | `#6b7280` |
| Uppercase label | Inter | 0.625rem | 700 | `tracking-widest`, `#6b7280` |

---

## 4. SHADOWS & ELEVATION

| Level | CSS Value | Usage |
|---|---|---|
| `--shadow-xs` | `0 1px 2px rgba(14,165,233,0.06)` | Micro lift |
| `--shadow-subtle` | `0 1px 3px rgba(14,165,233,0.08), 0 1px 2px rgba(0,0,0,0.04)` | Cards at rest |
| `--shadow-medium` | `0 4px 8px -2px rgba(14,165,233,0.12), 0 2px 4px -1px rgba(0,0,0,0.05)` | Card hover, dropdowns |
| `--shadow-elevated` | `0 12px 24px -6px rgba(14,165,233,0.14), 0 4px 8px -2px rgba(0,0,0,0.06)` | Drawers, popovers |
| `--shadow-dialog` | `0 24px 48px -12px rgba(14,165,233,0.18), 0 8px 16px -4px rgba(0,0,0,0.06)` | Modal dialogs |

**Rule**: Shadows are blue-tinted for brand cohesion. Use `border: 1px solid #bae6fd` for flat separation.

---

## 5. RADIUS SYSTEM

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `6px` | Small badges, kbd |
| `--radius-md` | `10px` | Inputs, small cards |
| `--radius-lg` | `14px` | Cards, panels, nav items |
| `--radius-xl` | `20px` | Modals, auth form card |
| `--radius-2xl` | `20px` | Large decorative elements |

---

## 6. SPACING

4px base unit. Use multiples: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

---

## 7. COMPONENT SPECS

### Buttons

| Variant | Background | Text | Height | Radius | Hover |
|---|---|---|---|---|---|
| Primary | `#0ea5e9` | `#ffffff` | 48px | 8px | `bg: #0284c7`, `box-shadow: 0 4px 16px rgba(14,165,233,0.35)` |
| Ghost | transparent | `#0369a1` | 36px | 8px | `bg: #e0f2fe`, `color: #0c4a6e` |
| Outline | `#ffffff` | `#0c4a6e` | 36px | 8px | `bg: #e0f2fe` |
| Destructive | `#ef4444` | `#ffffff` | 36px | 8px | `bg: #dc2626` |

- **Micro-interaction**: `active:scale-[0.97]` on primary button
- **Spinner on primary**: `border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff`
- **Disabled**: `opacity-60`

### Inputs

```
Background (rest):  #e0f2fe
Background (focus): #ffffff
Border (rest):      1px solid #bae6fd
Border (focus):     1px solid #0ea5e9
Focus ring:         box-shadow: 0 0 0 3px rgba(14,165,233,0.15)
Height:             48px (h-12)
Radius:             8px (rounded-lg)
Text:               #0c4a6e
Placeholder:        #6b7280
Icon:               #6b7280
```

### Cards

```
Background:         #ffffff
Border:             1px solid #bae6fd
Shadow (rest):      0 1px 3px rgba(14,165,233,0.08)
Shadow (hover):     0 4px 12px rgba(14,165,233,0.12), 0 1px 4px rgba(0,0,0,0.04)
Hover transform:    translateY(-2px)
Radius:             12px (rounded-xl)
Transition:         all 200ms ease
```

### Modals / Dialogs

```
Background:         #ffffff
Border:             1px solid #bae6fd
Shadow:             var(--shadow-dialog)
Radius:             16px (rounded-2xl)
Overlay:            rgba(12,74,110,0.3) backdrop-blur(4px)
Close button:       #e0f2fe bg, #bae6fd border, #6b7280 icon
Close button hover: #e0f2fe bg, #0c4a6e icon
```

### Drawers

```
Background:         #ffffff
Border left:        1px solid #bae6fd
Shadow:             -8px 0 32px rgba(14,165,233,0.10)
Header border:      1px solid #e0f2fe
```

### Sidebar

```
Background:     #ffffff
Border right:   1px solid #bae6fd (via box-shadow: 1px 0 0 0 #bae6fd)
Logo bg:        linear-gradient(135deg, #0ea5e9, #06b6d4)
Logo text:      #ffffff
Brand name:     #0c4a6e (bold)
Plan label:     #6b7280

Nav item (rest):    bg: transparent, color: #0369a1
Nav item (hover):   bg: #e0f2fe, color: #0c4a6e
Nav item (active):  bg: rgba(14,165,233,0.08), color: #0ea5e9
Active indicator:   left 2px bar, gradient(#0ea5e9 → #06b6d4)

User avatar:        gradient(#0ea5e9 → #06b6d4), white initials
User name:          #0c4a6e
User email:         #6b7280
```

### Header

```
Background:         #ffffff
Border bottom:      1px solid #bae6fd
Shadow:             0 1px 3px rgba(14,165,233,0.06)
Height:             56px (h-14)

Search (rest):      bg: #e0f2fe, border: #bae6fd, icon: #6b7280
Search (focus):     border: #0ea5e9, ring: rgba(14,165,233,0.12)
KBD:                bg: #e0f2fe, text: #6b7280
Bell icon:          color: #0369a1
Notification dot:   #0ea5e9
Avatar:             gradient(#0ea5e9 → #06b6d4)
Dropdown bg:        #ffffff, border: #bae6fd, shadow: var(--shadow-medium)
Dropdown separator: #e0f2fe
```

### Command Palette

```
Dialog bg:              #ffffff (via dialog.tsx)
Search row border:      1px solid #bae6fd
Search text:            #0c4a6e
Search icon:            #6b7280
KBD bg:                 #e0f2fe, border: #bae6fd, text: #0369a1
Category label:         #6b7280, uppercase, tracking-wide
Command (rest):         bg: transparent, text: #0369a1
Command (active):       bg: rgba(14,165,233,0.06), border-left: 2px #0ea5e9, text: #0c4a6e, bold
Footer border:          1px solid #bae6fd
```

### Auth Form Card

```
Container bg:           #f0f9ff (page)
Dot grid overlay:       radial-gradient(#7dd3fc 1px, transparent 1px), 28px spacing, opacity 0.4
Left panel gradient:    rgba(14,165,233,0.06) → rgba(6,182,212,0.03)
Form card:              #ffffff, border: #bae6fd, shadow: 0 8px 32px rgba(14,165,233,0.08)
Logo:                   gradient(#0ea5e9 → #06b6d4), white S
Heading:                Georgia serif, #0c4a6e
Gradient accent text:   linear-gradient(135deg, #0ea5e9, #06B6D4) with background-clip: text
Testimonial card:       rgba(255,255,255,0.72) + backdrop-blur(16px)
```

---

## 8. ANIMATION SYSTEM

### Timing Functions
```
--ease-default: cubic-bezier(0.4, 0, 0.2, 1)   // standard
--ease-enter:   cubic-bezier(0, 0, 0.2, 1)       // entering elements
--ease-exit:    cubic-bezier(0.4, 0, 1, 1)       // exiting elements
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1) // bouncy scale-in
```

### Duration Scale
```
fast:   150ms  → hover color changes, button active
normal: 200ms  → hover bg, border, shadow transitions
medium: 300ms  → slide-in, expand/collapse
slow:   400ms  → page enter, staggered reveals
```

### CSS Utility Classes
```
.animate-fade-in       → fade-in 300ms ease-enter
.animate-fade-in-up    → fade up 12px + fade, 350ms
.animate-fade-in-down  → fade down 8px + fade, 250ms
.animate-scale-in      → scale 0.95→1 + fade, 250ms spring
.animate-slide-right   → slide from right 16px, 300ms
.animate-aurora-pulse  → blue-tinted pulse ring, 2s infinite
.animate-float         → gentle float up/down, 3s infinite
```

### Motion Patterns (Framer Motion)
```
Page sections:      initial {opacity:0, y:-12} → animate {opacity:1, y:0}, 350ms
Stagger delay:      +80ms per section
List items:         initial {opacity:0, x:20} → animate {opacity:1, x:0}
Sidebar labels:     initial {opacity:0, width:0} → animate {opacity:1, width:'auto'}
Search bar expand:  200→260px on focus, 250ms easeOut
```

### Micro-interactions
- Buttons: `active:scale-[0.97]` on primary/destructive
- Cards: `hover:translateY(-2px)` + shadow upgrade
- Nav items: `transition: all 200ms ease`
- Input focus: border color + subtle ring
- Avatar trigger: `ring-2 ring-[#bae6fd]` on hover

---

## 9. GRADIENT SYSTEM

| Name | Value | Usage |
|---|---|---|
| Brand gradient | `linear-gradient(135deg, #0ea5e9, #06b6d4)` | Logo bg, CTA button, avatar, indicators |
| Text gradient | Same + `background-clip: text` | Hero headings, dashboard greeting name |
| Hero bg | `linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)` | Dashboard/page hero banners |
| Auth left panel | `rgba(14,165,233,0.06) → rgba(6,182,212,0.03)` | Auth branding overlay |
| Page radial glow | `radial-gradient(circle, rgba(14,165,233,0.07), transparent 70%)` | Decorative background glow |
| Ocean vibrant | `linear-gradient(135deg, #e0f2fe 0%, #bae6fd 40%, #a5f3fc 100%)` | Special sections |

---

## 10. SEMANTIC STATES

| State | Color | Background | Border |
|---|---|---|---|
| Success | `#10b981` | `rgba(16,185,129,0.08)` | `rgba(16,185,129,0.16)` |
| Warning | `#f59e0b` | `rgba(245,158,11,0.08)` | `rgba(245,158,11,0.16)` |
| Error | `#ef4444` | `rgba(239,68,68,0.06)` | `rgba(239,68,68,0.16)` |
| Info (primary) | `#0ea5e9` | `rgba(14,165,233,0.08)` | `rgba(14,165,233,0.16)` |
| Online dot | `#10b981` | — | box-shadow: `0 0 6px rgba(16,185,129,0.5)` |
| Offline dot | `#ef4444` | — | — |
| Pending dot | `#f59e0b` | — | — |

---

## 11. ACTIVITY FEED — TYPE COLORS

| Type | Color | Notes |
|---|---|---|
| `player` | `#10b981` | Green |
| `channel` | `#0ea5e9` | Sky blue (primary) |
| `schedule` | `#f59e0b` | Amber |
| `content` | `#06B6D4` | Cyan (secondary) |

---

## 12. METRIC CARD — DOT COLORS

| Metric | Color | Notes |
|---|---|---|
| Players | `#0ea5e9` | Sky blue — primary brand |
| Channels | `#06B6D4` | Cyan — secondary brand |
| Content | `#10b981` | Green |
| Storage (normal) | `#6b7280` | Muted gray |
| Storage (>80%) | `#ef4444` | Red alert |

---

## 13. GLASSMORPHISM

```css
/* Light glass card (testimonials, overlays) */
background: rgba(255, 255, 255, 0.72);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.6);
box-shadow: 0 4px 16px rgba(0,0,0,0.06);
```

---

## 14. DASHBOARD PAGE SPECIFICS

### Recharts (analytics/page.tsx)
```
Area stroke:          #0ea5e9
Area fill gradient:   rgba(14,165,233,1) 35% → 2%
CartesianGrid stroke: rgba(14,165,233,0.06)
Line stroke (unique): #06B6D4 (cyan, dashed)
Axis tick fill:       #0369a1
ChartTooltip bg:      #ffffff
ChartTooltip border:  #bae6fd
```

### Gantt Timeline (schedules/page.tsx)
```
Container bg:         #f0f9ff
Container border:     #bae6fd
Grid lines:           rgba(186,230,253,0.7)
Current time bar:     #0ea5e9
Today row tint:       rgba(14,165,233,0.06)
```

### Schedule Color Palette
```
Slot 0 (amber): bg rgba(245,166,36,0.15), text #D97706
Slot 1 (blue):  bg rgba(29,78,216,0.10),  text #1D4ED8
Slot 2 (green): bg rgba(6,95,70,0.12),    text #065F46
Slot 3 (violet):bg rgba(109,40,217,0.12), text #6D28D9
Slot 4 (rose):  bg rgba(190,18,60,0.10),  text #BE123C
Slot 5 (teal):  bg rgba(15,118,110,0.12), text #0F766E
```

### Settings
```
INPUT_STYLE:     bg #e0f2fe, border #bae6fd, color #0c4a6e
SECTION_CARD:    bg #ffffff, border #bae6fd
SectionHeader:   icon-bg rgba(14,165,233,0.10), icon-color #0ea5e9
Toggle (on):     bg #0ea5e9, thumb #ffffff
Toggle (off):    bg #bae6fd, thumb #6b7280
```

### KPI Cards (analytics)
```
Views/Players:  valueColor #0ea5e9, iconBg rgba(14,165,233,0.12)
Dwell Time:     valueColor #34D399, iconBg rgba(52,211,153,0.15)
Errors:         valueColor #F87171, iconBg rgba(248,113,113,0.15)
```

---

## 14b. DARK MODE (PRESERVED)

Dark mode CSS variables are kept in the `.dark` class in `globals.css` for potential future dark-mode toggle. The primary accent in dark mode is `#0ea5e9` (sky blue). To activate: add `dark` class to `<html>` element.

---

## 15. KEY FILES

| File | Purpose |
|---|---|
| `apps/dashboard/src/app/globals.css` | Design tokens (CSS vars), animations, utility classes |
| `apps/dashboard/src/app/layout.tsx` | Root html element (no dark class) |
| `apps/dashboard/src/app/(dashboard)/layout.tsx` | Dashboard shell (sidebar + header) |
| `apps/dashboard/src/app/(auth)/layout.tsx` | Auth split-screen layout |
| `apps/dashboard/src/components/layout/sidebar.tsx` | Main navigation sidebar |
| `apps/dashboard/src/components/layout/header.tsx` | Top header with search + avatar |
| `apps/dashboard/src/components/dashboard/MetricsStrip.tsx` | KPI metric cards |
| `apps/dashboard/src/components/dashboard/ActivityFeed.tsx` | Activity timeline |
| `apps/dashboard/src/components/ui/dialog.tsx` | Modal dialog (Radix) |
| `apps/dashboard/src/components/ui/drawer.tsx` | Side drawer panel |
| `apps/dashboard/src/components/command-palette/CommandPalette.tsx` | Cmd+K command palette |

---

## 16. CHANGE LOG

| Date | Change | Files |
|---|---|---|
| 2026-03-09 | **Fixed header layout** — Restructured dashboard layout: outer wrapper `h-screen flex flex-col overflow-hidden`, main content `flex-1 overflow-y-auto`. Header no longer `sticky` — stays fixed at top naturally because only `<main>` scrolls. Sidebar logo `h-16` → `h-14` to match header. Pages using `calc(100vh - 3.5rem)` updated to `height: 100%`. | layout.tsx, header.tsx, sidebar.tsx, players/page, apps/create/page |
| 2026-03-09 | **Compact hero banners** — Reduced hero/header section size across all dashboard pages. Title: `text-lg/xl` (was `text-2xl/4xl`). Label: `text-[10px]` (was `text-xs`). Description: `text-xs` (was `text-sm`). Stat cards: smaller padding (`px-3 py-2`), smaller icons (`w-7 h-7`), smaller values (`text-sm`). Responsive-hero padding reduced to `clamp(0.625rem,1.5vw,0.875rem)`. | globals.css, home/page, content/page, channels/page, schedules/page, players/page, analytics/page |
| 2026-03-09 | **Ocean Breeze complete redesign** — Replaced Aurora Mist violet theme with Ocean Breeze sky-blue theme across entire application. New palette: Background `#f0f9ff` (soft sky), Primary `#0ea5e9` (sky blue), Secondary `#06B6D4` (cyan), Brand gradient `linear-gradient(135deg, #0ea5e9, #06b6d4)`, Border `#bae6fd`, Text `#0c4a6e`. Blue-tinted shadows. Updated globals.css, all auth pages, sidebar, header, all dashboard pages, all modals/drawers/components, command palette. | All UI files |
| 2026-03-08 | Aurora Mist complete redesign — violet-cyan theme | All UI files |
| 2026-03-01 | Dashboard light studio theme conversion (partial) | Multiple |
| 2026-02-28 | Add player browser compatibility for Chrome 38+ Smart TVs | player app |
