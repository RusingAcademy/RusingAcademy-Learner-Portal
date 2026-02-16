# RusingÂcademy LRDG Ecosystem — Beautification & Aesthetification Audit

**Author:** Manus AI — Design Engineering Division
**Date:** February 16, 2026
**Scope:** Full UI/UX audit of the Learning Portal, Coach Portal, Client (HR) Portal, Admin Control System, Login, Landing Page, and all shared components.
**Codebase:** 55,122 lines across 80+ TypeScript/React files, 4 portal layouts, 12,063 lines of course data, 586-line bilingual i18n dictionaries.

---

## 1. Executive Summary

The RusingÂcademy LRDG ecosystem is a functionally rich, multi-portal bilingual learning platform serving Canadian public servants. The current implementation demonstrates strong feature breadth — gamification, AI coaching, SLE exam preparation, multi-role portals, and real-time progress tracking. However, the visual layer has accumulated significant **design debt** across 50+ sprints of rapid feature development. This audit identifies 30 critical pain points organized into six diagnostic categories, each grounded in research from the GC Design System [1], WCAG 2.2 AA [2], the USWDS [3], and leading EdTech UX literature [4] [5].

The core finding is that the ecosystem suffers from **visual fragmentation** — each portal and page was built with locally scoped styles rather than drawing from a unified design system. This results in 619 hardcoded color references versus only 19 uses of CSS semantic variables, 7 different font-size scales, inconsistent border-radius usage (4 competing values), and 39 pages without bilingual support. Addressing these issues systematically will elevate the platform from "functional prototype" to "world-class institutional product."

---

## 2. Audit Methodology

The audit was conducted across five dimensions, each mapped to recognized standards:

| Dimension | Standard / Framework | Key Metrics |
|---|---|---|
| **Visual Consistency** | Material Design 3, Atlassian Design System | Token adoption rate, color variance, spacing entropy |
| **Accessibility** | WCAG 2.2 AA, GC Design System, ACA | ARIA coverage, contrast ratios, focus management, skip links |
| **Bilingual Compliance** | GC Standard on Official Languages, Canada.ca guidelines | i18n coverage per page, RTL-safe layouts, language toggle reach |
| **Information Architecture** | Nielsen Norman Group heuristics, EdTech UX research | Navigation depth, cognitive load, empty/error state coverage |
| **Performance UX** | Core Web Vitals, perceived performance research | Loading skeleton coverage, progressive disclosure, animation budget |

---

## 3. Diagnostic Categories & Top 30 Pain Points

### Category A — Design Token Fragmentation (Critical)

**A1. Hardcoded Colors Dominate the Codebase**
The ecosystem contains **619 hardcoded color references** (e.g., `#008090`, `#f5a623`, `#0D7377`) versus only **19 uses of semantic CSS variables** (`bg-primary`, `text-accent`). This means 97% of color usage bypasses the theme system entirely. Any future rebranding, dark mode, or accessibility contrast adjustment would require touching hundreds of files.

**A2. Inconsistent Accent Color System Across Portals**
Each portal defines its own `ACCENT` constant at the file level: Learner Portal uses `#008090` (teal), Coach Portal uses `#7c3aed` (violet), Client Portal uses `#2563eb` (blue), Admin uses `#dc2626` (red). While the differentiation is intentional, the implementation is fragile — 14 separate `const ACCENT = "..."` declarations with no shared token layer.

**A3. Typography Scale Chaos**
The codebase uses **195 instances of `text-[10px]`**, 67 of `text-[11px]`, 21 of `text-[9px]`, and 33 of `text-[18px]` — all arbitrary pixel values outside any typographic scale. Two font families compete for heading duty: `Playfair Display` (68 uses) and `DM Serif Display` (4 uses), with no clear hierarchy rule.

**A4. Border Radius Inconsistency**
Four competing radius values are used: `rounded-xl` (379 uses), `rounded-full` (251), `rounded-lg` (177), and `rounded-2xl` (80). Cards sometimes use `rounded-xl`, sometimes `rounded-2xl`, with no pattern governing which applies where.

**A5. Shadow Scale Disorder**
Shadow usage spans `shadow-sm` (136), `shadow-md` (65), `shadow-lg` (28), and `shadow-xl` (9) with no semantic mapping. Interactive cards and static containers share the same shadow levels, eliminating depth hierarchy.

---

### Category B — Accessibility Gaps (High Priority)

**B1. Critically Low ARIA Coverage**
Only **11 ARIA labels** exist across all 80+ page files. For a platform serving Canadian public servants — where the Accessible Canada Act (ACA) and WCAG 2.2 AA compliance are expected — this is a significant gap. Interactive elements (stat cards, progress rings, badge grids) lack `role`, `aria-label`, and `aria-describedby` attributes.

**B2. Insufficient Focus Management**
While 55 focus-related styles exist, they are concentrated in a few components. Many interactive elements (sidebar nav items, card actions, modal triggers) lack visible focus indicators, violating WCAG 2.4.7 (Focus Visible) [2].

**B3. Skip Links Present but Incomplete**
Skip-to-content links exist in 3 of 4 portal layouts (missing from the Learner Portal's `Sidebar.tsx`). The skip link targets (`#main-content`) are not consistently applied to the main content regions.

**B4. Color Contrast Concerns**
The `text-[10px]` pattern (195 instances) combined with light gray colors on white backgrounds risks failing WCAG 1.4.3 (Contrast Minimum). Small text requires a 4.5:1 contrast ratio, and many stat labels use `text-gray-400` or `text-gray-500` on white.

**B5. Missing Landmark Roles**
Only 3 explicit `role` attributes exist. Page regions (navigation, main, complementary, contentinfo) are not semantically marked, making screen reader navigation difficult.

---

### Category C — Bilingual Compliance Gaps (High Priority)

**C1. 39 Pages Without i18n Integration**
Of the total page files, **39 do not import `useLanguage()`**, meaning they render English-only content regardless of the user's language preference. This includes critical pages: `Achievements.tsx`, `Calendar.tsx`, `Leaderboard.tsx`, `LearningMaterials.tsx`, `LessonViewer.tsx`, `Help.tsx`, `MyProfile.tsx`, and `MySettings.tsx`.

**C2. Inconsistent Translation Pattern**
Pages that do support bilingual content use three different patterns: (a) inline ternary (`lang === "fr" ? "Bonjour" : "Hello"`), (b) the `t()` function from `useLanguage()`, and (c) dual-field objects (`{ label: "...", labelFr: "..." }`). This inconsistency makes maintenance error-prone.

**C3. i18n Dictionary Gaps**
The translation files (`en.ts`, `fr.ts`) contain 586 lines each, but many page-specific strings are hardcoded rather than drawn from the dictionary. The dictionary covers common UI strings but lacks coverage for domain-specific content (gamification labels, coaching terms, compliance vocabulary).

**C4. Language Toggle Not Universally Accessible**
The language switcher is embedded in each portal's sidebar, but its position and style vary. On mobile viewports, the language toggle may be hidden behind the hamburger menu, requiring two taps to switch language.

**C5. No French-First Testing**
The platform defaults to English. There is no evidence of French-first layout testing, which can reveal truncation issues (French text is typically 15-30% longer than English equivalents).

---

### Category D — Layout & Information Architecture (Medium-High)

**D1. Inconsistent Page Padding and Spacing**
Page-level padding varies wildly: `p-2` (273 uses), `p-4` (255), `p-3` (208), `p-5` (91), `p-6` (80), `p-8` (38). There is no standardized page container pattern, leading to visual inconsistency when navigating between pages within the same portal.

**D2. Responsive Breakpoint Coverage is Thin**
Only 180 responsive breakpoint utilities across 80+ files (averaging 2.25 per file). Many pages are desktop-first with minimal mobile adaptation. The Learner Portal sidebar collapses on mobile, but page content often does not reflow properly.

**D3. Empty State Coverage is Minimal**
Only 19 empty-state patterns exist across the entire codebase. Pages like Achievements, Bookmarks, Notes, and Calendar show blank white space when no data exists, rather than guiding the user with illustrations and CTAs.

**D4. Loading State Inconsistency**
74 loading-related patterns exist, but implementation varies: some pages use skeleton screens, others use spinners, and several show nothing during data fetch. There is no shared `LoadingSkeleton` component pattern.

**D5. Error State Coverage is Weak**
42 error-related patterns exist, but most are `console.error` calls rather than user-facing error UI. When a tRPC query fails, many pages simply show a blank screen rather than a helpful error message with retry action.

---

### Category E — Visual Polish & Micro-Interactions (Medium)

**E1. Animation is Concentrated, Not Distributed**
Only 2 of 80+ pages use Framer Motion (`Home.tsx`, `Login.tsx`). The remaining pages use basic CSS transitions. There is no entrance animation system for page transitions, card reveals, or list item staggering.

**E2. Card Design Inconsistency**
Cards across portals use different combinations of background, border, shadow, and radius. Some cards have `bg-white border border-gray-100 shadow-sm rounded-xl`, others use `bg-[#f8fafc] rounded-2xl`, and admin cards use `bg-white/80 backdrop-blur`. There is no unified `Card` variant system.

**E3. Icon System Fragmentation**
The project uses both Material Icons (Google Fonts CDN) and Lucide React icons, with no clear rule for when to use which. Material Icons appear in sidebars and navigation; Lucide appears in page content. This creates visual inconsistency in icon weight and style.

**E4. Button Hierarchy is Unclear**
Buttons across the ecosystem lack a clear primary/secondary/tertiary hierarchy. Many use custom inline styles rather than the shadcn/ui `Button` component variants, resulting in inconsistent hover states, padding, and font weights.

**E5. Progress Visualization Inconsistency**
Progress is shown via: (a) linear progress bars, (b) circular progress rings, (c) percentage text, and (d) XP counters — sometimes all on the same page. There is no unified progress component system.

---

### Category F — Trust, Credibility & Conversion (Medium)

**F1. Login Page Lacks Social Proof**
The Login page focuses on authentication mechanics but does not display trust signals (testimonials, institutional logos, success metrics) that would reassure government decision-makers evaluating the platform.

**F2. Landing Page (Home.tsx) is Dense**
The landing page contains testimonials, team bios, YouTube carousels, FAQ, and booking CTAs — all valuable — but the visual hierarchy does not guide the eye through a clear conversion funnel. Sections compete for attention rather than building a narrative.

**F3. Footer Inconsistency Across Portals**
The landing page has a comprehensive footer with social links and legal information. The authenticated portal pages have minimal or no footer, missing the institutional credibility signal of "© 2026 Rusinga International Consulting Ltd."

**F4. No Onboarding Completion Indicator**
The `OnboardingWizard.tsx` exists but there is no persistent indicator showing onboarding progress or encouraging completion for users who abandon mid-flow.

**F5. Missing Trust Badges and Compliance Indicators**
For a platform serving Canadian public servants, visible compliance indicators (WCAG AA badge, bilingual certification, data residency statement) would significantly increase institutional trust.

---

## 4. Quantitative Summary

| Metric | Current State | Target State |
|---|---|---|
| Hardcoded colors | 619 | 0 (100% token-based) |
| Semantic CSS variable usage | 19 | 600+ |
| ARIA labels | 11 | 200+ |
| Pages with i18n | 41/80 (51%) | 80/80 (100%) |
| Responsive breakpoints per file | 2.25 avg | 8+ avg |
| Empty state patterns | 19 | 80+ |
| Loading skeleton patterns | ~20 | 80+ |
| Framer Motion pages | 2 | 40+ |
| Shared component variants | ~5 | 30+ |
| Typography scale values | 7+ arbitrary | 1 unified scale |
| Border radius values | 4 competing | 3 semantic (sm/md/lg) |

---

## 5. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Visual regression during refactor | Medium | High | Wave-by-wave execution with checkpoint per wave |
| i18n string breakage | Medium | Medium | Automated test for all translation keys |
| Accessibility regression | Low | High | Lighthouse CI + axe-core checks per wave |
| Performance degradation from animations | Low | Medium | Animation budget (max 3 concurrent animations per viewport) |
| Route/link breakage | Low | Critical | Automated route smoke test before each checkpoint |

---

## References

[1] GC Design System — Canada.ca. https://design-system.canada.ca/
[2] Web Content Accessibility Guidelines (WCAG) 2.2 — W3C. https://www.w3.org/TR/WCAG22/
[3] U.S. Web Design System (USWDS) — Design Tokens. https://designsystem.digital.gov/design-tokens/
[4] LMS UI/UX Design: 3 Tips that Still Work In 2025 — Riseapps. https://riseapps.co/lms-ui-ux-design/
[5] Top 7 EdTech UI/UX Design Principles — WeSoftYou. https://wesoftyou.com/elearning/top-7-edtech-ui-ux-design-principles-you-cannot-ignore/
[6] Atlassian Design System — Spacing. https://atlassian.design/foundations/spacing
[7] 8-Point Grid System — UX Planet. https://uxplanet.org/everything-you-should-know-about-8-point-grid-system-in-ux-design-b69cb945b18d
[8] Accessible Canada Act — Level Access. https://www.levelaccess.com/blog/canadian-accessibility-laws/
[9] Digital Standards Playbook — Government of Canada. https://www.canada.ca/en/government/system/digital-government/government-canada-digital-standards.html
[10] SaaS Conversion UX — Design Sphere. https://medium.com/@design.sphere/top-conversion-patterns-we-use-to-improve-signups-for-clients-c8eb0024c7e3
