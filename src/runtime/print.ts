/**
 * Print mode: `?print` renders every step of every scene as its own
 * 1920x1080 page; `?print=final` renders only each scene's last step.
 * Optional `&scenes=title,lifecycle` limits the export to those scene ids.
 */
export type PrintMode = 'all' | 'final';

export interface PrintOptions {
  mode: PrintMode;
  scenes: string[] | null;
}

export function readPrintOptions(search = window.location.search): PrintOptions | null {
  const params = new URLSearchParams(search);
  if (!params.has('print')) return null;
  const mode: PrintMode = params.get('print') === 'final' ? 'final' : 'all';
  const ids = params.get('scenes');
  return { mode, scenes: ids ? ids.split(',').map((s) => s.trim()).filter(Boolean) : null };
}

/**
 * Make every `prefers-reduced-motion` check report "reduce" so scenes render
 * their end states immediately. Scenes already honour reduced motion, so this
 * works without any scene knowing about printing. Call before React mounts.
 */
export function forceReducedMotion() {
  const original = window.matchMedia.bind(window);
  window.matchMedia = (query: string) => {
    if (!query.includes('prefers-reduced-motion')) return original(query);
    const matches = query.includes('reduce');
    return {
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as MediaQueryList;
  };
}
