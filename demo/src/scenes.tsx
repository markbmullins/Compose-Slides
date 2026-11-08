import { motion, useReducedMotion } from 'motion/react';
import { Reveal, SlideFrame, StepSequence, type SceneDef, type SceneProps } from '../../src';

function Frame({
  number,
  section,
  children,
}: {
  number: string;
  section: string;
  children: React.ReactNode;
}) {
  return (
    <SlideFrame className="demo-frame">
      <header className="demo-top">
        <span className="demo-brand">
          <i /> FIELDNOTES <b>/</b> 001
        </span>
        <span>
          {section} <b>—</b> {number}
        </span>
      </header>
      <main>{children}</main>
      <footer>
        <span>AN ILLUSTRATIVE CITY STUDY</span>
        <span>
          COMPOSE SLIDES <b>·</b> {number} / 04
        </span>
      </footer>
    </SlideFrame>
  );
}

function RouteMap({ direct }: { direct: boolean }) {
  const reduced = useReducedMotion();
  const transition = { duration: reduced ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] as const };
  return (
    <div className="demo-map" aria-label="Two routes to the same destination">
      <svg
        viewBox="0 0 760 720"
        role="img"
        aria-label="An eighteen-minute detour and a seven-minute direct route"
      >
        <g className="demo-map-grid">
          {[100, 200, 300, 400, 500, 600, 700].map((n) => (
            <line key={`x${n}`} x1={n} y1="0" x2={n} y2="720" />
          ))}
          {[90, 190, 290, 390, 490, 590, 690].map((n) => (
            <line key={`y${n}`} x1="0" y1={n} x2="760" y2={n} />
          ))}
        </g>
        <path className="demo-map-detour" d="M100 590 H300 V490 H500 V290 H400 V190 H600 V90 H700" />
        <motion.path
          className="demo-map-direct"
          d="M100 590 H200 V390 H500 V290 H600 V90 H700"
          initial={false}
          animate={{ pathLength: direct ? 1 : 0, opacity: direct ? 1 : 0 }}
          transition={transition}
        />
        <circle className="demo-map-start" cx="100" cy="590" r="15" />
        <circle className="demo-map-end" cx="700" cy="90" r="15" />
        <text x="82" y="640" className="demo-map-place">
          START
        </text>
        <text x="594" y="55" className="demo-map-place">
          DESTINATION
        </text>
        <g className="demo-map-tag">
          <rect x="300" y="535" width="144" height="50" rx="9" />
          <text x="320" y="567">
            18 MIN
          </text>
        </g>
        {direct && (
          <g className="demo-map-tag is-direct">
            <rect x="220" y="319" width="144" height="50" rx="9" />
            <text x="240" y="351">
              07 MIN
            </text>
          </g>
        )}
      </svg>
      <div className="demo-map-index">
        <span>01 / THE DETOUR</span>
        <span>02 / THE CONNECTION</span>
      </div>
    </div>
  );
}

function Title({ step }: SceneProps) {
  return (
    <Frame number="01" section="A ROUTE STUDY">
      <div className="demo-hero">
        <div className="demo-hero-copy">
          <div className="demo-eyebrow">A FIELD GUIDE TO SHORTER JOURNEYS</div>
          <h1>
            Same destination.
            <br />
            <em>Eleven minutes apart.</em>
          </h1>
          <Reveal show={step >= 1}>
            <p>One better connection changes the whole trip.</p>
          </Reveal>
          <div className="demo-hero-rule">
            <span /> <b>ONE TRIP / TWO ROUTES</b> <span />
          </div>
        </div>
        <RouteMap direct={step >= 1} />
      </div>
    </Frame>
  );
}

function Signal({ step }: SceneProps) {
  const reduced = useReducedMotion();
  return (
    <Frame number="02" section="THE COMPARISON">
      <div className="demo-eyebrow">01 / SAME START. SAME FINISH.</div>
      <h1 className="demo-section-title">
        The transfer cost <em>11 minutes.</em>
      </h1>
      <div className="demo-comparison">
        <div className="demo-comparison-row">
          <div className="demo-comparison-label">
            <span>01 / DETOUR</span>
            <strong>
              18 <small>MIN</small>
            </strong>
          </div>
          <div className="demo-comparison-track">
            <motion.div
              className="is-detour"
              initial={false}
              animate={{ width: step >= 1 ? '100%' : '0%' }}
              transition={{ duration: reduced ? 0 : 1, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
        <div className="demo-comparison-row">
          <div className="demo-comparison-label">
            <span>02 / CONNECTED</span>
            <strong>
              07 <small>MIN</small>
            </strong>
          </div>
          <div className="demo-comparison-track">
            <motion.div
              className="is-direct"
              initial={false}
              animate={{ width: step >= 2 ? '39%' : '0%' }}
              transition={{ duration: reduced ? 0 : 1.1, delay: reduced ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </div>
      <div className="demo-signal-bottom">
        <span>THE DISTANCE DIDN'T CHANGE. THE CONNECTION DID.</span>
        <span>SYNTHETIC DATA FOR THIS DEMO</span>
      </div>
    </Frame>
  );
}

const moves = [
  {
    n: '01',
    title: 'Find the friction',
    body: 'Watch where the route asks people to stop, wait, or double back.',
    mark: 'M20 150 H115 V88 H260',
  },
  {
    n: '02',
    title: 'Change one link',
    body: 'Connect the two streets that already carry the journey.',
    mark: 'M20 150 H115 V88 H175 V40 H260',
  },
  {
    n: '03',
    title: 'Walk it again',
    body: 'Compare the same trip before and after the change.',
    mark: 'M20 150 H95 V40 H260',
  },
];
function Process({ step }: SceneProps) {
  return (
    <Frame number="03" section="THE APPROACH">
      <div className="demo-eyebrow">02 / FROM OBSERVATION TO ACTION</div>
      <h1 className="demo-section-title">
        Three moves. <em>One shorter trip.</em>
      </h1>
      <StepSequence
        className="demo-steps"
        step={step}
        items={moves}
        renderItem={(m) => (
          <article>
            <div className="demo-card-top">
              <span>{m.n}</span>
              <span>FIELD NOTE</span>
            </div>
            <svg viewBox="0 0 280 190" aria-hidden="true">
              <path
                className="demo-card-grid"
                d="M20 40 H260 M20 88 H260 M20 150 H260 M95 20 V170 M175 20 V170"
              />
              <path className="demo-card-line" d={m.mark} />
              <circle cx="20" cy="150" r="7" />
              <circle cx="260" cy={m.n === '01' ? '88' : '40'} r="7" />
            </svg>
            <h2>{m.title}</h2>
            <p>{m.body}</p>
          </article>
        )}
      />
    </Frame>
  );
}
function Close(_props: SceneProps) {
  return (
    <Frame number="04" section="NEXT BLOCK">
      <div className="demo-eyebrow">03 / THE NEXT QUESTION</div>
      <h1 className="demo-close-title">
        Where is the
        <br />
        <em>next missing link?</em>
      </h1>
      <p className="demo-close-copy">
        Start with one journey. Make the change visible. Then take the same walk again.
      </p>
      <div className="demo-close-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </Frame>
  );
}

export const scenes: SceneDef[] = [
  { id: 'title', label: 'Opening', window: [0, 1], steps: 2, Component: Title },
  { id: 'signal', label: 'Signal', window: [1, 3], steps: 3, Component: Signal },
  { id: 'process', label: 'Method', window: [3, 5], steps: 3, Component: Process },
  { id: 'close', label: 'Closing', window: [5, 6], steps: 1, Component: Close },
];
