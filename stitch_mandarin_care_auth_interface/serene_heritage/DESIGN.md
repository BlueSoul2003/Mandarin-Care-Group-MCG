---
name: Serene Heritage
colors:
  surface: '#fff8f3'
  surface-dim: '#e1d9d2'
  surface-bright: '#fff8f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf2eb'
  surface-container: '#f5ece5'
  surface-container-high: '#efe7df'
  surface-container-highest: '#e9e1da'
  on-surface: '#1e1b17'
  on-surface-variant: '#4e453a'
  inverse-surface: '#34302b'
  inverse-on-surface: '#f8efe8'
  outline: '#807668'
  outline-variant: '#d1c5b5'
  surface-tint: '#775927'
  primary: '#775927'
  on-primary: '#ffffff'
  primary-container: '#c9a46a'
  on-primary-container: '#533a09'
  inverse-primary: '#e8c084'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e4e2e1'
  on-secondary-container: '#656464'
  tertiary: '#495f82'
  on-tertiary: '#ffffff'
  tertiary-container: '#94abd1'
  on-tertiary-container: '#283f60'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdead'
  primary-fixed-dim: '#e8c084'
  on-primary-fixed: '#281900'
  on-primary-fixed-variant: '#5d4211'
  secondary-fixed: '#e4e2e1'
  secondary-fixed-dim: '#c8c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#d4e3ff'
  tertiary-fixed-dim: '#b0c8ef'
  on-tertiary-fixed: '#001c3a'
  on-tertiary-fixed-variant: '#314868'
  background: '#fff8f3'
  on-background: '#1e1b17'
  surface-variant: '#e9e1da'
typography:
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
---

## Brand & Style

The design system is anchored in a **Minimalist Luxury** aesthetic, tailored specifically for high-end care and wellness. It prioritizes emotional tranquility, spiritual balance, and modern sophistication. The visual narrative avoids clutter, using generous whitespace to signify premium quality and provide "breathing room" for the user.

The style leans into **Modern Minimalism** with a focus on tactile refinement. It utilizes high-quality typography and a restricted color palette to evoke a sense of quiet authority and peace. The interface should feel intentional and curated, rather than mechanical.

## Colors

The palette is inspired by natural parchment and precious metals, creating a warm, inviting, yet prestigious atmosphere.

- **Primary (#C9A46A):** A muted gold used for call-to-actions, active states, and essential accents. It represents quality and wisdom.
- **Surface (#FAF8F3):** An ivory/off-white base that prevents the clinical coldness of pure white, adding a layer of residential warmth.
- **Text (#2D2D2D):** A soft charcoal that ensures high readability while maintaining a softer contrast than pure black, appearing more sophisticated.
- **Dividers (#E5E5E5):** Used sparingly to define hierarchy without breaking the visual flow of the page.

## Typography

This design system utilizes a high-contrast typographic pairing to balance tradition with modern precision.

- **Headlines:** Use **Playfair Display**. Its elegant serifs and variable stroke widths convey heritage and luxury. Headlines should use "Optical Sizing" where available to ensure delicate details remain crisp.
- **Body & UI:** Use **Geist**. Its clean, technical, yet approachable grotesque structure provides the necessary clarity for utilitarian information and long-form reading.
- **Labels:** Use uppercase tracking (letter-spacing) for labels and small headers to add a rhythmic, editorial feel to the UI.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** approach for desktop to maintain a cinematic, centered composition, while transitioning to a **Fluid Grid** for mobile.

- **Grid:** A 12-column structure with generous 24px gutters.
- **Rhythm:** An 8px linear scale drives all padding and margins. For a "Luxury" feel, prefer larger increments (e.g., 64px or 80px) between major sections to emphasize the minimalist aesthetic.
- **Alignment:** Content should predominantly be center-aligned for landing pages to evoke a sense of balance, and left-aligned for data-heavy or application views.

## Elevation & Depth

To maintain a "flat luxury" feel, this design system avoids heavy drop shadows.

- **Tonal Layers:** Depth is created primarily through color blocking (using the Surface color against white backgrounds or subtle gray fills).
- **Subtle Shadows:** When elevation is required (e.g., on a floating card or button hover), use a "Long & Soft" shadow: `0px 12px 32px rgba(45, 45, 45, 0.04)`.
- **Outlines:** Use 1px solid borders in the `divider` color for most structural elements. This provides a crisp, architectural look that feels more modern than shadows.

## Shapes

The shape language is defined by **Soft Geometricism**.

- **Pill Shapes:** All primary buttons and interactive chips must use the maximum corner radius (pill-shaped) to evoke a friendly, approachable, and organic feel.
- **Containers:** Large cards or sections should use `rounded-xl` (3rem/48px) to soften the layout and make the technology feel more human-centric.

## Components

- **Buttons:** Primary buttons are pill-shaped, using the Primary Gold background with soft charcoal or white text. Secondary buttons use a thin 1px border with no fill.
- **Input Fields:** Use a minimal underline style or a very soft-gray filled box with `rounded-lg`. Avoid heavy borders; focus on the typography of the input text.
- **Cards:** Cards should have no border, a subtle Ivory background slightly different from the main surface, and very soft, diffused shadows on hover.
- **Lists:** Use ample vertical padding (at least 24px) between list items, separated by 1px light gray dividers that do not span the full width of the container.
- **Chips/Badges:** Small, pill-shaped elements using a 10% opacity version of the Primary color for the background to keep them subtle and integrated.
- **Specialty Components:** Include a "Quiet Alert" — a notification style that uses typography and a small gold dot rather than bright, aggressive background colors.
