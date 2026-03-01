# SignageOS UI Design System
> Source-of-truth for all UI decisions. Reference this file before every component change.
> ⚠️ AUTO-MAINTAINED — This file is updated automatically whenever a UI change is made.
> Last updated: 2026-03-01

---

## 1. BRAND IDENTITY

- **Product**: SignageOS — Digital Signage Platform
- **Personality**: Dark, premium, modern — "Control Room Elegance"
- **Accent**: Amber/gold as the single accent color (never blue in auth context)
- **Logo**: Amber square (`#F5A624`) with bold black "S", rounded-lg, beside "SignageOS" in white

---

## 2. COLOR PALETTE

### Auth / Dark Theme (primary application)
| Token | Hex | Usage |
|---|---|---|
| `--bg-page` | `#0D0D0D` | Full page background |
| `--bg-surface` | `#1C1C1C` | Inputs, cards, panels |
| `--bg-surface-alt` | `#161616` | Testimonial cards, subtle surfaces |
| `--bg-surface-hover` | `#2A2A2A` | Hover state for surfaces |
| `--border` | `#2A2A2A` | All borders, dividers |
| `--border-subtle` | `#252525` | Card borders, very subtle |
| `--text-primary` | `#FFFFFF` | Headings, labels, key text |
| `--text-secondary` | `#9CA3AF` | Body text, descriptions |
| `--text-muted` | `#6B7280` | Placeholders, captions, stats labels |
| `--text-disabled` | `#4B5563` | Input icons, inactive elements |
| `--accent` | `#F5A624` | Primary CTAs, active links, active nav |
| `--accent-hover` | `#E09410` | Hover state of accent |
| `--accent-on` | `#000000` | Text ON amber background |
| `--error` | `#DC2626` | Error messages, error borders |
| `--error-bg` | `rgba(220,38,38,0.10)` | Error alert background |
| `--error-border` | `rgba(220,38,38,0.20)` | Error alert border |
| `--success` | `#059669` | Success state |
| `--success-bg` | `rgba(5,150,105,0.10)` | Success alert background |
| `--success-border` | `rgba(5,150,105,0.20)` | Success alert border |
| `--avatar-fallback` | `#4C4C8A` | Avatar fallback (purple-ish) |

### Grid Overlay
| Property | Value |
|---|---|
| Color | `rgba(255,255,255,0.06)` |
| Size | `60px × 60px` |
| Pattern | 1px lines, right + bottom |

---

## 3. TYPOGRAPHY

### Font Families
| Role | Stack |
|---|---|
| **UI / Default** | `Inter, -apple-system, BlinkMacSystemFont, sans-serif` |
| **Hero / Display** | `Georgia, "Times New Roman", serif` |
| **Mono** | `JetBrains Mono, SF Mono, monospace` |

### Font Scale
| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `text-hero` | `3.6rem` | `300` (light) | `1.12` | Auth hero heading (serif) |
| `text-display` | `1.875rem` (3xl) | `700` (bold) | `1.2` | Page/form titles |
| `text-title` | `1.5rem` (2xl) | `700` | `1.3` | Section titles |
| `text-body-lg` | `1rem` | `400` | `1.6` | Body text, descriptions |
| `text-body` | `0.875rem` (sm) | `400` | `1.5` | Labels, form text |
| `text-caption` | `0.75rem` (xs) | `400`–`500` | `1.4` | Hints, captions |
| `text-badge` | `0.625rem` (10px) | `400` | `1` | Stat labels (uppercase) |

### Letter Spacing
- Hero heading: default
- Stat labels: `tracking-widest` (0.1em)
- "OR" divider: `tracking-widest` uppercase
- Page titles: `tracking-tight` (-0.02em)

---

## 4. SPACING SYSTEM (4px base unit)

| Token | Value | Usage |
|---|---|---|
| `space-1` | `4px` | Minimal gap |
| `space-2` | `8px` | Icon-to-text gap |
| `space-3` | `12px` | Tight padding |
| `space-4` | `16px` | Standard gap |
| `space-5` | `20px` | Form field gap (space-y-5) |
| `space-6` | `24px` | Section padding |
| `space-7` | `28px` | Form bottom margin |
| `space-8` | `32px` | Container padding |
| `space-10` | `40px` | Large section gap |
| `space-12` | `48px` | Auth layout padding |

### Form Specific
- Label → Input gap: `6px` (space-y-1.5)
- Between form fields: `20px` (space-y-5)
- Form heading margin-bottom: `28px` (mb-7)
- Divider vertical: `28px` (my-7)
- Social buttons gap: `12px` (gap-3)
- Sign-up / footer link margin-top: `28px` (mt-7)

---

## 5. BORDER RADIUS

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | `6px` | Small elements |
| `radius-md` | `8px` (`rounded-lg`) | Inputs, buttons, logo |
| `radius-lg` | `12px` (`rounded-xl`) | Cards, testimonial, alerts |
| `radius-full` | `9999px` (`rounded-full`) | Avatars, spinners |

---

## 6. SHADOWS

Dark theme uses **borders instead of shadows** (flat design).
- No box shadows on cards or inputs
- Use `border: 1px solid #2A2A2A` for depth
- Exception: glassmorphism blur on bottom nav backdrop

---

## 7. COMPONENT TOKENS

### Input Field
```
height:           48px (h-12)
background:       #1C1C1C
border:           1px solid #2A2A2A
border-radius:    8px (rounded-lg)
padding-left:     40px (pl-10, for icon)
padding-right:    16px (pr-4) or 40px with eye toggle (pr-10)
text-color:       #FFFFFF
placeholder:      #4B5563
font-size:        0.875rem (text-sm)
focus-border:     #F5A624
icon-color:       #4B5563 (left icon)
icon-size:        16px (h-4 w-4)
```

### Label
```
font-size:   0.875rem (text-sm)
font-weight: 500 (font-medium)
color:       #FFFFFF
margin-bot:  6px (mb-1.5, via space-y-1.5)
```

### Button — Primary (CTA)
```
height:        48px (h-12)
background:    #F5A624
hover-bg:      #E09410
text-color:    #000000
font-weight:   600 (font-semibold)
font-size:     0.875rem (text-sm)
border-radius: 8px (rounded-lg)
width:         full (w-full)
disabled-op:   60% (opacity-60)
spinner:       border-black/30 + border-t-black
```

### Button — Social (Outline Dark)
```
height:        48px (h-12)
background:    #1C1C1C
border:        1px solid #2A2A2A
hover-op:      80%
text-color:    #FFFFFF
font-weight:   500
font-size:     0.875rem
border-radius: 8px (rounded-lg)
icon-size:     16px (h-4 w-4)
grid:          2 columns, gap-3
```

### Button — Ghost / Back
```
color:         #6B7280
hover-op:      80%
font-size:     0.875rem
icon:          ArrowLeft h-4 w-4
```

### Alert — Error
```
background:    rgba(220,38,38,0.10)
border:        1px solid rgba(220,38,38,0.20)
border-radius: 12px (rounded-xl)
padding:       16px (p-4)
icon:          AlertCircle h-5 w-5, color #DC2626
text:          0.875rem, color #DC2626
gap:           12px (gap-3)
```

### Alert — Success
```
background:    rgba(5,150,105,0.10)
border:        1px solid rgba(5,150,105,0.20)
border-radius: 12px (rounded-xl)
padding:       16px (p-4)
icon:          CheckCircle2 h-5 w-5, color #059669
text:          0.875rem, color #059669
gap:           12px (gap-3)
```

### OR Divider
```
border-top:      1px solid #2A2A2A
label-bg:        #0D0D0D
label-text:      #4B5563
label-size:      text-xs
label-style:     uppercase tracking-widest font-medium
label-padding:   px-4
vertical-margin: my-7
```

### Accent Link
```
color:       #F5A624
hover-op:    80%
font-weight: 500 (font-medium)
```

### Forgot Password Link (inline with Password label)
```
position:    flex justify-between with label
text:        "Forgot?"
color:       #F5A624
size:        text-sm font-medium
```

### Icon Accent Badge (verify email, forgot password header)
```
size:             56px (w-14 h-14)
border-radius:    12px (rounded-xl)
background:       rgba(245,166,36,0.12)
icon-color:       #F5A624
icon-size:        h-7 w-7
```

---

## 8. AUTH LAYOUT

### Structure
```
Full-page dark background (#0D0D0D)
├── Grid overlay (60px, rgba white 6%)
├── Logo strip (top, px-8 pt-6)
├── Main content row (flex, min-height calc(100vh - 120px))
│   ├── Left panel (58% on lg+, hidden on mobile)
│   │   ├── Hero heading (serif, 3.6rem, "Digital Signage, [Amber]Beautifully[/Amber] Simple")
│   │   ├── Subtext (#6B7280, max-w-xs)
│   │   ├── Stats row (10K+, 500+, 99.9%)
│   │   └── Testimonial card (#161616, border #252525, rounded-xl)
│   └── Right panel (42% on lg+, full on mobile)
│       └── Form container (max-w-[420px], centered)
└── Bottom nav (fixed, dark glass, border-top #1C1C1C)
    ├── Player Code (#6B7280)
    ├── Login (active: #F5A624 + border-bottom)
    └── Dashboard (#6B7280)
```

### Left Panel Hero Typography
```
font-family: Georgia, "Times New Roman", serif
font-size:   3.6rem
font-weight: 300 (light)
line-height: 1.12
color:       #FFFFFF
accent-word: #F5A624 (inline span)
```

### Stats Row
```
value-size:  1.5rem font-bold text-white
label-size:  10px uppercase tracking-widest text-[#4B5563]
label-mt:    4px (mt-1)
gap-between: gap-14
```

### Testimonial Card
```
background:    #161616
border:        1px solid #252525
border-radius: 12px (rounded-xl)
padding:       20px (p-5)
max-width:     24rem (max-w-sm)
quote-color:   #C9CDD4, text-sm leading-relaxed
avatar:        w-8 h-8 rounded-full bg-[#4C4C8A], initials white text-xs font-semibold
name:          text-white text-sm font-medium
role:          #6B7280 text-xs
```

### Bottom Navigation
```
position:       fixed bottom-0 inset-x
background:     rgba(13,13,13,0.92) backdrop-blur-sm
border-top:     1px solid #1C1C1C
padding:        py-4
gap:            gap-12
active-color:   #F5A624 + border-bottom 1px #F5A624 + pb-0.5
inactive-color: #6B7280
font-size:      text-sm
```

### CSS Variable Overrides (auth layout root div)
```css
--color-primary:        #F5A624
--color-primary-hover:  #E09410
--color-background:     #141414
--color-surface:        #1C1C1C
--color-border:         #2A2A2A
--color-text-primary:   #FFFFFF
--color-text-secondary: #9CA3AF
--color-text-muted:     #6B7280
```

---

## 9. FORM PAGES SPEC

### Sign In (`/sign-in`)
| Element | Spec |
|---|---|
| Title | "Welcome back" — text-3xl font-bold text-white |
| Subtitle | "Sign in to your account to continue" — text-sm #6B7280 |
| Field 1 | Email — icon: Mail, placeholder: "you@company.com" |
| Field 2 | Password — icon: Lock, eye toggle, "Forgot?" inline-right |
| CTA | "Sign in" — amber primary button |
| Divider | "or" |
| Social | Google (4-color SVG) + Apple (white) |
| Footer | "Don't have an account? **Sign up**" |

### Sign Up (`/sign-up`)
| Element | Spec |
|---|---|
| Title | "Create an account" |
| Subtitle | "Start your 14-day free trial, no credit card required" |
| Fields | Full name (User icon), Email (Mail icon), Password (Lock + toggle), Confirm password (Lock + toggle) |
| Password hint | "Must be at least 8 characters" — text-xs #6B7280 |
| CTA | "Create account" — amber primary |
| Terms | "By signing up..." text-xs #6B7280, links in amber |
| Divider | "or" |
| Social | Google + Apple |
| Footer | "Already have an account? **Sign in**" |
| Confirm step | Amber Mail icon badge, OTP input (h-14 text-2xl tracking), "Verify email" CTA, amber resend link |

### Forgot Password (`/forgot-password`)
| Element | Spec |
|---|---|
| Back link | "← Back to sign in" — ghost button, top of form |
| Header icon | Amber Mail badge (rgba amber 12% bg) |
| Title | "Reset password" |
| Subtitle | "Enter your email and we'll send you a reset link." |
| Field | Email — icon: Mail |
| CTA | "Send reset link" — amber primary |
| Success | Green CheckCircle2 badge, "Check your email", back-to-sign-in outline button |

---

## 10. ANIMATION

| Transition | Value |
|---|---|
| Page entry | `opacity: 0→1, y: 20→0, duration: 0.4s` |
| Step transition | `opacity: 0→1, x: 20→0, duration: 0.4s` |
| Alert entry | `opacity: 0→1, scale: 0.95→1` |
| Color transitions | `transition-colors duration-150` |
| Opacity transitions | `hover:opacity-80 transition-opacity` |

---

## 11. ICON SYSTEM

- **Library**: `lucide-react`
- **Default size in inputs**: `h-4 w-4` (16px)
- **Alert icons**: `h-5 w-5` (20px)
- **Badge icons**: `h-7 w-7` (28px)
- **Color in inputs**: `#4B5563`
- **Color in alerts**: match alert color token
- **Color in accent badges**: `#F5A624`

---

## 12. RESPONSIVE BEHAVIOR

| Breakpoint | Behavior |
|---|---|
| `< lg` (< 1024px) | Left panel hidden, form takes full width |
| `>= lg` | 58% left panel + 42% right form |
| Mobile padding | `px-8 py-10` for form container |
| Logo | Always visible top-left |
| Bottom nav | Always fixed, full width |

---

## 13. CODING CONVENTIONS

- Use **inline `style` props** for exact hex colors not in the Tailwind config
- Add `dark` class + CSS variable overrides on auth layout root `<div>`
- Prefer native `<input>` and `<button>` over component wrappers in auth forms
- Define a `DS` (design tokens) const object at top of each form page for DRY inline styles:
  ```ts
  const DS = {
    inputBase:    { backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' },
    btnPrimary:   { backgroundColor: '#F5A624', color: '#000000' },
    btnSocial:    { backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' },
    errorAlert:   { backgroundColor: 'rgba(220,38,38,0.10)', border: '1px solid rgba(220,38,38,0.20)' },
    successAlert: { backgroundColor: 'rgba(5,150,105,0.10)', border: '1px solid rgba(5,150,105,0.20)' },
  } as const
  ```
- Spinner on amber CTA: `border-2 border-black/30 border-t-black rounded-full animate-spin`
- Spinner on dark CTA: `border-2 border-white/30 border-t-white rounded-full animate-spin`
- Google button: always use **4-color SVG paths** (not `fill="currentColor"`)

---

## 17. PLAYERS PAGE SPEC

### Hero Banner
```
label:     "CONTROL CENTER" — amber uppercase
heading:   "Player Network" — text-3xl font-bold white
subtitle:  text-sm #6B7280
button:    Amber "+ Register Player"
stat cards (4):
  Total Players: monitor icon amber bg, value amber
  Online:        green dot w-3.5 h-3.5, value green (#059669)
  Offline:       red dot, value red (#DC2626)
  Pending:       amber dot, value amber (#F5A624)
```

### Layout (full-height, no outer scroll)
```
height: calc(100vh - 3.5rem)
flex-col
├── Hero banner (px-5 pt-5)
└── Two-column row (flex-1, p-5 pt-4, gap-4)
    ├── Left (flex-1): Map card
    │   ├── Filter toolbar (filter tabs + search + view toggle)
    │   ├── Map (flex-1, #141414 bg)
    │   │   └── "● Live" indicator top-right (dark pill)
    │   └── Legend (Online / Offline / Pending)
    └── Right (w-80): Active Players panel
        ├── Header: "Active Players" + amber count badge + MoreHorizontal
        └── Scrollable player list
```

### Status Tokens
```
online:  dot #059669, text #34D399, bg rgba(5,150,105,0.15),   badge "Online"
offline: dot #DC2626, text #F87171, bg rgba(220,38,38,0.15),   badge "Offline"
pending: dot #F5A624, text #F5A624, bg rgba(245,166,36,0.15), badge "Pending"
```

### Player Card (right panel)
```
icon: w-10 h-10 rounded-xl, bg = dot + 18 alpha, Monitor icon in dot color
name: text-sm font-semibold white
platform: text-xs #6B7280 capitalize
code row: "Code:" #6B7280 + amber mono tracking-widest + Copy icon
status badge: dot + label, colored per status token
```

### Filter Tabs
```
active:   #F5A624 bg, #000 text, rounded-lg
inactive: #9CA3AF text, transparent bg
```

---

## 16. CONTENT PAGE SPEC

### Hero Banner (same gradient as Dashboard)
```
background:    linear-gradient(135deg, #1B1B35 0%, #162040 50%, #0F2044 100%)
border:        1px solid #2A3050
label:         "CONTENT LIBRARY" — amber uppercase tracking-widest
heading:       "Media Library" — text-3xl font-bold white
subtitle:      text-sm #6B7280
right-side:    Amber Upload button (UploadCloud icon + "Upload")
stat-cards:    4 semi-transparent cards inside hero (Total Files, Storage Used, Images, Videos)
stat-card-bg:  rgba(0,0,0,0.28), border rgba(255,255,255,0.07)
stat-icon-bg:  rgba(255,255,255,0.07), icon color #6B7280
stat-value:    text-lg font-bold white
stat-label:    text-xs #6B7280
```

### Folder Cards
```
layout:        3-column grid, gap-4
background:    #1C1C1C, border 1px solid #2A2A2A, rounded-xl
icon-area:     w-10 h-10 rounded-lg, bg = folderColor + 1A opacity (10%)
folder-colors: rotate through [#F5A624, #7C3AED, #059669, #DC2626, #3B82F6]
name:          text-sm font-semibold white
count:         text-xs #6B7280 "N items"
chevron:       ChevronRight h-4 w-4 #6B7280
```

### File Type Badges (top-right of card)
```
PNG/JPG/GIF/WEBP: bg rgba(100,116,139,0.25) text #94A3B8
PDF:              bg rgba(245,158,11,0.22)  text #F59E0B
MP4:              bg rgba(20,184,166,0.22)  text #14B8A6
PSD:              bg rgba(239,68,68,0.22)   text #F87171
ZIP:              bg rgba(100,116,139,0.25) text #94A3B8
MP3:              bg rgba(124,58,237,0.22)  text #A78BFA
```

### File Card Preview Backgrounds (gradient per type)
```
PNG/JPG:  linear-gradient(145deg, #111827 0%, #1F2937 100%)
PDF:      linear-gradient(145deg, #1C1300 0%, #2D1F00 100%)
MP4:      linear-gradient(145deg, #001A18 0%, #0D2622 100%)
PSD:      linear-gradient(145deg, #1A0009 0%, #2A0012 100%)
```

### Content Toolbar
```
left:     "Content" h2 + filter tabs (All/Images/Videos)
tabs-bg:  #1C1C1C border #2A2A2A, active tab: #F5A624 bg #000 text
right:    search input + grid/list view toggle + "Newest First" sort
view-toggle-active: #F5A624 bg #000 text
```

---

## 15. DASHBOARD LAYOUT SPEC

### Hero Banner
```
background:    linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #1a1a3e 100%)
border:        1px solid #2A2A2A
border-radius: 12px (rounded-xl)
padding:       20px 24px (px-6 py-5)
label:         "DASHBOARD" — text-xs uppercase tracking-widest #F5A624
heading:       text-3xl font-bold white, username in #F5A624
subtitle:      text-sm #6B7280
right-side:    green dot + "All systems operational" + "Synced 2m ago"
```

### Metric Card (dark theme)
```
background:    #1C1C1C
border:        1px solid #2A2A2A
border-radius: 12px (rounded-xl)
padding:       16px (p-4)
dot:           w-2 h-2 rounded-full, color per metric type with glow
value:         text-3xl font-bold white
change-badge:  rounded-full px-2 py-0.5, colored bg + text per trend
sparkline:     inline SVG, 32px tall, gradient fill + stroke in dot color
progress-bar:  optional h-1 rounded-full (Storage metric)
```

### Metric Dot Colors
| Metric | Dot Color |
|---|---|
| Players | `#F5A624` (amber) |
| Channels | `#7C3AED` (purple) |
| Content | `#059669` (green) |
| Storage | `#DC2626` (red) |

### Activity Feed — Type Colors
| Type | Dot Color |
|---|---|
| player | `#059669` (green) |
| channel | `#7C3AED` (purple) |
| schedule | `#F5A624` (amber) |
| content | `#059669` (green) |

### Sidebar Additions
```
logo-subtitle:   "Free Plan" — text-xs #6B7280 below Studio
user-avatar:     w-8 h-8 rounded-full bg-[#4C4C8A], initials white text-xs
user-name:       text-sm font-medium white
user-email:      text-xs #6B7280
position:        pinned to sidebar bottom, above border
```

### Dashboard Header
```
height:          56px (h-14)
background:      #0D0D0D
border-bottom:   1px solid #1C1C1C
left:            page title text-sm font-medium #9CA3AF (or breadcrumb)
right:           search input (200px→260px on focus) + notifications bell
search-bg:       #1C1C1C, border #2A2A2A, focus-border #F5A624
notification-dot: #F5A624 (amber, not red)
```

---

## 19. SCHEDULES PAGE SPEC

### Hero Banner
```
label:     "SCHEDULE TIMELINE" — amber uppercase tracking-widest text-xs
heading:   "Schedules" — text-4xl font-bold white
subtitle:  text-sm #6B7280 (max-w-xl)
button:    Amber "+ New Schedule" (top-right)
background: linear-gradient(135deg, #1B1B35 0%, #162040 50%, #0F2044 100%)
border:    1px solid #2A3050
grid-overlay: 40px × 40px, rgba(255,255,255,0.03)
stat-cards (5 inside hero):
  Total Schedules: 📅 emoji icon, amber value (#F5A624)
  Active:          green circle dot (w-4 h-4), value green (#34D399)
  Paused:          ⏸ emoji icon, value white
  Drafts:          📝 emoji icon, value white
  Time Slots:      ⏰ emoji icon, value blue (#60A5FA)
stat-card-bg:  rgba(0,0,0,0.28), border rgba(255,255,255,0.07)
stat-icon-bg:  rgba(255,255,255,0.07)
```

### Toolbar
```
left:   filter tabs — All Schedules / Active / Paused / Draft
right:  search input (w-52, dark) + Calendar icon toggle + Grid3X3 icon toggle
active tab:   #F5A624 bg, #000 text, rounded-lg
inactive tab: #9CA3AF text
view-toggle active: #F5A624 bg #000 text; inactive: #1C1C1C border #2A2A2A
```

### Legend Row
```
colored dot (w-2.5 h-2.5 rounded-full) + schedule name text-xs #9CA3AF
gap-5 between items, flex-wrap
```

### Gantt Timeline (horizontal layout — days as rows, hours as columns)
```
container: bg #0F1623, border 1px solid #1F2937, rounded-xl, overflow-x-auto
HOUR_W:    76px per hour column
BLOCK_H:   26px per schedule block
BLOCK_GAP: 4px between stacked blocks in same row
ROW_PAD:   6px top+bottom
row-height: max(44, blockCount*(26+4)+12) px — expands with schedule count
today row:  amber day label + rgba(245,166,36,0.03) bg tint

Header row (h-40px):
  Left 60px "DAY" cell: #374151 text, border-right #1F2937
  Hour cells: current hour label amber (#F5A624) with tick mark; others #374151

Schedule block (absolutely positioned):
  left:    startHour * HOUR_W
  width:   duration * HOUR_W - 4 (min 60px)
  top:     ROW_PAD + blockIndex * (BLOCK_H + BLOCK_GAP)
  border-left: 2px solid palette.dot (bright left accent)
  other borders: 1px solid palette.border (semi-transparent)
  bg:      palette.bg (semi-transparent)
  Line 1:  name — 10px font-semibold, palette.text color
  Line 2:  "HH:MM – HH:MM" — 9px, palette.text at 60% opacity

Current time vertical line: 2px amber (#F5A624) at currentHourDecimal * HOUR_W (all rows)

Schedule Color Palette (cycled by index mod 6):
  0: amber  dot #F5A624 bg rgba(245,166,36,0.22)
  1: blue   dot #60A5FA bg rgba(96,165,250,0.20)
  2: green  dot #34D399 bg rgba(52,211,153,0.20)
  3: indigo dot #818CF8 bg rgba(167,139,250,0.20)
  4: pink   dot #FB7185 bg rgba(251,113,133,0.20)
  5: teal   dot #2DD4BF bg rgba(45,212,191,0.20)
```

---

## 18. CHANNELS PAGE SPEC

### Hero Banner
```
label:     "LAYOUT STUDIO" — amber uppercase tracking-widest text-xs
heading:   "Channels" — text-4xl font-bold white
subtitle:  text-sm #6B7280
right:     Amber "+ New Channel" button
background: linear-gradient(135deg, #1B1B35 0%, #162040 50%, #0F2044 100%)
border:    1px solid #2A3050
grid-overlay: 40px × 40px, rgba(255,255,255,0.03)
stat-cards (5 inside hero):
  Total Channels: amber value (#F5A624)
  Active:         green value (#34D399)
  Drafts:         gray value (#94A3B8)
  Total Zones:    indigo value (#818CF8)
  Connected:      blue value (#60A5FA)
stat-card-bg:  rgba(0,0,0,0.28), border rgba(255,255,255,0.07)
stat-icon-bg:  rgba(255,255,255,0.07), icon #6B7280
```

### Channel Card
```
width:       1/4 (4-column grid), gap-4
background:  #1C1C1C, border 1px solid #2A2A2A, rounded-xl, overflow-hidden
preview-h:   196px, background #141414
  TV icon:   top-left, absolute, w-6 h-6 #2A2A2A
  status:    top-right, absolute badge (Draft amber / Active green)
  zone-preview: ZoneLayoutPreview centered, max 80% of preview area
  hover-overlay: rgba(0,0,0,0.85), 3 buttons (Edit Layout/Preview/Duplicate)
info row (p-3):
  name:      text-sm font-semibold white
  meta-row:  resolution • orientation • N zones • N players • date — text-xs #6B7280
```

### Zone Layout Preview
```
8 dark zone bg gradients (cycled by index):
  [#1A1A2E, #162040, #0F2044, #1C1A2E, #1A2520, #1A1520, #1C1015, #0D1A2A]
zone block:   rounded-md, w-full h-full, zone name uppercase text-[9px] #9CA3AF centered
layout types:
  single:           1 zone (full area)
  split_horizontal: 2 zones stacked vertically (50/50)
  split_vertical:   2 zones side by side (50/50)
  l_shape:          grid-cols-2 grid-rows-2, top-left span col (2 zones in 3-cell grid)
  grid:             2×2 grid, 4 zones
  custom:           2×2 grid (fallback)
```

### Status Badges
```
published → "Active": bg rgba(5,150,105,0.20) text #34D399
draft      → "Draft":  bg rgba(245,166,36,0.20)  text #F5A624
```

### Filter Tabs
```
tabs: All Channels / Active / Draft
active:   #F5A624 bg, #000 text, rounded-lg px-4 py-1.5
inactive: #9CA3AF text, transparent
```

---

## 20. APPS PAGE SPEC

### Hero Banner
```
label:     "APP GALLERY" — amber uppercase tracking-widest text-xs
heading:   "Apps" — text-4xl font-bold white
subtitle:  text-sm #6B7280
button:    Amber "+ New App" (top-right)
background: linear-gradient(135deg, #1B1B35 0%, #162040 50%, #0F2044 100%)
border:    1px solid #2A3050
grid-overlay: 40px × 40px, rgba(255,255,255,0.03)
stat-cards (5):
  Total Apps:  📦 emoji, amber value (#F5A624)
  Active:      green dot (w-4 h-4), value green (#34D399)
  Drafts:      📝 emoji, amber value (#F5A624)
  Archived:    🗂 emoji, white value
  Deployments: 🚀 emoji, blue value (#60A5FA)
```

### Toolbar (single row)
```
Left group 1 — Status tabs: All Apps / Active / Draft / Archived
  active: #F5A624 bg #000 text rounded-lg
  inactive: #9CA3AF text
Divider: 1px solid #2A2A2A h-5

Left group 2 — Category tabs: All / Media / Social / Utilities / Data / Interactive
  active: #2A2A2A bg, #FFFFFF text, border #3A3A3A, rounded-lg
  inactive: #6B7280 text

Right: search input (w-48) + Grid icon + List icon (amber when active)
```

### App Card (3-col grid, rounded-xl)
```
background: #1C1C1C, border 1px solid #2A2A2A
Preview area (h-196px, bg #111827):
  top-left:  category badge (dark pill, rgba(0,0,0,0.55), #9CA3AF text)
  top-right: status badge — Active green / Draft amber / Archived gray
  center:    icon w-20 h-20 rounded-2xl with colored bg per template type
  hover:     rgba(0,0,0,0.82) overlay + 3 buttons (Configure/Preview dark, Deploy amber)

Info area (p-4):
  icon w-8 h-8 rounded-lg (small, same color as preview icon) + name text-sm font-bold + version text-xs #6B7280
  description: text-xs #6B7280, line-clamp-2
  feature tags: text-[10px] px-2 py-0.5 rounded-md, rgba(255,255,255,0.06) bg, #9CA3AF text
  footer: MessageSquare icon + "N players" text-xs #6B7280 | date text-xs #4B5563
```

### Template Icon Colors (preview icon bg — TEMPLATE_CONFIG)
| Template | Category | Icon BG | Icon Color |
|---|---|---|---|
| image | Media | rgba(59,130,246,0.28) | #60A5FA |
| slideshow | Media | rgba(124,58,237,0.28) | #A78BFA |
| video | Media | rgba(5,150,105,0.28) | #34D399 |
| youtube | Media | rgba(239,68,68,0.28) | #F87171 |
| pdf | Utilities | rgba(245,158,11,0.28) | #F59E0B |
| web | Utilities | rgba(14,165,233,0.28) | #38BDF8 |
| html | Utilities | rgba(251,146,60,0.28) | #FB923C |
| clock | Data | rgba(99,102,241,0.28) | #818CF8 |
| weather | Data | rgba(56,189,248,0.28) | #38BDF8 |
| (other) | Interactive | rgba(167,139,250,0.28) | #C4B5FD |

---

## 21. ANALYTICS PAGE SPEC

### Hero Banner
```
label:     "ANALYTICS" — amber uppercase tracking-widest text-xs
heading:   "Performance Metrics" — text-4xl font-bold white
subtitle:  text-sm #6B7280 (max-w-2xl)
time tabs (top-right inside banner): Last 7 days / Last 30 days (amber active) / Last 90 days / Custom
  active: #F5A624 bg #000 text rounded-lg
  inactive: rgba(255,255,255,0.05) bg, border rgba(255,255,255,0.08), #9CA3AF text
background: linear-gradient(135deg, #1B1B35 0%, #162040 50%, #0F2044 100%)
border:    1px solid #2A3050
grid-overlay: 40px × 40px, rgba(255,255,255,0.03)
KPI cards (4 inside hero, grid-cols-4):
  Total Impressions: Eye icon (amber), value amber (#F5A624), "+18% from last period"
  Unique Viewers:    Users icon (blue), value blue (#60A5FA), "+12% from last period"
  Avg. Dwell Time:   Clock icon (green), value green (#34D399), "+0.4s from last period"
  Avg. Uptime:       Wifi icon (blue), value blue (#60A5FA), "across all devices"
kpi-card-bg:  rgba(0,0,0,0.28), border rgba(255,255,255,0.07), p-5
kpi-layout:   icon (w-8 h-8 rounded-lg colored bg) + label text-sm #6B7280 → text-3xl bold colored value → text-xs #6B7280 change
```

### Two-Column Bottom Layout
```
grid: 1fr 380px (chart left, top content right), gap-4
```

### Viewer Trends Chart
```
card: bg #1C1C1C, border #2A2A2A, rounded-xl, p-5
header: "Viewer Trends" text-base font-bold white + "Impressions and unique viewers over time" text-xs #6B7280
legend (top-right): amber line (w-6 h-0.5) + "Total Views" | blue dashed svg line + "Unique Viewers"
chart height: 280px (Recharts ComposedChart)
  Y-axis ticks: [0, 3k, 5k, 8k, 10k] — #4B5563, no axis lines
  X-axis ticks: Jan 1/7/13/19/25/31 — #4B5563, no axis lines
  Grid: horizontal only, rgba(255,255,255,0.04)
  Area (Total Views): stroke #F5A624 strokeWidth 2, fill gradient (amber 35% → 2%)
    dots: fill #F5A624 r=3.5, no stroke
  Line (Unique Viewers): stroke #818CF8 strokeWidth 2, strokeDasharray "6 3", no dots
```

### Top Content Panel
```
card: bg #1C1C1C, border #2A2A2A, rounded-xl, p-5
header: "Top Content" + "Most viewed content this period" text-xs #6B7280
5 items, space-y-5:
  Row: rank badge (w-5 h-5 rounded-full, color bg at 15% opacity + border at 25%) + name text-sm font-medium white + change% (green/red) + view count #9CA3AF right-aligned
  Bar: h-1 rounded-full, rgba(255,255,255,0.06) bg, colored fill at proportional width
Item colors by rank: blue #3B82F6 / amber #F5A624 / green #22C55E / purple #7C3AED / pink #EC4899
Positive change: #34D399 | Negative change: #F87171
```

---

## 23. MODAL / DIALOG SYSTEM SPEC

### Global Dialog (`components/ui/dialog.tsx`)
```
Overlay:    bg-black/65 + backdrop-blur-[2px] — darker, frosted
Content:    bg-[#13132B], border-[#2A2A45], rounded-2xl, shadow-2xl
            default max-w-lg, p-6 (overridable with className="!p-0")
            hideClose prop: suppress built-in X button for custom headers
Close btn:  w-8 h-8 rounded-lg, bg white/5, border #2A2A45, icon #9CA3AF
            hover: bg white/10 + text white
DialogTitle: text-white font-semibold
DialogDescription: text-[#6B7280]
```

### Modal Pattern (used by ScheduleModal and all create/edit modals)
```
width:      max-w-[480px] (standard), flex flex-col, max-h-[90vh] overflow hidden

Header (flexShrink 0, border-bottom #1E1E38, p 20px 22px 16px):
  Icon badge:  48×48 rounded-12, rgba(245,166,36,0.18) bg, rgba(245,166,36,0.28) border, amber icon
  Title:       text-21px font-700 white
  Subtitle:    text-13 #6B7280
  X button:    32×32 rounded-8, rgba(255,255,255,0.07) bg, border #2A2A45, X icon #9CA3AF

Scrollable body (flex-1, overflowY auto, p 20px 22px, gap 20):
  Labels:      text-13 font-600 white, mb-8
  Inputs:      h-44 bg #0D0D1E border #2A2A40 rounded-10 text-13 white
               focus: border-color #F5A624 — onFocus/onBlur handlers
               colorScheme: dark (for time/date pickers)

Fixed footer (flexShrink 0, border-top #1E1E38, p 14px 22px):
  Summary text: text-12 #6B7280 flex-1 (e.g. "5 days · 0 channels · Medium priority")
  Cancel btn:  h-44 rounded-10 bg #1A1A30 border #2A2A45 text #9CA3AF font-600
  Primary btn: h-44 rounded-10 bg #F5A624 text #000 font-700, spinner on loading
```

### Schedule Modal Fields
```
Schedule Name:    full-width input h-48 text-14
Start/End Time:   2-col grid, Clock icon left-12, time input h-48 font-600 text-15 paddingLeft-36
Duration row:     Clock icon + "Duration: Nh per day · Nh / week" — N colored amber
Days of Week:     header row with "Days of Week" + "Weekdays / Weekends / All" quick-set links
                  7-col grid, h-44 buttons: selected amber bg #000 text; unselected #1A1A30 bg #6B7280 text
Repeat/Dates:     3-col grid — Repeat (styled select + ChevronDown) / Start Date / End Date
Priority:         3-card grid (High/Medium/Low)
                  selected: border rgba(245,166,36,0.50), bg rgba(245,166,36,0.10)
                  unselected: border #2A2A40, bg #0D0D1E
                  dot: selected #F5A624, unselected #4B5563
                  label: selected #F5A624 font-700, unselected #9CA3AF
                  desc: text-11 #4B5563
Channels:         header with "N of M selected" count; scrollable max-h-180
                  channel row: bg #0D0D1E, outline #1E1E38; selected: bg rgba amber 8%, outline rgba amber 30%
                  32px TV icon placeholder in #1A1A30 rounded-8
                  status badge: dot + "Published" green / "Draft" gray
```

---

## 22. APPS CREATE PAGE SPEC

### Layout
```
height: calc(100vh - 3.5rem), flex-col, bg #0D0D0D, overflow hidden

Sub-header (h-52px, bg #141414, border-bottom #2A2A2A):
  Left:   "← Apps" pill button (rgba(255,255,255,0.06) bg, border #2A2A2A, #9CA3AF, ArrowLeft icon)
  Center: "Create New App" text-15px font-600 white (flex-1)
  Right:  Stepper — ① Select Type → ② Configure → ③ Deploy
    step circle: 22×22 rounded-full; active/done: #F5A624 bg #000 text; inactive: rgba(255,255,255,0.08) bg #6B7280 text
    step label:  active #F5A624 font-600; done #9CA3AF; inactive #6B7280
    active step: amber bg rgba(245,166,36,0.12) rounded-lg container
    separator:   ChevronRight #2A2A2A

3-column body (flex-1, flex-row, overflow hidden):
  Left sidebar   200px
  Middle panel   flex-1
  Right panel    320px
```

### Left Sidebar
```
border-right: 1px solid #2A2A2A
"APP TYPES" label: text-10px uppercase tracking-wider #F5A624, padding 16px 16px 8px

Category nav items (All Types / Custom / Document / Embeds / Media / Widgets):
  active:   bg rgba(245,166,36,0.08), border-left 2px solid #F5A624, text #F5A624 font-600
  inactive: transparent bg, border-left 2px solid transparent, text #9CA3AF font-400
  count badge: active → #F5A624 text rgba(245,166,36,0.15) bg; inactive → #4B5563 text rgba(255,255,255,0.06) bg

Bottom "TEMPLATES" block (border-top #2A2A2A):
  label:  "TEMPLATES" text-10px uppercase #6B7280
  count:  text-22px font-700 #F5A624
  sub:    "available" text-11px #4B5563
```

### Middle Panel — Template List
```
Search bar (border-bottom #2A2A2A): Search icon #4B5563, input h-36 bg #1C1C1C border #2A2A2A rounded-lg text-13 white | "N results" text-12 #6B7280

Category group header: text-10px uppercase font-700 tracking-wider #4B5563 + horizontal divider line #1C1C1C

Template row:
  selected: bg rgba(245,166,36,0.06), border-left 2px solid #F5A624
  default:  transparent bg, border-left 2px solid transparent
  icon:     40×40 rounded-8, colored bg per category (see CAT_STYLE), h-5 w-5 icon in category color
  name:     text-13 font-600; selected #F5A624, default white + ellipsis
  "POPULAR" badge: text-9px uppercase bg rgba(245,166,36,0.18) text #F5A624 borderRadius 4
  description: text-11 #6B7280, 2-line clamp
  tags:     text-10 #4B5563 bg rgba(255,255,255,0.05) rounded-4, max 3 tags
  chevron:  ChevronRight #F5A624 when selected (marginTop 10)
```

### Category Icon Styles (CAT_STYLE)
| Category | BG | Icon Color |
|---|---|---|
| custom   | rgba(251,146,60,0.22)  | #FB923C |
| document | rgba(245,158,11,0.22)  | #F59E0B |
| embeds   | rgba(14,165,233,0.22)  | #38BDF8 |
| media    | rgba(59,130,246,0.22)  | #60A5FA |
| widgets  | rgba(99,102,241,0.22)  | #818CF8 |

### Right Panel
```
Empty state (no template selected):
  ChevronRight circle (48×48, border 2px solid #2A2A2A, ChevronRight #4B5563)
  "Select a template" — text-14 font-600 #6B7280
  Subtitle — text-12 #4B5563

Configure form (template selected):
  Header: icon 36×36 rounded-8 + name text-14 font-700 white + description text-11 #6B7280

  Fields (bg #111827, border #1F2937, h-40, rounded-8, text-13):
    - App Name (required, amber focus border)
    - Description (textarea, 3 rows, amber focus)
    - Select Content button (if requiresContent)
    - Dynamic schema fields via FormFieldRenderer
    - Error alert: rgba(220,38,38,0.10) bg, rgba(220,38,38,0.20) border

  Footer (border-top #2A2A2A):
    Create App: amber bg #F5A624, black text, h-40, w-full, font-700
    Cancel:     transparent bg, border #2A2A2A, #9CA3AF, h-36
```

---

## 14. CHANGE LOG

| Date | Change | Files Affected |
|---|---|---|
| 2026-03-01 | Initial design system established from reference dark/amber UI | `layout.tsx`, `sign-in/page.tsx`, `sign-up/page.tsx`, `forgot-password/page.tsx` |
| 2026-03-01 | Added `DS` token object pattern, icon accent badge token, form page spec table | All auth pages |
| 2026-03-01 | Full dashboard dark theme revamp — amber primary in dark mode, hero banner, metric cards with colored dots + sparklines, activity feed type colors, sidebar user profile + Free Plan label, header search bar | `globals.css`, `(dashboard)/layout.tsx`, `sidebar.tsx`, `header.tsx`, `home/page.tsx`, `MetricsStrip.tsx`, `ActivityFeed.tsx` |
| 2026-03-01 | Polish pass — compact avatar-only header trigger, unique SVG gradient IDs via useId, hero grid overlay + status pill, card headers with inner borders, activity feed indigo channel dots, main height fix | `header.tsx`, `home/page.tsx`, `MetricsStrip.tsx`, `ActivityFeed.tsx`, `(dashboard)/layout.tsx` |
| 2026-03-01 | Screenshot-match revamp — amber "3" badge on Content sidebar item; neutral metric badge uses dotColor tint instead of gray; Storage dotColor corrected to `#DC2626`; "45.2 GB" renders GB in smaller gray text; activity feed concentric dot pattern (outer ring 18% opacity + inner filled dot with glow); activity item 5 type fixed to 'channel' (purple) | `sidebar.tsx`, `home/page.tsx`, `MetricsStrip.tsx`, `ActivityFeed.tsx`, `ui-design-system.md` |
| 2026-03-01 | Complete Content page revamp — hero banner with stat cards; folder cards 3-col layout with accent colors; file type badges (PNG/PDF/MP4/PSD) with colored backgrounds; 4-col file card grid with checkbox, preview bg per type, play button for video; filter tabs All/Images/Videos; view toggle grid/list; search + sort toolbar; breadcrumb set via context | `content/page.tsx`, `ui-design-system.md` |
| 2026-03-01 | Complete Players page revamp — "CONTROL CENTER" hero banner; 4 stat cards (Total Players/Online/Offline/Pending) with status-colored values and dots; status filter tabs (All/Online/Offline/Pending); map view with Live indicator + legend (Online/Offline/Pending); Active Players right panel with count badge + player cards (monitor icon in status color, name, platform, amber pairing code, status badge) | `players/page.tsx`, `ui-design-system.md` |
| 2026-03-01 | Complete Schedules page revamp — "SCHEDULE TIMELINE" hero with text-4xl "Schedules" heading; 5 stat cards (Total Schedules/amber, Active/green, Paused/white, Drafts/white, Time Slots/blue) with emoji icons; filter tabs All Schedules/Active/Paused/Draft; legend row with colored dots; horizontal Gantt timeline (days as rows, 24 hours as columns, 76px/hour) with colored schedule blocks per palette (6 colors), stacked swim lanes per day row, amber current-time vertical line and amber current-hour label, today row highlighted; grid card view fallback | `schedules/page.tsx`, `ui-design-system.md` |
| 2026-03-01 | Complete Channels page revamp — "LAYOUT STUDIO" hero with text-4xl "Channels" heading; 5 stat cards (Total Channels/amber, Active/green, Drafts/gray, Total Zones/indigo, Connected Players/blue); filter tabs All Channels/Active/Draft; 4-col channel card grid with ZoneLayoutPreview (dark-themed zone bg gradients, zone names uppercase), status badges Draft/Active, hover overlay with Edit Layout/Preview/Duplicate actions, info row with resolution/orientation/zones/players/date | `channels/page.tsx`, `ui-design-system.md` |
| 2026-03-01 | Complete Analytics page revamp — "ANALYTICS" hero with "Performance Metrics" text-4xl; time period tabs inside banner (Last 7/30/90 days/Custom, amber active); 4 KPI cards (Total Impressions/amber, Unique Viewers/blue, Avg Dwell Time/green, Avg Uptime/blue) with icon+label+big value+change pattern; two-column bottom (Viewer Trends Recharts ComposedChart: amber area+dots + blue dashed Line, gradient area fill, custom grid/axis styles; Top Content: 5 items with colored rank badge, name, % change, view count, colored progress bar) | `analytics/page.tsx`, `ui-design-system.md` |
| 2026-03-01 | Complete Settings page revamp — slim "SETTINGS" hero (text-3xl "Account Settings", no stat cards); left sidebar nav (160px, #1C1C1C card, 5 items: Profile/Security/Notifications/Billing/Team, amber left-border + bg tint for active); right content area (flex-1) with tab-switched section cards; Profile tab: Profile Information card (avatar YC initials w-20 h-20 rounded-xl amber bg, Change link, 2-col name grid, email with inline Verified badge, display name + hint), Organization card (name+timezone grid, readonly org ID), Danger Zone card (red header, red Delete Account button); Security tab: change password form, 2FA status card; Notifications tab: toggle switch rows (custom Toggle component); Billing tab: Free Plan card; Team tab: empty state with Invite Member button; input style: bg #111827 border #1F2937 h-10 text-sm, amber focus border | `settings/page.tsx`, `ui-design-system.md` |
| 2026-03-01 | Complete Apps page revamp — "APP GALLERY" hero with text-4xl "Apps" heading; 5 stat cards (Total Apps/amber, Active/green, Drafts/amber, Archived/white, Deployments/blue) with emoji icons; dual toolbar with status filter tabs (All Apps/Active/Draft/Archived) + category tabs (All/Media/Social/Utilities/Data/Interactive) + search + grid/list view toggle; 3-column app card grid with 196px preview area, colored icon bg per template type (6 colors), category+status badges, hover overlay (Configure/Preview/Deploy buttons), info section (icon+name+version, description, feature tags, player count+date footer); list view fallback | `apps/page.tsx`, `ui-design-system.md` |
| 2026-03-01 | Global Dialog system dark-theme upgrade — overlay bg-black/65 + backdrop-blur, content bg-[#13132B] border-[#2A2A45] rounded-2xl, X button restyled as dark rounded-lg square, hideClose prop added to DialogContent, DialogTitle text-white, DialogDescription text-[#6B7280] | `components/ui/dialog.tsx`, `ui-design-system.md` |
| 2026-03-01 | Complete Schedule Modal revamp — dark navy #13132B modal; header with amber Calendar icon badge + title + subtitle + X button; scrollable body with Schedule Name (h-48 input), Start/End Time (2-col, Clock icon left, time input font-600), Duration computed row (amber bold value), Days of Week (7-col grid amber/dark day buttons + Weekdays/Weekends/All quick selectors), Repeat dropdown + Start Date + End Date (3-col), Priority 3-card selector (High/Medium/Low, amber selected state), Channels list (TV icon + name + Published green badge, selected amber tint); fixed footer with summary text + Cancel + amber "+ Create Schedule" button; new state: repeat/startDate/endDate/priority | `components/schedules/ScheduleModal.tsx`, `ui-design-system.md` |
| 2026-03-01 | Complete Apps Create page revamp — 3-column fixed layout (200px sidebar / flex-1 template list / 320px right panel); sub-header with "← Apps" back pill + "Create New App" title + 3-step stepper (amber active circle); left sidebar with APP TYPES amber label + category nav (All Types/Custom/Document/Embeds/Media/Widgets with count badges, amber active border) + TEMPLATES count at bottom; middle panel with search bar + N results + grouped template rows (colored 40px icon per category, name + POPULAR amber badge, description 2-line clamp, tag pills, amber left border + tint when selected, chevron indicator); right panel: ChevronRight empty state → configure form (template header with icon, App Name / Description fields bg #111827, content selector, dynamic FormFieldRenderer schema fields, amber Create App button); static FALLBACK_TEMPLATES (20 templates: Custom/Document/Embeds/Media/Widgets); preserved useCreateApp + useAppTypes + useAppTypeSchema + ContentSelector logic | `apps/create/page.tsx`, `ui-design-system.md` |
