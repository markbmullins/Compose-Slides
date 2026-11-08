import { useEffect } from 'react';

export interface DeckKeyHandlers {
  next: () => void;
  prev: () => void;
  home: () => void;
  end: () => void;
  fullscreen: () => void;
  presenter: () => void;
  resetTimer: () => void;
}

/** Global keyboard bindings. Digits are deliberately left alone for scenes. */
export function useDeckKeys(h: DeckKeyHandlers) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const map: Record<string, () => void> = {
        ArrowRight: h.next, ' ': h.next, PageDown: h.next, Enter: h.next,
        ArrowLeft: h.prev, PageUp: h.prev, Backspace: h.prev,
        Home: h.home, End: h.end,
        f: h.fullscreen, F: h.fullscreen,
        t: h.presenter, T: h.presenter,
        r: h.resetTimer, R: h.resetTimer,
      };
      const fn = map[e.key];
      if (!fn) return;
      e.preventDefault();
      // Holding an arrow key auto-repeats to scrub quickly; other keys fire once.
      if (!e.repeat || e.key === 'ArrowRight' || e.key === 'ArrowLeft') fn();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [h]);
}
