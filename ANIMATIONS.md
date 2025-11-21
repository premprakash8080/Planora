# Planora Animations Guide

This document outlines all the animations and transitions implemented in the Planora application.

## 🎨 Theme Transition Animations

### Global Theme Switching
- **Smooth color transitions**: All colors (background, text, borders) transition smoothly over 300ms when switching themes
- **Optimized performance**: Transitions only apply when `theme-transitioning` class is active
- **Excluded elements**: Images, SVGs, videos, and canvases are excluded for better performance

### Theme Toggle Button
- **Icon rotation**: Theme toggle icon rotates 360° with scale animation when clicked
- **Ripple effect**: Expanding circle animation on button click
- **Smooth hover**: Subtle translateX animation on hover

## 🎭 Component Animations

### Sidebar (`app-sidebar`)
- **Collapse/Expand**: Smooth width transition (250ms) with easing
- **Menu items**: Slide-in animation for active state indicator (left border)
- **Hover effects**: Items translate right on hover (4px)
- **Section collapse**: Smooth max-height and opacity transitions
- **Theme toggle**: Rotating icon with ripple effect

### Header (`app-header`)
- **Menu button**: Scale animation on hover/active
- **Profile dropdown**: Hover lift effect with shadow
- **Search bar**: Focus state with border color transition

### Cards (`app-card`)
- **Fade-in**: Cards fade in with scale animation on mount
- **Hover lift**: Cards lift up (-4px) with enhanced shadow on hover
- **Interactive cards**: Additional scale effect (1.01) on hover

### Buttons (`app-button`)
- **Ripple effect**: Expanding circle animation on click
- **Hover lift**: Primary buttons lift slightly on hover
- **Active state**: Scale down on click for tactile feedback

## 📄 Page Transitions

### Router Outlet
- **Fade in**: Content fades in with slight upward movement (10px)
- **Smooth entry**: 400ms cubic-bezier easing for natural feel

### Backdrop (Mobile Sidebar)
- **Fade in**: Backdrop fades in with blur effect
- **Theme-aware**: Different opacity for light/dark themes

## 🎯 Reusable Animations

Located in `src/app/shared/animations/app.animations.ts`:

1. **fadeIn** - Simple fade in/out
2. **fadeInScale** - Fade with scale effect
3. **slideInRight** - Slide from right
4. **slideInLeft** - Slide from left
5. **slideInUp** - Slide from bottom
6. **staggerList** - Staggered list items animation
7. **rotate** - Rotation animation
8. **pulse** - Pulsing animation
9. **bounceIn** - Bounce entrance
10. **pageTransition** - Page transition effect
11. **cardHover** - Card hover animation

## 🚀 Usage Examples

### Using Animations in Components

```typescript
import { fadeIn, slideInUp } from '../shared/animations/app.animations';

@Component({
  animations: [fadeIn, slideInUp]
})
```

```html
<div [@fadeIn]>
  <!-- Content with fade in animation -->
</div>

<div [@slideInUp]>
  <!-- Content with slide up animation -->
</div>
```

### Staggered Lists

```html
<div [@staggerList]>
  <div *ngFor="let item of items" [@fadeIn]>
    {{ item }}
  </div>
</div>
```

## ⚡ Performance Tips

1. **Use `will-change` sparingly**: Only for elements that will animate
2. **Prefer transforms**: Use `transform` and `opacity` for animations (GPU accelerated)
3. **Limit simultaneous animations**: Don't animate too many elements at once
4. **Use `requestAnimationFrame`**: For theme transitions to ensure smooth rendering

## 🎨 Animation Timing

- **Fast interactions**: 200ms (buttons, hovers)
- **Medium transitions**: 300ms (theme switching, card hovers)
- **Slow entrances**: 400ms (page transitions, modal openings)
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` for natural feel

## 🔧 Customization

All animation timings and easings can be adjusted in:
- `src/app/shared/animations/app.animations.ts` - Angular animations
- `src/styles.scss` - CSS transitions
- Component SCSS files - Component-specific animations

