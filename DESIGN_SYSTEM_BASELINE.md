# RusingÂcademy Design System Baseline

**Author:** Manus AI — Design Engineering Division
**Date:** February 16, 2026
**Purpose:** Define the canonical design tokens, component standards, state templates, and bilingual rules that will govern all 20 beautification waves. Every change must conform to this baseline.

---

## 1. Design Philosophy

RusingÂcademy serves Canadian public servants preparing for Second Language Evaluation (SLE) exams. The design must project **institutional credibility** while remaining **warm, motivating, and modern**. The aesthetic sits at the intersection of government-grade professionalism (GC Design System [1]) and premium EdTech engagement (Duolingo, Coursera, Khan Academy). Every visual decision must pass three gates:

1. **Would a Deputy Minister trust this interface?** (Credibility gate)
2. **Would a learner feel motivated to return daily?** (Engagement gate)
3. **Can every user, regardless of ability, navigate this?** (Accessibility gate)

---

## 2. Color System

### 2.1 Core Palette

All colors are defined in OKLCH format for Tailwind CSS 4 compatibility and perceptual uniformity. The palette is organized into semantic roles, not arbitrary hex values.

| Token | OKLCH Value | Hex Equivalent | Usage |
|---|---|---|---|
| `--color-teal-900` | `oklch(0.35 0.08 195)` | `#0D5C5F` | Darkest teal — headings, high-emphasis text |
| `--color-teal-700` | `oklch(0.45 0.10 195)` | `#0D7377` | Primary brand — buttons, links, active states |
| `--color-teal-500` | `oklch(0.55 0.10 195)` | `#008090` | Standard brand — icons, borders, badges |
| `--color-teal-100` | `oklch(0.92 0.03 195)` | `#E6F5F5` | Teal tint — card backgrounds, hover states |
| `--color-teal-50` | `oklch(0.97 0.01 195)` | `#F0FAFA` | Lightest teal — page backgrounds |
| `--color-gold-500` | `oklch(0.75 0.15 85)` | `#F5A623` | Accent — achievements, XP, highlights |
| `--color-gold-100` | `oklch(0.93 0.05 85)` | `#FEF3D6` | Gold tint — badge backgrounds |
| `--color-cream` | `oklch(0.97 0.01 90)` | `#FAF8F5` | Warm neutral — page canvas |
| `--color-slate-900` | `oklch(0.25 0.02 260)` | `#1A1D23` | Body text |
| `--color-slate-600` | `oklch(0.50 0.02 260)` | `#64748B` | Secondary text |
| `--color-slate-400` | `oklch(0.65 0.01 260)` | `#94A3B8` | Tertiary text, placeholders |
| `--color-slate-100` | `oklch(0.92 0.005 260)` | `#F1F5F9` | Borders, dividers |

### 2.2 Portal Accent Colors

Each portal retains its distinct accent for wayfinding, but all accents are now drawn from the token system:

| Portal | Accent Token | Value | Foreground on Accent |
|---|---|---|---|
| **Learner** | `--accent-learner` | `oklch(0.45 0.10 195)` / `#0D7377` | White |
| **Coach** | `--accent-coach` | `oklch(0.45 0.14 295)` / `#7C3AED` | White |
| **Client (HR)** | `--accent-client` | `oklch(0.50 0.16 260)` / `#2563EB` | White |
| **Admin** | `--accent-admin` | `oklch(0.55 0.18 25)` / `#DC2626` | White |

### 2.3 Semantic Color Mapping

These CSS custom properties map to Tailwind's semantic classes (`bg-primary`, `text-destructive`, etc.):

| Semantic Token | Light Theme Value | Purpose |
|---|---|---|
| `--background` | `--color-cream` | Page canvas |
| `--foreground` | `--color-slate-900` | Primary text |
| `--card` | `white` | Card surfaces |
| `--card-foreground` | `--color-slate-900` | Card text |
| `--primary` | `--color-teal-700` | Primary actions |
| `--primary-foreground` | `white` | Text on primary |
| `--secondary` | `--color-slate-100` | Secondary surfaces |
| `--muted` | `--color-slate-100` | Muted backgrounds |
| `--muted-foreground` | `--color-slate-600` | Muted text |
| `--accent` | `--color-gold-500` | Highlights, rewards |
| `--destructive` | `oklch(0.55 0.20 25)` | Errors, deletions |
| `--border` | `--color-slate-100` | Default borders |

### 2.4 Contrast Requirements

All text-background combinations must meet WCAG 2.2 AA minimum contrast ratios [2]:

| Text Size | Minimum Ratio | Verification |
|---|---|---|
| Normal text (< 18px) | 4.5:1 | `--foreground` on `--background` = 14.2:1 ✓ |
| Large text (≥ 18px bold or ≥ 24px) | 3:1 | `--primary` on `white` = 5.8:1 ✓ |
| UI components (icons, borders) | 3:1 | `--color-teal-500` on `white` = 4.1:1 ✓ |

---

## 3. Typography System

### 3.1 Font Stack

| Role | Font Family | Weight Range | Fallback |
|---|---|---|---|
| **Display** (hero headings, page titles) | `Playfair Display` | 600–700 | `Georgia, serif` |
| **Body** (all other text) | `Inter` | 300–700 | `system-ui, sans-serif` |

`DM Serif Display` is retired from the design system. `Merriweather` is available as a fallback but not actively used. All heading fonts must be `Playfair Display`; all body text must be `Inter`.

### 3.2 Type Scale (Based on 1.250 Major Third)

The type scale follows a **Major Third** ratio (1.250), anchored at 16px base, producing a harmonious progression. All sizes use `rem` units for accessibility (respects user font-size preferences).

| Token | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `text-display` | 2.441rem (39px) | 1.1 | 700 | Hero headlines only |
| `text-h1` | 1.953rem (31px) | 1.2 | 700 | Page titles |
| `text-h2` | 1.563rem (25px) | 1.25 | 600 | Section headings |
| `text-h3` | 1.25rem (20px) | 1.3 | 600 | Card titles, subsections |
| `text-h4` | 1rem (16px) | 1.4 | 600 | Labels, nav items |
| `text-body` | 1rem (16px) | 1.5 | 400 | Body copy |
| `text-body-sm` | 0.875rem (14px) | 1.5 | 400 | Secondary text, descriptions |
| `text-caption` | 0.75rem (12px) | 1.4 | 500 | Captions, metadata, badges |
| `text-overline` | 0.6875rem (11px) | 1.3 | 600 | Overlines, stat labels (UPPERCASE) |

**Banned values:** `text-[10px]`, `text-[9px]`, `text-[11px]`, `text-[18px]`, and all arbitrary pixel-based font sizes. These must be migrated to the nearest scale token.

---

## 4. Spacing System (8px Grid)

All spacing follows the **8-point grid** [3] [4]. Tailwind's default spacing scale maps naturally:

| Token | Value | Tailwind Class | Usage |
|---|---|---|---|
| `space-0` | 0px | `p-0` / `m-0` | Reset |
| `space-1` | 4px | `p-1` / `m-1` | Tight inline spacing |
| `space-2` | 8px | `p-2` / `m-2` | Icon-to-text gaps |
| `space-3` | 12px | `p-3` / `m-3` | Compact card padding |
| `space-4` | 16px | `p-4` / `m-4` | Standard card padding |
| `space-5` | 20px | `p-5` / `m-5` | Section inner padding |
| `space-6` | 24px | `p-6` / `m-6` | Card body padding |
| `space-8` | 32px | `p-8` / `m-8` | Section gaps |
| `space-10` | 40px | `p-10` / `m-10` | Page-level padding |
| `space-12` | 48px | `p-12` / `m-12` | Major section separation |
| `space-16` | 64px | `p-16` / `m-16` | Hero section padding |

**Standard page container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` — consistent across all portal pages.

---

## 5. Border Radius System

Three semantic radius values replace the current four competing values:

| Token | Value | Tailwind Class | Usage |
|---|---|---|---|
| `radius-sm` | 8px | `rounded-lg` | Buttons, inputs, small elements |
| `radius-md` | 12px | `rounded-xl` | Cards, modals, dropdowns |
| `radius-lg` | 16px | `rounded-2xl` | Hero cards, feature panels |
| `radius-full` | 9999px | `rounded-full` | Avatars, badges, pills |

**Rule:** `rounded-md` and `rounded-sm` are deprecated for card-level elements. All cards use `rounded-xl`. All buttons use `rounded-lg`.

---

## 6. Shadow System

Shadows encode **elevation hierarchy** — higher elevation means more interactive or more prominent:

| Token | Value | Tailwind Class | Usage |
|---|---|---|---|
| `shadow-card` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | `shadow-sm` | Static cards, containers |
| `shadow-elevated` | `0 4px 12px rgba(0,0,0,0.08)` | `shadow-md` | Hover states, dropdowns |
| `shadow-modal` | `0 12px 40px rgba(0,0,0,0.12)` | `shadow-lg` | Modals, popovers, floating panels |
| `shadow-glow` | `0 0 20px rgba(13,115,119,0.15)` | Custom | Active/focus glow on primary elements |

**Rule:** Cards at rest use `shadow-card`. On hover, they transition to `shadow-elevated` with `transition-shadow duration-200`. Modals and floating elements use `shadow-modal`.

---

## 7. Component Standards

### 7.1 Card Component

Every card in the ecosystem must follow this structure:

```
┌─────────────────────────────┐
│  padding: space-6 (24px)    │
│  bg: white                  │
│  border: 1px solid border   │
│  radius: radius-md (12px)   │
│  shadow: shadow-card        │
│  hover: shadow-elevated     │
│  transition: shadow 200ms   │
└─────────────────────────────┘
```

Tailwind: `bg-white border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6`

### 7.2 Button Hierarchy

| Variant | Tailwind Classes | Usage |
|---|---|---|
| **Primary** | `bg-primary text-white rounded-lg px-4 py-2.5 font-medium hover:opacity-90` | Main CTA per section |
| **Secondary** | `bg-secondary text-foreground rounded-lg px-4 py-2.5 font-medium hover:bg-secondary/80` | Alternative actions |
| **Outline** | `border border-border text-foreground rounded-lg px-4 py-2.5 font-medium hover:bg-muted` | Tertiary actions |
| **Ghost** | `text-muted-foreground rounded-lg px-3 py-2 hover:bg-muted` | Inline actions, icon buttons |
| **Destructive** | `bg-destructive text-white rounded-lg px-4 py-2.5 font-medium` | Delete, cancel actions |

**Rule:** Maximum one Primary button per visible section. Use Secondary or Outline for all other actions.

### 7.3 Stat Card

Stat cards (used across all dashboards) follow a standardized pattern:

```
┌──────────────────────┐
│  Icon (24px, accent)  │
│  Value (text-h2, bold)│
│  Label (text-overline)│
│  padding: space-4     │
│  bg: white or tint    │
└──────────────────────┘
```

### 7.4 Navigation Item (Sidebar)

```
Active:   bg-accent/10 text-accent font-semibold rounded-lg
Inactive: text-slate-600 hover:bg-muted rounded-lg
Padding:  px-3 py-2.5
Icon:     20px, same color as text
Gap:      space-3 (12px) between icon and label
```

---

## 8. State Templates

### 8.1 Loading State

Every data-dependent section must show a skeleton while loading. The skeleton uses `animate-pulse` with `bg-muted rounded-lg` blocks that match the expected content layout.

```tsx
// Standard loading skeleton pattern
<div className="animate-pulse space-y-4">
  <div className="h-6 bg-muted rounded-lg w-1/3" />
  <div className="grid grid-cols-3 gap-4">
    {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}
  </div>
</div>
```

### 8.2 Empty State

Every list, table, or collection must handle the empty case with an illustration, message, and CTA:

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <span className="material-icons text-5xl text-muted-foreground/40 mb-4">inbox</span>
  <h3 className="text-h3 font-semibold text-foreground mb-2">{title}</h3>
  <p className="text-body-sm text-muted-foreground mb-6 max-w-sm">{description}</p>
  <Button variant="primary">{ctaLabel}</Button>
</div>
```

### 8.3 Error State

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <span className="material-icons text-4xl text-destructive/60 mb-4">error_outline</span>
  <h3 className="text-h3 font-semibold text-foreground mb-2">Something went wrong</h3>
  <p className="text-body-sm text-muted-foreground mb-6">{error.message}</p>
  <Button variant="outline" onClick={retry}>Try Again</Button>
</div>
```

---

## 9. Animation Standards

### 9.1 Entrance Animations

Page-level content uses staggered fade-in-up with Framer Motion:

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
};
```

### 9.2 Micro-Interactions

| Interaction | Animation | Duration |
|---|---|---|
| Card hover | `shadow-sm → shadow-md` + `translateY(-1px)` | 200ms |
| Button press | `scale(0.98)` | 100ms |
| Toggle switch | `translateX` with spring | 300ms |
| Progress fill | `width` transition | 600ms ease-out |
| XP gain | Counter increment + gold pulse | 800ms |

### 9.3 Animation Budget

Maximum **3 concurrent animations** per viewport at any time. Page entrance animations complete before hover animations become active. No animation should exceed 800ms.

---

## 10. Bilingual Rules

### 10.1 Mandatory i18n Pattern

Every user-facing string must use the `t()` function from `useLanguage()`. Inline ternaries (`lang === "fr" ? ... : ...`) are acceptable only for data-driven content not in the dictionary.

```tsx
// ✅ Correct
const { t, lang } = useLanguage();
<h1>{t("dashboard.title")}</h1>

// ✅ Acceptable for dynamic data
<span>{lang === "fr" ? item.titleFr : item.title}</span>

// ❌ Banned
<h1>Dashboard</h1>  // Hardcoded English
```

### 10.2 Layout Rules for French Text

French text averages 15-30% longer than English. All layouts must accommodate this:

- Use `min-w-0` and `truncate` on constrained containers
- Buttons must use `px-4` minimum (never `px-2`) to accommodate longer French labels
- Stat labels must use `text-overline` (11px uppercase) which is naturally compact
- Navigation items must allow text wrapping on collapsed sidebars

### 10.3 Language Toggle Placement

The language toggle must be accessible within **one click** from any page state:

- **Desktop:** Visible in the sidebar footer area (all portals)
- **Mobile:** Visible in the mobile header bar (not hidden behind hamburger)
- **Login/Landing:** Visible in the top navigation bar

---

## 11. Icon System Rules

**Primary system:** Material Icons (Google Fonts CDN) — used for navigation, sidebars, and system UI.
**Secondary system:** Lucide React — used for inline content icons, decorative elements, and shadcn/ui components.

**Rule:** Within a single component, use only one icon system. Sidebars and navigation use Material Icons exclusively. Page content and shadcn/ui components use Lucide exclusively.

---

## 12. Responsive Breakpoints

| Breakpoint | Width | Usage |
|---|---|---|
| `sm` | 640px | Mobile landscape, small tablets |
| `md` | 768px | Tablets, sidebar collapse point |
| `lg` | 1024px | Desktop, sidebar expand point |
| `xl` | 1280px | Wide desktop |
| `2xl` | 1536px | Ultra-wide |

**Rule:** Design mobile-first. Every page must be usable at 375px width (iPhone SE). Sidebar collapses below `lg`. Grid columns reduce: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`.

---

## References

[1] GC Design System — Canada.ca. https://design-system.canada.ca/
[2] WCAG 2.2 — Contrast Requirements. https://www.w3.org/TR/WCAG22/#contrast-minimum
[3] 8-Point Grid System — UX Planet. https://uxplanet.org/everything-you-should-know-about-8-point-grid-system-in-ux-design-b69cb945b18d
[4] Atlassian Design System — Spacing. https://atlassian.design/foundations/spacing
