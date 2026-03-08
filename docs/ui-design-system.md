# SignageOS UI Design System
> Source-of-truth for all UI decisions. Reference this file before every component change.
> ⚠️ AUTO-MAINTAINED — This file is updated automatically whenever a UI change is made.
> Last updated: 2026-03-08 (Broadcast Cyan theme applied to dashboard inner pages)

---

## 1. BRAND IDENTITY

- **Product**: SignageOS — Digital Signage Platform
- **Personality**: Light, clean, modern — "Studio Light"
- **Accent**: Indigo/Violet gradient (`#6366F1` → `#7C3AED`) — primary brand color
- **Logo**: Indigo-violet gradient square with bold white "S", rounded-lg, beside "Studio" in dark
- **Theme**: Light mode only (dark mode CSS preserved in `.dark` class for future toggle)

---

## 2. COLOR PALETTE

### Studio Light Theme (primary application)

| Token | Hex | Usage |
|---|---|---|
| `--color-background` | `#F8F7F5` | Full page background (warm off-white) |
| `--color-surface` | `#FFFFFF` | Cards, inputs, elevated panels |
| `--color-surface-alt` | `#F3F1EE` | Sidebar, alternate rows, input rest state |
| `--color-surface-elevated` | `#FFFFFF` + shadow | Modal, dropdown backgrounds |
| `--color-surface-hover` | `#EEECE8` | Hover state for surfaces |
| `--color-border` | `#E5E2DC` | All borders, dividers |
| `--color-border-subtle` | `#F0EDE7` | Intra-card separators, very subtle |
| `--color-text-primary` | `#1A1917` | Headings, labels, key text |
| `--color-text-secondary` | `#57534E` | Body text, descriptions |
| `--color-text-muted` | `#A8A29E` | Placeholders, captions, labels |
| `--color-primary` | `#6366F1` | CTAs, active nav, focus rings |
| `--color-primary-hover` | `#4F46E5` | Hover state of primary |
| `--color-primary-light` | `rgba(99,102,241,0.08)` | Tinted backgrounds, active nav bg |
| `--color-secondary` | `#7C3AED` | Gradient endpoint, secondary accent |
| `--color-success` | `#059669` | Success indicators |
| `--color-warning` | `#D97706` | Warning states |
| `--color-error` | `#DC2626` | Error messages, error borders |

### Supplementary warm grays (used in auth/sidebar text)
| Hex | Usage |
|---|---|
| `#78716C` | Nav inactive text, secondary labels |
| `#A8A29E` | Muted / placeholder text |
| `#57534E` | Body text variant |

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
| Body | Inter | 0.875rem | 400 | `#57534E` |
| Caption | Inter | 0.75rem | 400 | `#A8A29E` |
| Uppercase label | Inter | 0.625rem | 700 | `tracking-widest`, `#A8A29E` |

---

## 4. SHADOWS & ELEVATION

| Level | CSS Value | Usage |
|---|---|---|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.04)` | Micro lift |
| `--shadow-subtle` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | Cards at rest |
| `--shadow-medium` | `0 4px 8px -2px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.05)` | Card hover, dropdowns |
| `--shadow-elevated` | `0 12px 24px -6px rgba(0,0,0,0.10), 0 4px 8px -2px rgba(0,0,0,0.05)` | Drawers, popovers |
| `--shadow-dialog` | `0 24px 48px -12px rgba(0,0,0,0.14), 0 8px 16px -4px rgba(0,0,0,0.06)` | Modal dialogs |

**Rule**: Prefer box-shadow over borders for elevation. Use `border: 1px solid #E5E2DC` for flat separation (sidebar, card walls).

---

## 5. RADIUS SYSTEM

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `6px` | Small badges, kbd |
| `--radius-md` | `8px` | Inputs, small cards |
| `--radius-lg` | `12px` | Cards, panels, nav items |
| `--radius-xl` | `16px` | Modals, auth form card |

---

## 6. SPACING

4px base unit. Use multiples: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

---

## 7. COMPONENT SPECS

### Buttons

| Variant | Background | Text | Height | Radius | Hover |
|---|---|---|---|---|---|
| Primary | `linear-gradient(135deg, #6366F1, #7C3AED)` | `#FFFFFF` | 48px | 8px | `box-shadow: 0 4px 14px rgba(99,102,241,0.35)` |
| Ghost | transparent | `#78716C` | 36px | 8px | `bg: #F3F1EE`, `color: #1A1917` |
| Outline | `#FFFFFF` | `#1A1917` | 36px | 8px | `bg: #F3F1EE` |
| Destructive | `#DC2626` | `#FFFFFF` | 36px | 8px | `bg: #B91C1C` |

- **Micro-interaction**: `active:scale-[0.97]` on primary button
- **Spinner on primary**: `border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff`
- **Disabled**: `opacity-60`

### Inputs

```
Background (rest):  #F3F1EE
Background (focus): #FFFFFF
Border (rest):      1px solid #E5E2DC
Border (focus):     1px solid #6366F1
Focus ring:         box-shadow: 0 0 0 3px rgba(99,102,241,0.12)
Height:             48px (h-12)
Radius:             8px (rounded-lg)
Text:               #1A1917
Placeholder:        #A8A29E
Icon:               #A8A29E
```

### Cards

```
Background:         #FFFFFF
Border:             1px solid #E5E2DC
Shadow (rest):      0 1px 3px rgba(0,0,0,0.05)
Shadow (hover):     0 4px 12px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)
Hover transform:    translateY(-1px)
Radius:             12px (rounded-xl)
Transition:         all 200ms ease
```

### Modals / Dialogs

```
Background:         #FFFFFF
Border:             1px solid #E5E2DC
Shadow:             var(--shadow-dialog)
Radius:             16px (rounded-2xl)
Overlay:            bg-black/65 backdrop-blur-[2px]
Close button:       #F3F1EE bg, #E5E2DC border, #78716C icon
Close button hover: #EEECE8 bg, #1A1917 icon
```

### Drawers

```
Background:         #FFFFFF
Border left:        1px solid #E5E2DC
Shadow:             -8px 0 32px rgba(0,0,0,0.08)
Header border:      1px solid #F0EDE7
```

### Sidebar

```
Background:     #FFFFFF
Border right:   1px solid #E5E2DC (via box-shadow: 1px 0 0 0 #E5E2DC)
Logo bg:        linear-gradient(135deg, #6366F1, #7C3AED)
Logo text:      #FFFFFF
Brand name:     #1A1917 (bold)
Plan label:     #A8A29E

Nav item (rest):    bg: transparent, color: #78716C
Nav item (hover):   bg: #F3F1EE, color: #1A1917
Nav item (active):  bg: rgba(99,102,241,0.08), color: #6366F1
Active indicator:   left 2px bar, gradient(#6366F1 → #7C3AED)

User avatar:        gradient(#6366F1 → #7C3AED), white initials
User name:          #1A1917
User email:         #A8A29E
```

### Header

```
Background:         #FFFFFF
Border bottom:      1px solid #E5E2DC
Shadow:             0 1px 3px rgba(0,0,0,0.04)
Height:             56px (h-14)

Search (rest):      bg: #F3F1EE, border: #E5E2DC, icon: #A8A29E
Search (focus):     border: #6366F1, ring: rgba(99,102,241,0.12)
KBD:                bg: #E5E2DC, text: #A8A29E
Bell icon:          color: #78716C
Notification dot:   #6366F1
Avatar:             gradient(#6366F1 → #7C3AED)
Dropdown bg:        #FFFFFF, border: #E5E2DC, shadow: var(--shadow-medium)
Dropdown separator: #F0EDE7
```

### Command Palette

```
Dialog bg:              #FFFFFF (via dialog.tsx)
Search row border:      1px solid #E5E2DC
Search text:            #1A1917
Search icon:            #A8A29E
KBD bg:                 #F3F1EE, border: #E5E2DC, text: #78716C
Category label:         #A8A29E, uppercase, tracking-wide
Command (rest):         bg: transparent, text: #57534E
Command (active):       bg: rgba(99,102,241,0.06), border-left: 2px #6366F1, text: #1A1917, bold
Footer border:          1px solid #E5E2DC
```

### Auth Form Card

```
Container bg:           #F8F7F5 (page)
Dot grid overlay:       radial-gradient(#D1C8C0 1px, transparent 1px), 28px spacing, opacity 0.4
Left panel gradient:    rgba(99,102,241,0.06) → rgba(124,58,237,0.01)
Form card:              #FFFFFF, border: #E5E2DC, shadow: 0 8px 32px rgba(0,0,0,0.08)
Logo:                   gradient(#6366F1 → #7C3AED), white S
Heading:                Georgia serif, #1A1917
Gradient accent text:   linear-gradient(135deg, #6366F1, #7C3AED) with background-clip: text
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
- Cards: `hover:translateY(-1px)` + shadow upgrade
- Nav items: `transition: all 200ms ease`
- Input focus: border color + subtle ring
- Avatar trigger: `ring-2 ring-[#E5E2DC]` on hover

---

## 9. GRADIENT SYSTEM

| Name | Value | Usage |
|---|---|---|
| Brand gradient | `linear-gradient(135deg, #6366F1, #7C3AED)` | Logo bg, CTA button, avatar, indicators |
| Text gradient | Same + `background-clip: text` | Hero headings, dashboard greeting name |
| Hero bg | `linear-gradient(135deg, #EEF2FF, #F5F3FF, #EDE9FE)` | Dashboard hero banner |
| Auth left panel | `rgba(99,102,241,0.06) → rgba(124,58,237,0.01)` | Auth branding overlay |
| Page radial glow | `radial-gradient(circle, rgba(99,102,241,0.07), transparent 70%)` | Decorative background glow |

---

## 10. SEMANTIC STATES

| State | Color | Background | Border |
|---|---|---|---|
| Success | `#059669` | `rgba(5,150,105,0.08)` | `rgba(5,150,105,0.16)` |
| Warning | `#D97706` | `rgba(217,119,6,0.08)` | `rgba(217,119,6,0.16)` |
| Error | `#DC2626` | `rgba(220,38,38,0.06)` | `rgba(220,38,38,0.16)` |
| Info (primary) | `#6366F1` | `rgba(99,102,241,0.08)` | `rgba(99,102,241,0.16)` |
| Online dot | `#059669` | — | box-shadow: `0 0 6px rgba(5,150,105,0.5)` |
| Offline dot | `#DC2626` | — | — |
| Pending dot | `#D97706` | — | — |

---

## 11. ACTIVITY FEED — TYPE COLORS

| Type | Color | Notes |
|---|---|---|
| `player` | `#059669` | Green |
| `channel` | `#6366F1` | Indigo |
| `schedule` | `#D97706` | Amber |
| `content` | `#7C3AED` | Violet |

---

## 12. METRIC CARD — DOT COLORS

| Metric | Color | Notes |
|---|---|---|
| Players | `#6366F1` | Indigo — primary brand |
| Channels | `#7C3AED` | Violet — secondary brand |
| Content | `#059669` | Green |
| Storage (normal) | `#A8A29E` | Muted gray |
| Storage (>80%) | `#DC2626` | Red alert |

---

## 13. GLASSMORPHISM

```css
/* Light glass card (testimonials, overlays) */
background: rgba(255, 255, 255, 0.72);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.9);
box-shadow: 0 4px 16px rgba(0,0,0,0.06);
```

---

## 14. BROADCAST CYAN THEME — DASHBOARD INNER PAGES

Applied to: `schedules/page.tsx`, `apps/page.tsx`, `settings/page.tsx`, `analytics/page.tsx`

### Color Mapping (Broadcast Cyan)

| Role | Token | Hex |
|---|---|---|
| Page background | `--bc-bg` | `#F0F9FF` |
| Card / surface background | `--bc-surface` | `#FFFFFF` |
| Alt background (hero/icon areas) | `--bc-surface-alt` | `#EFF8FF` |
| Input background | `--bc-input-bg` | `#E8F4FB` |
| Hover / tinted surface | `--bc-tint` | `#E0F2FE` |
| Border (primary) | `--bc-border` | `#BAE6FD` |
| Primary CTA / accent | `--bc-primary` | `#0891B2` |
| Primary CTA text | — | `#FFFFFF` |
| Text primary | `--bc-text-primary` | `#0C1A2E` |
| Text secondary | `--bc-text-secondary` | `#334155` |
| Text muted / icons | `--bc-text-muted` | `#94A3B8` |
| Stat card overlay bg | — | `rgba(255,255,255,0.75)` |
| Stat card border overlay | — | `rgba(8,145,178,0.07)` |
| Icon bg tint | — | `rgba(8,145,178,0.08)` |
| Active nav / sidebar accent | — | `rgba(8,145,178,0.08)` bg + `#0891B2` border-left |
| Grid overlay | — | `rgba(8,145,178,0.06)` |

### Hero Banner Gradient
```
linear-gradient(135deg, #EFF8FF 0%, #E0F2FE 50%, #BAE6FD 100%)
Border: 1px solid #BAE6FD
Grid overlay: rgba(8,145,178,0.06) lines
```

### Recharts (analytics/page.tsx)
```
Area stroke:          #0891B2
Area fill gradient:   rgba(8,145,178,1) 35% → 2% (viewsAreaGrad)
CartesianGrid stroke: rgba(8,145,178,0.06)
Line stroke (unique): #0284C7 (sky blue, dashed)
Axis tick fill:       #334155
ChartTooltip bg:      #FFFFFF
ChartTooltip border:  #BAE6FD
ChartTooltip label:   #334155
```

### Gantt Timeline (schedules/page.tsx)
```
Container bg:         #F0F9FF
Container border:     #BAE6FD
Header bg:            #F0F9FF
Header border:        #BAE6FD
Grid lines:           rgba(186,230,253,0.7)
Current time bar:     #0891B2
Today row tint:       rgba(8,145,178,0.06)
Hour label active:    #0891B2
Day label active:     #0891B2
```

### PALETTE (schedules — Broadcast Cyan readable on light bg)
```
Slot 0 (amber): bg rgba(245,166,36,0.15),  text #D97706
Slot 1 (blue):  bg rgba(29,78,216,0.10),   text #1D4ED8
Slot 2 (green): bg rgba(6,95,70,0.12),     text #065F46
Slot 3 (violet):bg rgba(109,40,217,0.12),  text #6D28D9
Slot 4 (rose):  bg rgba(190,18,60,0.10),   text #BE123C
Slot 5 (teal):  bg rgba(15,118,110,0.12),  text #0F766E
```

### Settings (settings/page.tsx)
```
INPUT_STYLE:     bg #E8F4FB, border #BAE6FD, color #0C1A2E
SECTION_CARD:    bg #FFFFFF, border #BAE6FD
SectionHeader:   icon-bg rgba(8,145,178,0.10), icon-color #0891B2
Toggle (on):     bg #0891B2, thumb #FFFFFF
Toggle (off):    bg #BAE6FD, thumb #94A3B8
Save button:     bg #0891B2, color #FFFFFF
Focus state:     borderColor #0891B2
```

### KPI Cards (analytics/page.tsx)
```
Total Content Views: valueColor #0891B2, iconBg rgba(8,145,178,0.12)
Active Players:      valueColor #0891B2, iconBg rgba(8,145,178,0.12)
Avg. Dwell Time:     valueColor #34D399, iconBg rgba(52,211,153,0.15)
Total Errors:        valueColor #F87171, iconBg rgba(248,113,113,0.15)
```

---

## 14b. DARK MODE (PRESERVED)

Dark mode CSS variables are kept in the `.dark` class in `globals.css` for potential future dark-mode toggle. The primary accent in dark mode is `#6366F1` (same indigo, not amber). To activate: add `dark` class to `<html>` element.

**Files that still need manual dark-mode audit if dark mode is re-enabled:**
- All dashboard page files (hardcoded light styles)
- Sidebar, header, auth pages (fully converted to light)

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
| `apps/dashboard/src/components/command-palette/CommandPalette.tsx` | ⌘K command palette |

---

## 16. CHANGE LOG

| Date | Change | Files |
|---|---|---|
| 2026-03-08 | **Broadcast Cyan theme** — converted `schedules/page.tsx`, `apps/page.tsx`, `settings/page.tsx`, `analytics/page.tsx` from dark Control Room palette to Broadcast Cyan light palette. New primary: `#0891B2` (cyan). Page bg: `#F0F9FF`. Card bg: `#FFFFFF`. Border: `#BAE6FD`. Text primary: `#0C1A2E`. Text secondary: `#334155`. Hero gradient: EFF8FF → E0F2FE → BAE6FD. Recharts updated to cyan. Gantt updated to cyan. PALETTE updated to dark-text-on-light-bg colors. Section 14 of design system updated with full spec. | `schedules/page.tsx`, `apps/page.tsx`, `settings/page.tsx`, `analytics/page.tsx`, `ui-design-system.md` |
| 2026-03-08 | **Complete light theme overhaul** — replaced dark (Control Room Elegance) with light (Studio Light). New primary accent: Indigo `#6366F1`. New backgrounds: warm off-white `#F8F7F5`. Added shadow elevation system, gradient system, animation utilities. Converted all auth pages, sidebar, header, home page, modals, command palette to light theme. | `globals.css`, `layout.tsx`, `(dashboard)/layout.tsx`, `(auth)/layout.tsx`, `sidebar.tsx`, `header.tsx`, `MetricsStrip.tsx`, `ActivityFeed.tsx`, `home/page.tsx`, `dialog.tsx`, `drawer.tsx`, `CommandPalette.tsx`, `sign-in/page.tsx`, `sign-up/page.tsx`, `forgot-password/page.tsx`, `ui-design-system.md` |
| 2026-03-01 | Dashboard light studio theme conversion (partial) | Multiple |
| 2026-02-28 | Add player browser compatibility for Chrome 38+ Smart TVs | player app |
