# Digital Signage Platform — Layout Structure Guide

## Current Design Analysis

### What's Wrong with Your Current Design

| Issue | Current State | Problem |
|-------|---------------|---------|
| **Visual Hierarchy** | Everything feels equally weighted | No clear focal point, eye doesn't know where to go |
| **Color Usage** | Dark bg + orange accent (generic dark theme) | Looks like every AI-generated dashboard |
| **Typography** | Single weight, no variation | Flat, lacks personality |
| **Spacing** | Inconsistent, cramped cards | Feels claustrophobic, not premium |
| **Empty States** | Generic centered icons | Missed opportunity for onboarding |
| **Card Design** | Rounded corners, same treatment | No visual differentiation |
| **Data Viz** | Large circular gauge for "0" | Wastes space, visually heavy |

---

## Design Philosophy: "Control Room Elegance"

Your platform is a **command center** for digital displays. The design should feel:
- **Confident** — Like mission control, not a startup template
- **Information-Dense** — Glanceable data without overwhelm  
- **Precise** — Sharp, intentional, zero decoration for decoration's sake
- **Alive** — Subtle motion indicates a live, connected system

**Reference Products:** Linear, Vercel Dashboard, Raycast, Arc Browser, Figma

---

## Global Design Tokens

```
COLORS (Light Mode - Yes, consider light mode)
────────────────────────────────────────────
Background/Canvas     #FAFAFA (not pure white)
Surface/Cards         #FFFFFF
Surface Elevated      #FFFFFF + shadow
Border                #E5E5E5
Border Subtle         #F0F0F0

Text Primary          #171717
Text Secondary        #525252
Text Muted            #A3A3A3

Accent Primary        #2563EB (confident blue)
Accent Secondary      #7C3AED (purple for schedules)
Success               #059669
Warning               #D97706
Danger                #DC2626

COLORS (Dark Mode)
────────────────────────────────────────────
Background            #09090B (near black, not gray)
Surface               #18181B
Surface Elevated      #27272A
Border                #27272A
Border Subtle         #3F3F46

Text Primary          #FAFAFA
Text Secondary        #A1A1AA
Text Muted            #71717A

(Same accent colors work in both modes)


TYPOGRAPHY
────────────────────────────────────────────
Font Family           "Inter" for UI, "JetBrains Mono" for data/codes
                      OR "Geist" (Vercel's font) for modern feel

Display/Page Titles   24px / 600 weight / -0.02em tracking
Section Headers       14px / 600 weight / uppercase / 0.05em tracking / muted color
Body                  14px / 400 weight
Small/Labels          12px / 500 weight
Mono/Data             13px / JetBrains Mono / 400 weight


SPACING SCALE
────────────────────────────────────────────
4px   - tight (icon-to-text)
8px   - compact (list items)
12px  - default (card padding inner)
16px  - comfortable (between elements)
24px  - section gaps
32px  - major section dividers
48px  - page-level spacing


RADIUS
────────────────────────────────────────────
Small (buttons, badges)     6px
Medium (cards, inputs)      8px
Large (modals, panels)      12px

Note: Avoid overly rounded corners (16px+). They feel "cute" not "professional".


SHADOWS (Minimal, Purposeful)
────────────────────────────────────────────
Subtle      0 1px 2px rgba(0,0,0,0.05)
Medium      0 4px 6px -1px rgba(0,0,0,0.1)
Elevated    0 10px 15px -3px rgba(0,0,0,0.1)

Dark mode: Use border + slight bg change instead of shadows
```

---

## Page Layouts

### 1. OVERVIEW / DASHBOARD

**Current Problem:** Large circular gauge wastes space, metrics scattered randomly, no clear story.

**New Layout Structure:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR (56px collapsed / 240px expanded)                                       │
│ ┌──────┬────────────────────────────────────────────────────────────────────────┤
│ │      │  HEADER BAR (56px height)                                              │
│ │      │  ┌─────────────────────────────────────────────────────────────────┐   │
│ │      │  │ [Breadcrumb: Workspace > Overview]              [🔔] [Avatar ▾] │   │
│ │      │  └─────────────────────────────────────────────────────────────────┘   │
│ │ LOGO │ ───────────────────────────────────────────────────────────────────────│
│ │      │  MAIN CONTENT (scrollable)                                             │
│ │ ──── │  ┌─────────────────────────────────────────────────────────────────┐   │
│ │      │  │                                                                 │   │
│ │ NAV  │  │  PAGE HEADER                                                    │   │
│ │      │  │  ┌──────────────────────────────────────────────────────────┐   │   │
│ │ Over │  │  │  Network Status                                          │   │   │
│ │ Chan │  │  │  ● All systems operational          [Last sync: 2m ago]  │   │   │
│ │ Cont │  │  └──────────────────────────────────────────────────────────┘   │   │
│ │ Play │  │                                                                 │   │
│ │ Sche │  │  METRICS ROW (compact, horizontal)                              │   │
│ │ Apps │  │  ┌────────────┬────────────┬────────────┬────────────────────┐  │   │
│ │      │  │  │ PLAYERS    │ CHANNELS   │ CONTENT    │ STORAGE            │  │   │
│ │ ──── │  │  │ 12 online  │ 8 active   │ 1,247      │ 45.2 GB / 100 GB   │  │   │
│ │      │  │  │ ↑2 today   │ 3 draft    │ +23 today  │ ████████░░ 45%     │  │   │
│ │ Anal │  │  └────────────┴────────────┴────────────┴────────────────────┘  │   │
│ │ Sett │  │                                                                 │   │
│ │      │  │  TWO-COLUMN LAYOUT                                              │   │
│ │      │  │  ┌─────────────────────────┐  ┌─────────────────────────────┐   │   │
│ │ ──── │  │  │ PLAYER MAP              │  │ ACTIVITY FEED               │   │   │
│ │      │  │  │ (Interactive, 60% width)│  │ (Timeline, 40% width)       │   │   │
│ │ [WS] │  │  │                         │  │                             │   │   │
│ │      │  │  │  [Simplified world map  │  │  ● Player "Lobby" online    │   │   │
│ └──────┴──│  │   with dots for players]│  │    2 minutes ago            │   │   │
│           │  │                         │  │                             │   │   │
│           │  │  ○ NYC (3)  ○ LA (2)    │  │  ● Channel updated          │   │   │
│           │  │  ○ London (4)           │  │    "Morning News"           │   │   │
│           │  │                         │  │    15 minutes ago           │   │   │
│           │  │  [+ Add Player]         │  │                             │   │   │
│           │  └─────────────────────────┘  │  ● Schedule activated       │   │   │
│           │                               │    "Weekend Specials"       │   │   │
│           │                               │    1 hour ago               │   │   │
│           │                               │                             │   │   │
│           │                               │  [View all activity →]      │   │   │
│           │                               └─────────────────────────────┘   │   │
│           │                                                                 │   │
│           └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Key Changes:**
1. **Removed the giant circular gauge** — Use a simple status badge
2. **Horizontal metrics strip** — Scannable at a glance, shows actual useful data
3. **Map is the hero** — This is your differentiator, make it prominent
4. **Activity feed as timeline** — Not cards, a clean vertical list
5. **No "Quick Actions"** — Actions belong in context, not a random button group

---

### 2. CHANNELS / LAYOUT STUDIO

**Current Problem:** Empty state is generic, no preview of what a channel looks like.

**New Layout Structure:**

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  HEADER: Layout Studio                            [+ New Channel]      │
│         │ ─────────────────────────────────────────────────────────────────────  │
│         │                                                                        │
│         │  FILTER BAR                                                            │
│         │  ┌────────────────────────────────────────────────────────────────┐    │
│         │  │ [All ▾]  [Status ▾]  [Layout ▾]        🔍 Search...            │    │
│         │  └────────────────────────────────────────────────────────────────┘    │
│         │                                                                        │
│         │  VIEW TOGGLE: [Grid] [List]                      Showing 8 channels    │
│         │                                                                        │
│         │  CHANNEL GRID (when channels exist)                                    │
│         │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│         │  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │         │
│         │  │ │░░░░░░░░░░░░░│ │  │ │░░░│▓▓▓▓▓▓▓▓▓│ │  │ │░░░░░░░░░░░░░│ │         │
│         │  │ │░ PREVIEW ░░░│ │  │ │░░░│▓▓▓▓▓▓▓▓▓│ │  │ │░░░░░░░░░░░░░│ │         │
│         │  │ │░░░░░░░░░░░░░│ │  │ │░░░│▓▓▓▓▓▓▓▓▓│ │  │ │░░░░░░░░░░░░░│ │         │
│         │  │ └─────────────┘ │  │ └─────────────┘ │  │ ├─────────────┤ │         │
│         │  │ Lobby Display   │  │ Retail Promo    │  │ │▓▓ ticker ▓▓▓│ │         │
│         │  │ 1920×1080 · ● 3 │  │ 1080×1920 · ● 1 │  │ └─────────────┘ │         │
│         │  │ players         │  │ player          │  │ News Feed       │         │
│         │  └─────────────────┘  └─────────────────┘  │ 1920×1080 · ● 5 │         │
│         │                                            └─────────────────┘         │
│         │                                                                        │
│         │  ─────────────────────────────────────────────────────────────────     │
│         │                                                                        │
│         │  EMPTY STATE (when no channels)                                        │
│         │  ┌────────────────────────────────────────────────────────────────┐    │
│         │  │                                                                │    │
│         │  │     ┌─────────────────────────────────────────────────────┐    │    │
│         │  │     │                                                     │    │    │
│         │  │     │   ┌─────────┐   ┌────┬────┐   ┌──────┬──────┐      │    │    │
│         │  │     │   │ Single  │   │    │    │   │      │      │      │    │    │
│         │  │     │   │  Zone   │   │ 2-Zone  │   │   L-Shape   │      │    │    │
│         │  │     │   └─────────┘   └────┴────┘   └──────┴──────┘      │    │    │
│         │  │     │                                                     │    │    │
│         │  │     │   Start with a template or build custom             │    │    │
│         │  │     │                                                     │    │    │
│         │  │     │              [Create Channel]                       │    │    │
│         │  │     │                                                     │    │    │
│         │  │     └─────────────────────────────────────────────────────┘    │    │
│         │  │                                                                │    │
│         │  └────────────────────────────────────────────────────────────────┘    │
│         │                                                                        │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Key Changes:**
1. **Channel cards show actual layout preview** — Mini visual of the zone configuration
2. **Grid view default** — Channels are visual, show them visually
3. **Smart empty state** — Shows layout templates inline, not a separate modal
4. **Metadata is minimal** — Resolution + player count, nothing else needed
5. **No giant icon** — The layout templates ARE the visual

---

### 3. PLAYERS / CONTROL CENTER

**Current Problem:** Map dominates but shows nothing useful, sidebar list is cramped.

**New Layout Structure:**

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  HEADER: Control Center                          [+ Register Player]   │
│         │ ─────────────────────────────────────────────────────────────────────  │
│         │                                                                        │
│         │  STATUS BAR (sticky)                                                   │
│         │  ┌────────────────────────────────────────────────────────────────┐    │
│         │  │ ● 12 Online    ○ 3 Offline    ◐ 1 Pending       🔍 Search...  │    │
│         │  └────────────────────────────────────────────────────────────────┘    │
│         │                                                                        │
│         │  VIEW TOGGLE: [Map] [List] [Grid]                                      │
│         │                                                                        │
│         │  ┌───────────────────────────────────────────┬────────────────────┐    │
│         │  │                                           │                    │    │
│         │  │              INTERACTIVE MAP              │   PLAYER PANEL     │    │
│         │  │              (70% width)                  │   (30% width)      │    │
│         │  │                                           │                    │    │
│         │  │   ┌─────────────────────────────────┐     │   Selected: NYC    │    │
│         │  │   │                                 │     │   ─────────────    │    │
│         │  │   │     [Clean vector map]          │     │                    │    │
│         │  │   │                                 │     │   ┌────────────┐   │    │
│         │  │   │         ◉ NYC (3)               │     │   │ Lobby      │   │    │
│         │  │   │           cluster               │     │   │ ● Online   │   │    │
│         │  │   │                                 │     │   │ Ch: News   │   │    │
│         │  │   │    ◉ London (4)                 │     │   └────────────┘   │    │
│         │  │   │                                 │     │   ┌────────────┐   │    │
│         │  │   │              ○ Tokyo (1)        │     │   │ Entrance   │   │    │
│         │  │   │              offline            │     │   │ ● Online   │   │    │
│         │  │   │                                 │     │   │ Ch: Promo  │   │    │
│         │  │   └─────────────────────────────────┘     │   └────────────┘   │    │
│         │  │                                           │   ┌────────────┐   │    │
│         │  │   [+] [-]  [Fit all]  [Satellite]        │   │ Cafeteria  │   │    │
│         │  │                                           │   │ ○ Offline  │   │    │
│         │  │                                           │   │ Ch: Menu   │   │    │
│         │  │                                           │   └────────────┘   │    │
│         │  │                                           │                    │    │
│         │  │                                           │   [View all →]     │    │
│         │  └───────────────────────────────────────────┴────────────────────┘    │
│         │                                                                        │
│         │  EMPTY STATE (when no players)                                         │
│         │  ┌────────────────────────────────────────────────────────────────┐    │
│         │  │                                                                │    │
│         │  │                    Add your first player                       │    │
│         │  │                                                                │    │
│         │  │    ┌────────────────────────────────────────────────────┐      │    │
│         │  │    │                                                    │      │    │
│         │  │    │   1. Download the player app                       │      │    │
│         │  │    │      [Android]  [Windows]  [Web]  [Raspberry Pi]   │      │    │
│         │  │    │                                                    │      │    │
│         │  │    │   2. Enter this pairing code:                      │      │    │
│         │  │    │      ┌──────────────────────────────────────┐      │      │    │
│         │  │    │      │        ABC-123-XYZ                   │      │      │    │
│         │  │    │      └──────────────────────────────────────┘      │      │    │
│         │  │    │      Expires in 14:59  [Copy] [QR Code]            │      │    │
│         │  │    │                                                    │      │    │
│         │  │    └────────────────────────────────────────────────────┘      │    │
│         │  │                                                                │    │
│         │  └────────────────────────────────────────────────────────────────┘    │
│         │                                                                        │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Key Changes:**
1. **Map + Panel layout** — Clicking a cluster shows players in the side panel
2. **Clusters, not individual pins** — Zoomed out shows clusters, zoom in for individual
3. **Status bar is functional** — Clicking "Offline" filters to offline players
4. **Actionable empty state** — Shows the pairing code immediately, no extra clicks
5. **View toggle** — Map is default, but List/Grid available for different workflows

---

### 4. CONTENT LIBRARY

**New Layout Structure:**

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  HEADER: Content Library                              [↑ Upload]       │
│         │ ─────────────────────────────────────────────────────────────────────  │
│         │                                                                        │
│         │  ┌─────────────────────────────────────────────────────────────────┐   │
│         │  │ 📁 All Content        🔍 Search files...        [Grid ▾] [Date ▾]│   │
│         │  │ ├─ 📁 Marketing                                                  │   │
│         │  │ ├─ 📁 Product                                                    │   │
│         │  │ └─ 📁 Events                                                     │   │
│         │  └─────────────────────────────────────────────────────────────────┘   │
│         │                                                                        │
│         │  BREADCRUMB: All Content / Marketing / Q1 Campaign                     │
│         │                                                                        │
│         │  ┌──────────────────────────────────────────────────────────────────┐  │
│         │  │                                                                  │  │
│         │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │  │
│         │  │  │ ░░░░░░░░ │  │ ▓▓▓▓▓▓▓▓ │  │ ████████ │  │ ░░░░░░░░ │         │  │
│         │  │  │ ░░ IMG ░░│  │ ▓▓ VID ▓▓│  │ ██ PDF ██│  │ ░░ IMG ░░│         │  │
│         │  │  │ ░░░░░░░░ │  │ ▓▓▓▓▓▓▓▓ │  │ ████████ │  │ ░░░░░░░░ │         │  │
│         │  │  ├──────────┤  ├──────────┤  ├──────────┤  ├──────────┤         │  │
│         │  │  │hero.jpg  │  │promo.mp4 │  │menu.pdf  │  │banner.png│         │  │
│         │  │  │2.4 MB    │  │48 MB·0:30│  │1.2 MB    │  │890 KB    │         │  │
│         │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │  │
│         │  │                                                                  │  │
│         │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │  │
│         │  │  │ ░░░░░░░░ │  │ ▓▓▓▓▓▓▓▓ │  │ ████████ │  │ ░░░░░░░░ │         │  │
│         │  │  │ ...      │  │ ...      │  │ ...      │  │ ...      │         │  │
│         │  │                                                                  │  │
│         │  └──────────────────────────────────────────────────────────────────┘  │
│         │                                                                        │
│         │  DRAG & DROP ZONE (appears on drag)                                    │
│         │  ┌──────────────────────────────────────────────────────────────────┐  │
│         │  │                                                                  │  │
│         │  │           Drop files here to upload to "Q1 Campaign"             │  │
│         │  │                                                                  │  │
│         │  └──────────────────────────────────────────────────────────────────┘  │
│         │                                                                        │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Key Changes:**
1. **Folder tree in header area** — Always visible, collapsible
2. **File grid with actual thumbnails** — Not icons, actual content previews
3. **Minimal metadata** — Name + size + duration (for video)
4. **Drag-drop zone appears contextually** — Not always visible
5. **No tags panel** — Tags are in file detail drawer, not cluttering the view

---

### 5. APPS

**New Layout Structure:**

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  HEADER: Apps                                          [+ Create App]  │
│         │ ─────────────────────────────────────────────────────────────────────  │
│         │                                                                        │
│         │  ┌────────────────────────────────────────────────────────────────┐    │
│         │  │ [All Types ▾]  [Status ▾]              🔍 Search apps...       │    │
│         │  └────────────────────────────────────────────────────────────────┘    │
│         │                                                                        │
│         │  MY APPS                                                               │
│         │  ┌────────────────────────────────────────────────────────────────┐    │
│         │  │                                                                │    │
│         │  │  ┌─────────────────────────────────────────────────────────┐   │    │
│         │  │  │ 🖼️  Product Showcase          Image Slideshow           │   │    │
│         │  │  │     5 images · 10s per slide · Last edited 2h ago       │   │    │
│         │  │  │     Used in: Lobby Display, Retail Promo                │   │    │
│         │  │  └─────────────────────────────────────────────────────────┘   │    │
│         │  │                                                                │    │
│         │  │  ┌─────────────────────────────────────────────────────────┐   │    │
│         │  │  │ 🎬  Welcome Video              Video Player              │   │    │
│         │  │  │     promo-2024.mp4 · 0:45 · Last edited 1d ago          │   │    │
│         │  │  │     Used in: Entrance Display                           │   │    │
│         │  │  └─────────────────────────────────────────────────────────┘   │    │
│         │  │                                                                │    │
│         │  │  ┌─────────────────────────────────────────────────────────┐   │    │
│         │  │  │ 🌤️  Weather Widget             Weather                   │   │    │
│         │  │  │     New York, NY · Fahrenheit · Last edited 5d ago      │   │    │
│         │  │  │     Used in: Lobby Display, News Feed                   │   │    │
│         │  │  └─────────────────────────────────────────────────────────┘   │    │
│         │  │                                                                │    │
│         │  └────────────────────────────────────────────────────────────────┘    │
│         │                                                                        │
│         │  ─────────────────────────────────────────────────────────────────     │
│         │                                                                        │
│         │  APP TEMPLATES (for "Create App" flow)                                 │
│         │  ┌────────────────────────────────────────────────────────────────┐    │
│         │  │                                                                │    │
│         │  │  MEDIA                   DATA                    CUSTOM        │    │
│         │  │  ○ Image                 ○ Weather               ○ HTML        │    │
│         │  │  ○ Video                 ○ Clock                 ○ Web Embed   │    │
│         │  │  ○ Slideshow             ○ RSS Feed              ○ Iframe      │    │
│         │  │  ○ PDF Viewer            ○ Google Sheets                       │    │
│         │  │                          ○ Power BI (coming)                   │    │
│         │  │                                                                │    │
│         │  └────────────────────────────────────────────────────────────────┘    │
│         │                                                                        │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Key Changes:**
1. **List view, not grid** — Apps are configuration, not visual content
2. **Shows where apps are used** — Critical for understanding dependencies
3. **App templates grouped by category** — Not a modal, inline section
4. **Type shown as badge** — Quick visual indicator of app type

---

## Component Specifications

### Sidebar Navigation

```
WIDTH
────────────────────────────────────────
Collapsed:  56px (icons only)
Expanded:   240px (icons + labels)
Transition: 200ms ease-out

STRUCTURE
────────────────────────────────────────
┌──────────────────────────┐
│  [Logo]  Studio          │  ← 56px height
├──────────────────────────┤
│                          │
│  Overview                │  ← Nav items, 40px height each
│  Channels                │    12px icon, 8px gap, 14px text
│  Content                 │
│  Players                 │
│  Schedules               │
│  Apps                    │
│                          │
├──────────────────────────┤  ← Divider (1px, border color)
│                          │
│  Analytics               │  ← Secondary nav
│  Settings                │
│                          │
├──────────────────────────┤
│                          │
│  [Workspace Switcher]    │  ← Bottom, 56px height
│                          │
└──────────────────────────┘

STATES
────────────────────────────────────────
Default:    text-secondary, no background
Hover:      text-primary, bg-surface (subtle)
Active:     text-primary, bg-surface, left border accent (2px)
```

### Metric Cards (Dashboard)

```
┌────────────────────────────────────┐
│  LABEL                    [icon]   │  ← 12px, muted, uppercase
│  VALUE                             │  ← 24px, primary, semibold
│  CHANGE                            │  ← 12px, green/red + arrow
└────────────────────────────────────┘

SIZE: Flexible width, 80px min height
PADDING: 16px
BORDER: 1px solid border-color
BACKGROUND: surface
RADIUS: 8px
```

### Data Table (List Views)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  HEADER ROW                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ ☐  Name              Status       Channel       Last seen    ···   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  DATA ROWS                                                               │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ ☐  Lobby Display     ● Online     News Feed     2 min ago    ···   │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │ ☐  Entrance          ● Online     Promo         5 min ago    ···   │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │ ☐  Cafeteria         ○ Offline    Menu          3 hours ago  ···   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘

HEADER: 12px, muted, uppercase, 40px height, sticky
ROW: 14px, 52px height, hover bg-surface
BORDER: Between rows, subtle (border-subtle)
CHECKBOX: 16px, rounded 4px
STATUS DOT: 8px, inline before text
ACTIONS (...): Appears on hover, right aligned
```

### Empty States

```
STRUCTURE
────────────────────────────────────────
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   [Contextual illustration or mini-preview, NOT a generic icon]│
│                                                                │
│   HEADLINE (what to do, not what's missing)                    │
│   Description with clear next step                             │
│                                                                │
│   [Primary Action Button]                                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘

GOOD: "Create your first channel" with layout template previews
BAD:  "No channels yet" with a generic icon

GOOD: Pairing code shown immediately for players
BAD:  "No players found" with a screen icon
```

### Buttons

```
PRIMARY
────────────────────────────────────────
Background: accent-primary
Text: white
Height: 36px
Padding: 0 16px
Radius: 6px
Font: 14px, 500 weight
Hover: darken 10%
Active: darken 15%

SECONDARY
────────────────────────────────────────
Background: transparent
Border: 1px solid border-color
Text: text-primary
Hover: bg-surface

GHOST
────────────────────────────────────────
Background: transparent
Text: text-secondary
Hover: bg-surface, text-primary
```

### Status Indicators

```
ONLINE    ● #059669 (green)
OFFLINE   ○ #71717A (gray, hollow)
PENDING   ◐ #D97706 (amber, half-filled)
ERROR     ● #DC2626 (red)
DRAFT     ○ #71717A (gray, hollow) + "Draft" label

SIZE: 8px diameter
POSITION: Inline, before text, 6px gap
```

---

## Interaction Patterns

### Navigation

```
BREADCRUMBS
────────────────────────────────────────
Workspace > Channels > Lobby Display > Edit
     ↑          ↑           ↑           ↑
  clickable  clickable  clickable    current (not clickable)

Separator: " > " or " / " (text-muted)
Current page: text-primary, no link
```

### Keyboard Shortcuts

```
GLOBAL
────────────────────────────────────────
⌘ + K         Command palette (search everything)
⌘ + /         Toggle sidebar
⌘ + N         New (context-aware: channel, player, etc.)

IN LISTS
────────────────────────────────────────
↑ / ↓         Navigate items
Enter         Open selected
⌘ + Click     Multi-select
Delete        Delete selected (with confirmation)
```

### Command Palette (⌘K)

```
┌────────────────────────────────────────────────────────────────┐
│  🔍 Search or type a command...                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  RECENT                                                        │
│  ○ Lobby Display                              Channel          │
│  ○ Product Showcase                           App              │
│                                                                │
│  ACTIONS                                                       │
│  + Create new channel                         ⌘ + Shift + C    │
│  + Upload content                             ⌘ + Shift + U    │
│  + Register player                            ⌘ + Shift + P    │
│                                                                │
│  NAVIGATION                                                    │
│  → Go to Channels                             G then C         │
│  → Go to Players                              G then P         │
│  → Go to Settings                             G then S         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Animation Guidelines

```
TIMING
────────────────────────────────────────
Micro (hover, focus):     100-150ms
Small (toggles, fades):   200ms
Medium (panels, modals):  300ms
Large (page transitions): 400-500ms

EASING
────────────────────────────────────────
Default:      ease-out (decelerate)
Enter:        cubic-bezier(0, 0, 0.2, 1)
Exit:         cubic-bezier(0.4, 0, 1, 1)
Bounce:       cubic-bezier(0.34, 1.56, 0.64, 1)

WHAT TO ANIMATE
────────────────────────────────────────
✓ Page transitions (fade + slight slide)
✓ Modal/drawer open/close
✓ Sidebar collapse/expand
✓ Status changes (pulse on update)
✓ Loading states (skeleton shimmer)

✗ Every hover (too distracting)
✗ Data table row changes (too busy)
✗ Form field focus (keep it simple)
```

---

## Responsive Breakpoints

```
DESKTOP (default)         ≥1280px
────────────────────────────────────────
- Sidebar expanded
- Full layouts as designed

TABLET                    768px - 1279px
────────────────────────────────────────
- Sidebar collapsed (icon-only)
- 2-column layouts become single column
- Map + panel becomes stacked

MOBILE                    <768px
────────────────────────────────────────
- Sidebar becomes bottom nav (5 icons)
- Full-width everything
- Map hidden, list/grid only
- Modals become full-screen sheets
```

---

## Summary: The 7 Principles

1. **Lead with data, not decoration**
   Your users care about uptime, player status, and content performance. Show numbers, not illustrations.

2. **Make empty states actionable**
   Don't show a sad icon. Show the first step (pairing code, template picker, upload zone).

3. **Use the map as your differentiator**
   It's your hero feature. Make it prominent, interactive, and useful.

4. **Prefer lists over grids for configuration**
   Apps, schedules, settings = list view. Content, channels = grid view.

5. **Reduce visual noise**
   One accent color. Consistent spacing. No unnecessary borders.

6. **Status should be glanceable**
   A colored dot beats a colored badge. A number beats a progress ring.

7. **Build for keyboard power users**
   ⌘K command palette, keyboard shortcuts, focus states. Your users will thank you.

---

## Next Steps

1. **Start with the Dashboard** — It's the first impression. Nail the metrics row + map + activity feed.

2. **Design the Channel Editor** — This is where the magic happens. Multi-zone layout builder needs a lot of love.

3. **Build a component library** — Before building pages, build: Button, Input, Card, Table, Status, Modal, Drawer.

4. **Implement dark/light toggle** — Not everyone wants dark mode. Give them the choice.

5. **Add keyboard shortcuts** — Start with ⌘K. It changes everything.

---

## Responsive Layout Architecture

### Philosophy

This app is **mobile-first**: base styles target 320px minimum and scale up. Every layout decision starts with the smallest screen and progressively enhances.

### Breakpoint System

```
320px  ←──────── Mobile (base) ──────────→ 767px
768px  ←──────── Tablet (md:) ───────────→ 1023px
1024px ←──────── Laptop (lg:) ───────────→ 1439px
1440px ←──────── Desktop (xl:) ──────────→ 1919px
1920px ←──────── Ultrawide (2xl:) ────────→ ∞
```

### Shell Layout (Sidebar + Main Content)

```
┌─────────────────────────────────────────┐
│ MOBILE (< 768px)                        │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ HEADER  [☰] [breadcrumb]  [🔔][👤] │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │         MAIN CONTENT                │ │
│ │         (full width)                │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [SIDEBAR = off-screen, slides in as     │
│  overlay when hamburger is tapped]      │
└─────────────────────────────────────────┘

┌────┬────────────────────────────────────┐
│    │ TABLET / DESKTOP (≥ 768px)         │
│ S  ├────────────────────────────────────┤
│ I  │ HEADER  [breadcrumb]  [🔍][🔔][👤]│
│ D  ├────────────────────────────────────┤
│ E  │                                    │
│ B  │        MAIN CONTENT                │
│ A  │        (calc(100% - sidebarW))     │
│ R  │                                    │
└────┴────────────────────────────────────┘
```

### Page Layout Patterns

#### Hero Banner
```
Mobile:   flex-col — title/desc stacked, CTA below
Desktop:  flex-row — title/desc left, CTA right
```

#### Stat Cards
```
Mobile:   grid 2-cols (2×2 or 2×3)
Desktop:  flex row (all in one line)
```

#### Content Grids
```
Mobile:   1 or 2 columns
Tablet:   2 or 3 columns
Desktop:  3 or 4 columns
```

#### Toolbars (Filter + Search)
```
Mobile:   flex-col, filter tabs scroll horizontally
Desktop:  flex-row, justified left/right
```

### Critical CSS Utilities Added

```css
/* In globals.css */

.page-container {
  padding: clamp(0.75rem, 2vw, 1.25rem);
}

.responsive-hero {
  padding: clamp(1rem, 3vw, 1.75rem) clamp(1rem, 4vw, 1.75rem);
}

.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.scroll-x {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}
```

### Typography

All headings use `clamp()` for fluid scaling:

| Element | Value |
|---|---|
| `h1` | `clamp(1.5rem, 4vw, 2rem)` |
| `h2` | `clamp(1.25rem, 3vw, 1.5rem)` |
| `h3` | `clamp(1.1rem, 2.5vw, 1.25rem)` |
| All inputs/textareas | `font-size: max(1rem, 16px)` — prevents iOS zoom |

### Accessibility

- All touch targets meet WCAG 2.1 minimum of 44×44px via `.touch-target`
- Hamburger button: `aria-label="Open navigation menu"`
- Mobile sidebar close button: `aria-label="Close navigation menu"`
- Mobile search button: `aria-label="Search"`, `aria-label="Notifications"` on bell
- Keyboard navigation fully preserved (no interactive elements removed)
- `overflow-x: hidden` on `body` prevents horizontal scroll bleed

### Preserved Desktop Features

- Sidebar hover-expand animation (Framer Motion) — desktop only
- Search bar expand animation `180px → 260px` — desktop only
- ⌘K keyboard shortcut hint in search — desktop only
- Collapse toggle chevron — hidden on mobile (`hidden md:flex`)
- Analytics two-column layout — desktop only (`lg:grid-cols-[1fr_380px]`)

### Files Changed for Responsiveness

| File | Changes |
|---|---|
| `contexts/sidebar-context.tsx` | Added `mobileOpen`, `openMobile()`, `closeMobile()` |
| `components/layout/sidebar.tsx` | Mobile overlay, backdrop, close button, `md:translate-x-0` |
| `components/layout/header.tsx` | Hamburger button, mobile search overlay, `useSidebar` |
| `app/(dashboard)/layout.tsx` | JS margin = 0 on mobile via `matchMedia` listener |
| `app/globals.css` | `clamp()` headings, `.touch-target`, `.page-container`, `.responsive-hero`, `.scroll-x`, `img max-width`, `overflow-x hidden` on body |
| `app/(dashboard)/home/page.tsx` | Hero flex-col mobile, responsive padding |
| `app/(dashboard)/content/page.tsx` | Stat cards 2-col grid mobile, folder grid responsive, toolbar stack |
| `app/(dashboard)/apps/page.tsx` | Stat cards 2/3/5 grid, app card grid 1/2/3 col, hero stack |
| `app/(dashboard)/channels/page.tsx` | Hero stack, stat cards grid, filter toolbar stack |
| `app/(dashboard)/players/page.tsx` | Hero stack, stat cards grid, split layout flex-col on mobile |
| `app/(dashboard)/schedules/page.tsx` | Hero stack, stat cards grid, toolbar stack |
| `app/(dashboard)/analytics/page.tsx` | Hero stack, KPI 2/4 grid, time tabs scroll, overview 1/2-col |
| `app/(dashboard)/settings/page.tsx` | Mobile tab bar (scroll-x), desktop sidebar only, form grid responsive |
| `app/(auth)/layout.tsx` | Reduced padding on mobile, responsive heading |