---
name: MOTION
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#bbc9cf'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#859399'
  outline-variant: '#3c494e'
  surface-tint: '#4cd6ff'
  primary: '#a4e6ff'
  on-primary: '#003543'
  primary-container: '#00d1ff'
  on-primary-container: '#00566a'
  inverse-primary: '#00677f'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#dddce1'
  on-tertiary: '#2f3034'
  tertiary-container: '#c0c0c5'
  on-tertiary-container: '#4d4e53'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#b7eaff'
  primary-fixed-dim: '#4cd6ff'
  on-primary-fixed: '#001f28'
  on-primary-fixed-variant: '#004e60'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e3e2e7'
  tertiary-fixed-dim: '#c6c6cb'
  on-tertiary-fixed: '#1a1b1f'
  on-tertiary-fixed-variant: '#46464b'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 80px
    fontWeight: '700'
    lineHeight: 80px
    letterSpacing: -0.04em
  display-hero-mobile:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
  numeral-xl:
    fontFamily: Inter
    fontSize: 120px
    fontWeight: '700'
    lineHeight: 110px
    letterSpacing: -0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  margin-safe: 32px
  gutter: 16px
  section-gap: 64px
  stack-tight: 4px
  stack-loose: 24px
---

## Brand & Style

The design system is built for a high-stakes economy of attention. It embodies a **Hyper-Minimalist** aesthetic that prioritizes content and movement over chrome. The brand personality is disciplined, premium, and authoritative, evoking the feel of a luxury time-piece or a high-end editorial publication.

The target audience consists of high-performers and digital minimalists who value "earned" screen time. The UI should feel like an empty gallery—silent and expansive—where every element is placed with extreme intentionality. By removing typical mobile containers (cards and boxes), the design system relies on **Typographic Hierarchy** and **Whitespace** to define structure, creating a sense of clarity and mental "breathing room."

The visual style is a blend of **Corporate Modern** precision and **Editorial** impact.

## Colors

This design system utilizes a high-contrast, "True Black" palette to maximize the OLED display depth and minimize visual fatigue.

- **Primary (Accent):** Electric Blue (#00D1FF). This color is reserved strictly for moments of "Motion" or "Success"—earning time, active timers, or primary action calls.
- **Surface:** Pure Black (#000000). All backgrounds are deep black to allow the hardware edges of the device to disappear.
- **Content:** White (#FFFFFF) is used for primary headers and high-priority data.
- **Secondary Content:** Soft Gray (#8E8E93) is used for secondary labels, metadata, and inactive states to maintain a clear visual hierarchy.

## Typography

The typographic system is the core of the UI. It uses **Inter** for its neutral, technical precision. 

- **Numerical Dominance:** For minute balances and time-tracking, use `numeral-xl`. These should be the largest elements on screen, often bleeding toward the edges to emphasize the "volume" of earned time.
- **Editorial Headlines:** Headings use tight tracking (letter-spacing) and bold weights to create a sense of urgency and importance.
- **Information Density:** Use `label-caps` for tertiary information. The increased letter spacing provides a premium, "Swiss-style" architectural feel.
- **Negative Space:** Ensure paragraph text has generous line heights (`body-lg`) to maintain the "breathable" quality of the brand.

## Layout & Spacing

This design system avoids traditional grids and containers. It uses a **Vertical Stack** philosophy driven by generous safe-area margins.

- **Content Alignment:** Center-aligned or strictly flush-left. Avoid justified text.
- **The 32px Margin:** A wide 32px side margin is mandatory to push content into the focus zone of the screen, creating a luxurious frame of empty space.
- **Section Gaps:** Use large vertical gaps (64px+) between different content types to signify a change in context without using horizontal rules or dividers.
- **Breathability:** Every element must have at least one side adjacent to a "void" (unoccupied space). Never crowd the edges of the screen.

## Elevation & Depth

In a pure black environment, depth is achieved through **Luminance and Opacity** rather than shadows.

- **Tonal Layering:** There are no "raised" cards. Instead, use subtle shifts in text opacity. Backgrounds remain #000000 across all levels.
- **Backdrop Blurs:** For transient elements like overlays or the bottom navigation bar, use a high-saturation backdrop blur (60px+) with a 10% opacity white tint. This creates a "glass" effect that feels like polished obsidian.
- **Unlocked Indicators:** Represent progress or "locked" states with thin, 1px strokes or low-opacity fills (10-20% white) rather than heavy solid blocks.

## Shapes

The shape language is sharp and precise. 

- **Primary Radius:** Use a "Soft" radius (0.25rem) for interactive elements like inputs or small badges to maintain a sophisticated edge. 
- **Icons:** Use thin-stroke (1.5pt) linear icons. Avoid filled icons unless they represent an "Active" or "On" state.
- **Indicators:** Progress bars should be ultra-thin (2px height) to avoid looking like heavy UI widgets.

## Components

- **Bottom Navigation:** A floating, ultra-minimalist bar. Use only icons with no text labels. The active state is indicated by a single Electric Blue dot below the icon.
- **Massive Numerical Displays:** Balances (e.g., "42m") should be rendered in `numeral-xl`. The 'm' unit should be half the size of the digits and positioned as a superscript or baseline-aligned secondary element.
- **Action Buttons:** Large, 64px height, with a pure white background and black text. No borders. For secondary actions, use a 1px white border with a transparent center.
- **Unlocked Indicators:** Use a simple open/closed lock icon in Electric Blue for unlocked features. The transition between locked and unlocked should be an effortless "fade and slide" animation.
- **Inputs:** A single 1px white line at the bottom of the field. No box. The placeholder text should be Soft Gray.
- **Chips:** Small, all-caps text with a 1px gray border. Used for filtering "earned" vs "spent" time.