/** Speaker notes are supplied by the presentation, never by the runtime. */
export interface Cue { phase: string; say: string; do?: string }
export interface SceneNotes { goal: string; cues: Cue[]; principle?: string; qa?: [question: string, answer: string][]; timing?: string; reminders?: string[] }
export type NotesMap = Record<string, SceneNotes>;
export const stepCue = (notes: NotesMap | null, sceneId: string, step: number): Cue | null => notes?.[sceneId]?.cues[step] ?? null;
