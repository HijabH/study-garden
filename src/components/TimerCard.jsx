import Plant from './Plant.jsx';
import { formatTime, growthStage, progress } from '../logic/timer.js';

const LABELS = {
  focus: { idle: 'Plant a seed', paused: 'Keep growing' },
  break: { idle: 'Start break', paused: 'Resume break' },
};

export default function TimerCard({ timer, kind, restingPlant, task, celebrating, onStart, onPause, onGiveUp, onNext, onReset }) {
  const { mode, status } = timer;
  const focus = mode === 'focus';
  const running = status === 'running';

  let plant;
  if (focus) {
    plant = <Plant kind={kind} stage={growthStage(timer)} wilted={status === 'wilted'} size={180} animate={running} />;
  } else {
    plant = restingPlant ? (
      <Plant kind={restingPlant.kind} stage="bloom" size={180} animate={running} label={`resting ${restingPlant.kind}`} />
    ) : (
      <Plant kind={kind} stage="seed" size={180} />
    );
  }

  return (
    <section className={`card timer timer--${mode}`} aria-labelledby="timer-heading">
      <h2 id="timer-heading" className="timer__mode">{focus ? 'Focus' : 'Break'}</h2>

      <div className="timer__plant">
        {plant}
        {celebrating && (
          <div className="hearts" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <svg key={i} viewBox="0 0 24 24" className="heart" style={{ '--i': i }}>
                <path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6C19 16.5 12 21 12 21z" />
              </svg>
            ))}
          </div>
        )}
      </div>

      <div className="timer__time" role="timer" aria-label={`${formatTime(timer.remaining)} remaining`}>
        {formatTime(timer.remaining)}
      </div>
      <div className="progress" aria-hidden="true">
        <div className="progress__bar" style={{ width: `${progress(timer) * 100}%` }} />
      </div>

      {focus && task && <p className="timer__task">Focusing on: {task.text}</p>}

      <div className="timer__actions">
        {(status === 'idle' || status === 'paused') && (
          <button className="btn btn--primary" onClick={onStart}>{LABELS[mode][status]}</button>
        )}
        {running && <button className="btn" onClick={onPause}>Pause</button>}
        {focus && (running || status === 'paused') && (
          <button className="btn btn--ghost" onClick={onGiveUp}>Give up</button>
        )}
        {status === 'done' && (
          <button className="btn btn--primary" onClick={onNext}>{focus ? 'Take a break' : 'Plant another seed'}</button>
        )}
        {status === 'wilted' && <button className="btn btn--primary" onClick={onReset}>Try again</button>}
      </div>
    </section>
  );
}
