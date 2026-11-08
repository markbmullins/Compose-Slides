import { controlKey } from './sync';
import type { NotesMap } from './notes';

/** Fetch private notes from a key-protected endpoint. Call from a lazy presenter-only module. */
export async function loadProtectedNotes(endpoint = '/api/notes'): Promise<NotesMap> {
  const key = controlKey();
  if (!key) throw new Error('missing key');
  const response = await fetch(`${endpoint}?k=${encodeURIComponent(key)}`);
  if (!response.ok) throw new Error(`notes ${response.status}`);
  return (await response.json()) as NotesMap;
}
