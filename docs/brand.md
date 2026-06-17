# Landscaip — Brand Guidelines

## Brand Identity

**Product name:** Landscaip (capital L only)
**Tagline:** Transform Your Landscape with AI

---

## Color Palette

### Semantic Tokens (use these in components — never raw hex)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#0F8000` | Brand green, CTAs, links, active states |
| `primary-foreground` | `#ffffff` | Text on primary backgrounds |
| `background` | `#ffffff` | Page background |
| `foreground` | `#0a0a0a` | Default body text |
| `muted` | `#f5f5f5` | Subtle backgrounds, disabled states |
| `muted-foreground` | `#737373` | Secondary/caption text |
| `accent` | `#e8f5e0` | Light green tint for highlights |
| `accent-foreground` | `#0a6000` | Text on accent backgrounds |
| `card` | `#ffffff` | Card backgrounds |
| `card-foreground` | `#0a0a0a` | Text on cards |
| `border` | `#e5e5e5` | Borders, dividers |
| `input` | `#e5e5e5` | Input field borders |
| `ring` | `#0F8000` | Focus ring color |
| `destructive` | `#ef4444` | Errors, delete actions |
| `destructive-foreground` | `#ffffff` | Text on destructive backgrounds |

---

## Typography

| Token | Stack |
|-------|-------|
| `font-sans` | Geist Sans → system-ui → sans-serif |
| `font-mono` | Geist Mono → ui-monospace → monospace |

**Rules:**
- Never hardcode font families — use `font-sans` / `font-mono` tokens
- Heading weights: `font-bold` (700) or `font-semibold` (600)
- Body weight: `font-normal` (400)

---

## Spacing Tokens

These are custom named tokens on top of Tailwind's numeric scale.

| Token | Value | Usage |
|-------|-------|-------|
| `spacing-element` | `1rem` (16px) | Padding inside elements (`p-element`) |
| `spacing-section` | `3rem` (48px) | Vertical section gaps (`mt-section`, `py-section`) |
| `spacing-tight` | `0.5rem` (8px) | Compact gaps (`gap-tight`) |

Use Tailwind's numeric scale (`p-4`, `mt-8`, `gap-2`) for all other spacing.

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | `0.25rem` | Subtle rounding (badges, tags) |
| `rounded-md` | `0.375rem` | Default rounding (buttons, inputs) |
| `rounded-lg` | `0.5rem` | Cards, modals |
| `rounded-xl` | `0.75rem` | Large cards, panels |
| `rounded-full` | `9999px` | Pills, avatars |

---

## Shadows

| Token | Usage |
|-------|-------|
| `shadow-sm` | Subtle elevation (buttons, chips) |
| `shadow-md` | Cards, dropdowns |
| `shadow-lg` | Modals, dialogs |

---

## Style Rules (enforced)

1. **Never use raw hex colors** (`#0F8000`) — use `text-primary`, `bg-primary`, etc.
2. **Never hardcode font values** — use `font-sans` / `font-mono`.
3. **Never hardcode spacing** (`p-[24px]`, `mt-[64px]`) — use named tokens or Tailwind scale.
4. **Never hardcode border-radius** — use `rounded-*` tokens.
5. **Never hardcode shadows** — use `shadow-*` tokens.
6. **Light mode only** — no dark mode at this time.
7. **Add missing tokens** to this file and `globals.css` before using them.

---

## Component Style Patterns

### Primary Button
```tsx
<button className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/90">
  Get Started
</button>
```

### Secondary Button
```tsx
<button className="border border-border bg-background rounded-md px-4 py-2 text-sm font-medium hover:bg-muted">
  Learn More
</button>
```

### Card
```tsx
<div className="bg-card border border-border rounded-lg shadow-sm p-6">
  ...
</div>
```

### Input
```tsx
<input className="border border-input rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-ring" />
```
