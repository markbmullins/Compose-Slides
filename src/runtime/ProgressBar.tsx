import type { SceneDef } from './types';

interface Props {
  scenes: SceneDef[];
  scene: number;
  step: number;
  stepCount: number;
}

export default function ProgressBar({ scenes, scene, step, stepCount }: Props) {
  return (
    <div className="progress">
      {scenes.map((s, i) => {
        // Width follows each scene's planned minutes. The last scene is open-ended Q&A, so cap it
        // or it would swallow the bar.
        const mins = s.window[1] - s.window[0];
        const weight = i === scenes.length - 1 ? Math.min(mins, 1.5) : mins;
        const fill = i < scene ? 1 : i === scene ? (step + 1) / stepCount : 0;
        return (
          <div key={s.id} className="progress-seg" style={{ flexGrow: weight }}>
            <div className="progress-fill" style={{ transform: `scaleX(${fill})` }} />
          </div>
        );
      })}
    </div>
  );
}
