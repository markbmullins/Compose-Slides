import { createRelay, DeckRoom } from '../src/cloudflare/relay';
import { notes } from './src/notes';
export { DeckRoom };
export default createRelay(notes);
