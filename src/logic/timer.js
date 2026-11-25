export const STAGES = ['seed', 'sprout', 'leaves', 'bud', 'bloom'];

export function createTimer(mode, minutes) {
  return { mode, status: 'idle', duration: minutes * 60, remaining: minutes * 60, endsAt: null };
}

export function start(timer, now) {
  if (timer.status === 'running') return timer;
  return { ...timer, status: 'running', endsAt: now + timer.remaining * 1000 };
}

export function pause(timer, now) {
  if (timer.status !== 'running') return timer;
  return { ...timer, status: 'paused', remaining: secondsLeft(timer, now), endsAt: null };
}

// Time is computed from a fixed end point instead of counting ticks,
// so the timer stays correct when the browser slows down background tabs.
export function tick(timer, now) {
  if (timer.status !== 'running') return timer;
  const remaining = secondsLeft(timer, now);
  if (remaining <= 0) return { ...timer, status: 'done', remaining: 0, endsAt: null };
  return remaining === timer.remaining ? timer : { ...timer, remaining };
}

export function giveUp(timer) {
  return { ...timer, status: 'wilted', endsAt: null };
}

function secondsLeft(timer, now) {
  return Math.max(0, Math.ceil((timer.endsAt - now) / 1000));
}

export function progress(timer) {
  if (timer.duration === 0) return 1;
  return Math.min(1, Math.max(0, 1 - timer.remaining / timer.duration));
}

export function growthStage(timer) {
  if (timer.status === 'done') return 'bloom';
  const index = Math.min(STAGES.length - 2, Math.floor(progress(timer) * (STAGES.length - 1)));
  return STAGES[index];
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
