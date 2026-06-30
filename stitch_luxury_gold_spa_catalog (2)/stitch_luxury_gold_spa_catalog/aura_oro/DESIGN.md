---
name: Aura Oro
colors:
  surface: '#16130b'
  surface-dim: '#16130b'
  surface-bright: '#3d392f'
  surface-container-lowest: '#110e07'
  surface-container-low: '#1f1b13'
  surface-container: '#231f17'
  surface-container-high: '#2d2a21'
  surface-container-highest: '#38342b'
  on-surface: '#eae1d4'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#eae1d4'
  inverse-on-surface: '#343027'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#cecece'
  on-tertiary: '#303030'
  tertiary-container: '#b3b3b3'
  on-tertiary-container: '#454545'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#16130b'
  on-background: '#eae1d4'
  surface-variant: '#38342b'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: 0.02em
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: 0.03em
  body-lg:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0.01em
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.2em
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  section-padding-desktop: 120px
  section-padding-mobile: 64px
---

## Brand & Style

This design system embodies an uncompromising sense of luxury, exclusivity, and feminine empowerment. The brand personality is poised and sophisticated, targeting a high-end clientele that values discretion, indulgence, and meticulous attention to detail.

The visual style is **High-Contrast Noir with Metallic Accents**. It leverages the deep, infinite depths of true blacks and charcoals to create an atmosphere of nocturnal elegance, punctuated by the radiant warmth of gold. The aesthetic balances minimalist structure with opulent textures, using subtle glows and "liquid" transitions to evoke the feeling of high-end oils and serene water. The emotional response should be one of immediate decompression, prestige, and sensory delight.

## Colors

The palette is anchored in a dark-mode-only experience to maintain a sense of intimate luxury. 

- **The Blacks (#000000, #1A1A1A):** Used for deep backgrounds and container surfaces. True black is reserved for the primary canvas, while the softer charcoal is used for elevated cards and UI elements to provide depth.
- **The Golds (#D4AF37, #FFD700, #C5B358):** These are not just colors but represent light and texture. The primary gold (#D4AF37) is used for key actions and icons. The bright gold is reserved for hover states and focal points, while the muted gold is used for subtle borders and secondary text.
- **Accents:** Use a 5% opacity gold overlay on black surfaces to create a "shimmer" effect without compromising readability.

## Typography

The typography strategy relies on the tension between the classic, editorial weight of **Playfair Display** and the modern, architectural precision of **Montserrat**.

- **Headlines:** Use Playfair Display for all emotive titles. Larger displays should use "Italic" styles sparingly to denote specific luxury services.
- **Body Text:** Montserrat provides high legibility against dark backgrounds. Tracking (letter spacing) should be slightly increased for body copy to enhance the "airy" feel.
- **Labels:** Small labels and overlines must always be in Montserrat, Uppercase, with high letter spacing to emulate the branding of high-end perfume and fashion houses.

## Layout & Spacing

The layout philosophy is rooted in **Generous White Space** (or "Black Space"). Content should never feel crowded; every element needs room to breathe to convey a sense of calm.

- **Grid:** A standard 12-column grid for desktop, but with intentionally wide margins (80px+) to center-align the focus.
- **Rhythm:** Use an 8px base unit. Section vertical spacing is intentionally exaggerated (120px+) to separate different "experiences" within the page.
- **Mobile:** Transition to a single-column layout with 24px side margins, maintaining the vertical breathing room between service descriptions.

## Elevation & Depth

In this dark environment, depth is created through **Tonal Layering and Metallic Outlines** rather than traditional shadows.

- **Surface Levels:** The base layer is #000000. Interactive cards use #1A1A1A with a very thin (1px) border in a 20% opacity gold.
- **Glassmorphism:** Use "Obsidian Glass" for navigation bars and overlays—a high-blur (20px) backdrop with a 60% opaque #000000 fill.
- **Gold Accents:** Use subtle inner glows on gold elements to simulate a metallic sheen. Dividing lines should be 1px thick, using a linear gradient of Gold (#C5B358) to Transparent.

## Shapes

The design system utilizes **Sharp (0px)** roundedness to maintain a high-fashion, architectural edge. This lack of rounding communicates precision, modernism, and structural integrity. All buttons, input fields, and image containers should feature crisp, 90-degree angles. Horizontal lines used as separators should be hair-thin and extend across containers to emphasize the linear, structured nature of the space.

## Components

- **Buttons:** Primary buttons are solid Gold (#D4AF37) with Black text, using the "label-caps" typography. Secondary buttons are Ghost style: Transparent fill, 1px Gold border, Gold text. Transitions should be slow (300ms) with a subtle "shimmer" gradient moving across the surface on hover.
- **Inputs:** Minimalist bottom-border only. On focus, the gold border expands from the center.
- **Cards:** Used for service listings. Features a full-bleed imagery background with a black-to-transparent gradient overlay. On hover, the image scales slightly (1.05x) and a gold border appears.
- **Icons:** Minimalist, single-line stroke icons in Gold. The stroke weight should be consistent with the 1px hair-lines used elsewhere.
- **Selection Controls:** Checkboxes and Radio buttons are replaced by custom "Gold Ring" toggles.
- **Dividers:** Signature "Liquid Gold" dividers—horizontal lines that utilize a radial gradient so the ends fade into the black background.