# Theme Toggle Feature

## Overview
The Golf Rewards Platform now supports three theme modes: **Light**, **Dark**, and **System**.

## Features

### 🌓 Theme Modes
- **Light Mode**: Clean, bright interface with white backgrounds
- **Dark Mode**: Easy-on-the-eyes dark interface with slate backgrounds  
- **System Mode**: Automatically matches your operating system's theme preference

### 💾 Persistence
- Your theme preference is saved to `localStorage`
- Persists across browser sessions
- No account required

### ⚡ Performance
- Zero flash of unstyled content (FOUC)
- Theme applied before React hydration via inline script
- Smooth transitions between themes

## Usage

### Theme Toggle Button
Located in the header navigation bar (top-right area):
- **Sun icon** ☀️ = Light mode
- **Moon icon** 🌙 = Dark mode
- **Monitor icon** 🖥️ = System mode

Click the button to cycle through: Light → Dark → System → Light

### How It Works

1. **Initial Load**: 
   - Inline script in `<head>` reads `localStorage` immediately
   - Applies theme class before page renders
   - Prevents any visual flash

2. **Theme Changes**:
   - Clicking toggle updates `localStorage`
   - Removes old theme classes from `<html>` element
   - Adds new theme class (`light` or `dark`)
   - For "system" mode, detects OS preference via `prefers-color-scheme` media query

3. **System Preference Tracking**:
   - When in "system" mode, listens for OS theme changes
   - Automatically updates if user changes their OS setting
   - No page reload needed

## Technical Details

### Files Modified/Created

#### Components
- `components/layout/theme-toggle.tsx` - Toggle button component
- `components/layout/theme-provider.tsx` - Client-side theme initialization

#### Layout
- `app/layout.tsx` - Added theme provider and inline script
- `components/layout/header.tsx` - Integrated theme toggle button

#### Styles
- `app/globals.css` - Already had `.dark` class support (from previous update)

### CSS Variables
The theme system uses CSS custom properties defined in `globals.css`:

```css
:root {
  /* Light mode colors */
  --background: #ffffff;
  --foreground: #0f172a;
  /* ... more variables */
}

.dark {
  /* Dark mode colors */
  --background: #0f172a;
  --foreground: #f8fafc;
  /* ... more variables */
}
```

### LocalStorage Key
- Key: `'theme'`
- Values: `'light'` | `'dark'` | `'system'`

### HTML Classes
The `<html>` element receives one of these classes:
- `class="light"` - Light mode active
- `class="dark"` - Dark mode active
- Both removed when using system mode (relies on media query)

## Browser Support
- ✅ Chrome/Edge (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (all versions)
- ✅ Mobile browsers

Requires:
- `localStorage` support (all modern browsers)
- CSS custom properties (CSS Variables)
- `matchMedia` API for system preference detection

## Accessibility
- High contrast maintained in both themes
- Focus rings visible in both modes
- Icons have descriptive tooltips
- Keyboard accessible (Tab + Enter/Space)

## Customization

### Adding New Themes
To add additional themes (e.g., "sepia", "high-contrast"):

1. Add new CSS class in `globals.css`:
```css
.sepia {
  --background: #f4ecd8;
  --foreground: #5b4636;
  /* ... */
}
```

2. Update `Theme` type in `theme-toggle.tsx`:
```typescript
type Theme = 'light' | 'dark' | 'system' | 'sepia'
```

3. Add icon and logic in the toggle component

### Changing Default Theme
Edit `theme-toggle.tsx`:
```typescript
const [theme, setTheme] = useState<Theme>('dark') // Changed from 'system'
```

## Troubleshooting

### Theme not persisting
- Check browser console for localStorage errors
- Ensure cookies/localStorage aren't blocked
- Try clearing site data and reselecting theme

### Flash of wrong theme on load
- Verify inline script is present in `<head>`
- Check that `suppressHydrationWarning` is on `<html>` tag
- Ensure ThemeProvider is rendering before children

### System mode not updating
- Verify OS theme settings are changing
- Check browser supports `prefers-color-scheme` media query
- Look for JavaScript errors in console
