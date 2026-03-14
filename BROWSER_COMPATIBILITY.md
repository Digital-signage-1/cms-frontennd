# Browser Compatibility — Player & Renderers

## Problem

Digital signage players often run on **low-cost hardware** (Android TV sticks, older Chromebooks, embedded Linux with Chromium, legacy kiosks) that ship with outdated browser engines. These browsers may not support modern JavaScript features like:

- Optional chaining (`?.`)
- Nullish coalescing (`??`)
- `Array.prototype.at()`
- `structuredClone()`
- CSS `gap` in flexbox (partial support)
- CSS `aspect-ratio`
- CSS `container queries`
- `AbortController` / `AbortSignal.timeout()`
- Top-level `await`
- ES2022+ class fields / private fields (`#field`)

## Target Browser Matrix

| Context | Target | Engine |
|---------|--------|--------|
| Dashboard (admin UI) | Modern evergreen browsers | Chrome 90+, Firefox 90+, Safari 15+ |
| **Player app** | **Older embedded browsers** | **Chrome 69+, Chromium-based WebViews, Android WebView 7+** |

> The player app is the critical path — it runs 24/7 on hardware we don't control.

## Build Requirements

### Player App (`apps/player/`)

The Vite build **must** transpile down to ES2017 (or lower) for maximum compatibility:

```ts
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2017', // Safe for Chrome 69+
    // or 'chrome69' for explicit Chromium targeting
  },
})
```

**Polyfills needed** (add via `core-js` or inline):
- `globalThis` (Chrome < 71)
- `Array.prototype.flat` / `flatMap` (Chrome < 69)
- `Object.fromEntries` (Chrome < 73)
- `String.prototype.replaceAll` (Chrome < 85)
- `structuredClone` (Chrome < 98)

### Renderer Package (`packages/renderer/`)

Since the renderer is consumed by **both** dashboard and player, it must also avoid modern-only APIs:

1. **No optional chaining in runtime code** that isn't transpiled — Vite handles this, but be aware if any code bypasses the build
2. **No `using` declarations** (TC39 Stage 3, not widely supported)
3. **Prefer `fetch` over newer APIs** — `fetch` is available in Chrome 42+
4. **Avoid `ResizeObserver`** without a fallback (Chrome 64+, but buggy in older WebViews)
5. **Avoid `IntersectionObserver` v2** — v1 is fine (Chrome 58+)

### CSS Considerations

- **Avoid `gap` in flexbox** — use margins instead (gap in flex was Chrome 84+)
- **Avoid `aspect-ratio`** — use padding-bottom hack if needed (Chrome 88+)
- **Avoid `container queries`** — Chrome 105+ only
- **Avoid `@layer`** — Chrome 99+ only
- **`clamp()` is OK** — Chrome 79+
- **CSS Grid is OK** — Chrome 57+
- **CSS Custom Properties are OK** — Chrome 49+

## Renderer Coding Guidelines

When writing or modifying renderers (`packages/renderer/src/renderers/`):

1. **Use inline styles or basic Tailwind classes** — both are safe
2. **Dynamic imports are OK** — Vite handles code splitting
3. **`requestAnimationFrame`** — safe everywhere (IE10+)
4. **`performance.now()`** — safe everywhere (Chrome 24+)
5. **`Intl.DateTimeFormat`** — safe for basic use (Chrome 24+), but some options like `dateStyle`/`timeStyle` are Chrome 76+
6. **Avoid `Intl.ListFormat`**, `Intl.RelativeTimeFormat` without fallbacks
7. **Test with Chrome DevTools device emulation** — throttle CPU and set older UA strings

## Testing Checklist

Before shipping renderer changes:

- [ ] Build player with `pnpm --filter player build`
- [ ] Open built output in Chrome with `--disable-gpu` flag (simulates low-end hardware)
- [ ] Test with Chromium 69 (download old versions from Chromium snapshots)
- [ ] Verify no runtime errors in console
- [ ] Check all renderers display correctly:
  - [ ] Image, Video, PDF, YouTube, Web
  - [ ] Clock, Weather, HTML, Slideshow, Document
- [ ] Test on actual hardware if available (Android TV, Raspberry Pi, etc.)

## Future Work

- Add `browserslist` config targeting `chrome 69` for the player workspace
- Integrate `@vitejs/plugin-legacy` for automatic polyfill injection
- Add CI check that flags usage of APIs not available in target browsers
- Consider a "compatibility mode" flag in player config for ultra-legacy devices
