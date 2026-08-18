---
name: Quiet Confidence
colors:
  surface: '#121412'
  surface-dim: '#121412'
  surface-bright: '#383a38'
  surface-container-lowest: '#0d0f0d'
  surface-container-low: '#1a1c1a'
  surface-container: '#1e201e'
  surface-container-high: '#292a29'
  surface-container-highest: '#333533'
  on-surface: '#e3e3e0'
  on-surface-variant: '#c1c8c2'
  inverse-surface: '#e3e3e0'
  inverse-on-surface: '#2f312f'
  outline: '#8b928d'
  outline-variant: '#414844'
  surface-tint: '#aacfb9'
  primary: '#aacfb9'
  on-primary: '#153627'
  primary-container: '#8baf9a'
  on-primary-container: '#214332'
  inverse-primary: '#446553'
  secondary: '#c6c6cb'
  on-secondary: '#2f3035'
  secondary-container: '#4a4b50'
  on-secondary-container: '#bbbbc1'
  tertiary: '#f0b9b9'
  on-tertiary: '#4a2627'
  tertiary-container: '#ce9a9a'
  on-tertiary-container: '#573233'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c6ebd4'
  primary-fixed-dim: '#aacfb9'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#2c4d3d'
  secondary-fixed: '#e2e2e8'
  secondary-fixed-dim: '#c6c6cb'
  on-secondary-fixed: '#1a1c20'
  on-secondary-fixed-variant: '#45474b'
  tertiary-fixed: '#ffdad9'
  tertiary-fixed-dim: '#f0b9b9'
  on-tertiary-fixed: '#311213'
  on-tertiary-fixed-variant: '#633c3d'
  background: '#121412'
  on-background: '#e3e3e0'
  surface-variant: '#333533'
typography:
  display:
    fontFamily: Geist Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Geist Sans
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Geist Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  mono-label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.02em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar-width: 240px
  sidebar-collapsed: 64px
  gutter: 24px
  container-padding: 32px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style
The design system is built on the principle of **Quiet Confidence**. It targets developers who value focus, efficiency, and a calm workspace for intense algorithmic problem-solving. The aesthetic is a refined intersection of **Minimalism** and **Technical Modernism**.

The UI prioritizes content—code, logic, and data—over decorative flourishes. It avoids the over-stimulating "gamified" tropes of typical learning platforms. Instead, it uses a dark, monochromatic foundation with a singular, muted accent color to guide the eye. Polish is achieved through rigorous alignment, hairline borders, and precise typography rather than shadows or depth effects.

## Colors
The palette is deeply atmospheric and low-contrast to reduce eye strain during long sessions. 

- **Foundation:** The background uses a charcoal (#0B0C0E) rather than pure black to maintain a softer, premium feel. 
- **Layering:** Hierarchy is built through subtle shifts in grey (Secondary Background to Elevated Surface) rather than elevation shadows.
- **Accent:** The muted green (#8BAF9A) is the sole driver of action. It represents growth, progress, and success without the urgency of a high-saturation green. Use it exclusively for primary calls-to-action, active selection states, and positive status indicators.
- **Borders:** All borders use a consistent #25282D hairline to define structure without adding visual noise.

## Typography
Typography is the primary driver of the interface's character. 

- **UI Sans (Geist Sans):** Used for all navigational elements, titles, and body text. It provides a clean, neutral, and technical feel.
- **Technical Mono (JetBrains Mono):** Used for metadata, status tags (e.g., "Easy", "Hard"), performance metrics (XP, time complexity), and code snippets. This separation helps the user instantly distinguish between "the app" and "the data."
- **Scale:** Keep sizes modest. Do not use oversized headers. Information density should be medium-to-high, reflecting a professional tool.

## Layout & Spacing
The layout follows a multi-column fluid structure that maximizes screen real estate for code and logic.

- **Sidebar:** A persistent left sidebar houses the primary navigation. It uses Lucide-style icons with a 2px stroke.
- **Grid:** Use a 12-column system for dashboard layouts, but switch to a custom split-pane layout (flexible 40/60 or 50/50) for the practice environment.
- **Rhythm:** Spacing is generous to prevent the dense technical data from feeling overwhelming. Use 8px increments for all internal component spacing and 24px for larger layout gaps.
- **Borders:** Use vertical and horizontal hairlines (1px) to separate layout sections (e.g., sidebar from main content, editor from problem description).

## Elevation & Depth
In this design system, depth is conveyed through **Tonal Layers** rather than shadows.

- **Base:** The main background (#0B0C0E).
- **Cards/Containers:** Use #131519 with a 1px border (#25282D). Do not use shadows.
- **Active/Hover:** Use #17191D to indicate an elevated state or focus.
- **Modals:** Only in rare cases of critical focus (like a settings modal), use a subtle ambient shadow (20px blur, 40% opacity #000) to pull the element away from the darkened backdrop.

## Shapes
Shapes are disciplined and functional. Use a "Soft" (0.25rem) corner radius for most components to maintain a modern, professional look without the playfulness of fully rounded shapes.

- **Inputs & Buttons:** 4px (0.25rem) radius.
- **Cards:** 8px (0.5rem) radius.
- **Tags/Chips:** 2px radius for a sharper, technical "tag" feel.

## Components
- **Buttons:** 
    - *Primary:* Background #8BAF9A, Text #0B0C0E (high contrast). No gradients.
    - *Secondary:* Background transparent, Border 1px #25282D, Text #F2F2F0. Hover state fills background to #17191D.
- **Input Fields:** Background #0F1113, Border 1px #25282D. Focus state changes border to #8BAF9A. No glow.
- **Chips (Difficulty/Topics):** Small, JetBrains Mono font, uppercase. Use subtle background tints for difficulty (e.g., a very dark green/red/yellow background with desaturated text colors).
- **Navigation Items:** Icons are 20px, stroke 2px. Active state is indicated by a vertical 2px line on the left side of the item and the primary accent color for the icon.
- **Splitter/Resizer:** A simple 1px line that highlights slightly on hover. It should feel like a part of the IDE, not a separate UI element.
- **Progress Indicators:** Thin 2px bars using the accent color for completion. Avoid circular progress rings which feel more "fitness app" than "coding tool."