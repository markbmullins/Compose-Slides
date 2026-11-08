import type { NotesMap } from '../../src';
export const notes: NotesMap = {
  title: { goal: 'Introduce the idea.', cues: [{ phase: 'Open', say: 'A good presentation helps an audience see the shape of an idea.' }, { phase: 'Frame', say: 'This small deck shows the building blocks you can reuse.' }] },
  signal: { goal: 'Show a metric and its context.', cues: [{ phase: 'Observation', say: 'Start with the signal, then show the evidence behind it.' }, { phase: 'Evidence', say: 'The values here are illustrative demo data.' }, { phase: 'Meaning', say: 'Give the audience one clear takeaway.' }] },
  process: { goal: 'Explain a simple process.', cues: [{ phase: 'First', say: 'Frame the question.' }, { phase: 'Second', say: 'Gather evidence.' }, { phase: 'Third', say: 'Make a decision.' }] },
  close: { goal: 'Close with a clear action.', cues: [{ phase: 'Close', say: 'Build your next presentation from these pieces.' }] },
};
