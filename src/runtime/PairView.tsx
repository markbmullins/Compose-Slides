import { useState, type FormEvent } from 'react';
import { saveControlKey } from './sync';
import './presenter.css';

/**
 * `/?pair`: paste the control key once; this browser remembers it (localStorage),
 * so no key ever appears in a URL. `/?pair=presenter` returns to the notes view.
 */
export default function PairView({ next, verify = true }: { next: 'deck' | 'presenter'; verify?: boolean }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const key = value.trim();
    if (!key) return;
    setBusy(true);
    setError('');
    try {
      // Same check the Worker applies: a wrong key is rejected before we save anything.
      if (verify) {
        const res = await fetch(`/api/notes?k=${encodeURIComponent(key)}`);
        if (!res.ok) throw new Error(res.status === 403 ? 'That key is not right.' : 'Could not reach the server.');
      }
      saveControlKey(key);
      window.location.replace(next === 'presenter' ? '/?presenter' : '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setBusy(false);
    }
  };

  return (
    <div className="pv pv-wait">
      <form className="pv-pair" onSubmit={submit}>
        <h1>Pair this device</h1>
        <p>Paste your control key. This browser will remember it.</p>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Control key"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
        />
        <button type="submit" disabled={busy || !value.trim()}>{busy ? 'Checking…' : next === 'presenter' ? 'Open presenter notes' : 'Open deck'}</button>
        {error && <div className="pv-pair-err" role="alert">{error}</div>}
      </form>
    </div>
  );
}
