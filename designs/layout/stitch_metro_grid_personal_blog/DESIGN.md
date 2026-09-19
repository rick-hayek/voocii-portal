---
name: Tessellate Noir
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#37393a'
  surface-container-lowest: '#0c0f0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#282a2b'
  surface-container-highest: '#333535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#d4c5ab'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#9c8f78'
  outline-variant: '#504532'
  surface-tint: '#fbbc00'
  primary: '#ffe2ab'
  on-primary: '#402d00'
  primary-container: '#ffbf00'
  on-primary-container: '#6d5000'
  inverse-primary: '#795900'
  secondary: '#bdf4ff'
  on-secondary: '#00363d'
  secondary-container: '#00e3fd'
  on-secondary-container: '#00616d'
  tertiary: '#ffdfd4'
  on-tertiary: '#5c1a00'
  tertiary-container: '#ffb9a1'
  on-tertiary-container: '#973307'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdfa0'
  primary-fixed-dim: '#fbbc00'
  on-primary-fixed: '#261a00'
  on-primary-fixed-variant: '#5c4300'
  secondary-fixed: '#9cf0ff'
  secondary-fixed-dim: '#00daf3'
  on-secondary-fixed: '#001f24'
  on-secondary-fixed-variant: '#004f58'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59c'
  on-tertiary-fixed: '#380c00'
  on-tertiary-fixed-variant: '#822800'
  background: '#121414'
  on-background: '#e2e2e2'
  surface-variant: '#333535'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 64px
    fontWeight: '900'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Montserrat
    fontSize: 40px
    fontWeight: '900'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  code:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.5'
spacing:
  unit: 4px
  gutter: 12px
  margin-page: 48px
  tile-padding: 24px
  grid-cols-desktop: '12'
  grid-cols-tablet: '6'
  grid-cols-mobile: '2'
---

## Brand & Style

This design system is a modern interpretation of Metro design principles, optimized for a high-end technical blog. The brand personality is precise, authoritative, and unapologetically digital. It avoids representational metaphors (shadows, depth, textures) in favor of a pure, flat interface where information density is organized through color blocking and strict grid geometry.

The target audience consists of developers, designers, and tech enthusiasts who value efficiency and structural clarity. The UI evokes a sense of "digital craftsmanship"—where the layout itself becomes the primary visual interest. By utilizing high-saturation accent tiles against a deep, stable background, the system directs focus with absolute intent.

## Colors

The palette is built on a "Deep Navy" foundation to maintain high readability and reduce eye strain while providing a sophisticated alternative to pure black. 

- **Primary (Amber):** Used for critical calls to action, featured post categories, and highlight tiles.
- **Secondary (Cyan):** Used for technical tags, links, and code-related content blocks.
- **Tertiary (Coral):** Used for opinion pieces, personal asides, or interactive state changes.
- **Surface:** A slightly lighter navy used for inactive or "empty" tiles to maintain the grid structure without competing with vibrant content tiles.

All accent colors must be used as solid backgrounds with high-contrast (Black or Deep Navy) text to ensure accessibility and "punchy" visual impact. No gradients or transparency effects are permitted.

## Typography

The system uses a pairing of **Montserrat** for impactful, geometric headings and **Inter** for highly legible, utilitarian body text.

- **Headings:** Use Heavy or Bold weights. Tighten letter spacing on larger displays to create a "blocky" aesthetic that complements the tile-based layout.
- **Body:** Stick to a 1.6 line height to provide sufficient "breathing room" within the constrained tiles. 
- **Labels:** Always uppercase with increased tracking (letter-spacing) to serve as distinct structural anchors within the UI.
- **Information Hierarchy:** Use color as a secondary typographic tool—black text on vibrant tiles, and white or light grey text on the deep navy background.

## Layout & Spacing

The layout is a rigorous, tile-based masonry grid. Every element must align to a strict 4px baseline and a 12-column grid system.

- **The Tile Concept:** Content is encapsulated in "tiles" of varying sizes (e.g., 1x1, 2x1, 2x2, 4x2). 
- **Gutters:** A consistent 12px gap between all tiles creates a "grid-line" effect. Gutters should be transparent, revealing the deep navy background.
- **Responsive Behavior:** 
  - **Desktop:** 12 columns. Tiles span 2, 3, 4, or 6 columns.
  - **Tablet:** 6 columns. Tiles reflow to span 3 or 6 columns.
  - **Mobile:** 2 columns. Tiles typically span 2 columns (full width) or 1 column for small utility items.
- **Alignment:** Content within tiles should be padded consistently (24px) to ensure text does not touch the edges of the color blocks.

## Elevation & Depth

This design system is strictly **flat**. Depth is expressed through color contrast and size, never through Z-axis simulation.

- **Zero Shadows:** No box-shadows or drop-shadows are permitted on any element, including buttons and modals.
- **Z-Index Tiers:** When an element must appear "above" others (like a mobile navigation menu or a search overlay), it should use a solid, opaque background color (Primary or Secondary) with a 2px solid white border to define its boundary.
- **Hover States:** Instead of lifting an element, use "Inverse Toggling." For example, a tile with an Amber background and Black text might switch to a Black background and Amber text on hover.

## Shapes

The shape language is defined by **hard edges**. All elements—including tiles, buttons, input fields, and tags—must have a corner radius of 0px. 

This rejection of rounded corners reinforces the "Metro" architectural influence and ensures that tiles fit together with surgical precision. Use thin 1px or 2px solid borders only when necessary to distinguish between two adjacent dark surfaces.

## Components

- **Tiles (Cards):** The core component. Must have a solid background (Primary, Secondary, Tertiary, or Surface). No borders unless the tile is the same color as the background.
- **Buttons:** Large, rectangular blocks. Primary buttons use a solid Amber background with Black Montserrat Bold text. Secondary buttons use a 2px white outline with no fill.
- **Input Fields:** Solid Deep Navy background with a 2px white bottom-border only. On focus, the bottom-border changes to Cyan.
- **Chips/Tags:** Small rectangular blocks with Tertiary (Coral) backgrounds. Text must be Label-Bold (uppercase).
- **Navigation:** A horizontal or vertical bar of tiles. Active links are indicated by a solid color fill (Primary), while inactive links are simple white text.
- **Code Blocks:** Use a dedicated "Surface" color tile. Syntax highlighting should utilize the system's accent colors (Cyan for keywords, Amber for strings).
- **Progress Bars:** Solid flat bars. No rounded ends. Background of the track should be a 10% opacity white, with a solid Cyan fill.