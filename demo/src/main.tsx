import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Deck, PrintDeck, controlKey, forceReducedMotion, loadProtectedNotes, readPrintOptions } from '../../src';
import type { NotesMap } from '../../src';
import { scenes } from './scenes';
import '../../src/styles/theme.css';
import './theme.css';

const PresenterView = lazy(() => import('../../src/presenter'));
const PairView = lazy(() => import('../../src/pair'));
const print = readPrintOptions();
if (print) forceReducedMotion();
const loadNotes = (): Promise<NotesMap> => controlKey() ? loadProtectedNotes() : import('./notes').then((m) => m.notes);
function App() {
  if (print) return <PrintDeck scenes={scenes} options={print} />;
  const params = new URLSearchParams(location.search);
  const presenter = params.has('presenter');
  if (params.has('pair'))
    return <Suspense fallback={null}><PairView next={presenter ? 'presenter' : 'deck'} verify={!import.meta.env.DEV} /></Suspense>;
  if (presenter) return <Suspense fallback={null}><PresenterView scenes={scenes} loadNotes={loadNotes} /></Suspense>;
  return <Deck scenes={scenes} />;
}
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
