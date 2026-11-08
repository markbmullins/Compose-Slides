import { Reveal, SlideFrame, StepSequence, type SceneDef, type SceneProps } from '../../src';

function Frame({ number, eyebrow, title, children }: { number: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return <SlideFrame className="demo-frame"><header className="demo-top"><span className="demo-mark">F<span>·</span></span><span className="demo-issue">FIELDNOTES / {number}</span></header><main><div className="demo-eyebrow">{eyebrow}</div><h1>{title}</h1>{children}</main><footer><span>FIELDNOTES STUDIO</span><span>{number} / 04</span></footer></SlideFrame>;
}
function Title({ step }: SceneProps) { return <Frame number="01" eyebrow="A PRESENTATION SYSTEM" title="Ideas deserve a clear stage."><Reveal show={step >= 1}><p className="demo-lede">A small, open toolkit for stories that move.</p></Reveal><div className="demo-orbit" aria-hidden="true"><span/><span/><span/></div></Frame>; }
function Signal({ step }: SceneProps) { return <Frame number="02" eyebrow="01 / THE SIGNAL" title="Make the point visible."><div className="demo-signal"><Reveal show={step >= 1}><div className="demo-number">72<span>%</span></div><p>of the story is in the pattern</p></Reveal><Reveal show={step >= 2} delay={0.1}><div className="demo-bars">{[42, 60, 46, 74, 57, 86, 72].map((n,i)=><div key={i} style={{height:`${n}%`}} />)}</div></Reveal></div><small>Illustrative data · replace with your own evidence</small></Frame>; }
function Process({ step }: SceneProps) { return <Frame number="03" eyebrow="02 / THE METHOD" title="Let the story unfold."><StepSequence className="demo-steps" step={step} items={[['01','Frame','Ask a useful question.'],['02','Explore','Show the evidence.'],['03','Decide','Name the next move.']]} renderItem={([n,h,p]) => <article><b>{n}</b><h2>{h}</h2><p>{p}</p></article>} /></Frame>; }
function Close(_props: SceneProps) { return <Frame number="04" eyebrow="YOUR NEXT PRESENTATION" title="Start with one idea."><p className="demo-lede">Build a scene. Add steps. Bring your notes.</p><div className="demo-rule" /></Frame>; }
export const scenes: SceneDef[] = [
  { id: 'title', label: 'Opening', window: [0, 1], steps: 2, Component: Title },
  { id: 'signal', label: 'Signal', window: [1, 3], steps: 3, Component: Signal },
  { id: 'process', label: 'Method', window: [3, 5], steps: 3, Component: Process },
  { id: 'close', label: 'Closing', window: [5, 6], steps: 1, Component: Close },
];
