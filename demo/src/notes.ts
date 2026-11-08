import type { NotesMap } from '../../src';

export const notes: NotesMap = {
  title: {
    goal: 'Set up one trip with two possible routes. Both end at the same place.',
    principle: 'Keep the destination fixed. The story is about the connection between streets.',
    cues: [
      {
        phase: 'The route',
        say: 'Picture one everyday trip across the neighborhood. There are two ways to make it.',
      },
      {
        phase: 'The reveal',
        say: 'The second route reaches the same place eleven minutes sooner. Only one connection changed.',
      },
    ],
    qa: [
      [
        'Is this a real city?',
        'No. The map and travel times are synthetic so the example can be shared freely.',
      ],
    ],
  },
  signal: {
    goal: 'Compare the same journey before and after changing one connection.',
    principle: 'Hold the start and destination constant while comparing the routes.',
    cues: [
      { phase: 'Same trip', say: 'The start and destination stay put. Only the path between them changes.' },
      {
        phase: 'The detour',
        say: 'The first route doubles back at the transfer. In this illustrative example, it takes eighteen minutes.',
      },
      {
        phase: 'The connection',
        say: 'The connected route takes seven minutes. Same endpoints, eleven minutes saved.',
      },
    ],
    qa: [
      [
        'Are these measured travel times?',
        'No. The times are synthetic demo data. Replace them with measured values in a real presentation.',
      ],
      [
        'What changed in the route?',
        'One connection between existing streets. The start and destination are identical.',
      ],
    ],
  },
  process: {
    goal: 'Show how to investigate and test one practical change.',
    cues: [
      { phase: 'Observe', say: 'Walk the route and note every wait, backtrack, and confusing turn.' },
      { phase: 'Connect', say: 'Change the smallest link that removes the detour.' },
      { phase: 'Compare', say: 'Walk the same trip again and check whether the change actually helped.' },
    ],
  },
  close: {
    goal: 'Leave the audience with a concrete next question.',
    cues: [{ phase: 'Next block', say: 'Choose one real journey and look for the missing link in it.' }],
  },
};
