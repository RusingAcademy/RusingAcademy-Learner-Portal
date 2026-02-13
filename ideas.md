# LRDG Portal Clone - Design Brainstorm

This is a **faithful clone** of the LRDG Portal. The design must replicate the original as closely as possible. The brainstorm focuses on how to best reproduce the original design system while using React + TailwindCSS.

<response>
<text>
## Idea 1: Pixel-Perfect Material Fidelity

**Design Movement**: Material Design 2.0 faithful reproduction — the LRDG portal is built on Angular Material, so this approach replicates the exact Material Design language using React equivalents.

**Core Principles**:
1. Exact color matching: #086FDD (brand blue), #D4FBF7 (teal accent), #FAFAFA (light gray bg)
2. Roboto + Montserrat typography system matching the original
3. Material Design elevation system (shadows, cards, surfaces)
4. Angular Material component behavior replicated via shadcn/ui + custom components

**Color Philosophy**: The LRDG portal uses a clean, institutional palette. White backgrounds with teal (#D4FBF7) accent headers on tables/sections, blue (#086FDD) for primary actions and the sidebar "Book a Session" button, and dark text for readability. This conveys professionalism and trust for government language training.

**Layout Paradigm**: Fixed left sidebar (170px) with navigation + user profile at bottom. Main content area with widget-based dashboard grid. This is the exact layout of the original.

**Signature Elements**:
1. Teal/cyan header bars on tables and section titles
2. Material Icons for navigation items
3. White cards with subtle borders for dashboard widgets

**Interaction Philosophy**: Tab-based navigation within pages, expandable accordion panels, sortable tables, modal dialogs for notes/announcements. All matching Angular Material behavior.

**Animation**: Minimal — tab transitions, accordion expand/collapse, hover states on sidebar items. The original is conservative with animations.

**Typography System**: Roboto for body text, Montserrat for headings. Material Design type scale.
</text>
<probability>0.07</probability>
</response>

<response>
<text>
## Idea 2: Enhanced Material with Micro-Interactions

**Design Movement**: Neo-Material — takes the LRDG Material base but adds subtle polish through micro-interactions and refined shadows.

**Core Principles**:
1. Faithful structure with enhanced depth (softer shadows, subtle gradients)
2. Smooth page transitions between routes
3. Refined hover states and focus indicators
4. Slightly modernized card treatments while keeping the same layout

**Color Philosophy**: Same institutional palette but with slightly more nuanced shadow work. The teal accent gets a subtle gradient treatment. Cards have softer, more diffused shadows.

**Layout Paradigm**: Same fixed sidebar + main content grid, but with smoother transitions when switching between pages.

**Signature Elements**:
1. Smooth route transitions (fade/slide)
2. Enhanced table hover states
3. Refined card shadows with depth layers

**Interaction Philosophy**: Same tab/accordion/table patterns but with polished transitions. Loading states with skeleton screens.

**Animation**: Framer Motion for page transitions, subtle hover lifts on cards, smooth accordion animations.

**Typography System**: Same Roboto + Montserrat pairing with refined letter-spacing.
</text>
<probability>0.05</probability>
</response>

<response>
<text>
## Idea 3: Exact Replica with Accessibility Enhancement

**Design Movement**: Institutional Digital Fidelity — exact reproduction prioritizing accessibility compliance.

**Core Principles**:
1. 1:1 visual match with the original portal
2. WCAG 2.1 AA compliance throughout
3. Keyboard navigation fully functional
4. Screen reader optimized with proper ARIA labels

**Color Philosophy**: Exact color match: #086FDD primary blue, #D4FBF7 teal accent, white/light gray backgrounds. All color combinations verified for WCAG contrast ratios.

**Layout Paradigm**: Exact sidebar + main content layout. Responsive adaptation for smaller screens (sidebar collapses to hamburger menu).

**Signature Elements**:
1. Skip-to-content links (matching original)
2. Proper focus management across tab panels
3. Semantic HTML structure matching Angular Material output

**Interaction Philosophy**: Exact behavioral match — tabs, accordions, sortable tables, modals. All with proper keyboard support.

**Animation**: Minimal, matching original. No added animations beyond what exists.

**Typography System**: Roboto primary, Montserrat secondary. Exact size/weight matching.
</text>
<probability>0.03</probability>
</response>

## Selected Approach: Idea 1 — Pixel-Perfect Material Fidelity

This is the most appropriate approach for a faithful clone. We will replicate the exact LRDG portal design using:
- Exact color palette: #086FDD, #D4FBF7, #FAFAFA, white, dark text
- Roboto + Montserrat fonts
- Material Icons via Google Fonts CDN
- Fixed sidebar navigation layout
- Widget-based dashboard grid
- Tab-based content organization
- Sortable data tables
- Expandable accordion panels
