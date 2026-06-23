---
name: Scholarly Archive
colors:
  surface: '#fdf9f4'
  surface-dim: '#ddd9d5'
  surface-bright: '#fdf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3ee'
  surface-container: '#f1ede8'
  surface-container-high: '#ebe8e3'
  surface-container-highest: '#e6e2dd'
  on-surface: '#1c1c19'
  on-surface-variant: '#44474c'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f4f0eb'
  outline: '#74777d'
  outline-variant: '#c4c6cd'
  surface-tint: '#4f6073'
  primary: '#041627'
  on-primary: '#ffffff'
  primary-container: '#1a2b3c'
  on-primary-container: '#8192a7'
  inverse-primary: '#b7c8de'
  secondary: '#7c5730'
  on-secondary: '#ffffff'
  secondary-container: '#fdcb9b'
  on-secondary-container: '#79542d'
  tertiary: '#33010a'
  on-tertiary: '#ffffff'
  tertiary-container: '#4f141d'
  on-tertiary-container: '#cd7880'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4fb'
  primary-fixed-dim: '#b7c8de'
  on-primary-fixed: '#0b1d2d'
  on-primary-fixed-variant: '#38485a'
  secondary-fixed: '#ffdcbd'
  secondary-fixed-dim: '#eebd8e'
  on-secondary-fixed: '#2c1600'
  on-secondary-fixed-variant: '#61401b'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b8'
  on-tertiary-fixed: '#3c0610'
  on-tertiary-fixed-variant: '#753139'
  background: '#fdf9f4'
  on-background: '#1c1c19'
  surface-variant: '#e6e2dd'
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 48px
    fontWeight: '500'
    lineHeight: 56px
    letterSpacing: -0.01em
  display-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  headline-md:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  headline-sm:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
  caption:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The design system is rooted in the "Digital Scriptorium" aesthetic—a synthesis of classical archival tradition and modern computational precision. It moves away from the ephemeral nature of modern SaaS to evoke the permanence of a physical library. The target audience includes historians, investigative researchers, and academics who require a focused, high-trust environment.

The style is **Modern Editorial / Tactile**, utilizing a light-mode default that mimics high-quality paper stocks. The emotional response is one of quiet authority, intellectual rigor, and tactile discovery. We avoid the "tech-first" appearance of AI tools, instead positioning the AI as a silent librarian assisting in the background.

**Design Principles:**
- **Materiality:** Every surface should feel like it has weight and texture.
- **Precision:** Fine lines, generous margins, and balanced proportions reflect scholarly meticulousness.
- **Curation:** Information is presented in "plates" and "folios" rather than generic containers.

## Colors

The palette is derived from historical materials: carbon ink, aged vellum, weathered bronze, and dried wax seals. 

- **Primary (Deep Blue):** Used for primary typography and navigation to ensure maximum legibility and a sense of institutional trust.
- **Secondary (Bronze):** Reserved for interactive accents, highlights, and meta-information.
- **Tertiary (Muted Maroon):** Used sparingly for critical alerts, bookmarked states, or significant historical markers.
- **Neutrals:** A tiered system of ivory and beige creates a layered "paper" effect, preventing the eye-strain common with pure white digital surfaces.

**Texture Note:** Backgrounds should implement a subtle, low-opacity (2-3%) grain overlay to simulate natural paper fibers.

## Typography

This design system employs a high-contrast typographic pairing to distinguish between "Content" (Serif) and "Utility" (Sans-Serif).

- **EB Garamond:** Used for all narrative headers and primary document titles. It brings a literary, historical quality to the platform.
- **Inter:** Used for metadata, labels, and long-form analytical text. Its neutrality ensures that the AI-generated insights are legible and functionally distinct from the historical sources.

**Stylistic Rules:**
- Use `label-caps` for all navigational metadata and categorization.
- Use `caption` (italicized Inter) for photo credits, dates, and historical citations.
- Maintain a generous vertical rhythm; academic reading requires significant line spacing to reduce cognitive load.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model on desktop, centered to mimic the proportions of an open manuscript or a broadsheet. 

- **Columns:** A 12-column grid for desktop, 4-column for mobile.
- **Margins:** Intentional use of "dead space" on the perimeters of the screen to focus the researcher's eye on the central document.
- **Rhythm:** An 8px base unit drives all padding and margin decisions. 
- **Adaptivity:** On tablet and mobile, complex sidebars (catalog filters) should collapse into a "Drawer" styled as a physical index file.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and physical metaphors rather than intense shadows.

- **The Base:** The lowest level is the `#F2E8D5` (Beige) "desk" surface.
- **The Folio:** Active content areas sit on `#F9F5F0` (Ivory) surfaces with a thin, 1px border of `#E8DFCC`.
- **Soft Shadows:** Only used for "floating" elements like context menus or tooltips. Shadows should be highly diffused, using the Primary Deep Blue color at 5% opacity to create a natural, ambient occlusion effect.
- **Dividers:** Use 1px solid lines in `Aged Paper` (#E8DFCC). For section breaks, use a "double-rule" (two 1px lines 2px apart) to evoke classical publishing.

## Shapes

The shape language is conservative and geometric. 

- **Corners:** We use a `Soft` (0.25rem) radius for most UI elements to avoid the clinical feel of sharp corners while maintaining a professional, structured look.
- **Circular Seals:** Specific elements, such as dates or verification stamps, utilize a "Seal" shape (perfect circle) with a Bronze border, mimicking wax impressions.
- **Interactive Elements:** Buttons and input fields maintain the same soft rounding to ensure a cohesive tactile language.

## Components

**Archive Cards:**
Cards represent individual manuscripts or records. They feature an Ivory background, a 1px Beige border, and a Bronze left-accent rail to indicate selection. Use `label-caps` for the record ID.

**Primary Buttons:**
Styled as "pressed ink." Background: `Deep Blue` (#1A2B3C); Text: `Ivory` (#F9F5F0). No gradient. On hover, the background shifts to `Bronze` (#A67C52) to signify a "lit" state.

**Secondary Buttons:**
Outlined in `Deep Blue` with a transparent background. To be used for "Cancel" or "Return" actions.

**Historian’s Notebook (Input Fields):**
Fields should not look like boxes. Instead, use a bottom-border only style (1px `#A67C52`) to mimic lined notebook paper. The label floats above in `label-caps` style.

**Circular Seals (Status Indicators):**
Dates and "Verified" statuses are placed inside a 40px circle with a subtle 1px dashed Bronze border. 

**Lists:**
Library catalog entries should be separated by 1px dividers. Each entry should have generous padding (16px top/bottom) to allow for clear scanning of historical dates and names.

**Chips:**
Used for archival tags. These should have a background of `#E8DFCC` and a 12px font size. They should look like small physical labels attached to a file.