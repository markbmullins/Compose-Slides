import type { ComponentType } from 'react';

/**
 * Contract between the deck shell and every scene.
 *
 * The deck owns a `step` counter per scene. → / Space advances the step;
 * when `step` reaches `stepCount - 1`, the next → moves to the next scene.
 * ← goes back a step, then to the previous scene's LAST step.
 */
export interface SceneProps {
  /** 0-based step within this scene, owned by the deck. */
  step: number;
  /**
   * Scenes whose length can change at runtime (e.g. failure injection picks a
   * shorter path) call this to tell the deck how many steps they now have.
   * The deck clamps `step` if it is now out of range.
   */
  setStepCount: (count: number) => void;
  /** Jump to a step inside this scene (e.g. reset to 0 after switching path). */
  goToStep: (step: number) => void;
  /**
   * Print export only. Scenes with internal state (e.g. a selected path) start
   * from this variant instead of their default. Undefined in the live deck.
   */
  variant?: string;
  /** True when rendered as a static page for PDF export. */
  print?: boolean;
}

export interface SceneDef {
  id: string;
  /** Short label for the progress bar and presenter overlay. */
  label: string;
  /** Planned time window from the presentation arc, in minutes from start. */
  window: [start: number, end: number];
  /** Default step count; a scene may override it via setStepCount. */
  steps: number;
  Component: ComponentType<SceneProps>;
  /**
   * Extra states to include in the PDF export, passed to the scene as `variant`.
   * Each variant prints its final step only, after the scene's normal pages.
   */
  printVariants?: { variant: string; label: string }[];
}

/** Logical stage size. The deck scales this to fit the viewport (letterboxed). */
export const STAGE_WIDTH = 1920;
export const STAGE_HEIGHT = 1080;
